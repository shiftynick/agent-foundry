---
id: task-007
title: Add protected-default-branch workflow policy
status: done
priority: p2
tags: [area:git, type:improvement]
blockedBy: []
createdAt: "2026-07-30T19:16:21Z"
updatedAt: "2026-07-30T19:59:29Z"
---

<!-- task-tracker:description -->
## Description

Make the stock commit policy safe and explicit for projects whose default branch is protected or where local commits to it are disallowed. Preserve autonomous task-scoped commits where permitted, provide a clear project customization/default-branch rule, and keep push/publish authorization unchanged.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:16:21Z — created (status: backlog)
- 2026-07-30T19:30:24Z — note: rubric: (1) stock policy prevents unauthorized direct commits to a protected/default branch; (2) permitted task-scoped local commits remain autonomous; (3) branch naming stays project-owned; (4) push and publish authority is unchanged.
- 2026-07-30T19:30:25Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-30T19:39:48Z — moved to review
- 2026-07-30T19:46:56Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T19:46:53Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T19:47:19Z — note: cold review round 1: rung 1 via Claude CLI, different model family; no task-007-specific defect confirmed; branch naming remains project-owned and external authority is unchanged.
- 2026-07-30T19:47:19Z — note: release integration: tasks 005-009 share installer, policy, validation, and changelog surfaces, so the operator-approved 0.10 packet is cold-reviewed and fully validated together while each card retains its own rubric and evidence.
- 2026-07-30T19:52:48Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T19:52:45Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T19:52:48Z — note: cold review round 2: SPEC axis malformed and therefore incomplete; no new task-007 defect confirmed.
- 2026-07-30T19:53:40Z — run: git diff --check
  started 2026-07-30T19:53:40Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T19:58:58Z — run: git diff --check
  started 2026-07-30T19:58:58Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T19:59:29Z — note: cold review round 3: rung 1 via Claude CLI, model claude-opus-5, Anthropic Claude family. Accepted and fixed override wording so AGENTS.md may explicitly permit direct local default-branch commits or tighten policy.
- 2026-07-30T19:59:29Z — moved to done
