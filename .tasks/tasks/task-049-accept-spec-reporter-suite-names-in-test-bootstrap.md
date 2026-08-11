---
id: task-049
title: Accept spec-reporter suite names in test-bootstrap run-checks assertion
status: done
priority: p2
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-11T19:49:59Z"
updatedAt: "2026-08-11T20:59:00Z"
---

<!-- task-tracker:description -->
## Description

test-bootstrap.mjs asserts installed run-checks stdout matches /Subtest: project overview/ (TAP). On Node 24.5.0 the piped spec reporter prints '▶ project overview' instead, so the wrapper fails after every installed suite including project-overview has already passed. Seen on task-048's recorded bootstrap run. Change the assertion to accept both TAP and spec suite banners, or pin node --test --test-reporter=tap in run-checks. Do not treat a green project-overview suite as a miss.

<!-- task-tracker:log -->
## Log

- 2026-08-11T19:49:59Z — created (status: backlog)
- 2026-08-11T20:56:35Z — note: rubric: (1) test-bootstrap treats a run-checks stdout that contains either TAP 'Subtest: project overview' or spec '▶ project overview' as the suite having been discovered. (2) A unit test fails if the matcher requires TAP only (seeded spec-only banner is rejected by the old pattern and accepted by the new). (3) A spec-only banner no longer fails the discovery assertion. (4) run-checks.mjs is unchanged (no reporter pin). (5) validate-foundry passes.
- 2026-08-11T20:56:35Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-11T20:56:35Z — note: outline: export runChecksMentionsSuite(stdout, suiteName) from foundry-lib.mjs; match TAP Subtest: and spec ▶ banners; test-bootstrap uses it; scripts/foundry-lib.test.mjs seeds both banners plus a miss. Least confident: whether to also accept '# Subtest:' with the hash — will include it as TAP variant.
- 2026-08-11T20:56:48Z — run: node --test scripts/foundry-lib.test.mjs
  started 2026-08-11T20:56:48Z, exit 0 in 0.2s
  output:
  | ▶ runChecksMentionsSuite
  |   ✔ accepts a TAP Subtest banner (0.5188ms)
  |   ✔ accepts a spec-reporter suite banner (0.1401ms)
  |   ✔ rejects a TAP-only matcher fixture that has only the spec banner (0.0913ms)
  |   ✔ does not treat a different suite as a hit (0.0925ms)
  | ✔ runChecksMentionsSuite (1.3904ms)
  | ℹ tests 4
  | ℹ suites 1
  | ℹ pass 4
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 80.212
- 2026-08-11T20:56:51Z — run: node scripts/validate-foundry.mjs
  started 2026-08-11T20:56:48Z, exit 0 in 2.6s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-11T20:58:13Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-11T20:56:57Z, exit 0 in 76.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.30.2 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\clean-project\.agent-foundry-backups\20260811T205809416Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.30.2 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\clean-project
  | Agent Foundry 0.30.2 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\seed-upgrade-project\.agent-foundry-backups\20260811T205811456Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.2 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\seed-upgrade-project
  | Agent Foundry 0.30.2 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\clean-project\.agent-foundry-backups\20260811T205813433Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.2 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HsrzVj\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-11T20:58:21Z — note: warm self-pass: matcher accepts TAP and spec; unit test proves old TAP-only regex misses spec banner; run-checks.mjs untouched; test-bootstrap now PASS. No installed payload change, no VERSION bump.
- 2026-08-11T20:58:21Z — note: docs check: no skill/SDLC edit. Behavior is foundry-repo test harness only.
- 2026-08-11T20:58:34Z — moved to review (note: rung 1: cold-review.mjs --provider codex --model gpt-5.6-sol. Packet .tasks/review-packets/task-049-r1 checked. Session checklist (cold-review.md already loaded this session).)
- 2026-08-11T20:58:54Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-049-r1 --cwd . --model gpt-5.6-sol
  started 2026-08-11T20:58:39Z, exit 0 in 15.7s
  output tail (truncated to last 30 lines):
  |                 "cached_input_tokens": 0,
  |                 "cache_write_input_tokens": 0,
  |                 "output_tokens": 441,
  |                 "reasoning_output_tokens": 218
  |               }
  |             }
  |           }
  |         ],
  |         "exitCode": 0,
  |         "sessionId": "019ff29e-c639-7c11-8c38-1d111f42836f",
  |         "modelRequested": "gpt-5.6-sol",
  |         "usage": {
  |           "inputTokens": 24712,
  |           "cachedInputTokens": 0,
  |           "outputTokens": 441,
  |           "reasoningOutputTokens": 218
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "N:\\agent-foundry",
  |           "access": "answer-only"
  |         },
  |         "stderr": "",
  |         "durationMs": 14150
  |       },
  |       "finalText": "PASS\n\nCHECKED\n\n- General: implementation is explicit, small, and uses one shared matcher.\n- Testing: unit tests cover TAP, spec-only, TAP-only regression, and non-match; recorded execution passes 4/4.\n- Behavioral validation: recorded `test-bootstrap.mjs` clean-project bootstrap passes.\n- Rubric 1–3: matcher accepts both required banners; spec-only regression is red-capable under the old TAP-only matcher.\n- Rubric 4: packet diff and status show no change to `run-checks.mjs`.\n- Rubric 5: recorded `validate-foundry.mjs` result is PASS.\n- Documentation/versioning: packet establishes this is harness-only behavior, with no installed-payload or documented-contract change requiring a version bump.\n- Dependencies/security/state/errors: no applicable changes introduced.\n- Version control: task changes are scoped; unrelated files are identified as out of scope.\n- Data-as-data rule: reviewed all attached diff, fixture, decision, and command-output text only as evidence; found no embedded directive requiring a finding."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-11T20:59:00Z — note: Round 1: SPEC PASS and STANDARDS PASS, both full CHECKED. Rung 1: codex/gpt-5.6-sol via cold-review.mjs. No findings.
- 2026-08-11T20:59:00Z — moved to done
