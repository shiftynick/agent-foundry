---
id: task-025
title: Make Cursor isolated-worktree output reachable and reviewable
status: done
priority: p1
tags: [area:agent-headless]
blockedBy: [task-018]
createdAt: "2026-08-06T15:34:04Z"
updatedAt: "2026-08-06T18:23:04Z"
---

<!-- task-tracker:description -->
## Description

Operator decision 2026-08-06: keep Cursor's isolation, fix the handoff. Cursor exposes only answer-only, inspect, and edit-isolated - verified against cursor-agent 2026.08.04-aaa8809 - so edit-isolated IS the coding mode and already works. The gap is that a completed run leaves its work stranded in an isolated worktree with nothing pointing at it.

This is the difference between Cursor being usable as a workhorse and not. Today the sequence is: delegate, wait about eight minutes, receive a result that may say failed even on success (task-018), and then independently run git worktree list to discover roughly twenty modified files.

Scope: (1) the normalized result carries the effective worktree path on every outcome including failure - this overlaps task-018 acceptance item 3 and must not be implemented twice, so coordinate or fold them; (2) a documented, tested path from a finished isolated run to a reviewable diff in the caller's repository - at minimum a recorded command that shows the diff, at best an explicit integrate step the caller invokes after review; (3) the skill documents that path at the point of use, so an agent delegating to Cursor knows how the work comes back before it starts.

Explicitly out of scope by operator decision: adding edit-workspace to the Cursor adapter. The isolation is what makes an unsupervised bad run harmless; the evidence says the pain is the handoff, not the sandbox. Revisit only after run 002 reports per-provider success rates.

Acceptance: after a successful edit-isolated run, the caller can reach the diff using only what the runner returned, with no out-of-band git worktree list.

<!-- task-tracker:log -->
## Log

- 2026-08-06T15:34:04Z — created (status: backlog)
- 2026-08-06T16:51:17Z — moved to ready
- 2026-08-06T16:52:57Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-06T16:51:57Z, exit 0 in 60.9s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ..............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.18.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\clean-project\.agent-foundry-backups\20260806T165254715Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.18.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\clean-project
  | Agent Foundry 0.18.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\seed-upgrade-project\.agent-foundry-backups\20260806T165256268Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.18.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\clean-project\.agent-foundry-backups\20260806T165257405Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.18.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ejGU0W\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-06T17:18:49Z — note: The reachability guarantee now holds and is pinned. Root cause of the original gap: the worktree path was recovered by PARSING the provider stream, so it existed exactly when the output was readable and vanished exactly when it was not - the same failure shape as task-018, one layer up. The prescribed fix (pin a base directory via --worktree-base) was WRONG - that flag is a Git ref, not a directory, verified against cursor-agent help and Cursor's bundled worktree implementation - and would have broken every isolated run. Actual fix, upstream 045e47d: since the runner already pins the name, the location is a pure function of the request; describeWorkspace now derives Cursor's own layout (honoring CURSOR_WORKTREES_ROOT), a provider-disclosed path still wins, worktreeSource records which answered, and nothing is fabricated when no worktree can exist. Verified by direct probe: absolute paths on unreadable, timed-out, and non-zero-exit isolated runs. Bundled suite asserts it (12 tests; 6 fail against the previous artifacts).
- 2026-08-06T17:18:50Z — run: node --test starter/.agent-foundry/agent-headless/cli.test.mjs
  started 2026-08-06T17:18:49Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   duration_ms: 0.3181
  |   type: 'test'
  |   ...
  | # Subtest: Cursor defaults its model and says so
  | ok 10 - Cursor defaults its model and says so
  |   ---
  |   duration_ms: 0.7591
  |   type: 'test'
  |   ...
  | # Subtest: an isolated run reports where the work is, even when its output is unreadable
  | ok 11 - an isolated run reports where the work is, even when its output is unreadable
  |   ---
  |   duration_ms: 1.5931
  |   type: 'test'
  |   ...
  | # Subtest: live cancellation terminates the bundled process runner
  | ok 12 - live cancellation terminates the bundled process runner
  |   ---
  |   duration_ms: 498.5404
  |   type: 'test'
  |   ...
  | 1..12
  | # tests 12
  | # suites 0
  | # pass 12
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 777.9047
- 2026-08-06T17:18:51Z — run: node scripts/verify-vendor-reconstruction.mjs N:/agent-headless
  started 2026-08-06T17:18:50Z, exit 0 in 0.6s
  output:
  | vendor-reconstruction: PASS (4 patches, base 7600ff8 -> source 045e47d, tree 695cf3718eff)
- 2026-08-06T17:25:03Z — note: Foundry round-2 SPEC finding 1 ACCEPTED (high): the guarantee delivered a path but not the documented, tested handoff the task scope required - the skill said only 'inspect that diff' with no command, and no test drove a diff from a successful result. Fixed: the skill now gives the recovery commands (status/diff/log against workspace.worktree, integrate by merging the worktree branch, never hunt with git worktree list) placed BEFORE the write-call guidance so the caller knows how work comes back before delegating; and the bundled suite gained an end-to-end handoff test - scratch git repo, CURSOR_WORKTREES_ROOT redirected, unreadable-stream run, worktree created at exactly the derived location, and the delegated change reached using only result data. 13 tests, 13 pass.
- 2026-08-06T17:25:04Z — run: node --test starter/.agent-foundry/agent-headless/cli.test.mjs
  started 2026-08-06T17:25:03Z, exit 0 in 1.1s
  output tail (truncated to last 30 lines):
  |   duration_ms: 0.8858
  |   type: 'test'
  |   ...
  | # Subtest: an isolated run reports where the work is, even when its output is unreadable
  | ok 11 - an isolated run reports where the work is, even when its output is unreadable
  |   ---
  |   duration_ms: 2.4946
  |   type: 'test'
  |   ...
  | # Subtest: a successful isolated run hands over a reviewable diff from the result alone
  | ok 12 - a successful isolated run hands over a reviewable diff from the result alone
  |   ---
  |   duration_ms: 306.8114
  |   type: 'test'
  |   ...
  | # Subtest: live cancellation terminates the bundled process runner
  | ok 13 - live cancellation terminates the bundled process runner
  |   ---
  |   duration_ms: 467.1803
  |   type: 'test'
  |   ...
  | 1..13
  | # tests 13
  | # suites 0
  | # pass 13
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1064.7453
- 2026-08-06T18:23:04Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T18:23:04Z — note: Closing evidence recorded above: the reachability guarantee holds by construction (path derived from the pinned name and Cursor's own layout, honoring CURSOR_WORKTREES_ROOT with full env parity after rounds 4-7), the skill documents the recovery commands scoped honestly per provider, and the bundled handoff test drives a real diff from result data alone against an independently computed layout. Out of scope per operator decision: edit-workspace for Cursor; revisit after run 002 reports per-provider success rates.
- 2026-08-06T18:23:04Z — moved to review
- 2026-08-06T18:23:04Z — moved to done
