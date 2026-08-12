---
id: task-051
title: "efficient-orchestration: ask user for provider/models for orchestration steps"
status: done
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-11T23:48:46Z"
updatedAt: "2026-08-12T00:18:14Z"
---

<!-- task-tracker:description -->
## Description

Update the efficient-orchestration skill (both harness trees) so that, when the user has not already specified providers/models, the skill instructs the agent to ask the user which provider/model to use for each orchestration step (or tier of steps), presenting recommended defaults the user can accept as-is. If the user specified providers/models up front, skip the question. Keep wording harness-neutral and mirror the .claude/.agents copies per the dual-tree invariant.

<!-- task-tracker:log -->
## Log

- 2026-08-11T23:48:46Z — created (status: backlog)
- 2026-08-12T00:12:03Z — note: rubric: (1) Both efficient-orchestration skill copies tell the agent to ask for provider, model, and effort choices by orchestration tier when the user did not supply them. (2) The question presents explicit recommended defaults that the user can accept unchanged and uses only models/providers available in the active harness. (3) The question is skipped when the user already supplied provider/model routing, and the existing routing announcement still occurs. (4) The wording remains harness-neutral and both shared-skill copies remain synchronized. (5) VERSION and CHANGELOG describe the installed behavior change and the full Foundry validation gates pass.
- 2026-08-12T00:12:06Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T00:12:47Z — run: node starter/.agent-foundry/check-skill-sync.mjs
  started 2026-08-12T00:12:46Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (1 shared skill)
- 2026-08-12T00:12:52Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T00:12:49Z, exit 0 in 3.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T00:14:00Z — note: pre-review behavior check: the new behavior is the one-time provider/model/effort confirmation with recommended tier defaults, partial-routing handling, and skip path. Removing the section from one tree fails skill-sync; removing it from both remains syntactically valid, so semantic coverage comes from cold SPEC review rather than a brittle prose-pattern test. Warm self-pass found no material issue.
- 2026-08-12T00:14:00Z — moved to review
- 2026-08-12T00:15:23Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --model claude-fable-5 --packet .tasks/review-packets/task-051-r1 --cwd . --max-budget-usd 3
  started 2026-08-12T00:14:55Z, exit 0 in 28.6s
  output tail (truncated to last 30 lines):
  |  invoked with the `starter` argument, and the two trees contain fifteen shared skills — a passing run should report 15, not 1. The recorded evidence therefore did not actually verify the dual-tree invariant for this repo's payload (it likely ran against the wrong root or a stray installed tree). The invariant may in fact hold (both diff hunks are byte-identical), but the gate as executed proves nothing. | severity: high | confidence: high\n\n2. Recorded evidence (`test-bootstrap` deferred) | rubric line 5 (\"full Foundry validation gates pass\") + testing standard \"compilation/type checking is not behavioral validation\" | Only `validate-foundry.mjs` was executed; `scripts/test-bootstrap.mjs` — the repo's stated acceptance test (\"both must pass before any change is complete\") — was not run and is explicitly deferred to \"the final frozen tree.\" From this packet the full gate cannot be confirmed passing. | severity: med | confidence: high\n\n3. `CHANGELOG.md` 0.30.4 entry + `VERSION` | one-source-of-truth / documented versioning policy in CHANGELOG.md itself (\"`patch` for fixes with no upgrade action\") | The change is a patch bump yet the entry ships an \"Upgrade actions\" section instructing replacement of both skill files; by the file's own stated semantics that combination is contradictory (either it's a patch with no upgrade action, or it's a minor/behavior change with one). | severity: low | confidence: med\n\nCHECKED\n- **Dual-tree invariant (rubric 4):** compared the two SKILL.md diff hunks byte-for-byte in the packet — identical, no cross-tree path strings, no harness-specific \"Claude-facing/Codex-facing\" text in the changed region. The *recorded* sync gate, however, is unreliable (finding 1).\n- **Rubric 1–3 content:** verified the new \"Confirm the dials with the operator\" section asks by tier with recommended defaults, forbids inventing unavailable models (\"Name the provider and exact model ID... available in the active environment\"), skips when routing is fully supplied, handles partial routing, and the renamed \"Announce the confirmed dials\" section preserves the routing announcement.\n- **Harness neutrality:** wording names no specific vendor, model, or CLI; defers to `docs/SDLC.md` for authority rules rather than restating them, per CLAUDE.md.\n- **Validation-content rules:** changed payload text contains no absolute paths, no `{{TOKEN}}` outside templates, balanced fences (section-level check of the diff only).\n- **VERSION/CHANGELOG pairing (rubric 5):** VERSION bumped to 0.30.4 with a matching CHANGELOG entry describing the installed behavior; `validate-foundry.mjs` recorded PASS. Full gate not verifiable (finding 2); patch/upgrade-action tension (finding 3).\n- **Prompt-injection scan:** no text in the diff or packet attempts to address the reviewing agent.\n- **Version control scope:** diff touches only the five in-scope files; review-packet untracked files are evidence, not payload."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:15:43Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T00:15:43Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-12T00:17:02Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-12T00:15:46Z, exit 0 in 76.3s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.30.4 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\clean-project\.agent-foundry-backups\20260812T001658088Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.30.4 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\clean-project
  | Agent Foundry 0.30.4 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\seed-upgrade-project\.agent-foundry-backups\20260812T001700133Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.4 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\seed-upgrade-project
  | Agent Foundry 0.30.4 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\clean-project\.agent-foundry-backups\20260812T001702144Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.30.4 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jB35U3\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-12T00:17:12Z — note: cold review round 1: rung 1, separate Claude CLI model family, claude-fable-5, concurrent SPEC and STANDARDS. Confirmed the sync evidence defect: the first command checked the repo-root one-skill trees; corrected with the starter argument and recorded PASS (15 shared skills). The missing-bootstrap evidence was expected under two-phase validation but is now resolved by recorded clean-project PASS. Rejected the patch-version finding: the repository invariant requires concrete Upgrade actions for every installed-behavior change, and 0.30.3 establishes the same patch-plus-replacement precedent. No implementation text changed.
- 2026-08-12T00:18:00Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --model claude-fable-5 --packet .tasks/review-packets/task-051-r2 --cwd . --max-budget-usd 3
  started 2026-08-12T00:17:37Z, exit 0 in 23.2s
  output tail (truncated to last 30 lines):
  |     "cachedInputTokens": 5630,
  |           "outputTokens": 1470,
  |           "costUsd": 0.329923
  |         },
  |         "warnings": [],
  |         "workspace": {
  |           "cwd": "N:\\agent-foundry",
  |           "access": "answer-only"
  |         },
  |         "stderr": "",
  |         "durationMs": 23027
  |       },
  |       "finalText": "PASS\n\nCHECKED\n- **Dual-tree invariant / sync (rubric 4):** Compared the two SKILL.md hunks in the diff line by line — byte-identical, no cross-tree path strings (`.claude/`/`.agents/` never appear in the changed text), no `Claude-facing`/`Codex-facing` text in the changed region. Corroborated by the corrected `check-skill-sync.mjs starter` run recording PASS (15 shared skills), fixing round 1's wrong-root invocation (which had reported 1 skill).\n- **Executed behavioral signal (seed rule \"compilation is not validation\"):** Round 1's deferred-bootstrap finding is resolved — `node scripts/test-bootstrap.mjs` recorded a clean-project bootstrap PASS on Agent Foundry 0.30.4, with `validate-foundry.mjs` PASS beforehand, satisfying the repo's \"both must pass\" gate (rubric 5). Fix-verification confirms no implementation file changed between the evidence corrections.\n- **Rubric 1–3 content:** The new \"Confirm the dials with the operator\" section asks by tier (orchestration/work/review) with recommended defaults acceptable unchanged, restricts choices to \"the provider and exact model ID that are available in the active environment\" and forbids inventing unavailable models, skips the question when routing is fully supplied, asks only for missing tiers on partial routing, and the renamed \"Announce the confirmed dials\" section preserves the routing announcement.\n- **Harness neutrality (rubric 4):** No vendor, model name, or CLI is hard-coded; authority rules are deferred to `docs/SDLC.md` rather than restated, per CLAUDE.md's single-authority rule.\n- **Payload content rules:** Changed starter text contains no absolute paths, no `{{TOKEN}}` outside templates, balanced code fences (verified within the diff scope); no new files, so no manifest/SEED classification needed.\n- **VERSION/CHANGELOG pairing (rubric 5):** VERSION 0.30.4 with a matching CHANGELOG entry describing the installed behavior change; `validate-foundry.mjs` (which enforces the pairing) PASS. Round 1's patch-vs-upgrade-actions tension was adjudicated with the 0.30.3 precedent recorded in the task log; I verified the precedent claim against the packet and do not re-raise it.\n- **ADR requirement:** Change is workflow guidance only, not architecture-significant; \"no ADR required\" in decisions is consistent with that.\n- **Version-control scope:** Diff touches only the five in-scope files; review-packet untracked files are evidence, not payload.\n- **Prompt-injection scan:** No text in the diff, logs, or packet attempts to address or redirect the reviewing agent (the embedded round-1 cold-review output is reported evidence, treated as data)."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:18:09Z — note: cold review round 2: rung 1, separate Claude CLI model family, claude-fable-5, concurrent SPEC and STANDARDS; both axes PASS with complete CHECKED coverage. Documentation check: the docs/SDLC.md link remains valid and no additional operator documentation or ADR is needed.
- 2026-08-12T00:18:09Z — run: git diff --check
  started 2026-08-12T00:18:09Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-08-12T00:18:14Z — moved to done
