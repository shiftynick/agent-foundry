---
id: task-003
title: Compact reviews and invalidate validation selectively
status: done
priority: p1
tags: [area:process]
blockedBy: []
createdAt: "2026-07-30T12:24:06Z"
updatedAt: "2026-07-30T15:40:40Z"
---

<!-- task-tracker:description -->
## Description

Reduce review and validation time/token cost without lowering quality. Make separate SPEC/STANDARDS calls parallel and findings-only with concise structured output; prevent review suggestions from silently expanding task scope; define a conservative file-to-gate invalidation rule so targeted checks run during editing and expensive full gates run once after the diff freezes, with high-risk and uncertain changes still receiving full validation. Keep SDLC as authority and both harness trees synchronized. Acceptance: review recall safeguards remain, validation reruns are safely decidable, VERSION/CHANGELOG actions are complete, cold reviews and Foundry gates pass.

<!-- task-tracker:log -->
## Log

- 2026-07-30T12:24:06Z — created (status: backlog)
- 2026-07-30T12:24:55Z — note: rubric: (1) SDLC keeps independent SPEC and STANDARDS review axes, runs them concurrently when possible, and requires concise findings-only output tied to existing objective/rubric/standards. (2) SDLC defines targeted editing checks and a conservative frozen-diff full-gate rule, with full validation for high-risk or uncertain changes. (3) Both harness bridges implement the same packet and parallel-review semantics without duplicating policy. (4) VERSION and CHANGELOG provide concrete upgrade actions. (5) Separate cold reviews and all Foundry gates pass.
- 2026-07-30T12:24:55Z — moved to in_progress (claimed by codex-task-003)
- 2026-07-30T12:27:10Z — note: implementation: SDLC remains the policy authority; execute-task is an unavoidable integration point because it contained the old verbose prompts and validation procedure. Both harness copies and counterpart bridges were updated semantically.
- 2026-07-30T12:27:10Z — moved to review
- 2026-07-30T12:27:42Z — note: friction: concurrent rung-1 cold review dispatch was attempted with separate SPEC/STANDARDS Claude processes, but the Claude CLI rejected the calls because the account weekly limit is exhausted until 11am America/New_York. No review result was produced; the required other-model-family review remains open.
- 2026-07-30T12:27:49Z — run: node starter/.agent-foundry/run-checks.mjs
  started 2026-07-30T12:27:49Z, exit 2 in 0.1s
  output:
  | run-checks: no test suites found under the managed trees
- 2026-07-30T12:27:58Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T12:27:55Z, exit 0 in 2.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T12:28:20Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T12:27:55Z, exit 0 in 24.6s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-XiGg3k\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-XiGg3k\clean-project\.agent-foundry-backups\20260730T122819824Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-XiGg3k\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-XiGg3k\clean-project\.agent-foundry-backups\20260730T122820327Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-XiGg3k\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T12:28:26Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T12:28:26Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (11 shared skills)
- 2026-07-30T12:28:26Z — run: git diff --check
  started 2026-07-30T12:28:26Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T12:28:46Z — note: validation: run-checks.mjs exited 2 because this source tree has no managed *.test.mjs suites; this command is an installed-project discovery runner, not one of AGENTS.md's source acceptance gates. Required source gates validate-foundry and clean bootstrap passed, as did skill sync and diff check.
- 2026-07-30T12:28:58Z — note: review status: other-model-family SPEC and STANDARDS passes remain pending due Claude weekly quota. Per SDLC review-packet authority, the validated packet will be committed locally without moving the task to done; resume by reviewing that exact commit after quota resets.
- 2026-07-30T12:33:33Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T12:33:33Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (11 shared skills)
- 2026-07-30T12:33:35Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T12:33:33Z, exit 0 in 2.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T12:34:02Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T12:33:39Z, exit 0 in 22.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6F3cXL\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6F3cXL\clean-project\.agent-foundry-backups\20260730T123401389Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6F3cXL\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6F3cXL\clean-project\.agent-foundry-backups\20260730T123401842Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6F3cXL\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T12:34:11Z — run: git diff --check
  started 2026-07-30T12:34:11Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T15:28:32Z — note: cold review round 1 used rung 1 with concurrent separate Claude SPEC/STANDARDS calls. Accepted and fixed: incomplete concurrent-axis failure handling, duplicated findings policy, runtime-only event-sequence wording, undefined file-to-gate mapping, unsafe prose carve-out, pre-review targeted-check sequencing, bridge policy duplication, and missing cold-review upgrade reconciliation. The earlier quota and run-checks entries remain historical evidence; required source gates are validate-foundry/test-bootstrap plus sync/diff, and 0.8.0 is one unreleased stacked release. Re-review required after material fixes.
- 2026-07-30T15:33:56Z — note: Round 2 adjudication: accepted enforced file-to-gate mapping, non-vacuous prose handling, centralized concurrent-round contract, defined severity/confidence, validation-authority deduplication, and installed-root run-checks semantics. Targeted sync, structural validation, and diff checks pass after fixes.
- 2026-07-30T15:38:59Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T15:38:59Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (11 shared skills)
- 2026-07-30T15:39:01Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T15:38:59Z, exit 0 in 1.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T15:39:23Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T15:39:01Z, exit 0 in 21.9s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gPZSHv\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gPZSHv\clean-project\.agent-foundry-backups\20260730T153922752Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gPZSHv\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gPZSHv\clean-project\.agent-foundry-backups\20260730T153923172Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-gPZSHv\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T15:39:23Z — run: git diff --check
  started 2026-07-30T15:39:23Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T15:40:40Z — note: Cold review round 3 complete at ladder rung 1 (Claude counterpart CLI): SPEC PASS and shared STANDARDS PASS after adjudicated fixes. Frozen-tree skill sync, structural validation, disposable bootstrap, and diff hygiene all passed.
- 2026-07-30T15:40:40Z — moved to done
