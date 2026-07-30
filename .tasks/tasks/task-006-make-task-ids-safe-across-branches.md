---
id: task-006
title: Make task IDs safe across branches
status: done
priority: p1
tags: [area:task-tracker, type:defect]
blockedBy: []
createdAt: "2026-07-30T19:16:21Z"
updatedAt: "2026-07-30T19:59:29Z"
---

<!-- task-tracker:description -->
## Description

Prevent duplicate numeric task IDs created from branches that do not contain the latest board state. Add an immediate upgrade-flow guard that starts task creation from the current default branch, then design and implement collision-tolerant allocation or deterministic recovery/renumbering that preserves filenames, frontmatter, and dependencies. Cover sequential stale-branch and concurrent-branch merge scenarios.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:16:21Z — created (status: backlog)
- 2026-07-30T19:30:24Z — note: rubric: (1) tasks created independently from stale or concurrent branches receive non-colliding IDs; (2) filenames, frontmatter IDs, and dependency references remain internally consistent; (3) upgrade flow begins from the current default branch; (4) focused tests cover stale and concurrent allocation.
- 2026-07-30T19:30:25Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-30T19:39:48Z — moved to review
- 2026-07-30T19:46:53Z — run: node --test starter/.agents/skills/task-tracker/scripts/_lib.test.mjs starter/.agents/skills/task-tracker/scripts/task.test.mjs
  started 2026-07-30T19:46:31Z, exit 0 in 21.4s
  output tail (truncated to last 30 lines):
  |   type: 'suite'
  |   ...
  | # Subtest: task rm
  |     # Subtest: soft-deletes by setting status=done and adding deleted:true tag
  |     ok 1 - soft-deletes by setting status=done and adding deleted:true tag
  |       ---
  |       duration_ms: 169.9441
  |       type: 'test'
  |       ...
  |     # Subtest: keeps dependents blocked when their blocker is soft-deleted
  |     ok 2 - keeps dependents blocked when their blocker is soft-deleted
  |       ---
  |       duration_ms: 444.4008
  |       type: 'test'
  |       ...
  |     1..2
  | ok 30 - task rm
  |   ---
  |   duration_ms: 614.4419
  |   type: 'suite'
  |   ...
  | 1..30
  | # tests 116
  | # suites 30
  | # pass 116
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 21302.1256
- 2026-07-30T19:47:19Z — note: cold review round 1: rung 1 via Claude CLI, different model family; accepted default-branch discovery and missing CLI branch/merge coverage findings; installer metadata now records the default branch and real Git merge coverage exercises allocation.
- 2026-07-30T19:47:19Z — note: release integration: tasks 005-009 share installer, policy, validation, and changelog surfaces, so the operator-approved 0.10 packet is cold-reviewed and fully validated together while each card retains its own rubric and evidence.
- 2026-07-30T19:52:45Z — run: node --test starter/.agents/skills/task-tracker/scripts/_lib.test.mjs starter/.agents/skills/task-tracker/scripts/task.test.mjs
  started 2026-07-30T19:52:20Z, exit 0 in 25.3s
  output tail (truncated to last 30 lines):
  |   type: 'suite'
  |   ...
  | # Subtest: task rm
  |     # Subtest: soft-deletes by setting status=done and adding deleted:true tag
  |     ok 1 - soft-deletes by setting status=done and adding deleted:true tag
  |       ---
  |       duration_ms: 217.8534
  |       type: 'test'
  |       ...
  |     # Subtest: keeps dependents blocked when their blocker is soft-deleted
  |     ok 2 - keeps dependents blocked when their blocker is soft-deleted
  |       ---
  |       duration_ms: 537.0012
  |       type: 'test'
  |       ...
  |     1..2
  | ok 30 - task rm
  |   ---
  |   duration_ms: 754.9639
  |   type: 'suite'
  |   ...
  | 1..30
  | # tests 116
  | # suites 30
  | # pass 116
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 25255.7361
- 2026-07-30T19:52:48Z — note: cold review round 2: SPEC axis malformed and therefore incomplete; accepted fail-open/detached/default provenance findings. Installer now prefers configured remote HEAD, falls back to the current branch only when needed, detached task creation uses a commit namespace, and Git spawn errors no longer silently select sequential IDs.
- 2026-07-30T19:53:40Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T19:53:40Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (12 shared skills)
- 2026-07-30T19:58:58Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T19:58:58Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (12 shared skills)
- 2026-07-30T19:59:29Z — note: cold review round 3: rung 1 via Claude CLI, model claude-opus-5, Anthropic Claude family. Accepted and fixed multi-remote resolver divergence; .agent-foundry.json is mold, so seed restoration cannot revert defaultBranch metadata. Residual risk: numeric namespace hashes are collision-tolerant, not globally unique; supported same-branch concurrency still files cards before worktrees.
- 2026-07-30T19:59:29Z — moved to done
