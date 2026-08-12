---
id: task-6246861934000005
title: Add one-click choice affordance to visual-review annotations
status: done
priority: p3
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-12T00:41:14Z"
updatedAt: "2026-08-12T01:24:17Z"
---

<!-- task-tracker:description -->
## Description

Operator feedback from the first real visual-review session (2026-08-11): when an artifact presents a plan with multiple-choice questions, selecting an option requires clicking the option and typing a comment such as 'this one'. The operator asked for choice elements that send the selected choice to the agent in one click. Sketch: the artifact author marks an element with a data attribute the injected SDK recognises, and a click on it posts an annotation whose comment is that choice's label, with no typing and no Send press. Open question to settle first: ADR-0003 fixed the scope at 'element and text-selection annotation UI', so decide whether this is a refinement of that UI or a scope extension needing an ADR amendment. Do not implement before that is answered.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:41:14Z — created (status: backlog)
- 2026-08-12T00:48:47Z — note: ADR-0004 written and accepted (operator directed the scope-extension route on 2026-08-11 and had already requested the feature; adr skill permits accepted with citation). Decision: opt-in data attribute on artifact elements; a click posts an annotation carrying that element's label with no typing and no Send press. Existing transport, content-type/Origin gating, and length caps unchanged; artifact markup stays untrusted data. Index row added to docs/adr/README.md in the same change.
- 2026-08-12T01:08:50Z — note: rubric: (1) An element carrying the opt-in marker posts exactly one annotation on click, with that element's label as the comment and no typing or Send press. (2) An artifact without the marker behaves exactly as before - element and text selection unchanged. (3) The posted comment respects the existing length cap and the annotation travels the existing endpoint with its existing content-type and Origin gating. (4) The marker is documented in both trees' SKILL.md with a copyable example, and the docs state that a click sends immediately and cannot be retracted through the UI. (5) Tests cover marked-click, unmarked-artifact regression, and label truncation; check-skill-sync and validate-foundry pass.
- 2026-08-12T01:08:50Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T01:14:32Z — moved to review
- 2026-08-12T01:14:41Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:14:40Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  | ✔ shell page behavior (executed, not pattern-matched) (9.7932ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2558ms)
  |   ✔ rejects a foreign Host header on every route (6.2163ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9758ms)
  |   ✔ confines every served document to the review server via CSP (10.7011ms)
  |   ✔ serves the artifact with the SDK tag injected (2.7229ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.8147ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (24.9659ms)
  |   ✔ parks a long-poll until an annotation arrives (78.0491ms)
  |   ✔ returns an empty batch when the long-poll times out (123.4457ms)
  |   ✔ rejects cross-site annotation posts (33.5014ms)
  |   ✔ accepts a choice annotation and caps its comment (29.1678ms)
  |   ✔ keeps the SDK inert for artifacts without the choice marker (0.9792ms)
  |   ✔ rejects malformed annotation payloads (44.4123ms)
  |   ✔ bumps the reload version when the artifact directory changes (327.1822ms)
  |   ✔ reports whether the artifact directory is being watched (77.2176ms)
  |   ✔ stops claiming to watch after the watcher errors (0.3148ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (0.922ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (6.4213ms)
  |   ✔ refuses to start on a missing artifact (0.2543ms)
  | ✔ visual-review server (774.4198ms)
  | ℹ tests 45
  | ℹ suites 7
  | ℹ pass 45
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 900.6494
- 2026-08-12T01:14:42Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:14:41Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  | ✔ shell page behavior (executed, not pattern-matched) (9.5369ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.1642ms)
  |   ✔ rejects a foreign Host header on every route (5.296ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9091ms)
  |   ✔ confines every served document to the review server via CSP (8.618ms)
  |   ✔ serves the artifact with the SDK tag injected (2.6802ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.0128ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (10.7592ms)
  |   ✔ parks a long-poll until an annotation arrives (91.3535ms)
  |   ✔ returns an empty batch when the long-poll times out (123.3523ms)
  |   ✔ rejects cross-site annotation posts (45.5499ms)
  |   ✔ accepts a choice annotation and caps its comment (45.8543ms)
  |   ✔ keeps the SDK inert for artifacts without the choice marker (0.7529ms)
  |   ✔ rejects malformed annotation payloads (16.2797ms)
  |   ✔ bumps the reload version when the artifact directory changes (326.7501ms)
  |   ✔ reports whether the artifact directory is being watched (78.5105ms)
  |   ✔ stops claiming to watch after the watcher errors (0.4497ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (0.8778ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (4.7787ms)
  |   ✔ refuses to start on a missing artifact (0.2441ms)
  | ✔ visual-review server (769.0343ms)
  | ℹ tests 45
  | ℹ suites 7
  | ℹ pass 45
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 895.3261
- 2026-08-12T01:14:45Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T01:14:42Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T01:15:22Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0005-r1 --cwd .
  started 2026-08-12T01:14:45Z, exit 0 in 36.7s
  output tail (truncated to last 30 lines):
  | : "019ff389-3e12-7201-a033-334fb41c63fb",
  |         "usage": {
  |           "inputTokens": 29427,
  |           "cachedInputTokens": 0,
  |           "outputTokens": 1517,
  |           "reasoningOutputTokens": 1034
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "C:\\Users\\shift\\.t3\\worktrees\\agent-foundry\\t3code-e5fde2d8",
  |           "access": "answer-only"
  |         },
  |         "stderr": "",
  |         "durationMs": 36535
  |       },
  |       "finalText": "1. `starter/.agents/skills/visual-review/scripts/visual-review.mjs: window message handler` | rubric 1; untrusted-markup and trust-boundary standards | the handler auto-posts any message whose payload claims `source: \"visual-review\"` and `kind: \"choice\"`; it neither verifies `event.source` nor proves the message resulted from a marked-element click. Untrusted artifact code or another window can therefore forge immediate operator annotations through the trusted shell, while the shell’s same-origin request still passes existing Origin gating. The tests directly invoke this permissive handler and do not cover forged-message rejection. | severity high | confidence high\n\nCHECKED\n\n- Rubric 1 — traced marked click from `choiceFor` through `postMessage` and immediate annotation POST; found the authentication failure above.\n- Rubric 2 — verified unmarked elements retain the existing `element` selection path, with executed regression coverage.\n- Rubric 3 — verified use of `POST /api/annotations`, JSON content type, SDK truncation, and the existing server-side 8000-character cap; existing Origin gating is unchanged but does not prevent the forged-message path.\n- Rubric 4 — verified both SKILL.md trees contain copyable markup and explicitly document immediate, unretractable sending.\n- Rubric 5 — verified packet coverage for marked click, ancestor lookup, empty-marker fallback, unmarked behavior, and truncation; recorded evidence reports both test suites, skill synchronization, and validation passing.\n- Accepted ADR requirement — confirmed the packet identifies accepted ADR-0004 before implementation.\n- Behavioral-validation standard — confirmed executable SDK, shell, and server tests rather than compilation-only evidence.\n- Security and data-boundary standards — traced untrusted artifact data across iframe messaging and server transport; found missing message provenance enforcement.\n- State and transport standards — confirmed no persistence or new endpoint was introduced and the existing queue/transport remains authoritative.\n- Documentation standards — checked behavior, opt-in contract, fallback, cap, and UI limitation documentation in both synchronized trees.\n- Dependency and scope standards — found no new dependency or out-of-scope production-file change in the supplied diff.\n- Version-control standards — inspected packet status; the unrelated task-6246861934000006 modification is unstaged packet context and not part of the supplied in-scope diff."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:17:32Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:17:31Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  | ✔ shell page behavior (executed, not pattern-matched) (12.1303ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.3816ms)
  |   ✔ rejects a foreign Host header on every route (7.1211ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (1.1739ms)
  |   ✔ confines every served document to the review server via CSP (13.3287ms)
  |   ✔ serves the artifact with the SDK tag injected (1.9734ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.2952ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (26.5405ms)
  |   ✔ parks a long-poll until an annotation arrives (92.9931ms)
  |   ✔ returns an empty batch when the long-poll times out (123.7796ms)
  |   ✔ rejects cross-site annotation posts (46.2289ms)
  |   ✔ accepts a choice annotation and caps its comment (46.7321ms)
  |   ✔ keeps the SDK inert for artifacts without the choice marker (0.8608ms)
  |   ✔ rejects malformed annotation payloads (44.1176ms)
  |   ✔ bumps the reload version when the artifact directory changes (322.5117ms)
  |   ✔ reports whether the artifact directory is being watched (60.2398ms)
  |   ✔ stops claiming to watch after the watcher errors (0.4898ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (1.4324ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (7.4494ms)
  |   ✔ refuses to start on a missing artifact (0.2531ms)
  | ✔ visual-review server (804.2875ms)
  | ℹ tests 47
  | ℹ suites 7
  | ℹ pass 47
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 940.9237
- 2026-08-12T01:17:33Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:17:32Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  | ✔ shell page behavior (executed, not pattern-matched) (10.6932ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2962ms)
  |   ✔ rejects a foreign Host header on every route (6.3554ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9947ms)
  |   ✔ confines every served document to the review server via CSP (10.4703ms)
  |   ✔ serves the artifact with the SDK tag injected (2.4035ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.3788ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (9.5886ms)
  |   ✔ parks a long-poll until an annotation arrives (78.8004ms)
  |   ✔ returns an empty batch when the long-poll times out (124.3784ms)
  |   ✔ rejects cross-site annotation posts (46.66ms)
  |   ✔ accepts a choice annotation and caps its comment (30.8731ms)
  |   ✔ keeps the SDK inert for artifacts without the choice marker (0.7898ms)
  |   ✔ rejects malformed annotation payloads (45.4902ms)
  |   ✔ bumps the reload version when the artifact directory changes (324.1501ms)
  |   ✔ reports whether the artifact directory is being watched (77.0356ms)
  |   ✔ stops claiming to watch after the watcher errors (0.342ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (1.0014ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (7.0846ms)
  |   ✔ refuses to start on a missing artifact (0.2757ms)
  | ✔ visual-review server (773.4898ms)
  | ℹ tests 47
  | ℹ suites 7
  | ℹ pass 47
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 907.8203
- 2026-08-12T01:17:37Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T01:17:33Z, exit 0 in 3.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T01:19:18Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0005-r2 --cwd .
  started 2026-08-12T01:17:37Z, exit 0 in 100.8s
  output tail (truncated to last 30 lines):
  |     "reasoningOutputTokens": 4359
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "C:\\Users\\shift\\.t3\\worktrees\\agent-foundry\\t3code-e5fde2d8",
  |           "access": "answer-only"
  |         },
  |         "stderr": "",
  |         "durationMs": 100649
  |       },
  |       "finalText": "1. packet: choice transport tests | rubric 3; verify existing content-type and Origin gating | The shell test checks only the JSON body, while the server test supplies no Origin header. The packet therefore does not verify that choice annotations retain the required content-type and Origin enforcement. | severity med | confidence high\n\n2. starter/*/visual-review.test.mjs | Testing: test meaningful failure and retry paths | No test executes a failed automatic choice POST or its retry. The packet does not establish that failure remains visible, is not recorded as sent, and can be retried without duplication. | severity med | confidence high\n\n3. packet: recorded gate evidence | Project invariant: a disposable clean-project bootstrap is the acceptance test | Evidence for `node scripts/test-bootstrap.mjs` is absent, so the required installed-payload acceptance gate cannot be verified. | severity med | confidence high\n\n4. packet: recorded gate evidence | Project validation invariant: scan `starter/` for source-project names, absolute paths, and unresolved identity tokens | No scan result or equivalent validation evidence is included. | severity low | confidence high\n\nCHECKED\n\n- Accepted architecture decision: verified the packet identifies accepted ADR-0004 and its relationship to ADR-0003.\n- Explicit implementation and single source of truth: verified both harness trees contain equivalent, direct implementations; synchronization evidence reports PASS.\n- Scope and dependencies: verified no new dependency, persistence mechanism, route, or network surface appears in the diff.\n- Untrusted markup boundary: verified marker data is treated as label/selector data, capped before transport, and foreign-window messages are rejected.\n- Success and empty-marker behavior: verified behavioral tests cover marked clicks, marked ancestors, text fallback, and immediate posting.\n- Unmarked regression: verified SDK and shell tests preserve the ordinary select-then-comment path.\n- Length boundaries: verified SDK tests cover 900 and 9000 characters, and the server test enforces the 8000-character cap.\n- Documentation: verified both `SKILL.md` copies provide a copyable example and document immediate sending, opt-in behavior, and lack of UI retraction.\n- Behavioral validation: verified the packet reports 47/47 for both harnesses and red-capable seeded-defect runs.\n- Required task gates: verified `check-skill-sync` and `validate-foundry` are reported as passing.\n- Version-control scope: verified implementation changes are confined to visual-review; the out-of-scope task file appears in status but not in the supplied change diff."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:21:21Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-12T01:20:06Z, exit 0 in 75.1s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\clean-project\.agent-foundry-backups\20260812T012116692Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\clean-project
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\seed-upgrade-project\.agent-foundry-backups\20260812T012118753Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\seed-upgrade-project
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\clean-project\.agent-foundry-backups\20260812T012120746Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F8p5yl\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-12T01:21:50Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:21:49Z, exit 0 in 1.1s
  output tail (truncated to last 30 lines):
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2961ms)
  |   ✔ rejects a foreign Host header on every route (6.5428ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9434ms)
  |   ✔ confines every served document to the review server via CSP (9.2652ms)
  |   ✔ serves the artifact with the SDK tag injected (1.3965ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.2044ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (12.2891ms)
  |   ✔ parks a long-poll until an annotation arrives (92.4075ms)
  |   ✔ returns an empty batch when the long-poll times out (122.0219ms)
  |   ✔ rejects cross-site annotation posts (45.8214ms)
  |   ✔ accepts a choice annotation and caps its comment (46.7343ms)
  |   ✔ applies the same content-type and Origin gating to a choice (46.4763ms)
  |   ✔ keeps the SDK inert for artifacts without the choice marker (0.7952ms)
  |   ✔ rejects malformed annotation payloads (44.9544ms)
  |   ✔ bumps the reload version when the artifact directory changes (312.4307ms)
  |   ✔ reports whether the artifact directory is being watched (61.6659ms)
  |   ✔ stops claiming to watch after the watcher errors (0.3302ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (1.9071ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (7.2993ms)
  |   ✔ refuses to start on a missing artifact (0.1925ms)
  | ✔ visual-review server (819.862ms)
  | ℹ tests 49
  | ℹ suites 7
  | ℹ pass 49
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 973.2078
- 2026-08-12T01:21:51Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:21:50Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.1816ms)
  |   ✔ rejects a foreign Host header on every route (5.7222ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.7766ms)
  |   ✔ confines every served document to the review server via CSP (17.2631ms)
  |   ✔ serves the artifact with the SDK tag injected (1.3547ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (1.9871ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (15.4495ms)
  |   ✔ parks a long-poll until an annotation arrives (94.1581ms)
  |   ✔ returns an empty batch when the long-poll times out (123.8921ms)
  |   ✔ rejects cross-site annotation posts (45.9746ms)
  |   ✔ accepts a choice annotation and caps its comment (31.5683ms)
  |   ✔ applies the same content-type and Origin gating to a choice (45.7613ms)
  |   ✔ keeps the SDK inert for artifacts without the choice marker (0.983ms)
  |   ✔ rejects malformed annotation payloads (47.0525ms)
  |   ✔ bumps the reload version when the artifact directory changes (327.6197ms)
  |   ✔ reports whether the artifact directory is being watched (61.2188ms)
  |   ✔ stops claiming to watch after the watcher errors (0.5515ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (1.8292ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (5.7242ms)
  |   ✔ refuses to start on a missing artifact (0.1868ms)
  | ✔ visual-review server (833.3395ms)
  | ℹ tests 49
  | ℹ suites 7
  | ℹ pass 49
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 957.9073
- 2026-08-12T01:22:42Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0005-r3 --cwd .
  started 2026-08-12T01:21:51Z, exit 0 in 50.9s
  output tail (truncated to last 30 lines):
  |                 "input_tokens": 34163,
  |                 "cached_input_tokens": 9984,
  |                 "cache_write_input_tokens": 0,
  |                 "output_tokens": 1170,
  |                 "reasoning_output_tokens": 928
  |               }
  |             }
  |           }
  |         ],
  |         "exitCode": 0,
  |         "sessionId": "019ff38f-c6f4-7fe3-a03a-04fdae5c0d26",
  |         "usage": {
  |           "inputTokens": 34163,
  |           "cachedInputTokens": 9984,
  |           "outputTokens": 1170,
  |           "reasoningOutputTokens": 928
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "C:\\Users\\shift\\.t3\\worktrees\\agent-foundry\\t3code-e5fde2d8",
  |           "access": "answer-only"
  |         },
  |         "stderr": "",
  |         "durationMs": 50721
  |       },
  |       "finalText": "PASS\n\nCHECKED\n\n- Behavioral validation: marked click, ancestor lookup, empty-marker fallback, unmarked regression, label truncation, failed-send visibility, and retry behavior have executed tests.\n- Security and trust boundaries: choice uses existing `/api/annotations`; JSON content-type and Origin gating are tested; foreign-window messages are rejected; artifact markup remains untrusted feedback.\n- State and data: existing 8,000-character comment cap remains authoritative; no persistence, new network surface, or wire endpoint was introduced.\n- Architecture: implementation matches accepted ADR-0004 and retains ADR-0003 constraints.\n- Documentation: both skill trees document `data-vr-choice` with copyable examples, immediate sending, opt-in behavior, and lack of UI retraction.\n- Synchronization: both harness trees contain equivalent changes; `check-skill-sync` passed for all 17 shared skills.\n- Project acceptance: both 49-test suites, `validate-foundry`, and disposable clean-project `test-bootstrap` passed.\n- Scope and version control: reviewed diff is limited to the visual-review behavior, tests, and documentation; unrelated task-state modifications were not included in the scoped packet."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:23:01Z — note: cold review: rung 1, provider codex, 3 rounds. R1 STANDARDS high - the shell message handler auto-posted any message claiming kind 'choice' without checking its source, so any window reaching the page could forge operator decisions with no keystroke; this contradicted ADR-0004's own constraint that artifact markup cannot direct the agent. Fixed with an event.source === frame.contentWindow gate applied before the payload is inspected, covering every annotation kind. Stated honestly rather than overclaimed: the artifact frame is itself untrusted and can still self-report, because a parent cannot observe a click inside a sandboxed cross-origin frame; SKILL.md now says a choice proves the artifact reported a click, not that a human made one. R1 SPEC med - label truncated at 400 against an 8000 comment cap; now matches. R2: four evidence findings - choice-specific content-type/Origin gating, failed-choice-and-retry behavior, and test-bootstrap all now covered; the starter/-scan finding was discarded with citation because validate-foundry.mjs performs exactly that scan. R3: SPEC PASS, STANDARDS PASS.
- 2026-08-12T01:23:01Z — moved to done
- 2026-08-12T01:24:17Z — note: live browser confirmation on the final tree: one click on an option marked data-vr-choice produced exactly one queued annotation - kind choice, selector #yes, comment 'Yes - one click sent it' - with no typing and no Send press. An accidental click on the unmarked h1 in the same session set the selection but queued nothing, confirming the opt-in boundary end to end. This supersedes the earlier note that the browser check could not be completed.
