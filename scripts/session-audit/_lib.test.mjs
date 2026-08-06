import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  UsageError,
  approxTokens,
  assertDateKey,
  assertRunDirOutsideRepo,
  clip,
  encodeProjectDirName,
  extractIdentifiers,
  gapHistogram,
  isHarnessEcho,
  isOperatorPrompt,
  isSlashCommandPrompt,
  localDateKey,
  median,
  normalizePath,
  parseOptions,
  readLineAt,
  readRangeOf,
  readRangesOverlap,
  redact,
  redactedExcerpt,
  streamLines,
  streamRecords,
  timestampMs,
  toolCallSignature,
  toolResultsOf,
  toolUsesOf,
  unionDurationMs,
  unionIntervals,
  usageOf,
  wantsHelp,
} from "./_lib.mjs";
import { discover } from "./discover.mjs";
import { reduce } from "./reduce.mjs";
import { correlate } from "./correlate.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(here, "fixtures", "projects");
const parentFixture = path.join(
  fixturesRoot,
  "T--synthetic-repo",
  "11111111-1111-4111-8111-111111111111.jsonl",
);
const SESSION_ID = "11111111-1111-4111-8111-111111111111";
const FIXTURE_DAY = localDateKey(Date.parse("2020-01-01T10:00:00.000Z"));

function makeTempDir() {
  const dir = mkdtempSync(path.join(tmpdir(), "session-audit-test-"));
  test.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}

async function collect(iterable) {
  const items = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

// ---------------------------------------------------------------------------
// Synthetic transcript builder.
//
// The checked-in fixtures cover the original behaviours and their assertions
// are load bearing, so the fixes below get purpose-built transcripts written
// into a temp projects root instead. Everything here is invented: no real
// transcript content ever enters this repository.
// ---------------------------------------------------------------------------

const BUILDER_VERSION = "0.0.1-synthetic";

function at(seconds, base = "2020-05-05T09:00:00.000Z") {
  return new Date(Date.parse(base) + seconds * 1000).toISOString();
}

let uuidCounter = 0;
function nextUuid() {
  uuidCounter += 1;
  return `synthetic-uuid-${String(uuidCounter).padStart(6, "0")}`;
}

function userPrompt(sessionId, seconds, text) {
  return {
    type: "user",
    uuid: nextUuid(),
    sessionId,
    version: BUILDER_VERSION,
    gitBranch: "main",
    timestamp: at(seconds),
    message: { role: "user", content: [{ type: "text", text }] },
  };
}

function assistantTurn(sessionId, seconds, { text = "", toolUses = [], usage } = {}) {
  const content = [];
  if (text !== "") content.push({ type: "text", text });
  for (const use of toolUses) content.push({ type: "tool_use", ...use });
  return {
    type: "assistant",
    uuid: nextUuid(),
    sessionId,
    version: BUILDER_VERSION,
    gitBranch: "main",
    timestamp: at(seconds),
    requestId: `req_${nextUuid()}`,
    message: {
      role: "assistant",
      model: "synthetic-model-1",
      content,
      usage: usage ?? {
        input_tokens: 10,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 100,
        output_tokens: 5,
      },
    },
  };
}

function toolResult(sessionId, seconds, toolUseId, text, extra = {}) {
  return {
    type: "user",
    uuid: nextUuid(),
    sessionId,
    version: BUILDER_VERSION,
    gitBranch: "main",
    timestamp: at(seconds),
    message: {
      role: "user",
      content: [{ type: "tool_result", tool_use_id: toolUseId, content: text }],
    },
    toolUseResult: extra,
  };
}

function writeTranscript(file, records) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${records.map((record) => JSON.stringify(record)).join("\n")}\n`, "utf8");
}

// Runs discover + reduce over a synthetic projects root and returns the run
// directory plus the parsed outputs.
async function runPipeline(projectDirName, sessionIds, projectsRootDir, day) {
  const out = makeTempDir();
  await discover(new Map([
    ["provider", "claude"],
    ["repos", projectDirName],
    ["from", day],
    ["to", day],
    ["out", out],
    ["projects-root", projectsRootDir],
  ]));
  const summary = await reduce(new Map([
    ["discovery", path.join(out, "discovery.json")],
    ["out", out],
    ["max-packets-per-signal", "10"],
    ["long-gap-ms", "300000"],
    ["long-tool-ms", "60000"],
  ]));
  const metrics = Object.fromEntries(sessionIds.map((id) => [
    id,
    JSON.parse(readFileSync(path.join(out, "sessions", `${id}.metrics.json`), "utf8")),
  ]));
  return { out, summary, metrics };
}

function packetsIn(out, sessionId) {
  const dir = path.join(out, "evidence", sessionId);
  return readdirSync(dir).map((name) => JSON.parse(readFileSync(path.join(dir, name), "utf8")));
}

test("parseOptions handles values, inline values, defaults and errors", () => {
  const definitions = new Map([
    ["out", { required: true }],
    ["mode", { default: "plain" }],
    ["verbose", { boolean: true }],
  ]);
  const values = parseOptions(["--out", "x", "--mode=fancy", "--verbose"], definitions);
  assert.equal(values.get("out"), "x");
  assert.equal(values.get("mode"), "fancy");
  assert.equal(values.get("verbose"), true);

  assert.throws(() => parseOptions([], definitions), UsageError);
  assert.throws(() => parseOptions(["--out"], definitions), UsageError);
  assert.throws(() => parseOptions(["--out", "x", "--nope", "1"], definitions), UsageError);
  assert.throws(() => parseOptions(["stray"], definitions), UsageError);
});

test("streamLines reports exact byte offsets and tolerates CRLF and no trailing newline", async () => {
  const dir = makeTempDir();
  const file = path.join(dir, "lines.txt");
  writeFileSync(file, "alpha\r\nbétä\nomega", "utf8");
  const lines = await collect(streamLines(file));
  assert.deepEqual(lines.map((line) => line.text), ["alpha", "bétä", "omega"]);
  assert.deepEqual(lines.map((line) => line.lineNumber), [1, 2, 3]);

  const raw = readFileSync(file);
  for (const line of lines) {
    const slice = raw.subarray(line.byteOffset, line.byteOffset + line.byteLength);
    assert.equal(slice.toString("utf8").replace(/\r$/u, ""), line.text);
    assert.equal(readLineAt(file, line.byteOffset, line.byteLength), line.text);
  }
});

test("streamLines splits correctly when a record spans read chunks", async () => {
  const dir = makeTempDir();
  const file = path.join(dir, "big.jsonl");
  const rows = Array.from({ length: 200 }, (_, index) => (
    JSON.stringify({ type: "user", index, filler: "x".repeat(1500) })
  ));
  writeFileSync(file, `${rows.join("\n")}\n`, "utf8");
  const lines = await collect(streamLines(file));
  assert.equal(lines.length, 200);
  const raw = readFileSync(file);
  for (const line of lines) {
    assert.equal(
      raw.subarray(line.byteOffset, line.byteOffset + line.byteLength).toString("utf8"),
      line.text,
    );
    assert.equal(JSON.parse(line.text).index, line.lineNumber - 1);
  }
});

test("streamRecords reports malformed lines instead of throwing", async () => {
  const dir = makeTempDir();
  const file = path.join(dir, "mixed.jsonl");
  writeFileSync(
    file,
    ['{"type":"user"}', "not json at all", "", "[1,2,3]", '{"type":"assistant"}'].join("\n"),
    "utf8",
  );
  const entries = await collect(streamRecords(file));
  assert.equal(entries.length, 4);
  assert.equal(entries.filter((entry) => entry.malformed).length, 2);
  assert.deepEqual(
    entries.filter((entry) => !entry.malformed).map((entry) => entry.record.type),
    ["user", "assistant"],
  );
});

test("streamRecords passes unknown record types through untouched", async () => {
  const entries = await collect(streamRecords(parentFixture));
  const types = new Set(entries.filter((entry) => !entry.malformed)
    .map((entry) => entry.record.type));
  assert.ok(types.has("synthetic-future-record-type"));
  assert.equal(entries.filter((entry) => entry.malformed).length, 1);
});

test("encodeProjectDirName mirrors the harness path encoding", () => {
  assert.equal(encodeProjectDirName("X:\\demo4c"), "X--demo4c");
  assert.equal(encodeProjectDirName("X:\\demo-project\\"), "X--demo-project");
  assert.equal(encodeProjectDirName("X:/demo-api-proxy"), "X--demo-api-proxy");
});

test("localDateKey uses the operator's local calendar day", () => {
  const local = new Date(2020, 5, 15, 23, 30, 0);
  assert.equal(localDateKey(local.getTime()), "2020-06-15");
  // A UTC-midnight instant belongs to whichever local day the operator saw.
  const instant = Date.parse("2020-06-15T00:30:00Z");
  const expected = new Date(instant);
  assert.equal(
    localDateKey(instant),
    `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}`
    + `-${String(expected.getDate()).padStart(2, "0")}`,
  );
  assert.throws(() => assertDateKey("2020-6-1", "--from"), UsageError);
  assert.equal(assertDateKey("2020-06-01", "--from"), "2020-06-01");
});

test("record accessors read tool calls, results, usage and prompts", async () => {
  const entries = (await collect(streamRecords(parentFixture)))
    .filter((entry) => !entry.malformed)
    .map((entry) => entry.record);

  const uses = entries.flatMap((record) => toolUsesOf(record));
  assert.equal(uses.length, 11);
  assert.equal(uses[0].name, "Read");
  assert.equal(uses[0].id, "toolu_synth_0001");

  const results = entries.flatMap((record) => toolResultsOf(record));
  assert.equal(results.length, 11);
  assert.equal(results.filter((result) => result.isError).length, 1);
  const readResult = results.find((result) => result.toolUseId === "toolu_synth_0001");
  assert.ok(readResult.fileBytes > 0);

  const usages = entries.map((record) => usageOf(record)).filter(Boolean);
  assert.equal(usages.length, 13);
  assert.equal(usages[0].cacheCreationTokens, 1000);

  const prompts = entries.filter((record) => isOperatorPrompt(record));
  assert.equal(prompts.length, 2);
  // The compaction summary is a user record but not an operator prompt.
  assert.ok(!prompts.some((record) => record.isCompactSummary));
  assert.equal(timestampMs(prompts[0]), Date.parse("2020-01-01T10:00:01.000Z"));
});

test("toolCallSignature is stable under key ordering", () => {
  const left = toolCallSignature("Bash", { command: "ls", description: "list" });
  const right = toolCallSignature("Bash", { description: "list", command: "ls" });
  assert.equal(left, right);
  assert.notEqual(left, toolCallSignature("Bash", { command: "ls -a" }));
});

test("redact removes common secret shapes", () => {
  const secrets = [
    "sk-abcdefghijklmnopqrstuvwxyz012345",
    "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ012345",
    "github_pat_ABCDEFGHIJKLMNOPQRSTUV_0123456789",
    "xoxb-1234567890-abcdefghij",
    "AKIAABCDEFGHIJKLMNOP",
    "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456",
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop",
    "password=hunter2hunter2",
    "api_key: abcdef123456789",
    "DATABASE_PASSWORD=supersecretvalue",
    "A".repeat(220),
    "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0a1b2c3d4e5f6a7b8c9d0e1f2",
    "postgres://admin:S3cretPassw0rd@db.internal:5432/app",
    "aws_secret_access_key = wJalrXUtnFEMIKbPxRfiCYEXAMPLEKEY",
    "Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456",
    "xapp-1-A01BCDEF-1234567890",
  ];
  for (const secret of secrets) {
    const redacted = redact(`prefix ${secret} suffix`);
    assert.ok(redacted.includes("[REDACTED"), `not redacted: ${secret.slice(0, 24)}`);
    assert.ok(!redacted.includes(secret), `secret survived: ${secret.slice(0, 24)}`);
  }
  assert.equal(redact("plain text stays"), "plain text stays");
  // A 40-character hex string is a Git SHA-1. Correlation and the verification
  // gate both need those intact, so they are deliberately not redacted.
  const sha = "2b22302aa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
  assert.ok(redact(`commit ${sha} landed`).includes(sha));

  // A PEM block normally starts a line, so the pattern must not require a word
  // character in front of it.
  const pem = [
    "-----BEGIN RSA PRIVATE KEY-----",
    "MIIEowIBAAKCAQEAsyntheticFixtureKeyMaterialOnly",
    "-----END RSA PRIVATE KEY-----",
  ].join(String.fromCharCode(10));
  const newline = String.fromCharCode(10);
  for (const context of [pem, newline + pem, `{"key":"${pem}"}`, `read: ${pem}`]) {
    const redacted = redact(context);
    assert.ok(redacted.includes("[REDACTED:private-key]"));
    assert.ok(!redacted.includes("MIIEow"));
  }

  // Ordinary prose must survive: over-redaction destroys evidence.
  assert.equal(redact("Basic authentication is required"), "Basic authentication is required");
  assert.equal(
    redact("Token 12345678901234 records processed"),
    "Token 12345678901234 records processed",
  );
});

test("redactedExcerpt caps length and redacts before truncating", () => {
  // The secret straddles the truncation boundary: redaction must happen first
  // or half of it would survive in the excerpt.
  const text = `${"x".repeat(140)} sk-abcdefghijklmnopqrstuvwxyz012345 ${"y".repeat(400)}`;
  const excerpt = redactedExcerpt(text, 150);
  assert.ok(!excerpt.includes("sk-abcdefghijklmnop"));
  assert.ok(excerpt.startsWith("x".repeat(100)));
  assert.ok(excerpt.includes("[truncated"));
  assert.equal(clip("short", 100), "short");
  // The cap is a byte budget, so multi-byte text must not blow past it.
  assert.ok(Buffer.byteLength(excerpt, "utf8") <= 150);
  const wide = redactedExcerpt("漢".repeat(500), 300);
  assert.ok(Buffer.byteLength(wide, "utf8") <= 300);
});

test("helpers behave sensibly on edges", () => {
  assert.equal(approxTokens(0), 0);
  assert.equal(approxTokens(9), 3);
  assert.equal(normalizePath(""), null);
  assert.deepEqual(extractIdentifiers("plain words only here"), []);
  assert.ok(extractIdentifiers("see synthetic/alpha.md now").includes("synthetic/alpha.md".split("/")[1]));
});

test("discover selects the parent by first record and attaches its subagent", async () => {
  const out = makeTempDir();
  const { discovery } = await discover(new Map([
    ["provider", "claude"],
    ["repos", "T--synthetic-repo"],
    ["from", FIXTURE_DAY],
    ["to", FIXTURE_DAY],
    ["out", out],
    ["projects-root", fixturesRoot],
  ]));

  assert.equal(discovery.totals.parentSessions, 1);
  assert.equal(discovery.totals.subagentSessions, 1);
  assert.equal(discovery.totals.malformedLines, 1);

  const parent = discovery.sessions.find((entry) => entry.role === "parent");
  assert.equal(parent.sessionId, SESSION_ID);
  assert.equal(parent.firstTimestamp, "2020-01-01T10:00:00.000Z");
  assert.equal(parent.lastTimestamp, "2020-01-01T10:21:20.000Z");
  assert.deepEqual(parent.gitBranches, ["main"]);
  assert.deepEqual(parent.harnessVersions, ["0.0.1-synthetic"]);
  assert.deepEqual(parent.models, ["synthetic-model-1"]);

  const subagent = discovery.sessions.find((entry) => entry.role === "subagent");
  assert.equal(subagent.parentSessionId, SESSION_ID);
  assert.equal(subagent.agentType, "Explore");
  assert.equal(subagent.spawnToolUseId, "toolu_synth_0008");
  assert.equal(subagent.agentId, "synth0001");

  assert.ok(JSON.parse(readFileSync(path.join(out, "discovery.json"), "utf8")));
});

test("discover excludes sessions outside the window and reports missing projects", async () => {
  const out = makeTempDir();
  const { discovery } = await discover(new Map([
    ["provider", "claude"],
    ["repos", "T--synthetic-repo,T--not-a-real-project"],
    ["from", "2019-12-01"],
    ["to", "2019-12-31"],
    ["out", out],
    ["projects-root", fixturesRoot],
  ]));
  assert.equal(discovery.totals.parentSessions, 0);
  assert.equal(discovery.totals.subagentSessions, 0);
  assert.ok(discovery.warnings.some((warning) => warning.includes("T--not-a-real-project")));
});

test("discover rejects unimplemented providers and inverted windows", async () => {
  const out = makeTempDir();
  const base = new Map([
    ["provider", "claude"],
    ["repos", "T--synthetic-repo"],
    ["from", FIXTURE_DAY],
    ["to", FIXTURE_DAY],
    ["out", out],
    ["projects-root", fixturesRoot],
  ]);
  await assert.rejects(
    () => discover(new Map([...base, ["provider", "codex"]])),
    UsageError,
  );
  await assert.rejects(
    () => discover(new Map([...base, ["from", "2021-01-01"], ["to", "2020-01-01"]])),
    UsageError,
  );
});

async function reduceFixture() {
  const out = makeTempDir();
  await discover(new Map([
    ["provider", "claude"],
    ["repos", "T--synthetic-repo"],
    ["from", FIXTURE_DAY],
    ["to", FIXTURE_DAY],
    ["out", out],
    ["projects-root", fixturesRoot],
  ]));
  const summary = await reduce(new Map([
    ["discovery", path.join(out, "discovery.json")],
    ["out", out],
    ["max-packets-per-signal", "5"],
    ["long-gap-ms", "300000"],
    ["long-tool-ms", "10000"],
  ]));
  const metrics = JSON.parse(readFileSync(
    path.join(out, "sessions", `${SESSION_ID}.metrics.json`),
    "utf8",
  ));
  return { out, summary, metrics };
}

test("reduce accounts for time and matches tool calls to results by id", async () => {
  const { metrics } = await reduceFixture();
  const time = metrics.parent.time;

  assert.equal(time.sessionSpanMs, 1280000);
  assert.equal(time.operatorTurns, 2);
  // The ~17-minute idle before the second prompt is operator wait, not model
  // latency; the 1s before the first prompt is operator wait too.
  assert.equal(time.operatorWaitMs, 1000 + 1018000);
  assert.equal(time.activeSpanMs, 1280000 - 1019000);
  // Delegation wait is kept out of local tool execution so the subagent's own
  // span is not counted twice.
  assert.equal(time.delegationWaitMs, 120000);
  // The compaction summary is an injected user record, so the interval before
  // it is background wait rather than model latency.
  assert.equal(time.backgroundWaitMs, 54000);
  const bucketTotal = time.operatorWaitMs + time.backgroundWaitMs + time.modelLatencyMs
    + time.toolExecutionMs + time.delegationWaitMs + time.unclassifiedMs;
  assert.equal(bucketTotal, time.sessionSpanMs);

  assert.equal(metrics.parent.tools.totalCalls, 11);
  assert.equal(metrics.parent.tools.unmatchedResults, 0);
  assert.equal(metrics.parent.tools.unresolvedCalls, 0);

  const slowest = time.longestToolCalls[0];
  assert.equal(slowest.toolName, "Agent");
  assert.equal(slowest.durationMs, 120000);
  assert.equal(slowest.delegated, true);
  const slowestLocal = time.longestToolCalls.find((call) => !call.delegated);
  assert.equal(slowestLocal.toolName, "Bash");
  assert.equal(slowestLocal.durationMs, 23000);
  assert.ok(slowestLocal.preview.length <= 100);

  assert.equal(metrics.parent.malformedLines, 1);
});

test("reduce detects repeated reads, repeated commands, retries and compaction re-reads", async () => {
  const { metrics } = await reduceFixture();
  const waste = metrics.parent.waste;

  const repeated = waste.repeatedReads[0];
  assert.ok(repeated.path.endsWith("alpha.md"));
  // alpha.md is read at 10:00:03, 10:00:36 (repeat), then edited, then read
  // again post-compaction (repeat after the edit is a fresh read, so the
  // second post-edit re-read is the one that counts).
  assert.equal(repeated.repeats, 1);

  const command = waste.repeatedCommands.find((entry) => entry.toolName === "Bash");
  assert.ok(command.count >= 2);

  assert.equal(waste.failures.failedCalls, 1);
  assert.equal(waste.failures.retryChains.length, 1);
  assert.equal(waste.failures.retryChains[0].resolved, true);

  assert.equal(waste.postCompactionRereads.length, 1);
  assert.equal(waste.postCompactionRereads[0].rereadAfter, 1);

  assert.equal(waste.cache.cacheMissStretches.length, 1);
  assert.equal(waste.cache.cacheMissStretches[0].turns, 3);
  assert.ok(waste.cache.cacheHitRatio > 0 && waste.cache.cacheHitRatio < 1);
});

test("reduce reports rework, context composition and delegation overlap", async () => {
  const { metrics } = await reduceFixture();

  const churn = metrics.parent.rework.editChurn;
  assert.equal(churn.length, 1);
  assert.equal(churn[0].turnClusters, 2);
  assert.equal(churn[0].edits, 2);

  const context = metrics.parent.context;
  assert.ok(context.approxTokens.toolResults > 0);
  assert.ok(context.approxTokens.toolResultFraction > 0);
  assert.ok(context.readBytes.rereadBytes > 0);
  assert.equal(context.readBytes.distinctFilesRead, 1);
  assert.ok(context.crossCheck.peakEffectiveContextTokens > 0);
  const unused = context.largestToolOutputs.find((entry) => entry.toolName === "Grep");
  assert.equal(unused.referencedLater, false);

  assert.equal(metrics.subagents.length, 1);
  const subagent = metrics.subagents[0];
  assert.equal(subagent.agentType, "Explore");
  assert.equal(subagent.spawnedAt, "2020-01-01T10:01:00.000Z");
  assert.equal(subagent.totals.toolCalls, 2);
  assert.equal(subagent.overlapWithParent.overlappingFiles.length, 1);
  assert.ok(subagent.overlapWithParent.overlappingFiles[0].endsWith("alpha.md"));

  // Subagent wall clock sits inside the parent's delegation wait, so it is
  // reported beside the parent's span rather than added to it.
  assert.equal(metrics.combined.wallClockMs, metrics.parent.time.sessionSpanMs);
  assert.equal(
    metrics.combined.toolCalls,
    metrics.combined.parentToolCalls + metrics.combined.subagentToolCalls,
  );
  assert.equal(metrics.combined.subagentToolCalls, 2);
});

test("reduce writes bounded, redacted evidence packets and a consistent summary", async () => {
  const { out, summary, metrics } = await reduceFixture();
  const evidenceDir = path.join(out, "evidence", SESSION_ID);
  const files = readdirSync(evidenceDir);
  assert.ok(files.length > 0);

  const types = new Set();
  for (const name of files) {
    const raw = readFileSync(path.join(evidenceDir, name), "utf8");
    const packet = JSON.parse(raw);
    types.add(packet.signalType);
    assert.equal(packet.sessionId, SESSION_ID);
    assert.ok(typeof packet.summary === "string" && packet.summary.length > 0);
    for (const evidence of packet.evidence ?? []) {
      if (!evidence?.excerpt) continue;
      assert.ok(evidence.excerpt.length <= 4096 + 64);
      assert.equal(typeof evidence.byteOffset, "number");
    }
    // No fixture secret may survive into a packet.
    assert.ok(!raw.includes("sk-syntheticAAAA"), `secret leaked into ${name}`);
  }
  for (const expected of ["repeated-read", "retry-chain", "post-compaction-reread", "edit-churn"]) {
    assert.ok(types.has(expected), `missing signal type: ${expected}`);
  }

  assert.equal(summary.totals.parentSessions, 1);
  assert.equal(summary.totals.malformedLines, 1);
  assert.equal(summary.totals.evidencePackets, files.length);
  assert.equal(summary.sessions[0].sessionId, SESSION_ID);
  assert.equal(summary.sessions[0].toolCalls, metrics.parent.tools.totalCalls);
  assert.equal(summary.sessions[0].subagentCount, metrics.subagents.length);
  assert.equal(
    summary.sessions[0].time.sessionSpanMs,
    metrics.parent.time.sessionSpanMs,
  );
  // The corpus total includes delegated work; the parent-only figure is kept
  // beside it so neither can be mistaken for the other.
  assert.equal(summary.totals.parentToolCalls, metrics.parent.tools.totalCalls);
  assert.equal(
    summary.totals.toolCalls,
    metrics.parent.tools.totalCalls + metrics.combined.subagentToolCalls,
  );
  assert.deepEqual(summary.byRepo["T--synthetic-repo"].sessions, 1);
});

test("evidence offsets point back at the original transcript lines", async () => {
  const { out } = await reduceFixture();
  const evidenceDir = path.join(out, "evidence", SESSION_ID);
  for (const name of readdirSync(evidenceDir)) {
    const packet = JSON.parse(readFileSync(path.join(evidenceDir, name), "utf8"));
    for (const evidence of packet.evidence ?? []) {
      if (!evidence?.byteOffset && evidence?.byteOffset !== 0) continue;
      // A packet may cite more than one transcript (a delegation overlap quotes
      // the parent's read and the subagent's), so each evidence entry names the
      // file its offset belongs to.
      const file = evidence.file ?? packet.sourceFile;
      const raw = readLineAt(file, evidence.byteOffset, evidence.byteLength);
      assert.equal(raw.startsWith("{"), true);
      assert.doesNotThrow(() => JSON.parse(raw));
    }
  }
});

test("reduce rejects a missing discovery inventory", async () => {
  const out = makeTempDir();
  await assert.rejects(
    () => reduce(new Map([
      ["discovery", path.join(out, "nope.json")],
      ["out", out],
      ["max-packets-per-signal", "5"],
      ["long-gap-ms", "300000"],
      ["long-tool-ms", "60000"],
    ])),
    UsageError,
  );
});

test("reduce survives replayed records, split responses and out-of-order clocks", async () => {
  const out = makeTempDir();
  const quirkDay = localDateKey(Date.parse("2020-02-02T12:00:00.000Z"));
  await discover(new Map([
    ["provider", "claude"],
    ["repos", "T--synthetic-quirks"],
    ["from", quirkDay],
    ["to", quirkDay],
    ["out", out],
    ["projects-root", fixturesRoot],
  ]));
  await reduce(new Map([
    ["discovery", path.join(out, "discovery.json")],
    ["out", out],
    ["max-packets-per-signal", "5"],
    ["long-gap-ms", "300000"],
    ["long-tool-ms", "60000"],
  ]));
  const metrics = JSON.parse(readFileSync(
    path.join(out, "sessions", "22222222-2222-4222-8222-222222222222.metrics.json"),
    "utf8",
  ));

  // A replayed record carries the uuid it already had and must not be counted.
  assert.equal(metrics.parent.integrity.duplicateRecordsSkipped, 1);
  assert.equal(metrics.parent.integrity.backwardTimestamps, 1);

  // One API response is written as several assistant records sharing a
  // requestId and repeating one usage object; usage is counted per response.
  assert.equal(metrics.parent.context.crossCheck.assistantTurns, 5);
  assert.deepEqual(metrics.parent.context.reportedUsage, {
    inputTokens: 28,
    cacheCreationTokens: 1000,
    cacheReadTokens: 26000,
    outputTokens: 22,
  });

  const time = metrics.parent.time;
  assert.equal(time.sessionSpanMs, 140000);
  // AskUserQuestion blocks on the human: that is operator wait, not tool time.
  assert.equal(time.operatorToolWaitMs, 120000);
  assert.equal(time.toolExecutionMs, 5000);
  assert.equal(time.modelLatencyMs, 15000);
  assert.equal(time.activeSpanMs, 140000 - 120000);
  const bucketTotal = time.operatorWaitMs + time.operatorToolWaitMs + time.backgroundWaitMs
    + time.modelLatencyMs + time.toolExecutionMs + time.delegationWaitMs + time.unclassifiedMs;
  assert.equal(bucketTotal, time.sessionSpanMs);
});

test("reduce reconciles a transcript whose earliest record is not its first", async () => {
  const out = makeTempDir();
  const day = localDateKey(Date.parse("2020-03-03T13:00:00.000Z"));
  await discover(new Map([
    ["provider", "claude"],
    ["repos", "T--synthetic-resumed"],
    ["from", day],
    ["to", day],
    ["out", out],
    ["projects-root", fixturesRoot],
  ]));
  await reduce(new Map([
    ["discovery", path.join(out, "discovery.json")],
    ["out", out],
    ["max-packets-per-signal", "5"],
    ["long-gap-ms", "300000"],
    ["long-tool-ms", "60000"],
  ]));
  const metrics = JSON.parse(readFileSync(
    path.join(out, "sessions", "33333333-3333-4333-8333-333333333333.metrics.json"),
    "utf8",
  ));
  const time = metrics.parent.time;

  // Span is max minus min across the whole file, not last minus first.
  assert.equal(time.sessionSpanMs, 1810000);
  assert.equal(metrics.parent.integrity.backwardTimestamps, 1);
  // The cursor anchors on the first record in file order, so the replayed
  // prefix ahead of it is real elapsed time that no bucket can claim. It must
  // land in `unclassified` rather than vanish.
  assert.equal(time.unclassifiedMs, 1800000);
  assert.equal(time.modelLatencyMs, 10000);
  const bucketTotal = time.operatorWaitMs + time.operatorToolWaitMs + time.backgroundWaitMs
    + time.modelLatencyMs + time.toolExecutionMs + time.delegationWaitMs + time.unclassifiedMs;
  assert.equal(bucketTotal, time.sessionSpanMs);
});

test("reduce and correlate reject a structurally invalid discovery inventory", async () => {
  const out = makeTempDir();
  for (const body of ['{"hello":"world"}', '{"sessions":42,"window":{}}', "[1,2,3]", "{"]) {
    const file = path.join(out, "bad-discovery.json");
    writeFileSync(file, body, "utf8");
    const options = new Map([
      ["discovery", file],
      ["out", out],
      ["max-packets-per-signal", "5"],
      ["long-gap-ms", "300000"],
      ["long-tool-ms", "60000"],
      ["trailing-days", "1"],
    ]);
    await assert.rejects(() => reduce(options), UsageError, `reduce accepted: ${body}`);
    assert.throws(() => correlate(options), UsageError, `correlate accepted: ${body}`);
  }
});

test("correlate degrades gracefully when the repository and board are missing", async () => {
  const out = makeTempDir();
  await discover(new Map([
    ["provider", "claude"],
    ["repos", "T--synthetic-repo"],
    ["from", FIXTURE_DAY],
    ["to", FIXTURE_DAY],
    ["out", out],
    ["projects-root", fixturesRoot],
  ]));
  const { correlation } = correlate(new Map([
    ["discovery", path.join(out, "discovery.json")],
    ["out", out],
    ["trailing-days", "1"],
  ]));
  assert.equal(correlation.repos.length, 1);
  const repo = correlation.repos[0];
  assert.equal(repo.git.available, false);
  assert.equal(repo.board.available, false);
  assert.ok(typeof repo.git.reason === "string" && repo.git.reason.length > 0);
  assert.equal(correlation.sessions.length, 1);
  assert.equal(correlation.sessions[0].sessionId, SESSION_ID);
  assert.deepEqual(correlation.sessions[0].commitsDuringSession, []);
  assert.ok(JSON.parse(readFileSync(path.join(out, "correlation.json"), "utf8")));
});

// ---------------------------------------------------------------------------
// Redaction edges
// ---------------------------------------------------------------------------

test("redact catches a PGP private key block", () => {
  const newline = String.fromCharCode(10);
  // PGP's header does not end in "PRIVATE KEY-----", so a pattern anchored on
  // that adjacency missed it entirely.
  const block = [
    "-----BEGIN PGP PRIVATE KEY BLOCK-----",
    "Version: SyntheticFixture 1",
    "",
    "lQOYBGSyntheticKeyMaterialForTestsOnly0123456789",
    "-----END PGP PRIVATE KEY BLOCK-----",
  ].join(newline);
  for (const context of [block, `${newline}${block}`, `read: ${block}`]) {
    const redacted = redact(context);
    assert.ok(redacted.includes("[REDACTED:private-key]"));
    assert.ok(!redacted.includes("lQOYBG"));
  }
  // The plain forms must keep working.
  assert.ok(redact([
    "-----BEGIN OPENSSH PRIVATE KEY-----",
    "b3BlbnNzaC1rZXktdjEsynthetic",
    "-----END OPENSSH PRIVATE KEY-----",
  ].join(newline)).includes("[REDACTED:private-key]"));
});

test("redact leaves SQL and prose ALL_CAPS assignments alone", () => {
  // Over-redaction destroys evidence. None of these are secrets and a blanket
  // NAME=value rule mangled every one of them.
  const innocuous = [
    "WHERE ORDER_ID=12345678",
    "SET BATCH_SIZE=10000000",
    "AND CUSTOMER_NUMBER=00998877",
    "filter STATUS_CODE=PROCESSING_COMPLETE",
    "LIMIT MAX_ROWS=250000000",
    // Secret-ish NAMES whose values cannot be secrets: flags, and settings that
    // say where a secret lives rather than being one.
    "OAUTH_ENABLED=true",
    "IS_PRIVATE=false",
    "TOKEN_TTL=3600",
    "PUBLIC_KEY_PATH=/etc/ssl/pub.pem",
    "SECRET_FILE=/run/secrets/db",
    "AUTH_TYPE=oauth2",
  ];
  for (const text of innocuous) {
    assert.equal(redact(text), text, `over-redacted: ${text}`);
  }
  // Real secrets in the same shape must still go.
  for (const secret of [
    "GITHUB_TOKEN=abc123def456ghi789",
    "MY_API_KEY=0123456789abcdef",
    "SIGNING_PASSPHRASE=correct-horse-battery",
    // Neutral name, but key-shaped value: long, mixed case, digits.
    "SERVICE_HANDLE=a9Fk2LmQ8xZr4Tn6Wp",
    // Guards that excuse a value must never excuse a credential. Each of these
    // slipped through an earlier, looser version of the guards:
    //
    // an unbounded numeric allowance let any all-digit secret pass,
    "DB_PASSWORD=98765432",
    "ADMIN_PASSWORD=1234567890",
    "API_KEY=00000000",
    // and excusing url/uri/name-suffixed names let through the case where the
    // URL itself is the credential.
    "SECRET_URL=https://hooks.slack.com/services/T00000/B00000/XyZsecretTokenValue",
    "SESSION_TOKEN_NAME=abcdef123456xyz",
  ]) {
    const redacted = redact(secret);
    assert.ok(redacted.includes("[REDACTED"), `not redacted: ${secret}`);
    assert.ok(!redacted.includes(secret.split("=")[1]), `value survived: ${secret}`);
  }
  // The same hole in JSON shape.
  const jsonSecret = redact('"api_key_name": "live_abcdef123456"');
  assert.ok(jsonSecret.includes("[REDACTED"));
  assert.ok(!jsonSecret.includes("live_abcdef123456"));
});

// ---------------------------------------------------------------------------
// Harness echoes are not operator turns
// ---------------------------------------------------------------------------

test("harness echoes are not operator turns, but slash commands still are", () => {
  const asRecord = (text) => ({
    type: "user",
    message: { role: "user", content: [{ type: "text", text }] },
  });

  // Harness output replayed into the conversation. Not a human turn.
  for (const text of [
    "<local-command-stdout>On branch main</local-command-stdout>",
    "<local-command-stderr>fatal: not a git repository</local-command-stderr>",
  ]) {
    const record = asRecord(text);
    assert.equal(isHarnessEcho(record), true, `not detected: ${text.slice(0, 30)}`);
    assert.equal(isOperatorPrompt(record), false, `counted as a turn: ${text.slice(0, 30)}`);
    // Even when the harness stamps the record as human-origin.
    assert.equal(isOperatorPrompt({ ...record, origin: { kind: "human" } }), false);
  }

  // A slash-command envelope is formatted by the harness but TYPED by the
  // human, arguments and all. Excluding it undercounts operator turns and
  // moves genuine operator wait into background wait.
  for (const text of [
    "<command-message>attack-the-board is running…</command-message>"
      + "<command-name>/attack-the-board</command-name>"
      + "<command-args>start with 718</command-args>",
    "<command-name>/plan-milestone</command-name><command-args>M3</command-args>",
  ]) {
    const record = asRecord(text);
    assert.equal(isHarnessEcho(record), false, `misread as harness echo: ${text.slice(0, 40)}`);
    assert.equal(isOperatorPrompt(record), true, `dropped a human turn: ${text.slice(0, 40)}`);
    assert.equal(isSlashCommandPrompt(record), true);
  }

  const human = asRecord("please run the tests");
  assert.equal(isHarnessEcho(human), false);
  assert.equal(isSlashCommandPrompt(human), false);
  assert.equal(isOperatorPrompt(human), true);
});

test("reduce books a harness echo as background wait but a slash command as an operator turn", async () => {
  const projectsRoot = makeTempDir();
  const sessionId = "55555555-5555-4555-8555-555555555555";
  const day = localDateKey(Date.parse(at(0)));
  const echoRecord = (seconds, text) => ({
    type: "user",
    uuid: nextUuid(),
    sessionId,
    version: BUILDER_VERSION,
    timestamp: at(seconds),
    message: { role: "user", content: [{ type: "text", text }] },
  });

  writeTranscript(
    path.join(projectsRoot, "T--echo-repo", `${sessionId}.jsonl`),
    [
      userPrompt(sessionId, 0, "start"),
      assistantTurn(sessionId, 10, { text: "working" }),
      // 100s later the harness echoes command output back. Counting this as a
      // human turn would inflate the turn count and charge those 100 seconds to
      // the operator.
      echoRecord(110, "<local-command-stdout>On branch main</local-command-stdout>"),
      assistantTurn(sessionId, 120, { text: "resumed" }),
      // 200s later the human types a slash command. That gap IS operator wait
      // and that record IS a turn.
      echoRecord(
        320,
        "<command-message>attack-the-board is running…</command-message>"
        + "<command-name>/attack-the-board</command-name>"
        + "<command-args>start with 718</command-args>",
      ),
      assistantTurn(sessionId, 330, { text: "on it" }),
    ],
  );

  const { metrics } = await runPipeline("T--echo-repo", [sessionId], projectsRoot, day);
  const time = metrics[sessionId].parent.time;
  assert.equal(time.operatorTurns, 2);
  assert.equal(time.slashCommandTurns, 1);
  assert.equal(time.backgroundWaitMs, 100000);
  assert.equal(time.operatorWaitMs, 200000);
  const bucketTotal = time.operatorWaitMs + time.operatorToolWaitMs + time.backgroundWaitMs
    + time.modelLatencyMs + time.toolExecutionMs + time.delegationWaitMs + time.unclassifiedMs;
  assert.equal(bucketTotal, time.sessionSpanMs);
});

// ---------------------------------------------------------------------------
// Pagination is not re-reading
// ---------------------------------------------------------------------------

test("readRangeOf and readRangesOverlap separate paging from re-reading", () => {
  assert.deepEqual(readRangeOf("Read", {}), { start: 1, end: Infinity, whole: true });
  assert.deepEqual(readRangeOf("Read", { offset: 200, limit: 100 }), {
    start: 200,
    end: 300,
    whole: false,
  });
  assert.equal(readRangeOf("Bash", { command: "ls" }), null);

  const first = readRangeOf("Read", { offset: 1, limit: 100 });
  const disjoint = readRangeOf("Read", { offset: 200, limit: 100 });
  const overlapping = readRangeOf("Read", { offset: 50, limit: 100 });
  const whole = readRangeOf("Read", {});
  assert.equal(readRangesOverlap(first, disjoint), false);
  assert.equal(readRangesOverlap(first, overlapping), true);
  assert.equal(readRangesOverlap(first, whole), true);
  // An unknown range is treated as the whole file: conservative, so a read the
  // adapter cannot parse is never silently excused.
  assert.equal(readRangesOverlap(null, disjoint), true);

  // Adjoining pages that share a line or two are paging with a little context,
  // not a re-read. Real overlap still counts.
  const page = readRangeOf("Read", { offset: 440, limit: 80 });
  const nextPageWithContext = readRangeOf("Read", { offset: 416, limit: 26 });
  assert.equal(readRangesOverlap(page, nextPageWithContext), false);
  assert.equal(readRangesOverlap(page, readRangeOf("Read", { offset: 400, limit: 60 })), true);
  // But a read with no limit runs to the end of the file, so it pulls in
  // everything the other read did however small the nominal intersection.
  assert.equal(readRangesOverlap(page, readRangeOf("Read", { offset: 519 })), true);
  // The tolerance is capped by the shorter range, so identical or nested reads
  // always count. A flat `overlap >= 5` called two identical three-line reads
  // disjoint and filed them as paging.
  const tiny = readRangeOf("Read", { offset: 100, limit: 3 });
  assert.equal(readRangesOverlap(tiny, tiny), true);
  assert.equal(readRangesOverlap(readRangeOf("Read", { offset: 1, limit: 500 }), tiny), true);
  assert.equal(
    readRangesOverlap(readRangeOf("Read", { limit: 3 }), readRangeOf("Read", { limit: 3 })),
    true,
  );
});

test("reduce reports paged reads separately from repeated reads, with every offset", async () => {
  const projectsRoot = makeTempDir();
  const sessionId = "66666666-6666-4666-8666-666666666666";
  const day = localDateKey(Date.parse(at(0)));
  const paged = "T:\\synthetic\\paged.ts";
  const reread = "T:\\synthetic\\reread.ts";
  const read = (id, file, input, second) => ([
    assistantTurn(sessionId, second, {
      toolUses: [{ id, name: "Read", input: { file_path: file, ...input } }],
    }),
    toolResult(sessionId, second + 1, id, `contents of ${file}`),
  ]);

  writeTranscript(
    path.join(projectsRoot, "T--paged-repo", `${sessionId}.jsonl`),
    [
      userPrompt(sessionId, 0, "start"),
      // Three disjoint windows of one file: paging, not waste.
      ...read("toolu_p1", paged, { offset: 1, limit: 100 }, 10),
      ...read("toolu_p2", paged, { offset: 200, limit: 100 }, 20),
      ...read("toolu_p3", paged, { offset: 400, limit: 100 }, 30),
      // The same file pulled in whole three times: waste.
      ...read("toolu_r1", reread, {}, 40),
      ...read("toolu_r2", reread, {}, 50),
      ...read("toolu_r3", reread, {}, 60),
    ],
  );

  const { out, metrics } = await runPipeline("T--paged-repo", [sessionId], projectsRoot, day);
  const waste = metrics[sessionId].parent.waste;

  assert.equal(waste.repeatedReadClusterCount, 1);
  assert.equal(waste.paginatedReadClusterCount, 1);
  assert.ok(waste.repeatedReads[0].path.endsWith("reread.ts"));
  assert.ok(waste.paginatedReads[0].path.endsWith("paged.ts"));

  // N reads claimed, N offsets shipped -- including the first read, which the
  // detector used to omit because it only recorded repeat events.
  const repeatedPacket = packetsIn(out, sessionId).find(
    (packet) => packet.signalType === "repeated-read",
  );
  assert.equal(repeatedPacket.readCount, 3);
  assert.equal(repeatedPacket.sourceLines.length, 3);
  assert.equal(repeatedPacket.timestamps.length, 3);
  assert.ok(repeatedPacket.summary.includes("3 times"));
  for (const line of repeatedPacket.sourceLines) {
    const raw = readLineAt(repeatedPacket.sourceFile, line.byteOffset, line.byteLength);
    assert.equal(JSON.parse(raw).type, "assistant");
  }

  const pagedPacket = packetsIn(out, sessionId).find(
    (packet) => packet.signalType === "paginated-read",
  );
  assert.equal(pagedPacket.readCount, 3);
  assert.equal(pagedPacket.sourceLines.length, 3);
  assert.deepEqual(pagedPacket.ranges.map((range) => range.startLine), [1, 200, 400]);
  // The paged reads must not also appear as waste.
  assert.ok(!waste.repeatedReads.some((cluster) => cluster.path.endsWith("paged.ts")));
});

// ---------------------------------------------------------------------------
// Delegation: background and synchronous modes
// ---------------------------------------------------------------------------

test("reduce distinguishes background from synchronous delegation and never folds subagent time into the parent", async () => {
  const projectsRoot = makeTempDir();
  const sessionId = "77777777-7777-4777-8777-777777777777";
  const day = localDateKey(Date.parse(at(0)));
  const projectDir = path.join(projectsRoot, "T--delegation-repo");
  const shared = "T:\\synthetic\\shared.ts";

  writeTranscript(path.join(projectDir, `${sessionId}.jsonl`), [
    userPrompt(sessionId, 0, "investigate"),
    // The parent reads a file before delegating; both subagents read it again.
    assistantTurn(sessionId, 5, {
      toolUses: [{ id: "toolu_read", name: "Read", input: { file_path: shared } }],
    }),
    toolResult(sessionId, 6, "toolu_read", "shared contents"),
    // Synchronous: the Agent call blocks for the whole subagent span.
    assistantTurn(sessionId, 10, {
      toolUses: [{ id: "toolu_sync", name: "Agent", input: { description: "sync probe" } }],
    }),
    toolResult(sessionId, 190, "toolu_sync", "sync subagent finished"),
    // Background: the Agent call returns at launch and the subagent keeps
    // working while the parent moves on.
    assistantTurn(sessionId, 200, {
      toolUses: [{ id: "toolu_bg", name: "Agent", input: { description: "background probe" } }],
    }),
    toolResult(sessionId, 202, "toolu_bg", "background subagent launched"),
    assistantTurn(sessionId, 900, { text: "done" }),
  ]);

  const subagentDir = path.join(projectDir, sessionId, "subagents");
  const subagentTranscript = (subSessionId, startSecond, endSecond) => ([
    { ...userPrompt(subSessionId, startSecond, "probe"), isSidechain: true, agentId: subSessionId },
    {
      ...assistantTurn(subSessionId, startSecond + 1, {
        toolUses: [{ id: `${subSessionId}-read`, name: "Read", input: { file_path: shared } }],
      }),
      isSidechain: true,
    },
    { ...toolResult(subSessionId, startSecond + 2, `${subSessionId}-read`, "shared contents"), isSidechain: true },
    { ...assistantTurn(subSessionId, endSecond, { text: "report" }), isSidechain: true },
  ]);
  // The synchronous subagent itself spawns a nested one. Its Agent call lives
  // in a SIBLING transcript, not the parent's, which is what used to leave the
  // nested subagent's whole span classified as "unknown".
  writeTranscript(path.join(subagentDir, "agent-sync01.jsonl"), [
    ...subagentTranscript("agent-sync01", 12, 188),
    {
      ...assistantTurn("agent-sync01", 100, {
        toolUses: [{ id: "toolu_nested", name: "Agent", input: { description: "nested probe" } }],
      }),
      isSidechain: true,
    },
    { ...toolResult("agent-sync01", 102, "toolu_nested", "nested launched"), isSidechain: true },
  ]);
  writeFileSync(
    path.join(subagentDir, "agent-sync01.meta.json"),
    JSON.stringify({ agentType: "Explore", toolUseId: "toolu_sync", description: "sync probe" }),
    "utf8",
  );
  writeTranscript(path.join(subagentDir, "agent-bg0001.jsonl"), subagentTranscript("agent-bg0001", 201, 801));
  writeFileSync(
    path.join(subagentDir, "agent-bg0001.meta.json"),
    JSON.stringify({ agentType: "general-purpose", toolUseId: "toolu_bg", description: "background probe" }),
    "utf8",
  );
  writeTranscript(
    path.join(subagentDir, "agent-nest01.jsonl"),
    // Reads a file nobody else read, so it adds no delegation overlap.
    [
      { ...userPrompt("agent-nest01", 101, "nested probe"), isSidechain: true },
      {
        ...assistantTurn("agent-nest01", 120, {
          toolUses: [{
            id: "agent-nest01-read",
            name: "Read",
            input: { file_path: "T:\\synthetic\\nested-only.ts" },
          }],
        }),
        isSidechain: true,
      },
      {
        ...toolResult("agent-nest01", 150, "agent-nest01-read", "nested contents"),
        isSidechain: true,
      },
    ],
  );
  writeFileSync(
    path.join(subagentDir, "agent-nest01.meta.json"),
    JSON.stringify({
      agentType: "Explore",
      toolUseId: "toolu_nested",
      description: "nested probe",
      spawnDepth: 2,
    }),
    "utf8",
  );

  const { out, summary, metrics } = await runPipeline(
    "T--delegation-repo",
    [sessionId],
    projectsRoot,
    day,
  );
  const session = metrics[sessionId];

  const sync = session.delegation.perSubagent.find(
    (entry) => entry.subagentId === "agent-sync01",
  );
  const background = session.delegation.perSubagent.find(
    (entry) => entry.subagentId === "agent-bg0001",
  );
  const nested = session.delegation.perSubagent.find(
    (entry) => entry.subagentId === "agent-nest01",
  );
  assert.equal(sync.mode, "synchronous");
  assert.equal(sync.subagentSpanMs, 176000);
  assert.equal(sync.delegationCallMs, 180000);
  assert.equal(sync.uncoveredMs, 0);

  assert.equal(background.mode, "background");
  assert.equal(background.subagentSpanMs, 600000);
  assert.equal(background.delegationCallMs, 2000);
  // The heart of the fix: 598 seconds of real subagent work that the parent's
  // delegation wait does not cover and no parent bucket contains.
  assert.equal(background.uncoveredMs, 598000);

  // The nested subagent's spawn call is in a sibling transcript. It must still
  // resolve, and it must be attributed to the subagent that launched it rather
  // than to the parent.
  assert.equal(nested.spawnedByRole, "subagent");
  assert.equal(nested.mode, "background");
  assert.equal(nested.delegationCallMs, 2000);
  assert.equal(nested.subagentSpanMs, 49000);
  assert.equal(sync.spawnedByRole, "parent");
  assert.equal(background.spawnedByRole, "parent");
  assert.ok(!Object.keys(session.delegation.modes).includes("unknown"));

  assert.equal(session.delegation.delegationWaitMs, 182000);
  assert.equal(session.delegation.subagentSpanMs, 776000 + 49000);
  // The sum double counts: the nested subagent runs inside its spawner's span.
  // The union is the honest delegated wall clock.
  assert.ok(session.delegation.subagentSpanUnionMs < session.delegation.subagentSpanMs);
  assert.deepEqual(session.delegation.modes, { synchronous: 1, background: 2 });

  // Subagent span is never added to the parent's wall clock.
  assert.equal(session.combined.wallClockMs, session.parent.time.sessionSpanMs);
  assert.ok(session.delegation.subagentSpanMs > session.delegation.delegationWaitMs);

  // The notes must say what delegation wait measures, and must not claim it
  // covers the subagent's span.
  const notes = session.notes.join(" ");
  assert.ok(notes.includes("NOT the subagent's working time"));
  assert.ok(!notes.includes("covers the same interval"));

  // Delegation-overlap packets carry both sides' offsets and timestamps.
  const overlapPackets = packetsIn(out, sessionId)
    .filter((packet) => packet.signalType === "delegation-overlap");
  assert.equal(overlapPackets.length, 2);
  for (const packet of overlapPackets) {
    assert.ok(packet.sourceLines.length > 0, "delegation-overlap shipped without offsets");
    assert.ok(packet.evidence.length > 0, "delegation-overlap shipped without evidence");
    assert.equal(packet.sourceLines.length, packet.timestamps.length);
    assert.deepEqual(
      [...new Set(packet.sourceLines.map((line) => line.role))].sort(),
      ["parent", "subagent"],
    );
    for (const line of packet.sourceLines) {
      assert.equal(typeof line.file, "string");
      const raw = readLineAt(line.file, line.byteOffset, line.byteLength);
      assert.doesNotThrow(() => JSON.parse(raw));
    }
    for (const entry of packet.evidence) {
      assert.equal(typeof entry.file, "string");
      assert.doesNotThrow(
        () => JSON.parse(readLineAt(entry.file, entry.byteOffset, entry.byteLength)),
      );
    }
    assert.ok(["synchronous", "background"].includes(packet.delegationMode));
  }

  assert.deepEqual(summary.totals.delegation.modes, { synchronous: 1, background: 2 });
  // 598s from the background subagent plus 47s from the nested one.
  assert.equal(summary.totals.delegation.uncoveredSubagentMs, 645000);
  assert.equal(session.delegation.uncoveredSubagentMs, 645000);
});

// ---------------------------------------------------------------------------
// Excerpt redaction
// ---------------------------------------------------------------------------

test("the referencedBy excerpt is redacted like every other excerpt", async () => {
  const projectsRoot = makeTempDir();
  const sessionId = "88888888-8888-4888-8888-888888888888";
  const day = localDateKey(Date.parse(at(0)));
  const secret = "sk-syntheticAAAABBBBCCCCDDDDEEEE1234";

  writeTranscript(
    path.join(projectsRoot, "T--referenced-repo", `${sessionId}.jsonl`),
    [
      userPrompt(sessionId, 0, "start"),
      assistantTurn(sessionId, 5, {
        toolUses: [{
          id: "toolu_grep",
          name: "Grep",
          input: { pattern: "handler", path: "T:\\synthetic" },
        }],
      }),
      // A large output whose identifiers a later turn will reuse.
      toolResult(
        sessionId,
        6,
        "toolu_grep",
        `${"synthetic_handler.ts:1:match\n".repeat(200)}`,
      ),
      // The later turn that references it carries a secret. Clipping without
      // redacting shipped that secret into sessions/*.metrics.json.
      assistantTurn(sessionId, 10, {
        text: `Using synthetic_handler.ts with token ${secret} to authenticate.`,
      }),
    ],
  );

  const { out, metrics } = await runPipeline(
    "T--referenced-repo",
    [sessionId],
    projectsRoot,
    day,
  );
  const outputs = metrics[sessionId].parent.context.largestToolOutputs;
  const referenced = outputs.find((entry) => entry.referencedLater);
  assert.ok(referenced, "the reference proxy did not fire");
  assert.ok(referenced.referencedBy.includes("[REDACTED"));
  assert.ok(!referenced.referencedBy.includes(secret));

  // And nothing anywhere in the run directory leaks it.
  const raw = readFileSync(
    path.join(out, "sessions", `${sessionId}.metrics.json`),
    "utf8",
  );
  assert.ok(!raw.includes(secret), "secret survived into the metrics file");
});

// ---------------------------------------------------------------------------
// Concurrency: the honest denominator
// ---------------------------------------------------------------------------

test("interval helpers union overlapping spans and bucket gaps", () => {
  assert.deepEqual(
    unionIntervals([
      { startMs: 0, endMs: 100 },
      { startMs: 50, endMs: 150 },
      { startMs: 400, endMs: 500 },
    ]),
    [{ startMs: 0, endMs: 150 }, { startMs: 400, endMs: 500 }],
  );
  // Summing gives 250; the union is the honest 150 + 100.
  assert.equal(unionDurationMs([
    { startMs: 0, endMs: 100 },
    { startMs: 50, endMs: 150 },
    { startMs: 400, endMs: 500 },
  ]), 250);
  assert.equal(unionDurationMs([]), 0);
  // Degenerate and malformed intervals contribute nothing rather than throwing.
  assert.equal(unionDurationMs([{ startMs: 10, endMs: 10 }, { startMs: 5, endMs: 1 }]), 0);

  const histogram = gapHistogram([1000, 120000, 700000, 2000000, 7200000, 50000000]);
  assert.deepEqual(histogram.map((bucket) => bucket.count), [1, 1, 1, 1, 1, 1]);
  assert.deepEqual(histogram.map((bucket) => bucket.label), [
    "<1m", "1-5m", "5-15m", "15-60m", "1-4h", ">4h",
  ]);
  assert.equal(histogram[5].totalMs, 50000000);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(median([]), null);
});

test("summary reports the calendar window and unioned operator wait for overlapping sessions", async () => {
  const projectsRoot = makeTempDir();
  const day = localDateKey(Date.parse(at(0)));
  const first = "99999999-9999-4999-8999-999999999991";
  const second = "99999999-9999-4999-8999-999999999992";

  // Two sessions that overlap almost entirely and idle through the same
  // 10-minute operator absence. Summing charges that absence twice.
  for (const sessionId of [first, second]) {
    writeTranscript(
      path.join(projectsRoot, "T--concurrent-repo", `${sessionId}.jsonl`),
      [
        userPrompt(sessionId, 0, "start"),
        assistantTurn(sessionId, 10, { text: "waiting on you" }),
        userPrompt(sessionId, 610, "carry on"),
        assistantTurn(sessionId, 620, { text: "done" }),
      ],
    );
  }

  const { summary } = await runPipeline(
    "T--concurrent-repo",
    [first, second],
    projectsRoot,
    day,
  );
  const concurrency = summary.concurrency;

  assert.equal(concurrency.sessions, 2);
  assert.equal(concurrency.concurrentSessionsObserved, 2);
  // Summed spans are 2x the calendar window the work actually occupied.
  assert.equal(concurrency.sessionSpan.sumMs, 1240000);
  assert.equal(concurrency.sessionSpan.calendarWindowMs, 620000);
  assert.equal(concurrency.sessionSpan.unionMs, 620000);
  assert.equal(concurrency.sessionSpan.overcountFactor, 2);

  // Each session records a 600s wait over the same wall-clock interval.
  assert.equal(concurrency.operatorWait.sumMs, 1200000);
  assert.equal(concurrency.operatorWait.unionMs, 600000);
  assert.equal(concurrency.operatorWait.overcountFactor, 2);
  assert.equal(concurrency.operatorWait.gapCount, 2);
  assert.equal(concurrency.operatorWait.medianGapMs, 600000);

  const bucket = concurrency.operatorWait.gapHistogram.find((entry) => entry.label === "5-15m");
  assert.equal(bucket.count, 2);
  assert.equal(bucket.hours, 0.33);
  assert.ok(concurrency.caveats.some((note) => note.includes("SUMS across sessions")));

  // The summed totals are still present -- but no longer alone.
  assert.equal(summary.totals.operatorWaitMs, concurrency.operatorWait.sumMs);
});

// ---------------------------------------------------------------------------
// Totals are split parent / subagent / combined
// ---------------------------------------------------------------------------

test("summary totals and byRepo separate parent, subagent and combined figures", async () => {
  const { summary, metrics } = await reduceFixture();
  const session = summary.sessions[0];
  const usage = summary.totals.reportedUsage;

  for (const view of ["parent", "subagents", "combined"]) {
    assert.ok(usage[view], `missing usage view: ${view}`);
  }
  assert.equal(
    usage.combined.cacheReadTokens,
    usage.parent.cacheReadTokens + usage.subagents.cacheReadTokens,
  );
  assert.equal(usage.parent.cacheReadTokens, metrics.parent.context.reportedUsage.cacheReadTokens);
  assert.ok(usage.subagents.cacheReadTokens > 0, "fixture subagent contributes no usage");

  assert.equal(
    summary.totals.failedToolCalls,
    summary.totals.parentFailedToolCalls + summary.totals.subagentFailedToolCalls,
  );
  assert.equal(summary.totals.parentFailedToolCalls, metrics.parent.waste.failures.failedCalls);

  const repo = summary.byRepo["T--synthetic-repo"];
  assert.equal(repo.parentToolCalls, session.toolCalls);
  assert.equal(repo.subagentToolCalls, session.subagentToolCalls);
  assert.equal(repo.toolCalls, repo.parentToolCalls + repo.subagentToolCalls);
  assert.equal(repo.toolCalls, summary.totals.toolCalls);
  assert.equal(repo.failedToolCalls, repo.parentFailedToolCalls + repo.subagentFailedToolCalls);

  // Both reduction ratios are reported, and the model-visible one is the
  // smaller (honest) figure.
  assert.ok(summary.totals.evidenceReductionRatio > 0);
  assert.ok(summary.totals.modelVisibleReductionRatio > 0);
  assert.ok(summary.totals.modelVisibleReductionRatio <= summary.totals.evidenceReductionRatio);
  assert.equal(summary.totals.reductionRatio, undefined);
});

test("packets flag excerpts that are predominantly verbatim file content", async () => {
  const projectsRoot = makeTempDir();
  const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const day = localDateKey(Date.parse(at(0)));
  const proprietary = `${"export const SECRET_BUSINESS_RULE = compute(margin, tier);\n".repeat(60)}`;

  writeTranscript(
    path.join(projectsRoot, "T--verbatim-repo", `${sessionId}.jsonl`),
    [
      userPrompt(sessionId, 0, "start"),
      // A failed Edit whose error echoes the file back verbatim, then a retry.
      // The packet cites the failing tool_result, so its excerpt really is
      // mostly file content.
      assistantTurn(sessionId, 10, {
        toolUses: [{
          id: "toolu_edit1",
          name: "Edit",
          input: { file_path: "T:\\synthetic\\pricing.ts", old_string: "a", new_string: "b" },
        }],
      }),
      {
        ...toolResult(
          sessionId,
          11,
          "toolu_edit1",
          `String to replace not found. File contents:\n${proprietary}`,
        ),
        toolUseResult: { isError: true },
      },
      assistantTurn(sessionId, 20, {
        toolUses: [{
          id: "toolu_edit2",
          name: "Edit",
          input: { file_path: "T:\\synthetic\\pricing.ts", old_string: "a", new_string: "b" },
        }],
      }),
      toolResult(sessionId, 21, "toolu_edit2", "ok"),
    ],
  );

  const { out } = await runPipeline("T--verbatim-repo", [sessionId], projectsRoot, day);
  const packets = packetsIn(out, sessionId);
  assert.ok(packets.length > 0);

  // Every packet carries the flag, whatever its signal type: a report writer
  // keying on `=== false` must never get `undefined`.
  for (const packet of packets) {
    assert.equal(
      typeof packet.containsVerbatimSource,
      "boolean",
      `${packet.signalType} shipped without containsVerbatimSource`,
    );
  }

  // The retry-chain packet cites the failing tool_result, whose excerpt is
  // overwhelmingly file content. Deriving the flag from the signal's tool name
  // left exactly this case unflagged.
  const retry = packets.find((packet) => packet.signalType === "retry-chain");
  assert.ok(retry, "no retry-chain packet was produced");
  assert.equal(retry.containsVerbatimSource, true);
  assert.ok(retry.evidence.some((entry) => entry.resultTextBytes > 0));

  // And the flag discriminates: a packet whose evidence is a tool_use record
  // carries no file content and must be false.
  const { out: fixtureOut } = await reduceFixture();
  const readPacket = packetsIn(fixtureOut, SESSION_ID)
    .find((packet) => packet.signalType === "repeated-read");
  assert.equal(readPacket.containsVerbatimSource, false);
});

test("a cache-miss-stretch packet ships offsets and evidence like every other signal", async () => {
  const projectsRoot = makeTempDir();
  const sessionId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const day = localDateKey(Date.parse(at(0)));
  // Four consecutive responses that create cache and read none. This signal
  // used to ship with `sourceLines: []` and `evidence: []` -- the same defect
  // delegation-overlap had -- and no run happened to contain one, so nothing
  // caught it. The packet shape is asserted here, not just the detector count.
  const miss = (seconds) => assistantTurn(sessionId, seconds, {
    text: `turn at ${seconds}`,
    usage: {
      input_tokens: 5,
      cache_creation_input_tokens: 2000,
      cache_read_input_tokens: 0,
      output_tokens: 5,
    },
  });

  writeTranscript(
    path.join(projectsRoot, "T--cachemiss-repo", `${sessionId}.jsonl`),
    [
      userPrompt(sessionId, 0, "start"),
      miss(10),
      miss(20),
      miss(30),
      miss(40),
      assistantTurn(sessionId, 50, {
        text: "cache warm again",
        usage: {
          input_tokens: 5,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 8000,
          output_tokens: 5,
        },
      }),
    ],
  );

  const { out, metrics } = await runPipeline(
    "T--cachemiss-repo",
    [sessionId],
    projectsRoot,
    day,
  );
  const stretches = metrics[sessionId].parent.waste.cache.cacheMissStretches;
  assert.equal(stretches.length, 1);
  assert.equal(stretches[0].turns, 4);

  const packet = packetsIn(out, sessionId)
    .find((entry) => entry.signalType === "cache-miss-stretch");
  assert.ok(packet, "no cache-miss-stretch packet was produced");
  assert.equal(packet.sourceLines.length, 4);
  assert.equal(packet.timestamps.length, 4);
  assert.ok(packet.evidence.length > 0);
  assert.equal(typeof packet.containsVerbatimSource, "boolean");
  // Every offset must re-open the record it claims, and the record's own
  // timestamp must be the one the packet paired with it.
  for (const [index, line] of packet.sourceLines.entries()) {
    const raw = readLineAt(packet.sourceFile, line.byteOffset, line.byteLength);
    const record = JSON.parse(raw);
    assert.equal(record.type, "assistant");
    assert.equal(record.timestamp, packet.timestamps[index]);
  }
});

// ---------------------------------------------------------------------------
// Run-directory safety and --help
// ---------------------------------------------------------------------------

test("a run directory inside the repository is refused unless it is already gitignored", () => {
  const repoRoot = process.platform === "win32" ? "X:\\repo" : "/repo";
  assert.throws(
    () => assertRunDirOutsideRepo(path.join(repoRoot, "audit-output"), repoRoot),
    UsageError,
  );
  assert.throws(
    () => assertRunDirOutsideRepo(path.join(repoRoot, "docs", "run"), repoRoot),
    UsageError,
  );
  // The two names .gitignore already covers are allowed.
  assert.ok(assertRunDirOutsideRepo(path.join(repoRoot, "session-audit-out"), repoRoot));
  assert.ok(assertRunDirOutsideRepo(path.join(repoRoot, "run-001.session-audit-run"), repoRoot));
  // Anywhere outside the repository is fine, as is "no repository found".
  assert.ok(assertRunDirOutsideRepo(tmpdir(), repoRoot));
  assert.ok(assertRunDirOutsideRepo(tmpdir(), null));
});

test("every CLI answers --help without an error exit", () => {
  assert.equal(wantsHelp(["--help"]), true);
  assert.equal(wantsHelp(["-h"]), true);
  assert.equal(wantsHelp(["--out", "x"]), false);
  for (const script of ["discover.mjs", "reduce.mjs", "correlate.mjs"]) {
    const result = spawnSync(process.execPath, [path.join(here, script), "--help"], {
      encoding: "utf8",
      windowsHide: true,
    });
    assert.equal(result.status, 0, `${script} --help exited ${result.status}`);
    assert.ok(result.stdout.includes("Usage:"), `${script} --help printed no usage`);
  }
});

test("correlate parses task frontmatter and log entries inside the window", async () => {
  const out = makeTempDir();
  const repoRoot = mkdtempSync(path.join(tmpdir(), "session-audit-repo-"));
  test.after(() => rmSync(repoRoot, { recursive: true, force: true }));
  const tasksDir = path.join(repoRoot, ".tasks", "tasks");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(tasksDir, { recursive: true });
  writeFileSync(path.join(tasksDir, "task-001-synthetic.md"), [
    "---",
    "id: task-001",
    'title: "Synthetic task"',
    "status: done",
    "priority: p1",
    'updatedAt: "2020-01-01T10:10:00Z"',
    "---",
    "",
    "## Log",
    "",
    "- 2020-01-01T10:05:00Z — moved to in_progress",
    "- 2020-01-01T10:10:00Z — moved to done (note: synthetic)",
    "- 2019-06-01T10:10:00Z — created (outside the window)",
    "",
  ].join("\n"), "utf8");

  const discoveryPath = path.join(out, "discovery.json");
  writeFileSync(discoveryPath, JSON.stringify({
    provider: "claude",
    window: { from: FIXTURE_DAY, to: FIXTURE_DAY },
    sessions: [{
      role: "parent",
      sessionId: SESSION_ID,
      repo: repoRoot,
      firstTimestamp: "2020-01-01T10:00:00.000Z",
      lastTimestamp: "2020-01-01T10:21:20.000Z",
      gitBranches: ["main"],
    }],
  }), "utf8");

  const { correlation } = correlate(new Map([
    ["discovery", discoveryPath],
    ["out", out],
    ["trailing-days", "1"],
  ]));
  const tasks = correlation.tasks[repoRoot];
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].id, "task-001");
  assert.equal(tasks[0].title, "Synthetic task");
  assert.equal(tasks[0].events.length, 2);
  assert.equal(correlation.sessions[0].taskEventsDuringSession.length, 2);
});
