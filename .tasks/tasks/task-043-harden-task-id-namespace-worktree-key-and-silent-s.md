---
id: task-043
title: "Harden task ID namespace: worktree key and silent-scheme-flip diagnostic"
status: backlog
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-09T02:58:15Z"
updatedAt: "2026-08-09T02:58:15Z"
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
