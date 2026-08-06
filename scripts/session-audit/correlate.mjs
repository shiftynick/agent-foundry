#!/usr/bin/env node

// Joins discovered sessions to repository ground truth: Git commits and task
// board transitions.
//
//   node scripts/session-audit/correlate.mjs --discovery <dir>/discovery.json --out <dir>
//
// Transcript metrics alone cannot establish speed or quality: a slow stretch
// that shipped a validated task is not a finding, and a fast stretch whose
// commit needed a fixup the next morning is. Everything here is read-only with
// respect to the repositories, and a missing repository or board degrades to a
// recorded reason rather than a failure.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  UsageError,
  assertRunDirOutsideRepo,
  parseOptions,
  readDiscovery,
  repoRootFor,
  wantsHelp,
} from "./_lib.mjs";

const USAGE = `Usage: node scripts/session-audit/correlate.mjs --discovery <file> --out <dir>

Joins the discovered sessions to repository ground truth: Git commits and task
board transitions. Repositories are read only; a missing repository or board is
recorded as a reason rather than failing the run.

  --discovery <file>    discovery.json written by discover.mjs (required)
  --out <dir>           run directory to write into (required)
  --trailing-days <n>   extra days after the window to look for fixups (default 1)
  --help                show this message

The run directory must live outside this repository, or be named so the
repository's .gitignore already covers it.`;

const optionDefinitions = new Map([
  ["discovery", { required: true }],
  ["out", { required: true }],
  ["trailing-days", { default: "1" }],
]);

// Control characters are emitted by git via %xNN escapes, so the argument
// itself stays printable: spawn rejects arguments containing NUL.
const COMMIT_SEPARATOR = String.fromCharCode(0x1e);
const COMMIT_SEPARATOR_FORMAT = "%x1e";
const FIELD_SEPARATOR = String.fromCharCode(0x1f);
const FIELD_SEPARATOR_FORMAT = "%x1f";

// git is the only subprocess this tooling runs, and only with read-only
// plumbing arguments.
//
// Deliberately not `scripts/foundry-lib.mjs`'s `run()`: that helper throws a
// CommandError on any non-zero exit, and correlation's contract is the exact
// opposite -- a repository without Git, or one where `git log` fails, must
// degrade to a recorded reason so the rest of the run still produces output.
// Adapting it would mean try/catch around every call plus unwrapping the error
// to recover stderr, which is more code than the wrapper it replaced.
function git(repo, args) {
  const result = spawnSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    timeout: 120000,
    windowsHide: true,
  });
  if (result.error) {
    return { ok: false, reason: result.error.message, stdout: "" };
  }
  if (result.status !== 0) {
    return { ok: false, reason: (result.stderr || "").trim() || `git exited ${result.status}`, stdout: "" };
  }
  return { ok: true, stdout: result.stdout ?? "" };
}

function dayStart(dateKey) {
  const [year, month, day] = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function dayEnd(dateKey, trailingDays) {
  const [year, month, day] = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(year, month - 1, day + 1 + trailingDays, 0, 0, 0, 0);
}

function collectCommits(repo, since, until) {
  const format = [
    "%H", "%aI", "%cI", "%an", "%s", "%D",
  ].join(FIELD_SEPARATOR_FORMAT);
  const log = git(repo, [
    "log",
    "--all",
    "--no-merges",
    `--since=${since.toISOString()}`,
    `--until=${until.toISOString()}`,
    `--pretty=format:${COMMIT_SEPARATOR_FORMAT}${format}`,
    "--name-only",
  ]);
  if (!log.ok) {
    return { ok: false, reason: log.reason, commits: [] };
  }
  const commits = [];
  for (const chunk of log.stdout.split(COMMIT_SEPARATOR)) {
    if (chunk.trim() === "") continue;
    const [header, ...rest] = chunk.split("\n");
    const [sha, authoredAt, committedAt, author, subject, refs] = header.split(FIELD_SEPARATOR);
    const files = rest.map((line) => line.trim()).filter((line) => line !== "");
    commits.push({
      sha,
      shortSha: sha.slice(0, 12),
      authoredAt,
      committedAt,
      author,
      subject,
      refs: (refs ?? "").split(",").map((entry) => entry.trim()).filter(Boolean),
      files,
      branches: [],
    });
  }
  // Branch membership by walking each branch once rather than running
  // `git branch --contains` per commit: the number of branches is small and
  // bounded, the number of commits in a busy window is not.
  const branchList = git(repo, ["for-each-ref", "--format=%(refname:short)", "refs/heads"]);
  if (branchList.ok) {
    const wanted = new Map(commits.map((commit) => [commit.sha, commit]));
    for (const branch of branchList.stdout.split("\n").map((line) => line.trim()).filter(Boolean)) {
      const reachable = git(repo, [
        "log",
        `--since=${since.toISOString()}`,
        `--until=${until.toISOString()}`,
        "--pretty=format:%H",
        branch,
      ]);
      if (!reachable.ok) continue;
      for (const sha of reachable.stdout.split("\n").map((line) => line.trim()).filter(Boolean)) {
        wanted.get(sha)?.branches.push(branch);
      }
    }
  }
  return { ok: true, commits };
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) {
    return {};
  }
  const end = text.indexOf("\n---", 3);
  if (end === -1) {
    return {};
  }
  const fields = {};
  for (const line of text.slice(3, end).split(/\r?\n/u)) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/u);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fields[match[1]] = value;
  }
  return fields;
}

// Task log lines look like: `- 2026-08-05T12:00:00Z — moved to review (note: ...)`
function parseLogEntries(text) {
  const entries = [];
  const logStart = text.search(/^##\s+Log\s*$/mu);
  const body = logStart === -1 ? text : text.slice(logStart);
  for (const line of body.split(/\r?\n/u)) {
    const match = line.match(
      /^[-*]\s*(\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)\s*[—-]\s*(.*)$/u,
    );
    if (!match) continue;
    entries.push({ at: match[1], text: match[2].trim() });
  }
  return entries;
}

function collectBoard(repo, since, until) {
  const roots = [
    path.join(repo, ".tasks", "tasks"),
    path.join(repo, ".tasks", "archive"),
  ].filter((dir) => existsSync(dir));
  if (roots.length === 0) {
    return { ok: false, reason: "no .tasks/tasks or .tasks/archive directory", tasks: [] };
  }
  const tasks = [];
  for (const root of roots) {
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      let text;
      try {
        text = readFileSync(path.join(root, entry.name), "utf8");
      } catch {
        continue;
      }
      const fields = parseFrontmatter(text);
      const events = parseLogEntries(text).filter((event) => {
        const ms = Date.parse(event.at);
        return Number.isFinite(ms) && ms >= since.getTime() && ms < until.getTime();
      });
      if (events.length === 0) continue;
      tasks.push({
        id: fields.id ?? path.basename(entry.name, ".md"),
        title: fields.title ?? null,
        status: fields.status ?? null,
        priority: fields.priority ?? null,
        updatedAt: fields.updatedAt ?? null,
        source: path.relative(repo, path.join(root, entry.name)).replaceAll("\\", "/"),
        events,
      });
    }
  }
  tasks.sort((left, right) => (left.id < right.id ? -1 : 1));
  return { ok: true, tasks };
}

export function correlate(options) {
  const discoveryPath = path.resolve(options.get("discovery"));
  if (!existsSync(discoveryPath)) {
    throw new UsageError(`Discovery inventory not found: ${discoveryPath}`);
  }
  const discovery = readDiscovery(discoveryPath, readFileSync);
  const outDir = assertRunDirOutsideRepo(
    options.get("out"),
    repoRootFor(path.dirname(fileURLToPath(import.meta.url)), existsSync),
  );
  const trailingDays = Number.parseInt(options.get("trailing-days"), 10);
  if (!Number.isFinite(trailingDays) || trailingDays < 0) {
    throw new UsageError("--trailing-days must be a non-negative integer.");
  }

  const since = dayStart(discovery.window.from);
  const until = dayEnd(discovery.window.to, trailingDays);

  const repoNames = [...new Set(discovery.sessions.map((entry) => entry.repo))];
  const repos = [];
  const commitsByRepo = new Map();
  const tasksByRepo = new Map();

  for (const repoName of repoNames) {
    const repoPath = path.resolve(repoName);
    const record = {
      repo: repoName,
      repoPath,
      exists: existsSync(repoPath),
      git: { available: false, reason: null, commitCount: 0 },
      board: { available: false, reason: null, taskCount: 0 },
    };
    if (!record.exists) {
      record.git.reason = "repository path does not exist";
      record.board.reason = "repository path does not exist";
      repos.push(record);
      commitsByRepo.set(repoName, []);
      tasksByRepo.set(repoName, []);
      continue;
    }
    const commits = collectCommits(repoPath, since, until);
    record.git.available = commits.ok;
    record.git.reason = commits.ok ? null : commits.reason;
    record.git.commitCount = commits.commits.length;
    commitsByRepo.set(repoName, commits.commits);

    const board = collectBoard(repoPath, since, until);
    record.board.available = board.ok;
    record.board.reason = board.ok ? null : board.reason;
    record.board.taskCount = board.tasks.length;
    tasksByRepo.set(repoName, board.tasks);
    repos.push(record);
  }

  const sessions = [];
  for (const entry of discovery.sessions.filter((item) => item.role === "parent")) {
    const startMs = Date.parse(entry.firstTimestamp ?? "");
    const endMs = Date.parse(entry.lastTimestamp ?? "");
    const branches = new Set(entry.gitBranches ?? []);
    const commits = commitsByRepo.get(entry.repo) ?? [];
    const during = [];
    const after = [];
    for (const commit of commits) {
      const commitMs = Date.parse(commit.committedAt);
      if (!Number.isFinite(commitMs)) continue;
      // Branch join is a containment test, so a commit made on a session's
      // branch still matches after the branch was merged and deleted.
      const branchMatch = branches.size === 0
        || commit.branches.length === 0
        || commit.branches.some((branch) => branches.has(branch));
      const view = {
        sha: commit.sha,
        shortSha: commit.shortSha,
        committedAt: commit.committedAt,
        subject: commit.subject,
        fileCount: commit.files.length,
        branches: commit.branches,
        branchMatch,
      };
      if (Number.isFinite(startMs) && Number.isFinite(endMs)
        && commitMs >= startMs && commitMs <= endMs) {
        during.push(view);
      } else if (Number.isFinite(endMs) && commitMs > endMs) {
        // Everything up to the window's own `until` bound, which already
        // includes --trailing-days. Applying the trailing window a second time
        // here would give one flag two different meanings.
        after.push(view);
      }
    }
    const taskEvents = [];
    for (const task of tasksByRepo.get(entry.repo) ?? []) {
      for (const event of task.events) {
        const eventMs = Date.parse(event.at);
        if (!Number.isFinite(eventMs)) continue;
        if (Number.isFinite(startMs) && Number.isFinite(endMs)
          && eventMs >= startMs && eventMs <= endMs) {
          taskEvents.push({ taskId: task.id, title: task.title, status: task.status, ...event });
        }
      }
    }
    sessions.push({
      sessionId: entry.sessionId,
      repo: entry.repo,
      startedAt: entry.firstTimestamp,
      endedAt: entry.lastTimestamp,
      gitBranches: [...branches],
      commitsDuringSession: during,
      commitsAfterSession: after,
      taskEventsDuringSession: taskEvents,
    });
  }

  const correlation = {
    generatedAt: new Date().toISOString(),
    provider: discovery.provider,
    window: {
      ...discovery.window,
      trailingDays,
      since: since.toISOString(),
      until: until.toISOString(),
    },
    repos,
    commits: Object.fromEntries(
      [...commitsByRepo.entries()].map(([repo, commits]) => [
        repo,
        commits.map((commit) => ({
          sha: commit.sha,
          shortSha: commit.shortSha,
          authoredAt: commit.authoredAt,
          committedAt: commit.committedAt,
          author: commit.author,
          subject: commit.subject,
          branches: commit.branches,
          files: commit.files.slice(0, 50),
          fileCount: commit.files.length,
        })),
      ]),
    ),
    tasks: Object.fromEntries([...tasksByRepo.entries()]),
    sessions,
    notes: [
      "Session/commit joins use branch containment plus time overlap; a commit "
      + "whose branch set is empty (unreachable from any branch) is treated as "
      + "a branch match so it is not silently dropped.",
      "commitsAfterSession covers the trailing window and is where next-morning "
      + "fixups to a fast stretch show up.",
    ],
  };

  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "correlation.json");
  writeFileSync(outFile, `${JSON.stringify(correlation, null, 2)}\n`, "utf8");
  return { correlation, outFile };
}

function main() {
  if (wantsHelp(process.argv.slice(2))) {
    console.log(USAGE);
    return;
  }
  try {
    const options = parseOptions(process.argv.slice(2), optionDefinitions);
    const { correlation, outFile } = correlate(options);
    for (const repo of correlation.repos) {
      console.log(`  ${repo.repo}: ${repo.git.commitCount} commit(s)`
        + `${repo.git.available ? "" : ` (git unavailable: ${repo.git.reason})`}, `
        + `${repo.board.taskCount} task(s) with activity`
        + `${repo.board.available ? "" : ` (board unavailable: ${repo.board.reason})`}`);
    }
    console.log(`Wrote ${outFile}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
