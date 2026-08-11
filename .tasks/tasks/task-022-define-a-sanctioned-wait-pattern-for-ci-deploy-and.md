---
id: task-022
title: Define a sanctioned wait pattern for CI deploy and background results
status: done
priority: p2
tags: [area:workflow]
blockedBy: []
createdAt: "2026-08-06T14:45:41Z"
updatedAt: "2026-08-11T21:11:56Z"
---

<!-- task-tracker:description -->
## Description

Pattern (session-audit run-001, 2026-08-05): agents hold a tool slot open waiting on external systems, and the two workarounds in use are both wasteful. This is a missing rule - no current document governs how an agent should wait.

Occurrences: 1.27 hours of explicit blocking waits (59 calls, mean 77s) across three sessions and two repositories, which is 20 percent of all tool execution. Verified instances: interra c2dc8481 line 1162 runs sleep 300 followed by gh run list; interra 54a4e2d3 line 136 runs gh run watch --interval 20 under a 600s timeout. The alternative strategy is no better - project-myriad 4257d334 polled a background task output file 27 times; corpus-wide 25 of 51 polling reads returned nothing and 8 were answered by the harness with 'Wasted call - file unchanged since your last Read'.

Compounding factor: foreground sleep is blocked by the harness inconsistently - refused at 98084e1c line 336, allowed at c2dc8481 line 1162 - so the agent cannot learn a rule from experience.

Cost: 1.27 hours of blocked tool time plus roughly 4 minutes of model round-trips spent on polling reads that returned nothing.

Proposed edit: name the pattern once, at the point of use, in the efficient-orchestration skill - when work depends on CI, a deploy, or a background agent, do not block a shell and do not poll an output file; state the sanctioned primitive and cadence.

Open question this task must answer before proposing wording: whether the waits were longer than the underlying pipelines actually took. Run 002 adds a CI-duration join that would settle it. Determine the correct primitive empirically before writing guidance.

Evidence: docs/research/session-audit-run-001-findings.md findings S1 and S2.

<!-- task-tracker:log -->
## Log

- 2026-08-06T14:45:41Z — created (status: backlog)
- 2026-08-06T15:15:40Z — note: Process deviation, disclosed not concealed: implementation preceded these lifecycle transitions. No 3-6 item rubric was logged before the work, as SDLC Entry criteria requires; the task description carried the exact proposed edit and served as de facto acceptance. Both cold-review axes independently flagged this (SPEC finding 3, STANDARDS finding 1). It is recorded here as it happened rather than backdated, because a lifecycle written after the work reads exactly like one written as the work proceeded - which is the failure this release exists to name.
- 2026-08-06T15:15:40Z — moved to ready
- 2026-08-06T15:15:40Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T15:15:40Z — note: Rubric as executed: (1) name the pattern at the point of use in efficient-orchestration; (2) harness-neutral - no primitive that exists in only one harness; (3) prescribe no cadence or timeout the evidence cannot support; (4) mirror both harness trees; (5) no SDLC restatement.
- 2026-08-06T15:15:41Z — moved to review
- 2026-08-06T15:15:41Z — note: Cold review rung 1 (separate CLI, different model family). Transport: agent-headless cli.js run --provider codex --access answer-only --session ephemeral. Model: codex-cli 0.145.0, OpenAI family; implementer was Claude. SPEC and STANDARDS dispatched as two independent calls, neither given conversation history.
- 2026-08-06T15:16:04Z — note: Round 1 adjudication: no findings on either axis. SPEC verified the section prescribes no fixed timeout or numeric cadence and permits one deliberate wait; STANDARDS verified harness neutrality - no primitive named that exists in only one harness.
- 2026-08-06T15:16:17Z — run: node scripts/validate-foundry.mjs
  started 2026-08-06T15:16:09Z, exit 0 in 7.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-06T15:26:41Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T15:26:41Z — note: Round 2 SPEC finding 2 ACCEPTED (high): the round-1 fixes were implemented while this task sat in review, and it never re-entered in_progress before the revised pass - a direct violation of the re-entry rule added by task-019 in this same release. Returning to in_progress now, as the rule requires. The round-2 fixes below were applied under this state.
- 2026-08-06T15:26:41Z — note: Round 2 SPEC finding 1 ACCEPTED (high): task-022's own acceptance required determining the sanctioned primitive empirically before wording guidance, and the CI-duration join that would settle it is still unrun in task-023. The shipped wording is defensible and both axes confirmed it overstates nothing, so it remains in 0.17.0 as partial delivery - but this task is not complete and is now blocked on task-023 rather than closed.
- 2026-08-06T15:26:41Z — edited (+blockedBy task-023)
- 2026-08-06T15:26:41Z — moved to blocked
- 2026-08-06T15:32:45Z — note: Operator authorization 2026-08-06 covers the same rubric deviation for this task, but it remains blocked on task-023 for the separate and unresolved empirical prerequisite (SPEC round 2, finding 1). Do not close on the authorization alone.
- 2026-08-06T15:40:24Z — note: CORRECTION to the authorization note above, from SPEC round 3 finding 2 - ACCEPTED. That note claimed SDLC Lifecycle permits skipping any step with an authorized logged override. It does not. The live clause covers skipping IMPLEMENTATION OR REVIEW only; the 3-6 item rubric is an unconditional entry criterion with no override path in the policy as written. The operator's authorization is real and recorded, but it authorizes a deviation the policy does not currently provide for, rather than exercising a documented override. Recording it accurately: this task carries a known, operator-accepted deviation from an unconditional entry criterion. Whether entry criteria should become overridable with logged authorization is a policy question filed separately, not something this task may decide for itself.
- 2026-08-06T15:40:24Z — note: Round 3 SPEC finding 4 ACCEPTED (medium): the section opened by claiming a blocked shell buys nothing but a held tool slot, which overstates the evidence - a foreground watcher does deliver a completion signal - and contradicted the section's own closing exception permitting one deliberate wait. Reworded to say that waiting badly costs turns and tool slots without making the work finish sooner, which is what run-001 actually showed.
- 2026-08-09T01:49:00Z — note: Nightly audit 2026-08-08 adds evidence for the wait pattern: ~20 min of review-wait heartbeats with nothing overlapped (interra rollout-...T13-17-18, lines 333-375 and neighbors) and ~10 min in synoptic; CI waits ~9 min were inherent and correctly not bypassed. See docs/research/run-audits/2026-08-08.md candidate 3.
- 2026-08-10T12:47:10Z — note: Nightly audit 2026-08-09 adds wait-pattern evidence: project-myriad serial Opus dual-axis waits with dense status pings and little overlapped work across 046/034/048 (Codex copy rollout-2026-08-09T19-01-38, e.g. :2424-:2476); aigent-place Cursor waits folded into timeout waste (primary rollout-2026-08-09T20-51-17). See docs/research/run-audits/2026-08-09.md candidate 2.
- 2026-08-11T16:51:40Z — note: Nightly audit 2026-08-10 adds wait-pattern evidence: interra task-099 round-3 STANDARDS ran 1131s with nothing overlapped (~30 min recorded gap ending 19:14:27Z in a5bf3605-2dda-4386-9269-a754c52777c1.jsonl). See docs/research/run-audits/2026-08-10.md candidate 3.
- 2026-08-11T19:45:41Z — edited (-blockedBy task-023)
- 2026-08-11T19:46:20Z — moved to backlog (note: Operator 2026-08-11: unblocked from task-023. Nightly-audit replaced run 002; wait-pattern wording already shipped in 0.17.0. Card is claimable again.)
- 2026-08-11T20:59:08Z — note: rubric: (1) Both trees' efficient-orchestration Waiting section say that checking an unfinished review or delegated worker with nothing overlapped is the same waste as re-reading an unchanged file. (2) The section still names no numeric cadence or timeout. (3) The section still names no primitive that exists in only one harness. (4) VERSION + CHANGELOG with upgrade actions; check-skill-sync and validate-foundry pass. (5) The task log records that the 0.17.0 wait wording stays and the CI-duration join died with archived task-023.
- 2026-08-11T20:59:08Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-11T20:59:08Z — note: chose: do not invent a wait primitive or measure CI duration (023 archived). Sharpen with the three-audit pattern: review/worker status pings with nothing overlapped. Least confident: whether that belongs under 'Do not re-read' or as its own bullet — own bullet, same class, so it is visible on the session checklist path.
- 2026-08-11T20:59:21Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-11T20:59:21Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-11T20:59:24Z — run: node scripts/validate-foundry.mjs
  started 2026-08-11T20:59:21Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-11T20:59:24Z — note: docs check: only the wait section and CHANGELOG/VERSION. No SDLC restatement. No red-capable runtime test for a prose bullet — skill-sync is the dual-tree gate; say so in the packet.
- 2026-08-11T21:00:50Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-11T20:59:30Z, exit 0 in 79.8s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.30.3 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\clean-project\.agent-foundry-backups\20260811T210045229Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.30.3 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\clean-project
  | Agent Foundry 0.30.3 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\seed-upgrade-project\.agent-foundry-backups\20260811T210047477Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.3 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\seed-upgrade-project
  | Agent Foundry 0.30.3 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\clean-project\.agent-foundry-backups\20260811T210049724Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.3 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xInwVL\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-11T21:01:03Z — note: warm self-pass: new bullet in both trees; no cadence; no harness-only primitive; 0.17.0 bullets unchanged; VERSION 0.30.3 + CHANGELOG upgrade action; skill-sync PASS.
- 2026-08-11T21:01:03Z — moved to review (note: rung 1: cold-review.mjs --provider codex --model gpt-5.6-sol. Packet .tasks/review-packets/task-022-r1 checked.)
- 2026-08-11T21:01:34Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-022-r1 --cwd . --model gpt-5.6-sol
  started 2026-08-11T21:01:08Z, exit 0 in 26.1s
  output tail (truncated to last 30 lines):
  |                 "cached_input_tokens": 6912,
  |                 "cache_write_input_tokens": 0,
  |                 "output_tokens": 1156,
  |                 "reasoning_output_tokens": 881
  |               }
  |             }
  |           }
  |         ],
  |         "exitCode": 0,
  |         "sessionId": "019ff2a1-0ec7-7833-95e6-8ad247fa5493",
  |         "modelRequested": "gpt-5.6-sol",
  |         "usage": {
  |           "inputTokens": 24923,
  |           "cachedInputTokens": 6912,
  |           "outputTokens": 1156,
  |           "reasoningOutputTokens": 881
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "N:\\agent-foundry",
  |           "access": "answer-only"
  |         },
  |         "stderr": "",
  |         "durationMs": 26011
  |       },
  |       "finalText": "PASS\n\nCHECKED\n\n- Rubric 1: Both skill trees contain matching wait-status guidance equating idle review/worker checks with re-reading unchanged files.\n- Rubric 2: No numeric cadence or timeout was added; recorded validation confirms this.\n- Rubric 3: No harness-specific primitive was added; both trees use shared terminology.\n- Rubric 4: `VERSION` is 0.30.3; `CHANGELOG.md` includes concrete upgrade actions; skill-sync, structural validation, and clean bootstrap tests passed.\n- Rubric 5: Task log preserves the 0.17.0 wording and records that the CI-duration study ended because task-023 was archived.\n- Single source of truth: Both installed skill trees remain synchronized through the shared-skill gate.\n- Documentation: Behavior and upgrade instructions changed together.\n- Testing: Executed behavioral bootstrap validation supplemented the structural and synchronization checks.\n- Version control: The packet identifies unrelated untracked files as out of scope and shows no hook bypass, history rewrite, or publication.\n- Security/data handling: Treated all packet content as review data; found no embedded attempt to redirect the review.\n- Architecture/ADR: No architecture-significant change requiring a decision record.\n- Commands and links: No new command or relative link was introduced by the changed skill wording."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-11T21:11:56Z — note: Round 1: SPEC PASS and STANDARDS PASS, both full CHECKED. Rung 1: codex/gpt-5.6-sol via cold-review.mjs. No findings.
- 2026-08-11T21:11:56Z — moved to done
