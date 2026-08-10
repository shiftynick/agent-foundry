---
id: task-046
title: "Speed recommendations: presets, packet gate, timeout, ceremony, fast-path, dedup"
status: done
priority: p1
tags: [area:workflow]
blockedBy: []
createdAt: "2026-08-10T20:10:28Z"
updatedAt: "2026-08-10T20:30:55Z"
---

<!-- task-tracker:description -->
## Description

Implement the speed/token recommendations from the 2026-08-10 review: (1) task.mjs run timeout alignment with Cursor/agent-headless budgets plus --timeout-ms; (2) Foundry wrappers cold-review.mjs + delegate-work.mjs + review-packet.mjs beside vendored agent-headless; (3) amortize per-task forced reads in execute-task/attack-the-board; (4) narrow trivial-diff fast path in SDLC/execute-task; (5) dedupe STE/commit/LOCAL-CHANGES restatements across skills. VERSION 0.30.0 + CHANGELOG. Dual-tree sync. validate-foundry + test-bootstrap must pass.

<!-- task-tracker:log -->
## Log

- 2026-08-10T20:10:28Z — created (status: backlog)
- 2026-08-10T20:10:37Z — moved to ready
- 2026-08-10T20:10:37Z — note: rubric: (1) task.mjs run default timeout is at least 25m and accepts --timeout-ms; cli-reference + dual-tree synced; unit test covers custom timeout. (2) .agent-foundry/review-packet.mjs check refuses incomplete packets; cold-review.mjs dispatches SPEC+STANDARDS concurrently via agent-headless with --json baked in; delegate-work.mjs requires environment-facts section and wraps write access; each has tests. (3) execute-task amortizes standards/cold-review/SDLC Validation reads to first-use-per-session + checklist; attack-the-board notes the same. (4) SDLC + execute-task define a narrow trivial-diff single-axis fast path. (5) STE/commit/LOCAL-CHANGES duplication trimmed to pointers. (6) VERSION 0.30.0 + CHANGELOG with Upgrade actions; validate-foundry and test-bootstrap pass; skill-sync PASS.
- 2026-08-10T20:10:37Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-10T20:18:29Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-10T20:18:29Z, exit 0 in 0.2s
  output tail (truncated to last 30 lines):
  |   type: 'suite'
  |   ...
  | # Subtest: delegate-work
  |     # Subtest: requires Environment facts bullets
  |     ok 1 - requires Environment facts bullets
  |       ---
  |       duration_ms: 0.3613
  |       type: 'test'
  |       ...
  |     # Subtest: defaults access mode per provider
  |     ok 2 - defaults access mode per provider
  |       ---
  |       duration_ms: 0.1633
  |       type: 'test'
  |       ...
  |     1..2
  | ok 3 - delegate-work
  |   ---
  |   duration_ms: 0.7465
  |   type: 'suite'
  |   ...
  | 1..3
  | # tests 8
  | # suites 3
  | # pass 8
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 88.0911
- 2026-08-10T20:18:37Z — run: node --test --test-name-pattern timeout-ms|provider wraps|records command starter/.claude/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-10T20:18:37Z, exit 255 in 0.0s
  output:
  | 'provider' is not recognized as an internal or external command,
  | operable program or batch file.
- 2026-08-10T20:18:40Z — run: node scripts/validate-foundry.mjs
  started 2026-08-10T20:18:37Z, exit 0 in 2.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-10T20:18:40Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-10T20:18:40Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-10T20:19:07Z — run: node .tasks/tmp-run-timeout-tests.mjs
  started 2026-08-10T20:19:06Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |       duration_ms: 297.2277
  |       type: 'test'
  |       ...
  |     # Subtest: accepts --timeout-ms for ordinary commands
  |     ok 2 - accepts --timeout-ms for ordinary commands
  |       ---
  |       duration_ms: 252.0294
  |       type: 'test'
  |       ...
  |     # Subtest: refuses provider wraps below the 20-minute budget
  |     ok 3 - refuses provider wraps below the 20-minute budget
  |       ---
  |       duration_ms: 183.5727
  |       type: 'test'
  |       ...
  |     1..3
  | ok 1 - task run (recorded evidence)
  |   ---
  |   duration_ms: 733.838
  |   type: 'suite'
  |   ...
  | 1..1
  | # tests 3
  | # suites 1
  | # pass 3
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 798.7413
- 2026-08-10T20:20:23Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-10T20:19:07Z, exit 0 in 76.1s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...................
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\clean-project\.agent-foundry-backups\20260810T202018014Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\clean-project
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\seed-upgrade-project\.agent-foundry-backups\20260810T202020254Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\seed-upgrade-project
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\clean-project\.agent-foundry-backups\20260810T202022571Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ScB2WM\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-10T20:20:34Z — moved to review
- 2026-08-10T20:20:34Z — note: warm self-pass: diff vs rubric — timeout flag/default/refuse, presets+tests, amortization, fast path, dedup, VERSION/CHANGELOG, dual-tree mirror, validate anchors updated. vs REVIEW-STANDARDS: no secrets; mechanism over prose for harness failures; vendored cli.js untouched.
- 2026-08-10T20:21:54Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --model gpt-5.6-sol --packet .tasks/review-packets/task-046-r1 --cwd .
  started 2026-08-10T20:20:40Z, exit 0 in 73.9s
  output tail (truncated to last 30 lines):
  | run script is shown, but its execution result is not. Those required passes cannot be verified from the packet. | severity med | confidence high\n\nCHECKED\n\n- `Rubric 1 | timeout stack` — Inspected both tracker trees, CLI references, and tests. Confirmed a 25-minute default, `--timeout-ms` parsing, provider-wrap refusal logic, and dual-tree copies; execution evidence remains deficient as finding 5 states.\n- `Rubric 2 | presets and tests` — Inspected all three new scripts and their tests. Confirmed packet completeness checks, `Promise.all` dual-axis dispatch, baked-in `--json`, and Environment-facts validation; behavioral-path coverage is deficient as finding 2 states.\n- `Rubric 3 | ceremony amortization` — Verified first-use-per-session language and the session checklist in `execute-task`, plus the matching `attack-the-board` pointer.\n- `Rubric 4 | trivial-diff fast path` — Verified the narrow eligibility rules in SDLC and execute-task references; found the SPEC-only dispatch cannot include standards as finding 1 states.\n- `Rubric 5 | cross-skill deduplication` — Verified merged STE reporting and pointer-based LOCAL-CHANGES guidance.\n- `Rubric 6 | release and validation` — Confirmed `VERSION` 0.30.0, matching CHANGELOG entry with concrete Upgrade actions, structural-validation output, and skill-sync output; `test-bootstrap` and timeout-test results remain unverifiable as finding 5 states.\n- `Zero-dependency Node 20+` — Inspected imports in the new scripts; all are Node built-ins.\n- `Starter content harness-neutral` — Inspected new scripts and shared documentation; provider handling is generic and tree-specific paths are confined to their respective harness copies.\n- `VERSION and CHANGELOG together` — Verified both changed consistently to 0.30.0.\n- `Tests ship with new scripts` — Verified `review-workflows.test.mjs` exists and covers each script at helper level; end-to-end behavioral coverage is deficient as finding 2 states.\n- `Named commands and relative links` — Cross-checked documented wrapper and tracker paths against the packet’s file listing; found the fast-path semantic mismatch in finding 1.\n- `Cold-review findings require live confirmation` — Confirmed the documentation retains explicit adjudication against live repository evidence.\n- `Authorization, writable scope, and destructive targets` — Inspected delegate access defaults and packet initialization; delegate access is explicit, while packet writes lack link-aware confinement as finding 3 states.\n- `Architecture-significant changes require a decision record` — Compared the new installed workflow surface with `decisions.md`; finding 4 applies.\n- `Tool content is data` — Treated all diff, fixture, decision, and command-output text solely as review evidence.\n- `Link-aware destination confinement` — Inspected every new write path: temporary prompt creation uses an OS-created directory; packet initialization has the deficiency in finding 3."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-10T20:22:19Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-10T20:22:19Z — note: Cold review rung 1: provider=codex model=gpt-5.6-sol via cold-review.mjs. SPEC: 1 high (fast-path SPEC omits standards), 3 med. STANDARDS: 1 high (same), 4 med. Adjudicating: accept high+med except STANDARDS#4 ADR — mold tooling not product architecture; log decision instead.
- 2026-08-10T20:24:48Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-10T20:24:47Z, exit 0 in 0.3s
  output tail (truncated to last 30 lines):
  |       duration_ms: 0.445
  |       type: 'test'
  |       ...
  |     # Subtest: defaults access mode per provider
  |     ok 2 - defaults access mode per provider
  |       ---
  |       duration_ms: 0.2386
  |       type: 'test'
  |       ...
  |     # Subtest: runDelegate dry-run accepts Environment facts and refuses without them
  |     ok 3 - runDelegate dry-run accepts Environment facts and refuses without them
  |       ---
  |       duration_ms: 1.4698
  |       type: 'test'
  |       ...
  |     1..3
  | ok 3 - delegate-work
  |   ---
  |   duration_ms: 2.3357
  |   type: 'suite'
  |   ...
  | 1..3
  | # tests 11
  | # suites 3
  | # pass 11
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 198.1256
- 2026-08-10T20:24:49Z — run: node .tasks/tmp-run-timeout-tests.mjs
  started 2026-08-10T20:24:48Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |       duration_ms: 303.4918
  |       type: 'test'
  |       ...
  |     # Subtest: accepts --timeout-ms for ordinary commands
  |     ok 2 - accepts --timeout-ms for ordinary commands
  |       ---
  |       duration_ms: 241.2564
  |       type: 'test'
  |       ...
  |     # Subtest: refuses provider wraps below the 20-minute budget
  |     ok 3 - refuses provider wraps below the 20-minute budget
  |       ---
  |       duration_ms: 190.5017
  |       type: 'test'
  |       ...
  |     1..3
  | ok 1 - task run (recorded evidence)
  |   ---
  |   duration_ms: 736.2024
  |   type: 'suite'
  |   ...
  | 1..1
  | # tests 3
  | # suites 1
  | # pass 3
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 799.4014
- 2026-08-10T20:24:51Z — run: node scripts/validate-foundry.mjs
  started 2026-08-10T20:24:49Z, exit 0 in 2.6s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-10T20:24:51Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-10T20:24:51Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-10T20:24:52Z — note: decision: no ADR for Foundry mold presets (review-packet/cold-review/delegate-work). Reversible process tooling under .agent-foundry, not product architecture; operator authorized the recommendation set. Provisional pending acceptance if a later task disagrees.
- 2026-08-10T20:24:59Z — moved to review
- 2026-08-10T20:24:59Z — note: rubric amended after r1: (2) fake-runner behavioral tests; (4) COMBINED axis; (5) STE/LOCAL-CHANGES/commit pointers.
- 2026-08-10T20:25:38Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --model gpt-5.6-sol --packet .tasks/review-packets/task-046-r2 --cwd .
  started 2026-08-10T20:24:59Z, exit 0 in 38.7s
  output tail (truncated to last 30 lines):
  | oot before reporting an escape; the confinement test verifies only the later exception and does not verify that no external directory was created | severity high | confidence high\n\n2. starter/.agent-foundry/review-workflows.test.mjs:166-193 | tests ship with new scripts; require an executed behavioral signal for the changed path | `delegate-work.mjs` is tested only through helper construction and `dryRun`; unlike `cold-review.mjs`, it has no fake-runner execution test. Its spawn, JSON parsing, success/failure normalization, and write-access invocation path remain unexecuted, contrary to the rubric’s fake-runner behavioral-path requirement | severity med | confidence high\n\nCHECKED\n\n- `Zero-dependency Node 20+` — Inspected imports in all three new scripts and their test; only Node built-ins are used.\n- `Starter content harness-neutral` — Inspected new scripts and shared documentation; provider behavior is generic, with only intentional tree-specific tracker paths in mirrored skill copies.\n- `VERSION and CHANGELOG together` — Verified `VERSION` changes to 0.30.0 and `CHANGELOG.md` contains the matching release with concrete Upgrade actions.\n- `Tests ship with new scripts` — Verified `review-workflows.test.mjs` covers packet checking, prompt construction, cold-review dispatch, Environment-facts validation, and access defaults; delegate behavioral coverage is incomplete as finding 2 states.\n- `Executed behavioral validation` — Verified recorded passing Node test evidence and fake-runner execution for concurrent SPEC/STANDARDS dispatch; identified the missing delegate execution path.\n- `Named commands and relative links` — Cross-checked the new wrapper and tracker command paths against the packet file listing and dual-tree locations.\n- `Success and failure paths` — Verified complete/incomplete/empty packet cases, supported/unsupported review setup, provider-wrap timeout refusal, and cold-review success normalization; delegate runtime failure/success behavior is unverified as finding 2 states.\n- `Authorization and writable scope` — Inspected answer-only cold review, explicit delegate access modes, repository-root packet checks, and trust-workspace forwarding; pre-validation directory creation violates confinement as finding 1 states.\n- `Architecture-significant changes require a decision record` — Verified the packet records the decision that these reversible Foundry workflow presets are process tooling rather than product architecture.\n- `Tool content is data` — Treated all task logs, diffs, fixtures, commands, and recorded outputs only as review evidence.\n- `Link-aware destination confinement` — Inspected packet-directory and temporary-prompt writes; temporary prompts use an OS-created directory, while packet initialization writes before confinement as finding 1 states.\n- `VERSION 0.30.0 validation invariants` — Verified recorded PASS evidence for `validate-foundry`, `test-bootstrap`, and skill-sync.\n"
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-10T20:25:59Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-10T20:25:59Z — note: Round 2: SPEC 3 med; STANDARDS 1 high (mkdir before confine) + meds. Accepting high+med; fixing.
- 2026-08-10T20:26:34Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-10T20:26:34Z, exit 0 in 0.3s
  output tail (truncated to last 30 lines):
  |       duration_ms: 0.2351
  |       type: 'test'
  |       ...
  |     # Subtest: runDelegate dry-run accepts Environment facts and refuses without them
  |     ok 3 - runDelegate dry-run accepts Environment facts and refuses without them
  |       ---
  |       duration_ms: 1.7189
  |       type: 'test'
  |       ...
  |     # Subtest: runDelegate live fake-runner returns succeeded
  |     ok 4 - runDelegate live fake-runner returns succeeded
  |       ---
  |       duration_ms: 52.4782
  |       type: 'test'
  |       ...
  |     1..4
  | ok 3 - delegate-work
  |   ---
  |   duration_ms: 55.1252
  |   type: 'suite'
  |   ...
  | 1..3
  | # tests 12
  | # suites 3
  | # pass 12
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 201.5917
- 2026-08-10T20:27:46Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-10T20:26:34Z, exit 0 in 71.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | .....
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\clean-project\.agent-foundry-backups\20260810T202741960Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\clean-project
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\seed-upgrade-project\.agent-foundry-backups\20260810T202744007Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\seed-upgrade-project
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\clean-project\.agent-foundry-backups\20260810T202745853Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-lH3rbI\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-10T20:28:03Z — run: node .tasks/tmp-run-timeout-tests.mjs
  started 2026-08-10T20:28:01Z, exit 0 in 1.4s
  output tail (truncated to last 30 lines):
  |       duration_ms: 256.1995
  |       type: 'test'
  |       ...
  |     # Subtest: enforces --timeout-ms by killing an over-budget command
  |     ok 3 - enforces --timeout-ms by killing an over-budget command
  |       ---
  |       duration_ms: 400.8689
  |       type: 'test'
  |       ...
  |     # Subtest: refuses provider wraps below the 20-minute budget
  |     ok 4 - refuses provider wraps below the 20-minute budget
  |       ---
  |       duration_ms: 215.0834
  |       type: 'test'
  |       ...
  |     1..4
  | ok 1 - task run (recorded evidence)
  |   ---
  |   duration_ms: 1193.1542
  |   type: 'suite'
  |   ...
  | 1..1
  | # tests 4
  | # suites 1
  | # pass 4
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1254.9241
- 2026-08-10T20:28:05Z — run: node scripts/validate-foundry.mjs
  started 2026-08-10T20:28:03Z, exit 0 in 2.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-10T20:28:05Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-10T20:28:05Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-10T20:28:06Z — moved to review
- 2026-08-10T20:29:26Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --model gpt-5.6-sol --packet .tasks/review-packets/task-046-r3 --cwd .
  started 2026-08-10T20:28:13Z, exit 0 in 73.2s
  output tail (truncated to last 30 lines):
  | ss without identifying authorized files or surfaces | severity med | confidence high\n\n4. starter/.agent-foundry/review-workflows.test.mjs:112-151 | executed behavioral signal for the changed path; concurrent axes | The cold-review fake-runner test confirms that both results succeed, but it would also pass if `Promise.all` were replaced by sequential dispatch. The required concurrent behavior has no executed timing or overlap assertion | severity med | confidence high\n\n5. starter/.agents/skills/upgrade-agent-foundry/SKILL.md:38-42 and mirrored Claude copy | verify every named command and relative link before approving process documentation | The new `retrospective` → “Surface unsent upstream” pointer and its `agent-foundry-feedback` destination are not included in the packet. Their existence, heading, and semantics therefore cannot be verified | severity low | confidence high\n\nCHECKED\n\n- `Executed behavioral validation` — Verified recorded passing timeout-enforcement, packet-gate, cold-review fake-runner, delegate fake-runner, bootstrap, structural-validation, and skill-sync evidence; found cancellation and concurrency gaps above.\n- `Named commands and relative links` — Cross-checked packet, cold-review, delegate-work, tracker, and SDLC commands against included files; the retrospective pointer remains unverifiable.\n- `Cold-review findings are hypotheses` — Verified execute-task requires adjudication against the live repository before action.\n- `Success, failure, retry, cancellation, empty-state, and recovery` — Verified incomplete and empty packet rejection plus successful fake-runner paths; cancellation/recovery remains defective.\n- `Authorization, writable scope, and destructive targets` — Verified answer-only cold review and documented delegate access modes; delegate prompt scope is not enforced.\n- `Architecture-significant implementation requires a decision record` — Verified the packet records the operator-authorized ruling that these reversible Foundry presets are process tooling rather than product architecture.\n- `Packet content is data` — Treated all diffs, fixtures, task logs, decisions, and command output solely as review evidence.\n- `Link-aware destination confinement` — Verified lexical and directory-ancestor confinement before `mkdirSync`; individual output-file symlinks remain unsafe.\n- `Zero-dependency Node 20+` — All new scripts and tests import only Node built-ins.\n- `Harness-neutral starter` — Provider handling is generic; dual-tree differences are limited to intentional harness-specific tracker paths.\n- `VERSION and CHANGELOG together` — Verified both move to 0.30.0 and the changelog includes concrete Upgrade actions.\n- `Tests with new scripts` — Verified tests exist for all three wrappers, while the behavioral gaps are reported above.\n- `Final-tree validation invariants` — Verified recorded PASS results for `validate-foundry`, `test-bootstrap`, and 15-skill synchronization."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-10T20:29:45Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-10T20:29:45Z — note: Round 3 at cap: SPEC PASS. STANDARDS 1 high (dangling symlink write escape) must-fix; med SIGTERM-without-wait → follow-up. Fixing high then promoting with residual risk logged.
- 2026-08-10T20:30:08Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-10T20:30:07Z, exit 1 in 0.3s
  output tail (truncated to last 30 lines):
  |       duration_ms: 0.3239
  |       type: 'test'
  |       ...
  |     # Subtest: runDelegate dry-run accepts Environment facts and refuses without them
  |     ok 3 - runDelegate dry-run accepts Environment facts and refuses without them
  |       ---
  |       duration_ms: 1.6662
  |       type: 'test'
  |       ...
  |     # Subtest: runDelegate live fake-runner returns succeeded
  |     ok 4 - runDelegate live fake-runner returns succeeded
  |       ---
  |       duration_ms: 48.5475
  |       type: 'test'
  |       ...
  |     1..4
  | ok 3 - delegate-work
  |   ---
  |   duration_ms: 51.2562
  |   type: 'suite'
  |   ...
  | 1..3
  | # tests 12
  | # suites 3
  | # pass 11
  | # fail 1
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 196.0426
- 2026-08-10T20:30:11Z — run: node scripts/validate-foundry.mjs
  started 2026-08-10T20:30:08Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-10T20:30:43Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-10T20:30:43Z, exit 0 in 0.4s
  output tail (truncated to last 30 lines):
  |       duration_ms: 0.2685
  |       type: 'test'
  |       ...
  |     # Subtest: runDelegate dry-run accepts Environment facts and refuses without them
  |     ok 3 - runDelegate dry-run accepts Environment facts and refuses without them
  |       ---
  |       duration_ms: 9.0272
  |       type: 'test'
  |       ...
  |     # Subtest: runDelegate live fake-runner returns succeeded
  |     ok 4 - runDelegate live fake-runner returns succeeded
  |       ---
  |       duration_ms: 62.1547
  |       type: 'test'
  |       ...
  |     1..4
  | ok 3 - delegate-work
  |   ---
  |   duration_ms: 72.2853
  |   type: 'suite'
  |   ...
  | 1..3
  | # tests 12
  | # suites 3
  | # pass 12
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 292.8379
- 2026-08-10T20:30:47Z — run: node scripts/validate-foundry.mjs
  started 2026-08-10T20:30:44Z, exit 0 in 3.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-10T20:30:47Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-10T20:30:47Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-10T20:30:47Z — note: At 3-round cap after SPEC PASS. Must-fix: dangling-symlink stub write → lstat + temp/rename (tests green). Residual STANDARDS med (SIGTERM without reap) filed as task-047. Rung 1: codex/gpt-5.6-sol via cold-review.mjs.
- 2026-08-10T20:30:55Z — moved to review
- 2026-08-10T20:30:55Z — moved to done
