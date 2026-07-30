---
id: task-009
title: Make installed run-checks fail closed
status: done
priority: p0
tags: [area:validation, type:defect]
blockedBy: []
createdAt: "2026-07-30T19:30:24Z"
updatedAt: "2026-07-30T19:59:30Z"
---

<!-- task-tracker:description -->
## Description

The installed aggregate gate exits nonzero when its required skill-sync checker is absent or cannot start, never reports an unexecuted check as passing, excludes nested dependency trees from discovery, and has CLI-level regression coverage for success and failure exit behavior.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:30:24Z — created (status: backlog)
- 2026-07-30T19:30:24Z — note: rubric: (1) missing or unstartable skill-sync fails the aggregate gate; (2) PASS names only checks actually run; (3) nested node_modules suites are excluded inside managed roots; (4) CLI tests cover success, missing checker, failing checker, failing suite, and empty discovery exits.
- 2026-07-30T19:30:25Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-30T19:39:48Z — moved to review
- 2026-07-30T19:47:18Z — run: node --test starter/.agent-foundry/run-checks.test.mjs
  started 2026-07-30T19:47:17Z, exit 0 in 1.3s
  output tail (truncated to last 30 lines):
  |   duration_ms: 208.0168
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 1 when a present skill-sync checker cannot load
  | ok 9 - CLI exits 1 when a present skill-sync checker cannot load
  |   ---
  |   duration_ms: 213.622
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 1 when an installed suite fails
  | ok 10 - CLI exits 1 when an installed suite fails
  |   ---
  |   duration_ms: 273.7541
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 2 when no suites are discovered
  | ok 11 - CLI exits 2 when no suites are discovered
  |   ---
  |   duration_ms: 64.1021
  |   type: 'test'
  |   ...
  | 1..11
  | # tests 11
  | # suites 0
  | # pass 11
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1242.2213
- 2026-07-30T19:47:19Z — note: cold review round 1: rung 1 via Claude CLI, different model family; accepted explicit present-but-unloadable checker coverage; aggregate gate remains fail closed.
- 2026-07-30T19:47:19Z — note: release integration: tasks 005-009 share installer, policy, validation, and changelog surfaces, so the operator-approved 0.10 packet is cold-reviewed and fully validated together while each card retains its own rubric and evidence.
- 2026-07-30T19:52:49Z — note: cold review round 2: SPEC axis malformed and therefore incomplete; no new task-009 defect confirmed.
- 2026-07-30T19:53:43Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T19:53:41Z, exit 0 in 2.7s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T19:59:02Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T19:58:58Z, exit 0 in 3.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T19:59:29Z — note: cold review round 3: rung 1 via Claude CLI, model claude-opus-5, Anthropic Claude family. Final review found no task-009-specific defect; missing, failing, unloadable, suite-failure, success, and empty-discovery CLI behavior is covered.
- 2026-07-30T19:59:30Z — moved to done
