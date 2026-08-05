---
id: task-018
title: Stop reporting a successful agent-headless run as failed when its JSONL cannot be parsed
status: backlog
priority: p1
tags: [area:agent-headless]
blockedBy: []
createdAt: "2026-08-05T22:57:55Z"
updatedAt: "2026-08-05T22:58:04Z"
---

<!-- task-tracker:description -->
## Description

Reported from a consuming project on foundry 0.16.0 (cursor-agent 2026.07.23-e383d2b, Windows 11, --provider cursor --access edit-isolated --json). A delegated implementation run returned status failed, events [], exitCode 0, stderr empty, warnings ['invalid JSONL at line 1'] after about eight minutes - while the provider had in fact succeeded and written roughly twenty files into the isolated worktree it created under the user's ~/.cursor/worktrees. Nothing in the normalized result indicated success, and no field pointed at the worktree holding the work, so the completed change was discoverable only by independently running git worktree list. The failure signal is indistinguishable from a genuine no-op. Mechanism: parseJsonLines aborts on the first unparseable stdout line and returns an error for the entire stream; the Cursor adapter's parse propagates it as protocolError; run status is then derived directly as parsed.protocolError ? 'failed' : 'succeeded', so one non-JSON line at index 0 produces exactly this shape while exitCode 0 - the signal that contradicts the verdict - is ignored. Identical logic exists in agent-headless/index.js and agent-headless/cli.js; no local drift, so this is stock behavior. Acceptance: (1) an unparseable line no longer discards the run - such lines are skipped and collected as bounded warnings, and the run fails only when no events parsed AND no terminal result was found, proven by a test feeding a valid stream prefixed with a non-JSON banner line; (2) a parse failure alone no longer decides status when the provider exited 0 - either success-with-warning or a distinct third status such as unparsed, so callers can separate 'the provider failed' from 'we could not read what the provider said'; (3) every write-access run reports its effective workspace or worktree path in the normalized result on all outcomes including failure, which is the change that turns an unreadable run from invisible into recoverable. Deterministic repro without a provider: parseJsonLines('cursor', 'not json\\n' + validJsonlStream) returns zero events and a line-1 error regardless of what follows.

<!-- task-tracker:log -->
## Log

- 2026-08-05T22:57:55Z — created (status: backlog)
- 2026-08-05T22:58:04Z — note: Reported by the Interra API Proxy project (foundry 0.16.0), originating task task-6627529457000001, 2026-08-05. Impact as the reporting project judged it: the mutation itself is safe because it is isolated in a worktree - the hazard is the report. A caller believing the run produced nothing either redoes the work, paying twice for an eight-minute model run, or proceeds while a completed change sits stranded in a stray worktree. For a kit whose delegation story rests on trusting the runner's verdict, a false failed is more damaging than a loud false succeeded.
