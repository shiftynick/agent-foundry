---
id: task-018
title: Stop reporting a successful agent-headless run as failed when its JSONL cannot be parsed
status: in_progress
priority: p1
tags: [area:agent-headless]
blockedBy: []
createdAt: "2026-08-05T22:57:55Z"
updatedAt: "2026-08-06T15:46:49Z"
claimedBy: "shift@Shiftor"
claimedAt: "2026-08-06T15:46:49Z"
---

<!-- task-tracker:description -->
## Description

Reported from a consuming project on foundry 0.16.0 (cursor-agent 2026.07.23-e383d2b, Windows 11, --provider cursor --access edit-isolated --json). A delegated implementation run returned status failed, events [], exitCode 0, stderr empty, warnings ['invalid JSONL at line 1'] after about eight minutes - while the provider had in fact succeeded and written roughly twenty files into the isolated worktree it created under the user's ~/.cursor/worktrees. Nothing in the normalized result indicated success, and no field pointed at the worktree holding the work, so the completed change was discoverable only by independently running git worktree list. The failure signal is indistinguishable from a genuine no-op. Mechanism: parseJsonLines aborts on the first unparseable stdout line and returns an error for the entire stream; the Cursor adapter's parse propagates it as protocolError; run status is then derived directly as parsed.protocolError ? 'failed' : 'succeeded', so one non-JSON line at index 0 produces exactly this shape while exitCode 0 - the signal that contradicts the verdict - is ignored. Identical logic exists in agent-headless/index.js and agent-headless/cli.js; no local drift, so this is stock behavior. Acceptance: (1) an unparseable line no longer discards the run - such lines are skipped and collected as bounded warnings, and the run fails only when no events parsed AND no terminal result was found, proven by a test feeding a valid stream prefixed with a non-JSON banner line; (2) a parse failure alone no longer decides status when the provider exited 0 - either success-with-warning or a distinct third status such as unparsed, so callers can separate 'the provider failed' from 'we could not read what the provider said'; (3) every write-access run reports its effective workspace or worktree path in the normalized result on all outcomes including failure, which is the change that turns an unreadable run from invisible into recoverable. Deterministic repro without a provider: parseJsonLines('cursor', 'not json\\n' + validJsonlStream) returns zero events and a line-1 error regardless of what follows.

<!-- task-tracker:log -->
## Log

- 2026-08-05T22:57:55Z — created (status: backlog)
- 2026-08-05T22:58:04Z — note: Reported by the Interra API Proxy project (foundry 0.16.0), originating task task-6627529457000001, 2026-08-05. Impact as the reporting project judged it: the mutation itself is safe because it is isolated in a worktree - the hazard is the report. A caller believing the run produced nothing either redoes the work, paying twice for an eight-minute model run, or proceeds while a completed change sits stranded in a stray worktree. For a kit whose delegation story rests on trusting the runner's verdict, a false failed is more damaging than a loud false succeeded.
- 2026-08-06T15:46:47Z — note: Rubric (logged before claiming, per SDLC Entry criteria): (1) parseJsonLines skips unparseable lines and collects them as bounded warnings instead of aborting the stream, and reports an error only when NOTHING parsed - proven by a test feeding a valid stream prefixed with a non-JSON banner line; (2) when the process exited 0, a parse failure no longer yields status failed - a distinct status separates 'the provider failed' from 'we could not read what the provider said'; (3) every write-access run reports its effective workspace or worktree location on all outcomes including failure, so a run whose output is unreadable is still recoverable; (4) the fix lands UPSTREAM in the agent-headless source, not in the vendored artifacts, because validate-foundry verifies their SHA-256 against PROVENANCE.md; (5) upstream check passes and the Foundry re-vendor updates artifacts, hashes, version, and patch series together.
- 2026-08-06T15:46:47Z — note: Scope discovered on claim: starter/.agent-foundry/agent-headless/{index.js,cli.js} are vendored build artifacts whose SHA-256 are verified by scripts/validate-foundry.mjs:191-196 against PROVENANCE.md. Editing them directly would fail the gate and bypass the documented refresh process. Upstream source is local at N:/agent-headless and its HEAD 3a631b9 matches the recorded source commit exactly, so there is no drift to reconcile. This is therefore a two-repository change: fix and test upstream, then re-vendor.
- 2026-08-06T15:46:48Z — moved to ready
- 2026-08-06T15:46:49Z — moved to in_progress (claimed by shift@Shiftor)
