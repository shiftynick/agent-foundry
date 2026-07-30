---
id: task-005
title: Prevent seed customization loss during upgrades
status: done
priority: p0
tags: [area:upgrade, type:defect]
blockedBy: []
createdAt: "2026-07-30T19:16:20Z"
updatedAt: "2026-07-30T19:59:29Z"
---

<!-- task-tracker:description -->
## Description

Replace UPGRADING.md's hand-maintained seed restore list with a manifest-derived mechanism. Reproduce that --force resets a locally edited CLAUDE.md, prove the current post-upgrade drift check cannot detect the reset, restore and re-merge every non-preserved seed without losing local edits, and add regression coverage for current and future seed files.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:16:20Z — created (status: backlog)
- 2026-07-30T19:30:24Z — note: rubric: (1) every non-preserved seed is discovered from installed metadata rather than a hand list; (2) forced upgrade recovery restores committed project seed content including CLAUDE.md; (3) current-versus-new stock changes and mold restructures receive actionable reconciliation guidance; (4) regression coverage fails if a future seed is omitted.
- 2026-07-30T19:30:25Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-30T19:39:48Z — moved to review
- 2026-07-30T19:46:31Z — run: node --test starter/.agent-foundry/reconcile-seeds.test.mjs
  started 2026-07-30T19:46:31Z, exit 0 in 0.7s
  output:
  | TAP version 13
  | # Subtest: derives every non-preserved seed from the manifest
  | ok 1 - derives every non-preserved seed from the manifest
  |   ---
  |   duration_ms: 0.9613
  |   type: 'test'
  |   ...
  | # Subtest: rejects unsafe manifest paths
  | ok 2 - rejects unsafe manifest paths
  |   ---
  |   duration_ms: 0.2563
  |   type: 'test'
  |   ...
  | # Subtest: restores tracked ASCII and non-ASCII seeds while keeping new seeds
  | ok 3 - restores tracked ASCII and non-ASCII seeds while keeping new seeds
  |   ---
  |   duration_ms: 539.5911
  |   type: 'test'
  |   ...
  | 1..3
  | # tests 3
  | # suites 0
  | # pass 3
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 657.0703
- 2026-07-30T19:47:19Z — note: cold review round 1: rung 1 via Claude CLI, different model family; accepted diagnostics, Git quoting, and installed restore-test findings; rejected subdirectory concern because bootstrap enforces target-path equals Git root.
- 2026-07-30T19:47:19Z — note: release integration: tasks 005-009 share installer, policy, validation, and changelog surfaces, so the operator-approved 0.10 packet is cold-reviewed and fully validated together while each card retains its own rubric and evidence.
- 2026-07-30T19:52:20Z — run: node --test starter/.agent-foundry/reconcile-seeds.test.mjs
  started 2026-07-30T19:52:19Z, exit 0 in 0.6s
  output:
  | TAP version 13
  | # Subtest: derives every non-preserved seed from the manifest
  | ok 1 - derives every non-preserved seed from the manifest
  |   ---
  |   duration_ms: 0.9132
  |   type: 'test'
  |   ...
  | # Subtest: rejects unsafe manifest paths
  | ok 2 - rejects unsafe manifest paths
  |   ---
  |   duration_ms: 0.2541
  |   type: 'test'
  |   ...
  | # Subtest: restores tracked ASCII and non-ASCII seeds while keeping new seeds
  | ok 3 - restores tracked ASCII and non-ASCII seeds while keeping new seeds
  |   ---
  |   duration_ms: 489.8527
  |   type: 'test'
  |   ...
  | 1..3
  | # tests 3
  | # suites 0
  | # pass 3
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 553.1683
- 2026-07-30T19:52:48Z — note: cold review round 2: SPEC axis malformed and therefore incomplete; STANDARDS full-bootstrap finding is pending the post-review full gate. Rejected subdirectory/non-Git and preserved-log findings because the installer enforces Git-root targets, the procedure enforces a clean baseline, and the fresh manifest marks never-restore logs.
- 2026-07-30T19:53:40Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T19:53:01Z, exit 0 in 39.2s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ..........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\clean-project\.agent-foundry-backups\20260730T195336614Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\clean-project
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\seed-upgrade-project\.agent-foundry-backups\20260730T195338500Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\clean-project\.agent-foundry-backups\20260730T195340029Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HUYswV\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T19:58:58Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T19:58:18Z, exit 0 in 39.1s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\clean-project\.agent-foundry-backups\20260730T195853915Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\clean-project
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\seed-upgrade-project\.agent-foundry-backups\20260730T195855823Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\clean-project\.agent-foundry-backups\20260730T195857620Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.10.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-2OFEm4\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T19:59:29Z — note: cold review round 3: rung 1 via Claude CLI, model claude-opus-5, Anthropic Claude family. Generic future-seed manifest coverage is intentional because the installer tier is the source of truth; accepted and fixed post-install overwrite safety. Residual risk: authors must classify a newly project-owned payload file as seed when adding it.
- 2026-07-30T19:59:29Z — moved to done
