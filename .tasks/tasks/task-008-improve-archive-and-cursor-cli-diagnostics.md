---
id: task-008
title: Improve archive and Cursor CLI diagnostics
status: done
priority: p3
tags: [area:skills, type:usability]
blockedBy: []
createdAt: "2026-07-30T19:16:21Z"
updatedAt: "2026-07-30T19:59:30Z"
---

<!-- task-tracker:description -->
## Description

Make task.mjs archive reject positional task IDs with an actionable message explaining that archive sweeps all done tasks and accepts only --dry-run. Document common Cursor Agent shim discovery, including %LOCALAPPDATA%\\cursor-agent\\agent.cmd on Windows, while retaining CURSOR_AGENT_BIN and cross-platform guidance. Add focused tests or command validation.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:16:21Z — created (status: backlog)
- 2026-07-30T19:30:24Z — note: rubric: (1) archive with a positional task ID exits 2 and explains sweep semantics plus --dry-run; (2) other invalid flags remain clear; (3) Cursor guidance names the standard Windows shim and cross-platform fallback; (4) focused command tests pass.
- 2026-07-30T19:30:25Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-30T19:39:48Z — moved to review
- 2026-07-30T19:47:17Z — run: node --test starter/.agents/skills/task-tracker/scripts/task.test.mjs starter/.agents/skills/cursor-cli/scripts/cursor-agent.test.mjs
  started 2026-07-30T19:46:56Z, exit 0 in 21.3s
  output tail (truncated to last 30 lines):
  |   type: 'suite'
  |   ...
  | # Subtest: task rm
  |     # Subtest: soft-deletes by setting status=done and adding deleted:true tag
  |     ok 1 - soft-deletes by setting status=done and adding deleted:true tag
  |       ---
  |       duration_ms: 168.0091
  |       type: 'test'
  |       ...
  |     # Subtest: keeps dependents blocked when their blocker is soft-deleted
  |     ok 2 - keeps dependents blocked when their blocker is soft-deleted
  |       ---
  |       duration_ms: 388.1109
  |       type: 'test'
  |       ...
  |     1..2
  | ok 23 - task rm
  |   ---
  |   duration_ms: 556.2222
  |   type: 'suite'
  |   ...
  | 1..23
  | # tests 70
  | # suites 13
  | # pass 69
  | # fail 0
  | # cancelled 0
  | # skipped 1
  | # todo 0
  | # duration_ms 21115.9064
- 2026-07-30T19:47:19Z — note: cold review round 1: rung 1 via Claude CLI, different model family; accepted single-dash archive diagnostic finding and added focused coverage.
- 2026-07-30T19:47:19Z — note: release integration: tasks 005-009 share installer, policy, validation, and changelog surfaces, so the operator-approved 0.10 packet is cold-reviewed and fully validated together while each card retains its own rubric and evidence.
- 2026-07-30T19:52:48Z — note: cold review round 2: SPEC axis malformed and therefore incomplete; no new task-008 defect confirmed.
- 2026-07-30T19:59:29Z — note: cold review round 3: rung 1 via Claude CLI, model claude-opus-5, Anthropic Claude family. Positional valid task IDs receive the sweep explanation; unrelated bare numbers and filenames remain invalid arguments and intentionally use the generic error.
- 2026-07-30T19:59:30Z — moved to done
