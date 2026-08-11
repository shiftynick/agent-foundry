---
id: task-043
title: "Harden task ID namespace: worktree key and silent-scheme-flip diagnostic"
status: done
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-09T02:58:15Z"
updatedAt: "2026-08-09T22:30:16Z"
---

<!-- task-tracker:description -->
## Description

Two upstream packets from aigent-place against the same function, both verified against stock 0.26.0:
- docs/research/upstream-packets/2026-08-08/aigent-place-task-id-detached-worktree-collision.md
- docs/research/upstream-packets/2026-08-08/aigent-place-task-id-default-branch-ambiguity.md

Verified claim A (collision): starter/.claude/skills/task-tracker/scripts/task.mjs currentBranchNamespace() returns branchTaskNamespace('detached:' + head) for a detached HEAD, keying the namespace on the COMMIT alone. Two worktrees detached at the same SHA therefore share a namespace and can mint colliding durable task IDs. Proposed: include the resolved worktree root in the namespace key, plus CLI tests.

Verified claim B (silent flip): the same function falls through to branchTaskNamespace(branch) - the 16-digit scheme - whenever .agent-foundry.json is absent, malformed, or its defaultBranch is unusable AND refs/remotes/origin/HEAD is absent. Nothing is reported, so a project silently changes ID scheme. Proposed: classify the reason, warn on stderr, tighten defaultBranch validation, plus CLI tests.

Both are one function and one card, but they are independently acceptable: adopt, adapt, or decline each on its own merits. Watch the interaction with task-006 (task IDs safe across branches) and task-040 (installer default-branch precedence) - B partly overlaps what 040 already fixed at install time, so verify how much of the silent-flip window remains before writing code.

Acceptance: red-capable tests per behavior; dual-tree mirror; zero-dep Node; gates green; VERSION+CHANGELOG; cold review. On landing, tell aigent-place so its six LOCAL-CHANGES entries can retire.

<!-- task-tracker:log -->
## Log

- 2026-08-09T02:58:15Z — created (status: backlog)
- 2026-08-09T21:52:50Z — note: rubric: (1) two detached worktrees at one commit mint different durable task IDs - test fails without the worktree key; (2) the detached namespace still yields a stable task-<16 digits> ID within one worktree; (3) when default-branch metadata is unusable AND refs/remotes/origin/HEAD is absent, add() writes one 'task-tracker: warning' line to stderr, keeps exit 0, and still prints the namespaced ID on stdout; (4) no warning when origin/HEAD answers, and compact IDs still hold on an unborn default branch and on a configured defaultBranch; (5) a defaultBranch that cannot name a branch (empty, whitespace, '..') is treated as unusable, not as configuration; (6) both harness trees byte-identical per check-skill-sync; gates green.
- 2026-08-09T21:52:50Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T21:57:20Z — note: chose: adopt both packets. Checked the interaction with task-040 - the installer now resolves defaultBranch well, but it still writes JSON null when the target is not a Git repository at install time, and pre-0.27 installs, hand-edited metadata, and clones without origin/HEAD all keep the silent-flip window open. The warning is therefore still load-bearing.
- 2026-08-09T21:57:20Z — note: chose: a local isUsableBranchName() subset of git-check-ref-format instead of the packet's whitespace-and-dotdot check. A false accept is harmless because the value is only compared against the real branch name, so the check only has to stop values that can never match.
- 2026-08-09T21:57:44Z — run: node --test starter/.claude/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-09T21:57:20Z, exit 0 in 23.5s
  output tail (truncated to last 30 lines):
  |       duration_ms: 48.7478
  |       type: 'test'
  |       ...
  |     # Subtest: points at a reference file that exists in this tree
  |     ok 5 - points at a reference file that exists in this tree
  |       ---
  |       duration_ms: 0.2543
  |       type: 'test'
  |       ...
  |     # Subtest: still rejects an unknown verb with exit 2
  |     ok 6 - still rejects an unknown verb with exit 2
  |       ---
  |       duration_ms: 48.0608
  |       type: 'test'
  |       ...
  |     1..6
  | ok 14 - task help
  |   ---
  |   duration_ms: 291.5538
  |   type: 'suite'
  |   ...
  | 1..14
  | # tests 80
  | # suites 14
  | # pass 80
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 23458.8991
- 2026-08-09T22:02:10Z — moved to review
- 2026-08-09T22:26:00Z — run: node --test starter/.claude/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-09T22:25:34Z, exit 0 in 25.7s
  output tail (truncated to last 30 lines):
  |       duration_ms: 50.6762
  |       type: 'test'
  |       ...
  |     # Subtest: points at a reference file that exists in this tree
  |     ok 5 - points at a reference file that exists in this tree
  |       ---
  |       duration_ms: 0.24
  |       type: 'test'
  |       ...
  |     # Subtest: still rejects an unknown verb with exit 2
  |     ok 6 - still rejects an unknown verb with exit 2
  |       ---
  |       duration_ms: 50.0755
  |       type: 'test'
  |       ...
  |     1..6
  | ok 14 - task help
  |   ---
  |   duration_ms: 248.9356
  |   type: 'suite'
  |   ...
  | 1..14
  | # tests 83
  | # suites 14
  | # pass 83
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 25593.7609
- 2026-08-09T22:26:00Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T22:26:00Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-09T22:26:12Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T22:26:10Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T22:28:27Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T22:27:21Z, exit 0 in 66.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | .
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\clean-project\.agent-foundry-backups\20260809T222824025Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\clean-project
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\seed-upgrade-project\.agent-foundry-backups\20260809T222825703Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\seed-upgrade-project
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\clean-project\.agent-foundry-backups\20260809T222827376Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-okRSaP\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T22:29:50Z — note: cold review: Codex CLI 0.145.0, answer-only, ephemeral, both axes, three rounds plus one scoped delta check. Round 1 and 2 both axes: trimming defaultBranch before validating it accepted a padded value such as '  integration  ' as configuration. First adjudicated as harmless normalization, then accepted on round 2: a padded value that names a task branch would classify that branch as the default and mint compact IDs on it, which contradicts the module's own fail-safe direction. The value is no longer trimmed. Round 2 also found the warning test permitted several stderr lines and the remote-HEAD test never asserted stderr; both accepted and fixed. Round 3: SPEC PASS; STANDARDS found isUsableBranchName applied the component rules to the whole string, so 'foo.lock/bar' and 'feature/.hidden' passed and produced a silent scheme flip, plus two missing test cases. Both accepted and fixed at the round cap, then verified by one scoped delta check: PASS.
- 2026-08-09T22:30:16Z — moved to done
