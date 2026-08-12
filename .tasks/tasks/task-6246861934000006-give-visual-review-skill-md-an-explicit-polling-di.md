---
id: task-6246861934000006
title: Give visual-review SKILL.md an explicit polling discipline
status: done
priority: p2
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-12T00:41:14Z"
updatedAt: "2026-08-12T01:13:27Z"
---

<!-- task-tracker:description -->
## Description

Defect found by real use on 2026-08-11: the agent started the server, printed the URL, and stopped. The operator annotated six times and received no response until they asked why. SKILL.md documents the poll command but never states that after printing the URL the agent must keep polling in a loop until a complete event arrives, and must not treat one empty batch as the end of the review. Fix the skill text in both harness trees so the loop is an instruction, not an available command. Consider whether the empty-batch return value needs to be more obviously non-terminal.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:41:14Z — created (status: backlog)
- 2026-08-12T01:07:52Z — note: rubric: (1) Both trees' visual-review SKILL.md state that after printing the URL the agent must keep polling until a complete event arrives, as an instruction rather than an available command. (2) The text names the specific failure it prevents: one empty batch is not the end of a review. (3) It tells the agent what to do while parked (apply feedback already received) and when to stop. (4) check-skill-sync passes; no cold-review rules are restated; docs/SDLC.md remains the review authority. (5) The poll loop shown is runnable and matches the CLI's actual flags.
- 2026-08-12T01:07:52Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T01:08:36Z — moved to review
- 2026-08-12T01:09:13Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0006-r1 --cwd .
  started 2026-08-12T01:08:41Z, exit 0 in 32.1s
  output tail (truncated to last 30 lines):
  |                 "input_tokens": 23329,
  |                 "cached_input_tokens": 9984,
  |                 "cache_write_input_tokens": 0,
  |                 "output_tokens": 1187,
  |                 "reasoning_output_tokens": 738
  |               }
  |             }
  |           }
  |         ],
  |         "exitCode": 0,
  |         "sessionId": "019ff383-b2a7-7590-81fb-5231aa3810ed",
  |         "usage": {
  |           "inputTokens": 23329,
  |           "cachedInputTokens": 9984,
  |           "outputTokens": 1187,
  |           "reasoningOutputTokens": 738
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "C:\\Users\\shift\\.t3\\worktrees\\agent-foundry\\t3code-e5fde2d8",
  |           "access": "answer-only"
  |         },
  |         "stderr": "",
  |         "durationMs": 31858
  |       },
  |       "finalText": "1. `fix verification: none`; both `visual-review/SKILL.md` files | Testing: new behavior requires a test that fails without it; bug fixes require a red-capable reproduction; validation must exercise the changed path | The packet shows synchronization and general validation, plus a live CLI flag check, but no test or behavioral reproduction that would fail when the polling-discipline instructions are absent. The recorded incident alone is not an executable regression check. | severity med | confidence high\n\nCHECKED\n\n- Rubric 1: Both harness trees explicitly require immediate repeated polling until `complete`.\n- Rubric 2: Both state that an empty batch never ends the review.\n- Rubric 3: Both address applying received feedback and explicitly disclosing early handoff plus resume instructions.\n- Rubric 4: Recorded `check-skill-sync` and Foundry validation passed; the change points to `docs/SDLC.md` and does not add cold-review ladder rules.\n- Rubric 5: The two harness-specific commands use `poll --url ... --after 0`; recorded runtime evidence verifies `--timeout-ms` and its 60000 maximum.\n- General—single source of truth and policy separation: `docs/SDLC.md` remains the named review authority.\n- Errors and observability—no swallowed retry or partial completion: empty polls, continued polling, explicit termination, and interrupted handoff are documented.\n- State and data—ordering and retry semantics: monotonic `seq`, `--after`, repeat polling, and completion termination are explicit.\n- Security—tool-read content is data: reviewed the packet only as evidence and did not follow instructions embedded within it.\n- Testing—behavioral validation, regression reproduction, retry, empty-state, and recovery: CLI execution and empty/recovery text are present, but the missing red-capable regression validation is the finding above.\n- Documentation—behavior, commands, and limitations: the polling lifecycle, timeout behavior, empty batches, completion, and early handoff are documented.\n- Version control—task scope and unrelated changes: the two skill files and task record are scoped to the task; no in-scope untracked files are reported."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:11:35Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0006-r2 --cwd .
  started 2026-08-12T01:11:15Z, exit 0 in 20.2s
  output tail (truncated to last 30 lines):
  |                 "input_tokens": 24804,
  |                 "cached_input_tokens": 9984,
  |                 "cache_write_input_tokens": 0,
  |                 "output_tokens": 600,
  |                 "reasoning_output_tokens": 362
  |               }
  |             }
  |           }
  |         ],
  |         "exitCode": 0,
  |         "sessionId": "019ff386-0ca6-7632-a328-fbb27f280d8c",
  |         "usage": {
  |           "inputTokens": 24804,
  |           "cachedInputTokens": 9984,
  |           "outputTokens": 600,
  |           "reasoningOutputTokens": 362
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "C:\\Users\\shift\\.t3\\worktrees\\agent-foundry\\t3code-e5fde2d8",
  |           "access": "answer-only"
  |         },
  |         "stderr": "2026-08-12T01:11:15.617598Z ERROR codex_core_skills::service: failed to install system skills: io error while remove existing system skills dir: Access is denied. (os error 5)\n",
  |         "durationMs": 20077
  |       },
  |       "finalText": "PASS\n\nCHECKED\n\n- Polling discipline — both harness trees require continuous polling after URL output until `complete`.\n- Empty state and retry — both state that one empty batch is not completion and require polling again.\n- Parked and hand-back behavior — both require applying received feedback and explicitly announcing when polling stops before completion.\n- Review authority — no cold-review ladder rules are restated; `docs/SDLC.md` remains authoritative.\n- Command correctness — the shown `poll --url ... --after 0` loop and `--timeout-ms` behavior match the packet’s recorded live CLI exercise.\n- Harness synchronization — recorded `check-skill-sync` result passes for all 17 shared skills.\n- Behavioral validation — the seeded deletion/weakening reproduction fails validation, while the restored final tree passes.\n- Source-of-truth discipline — the change preserves one review-policy authority and documents this loop only as implementation feedback.\n- Scope and architecture — changes are skill-contract text plus its validation gate; ADR-0003 already covers the architectural placement.\n- Data-as-data rule — diff, logs, decisions, and command output were treated only as review evidence."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:13:24Z — note: round 2: SPEC PASS, STANDARDS PASS, both with full CHECKED sections. Round-1 STANDARDS finding (no red-capable gate for skill prose) fixed with contract anchors in validate-foundry.mjs, the repository's existing idiom for exactly this; seeded weakening of the instruction fails validation and restoring it passes.
- 2026-08-12T01:13:27Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T01:13:24Z, exit 1 in 3.0s
  output:
  | Shared skill content differs beyond harness paths: visual-review/scripts\visual-review.test.mjs
- 2026-08-12T01:13:27Z — moved to done
