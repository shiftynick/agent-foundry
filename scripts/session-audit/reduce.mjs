#!/usr/bin/env node

// Streams the discovered transcripts and emits per-session metrics, an
// aggregate summary, and bounded redacted evidence packets.
//
//   node scripts/session-audit/reduce.mjs --discovery <dir>/discovery.json --out <dir>
//
// Every transcript is read line by line; nothing larger than a single record is
// ever held, and evidence excerpts are re-read from disk by byte offset at the
// end rather than retained. Per-record derived state is capped (previews are
// clipped, identifier sets are bounded), but the per-session derived state is
// linear in the number of records: one entry per tool call, per operator
// prompt, and per model response is kept for the whole pass. That is the
// deliberate trade -- byte streaming, bounded per-record cost, linear
// per-session summaries -- not an O(1) reducer.
//
// Subagent activity is folded into its parent session and reported separately.
// The parent's delegation tool calls are bucketed as "delegation wait" rather
// than local tool execution, but see `delegation` in the emitted metrics:
// delegation wait measures how long the Agent tool call itself blocked, which
// for a background subagent is launch latency only, NOT the subagent's work.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  UsageError,
  approxTokens,
  assertRunDirOutsideRepo,
  assistantText,
  assistantThinkingText,
  clip,
  extractIdentifiers,
  gapHistogram,
  isCompactSummary,
  isDelegationTool,
  isOperatorPrompt,
  isOperatorBlockingTool,
  isReadTool,
  isSlashCommandPrompt,
  isSyntheticAssistant,
  isWriteTool,
  median,
  modelOf,
  normalizePath,
  parseOptions,
  readDiscovery,
  readLineAt,
  readRangeOf,
  readRangesOverlap,
  redactedExcerpt,
  repoRootFor,
  round,
  streamRecords,
  timestampMs,
  toolCallSignature,
  toolInputPreview,
  stableStringify,
  toolResultsOf,
  toolTargetPath,
  toolUsesOf,
  unionDurationMs,
  unionIntervals,
  usageOf,
  userText,
  wantsHelp,
} from "./_lib.mjs";

const USAGE = `Usage: node scripts/session-audit/reduce.mjs --discovery <file> --out <dir>

Streams the discovered transcripts and writes per-session metrics, an aggregate
summary, and bounded redacted evidence packets.

  --discovery <file>              discovery.json written by discover.mjs (required)
  --out <dir>                     run directory to write into (required)
  --max-packets-per-signal <n>    per-signal packet cap (default 5)
  --long-gap-ms <ms>              gap size recorded as a long gap (default 300000)
  --long-tool-ms <ms>             tool duration treated as slow (default 60000)
  --help                          show this message

The run directory must live outside this repository, or be named so the
repository's .gitignore already covers it.`;

const EXCERPT_LIMIT = 4096;
const TOP_OUTPUT_COUNT = 10;
const IDENTIFIERS_PER_OUTPUT = 40;
const RETRY_LOOKAHEAD = 5;
const CACHE_MISS_STRETCH_MIN = 3;

const optionDefinitions = new Map([
  ["discovery", { required: true }],
  ["out", { required: true }],
  ["max-packets-per-signal", { default: "5" }],
  ["long-gap-ms", { default: "300000" }],
  ["long-tool-ms", { default: "60000" }],
]);

function newAnalysis(filePath, role) {
  return {
    file: filePath,
    role,
    lineCount: 0,
    malformedLines: 0,
    firstMs: null,
    lastMs: null,
    toolCalls: [],
    unmatchedResults: 0,
    operatorPrompts: [],
    assistantTurns: [],
    compactions: [],
    longGaps: [],
    // Every operator-wait gap as a concrete interval, not just its duration:
    // the aggregate stage has to union these across concurrently running
    // sessions, which a running total cannot support.
    operatorWaitIntervals: [],
    gapBuckets: {
      modelLatencyMs: 0,
      toolExecutionMs: 0,
      delegationWaitMs: 0,
      operatorWaitMs: 0,
      operatorToolWaitMs: 0,
      backgroundWaitMs: 0,
      otherMs: 0,
    },
    tokens: {
      toolResultTokens: 0,
      assistantTextTokens: 0,
      assistantThinkingTokens: 0,
      userTextTokens: 0,
    },
    usage: {
      inputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      outputTokens: 0,
    },
    topOutputs: [],
    duplicateRecords: 0,
    duplicateToolUseIds: 0,
    backwardTimestamps: 0,
    models: new Set(),
    versions: new Set(),
    gitBranches: new Set(),
  };
}

// One streaming pass over a transcript. Everything downstream is computed from
// the bounded derived arrays this produces.
async function analyzeTranscript(filePath, role, options) {
  const analysis = newAnalysis(filePath, role);
  const pending = new Map();
  const seenUuids = new Set();
  const seenRequestIds = new Set();
  let previousMs = null;
  let anchorMs = null;
  let maxSeenMs = null;
  let turnIndex = 0;
  let recordIndex = 0;

  for await (const entry of streamRecords(filePath)) {
    analysis.lineCount += 1;
    if (entry.malformed) {
      analysis.malformedLines += 1;
      continue;
    }
    const record = entry.record;
    // Some transcripts re-append a prefix of their own history when a session
    // is resumed. Replayed records carry the same uuid, and counting them again
    // would inflate every metric and make the waste detectors fire on the
    // replay rather than on anything the agent actually did twice.
    if (typeof record.uuid === "string") {
      if (seenUuids.has(record.uuid)) {
        analysis.duplicateRecords += 1;
        continue;
      }
      seenUuids.add(record.uuid);
    }
    recordIndex += 1;
    const ms = timestampMs(record);
    if (ms !== null) {
      analysis.firstMs = analysis.firstMs === null ? ms : Math.min(analysis.firstMs, ms);
      // Running max, not last-write-wins: transcript timestamps are not sorted.
      analysis.lastMs = analysis.lastMs === null ? ms : Math.max(analysis.lastMs, ms);
      if (maxSeenMs !== null && ms < maxSeenMs) {
        // Counted for every record, not only for records that close a gap, so
        // the field is an honest data-quality signal rather than a by-product
        // of which record types happen to be bucketed.
        analysis.backwardTimestamps += 1;
      }
      maxSeenMs = maxSeenMs === null ? ms : Math.max(maxSeenMs, ms);
    }
    if (typeof record.version === "string") analysis.versions.add(record.version);
    if (typeof record.gitBranch === "string") analysis.gitBranches.add(record.gitBranch);
    const synthetic = isSyntheticAssistant(record);
    const model = modelOf(record);
    if (model && !synthetic) analysis.models.add(model);

    const results = toolResultsOf(record);
    const operatorPrompt = isOperatorPrompt(record);
    const compaction = isCompactSummary(record);

    // Gap accounting: the interval before a record is attributed by what the
    // record is, and bookkeeping records (queue operations, attachments, hook
    // summaries, title updates) do not close a gap. Attributing to them would
    // dump an overnight idle stretch into "unclassified" merely because the
    // harness wrote a title record when the session resumed. The buckets
    // therefore partition the whole session span exactly once.
    const bucket = gapBucketFor(record, results, operatorPrompt, pending, synthetic);
    if (bucket !== null) {
      if (ms !== null && previousMs !== null && ms < previousMs) {
        // Out-of-order timestamps are common. Rewinding the cursor would make
        // the next forward interval get counted twice, so the cursor only ever
        // advances and a backward record contributes no gap. The unaccounted
        // remainder is reconciled into `otherMs` after the loop.
      } else if (ms !== null && previousMs !== null) {
        const gap = ms - previousMs;
        analysis.gapBuckets[bucket] += gap;
        if (bucket === "operatorWaitMs" && gap > 0) {
          analysis.operatorWaitIntervals.push({ startMs: previousMs, endMs: ms });
        }
        if (gap >= options.longGapMs) {
          analysis.longGaps.push({
            bucket: bucket.replace(/Ms$/u, ""),
            gapMs: gap,
            endedAt: record.timestamp ?? null,
            line: lineRef(entry),
          });
        }
      }
      if (ms !== null) {
        previousMs = previousMs === null ? ms : Math.max(previousMs, ms);
        anchorMs ??= previousMs;
      }
    } else if (ms !== null && previousMs === null) {
      // Anchor the span at the first record even if it is bookkeeping.
      previousMs = ms;
      anchorMs = ms;
    }

    if (compaction) {
      analysis.compactions.push({ at: record.timestamp ?? null, ms, line: lineRef(entry) });
    }

    if (operatorPrompt) {
      turnIndex += 1;
      analysis.operatorPrompts.push({
        turnIndex,
        at: record.timestamp ?? null,
        ms,
        // A slash command is a human turn, just one entered as a command.
        slashCommand: isSlashCommandPrompt(record),
        preview: redactedExcerpt(collapse(userText(record)), 160),
        line: lineRef(entry),
      });
    }

    if (record.type === "assistant" && !synthetic) {
      const usage = usageOf(record);
      const text = assistantText(record);
      const thinking = assistantThinkingText(record);
      analysis.tokens.assistantTextTokens += approxTokens(text.length);
      analysis.tokens.assistantThinkingTokens += approxTokens(thinking.length);
      // One API response is written as several assistant records (thinking,
      // then each tool_use), all carrying the SAME requestId and the SAME usage
      // object. Counting usage per record inflates tokens by roughly 1.5-2x, so
      // usage and the assistant-turn series are both keyed by requestId.
      const requestId = typeof record.requestId === "string" ? record.requestId : null;
      // The id is marked consumed only once usage has actually been taken, so
      // a response whose first record carries no usage does not lose it.
      const firstOfRequest = requestId === null || !seenRequestIds.has(requestId);
      if (usage && firstOfRequest && requestId !== null) {
        seenRequestIds.add(requestId);
      }
      if (usage && firstOfRequest) {
        analysis.usage.inputTokens += usage.inputTokens;
        analysis.usage.cacheCreationTokens += usage.cacheCreationTokens;
        analysis.usage.cacheReadTokens += usage.cacheReadTokens;
        analysis.usage.outputTokens += usage.outputTokens;
        analysis.assistantTurns.push({
          requestId,
          at: record.timestamp ?? null,
          ms,
          // So a cache-miss stretch can cite the records it was derived from
          // instead of shipping a claim with no offsets.
          line: lineRef(entry),
          model,
          effort: typeof record.effort === "string" ? record.effort : null,
          ...usage,
          effectiveContextTokens: usage.inputTokens
            + usage.cacheReadTokens
            + usage.cacheCreationTokens,
        });
      }
      if (text !== "") {
        noteReferences(analysis, text);
      }
      for (const use of toolUsesOf(record)) {
        const call = {
          index: analysis.toolCalls.length,
          id: use.id,
          name: use.name,
          turnIndex,
          targetPath: toolTargetPath(use.name, use.input),
          // Null for anything that is not a read tool; for a read tool it is
          // the [start, end) line window the call asked for, which is what
          // separates paging through a file from re-reading it.
          readRange: readRangeOf(use.name, use.input),
          signature: toolCallSignature(use.name, use.input),
          preview: toolInputPreview(use.name, use.input),
          startAt: record.timestamp ?? null,
          startMs: ms,
          endAt: null,
          endMs: null,
          durationMs: null,
          isError: null,
          resultTokens: 0,
          resultBytes: 0,
          persisted: false,
          line: lineRef(entry),
          resultLine: null,
        };
        analysis.toolCalls.push(call);
        if (use.id) {
          if (pending.has(use.id)) {
            // Never clobber an outstanding call: doing so would let a second
            // result match the wrong call and make the join counters read
            // all-clear on corrupt input.
            analysis.duplicateToolUseIds += 1;
          } else {
            pending.set(use.id, call);
          }
        }
        // The reference proxy sees the real input, not the 80-char preview,
        // otherwise the "later tool calls referenced it" half of the test is
        // almost blind.
        noteReferences(analysis, `${use.name} ${clip(stableStringify(use.input), 4000)}`);
      }
    } else if (record.type === "user") {
      const text = userText(record);
      if (results.length === 0 && text !== "") {
        analysis.tokens.userTextTokens += approxTokens(text.length);
      }
    }

    for (const result of results) {
      const tokens = approxTokens(result.text.length);
      analysis.tokens.toolResultTokens += tokens;
      // tool_use id is the only reliable join between a call and its result;
      // ordering is not, because parallel tool calls interleave.
      const call = result.toolUseId ? pending.get(result.toolUseId) : undefined;
      if (!call) {
        analysis.unmatchedResults += 1;
        continue;
      }
      pending.delete(result.toolUseId);
      call.endAt = record.timestamp ?? null;
      call.endMs = ms;
      call.durationMs = ms !== null && call.startMs !== null ? ms - call.startMs : null;
      call.isError = result.isError;
      call.resultTokens = tokens;
      call.resultBytes = result.fileBytes ?? result.approxBytes;
      call.persisted = result.persisted;
      call.resultLine = lineRef(entry);
      considerTopOutput(analysis, call, result, recordIndex);
    }
  }

  // The span runs from the earliest to the latest timestamp anywhere in the
  // file, while the gap cursor walks in file order and never rewinds. Any
  // remainder at either end -- a transcript that replays an earlier prefix, or
  // one that ends on bookkeeping records -- is real elapsed time that no bucket
  // claimed, so it is reconciled here. Without this the buckets would silently
  // fail to sum to the span.
  if (analysis.firstMs !== null && anchorMs !== null && anchorMs > analysis.firstMs) {
    analysis.gapBuckets.otherMs += anchorMs - analysis.firstMs;
  }
  if (analysis.lastMs !== null && previousMs !== null && analysis.lastMs > previousMs) {
    analysis.gapBuckets.otherMs += analysis.lastMs - previousMs;
  }
  analysis.unresolvedToolCalls = pending.size;
  return analysis;
}

// Returns the bucket a record's preceding interval belongs to, or null when the
// record is bookkeeping and the interval should carry to the next real record.
function gapBucketFor(record, results, operatorPrompt, pending, synthetic) {
  if (results.length > 0) {
    const calls = results.map((result) => pending.get(result.toolUseId)).filter(Boolean);
    if (calls.length === 0) {
      // No result in this batch resolves to a known call, so the interval
      // cannot honestly be called tool execution.
      return "otherMs";
    }
    // Priority, not unanimity: in a mixed batch the interval is dominated by
    // the slowest thing in it, and a human is slower than a tool.
    if (calls.some((call) => isOperatorBlockingTool(call.name))) {
      return "operatorToolWaitMs";
    }
    if (calls.every((call) => isDelegationTool(call.name))) {
      return "delegationWaitMs";
    }
    return "toolExecutionMs";
  }
  if (synthetic) {
    return null;
  }
  if (record.type === "assistant") {
    return "modelLatencyMs";
  }
  if (record.type === "user") {
    // A user record that is not a tool result and not a human prompt is an
    // injected notification (background task completion, compaction summary):
    // the session was waiting on something other than the model or a tool.
    return operatorPrompt ? "operatorWaitMs" : "backgroundWaitMs";
  }
  return null;
}

function lineRef(entry) {
  return {
    lineNumber: entry.lineNumber,
    byteOffset: entry.byteOffset,
    byteLength: entry.byteLength,
  };
}

function collapse(text) {
  return text.replaceAll(/\s+/gu, " ").trim();
}

// Crude reference proxy. Identifiers lifted from a large tool output are looked
// for in later assistant text and later tool inputs. It is a plain
// string-containment test: it over-reports common words that survive the
// identifier filter, and under-reports paraphrase or reasoning that used the
// output without naming anything from it. Treat "unreferenced" as a hint, not
// a verdict.
function noteReferences(analysis, text) {
  if (analysis.topOutputs.length === 0) {
    return;
  }
  for (const candidate of analysis.topOutputs) {
    if (candidate.referencedLater) {
      continue;
    }
    for (const identifier of candidate.identifiers) {
      if (text.includes(identifier)) {
        candidate.referencedLater = true;
        // `text` here is raw assistant output or a stringified tool input, and
        // this excerpt is written into sessions/*.metrics.json. It goes through
        // the same redact-then-clip path as every other excerpt: clipping alone
        // would ship whatever secret happened to sit in the first 120 bytes.
        candidate.referencedBy = redactedExcerpt(collapse(text), 120);
        break;
      }
    }
  }
}

function considerTopOutput(analysis, call, result, recordIndex) {
  const tokens = call.resultTokens;
  const list = analysis.topOutputs;
  const smallest = list.length < TOP_OUTPUT_COUNT
    ? -1
    : list.reduce((worst, item, index) => (
      item.approxTokens < list[worst].approxTokens ? index : worst
    ), 0);
  if (smallest !== -1 && tokens <= list[smallest].approxTokens) {
    return;
  }
  const candidate = {
    toolName: call.name,
    toolUseId: call.id,
    at: call.startAt,
    // The tool_result's own timestamp. `line` points at the result record, so
    // without this the packet's timestamp array and its offsets would describe
    // two different records.
    resultAt: call.endAt,
    isReadResult: isReadTool(call.name),
    approxTokens: tokens,
    bytes: call.resultBytes,
    persisted: call.persisted,
    preview: call.preview,
    recordIndex,
    identifiers: extractIdentifiers(result.text, IDENTIFIERS_PER_OUTPUT),
    referencedLater: false,
    referencedBy: null,
    line: call.resultLine,
    toolUseLine: call.line,
  };
  if (smallest === -1) {
    list.push(candidate);
  } else {
    list[smallest] = candidate;
  }
}

// ---------------------------------------------------------------------------
// Detectors. Each returns plain facts plus the line references an evidence
// packet needs to be re-verified against the original transcript.
// ---------------------------------------------------------------------------

function readEvent(call) {
  return {
    at: call.startAt,
    turnIndex: call.turnIndex,
    approxTokens: call.resultTokens,
    range: describeRange(call.readRange),
    line: call.line,
  };
}

function describeRange(range) {
  if (!range) {
    return null;
  }
  return {
    startLine: range.start,
    endLine: Number.isFinite(range.end) ? range.end : null,
    wholeFile: range.whole === true,
  };
}

// Two distinct signals, deliberately not merged:
//
//   repeatedReads   -- the same region of a file pulled into context again with
//                      no intervening edit. Real waste.
//   paginatedReads  -- the same file read in DISJOINT windows (different
//                      offset/limit). That is paging through a large file, and
//                      counting it as re-reading was the single largest source
//                      of false findings in run 001 (10 of 21 clusters).
//
// A cluster's `reads` always includes the read that was repeated, not only the
// repeats, so a packet claiming "read N times" carries N offsets and can be
// verified without re-deriving the cluster.
function detectRepeatedReads(analysis) {
  const state = new Map();
  const repeatClusters = new Map();
  const paginatedClusters = new Map();

  const openCluster = (map, key, call) => {
    const existing = map.get(key);
    if (existing) {
      return existing;
    }
    const created = { path: call.targetPath, repeats: 0, reads: [] };
    map.set(key, created);
    return created;
  };

  for (const call of analysis.toolCalls) {
    const target = call.targetPath;
    if (!target) continue;
    const key = normalizePath(target);
    if (!key) continue;
    const entry = state.get(key) ?? { reads: [], lastWriteIndex: null };
    if (isWriteTool(call.name)) {
      entry.lastWriteIndex = call.index;
      // An edit invalidates what was read before it: the next read is fresh.
      entry.reads = [];
    } else if (isReadTool(call.name)) {
      const overlapping = entry.reads.find(
        (previous) => readRangesOverlap(previous.readRange, call.readRange),
      );
      if (overlapping) {
        const cluster = openCluster(repeatClusters, key, call);
        if (cluster.reads.length === 0) {
          cluster.reads.push(readEvent(overlapping));
        }
        cluster.repeats += 1;
        cluster.reads.push(readEvent(call));
      } else if (entry.reads.length > 0) {
        const cluster = openCluster(paginatedClusters, key, call);
        if (cluster.reads.length === 0) {
          cluster.reads.push(readEvent(entry.reads[entry.reads.length - 1]));
        }
        cluster.repeats += 1;
        cluster.reads.push(readEvent(call));
      }
      entry.reads.push(call);
    }
    state.set(key, entry);
  }

  const finish = (map) => [...map.values()]
    .map((cluster) => ({ ...cluster, reads: cluster.reads }))
    .sort((left, right) => right.repeats - left.repeats);
  return { repeated: finish(repeatClusters), paginated: finish(paginatedClusters) };
}

function detectRepeatedCommands(analysis) {
  const groups = new Map();
  for (const call of analysis.toolCalls) {
    const group = groups.get(call.signature) ?? {
      toolName: call.name,
      preview: call.preview,
      count: 0,
      approxTokensTotal: 0,
      occurrences: [],
    };
    group.count += 1;
    group.approxTokensTotal += call.resultTokens;
    if (group.occurrences.length < 8) {
      group.occurrences.push({ at: call.startAt, turnIndex: call.turnIndex, line: call.line });
    }
    groups.set(call.signature, group);
  }
  return [...groups.values()]
    .filter((group) => group.count >= 2)
    .sort((left, right) => right.count - left.count);
}

function detectFailuresAndRetries(analysis) {
  const failures = analysis.toolCalls.filter((call) => call.isError === true);
  const chains = [];
  for (const failure of failures) {
    const followers = analysis.toolCalls.slice(
      failure.index + 1,
      failure.index + 1 + RETRY_LOOKAHEAD,
    );
    const retry = followers.find((call) => (
      call.signature === failure.signature
      || (call.name === failure.name
        && failure.targetPath !== null
        && normalizePath(call.targetPath ?? "") === normalizePath(failure.targetPath))
    ));
    if (!retry) continue;
    const last = chains[chains.length - 1];
    if (last && last.signature === failure.signature
      && failure.index - last.lastIndex <= RETRY_LOOKAHEAD) {
      last.attempts += 1;
      last.lastIndex = retry.index;
      last.resolved = retry.isError === false;
      continue;
    }
    chains.push({
      signature: failure.signature,
      toolName: failure.name,
      preview: failure.preview,
      attempts: 2,
      firstAt: failure.startAt,
      // The failing tool_result's timestamp. `resultLine` points at that
      // record, so the packet's timestamps and its offsets must both name it.
      firstResultAt: failure.endAt,
      // A call that never received a result is unresolved, not recovered.
      resolved: retry.isError === false,
      lastIndex: retry.index,
      line: failure.line,
      resultLine: failure.resultLine,
    });
  }
  return {
    failedCalls: failures.length,
    failureRate: analysis.toolCalls.length === 0
      ? 0
      : round(failures.length / analysis.toolCalls.length, 4),
    retryChains: chains.map(({ signature, lastIndex, ...rest }) => rest),
    failures: failures.slice(0, 20).map((call) => ({
      toolName: call.name,
      preview: call.preview,
      at: call.startAt,
      turnIndex: call.turnIndex,
      line: call.line,
      resultLine: call.resultLine,
    })),
  };
}

function detectPostCompactionRereads(analysis) {
  if (analysis.compactions.length === 0) {
    return [];
  }
  const events = [];
  for (const compaction of analysis.compactions) {
    const before = new Set();
    const after = [];
    for (const call of analysis.toolCalls) {
      if (!isReadTool(call.name) || !call.targetPath) continue;
      const key = normalizePath(call.targetPath);
      const callMs = call.startMs;
      if (callMs === null || compaction.ms === null) continue;
      if (callMs < compaction.ms) {
        before.add(key);
      } else if (before.has(key)) {
        after.push({
          path: call.targetPath,
          at: call.startAt,
          approxTokens: call.resultTokens,
          line: call.line,
        });
      }
    }
    events.push({
      compactedAt: compaction.at,
      compactionLine: compaction.line,
      filesReadBefore: before.size,
      rereadAfter: after.length,
      rereadTokens: after.reduce((total, item) => total + item.approxTokens, 0),
      samples: after.slice(0, 10),
    });
  }
  return events;
}

function cacheEconomics(analysis) {
  const turns = analysis.assistantTurns;
  const stretches = [];
  let current = null;
  for (const turn of turns) {
    const miss = turn.cacheReadTokens === 0 && turn.cacheCreationTokens > 0;
    if (miss) {
      current ??= {
        startAt: turn.at,
        turns: 0,
        cacheCreationTokens: 0,
        startLine: turn.line,
        lines: [],
      };
      current.turns += 1;
      current.cacheCreationTokens += turn.cacheCreationTokens;
      current.endAt = turn.at;
      current.endLine = turn.line;
      if (current.lines.length < 8) {
        current.lines.push({ at: turn.at, line: turn.line });
      }
    } else if (current) {
      if (current.turns >= CACHE_MISS_STRETCH_MIN) stretches.push(current);
      current = null;
    }
  }
  if (current && current.turns >= CACHE_MISS_STRETCH_MIN) stretches.push(current);

  const totalRead = analysis.usage.cacheReadTokens;
  const totalCreation = analysis.usage.cacheCreationTokens;
  return {
    cacheReadTokens: totalRead,
    cacheCreationTokens: totalCreation,
    cacheHitRatio: totalRead + totalCreation === 0
      ? null
      : round(totalRead / (totalRead + totalCreation), 4),
    cacheMissStretches: stretches,
  };
}

function detectEditChurn(analysis) {
  const byPath = new Map();
  for (const call of analysis.toolCalls) {
    if (!isWriteTool(call.name) || !call.targetPath) continue;
    const key = normalizePath(call.targetPath);
    const entry = byPath.get(key) ?? { path: call.targetPath, edits: 0, turns: new Set(), samples: [] };
    entry.edits += 1;
    entry.turns.add(call.turnIndex);
    if (entry.samples.length < 8) {
      entry.samples.push({ at: call.startAt, turnIndex: call.turnIndex, tool: call.name, line: call.line });
    }
    byPath.set(key, entry);
  }
  return [...byPath.values()]
    .filter((entry) => entry.turns.size >= 2)
    .map((entry) => ({
      path: entry.path,
      edits: entry.edits,
      turnClusters: entry.turns.size,
      samples: entry.samples,
    }))
    .sort((left, right) => right.turnClusters - left.turnClusters || right.edits - left.edits);
}

function readByteAccounting(analysis) {
  const seen = new Map();
  let freshBytes = 0;
  let rereadBytes = 0;
  let paginatedBytes = 0;
  for (const call of analysis.toolCalls) {
    if (!isReadTool(call.name) || !call.targetPath) continue;
    const key = normalizePath(call.targetPath);
    const bytes = call.resultBytes ?? 0;
    const previous = seen.get(key);
    if (!previous) {
      freshBytes += bytes;
      seen.set(key, [call.readRange]);
      continue;
    }
    // Same discrimination as the repeated-read detector: a later read of a
    // disjoint window is new content, not the same bytes again.
    if (previous.some((range) => readRangesOverlap(range, call.readRange))) {
      rereadBytes += bytes;
    } else {
      paginatedBytes += bytes;
      freshBytes += bytes;
    }
    previous.push(call.readRange);
  }
  const total = freshBytes + rereadBytes;
  return {
    distinctFilesRead: seen.size,
    freshReadBytes: freshBytes,
    rereadBytes,
    // Part of freshReadBytes: bytes from later, non-overlapping windows of a
    // file already read. Broken out so the fresh figure can be re-derived.
    paginatedReadBytes: paginatedBytes,
    rereadFraction: total === 0 ? null : round(rereadBytes / total, 4),
  };
}

function turnTimings(analysis) {
  const prompts = analysis.operatorPrompts;
  const turns = [];
  for (let index = 0; index < prompts.length; index += 1) {
    const start = prompts[index].ms;
    const end = index + 1 < prompts.length ? prompts[index + 1].ms : analysis.lastMs;
    if (start === null || end === null) continue;
    turns.push({
      turnIndex: prompts[index].turnIndex,
      startedAt: prompts[index].at,
      wallClockMs: Math.max(0, end - start),
      preview: prompts[index].preview,
    });
  }
  return turns;
}

function contextDeltas(analysis) {
  const turns = analysis.assistantTurns;
  const deltas = [];
  for (let index = 1; index < turns.length; index += 1) {
    deltas.push(turns[index].effectiveContextTokens - turns[index - 1].effectiveContextTokens);
  }
  // Running maxima rather than Math.max(...spread): these arrays are one entry
  // per model response and a long session would overflow the argument list.
  let growthTokens = 0;
  let largestGrowth = 0;
  for (const delta of deltas) {
    if (delta > 0) {
      growthTokens += delta;
      if (delta > largestGrowth) largestGrowth = delta;
    }
  }
  let peak = 0;
  for (const turn of turns) {
    if (turn.effectiveContextTokens > peak) peak = turn.effectiveContextTokens;
  }
  return {
    assistantTurns: turns.length,
    contextGrowthTokens: growthTokens,
    largestSingleGrowthTokens: largestGrowth,
    peakEffectiveContextTokens: peak,
    contextResets: deltas.filter((value) => value < -10000).length,
  };
}

function longestToolCalls(analysis, limit = 10) {
  return analysis.toolCalls
    .filter((call) => typeof call.durationMs === "number")
    .sort((left, right) => right.durationMs - left.durationMs)
    .slice(0, limit)
    .map((call) => ({
      toolName: call.name,
      durationMs: call.durationMs,
      at: call.startAt,
      // The tool_result's timestamp. `resultLine` is cited alongside `line`, so
      // both records need their own time or the packet's arrays disagree.
      resultAt: call.endAt,
      turnIndex: call.turnIndex,
      isError: call.isError,
      delegated: isDelegationTool(call.name),
      preview: call.preview,
      line: call.line,
      resultLine: call.resultLine,
    }));
}

function toolCallSummary(analysis) {
  const byTool = new Map();
  for (const call of analysis.toolCalls) {
    const entry = byTool.get(call.name) ?? { calls: 0, errors: 0, durationMs: 0, resultTokens: 0 };
    entry.calls += 1;
    if (call.isError === true) entry.errors += 1;
    if (typeof call.durationMs === "number") entry.durationMs += call.durationMs;
    entry.resultTokens += call.resultTokens;
    byTool.set(call.name, entry);
  }
  return Object.fromEntries([...byTool.entries()].sort((left, right) => right[1].calls - left[1].calls));
}

function summarizeAnalysis(analysis, options) {
  const spanMs = analysis.firstMs !== null && analysis.lastMs !== null
    ? analysis.lastMs - analysis.firstMs
    : 0;
  const buckets = analysis.gapBuckets;
  // Time the operator was being waited on, whether the harness was idle or
  // sitting inside an AskUserQuestion, is not active session time.
  const activeMs = Math.max(
    0,
    spanMs - buckets.operatorWaitMs - buckets.operatorToolWaitMs,
  );
  const failures = detectFailuresAndRetries(analysis);
  const { repeated: repeatedReads, paginated: paginatedReads } = detectRepeatedReads(analysis);
  const repeatedCommands = detectRepeatedCommands(analysis);
  const contextTokens = analysis.tokens;
  const totalApprox = contextTokens.toolResultTokens
    + contextTokens.assistantTextTokens
    + contextTokens.assistantThinkingTokens
    + contextTokens.userTextTokens;

  return {
    file: analysis.file,
    role: analysis.role,
    lineCount: analysis.lineCount,
    malformedLines: analysis.malformedLines,
    startedAt: analysis.firstMs === null ? null : new Date(analysis.firstMs).toISOString(),
    endedAt: analysis.lastMs === null ? null : new Date(analysis.lastMs).toISOString(),
    models: [...analysis.models],
    harnessVersions: [...analysis.versions],
    gitBranches: [...analysis.gitBranches],
    time: {
      sessionSpanMs: spanMs,
      activeSpanMs: activeMs,
      operatorWaitMs: buckets.operatorWaitMs,
      operatorToolWaitMs: buckets.operatorToolWaitMs,
      backgroundWaitMs: buckets.backgroundWaitMs,
      modelLatencyMs: buckets.modelLatencyMs,
      toolExecutionMs: buckets.toolExecutionMs,
      delegationWaitMs: buckets.delegationWaitMs,
      unclassifiedMs: buckets.otherMs,
      operatorTurns: analysis.operatorPrompts.length,
      // Part of operatorTurns, not a separate class: a slash command is a human
      // turn entered as a command.
      slashCommandTurns: analysis.operatorPrompts.filter((prompt) => prompt.slashCommand).length,
      // Concrete intervals, so the aggregate stage can union operator wait
      // across sessions that ran concurrently instead of summing it.
      operatorWaitIntervals: analysis.operatorWaitIntervals.map((interval) => ({
        startedAt: new Date(interval.startMs).toISOString(),
        endedAt: new Date(interval.endMs).toISOString(),
        gapMs: interval.endMs - interval.startMs,
      })),
      turns: turnTimings(analysis),
      longestToolCalls: longestToolCalls(analysis),
      longGaps: analysis.longGaps.slice(0, 20),
      longToolCallThresholdMs: options.longToolMs,
    },
    tools: {
      totalCalls: analysis.toolCalls.length,
      unmatchedResults: analysis.unmatchedResults,
      unresolvedCalls: analysis.unresolvedToolCalls,
      duplicateToolUseIds: analysis.duplicateToolUseIds,
      byTool: toolCallSummary(analysis),
    },
    integrity: {
      duplicateRecordsSkipped: analysis.duplicateRecords,
      duplicateToolUseIds: analysis.duplicateToolUseIds,
      backwardTimestamps: analysis.backwardTimestamps,
    },
    waste: {
      // The list is capped for output size; the counts are the true totals, so
      // a reader cannot mistake the cap for a finding.
      repeatedReadClusterCount: repeatedReads.length,
      repeatedReads: repeatedReads.slice(0, 25),
      // Not waste: the same file read in disjoint line windows. Reported so a
      // reader can see it was measured and excluded, rather than wonder why a
      // file read six times is absent from `repeatedReads`.
      paginatedReadClusterCount: paginatedReads.length,
      paginatedReads: paginatedReads.slice(0, 25),
      repeatedCommandGroupCount: repeatedCommands.length,
      repeatedCommands: repeatedCommands.slice(0, 25),
      failures,
      postCompactionRereads: detectPostCompactionRereads(analysis),
      cache: cacheEconomics(analysis),
    },
    rework: {
      editChurn: detectEditChurn(analysis),
    },
    context: {
      approxTokens: {
        toolResults: contextTokens.toolResultTokens,
        assistantText: contextTokens.assistantTextTokens,
        assistantThinking: contextTokens.assistantThinkingTokens,
        userText: contextTokens.userTextTokens,
        total: totalApprox,
        toolResultFraction: totalApprox === 0
          ? null
          : round(contextTokens.toolResultTokens / totalApprox, 4),
      },
      reportedUsage: analysis.usage,
      crossCheck: contextDeltas(analysis),
      largestToolOutputs: [...analysis.topOutputs]
        .sort((left, right) => right.approxTokens - left.approxTokens)
        .map(({ identifiers, recordIndex, ...rest }) => ({
          ...rest,
          identifierSampleCount: identifiers.length,
        })),
      readBytes: readByteAccounting(analysis),
      heuristics: {
        tokenEstimate: "characters / 4; not a tokenizer",
        referenceProxy: "string containment of identifiers lifted from the output "
          + "into later assistant text or tool inputs; over- and under-reports",
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Evidence packets
// ---------------------------------------------------------------------------

function renderRecordExcerpt(filePath, lineRefValue) {
  if (!lineRefValue) {
    return null;
  }
  let raw;
  try {
    raw = readLineAt(filePath, lineRefValue.byteOffset, lineRefValue.byteLength);
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  let record;
  try {
    record = JSON.parse(raw);
  } catch {
    return {
      // Self-describing: a packet may quote records from more than one
      // transcript (a delegation overlap cites both the parent and the
      // subagent), so an offset alone is not enough to re-open it.
      file: filePath,
      ...lineRefValue,
      rendering: "raw",
      resultTextBytes: 0,
      excerpt: redactedExcerpt(raw, EXCERPT_LIMIT),
    };
  }
  // Each part is redacted before it is clipped: clipping first could sever a
  // secret so that neither half still matches a redaction pattern.
  const parts = [`type=${record.type ?? "(none)"} at=${record.timestamp ?? "(none)"}`];
  for (const use of toolUsesOf(record)) {
    parts.push(`tool_use ${use.name} id=${use.id}`);
    parts.push(redactedExcerpt(JSON.stringify(use.input) ?? "", 1500));
  }
  let resultTextBytes = 0;
  for (const result of toolResultsOf(record)) {
    parts.push(`tool_result id=${result.toolUseId} error=${result.isError}`);
    const rendered = redactedExcerpt(result.text, 2000);
    resultTextBytes += Buffer.byteLength(rendered, "utf8");
    parts.push(rendered);
  }
  const text = assistantText(record) || userText(record);
  if (text) {
    parts.push(redactedExcerpt(text, 1500));
  }
  const excerpt = redactedExcerpt(parts.join("\n"), EXCERPT_LIMIT);
  return {
    file: filePath,
    ...lineRefValue,
    rendering: "structured",
    // How much of the excerpt is tool_result payload. Combined with the
    // signal's tool name this is what decides `containsVerbatimSource`.
    resultTextBytes: Math.min(resultTextBytes, Buffer.byteLength(excerpt, "utf8")),
    excerpt,
  };
}

// Analysis of these packets is local and private, so verbatim file content is
// kept rather than stripped -- but the Stage 3 report writer must know not to
// reproduce it in a document, so the packet says so on its face.
//
// Computed from the evidence that was actually rendered, and applied to EVERY
// packet. Deriving it from the signal's tool name instead was worse than
// useless: the packets that quote a Read cite the tool_use record, which holds
// no file content at all, while the packets that really do embed hundreds of
// bytes of verbatim source -- a failed Edit echoing the file back, a Bash
// command dumping a file -- carried no flag at all. A report writer keying on
// `containsVerbatimSource === false` got `undefined` exactly where the risk was.
const VERBATIM_SOURCE_FRACTION = 0.5;

function markVerbatimSource(body) {
  const evidence = (body.evidence ?? []).filter(Boolean);
  const mostlyFileContent = evidence.some((entry) => {
    const total = Buffer.byteLength(entry?.excerpt ?? "", "utf8");
    return total > 0 && (entry.resultTextBytes ?? 0) / total >= VERBATIM_SOURCE_FRACTION;
  });
  return { ...body, containsVerbatimSource: mostlyFileContent };
}

function buildPackets(context, metrics, limit) {
  const packets = [];
  const push = (type, body) => {
    const ofType = packets.filter((packet) => packet.signalType === type).length;
    if (ofType >= limit) return;
    packets.push({
      signalType: type,
      signalId: `${type}-${String(ofType + 1).padStart(3, "0")}`,
      provider: context.provider,
      repo: context.repo,
      sessionId: context.sessionId,
      // Applied here so no signal type can be added later without it.
      ...markVerbatimSource(body),
    });
  };

  const parent = metrics.parent;
  for (const cluster of parent.waste.repeatedReads.slice(0, limit)) {
    // `cluster.reads` includes the read that was repeated, so the offsets
    // count matches the claim: N reads claimed, N offsets shipped.
    push("repeated-read", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${cluster.path} was read ${cluster.reads.length} times over `
        + "overlapping line ranges with no intervening edit.",
      readCount: cluster.reads.length,
      ranges: cluster.reads.map((read) => read.range),
      timestamps: cluster.reads.map((read) => read.at),
      sourceLines: cluster.reads.map((read) => read.line),
      evidence: cluster.reads.slice(0, 2)
        .map((read) => renderRecordExcerpt(context.parentFile, read.line)),
    });
  }

  for (const cluster of parent.waste.paginatedReads.slice(0, limit)) {
    push("paginated-read", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${cluster.path} was read ${cluster.reads.length} times over DISJOINT line `
        + "ranges. This is paging through one file, not re-reading it, and is "
        + "recorded so it is not mistaken for waste.",
      readCount: cluster.reads.length,
      ranges: cluster.reads.map((read) => read.range),
      timestamps: cluster.reads.map((read) => read.at),
      sourceLines: cluster.reads.map((read) => read.line),
      evidence: cluster.reads.slice(0, 2)
        .map((read) => renderRecordExcerpt(context.parentFile, read.line)),
    });
  }

  for (const group of parent.waste.repeatedCommands.filter((entry) => entry.count >= 3).slice(0, limit)) {
    push("repeated-command", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${group.toolName} ran ${group.count} times with identical input (${group.preview}).`,
      timestamps: group.occurrences.map((entry) => entry.at),
      sourceLines: group.occurrences.map((entry) => entry.line),
      evidence: group.occurrences.slice(0, 2)
        .map((entry) => renderRecordExcerpt(context.parentFile, entry.line)),
    });
  }

  for (const chain of parent.waste.failures.retryChains.slice(0, limit)) {
    push("retry-chain", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${chain.toolName} failed and was retried (${chain.attempts} attempts, `
        + `resolved=${chain.resolved}): ${chain.preview}`,
      // One timestamp per offset, in the same order: the tool_use record and
      // the failing tool_result record are different records with different
      // times, and a single timestamp for both was simply wrong.
      timestamps: [chain.line ? chain.firstAt : null, chain.resultLine ? chain.firstResultAt : null]
        .filter((value) => value !== null),
      sourceLines: [chain.line, chain.resultLine].filter(Boolean),
      evidence: [chain.line, chain.resultLine].filter(Boolean)
        .map((ref) => renderRecordExcerpt(context.parentFile, ref)),
    });
  }

  for (const event of parent.waste.postCompactionRereads.filter((entry) => entry.rereadAfter > 0)) {
    push("post-compaction-reread", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `After compaction at ${event.compactedAt}, ${event.rereadAfter} previously read `
        + `file(s) were read again (~${event.rereadTokens} tokens).`,
      timestamps: [event.compactedAt, ...event.samples.map((sample) => sample.at)],
      sourceLines: [event.compactionLine, ...event.samples.map((sample) => sample.line)],
      evidence: event.samples.slice(0, 2)
        .map((sample) => renderRecordExcerpt(context.parentFile, sample.line)),
    });
  }

  for (const output of parent.context.largestToolOutputs.filter((entry) => !entry.referencedLater).slice(0, limit)) {
    push("large-unreferenced-output", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${output.toolName} returned ~${output.approxTokens} tokens with no later `
        + "identifier reuse (crude proxy).",
      // Aligned with sourceLines: the tool_use record's time, then the
      // tool_result record's time.
      timestamps: [
        output.toolUseLine ? output.at : null,
        output.line ? output.resultAt : null,
      ].filter((value) => value !== null),
      sourceLines: [output.toolUseLine, output.line].filter(Boolean),
      evidence: [output.line ?? output.toolUseLine]
        .filter(Boolean)
        .map((ref) => renderRecordExcerpt(context.parentFile, ref)),
    });
  }

  for (const call of parent.time.longestToolCalls.filter((entry) => (
    entry.durationMs >= context.longToolMs && !entry.delegated
  )).slice(0, limit)) {
    push("long-tool-call", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${call.toolName} took ${Math.round(call.durationMs / 1000)}s: ${call.preview}`,
      // One timestamp per offset, in the same order.
      timestamps: [call.line ? call.at : null, call.resultLine ? call.resultAt : null]
        .filter((value) => value !== null),
      sourceLines: [call.line, call.resultLine].filter(Boolean),
      evidence: [call.line].map((ref) => renderRecordExcerpt(context.parentFile, ref)),
    });
  }

  for (const churn of parent.rework.editChurn.filter((entry) => entry.turnClusters >= 2).slice(0, limit)) {
    push("edit-churn", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${churn.path} was edited ${churn.edits} time(s) across `
        + `${churn.turnClusters} separate operator turns.`,
      timestamps: churn.samples.map((sample) => sample.at),
      sourceLines: churn.samples.map((sample) => sample.line),
      evidence: churn.samples.slice(0, 2)
        .map((sample) => renderRecordExcerpt(context.parentFile, sample.line)),
    });
  }

  for (const stretch of parent.waste.cache.cacheMissStretches.slice(0, limit)) {
    push("cache-miss-stretch", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `${stretch.turns} consecutive assistant turns re-created cache `
        + `(~${stretch.cacheCreationTokens} cache-creation tokens, no cache reads).`,
      // Every finding needs offsets. This signal used to ship with none, which
      // is the same defect delegation-overlap had, left in a second code path.
      timestamps: (stretch.lines ?? []).map((entry) => entry.at),
      sourceLines: (stretch.lines ?? []).map((entry) => entry.line).filter(Boolean),
      evidence: (stretch.lines ?? []).slice(0, 2)
        .map((entry) => renderRecordExcerpt(context.parentFile, entry.line))
        .filter(Boolean),
    });
  }

  for (const gap of parent.time.longGaps.filter((entry) => entry.bucket === "operatorWait").slice(0, limit)) {
    push("operator-wait", {
      sourceRole: "parent",
      sourceFile: context.parentFile,
      summary: `Session idled ${Math.round(gap.gapMs / 60000)} minute(s) waiting on the operator.`,
      timestamps: [gap.endedAt],
      sourceLines: [gap.line],
      evidence: [renderRecordExcerpt(context.parentFile, gap.line)],
    });
  }

  for (const subagent of metrics.subagents) {
    const overlaps = subagent.overlapWithParent.overlaps ?? [];
    if (overlaps.length === 0) continue;
    const cited = overlaps.slice(0, 25);
    // Each overlap is a claim about two records in two different transcripts:
    // where the parent read the file, and where the subagent read it again.
    // Both offsets ship, each tagged with the file it belongs to, so the packet
    // can be verified without re-running the reducer.
    const sourceLines = [];
    const timestamps = [];
    for (const overlap of cited) {
      sourceLines.push({ file: context.parentFile, role: "parent", ...overlap.parentRead.line });
      timestamps.push(overlap.parentRead.at);
      sourceLines.push({ file: subagent.file, role: "subagent", ...overlap.subagentRead.line });
      timestamps.push(overlap.subagentRead.at);
    }
    push("delegation-overlap", {
      sourceRole: "subagent",
      sourceFile: subagent.file,
      parentFile: context.parentFile,
      subagentId: subagent.subagentId,
      summary: `Subagent ${subagent.agentType ?? subagent.subagentId} re-read `
        + `${overlaps.length} file(s) the parent had already read.`,
      delegationMode: subagent.delegation?.mode ?? "unknown",
      subagentSpanMs: subagent.delegation?.subagentSpanMs ?? null,
      delegationCallMs: subagent.delegation?.delegationCallMs ?? null,
      timestamps,
      sourceLines,
      overlappingFiles: cited.map((overlap) => overlap.path),
      overlaps: cited.map((overlap) => ({
        path: overlap.path,
        parentReadAt: overlap.parentRead.at,
        parentReadLine: overlap.parentRead.line,
        subagentReadAt: overlap.subagentRead.at,
        subagentReadLine: overlap.subagentRead.line,
      })),
      evidence: cited.slice(0, 2).flatMap((overlap) => [
        renderRecordExcerpt(context.parentFile, overlap.parentRead.line),
        renderRecordExcerpt(subagent.file, overlap.subagentRead.line),
      ]),
    });
  }

  return packets;
}

// ---------------------------------------------------------------------------

// Maps normalized path -> the FIRST read of that path, with the offsets an
// evidence packet needs. Returning bare display strings was why every
// delegation-overlap packet shipped with empty `sourceLines` and `evidence`:
// the detection was right, but the offsets had already been discarded by the
// time the packet was assembled.
function readPathsOf(analysis, beforeMs = null) {
  const paths = new Map();
  for (const call of analysis.toolCalls) {
    if (!isReadTool(call.name) || !call.targetPath) continue;
    if (beforeMs !== null && (call.startMs === null || call.startMs >= beforeMs)) continue;
    const key = normalizePath(call.targetPath);
    if (key && !paths.has(key)) {
      paths.set(key, {
        path: call.targetPath,
        at: call.startAt,
        approxTokens: call.resultTokens,
        line: call.line,
      });
    }
  }
  return paths;
}

// How much of a subagent's wall clock the parent's Agent tool call actually
// blocked for. Both modes occur in real transcripts and neither can be assumed:
//
//   synchronous -- the Agent call returned when the subagent finished, so the
//                  parent's delegation wait does cover the subagent's span.
//   background  -- the Agent call returned at launch (background subagents),
//                  so delegation wait is launch latency and the subagent's work
//                  ran in parallel with whatever the parent did next. Its time
//                  is NOT inside delegationWaitMs and is not inside any other
//                  parent bucket either.
//
// Classified empirically from the ratio rather than from the tool name, because
// the same tool does both.
const SYNCHRONOUS_COVERAGE_MIN = 0.8;

export function classifyDelegation(spawnCall, subMetrics) {
  const spanMs = subMetrics.time.sessionSpanMs;
  const callDurationMs = typeof spawnCall?.durationMs === "number" ? spawnCall.durationMs : null;
  const coverage = callDurationMs === null || spanMs <= 0
    ? null
    : round(callDurationMs / spanMs, 4);
  let mode = "unknown";
  if (callDurationMs !== null) {
    if (spanMs <= 0) {
      mode = "unknown";
    } else if (coverage >= SYNCHRONOUS_COVERAGE_MIN) {
      mode = "synchronous";
    } else {
      mode = "background";
    }
  }
  return {
    mode,
    // What the parent's Agent tool call itself blocked for.
    delegationCallMs: callDurationMs,
    // The subagent's own wall clock, start of its first record to end of its
    // last. Never added to the parent span.
    subagentSpanMs: spanMs,
    coverage,
    // The part of the subagent's span that no parent bucket accounts for.
    uncoveredMs: callDurationMs === null ? null : Math.max(0, spanMs - callDurationMs),
  };
}

export async function reduce(options) {
  const discoveryPath = path.resolve(options.get("discovery"));
  if (!existsSync(discoveryPath)) {
    throw new UsageError(`Discovery inventory not found: ${discoveryPath}`);
  }
  const discovery = readDiscovery(discoveryPath, readFileSync);
  const outDir = assertRunDirOutsideRepo(
    options.get("out"),
    repoRootFor(path.dirname(fileURLToPath(import.meta.url)), existsSync),
  );
  const packetLimit = Number.parseInt(options.get("max-packets-per-signal"), 10);
  const runtime = {
    longGapMs: Number.parseInt(options.get("long-gap-ms"), 10),
    longToolMs: Number.parseInt(options.get("long-tool-ms"), 10),
  };
  if (!Number.isFinite(packetLimit) || packetLimit < 0) {
    throw new UsageError("--max-packets-per-signal must be a non-negative integer.");
  }

  const sessionsDir = path.join(outDir, "sessions");
  const evidenceRoot = path.join(outDir, "evidence");
  mkdirSync(sessionsDir, { recursive: true });
  mkdirSync(evidenceRoot, { recursive: true });

  const parents = discovery.sessions.filter((entry) => entry.role === "parent");
  const subagentsByParent = new Map();
  for (const entry of discovery.sessions.filter((item) => item.role === "subagent")) {
    const list = subagentsByParent.get(entry.parentSessionId) ?? [];
    list.push(entry);
    subagentsByParent.set(entry.parentSessionId, list);
  }

  const summaries = [];
  let evidenceBytes = 0;
  let evidenceCount = 0;
  let processedLines = 0;
  let malformedLines = 0;

  for (const parentEntry of parents) {
    const parentAnalysis = await analyzeTranscript(parentEntry.file, "parent", runtime);
    processedLines += parentAnalysis.lineCount;
    malformedLines += parentAnalysis.malformedLines;
    const parentMetrics = summarizeAnalysis(parentAnalysis, runtime);

    // Every transcript's tool calls are indexed before any subagent is
    // classified, because a nested subagent (spawnDepth > 1) was launched from
    // a SIBLING subagent's transcript, not from the parent's. Looking only at
    // the parent left those spawns unresolved and their whole span classified
    // as "unknown".
    const subagentEntries = subagentsByParent.get(parentEntry.sessionId) ?? [];
    const subagentAnalyses = [];
    for (const subEntry of subagentEntries) {
      const subAnalysis = await analyzeTranscript(subEntry.file, "subagent", runtime);
      processedLines += subAnalysis.lineCount;
      malformedLines += subAnalysis.malformedLines;
      subagentAnalyses.push({ subEntry, subAnalysis });
    }

    const spawnTimes = new Map();
    const spawnOrigin = new Map();
    for (const call of parentAnalysis.toolCalls) {
      if (call.id) {
        spawnTimes.set(call.id, call);
        spawnOrigin.set(call.id, { role: "parent", sessionId: parentEntry.sessionId });
      }
    }
    for (const { subEntry, subAnalysis } of subagentAnalyses) {
      for (const call of subAnalysis.toolCalls) {
        if (call.id && !spawnTimes.has(call.id)) {
          spawnTimes.set(call.id, call);
          spawnOrigin.set(call.id, { role: "subagent", sessionId: subEntry.sessionId });
        }
      }
    }

    const subagents = [];
    for (const { subEntry, subAnalysis } of subagentAnalyses) {
      const subMetrics = summarizeAnalysis(subAnalysis, runtime);
      const spawnCall = subEntry.spawnToolUseId ? spawnTimes.get(subEntry.spawnToolUseId) : undefined;
      const spawnedBy = subEntry.spawnToolUseId
        ? spawnOrigin.get(subEntry.spawnToolUseId) ?? null
        : null;
      const parentReadsBefore = readPathsOf(
        parentAnalysis,
        spawnCall?.startMs ?? subAnalysis.firstMs ?? null,
      );
      const subReads = readPathsOf(subAnalysis);
      const overlaps = [...subReads.entries()]
        .filter(([key]) => parentReadsBefore.has(key))
        .map(([key, subRead]) => ({
          path: subRead.path,
          parentRead: parentReadsBefore.get(key),
          subagentRead: subRead,
        }));
      const overlapping = overlaps.map((entry) => entry.path);
      const delegation = classifyDelegation(spawnCall, subMetrics);
      subagents.push({
        subagentId: subEntry.sessionId,
        agentId: subEntry.agentId,
        agentType: subEntry.agentType,
        description: subEntry.description,
        spawnToolUseId: subEntry.spawnToolUseId,
        spawnedAt: spawnCall?.startAt ?? null,
        // Which transcript the Agent call that created this subagent lives in.
        // A nested subagent's time sits inside its SPAWNING SUBAGENT's
        // delegation wait, never inside the parent's.
        spawnedBy,
        spawnDepth: subEntry.spawnDepth ?? null,
        file: subEntry.file,
        metrics: subMetrics,
        delegation,
        totals: {
          wallClockMs: subMetrics.time.sessionSpanMs,
          spanMs: subMetrics.time.sessionSpanMs,
          toolCalls: subMetrics.tools.totalCalls,
          inputTokens: subAnalysis.usage.inputTokens,
          cacheReadTokens: subAnalysis.usage.cacheReadTokens,
          cacheCreationTokens: subAnalysis.usage.cacheCreationTokens,
          outputTokens: subAnalysis.usage.outputTokens,
        },
        overlapWithParent: {
          parentFilesReadBeforeSpawn: parentReadsBefore.size,
          subagentFilesRead: subReads.size,
          overlappingFiles: overlapping,
          // Same set, with the parent-side and subagent-side record offsets an
          // evidence packet needs to be verified standalone.
          overlaps,
          overlapFraction: subReads.size === 0
            ? null
            : round(overlapping.length / subReads.size, 4),
        },
      });
    }

    const subagentSpanIntervals = subagents
      .map((item) => ({
        startMs: Date.parse(item.metrics.startedAt ?? ""),
        endMs: Date.parse(item.metrics.endedAt ?? ""),
      }))
      .filter((interval) => Number.isFinite(interval.startMs) && Number.isFinite(interval.endMs));
    const delegationSummary = {
      subagentCount: subagents.length,
      // What the parent's Agent tool calls blocked for. For background
      // subagents this is launch latency, NOT the subagent's work.
      delegationWaitMs: parentMetrics.time.delegationWaitMs,
      // The subagents' own wall clock. Reported beside delegation wait, never
      // inside it, and never added to the parent span.
      subagentSpanMs: subagents.reduce((total, item) => total + item.delegation.subagentSpanMs, 0),
      subagentSpanUnionMs: unionDurationMs(subagentSpanIntervals),
      // Subagent wall clock the parent's delegation wait does not cover. In a
      // background run this is where the delegated work actually went: it is
      // absent from every parent bucket, which is why summing parent buckets
      // understates the session's real work.
      uncoveredSubagentMs: subagents.reduce(
        (total, item) => total + (item.delegation.uncoveredMs ?? item.delegation.subagentSpanMs),
        0,
      ),
      modes: subagents.reduce((counts, item) => {
        counts[item.delegation.mode] = (counts[item.delegation.mode] ?? 0) + 1;
        return counts;
      }, {}),
      perSubagent: subagents.map((item) => ({
        subagentId: item.subagentId,
        agentType: item.agentType,
        spawnedAt: item.spawnedAt,
        spawnedByRole: item.spawnedBy?.role ?? null,
        spawnDepth: item.spawnDepth,
        ...item.delegation,
      })),
    };

    const combined = {
      // The parent span is the session's real wall clock. A subagent's span is
      // reported separately and never added: in synchronous mode it sits inside
      // the parent's delegation wait, and in background mode it runs alongside
      // the parent, so in neither case is adding it meaningful.
      wallClockMs: parentMetrics.time.sessionSpanMs,
      subagentActiveMs: subagents.reduce((total, item) => total + item.totals.wallClockMs, 0),
      subagentSpanMs: delegationSummary.subagentSpanMs,
      subagentSpanUnionMs: delegationSummary.subagentSpanUnionMs,
      uncoveredSubagentMs: delegationSummary.uncoveredSubagentMs,
      toolCalls: parentMetrics.tools.totalCalls
        + subagents.reduce((total, item) => total + item.totals.toolCalls, 0),
      parentToolCalls: parentMetrics.tools.totalCalls,
      subagentToolCalls: subagents.reduce((total, item) => total + item.totals.toolCalls, 0),
      tokens: {
        parent: parentAnalysis.usage,
        subagents: subagents.reduce((totals, item) => ({
          inputTokens: totals.inputTokens + item.totals.inputTokens,
          cacheCreationTokens: totals.cacheCreationTokens + item.totals.cacheCreationTokens,
          cacheReadTokens: totals.cacheReadTokens + item.totals.cacheReadTokens,
          outputTokens: totals.outputTokens + item.totals.outputTokens,
        }), { inputTokens: 0, cacheCreationTokens: 0, cacheReadTokens: 0, outputTokens: 0 }),
      },
      lines: parentAnalysis.lineCount
        + subagents.reduce((total, item) => total + item.metrics.lineCount, 0),
    };

    const metrics = {
      generatedAt: new Date().toISOString(),
      provider: discovery.provider,
      repo: parentEntry.repo,
      sessionId: parentEntry.sessionId,
      file: parentEntry.file,
      window: discovery.window,
      parent: parentMetrics,
      subagents,
      combined,
      delegation: delegationSummary,
      notes: [
        "`time.delegationWaitMs` measures exactly one thing: how long the "
        + "parent's Agent/Task tool calls blocked before returning a result. It "
        + "is NOT the subagent's working time. The Agent tool frequently returns "
        + "at launch, in which case delegation wait is launch latency and the "
        + "subagent ran concurrently with the parent's next turns.",
        "Subagent wall clock is reported as `delegation.subagentSpanMs` (sum) "
        + "and `delegation.perSubagent[].subagentSpanMs`, never added to the "
        + "parent span. `delegation.uncoveredSubagentMs` is the part of it that "
        + "no parent time bucket accounts for; `delegation.modes` records how "
        + "each spawn was classified (synchronous / background / unknown).",
        "Subagent spans overlap each other when several run at once, and a "
        + "nested subagent runs inside its spawner's span, so "
        + "`delegation.subagentSpanMs` (a sum) exceeds real delegated wall "
        + "clock. `delegation.subagentSpanUnionMs` is the non-double-counted "
        + "figure, and `perSubagent[].spawnedByRole` says whose delegation wait "
        + "a given subagent sits inside.",
        "Token counts under `context.approxTokens` are a characters/4 estimate; "
        + "`context.reportedUsage` carries the harness-reported usage.",
        "`waste.repeatedReads` counts only reads whose line ranges overlap. "
        + "Reads of disjoint windows of one file are paging, and are reported "
        + "separately as `waste.paginatedReads`.",
      ],
    };

    const context = {
      provider: discovery.provider,
      repo: parentEntry.repo,
      sessionId: parentEntry.sessionId,
      parentFile: parentEntry.file,
      longToolMs: runtime.longToolMs,
    };
    const packets = buildPackets(context, metrics, packetLimit);
    if (packets.length > 0) {
      const sessionEvidenceDir = path.join(evidenceRoot, parentEntry.sessionId);
      mkdirSync(sessionEvidenceDir, { recursive: true });
      for (const packet of packets) {
        const body = `${JSON.stringify(packet, null, 2)}\n`;
        writeFileSync(path.join(sessionEvidenceDir, `${packet.signalId}.json`), body, "utf8");
        evidenceBytes += Buffer.byteLength(body, "utf8");
        evidenceCount += 1;
      }
    }
    metrics.signals = packets.map((packet) => ({
      signalId: packet.signalId,
      signalType: packet.signalType,
      summary: packet.summary,
    }));

    writeFileSync(
      path.join(sessionsDir, `${parentEntry.sessionId}.metrics.json`),
      `${JSON.stringify(metrics, null, 2)}\n`,
      "utf8",
    );

    summaries.push({
      sessionId: parentEntry.sessionId,
      repo: parentEntry.repo,
      startedAt: parentMetrics.startedAt,
      endedAt: parentMetrics.endedAt,
      models: parentMetrics.models,
      harnessVersions: parentMetrics.harnessVersions,
      gitBranches: parentMetrics.gitBranches,
      operatorTurns: parentMetrics.time.operatorTurns,
      // Part of operatorTurns, surfaced here so a reader of summary.json alone
      // can tell typed prompts from invoked slash commands.
      slashCommandTurns: parentMetrics.time.slashCommandTurns,
      time: {
        sessionSpanMs: parentMetrics.time.sessionSpanMs,
        activeSpanMs: parentMetrics.time.activeSpanMs,
        operatorWaitMs: parentMetrics.time.operatorWaitMs,
        operatorToolWaitMs: parentMetrics.time.operatorToolWaitMs,
        backgroundWaitMs: parentMetrics.time.backgroundWaitMs,
        modelLatencyMs: parentMetrics.time.modelLatencyMs,
        toolExecutionMs: parentMetrics.time.toolExecutionMs,
        delegationWaitMs: parentMetrics.time.delegationWaitMs,
        unclassifiedMs: parentMetrics.time.unclassifiedMs,
      },
      operatorWaitIntervals: parentMetrics.time.operatorWaitIntervals,
      delegation: {
        delegationWaitMs: delegationSummary.delegationWaitMs,
        subagentSpanMs: delegationSummary.subagentSpanMs,
        subagentSpanUnionMs: delegationSummary.subagentSpanUnionMs,
        uncoveredSubagentMs: delegationSummary.uncoveredSubagentMs,
        modes: delegationSummary.modes,
      },
      // Parent-only, and named so. `subagentToolCalls` sits beside it and the
      // combined figure is derived where it is used, never silently.
      toolCalls: parentMetrics.tools.totalCalls,
      parentToolCalls: parentMetrics.tools.totalCalls,
      integrity: parentMetrics.integrity,
      failedToolCalls: parentMetrics.waste.failures.failedCalls,
      parentFailedToolCalls: parentMetrics.waste.failures.failedCalls,
      subagentFailedToolCalls: subagents.reduce(
        (total, item) => total + item.metrics.waste.failures.failedCalls,
        0,
      ),
      retryChains: parentMetrics.waste.failures.retryChains.length,
      repeatedReadClusters: parentMetrics.waste.repeatedReadClusterCount,
      paginatedReadClusters: parentMetrics.waste.paginatedReadClusterCount,
      repeatedCommandGroups: parentMetrics.waste.repeatedCommandGroupCount,
      editChurnFiles: parentMetrics.rework.editChurn.length,
      compactions: parentMetrics.waste.postCompactionRereads.length,
      subagentCount: subagents.length,
      subagentToolCalls: combined.subagentToolCalls,
      delegationOverlapFiles: subagents.reduce(
        (total, item) => total + item.overlapWithParent.overlappingFiles.length,
        0,
      ),
      approxToolResultTokens: parentMetrics.context.approxTokens.toolResults,
      toolResultFraction: parentMetrics.context.approxTokens.toolResultFraction,
      rereadFraction: parentMetrics.context.readBytes.rereadFraction,
      cacheHitRatio: parentMetrics.waste.cache.cacheHitRatio,
      // Parent-only, kept under its historical name; the subagent and combined
      // figures sit beside it so a reader cannot mistake one for the other.
      reportedUsage: parentAnalysis.usage,
      parentReportedUsage: parentAnalysis.usage,
      subagentReportedUsage: combined.tokens.subagents,
      combinedReportedUsage: addUsage(parentAnalysis.usage, combined.tokens.subagents),
      signals: metrics.signals.length,
      lines: combined.lines,
    });
  }

  const corpusBytes = discovery.totals?.corpusBytes ?? 0;
  // Everything Stage 3 actually puts in front of a model: the packets plus the
  // per-session metrics files. `evidenceBytes` alone flatters the reduction by
  // roughly an order of magnitude, so both ratios are reported and labelled.
  const metricsBytes = summaries.reduce((total, item) => {
    try {
      return total + statSync(path.join(sessionsDir, `${item.sessionId}.metrics.json`)).size;
    } catch {
      return total;
    }
  }, 0);
  const modelVisibleBytes = evidenceBytes + metricsBytes;
  const summary = {
    generatedAt: new Date().toISOString(),
    provider: discovery.provider,
    window: discovery.window,
    discovery: discoveryPath,
    totals: {
      parentSessions: summaries.length,
      subagentTranscripts: summaries.reduce((total, item) => total + item.subagentCount, 0),
      // Rollups over parent + subagent transcripts.
      processedLines,
      malformedLines,
      corpusBytes,
      evidencePackets: evidenceCount,
      evidenceBytes,
      sessionMetricsBytes: metricsBytes,
      modelVisibleBytes,
      // Corpus bytes per byte of evidence packet.
      evidenceReductionRatio: evidenceBytes === 0 ? null : round(corpusBytes / evidenceBytes, 1),
      // Corpus bytes per byte of the output this script produces for Stage 3.
      // It counts the evidence packets plus the per-session metrics files, and
      // it EXCLUDES two files a Stage 3 reader also opens: summary.json (this
      // file, whose size is not known until it is written) and
      // correlation.json (written by correlate.mjs). Including those lowers the
      // ratio further, so this is a ceiling, not the final figure.
      modelVisibleReductionRatio: modelVisibleBytes === 0
        ? null
        : round(corpusBytes / modelVisibleBytes, 1),
      modelVisibleBytesExcludes: ["summary.json", "correlation.json"],
      parentToolCalls: summaries.reduce((total, item) => total + item.toolCalls, 0),
      subagentToolCalls: summaries.reduce((total, item) => total + item.subagentToolCalls, 0),
      toolCalls: summaries.reduce(
        (total, item) => total + item.toolCalls + item.subagentToolCalls,
        0,
      ),
      // Split three ways: the parent-only figure used to sit under the same
      // roof as parent+subagent rollups, silently dropping subagent failures.
      parentFailedToolCalls: summaries.reduce((total, item) => total + item.failedToolCalls, 0),
      subagentFailedToolCalls: summaries.reduce(
        (total, item) => total + item.subagentFailedToolCalls,
        0,
      ),
      failedToolCalls: summaries.reduce(
        (total, item) => total + item.failedToolCalls + item.subagentFailedToolCalls,
        0,
      ),
      operatorTurns: summaries.reduce((total, item) => total + item.operatorTurns, 0),
      // A subset of operatorTurns, not a separate class.
      slashCommandTurns: summaries.reduce((total, item) => total + item.slashCommandTurns, 0),
      // Parent time buckets only. Subagent wall clock is under `delegation`.
      sessionSpanMs: summaries.reduce((total, item) => total + item.time.sessionSpanMs, 0),
      operatorWaitMs: summaries.reduce((total, item) => total + item.time.operatorWaitMs, 0),
      backgroundWaitMs: summaries.reduce((total, item) => total + item.time.backgroundWaitMs, 0),
      modelLatencyMs: summaries.reduce((total, item) => total + item.time.modelLatencyMs, 0),
      toolExecutionMs: summaries.reduce((total, item) => total + item.time.toolExecutionMs, 0),
      operatorToolWaitMs: summaries.reduce(
        (total, item) => total + item.time.operatorToolWaitMs,
        0,
      ),
      delegationWaitMs: summaries.reduce((total, item) => total + item.time.delegationWaitMs, 0),
      unclassifiedMs: summaries.reduce((total, item) => total + item.time.unclassifiedMs, 0),
      duplicateRecordsSkipped: summaries.reduce(
        (total, item) => total + item.integrity.duplicateRecordsSkipped,
        0,
      ),
      backwardTimestamps: summaries.reduce(
        (total, item) => total + item.integrity.backwardTimestamps,
        0,
      ),
      // Three explicit views. The single `reportedUsage` this replaced was
      // parent-only while sitting beside parent+subagent rollups, which dropped
      // every delegated token without saying so.
      reportedUsage: {
        parent: summaries.reduce(
          (totals, item) => addUsage(totals, item.parentReportedUsage),
          emptyUsage(),
        ),
        subagents: summaries.reduce(
          (totals, item) => addUsage(totals, item.subagentReportedUsage),
          emptyUsage(),
        ),
        combined: summaries.reduce(
          (totals, item) => addUsage(totals, item.combinedReportedUsage),
          emptyUsage(),
        ),
      },
      delegation: {
        delegationWaitMs: summaries.reduce(
          (total, item) => total + item.delegation.delegationWaitMs,
          0,
        ),
        subagentSpanMs: summaries.reduce(
          (total, item) => total + item.delegation.subagentSpanMs,
          0,
        ),
        // Concurrent and nested subagents overlap; this is the sum of each
        // session's own non-double-counted figure.
        subagentSpanUnionMs: summaries.reduce(
          (total, item) => total + item.delegation.subagentSpanUnionMs,
          0,
        ),
        uncoveredSubagentMs: summaries.reduce(
          (total, item) => total + item.delegation.uncoveredSubagentMs,
          0,
        ),
        modes: summaries.reduce((modes, item) => {
          for (const [mode, count] of Object.entries(item.delegation.modes)) {
            modes[mode] = (modes[mode] ?? 0) + count;
          }
          return modes;
        }, {}),
      },
    },
    concurrency: concurrencyCaveats(summaries),
    byRepo: aggregateByRepo(summaries),
    sessions: summaries,
  };

  writeFileSync(
    path.join(outDir, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
  return summary;
}

function emptyUsage() {
  return { inputTokens: 0, cacheCreationTokens: 0, cacheReadTokens: 0, outputTokens: 0 };
}

function addUsage(left, right) {
  const a = left ?? emptyUsage();
  const b = right ?? emptyUsage();
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    cacheCreationTokens: a.cacheCreationTokens + b.cacheCreationTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    outputTokens: a.outputTokens + b.outputTokens,
  };
}

// The denominator problem. Sessions in a run overlap -- the operator drives
// several at once -- so summing eight session spans reports more hours than the
// day contained, and summing operator wait counts one absence once per session
// that was idle through it. Every speed claim built on the summed figures is
// wrong by exactly that factor, so the honest denominators ship beside them.
function concurrencyCaveats(summaries) {
  const spanIntervals = summaries
    .map((item) => ({
      startMs: Date.parse(item.startedAt ?? ""),
      endMs: Date.parse(item.endedAt ?? ""),
    }))
    .filter((interval) => Number.isFinite(interval.startMs) && Number.isFinite(interval.endMs));
  const spanUnion = unionIntervals(spanIntervals);
  const calendarStart = spanUnion.length === 0 ? null : spanUnion[0].startMs;
  const calendarEnd = spanUnion.length === 0
    ? null
    : spanUnion[spanUnion.length - 1].endMs;

  const waitIntervals = summaries.flatMap((item) => (
    (item.operatorWaitIntervals ?? []).map((interval) => ({
      startMs: Date.parse(interval.startedAt),
      endMs: Date.parse(interval.endedAt),
    }))
  ));
  const waitGapsMs = summaries.flatMap((item) => (
    (item.operatorWaitIntervals ?? []).map((interval) => interval.gapMs)
  ));
  const waitSumMs = waitGapsMs.reduce((total, value) => total + value, 0);
  const waitUnionMs = unionDurationMs(waitIntervals);
  const histogram = gapHistogram(waitGapsMs).map((bucket) => ({
    ...bucket,
    hours: round(bucket.totalMs / 3600000, 2),
    shareOfWait: waitSumMs === 0 ? null : round(bucket.totalMs / waitSumMs, 4),
  }));
  const spanSumMs = summaries.reduce((total, item) => total + item.time.sessionSpanMs, 0);
  const calendarWindowMs = calendarStart === null ? 0 : calendarEnd - calendarStart;

  return {
    sessions: summaries.length,
    concurrentSessionsObserved: maxOverlap(spanIntervals),
    sessionSpan: {
      sumMs: spanSumMs,
      sumHours: round(spanSumMs / 3600000, 2),
      // Wall clock during which at least one session was live.
      unionMs: unionDurationMs(spanIntervals),
      unionHours: round(unionDurationMs(spanIntervals) / 3600000, 2),
      // First session start to last session end, idle stretches included.
      calendarWindowMs,
      calendarWindowHours: round(calendarWindowMs / 3600000, 2),
      calendarFrom: calendarStart === null ? null : new Date(calendarStart).toISOString(),
      calendarTo: calendarEnd === null ? null : new Date(calendarEnd).toISOString(),
      overcountFactor: calendarWindowMs === 0 ? null : round(spanSumMs / calendarWindowMs, 2),
    },
    operatorWait: {
      sumMs: waitSumMs,
      sumHours: round(waitSumMs / 3600000, 2),
      // One idle stretch counted once, however many sessions sat through it.
      unionMs: waitUnionMs,
      unionHours: round(waitUnionMs / 3600000, 2),
      overcountFactor: waitUnionMs === 0 ? null : round(waitSumMs / waitUnionMs, 2),
      gapCount: waitGapsMs.length,
      medianGapMs: median(waitGapsMs),
      gapHistogram: histogram,
      largestGaps: summaries
        .flatMap((item) => (item.operatorWaitIntervals ?? []).map((interval) => ({
          sessionId: item.sessionId,
          repo: item.repo,
          ...interval,
        })))
        .sort((left, right) => right.gapMs - left.gapMs)
        .slice(0, 10),
    },
    caveats: [
      "Sessions in this window overlap. `totals.sessionSpanMs` and "
      + "`totals.operatorWaitMs` are SUMS across sessions and exceed real "
      + "calendar time; use `concurrency.sessionSpan.calendarWindowMs` and "
      + "`concurrency.operatorWait.unionMs` as denominators for any rate.",
      "Operator wait is dominated by a small number of long absences. Read "
      + "`gapHistogram` and `medianGapMs` before treating mean wait per turn as "
      + "a description of the working day.",
    ],
  };
}

// Largest number of sessions live at the same instant, by sweeping the
// endpoints. Sorting starts against ends is enough; no interval tree needed for
// a day's worth of sessions.
function maxOverlap(intervals) {
  const events = [];
  for (const interval of intervals) {
    events.push({ ms: interval.startMs, delta: 1 });
    events.push({ ms: interval.endMs, delta: -1 });
  }
  events.sort((left, right) => left.ms - right.ms || left.delta - right.delta);
  let current = 0;
  let peak = 0;
  for (const event of events) {
    current += event.delta;
    if (current > peak) peak = current;
  }
  return peak;
}

function aggregateByRepo(summaries) {
  const byRepo = new Map();
  for (const item of summaries) {
    const entry = byRepo.get(item.repo) ?? {
      sessions: 0,
      // Explicitly named. The old `toolCalls` key here was parent-only while
      // `totals.toolCalls` was a parent+subagent rollup: same name, different
      // meaning, and a 363-call discrepancy nobody could explain.
      parentToolCalls: 0,
      subagentToolCalls: 0,
      toolCalls: 0,
      parentFailedToolCalls: 0,
      subagentFailedToolCalls: 0,
      failedToolCalls: 0,
      sessionSpanMs: 0,
      activeSpanMs: 0,
      subagents: 0,
      subagentSpanMs: 0,
    };
    entry.sessions += 1;
    entry.parentToolCalls += item.toolCalls;
    entry.subagentToolCalls += item.subagentToolCalls;
    entry.toolCalls += item.toolCalls + item.subagentToolCalls;
    entry.parentFailedToolCalls += item.failedToolCalls;
    entry.subagentFailedToolCalls += item.subagentFailedToolCalls;
    entry.failedToolCalls += item.failedToolCalls + item.subagentFailedToolCalls;
    entry.sessionSpanMs += item.time.sessionSpanMs;
    entry.activeSpanMs += item.time.activeSpanMs;
    entry.subagents += item.subagentCount;
    entry.subagentSpanMs += item.delegation.subagentSpanMs;
    byRepo.set(item.repo, entry);
  }
  return Object.fromEntries(byRepo);
}

async function main() {
  if (wantsHelp(process.argv.slice(2))) {
    console.log(USAGE);
    return;
  }
  try {
    const options = parseOptions(process.argv.slice(2), optionDefinitions);
    const summary = await reduce(options);
    console.log(`Reduced ${summary.totals.parentSessions} parent session(s), `
      + `${summary.totals.subagentTranscripts} subagent transcript(s).`);
    console.log(`  lines processed: ${summary.totals.processedLines} `
      + `(malformed: ${summary.totals.malformedLines})`);
    console.log(`  evidence packets: ${summary.totals.evidencePackets} `
      + `(${summary.totals.evidenceBytes} bytes, reduction `
      + `${summary.totals.evidenceReductionRatio}:1 on packets, `
      + `${summary.totals.modelVisibleReductionRatio}:1 on packets + session metrics; `
      + "excludes summary.json and correlation.json)");
    console.log(`  calendar window: `
      + `${summary.concurrency.sessionSpan.calendarWindowHours}h `
      + `(summed spans ${summary.concurrency.sessionSpan.sumHours}h across `
      + `${summary.concurrency.sessions} overlapping session(s))`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
