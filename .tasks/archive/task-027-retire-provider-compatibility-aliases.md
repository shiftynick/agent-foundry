---
id: task-027
title: Retire provider compatibility aliases
status: done
priority: p1
tags: [area:process, area:tooling]
blockedBy: []
createdAt: "2026-08-06T23:11:41Z"
updatedAt: "2026-08-06T23:20:39Z"
---

<!-- task-tracker:description -->
## Description

Remove claude-in-codex, codex-in-claude, and cursor-cli (both trees). agent-headless becomes the sole provider entry point. Bump to 0.19.0 with CHANGELOG upgrade delete steps. Update validate-foundry, test-bootstrap, skill-sync test, and all docs that still describe the 16+1 bridge invariant.

<!-- task-tracker:log -->
## Log

- 2026-08-06T23:11:41Z — created (status: backlog)
- 2026-08-06T23:11:50Z — note: rubric: (1) starter no longer ships claude-in-codex, codex-in-claude, or cursor-cli in either harness tree; (2) each harness has exactly 15 shared skills and validate-foundry/test-bootstrap/skill-sync agree on that count; (3) docs and skill catalogs name agent-headless as the only provider entry point with no bridge-alias invariant; (4) VERSION is 0.19.0 with CHANGELOG Changed/Upgrade actions/Breaking that tell installed projects to delete the alias dirs and remap wrappers; (5) validate-foundry, test-bootstrap, and check-skill-sync starter all pass; (6) cold SPEC and STANDARDS review complete with findings adjudicated
- 2026-08-06T23:11:54Z — moved to in_progress (claimed by shift@Shiftor; note: claiming to retire provider compatibility aliases per plan)
- 2026-08-06T23:13:28Z — note: docs and catalogs updated; VERSION 0.19.0; alias trees deleted; validators expect 15 shared skills and reject retired aliases
- 2026-08-06T23:15:01Z — run: node scripts/validate-foundry.mjs
  started 2026-08-06T23:14:59Z, exit 0 in 2.6s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-06T23:15:01Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-06T23:15:01Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-06T23:16:12Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-06T23:15:02Z, exit 0 in 70.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.19.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\clean-project\.agent-foundry-backups\20260806T231608804Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.19.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\clean-project
  | Agent Foundry 0.19.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\seed-upgrade-project\.agent-foundry-backups\20260806T231610819Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.19.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\clean-project\.agent-foundry-backups\20260806T231612207Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.19.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-b0UpHg\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-06T23:16:19Z — moved to review (note: implementation complete; validate-foundry, skill-sync, and test-bootstrap passed)
- 2026-08-06T23:20:23Z — note: cold review round 1 rung 1: agent-headless provider=codex (OpenAI family, differs from Cursor implementer), answer-only, ephemeral; SPEC and STANDARDS dispatched concurrently
- 2026-08-06T23:20:30Z — note: SPEC adjudication: finding1 (rubric6 mid-review) expected during review; satisfied by this adjudication log. finding2 (repo-wide leftover alias prose) verified false: rg over AGENTS/CLAUDE/README/BOOTSTRAP/scripts/starter excluding CHANGELOG and .tasks shows only validate-foundry retired-name reject list. SPEC PASS after adjudication.
- 2026-08-06T23:20:30Z — note: STANDARDS adjudication: finding1 same as SPEC rubric6 mid-review circular; finding2 (BOOTSTRAP smoke not executed) mitigated by running foundry-root equivalents of the updated smoke commands (agent-headless cli.test, both harness task-tracker tests, check-skill-sync.test, check-foundry-drift.test, cli --version) exit 0. STANDARDS PASS after adjudication.
- 2026-08-06T23:20:31Z — run: node --test starter/.agent-foundry/check-skill-sync.test.mjs starter/.agent-foundry/check-foundry-drift.test.mjs
  started 2026-08-06T23:20:30Z, exit 0 in 0.2s
  output tail (truncated to last 30 lines):
  |   duration_ms: 6.8784
  |   type: 'test'
  |   ...
  | # Subtest: a shared skill pointing at the opposite tree is drift
  | ok 10 - a shared skill pointing at the opposite tree is drift
  |   ---
  |   duration_ms: 5.4652
  |   type: 'test'
  |   ...
  | # Subtest: one-tree-only skills are skipped as bridges
  | ok 11 - one-tree-only skills are skipped as bridges
  |   ---
  |   duration_ms: 4.1177
  |   type: 'test'
  |   ...
  | # Subtest: a missing skill tree is reported separately
  | ok 12 - a missing skill tree is reported separately
  |   ---
  |   duration_ms: 2.932
  |   type: 'test'
  |   ...
  | 1..12
  | # tests 12
  | # suites 0
  | # pass 12
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 112.8532
- 2026-08-06T23:20:31Z — run: node starter/.agent-foundry/agent-headless/cli.js --version
  started 2026-08-06T23:20:31Z, exit 0 in 0.1s
  output:
  | 0.3.0
- 2026-08-06T23:20:39Z — moved to done (note: rubric satisfied; cold SPEC/STANDARDS adjudicated PASS; validate-foundry, test-bootstrap, skill-sync recorded)
