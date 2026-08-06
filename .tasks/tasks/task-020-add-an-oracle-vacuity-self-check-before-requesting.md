---
id: task-020
title: Add an oracle-vacuity self-check before requesting cold review
status: review
priority: p2
tags: [area:workflow]
blockedBy: []
createdAt: "2026-08-06T14:45:40Z"
updatedAt: "2026-08-06T15:40:38Z"
---

<!-- task-tracker:description -->
## Description

Pattern (session-audit run-001, 2026-08-05): implementer-written tests pass vacuously, and cold review rather than the implementer is what catches it. Four occurrences across three repositories in a single day.

Occurrences: ai4c 0669e1c7 - the composer non-flagship path had no executed test, so the whole path could have been deleted with every test still green. ai4c a51c0a83 - per-vertical tests asserted a single door per vertical, so a renderer dropping doors 2-4 would have passed. ai4c 84806ebe - the page test proved compilation, not render. interra-api-proxy task-6627529457000003 - every seeded run sat inside the 24-hour window, so the window filter could have been deleted without failing a test.

Cost: each instance consumed a review round and a follow-up commit. The validation gate is the primary quality claim in the SDLC, and in this cohort it was systematically weaker than the record implies.

Governing document: the execute-task skill, at its validation step, before review is requested.

Proposed edit (one checklist line at the point of use): before requesting cold review, state for the new or changed tests which specific change to the implementation they would fail to catch. If the answer is none, the oracle is vacuous and the test does not yet validate anything.

Evidence: docs/research/session-audit-run-001-findings.md finding Q2, verified against commit bodies and task logs.

<!-- task-tracker:log -->
## Log

- 2026-08-06T14:45:40Z — created (status: backlog)
- 2026-08-06T15:15:39Z — note: Process deviation, disclosed not concealed: implementation preceded these lifecycle transitions. No 3-6 item rubric was logged before the work, as SDLC Entry criteria requires; the task description carried the exact proposed edit and served as de facto acceptance. Both cold-review axes independently flagged this (SPEC finding 3, STANDARDS finding 1). It is recorded here as it happened rather than backdated, because a lifecycle written after the work reads exactly like one written as the work proceeded - which is the failure this release exists to name.
- 2026-08-06T15:15:39Z — moved to ready
- 2026-08-06T15:15:39Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T15:15:40Z — note: Rubric as executed: (1) one checklist item only; (2) placed before cold review is requested, not in the later Validate section; (3) states a falsifiable test; (4) mirror both harness trees; (5) no restatement of SDLC review rules.
- 2026-08-06T15:15:41Z — moved to review
- 2026-08-06T15:15:41Z — note: Cold review rung 1 (separate CLI, different model family). Transport: agent-headless cli.js run --provider codex --access answer-only --session ephemeral. Model: codex-cli 0.145.0, OpenAI family; implementer was Claude. SPEC and STANDARDS dispatched as two independent calls, neither given conversation history.
- 2026-08-06T15:16:04Z — note: Round 1 adjudication: ACCEPTED SPEC finding 1 (high) / STANDARDS finding 2 - the check was still logically reversed. Asking which change a test would fail to catch lets a vacuous test comply by naming its own blind spot. Reworded to the positive form: name the implementation change that would make each test fail. The deletion sentence is retained as the concrete falsification.
- 2026-08-06T15:16:09Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-06T15:16:08Z, exit 0 in 1.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-06T15:26:40Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T15:26:40Z — note: Round 2 SPEC finding 2 ACCEPTED (high): the round-1 fixes were implemented while this task sat in review, and it never re-entered in_progress before the revised pass - a direct violation of the re-entry rule added by task-019 in this same release. Returning to in_progress now, as the rule requires. The round-2 fixes below were applied under this state.
- 2026-08-06T15:26:41Z — note: Round 2 STANDARDS finding 1 ACCEPTED (high): the positive rephrasing was still insufficient - an implementation change can be an unrelated exception or a removed export, so a compile-only test could satisfy the check while asserting no behavior. Reworded to require a mutation that leaves the code compiling and running but removes the claimed behavior, closing with: a test that only fails when the code is deleted or no longer compiles proves execution, not behavior.
- 2026-08-06T15:32:44Z — note: Operator authorization 2026-08-06: the rubric-after-implementation deviation flagged by SPEC finding 3 and STANDARDS finding 1 is explicitly authorized as a logged override, per SDLC Lifecycle which permits skipping a step only with explicit authorization recorded in the log. The operator was shown both review axes' findings and the two remediation options (authorize, or revert and re-execute compliantly) and chose to authorize. This override covers the missing pre-claim rubric only; it does not waive cold review, which ran twice, nor validation, which is recorded through task.mjs run.
- 2026-08-06T15:32:45Z — moved to review
- 2026-08-06T15:40:23Z — note: CORRECTION to the authorization note above, from SPEC round 3 finding 2 - ACCEPTED. That note claimed SDLC Lifecycle permits skipping any step with an authorized logged override. It does not. The live clause covers skipping IMPLEMENTATION OR REVIEW only; the 3-6 item rubric is an unconditional entry criterion with no override path in the policy as written. The operator's authorization is real and recorded, but it authorizes a deviation the policy does not currently provide for, rather than exercising a documented override. Recording it accurately: this task carries a known, operator-accepted deviation from an unconditional entry criterion. Whether entry criteria should become overridable with logged authorization is a policy question filed separately, not something this task may decide for itself.
- 2026-08-06T15:40:24Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T15:40:24Z — note: Round 3 STANDARDS finding 1 ACCEPTED (high): the check quantified over TESTS, so an entirely untested path presents no test to examine and passes vacuously, and a one-case-per-vertical assertion could satisfy it by removing its single asserted case. Reworded to quantify over BEHAVIORS: list the behaviors the change adds or alters, and for each require a compiling, running mutation that removes it and a test that fails on it. Also fixes SPEC round 3 finding 1 / STANDARDS finding 2 - the CHANGELOG still described the rejected would-fail-to-catch formulation and upgrade action 2 pointed installers at it, which could have reintroduced the vacuous check during reconciliation.
- 2026-08-06T15:40:34Z — moved to review
- 2026-08-06T15:40:35Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-06T15:40:35Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-06T15:40:38Z — run: node scripts/validate-foundry.mjs
  started 2026-08-06T15:40:35Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
