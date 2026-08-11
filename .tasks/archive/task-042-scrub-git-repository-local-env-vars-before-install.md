---
id: task-042
title: Scrub Git repository-local env vars before installed test runs
status: done
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-09T02:58:15Z"
updatedAt: "2026-08-09T22:30:16Z"
---

<!-- task-tracker:description -->
## Description

Upstream packet from project-myriad, verified against stock 0.26.0: docs/research/upstream-packets/2026-08-08/myriad-scrub-hook-git-environment-in-run-checks.md.

Verified claim: starter/.agent-foundry/run-checks.mjs runStep() calls spawnSync with cwd/stdio/windowsHide and NO env option, so the child inherits process.env. When run-checks runs from a Git hook (pre-commit), Git has exported repository-local variables - GIT_INDEX_FILE, GIT_DIR, GIT_WORK_TREE, GIT_PREFIX and the rest - and installed *.test.mjs suites that create temporary fixture repositories then have their git commands retarget and lock the CALLER'S real index. Corruption-risk class, not cosmetic. Payload suites that spawn fixture git today: project-overview, project-status, reconcile-seeds (per the reporting project's verification).

Proposed in the packet: an exported GIT_LOCAL_ENV_VARS list, an installedTestEnvironment() that strips those names from a copy of process.env with case folding (Windows env names are case-insensitive), and runStep gaining an environment parameter; plus regression coverage in run-checks.test.mjs that pins the live list and the case-variant behavior. Evaluate that shape - do not adopt verbatim without checking the case-folding logic and whether the list should be derived rather than hardcoded.

Acceptance: red-capable test (a seeded GIT_INDEX_FILE in the parent env must make the test fail before the fix); zero-dep Node; validate + test-bootstrap green; VERSION+CHANGELOG; cold review. On landing, tell project-myriad so its LOCAL-CHANGES entries for run-checks.mjs and run-checks.test.mjs can retire.

<!-- task-tracker:log -->
## Log

- 2026-08-09T02:58:15Z — created (status: backlog)
- 2026-08-09T21:49:50Z — note: rubric: (1) run-checks.mjs passes an environment to the installed-test step only, with every Git repository-local name removed, matched case-insensitively; (2) a seeded GIT_INDEX_FILE (and a mixed-case variant) in the parent environment does not reach the installed-test child - test fails without the fix; (3) the scrub list is pinned against 'git rev-parse --local-env-vars' by a test, so a newer Git adding a name fails the suite; (4) skill-sync and any other step keep the inherited environment; (5) validate-foundry + test-bootstrap green, VERSION bumped, CHANGELOG entry with upgrade actions.
- 2026-08-09T21:49:50Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T21:52:03Z — note: chose: union of a pinned GIT_LOCAL_ENV_VARS snapshot with a live 'git rev-parse --local-env-vars' probe, instead of the packet's snapshot-plus-pinning-test. The packet's test asserts the snapshot covers everything the installed Git reports, which turns every installed project's gate red when a newer Git adds a name - a Foundry-staleness signal charged to the project. The union scrubs new names automatically and falls back to the snapshot when Git is absent from PATH.
- 2026-08-09T21:52:03Z — note: chose: scrub applies only to the installed-test step, as the packet proposed. skill-sync runs no Git, and a project gate may legitimately want the hook's Git identity.
- 2026-08-09T21:52:05Z — run: node --test starter/.agent-foundry/run-checks.test.mjs
  started 2026-08-09T21:52:04Z, exit 0 in 1.8s
  output tail (truncated to last 30 lines):
  |   duration_ms: 223.2687
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 1 when a present skill-sync checker cannot load
  | ok 14 - CLI exits 1 when a present skill-sync checker cannot load
  |   ---
  |   duration_ms: 233.4396
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 1 when an installed suite fails
  | ok 15 - CLI exits 1 when an installed suite fails
  |   ---
  |   duration_ms: 236.0058
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 2 when no suites are discovered
  | ok 16 - CLI exits 2 when no suites are discovered
  |   ---
  |   duration_ms: 53.3663
  |   type: 'test'
  |   ...
  | 1..16
  | # tests 16
  | # suites 0
  | # pass 16
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1748.407
- 2026-08-09T22:02:10Z — moved to review
- 2026-08-09T22:25:34Z — run: node --test starter/.agent-foundry/run-checks.test.mjs
  started 2026-08-09T22:25:32Z, exit 0 in 1.8s
  output tail (truncated to last 30 lines):
  |   duration_ms: 222.2929
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 1 when a present skill-sync checker cannot load
  | ok 14 - CLI exits 1 when a present skill-sync checker cannot load
  |   ---
  |   duration_ms: 224.7167
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 1 when an installed suite fails
  | ok 15 - CLI exits 1 when an installed suite fails
  |   ---
  |   duration_ms: 223.6957
  |   type: 'test'
  |   ...
  | # Subtest: CLI exits 2 when no suites are discovered
  | ok 16 - CLI exits 2 when no suites are discovered
  |   ---
  |   duration_ms: 51.7043
  |   type: 'test'
  |   ...
  | 1..16
  | # tests 16
  | # suites 0
  | # pass 16
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1710.5197
- 2026-08-09T22:26:10Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T22:26:07Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T22:27:21Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T22:26:15Z, exit 0 in 66.3s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | .
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\clean-project\.agent-foundry-backups\20260809T222717433Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\clean-project
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\seed-upgrade-project\.agent-foundry-backups\20260809T222719128Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\seed-upgrade-project
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\clean-project\.agent-foundry-backups\20260809T222720838Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-amzvHY\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T22:29:41Z — note: cold review: Codex CLI 0.145.0, answer-only, ephemeral, SPEC and STANDARDS dispatched separately and concurrently. Round 1: both axes raised only that VERSION and CHANGELOG were not in the packet - a packet-completeness gap, not a code defect; the release files are shared across all three tasks in this release and were attached to the round-2 packet. Round 2: SPEC found GIT_INTERNAL_SUPER_PREFIX missing from the offline fallback snapshot; accepted and added (Git 2.52 on this host no longer reports it, older versions did, and it matters only when the live probe cannot run). STANDARDS PASS. Round 3: PASS on both axes.
- 2026-08-09T22:30:16Z — moved to done
