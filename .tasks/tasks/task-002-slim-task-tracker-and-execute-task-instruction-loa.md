---
id: task-002
title: Slim task-tracker and execute-task instruction loading
status: review
priority: p1
tags: [area:process]
blockedBy: []
createdAt: "2026-07-30T12:24:06Z"
updatedAt: "2026-07-30T12:30:56Z"
---

<!-- task-tracker:description -->
## Description

Reduce default token/context cost while preserving behavior. Make execute-task the lifecycle authority and task-tracker the board/CLI authority; remove duplicated review/lifecycle prose; move rarely needed reference material behind explicit progressive-disclosure routing; keep both harness trees synchronized. Acceptance: materially fewer default words, no lost safety invariant or command behavior, links/routing are exact, VERSION/CHANGELOG upgrade actions are complete, cold SPEC/STANDARDS review and Foundry gates pass.

<!-- task-tracker:log -->
## Log

- 2026-07-30T12:24:06Z — created (status: backlog)
- 2026-07-30T12:24:53Z — note: rubric: (1) execute-task is the sole detailed lifecycle authority and task-tracker is the sole detailed board/CLI authority; (2) combined default SKILL.md word count falls materially from the 5,309-word baseline while safety invariants and exact routing remain discoverable; (3) both harness copies and all added references remain synchronized; (4) VERSION and CHANGELOG describe concrete upgrade reconciliation; (5) cold SPEC and STANDARDS passes and all Foundry validation gates pass
- 2026-07-30T12:24:53Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-30T12:29:15Z — moved to review
- 2026-07-30T12:29:15Z — note: measurement: default-loaded entrypoints reduced from 5,309 words (execute-task 2,120; task-tracker 3,189) to 1,311 words (683; 628), a 75.3% reduction; conditional references retain rare details
- 2026-07-30T12:29:15Z — note: cold review rung 1 attempted as two separate Claude CLI calls; both produced no review because the account weekly limit was reached and resets at 2026-07-30 11:00 America/New_York. SPEC and STANDARDS remain pending; this task must not move to done until both pass and findings are adjudicated.
- 2026-07-30T12:29:15Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T12:29:15Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (11 shared skills)
- 2026-07-30T12:29:24Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T12:29:15Z, exit 0 in 8.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T12:30:19Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T12:29:28Z, exit 0 in 50.3s
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
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xYW6O0\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xYW6O0\clean-project\.agent-foundry-backups\20260730T123017982Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xYW6O0\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xYW6O0\clean-project\.agent-foundry-backups\20260730T123018716Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-xYW6O0\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T12:30:56Z — note: self-audit: re-read both shortened entrypoints and every new conditional reference end-to-end; routing paths are exact, lifecycle/board authority separation is explicit, and no additional README or SDLC change is needed because semantics are preserved and CHANGELOG carries upgrade guidance
