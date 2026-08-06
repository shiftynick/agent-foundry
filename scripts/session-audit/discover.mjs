#!/usr/bin/env node

// Selects the Claude Code sessions an audit run covers and writes an inventory.
//
//   node scripts/session-audit/discover.mjs \
//     --provider claude --repos N:\repo-a,N:\repo-b \
//     --from 2026-08-05 --to 2026-08-05 --out <dir>
//
// Selection rule: a parent session is in scope when its FIRST timestamped
// record falls inside the operator-local date window. File mtime is not
// trusted, because a resumed session carries a later mtime than its start.
// Subagent transcripts are attached to their parent and are never selected as
// independent sessions.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PROVIDER_CLAUDE,
  UsageError,
  assertDateKey,
  assertRunDirOutsideRepo,
  defaultProjectsRoot,
  ensureProvider,
  isSidechainRecord,
  localDateKey,
  modelOf,
  parseOptions,
  projectDirNameFor,
  repoRootFor,
  streamRecords,
  timestampMs,
  wantsHelp,
} from "./_lib.mjs";

const USAGE = `Usage: node scripts/session-audit/discover.mjs --repos <a,b> --from <date> --to <date> --out <dir>

Selects the Claude Code sessions an audit run covers and writes discovery.json.
A parent session is in scope when its FIRST timestamped record falls inside the
operator-local date window; subagent transcripts are attached to their parent.

  --provider <name>      only "claude" is implemented (default claude)
  --repos <a,b>          comma-separated repository paths or encoded project dirs (required)
  --from <YYYY-MM-DD>    first operator-local day in the window (required)
  --to <YYYY-MM-DD>      last operator-local day in the window (required)
  --out <dir>            run directory to write into (required)
  --projects-root <dir>  override the Claude projects root
  --help                 show this message

Original session files are never modified. The run directory must live outside
this repository, or be named so the repository's .gitignore already covers it.`;

const optionDefinitions = new Map([
  ["provider", { default: PROVIDER_CLAUDE }],
  ["repos", { required: true }],
  ["from", { required: true }],
  ["to", { required: true }],
  ["out", { required: true }],
  ["projects-root", {}],
]);

// Reads only the head of a candidate file: enough to learn when it started and
// whether it is a sidechain, without paying for a full scan of a file that the
// window will reject anyway.
async function readHead(filePath) {
  const head = {
    firstTimestamp: null,
    firstTimestampMs: null,
    sessionId: null,
    isSidechain: false,
    version: null,
    cwd: null,
    gitBranch: null,
  };
  let inspected = 0;
  for await (const entry of streamRecords(filePath)) {
    if (entry.malformed) {
      inspected += 1;
      if (inspected > 200) break;
      continue;
    }
    const record = entry.record;
    head.sessionId ??= typeof record.sessionId === "string" ? record.sessionId : null;
    head.version ??= typeof record.version === "string" ? record.version : null;
    head.cwd ??= typeof record.cwd === "string" ? record.cwd : null;
    head.gitBranch ??= typeof record.gitBranch === "string" ? record.gitBranch : null;
    if (isSidechainRecord(record)) {
      head.isSidechain = true;
    }
    const ms = timestampMs(record);
    if (ms !== null && head.firstTimestampMs === null) {
      head.firstTimestamp = record.timestamp;
      head.firstTimestampMs = ms;
    }
    inspected += 1;
    // The first timestamp settles selection; a few more records only fill in
    // identity fields that early bookkeeping records omit.
    if (head.firstTimestampMs !== null && head.sessionId && head.version) {
      break;
    }
    if (inspected > 200) {
      break;
    }
  }
  return head;
}

// Full streaming scan of a selected transcript for inventory facts.
async function scanTranscript(filePath) {
  const scan = {
    lineCount: 0,
    malformedLines: 0,
    firstTimestamp: null,
    lastTimestamp: null,
    firstMs: null,
    lastMs: null,
    sessionIds: new Set(),
    models: new Set(),
    versions: new Set(),
    gitBranches: new Set(),
    cwds: new Set(),
    agentIds: new Set(),
    recordTypes: {},
    sidechainRecords: 0,
  };

  for await (const entry of streamRecords(filePath)) {
    scan.lineCount += 1;
    if (entry.malformed) {
      scan.malformedLines += 1;
      continue;
    }
    const record = entry.record;
    const type = typeof record.type === "string" ? record.type : "(none)";
    scan.recordTypes[type] = (scan.recordTypes[type] ?? 0) + 1;
    if (typeof record.sessionId === "string") scan.sessionIds.add(record.sessionId);
    if (typeof record.version === "string") scan.versions.add(record.version);
    if (typeof record.gitBranch === "string") scan.gitBranches.add(record.gitBranch);
    if (typeof record.cwd === "string") scan.cwds.add(record.cwd);
    if (typeof record.agentId === "string") scan.agentIds.add(record.agentId);
    if (isSidechainRecord(record)) scan.sidechainRecords += 1;
    const model = modelOf(record);
    if (model) scan.models.add(model);
    const ms = timestampMs(record);
    if (ms !== null) {
      // Transcript timestamps are not sorted, so these track the extremes
      // rather than the first and last records seen.
      if (scan.firstMs === null || ms < scan.firstMs) {
        scan.firstMs = ms;
        scan.firstTimestamp = record.timestamp;
      }
      if (scan.lastMs === null || ms > scan.lastMs) {
        scan.lastMs = ms;
        scan.lastTimestamp = record.timestamp;
      }
    }
  }

  return scan;
}

function inventoryFrom(scan, extra) {
  return {
    ...extra,
    firstTimestamp: scan.firstTimestamp,
    lastTimestamp: scan.lastTimestamp,
    lineCount: scan.lineCount,
    malformedLines: scan.malformedLines,
    recordTypes: scan.recordTypes,
    sidechainRecords: scan.sidechainRecords,
    sessionIds: [...scan.sessionIds],
    models: [...scan.models],
    harnessVersions: [...scan.versions],
    gitBranches: [...scan.gitBranches],
    cwds: [...scan.cwds],
    agentIds: [...scan.agentIds],
  };
}

function readSubagentMeta(metaPath) {
  if (!existsSync(metaPath)) {
    return {};
  }
  try {
    const parsed = JSON.parse(readFileSync(metaPath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function discover(options) {
  const provider = ensureProvider(options.get("provider"));
  const from = assertDateKey(options.get("from"), "--from");
  const to = assertDateKey(options.get("to"), "--to");
  if (from > to) {
    throw new UsageError("--from must not be later than --to.");
  }
  const outDir = assertRunDirOutsideRepo(
    options.get("out"),
    repoRootFor(path.dirname(fileURLToPath(import.meta.url)), existsSync),
  );
  const projectsRoot = path.resolve(options.get("projects-root") ?? defaultProjectsRoot());
  const repoArguments = options.get("repos")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
  if (repoArguments.length === 0) {
    throw new UsageError("--repos must name at least one repository.");
  }

  const warnings = [];
  const repos = [];
  const sessions = [];

  for (const repoArgument of repoArguments) {
    const projectDirName = projectDirNameFor(repoArgument);
    const projectDir = path.join(projectsRoot, projectDirName);
    const repoRecord = {
      repo: repoArgument,
      projectDirName,
      projectDir,
      exists: existsSync(projectDir),
      parentSessions: 0,
      subagentSessions: 0,
      totalBytes: 0,
    };
    repos.push(repoRecord);
    if (!repoRecord.exists) {
      warnings.push(`No Claude project directory for ${repoArgument} at ${projectDir}`);
      continue;
    }

    const candidates = readdirSync(projectDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".jsonl"))
      .map((entry) => path.join(projectDir, entry.name))
      .sort();

    const selected = [];
    const strayingSidechains = [];
    for (const filePath of candidates) {
      const head = await readHead(filePath);
      if (head.firstTimestampMs === null) {
        warnings.push(`Skipped (no timestamped record): ${filePath}`);
        continue;
      }
      const dayKey = localDateKey(head.firstTimestampMs);
      if (dayKey < from || dayKey > to) {
        continue;
      }
      if (head.isSidechain) {
        // A sidechain transcript stored at the top level belongs to a parent,
        // not to the window on its own.
        strayingSidechains.push({ filePath, head });
        continue;
      }
      selected.push({ filePath, head });
    }

    for (const { filePath, head } of selected) {
      const scan = await scanTranscript(filePath);
      const sessionId = head.sessionId
        ?? scan.sessionIds.values().next().value
        ?? path.basename(filePath, ".jsonl");
      const stats = statSync(filePath);
      const byteSize = stats.size;
      const scannedFirstMs = Date.parse(scan.firstTimestamp ?? "");
      if (Number.isFinite(scannedFirstMs)
        && localDateKey(scannedFirstMs) !== localDateKey(head.firstTimestampMs)) {
        warnings.push(
          `Selection day differs from earliest record for ${filePath}: selected on `
          + `${localDateKey(head.firstTimestampMs)} (first record in file order), earliest `
          + `record is ${scan.firstTimestamp}.`,
        );
      }
      repoRecord.parentSessions += 1;
      repoRecord.totalBytes += byteSize;
      sessions.push(inventoryFrom(scan, {
        provider,
        role: "parent",
        sessionId,
        parentSessionId: null,
        agentId: null,
        agentType: null,
        description: null,
        spawnToolUseId: null,
        repo: repoArgument,
        projectDirName,
        file: filePath,
        byteSize,
        mtimeMs: stats.mtimeMs,
        // The day the window was applied to, taken from the first record in
        // file order. `firstTimestamp` is the earliest timestamp anywhere in
        // the file, which differs when a resumed transcript replays a prefix.
        selectionTimestamp: head.firstTimestamp,
        selectedByDay: localDateKey(head.firstTimestampMs),
      }));

      // Subagents live in "<projectDir>/<parent session id>/subagents".
      const subagentDir = path.join(projectDir, sessionId, "subagents");
      if (!existsSync(subagentDir)) {
        continue;
      }
      const subagentFiles = readdirSync(subagentDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".jsonl"))
        .map((entry) => path.join(subagentDir, entry.name))
        .sort();
      for (const subagentFile of subagentFiles) {
        const subScan = await scanTranscript(subagentFile);
        const meta = readSubagentMeta(
          path.join(subagentDir, `${path.basename(subagentFile, ".jsonl")}.meta.json`),
        );
        const linkedSessionIds = [...subScan.sessionIds];
        if (linkedSessionIds.length > 0 && !linkedSessionIds.includes(sessionId)) {
          warnings.push(
            `Subagent ${subagentFile} records session ${linkedSessionIds.join("/")} `
            + `but is stored under parent ${sessionId}; attached by directory.`,
          );
        }
        const subStats = statSync(subagentFile);
        const byteSizeSub = subStats.size;
        repoRecord.subagentSessions += 1;
        repoRecord.totalBytes += byteSizeSub;
        sessions.push(inventoryFrom(subScan, {
          provider,
          role: "subagent",
          sessionId: path.basename(subagentFile, ".jsonl"),
          parentSessionId: sessionId,
          agentId: [...subScan.agentIds][0] ?? null,
          agentType: typeof meta.agentType === "string" ? meta.agentType : null,
          description: typeof meta.description === "string" ? meta.description : null,
          spawnToolUseId: typeof meta.toolUseId === "string" ? meta.toolUseId : null,
          spawnDepth: typeof meta.spawnDepth === "number" ? meta.spawnDepth : null,
          repo: repoArgument,
          projectDirName,
          file: subagentFile,
          byteSize: byteSizeSub,
          mtimeMs: subStats.mtimeMs,
          selectedByDay: null,
        }));
      }
    }

    const selectedIds = new Set(
      sessions.filter((entry) => entry.role === "parent" && entry.repo === repoArgument)
        .map((entry) => entry.sessionId),
    );
    for (const { filePath, head } of strayingSidechains) {
      if (head.sessionId && selectedIds.has(head.sessionId)) {
        const subScan = await scanTranscript(filePath);
        const strayStats = statSync(filePath);
        const byteSizeSub = strayStats.size;
        repoRecord.subagentSessions += 1;
        repoRecord.totalBytes += byteSizeSub;
        sessions.push(inventoryFrom(subScan, {
          provider,
          role: "subagent",
          sessionId: path.basename(filePath, ".jsonl"),
          parentSessionId: head.sessionId,
          agentId: [...subScan.agentIds][0] ?? null,
          agentType: null,
          description: null,
          spawnToolUseId: null,
          repo: repoArgument,
          projectDirName,
          file: filePath,
          byteSize: byteSizeSub,
          mtimeMs: strayStats.mtimeMs,
          selectedByDay: null,
        }));
      } else {
        warnings.push(
          `Sidechain transcript ${filePath} has no selected parent in this window; ignored.`,
        );
      }
    }
  }

  const discovery = {
    generatedAt: new Date().toISOString(),
    provider,
    window: {
      from,
      to,
      // The offset that applied on the window's own days, not today's: an
      // August window audited in December would otherwise be annotated with
      // the wrong offset.
      timezoneOffsetMinutes: -windowOffsetMinutes(from),
      interpretation: "operator-local calendar days, applied to each session's first timestamped record",
    },
    projectsRoot,
    repos,
    sessions,
    warnings,
    totals: {
      parentSessions: sessions.filter((entry) => entry.role === "parent").length,
      subagentSessions: sessions.filter((entry) => entry.role === "subagent").length,
      corpusBytes: sessions.reduce((total, entry) => total + entry.byteSize, 0),
      corpusLines: sessions.reduce((total, entry) => total + entry.lineCount, 0),
      malformedLines: sessions.reduce((total, entry) => total + entry.malformedLines, 0),
    },
  };

  if (repos.every((repo) => !repo.exists)) {
    // Every named repository resolved to nothing: that is an operator typo,
    // not an empty window, and writing an inventory a later stage would happily
    // consume would hide it.
    throw new UsageError(
      "No named repository resolved to a Claude project directory; nothing was audited:"
      + repos.map((repo) => `\n  ${repo.repo} -> ${repo.projectDir}`).join(""),
    );
  }

  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "discovery.json");
  writeFileSync(outFile, `${JSON.stringify(discovery, null, 2)}\n`, "utf8");
  return { discovery, outFile };
}

// The UTC offset in effect at midday on the window's first day.
function windowOffsetMinutes(from) {
  const [year, month, day] = from.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(year, month - 1, day, 12, 0, 0, 0).getTimezoneOffset();
}

async function main() {
  if (wantsHelp(process.argv.slice(2))) {
    console.log(USAGE);
    return;
  }
  try {
    const options = parseOptions(process.argv.slice(2), optionDefinitions);
    const { discovery, outFile } = await discover(options);
    console.log(`Discovered ${discovery.totals.parentSessions} parent session(s) and `
      + `${discovery.totals.subagentSessions} subagent transcript(s).`);
    for (const repo of discovery.repos) {
      console.log(`  ${repo.repo}: ${repo.parentSessions} parent, `
        + `${repo.subagentSessions} subagent, `
        + `${(repo.totalBytes / 1024 / 1024).toFixed(2)} MB`);
    }
    for (const warning of discovery.warnings) {
      console.log(`  warning: ${warning}`);
    }
    console.log(`Wrote ${outFile}`);
    if (discovery.totals.parentSessions === 0) {
      console.log("  note: no parent session started inside the window.");
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
