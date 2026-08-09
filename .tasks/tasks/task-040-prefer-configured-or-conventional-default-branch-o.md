---
id: task-040
title: Prefer configured or conventional default branch over active HEAD at install
status: done
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-09T01:52:35Z"
updatedAt: "2026-08-09T02:01:08Z"
---

<!-- task-tracker:description -->
## Description

Discovered by synoptic during nightly audit 2026-08-08 and logged upstream-worthy (N:\synoptic task-015 log line 69): when a target repo has no remote HEAD, resolveDefaultBranch in scripts/bootstrap-project.mjs falls back to the ACTIVE branch (symbolic-ref HEAD), so bootstrapping or upgrading from a task branch records that task branch as defaultBranch. Fix: before the active-HEAD fallback, prefer (1) git config init.defaultBranch when a local branch of that name exists, then (2) an existing local main, then (3) an existing local master; only then fall back to the current HEAD. Deterministic, no prompts. Acceptance: unit/bootstrap coverage where a repo on a non-default branch with a local main records main; validate + test-bootstrap green.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:52:35Z — created (status: backlog)
- 2026-08-09T01:52:36Z — moved to ready
- 2026-08-09T01:52:36Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T01:52:36Z — note: Rubric: (1) resolveDefaultBranch prefers init.defaultBranch-named local branch, then local main, then local master, before active-HEAD fallback; remote-HEAD paths unchanged; (2) red-capable test: repo on a task branch with a local main records main - test fails on the old code; (3) no prompts, no new flags; (4) VERSION 0.26.0 + CHANGELOG with task-039; (5) all gates green on final tree; (6) shared cold review with task-039.
- 2026-08-09T01:55:08Z — note: Red-capable oracle demonstrated: with the resolveDefaultBranch fix reverted, test-bootstrap fails at the new assertion with actual 'task/branch-under-test' vs expected 'main' - the exact synoptic defect. Fix re-applied via recorded patch.
- 2026-08-09T01:55:10Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T01:55:08Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T01:56:12Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T01:55:16Z, exit 0 in 56.0s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\clean-project\.agent-foundry-backups\20260809T015608045Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\clean-project
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\seed-upgrade-project\.agent-foundry-backups\20260809T015609762Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\seed-upgrade-project
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\clean-project\.agent-foundry-backups\20260809T015611808Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-7PIlip\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T01:56:40Z — moved to review (note: Diff frozen; gates recorded incl. red-capable demo)
- 2026-08-09T01:58:40Z — note: Round 1 adjudication (shared packet). SPEC F1 med confirmed - the new precedence also executed for ambiguous multi-remote-HEAD repos, changing prior behavior outside the objective's no-remote-HEAD scope; FIXED with remoteHeads.length === 0 guard; multi-remote-HEAD keeps the prior active-HEAD fallback. All other CHECKED lines passed on both axes. Confirmed meds -> full round 2.
- 2026-08-09T01:58:42Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T01:58:40Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T01:59:43Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T01:58:42Z, exit 0 in 60.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\clean-project\.agent-foundry-backups\20260809T015939527Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\clean-project
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\seed-upgrade-project\.agent-foundry-backups\20260809T015941248Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\seed-upgrade-project
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\clean-project\.agent-foundry-backups\20260809T015943093Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gzGpP4\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T02:01:08Z — note: Round 2: SPEC PASS + STANDARDS PASS, both full CHECKED; no-remote-HEAD scoping and red-capable fixture verified.
- 2026-08-09T02:01:08Z — moved to done
