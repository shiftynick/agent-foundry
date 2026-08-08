---
id: task-7846468488000003
title: Render the operator project overview
status: done
priority: p1
tags: [milestone:operator-interface, area:tooling]
blockedBy: [task-7846468488000002]
createdAt: "2026-08-04T23:07:13Z"
updatedAt: "2026-08-05T00:21:45Z"
---

<!-- task-tracker:description -->
## Description

The project-status data powers a self-contained, one-screen HTML overview focused on current goal, since-last-look changes, Now/Next/Later flow, operator decisions, verified freshness, and recent outcomes. Full tasks and technical evidence are drill-down details. The view is generated rather than manually maintained and is tested against realistic project state.

<!-- task-tracker:log -->
## Log

- 2026-08-04T23:07:13Z — created (status: backlog)
- 2026-08-04T23:58:57Z — note: rubric: (1) a zero-dependency Node 20 generator consumes project-status schema v1 and writes one self-contained local HTML file with all dynamic text escaped; (2) the first screen visually answers approved goal/finish, freshness, since-last-look, Now/Next/Later, needs-operator, Git/check evidence, and recent outcomes without copying the board; (3) full task and technical detail is available only through compact drill-down sections, unknown/stale/failure states are explicit, and desktop plus narrow layouts have no critical clipping or horizontal overflow; (4) generated state is Git-ignored, refresh instructions and timestamp are visible, both harness orientations expose one shared command, and tests cover realistic, empty, failure, and injection-shaped data; (5) cold SPEC/STANDARDS review, structural validation, skill sync, and disposable bootstrap pass
- 2026-08-04T23:58:57Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-05T00:03:51Z — run: node --test starter/.agent-foundry/project-status.test.mjs starter/.agent-foundry/project-overview.test.mjs
  started 2026-08-05T00:03:48Z, exit 0 in 2.7s
  output tail (truncated to last 30 lines):
  |       duration_ms: 311.4097
  |       type: 'test'
  |       ...
  |     # Subtest: falls back to the Claude tracker library and fails when neither tree exists
  |     ok 9 - falls back to the Claude tracker library and fails when neither tree exists
  |       ---
  |       duration_ms: 0.6721
  |       type: 'test'
  |       ...
  |     # Subtest: exercises the public CLI flags and failure exits
  |     ok 10 - exercises the public CLI flags and failure exits
  |       ---
  |       duration_ms: 647.4954
  |       type: 'test'
  |       ...
  |     1..10
  | ok 2 - project status
  |   ---
  |   duration_ms: 2592.1129
  |   type: 'suite'
  |   ...
  | 1..2
  | # tests 14
  | # suites 2
  | # pass 14
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 2657.7941
- 2026-08-05T00:03:51Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-05T00:03:51Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-05T00:03:53Z — run: node scripts/validate-foundry.mjs
  started 2026-08-05T00:03:51Z, exit 0 in 2.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-05T00:04:03Z — note: visual verification boundary: generated the real Foundry overview at .agent-foundry/project-overview.html and attempted desktop browser inspection at 1440x900. The in-app browser rejected local file navigation by security policy, so no rendered-browser claim is made. Structural responsive tests cover self-contained markup, required hierarchy, explicit failure/unknown states, injection-shaped content, 900px/560px breakpoints, and ignored artifact generation; clean-bootstrap execution remains the acceptance gate.
- 2026-08-05T00:04:03Z — moved to review (note: implementation packet frozen for cold SPEC and STANDARDS review)
- 2026-08-05T00:09:15Z — moved to in_progress (claimed by shift@Shiftor; note: round-1 review adjudication: accepted empty-state, wrapping, schema-doc, truncation/removal visibility, stdout-test, confined-write, unknown-count, structural hierarchy, and README-wrap findings. Reverted the incidental next-selection change. Clarified that schema v1 is still unreleased within 0.16.0, so documenting the additive Later preview is sufficient. The first screen remains intentionally content-responsive rather than silently truncating approved direction; clean bootstrap stays deferred until review fixes freeze.)
- 2026-08-05T00:09:22Z — run: node --test starter/.agent-foundry/project-status.test.mjs starter/.agent-foundry/project-overview.test.mjs
  started 2026-08-05T00:09:20Z, exit 0 in 2.7s
  output tail (truncated to last 30 lines):
  |       duration_ms: 301.9298
  |       type: 'test'
  |       ...
  |     # Subtest: falls back to the Claude tracker library and fails when neither tree exists
  |     ok 9 - falls back to the Claude tracker library and fails when neither tree exists
  |       ---
  |       duration_ms: 0.6881
  |       type: 'test'
  |       ...
  |     # Subtest: exercises the public CLI flags and failure exits
  |     ok 10 - exercises the public CLI flags and failure exits
  |       ---
  |       duration_ms: 643.7197
  |       type: 'test'
  |       ...
  |     1..10
  | ok 2 - project status
  |   ---
  |   duration_ms: 2583.7126
  |   type: 'suite'
  |   ...
  | 1..2
  | # tests 16
  | # suites 2
  | # pass 16
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 2653.5949
- 2026-08-05T00:09:23Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-05T00:09:22Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-05T00:09:25Z — run: node scripts/validate-foundry.mjs
  started 2026-08-05T00:09:23Z, exit 0 in 2.2s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-05T00:09:29Z — moved to review (note: cold review round 2: rung 1, fresh separate Claude Code 2.1.221 answer-only sessions with the revised complete packet and round-1 adjudication)
- 2026-08-05T00:15:09Z — moved to in_progress (claimed by shift@Shiftor; note: round-2 review adjudication: accepted full validation/work drill-down, null-commit comparison, producer-consumer integration, narrow wrap, visible warning, deterministic stdout fixture, output-file symlink, and --stdout documentation findings. Retained the realpath containment check because Foundry's review standard explicitly requires link-aware destination confinement even though the fixed one-level path makes the outside branch defensive. Full bootstrap moves forward now before the final review round.)
- 2026-08-05T00:15:18Z — run: node --test starter/.agent-foundry/project-status.test.mjs starter/.agent-foundry/project-overview.test.mjs
  started 2026-08-05T00:15:15Z, exit 0 in 2.8s
  output tail (truncated to last 30 lines):
  |       duration_ms: 324.9185
  |       type: 'test'
  |       ...
  |     # Subtest: falls back to the Claude tracker library and fails when neither tree exists
  |     ok 9 - falls back to the Claude tracker library and fails when neither tree exists
  |       ---
  |       duration_ms: 0.6687
  |       type: 'test'
  |       ...
  |     # Subtest: exercises the public CLI flags and failure exits
  |     ok 10 - exercises the public CLI flags and failure exits
  |       ---
  |       duration_ms: 691.9225
  |       type: 'test'
  |       ...
  |     1..10
  | ok 2 - project status
  |   ---
  |   duration_ms: 2671.9361
  |   type: 'suite'
  |   ...
  | 1..2
  | # tests 18
  | # suites 2
  | # pass 18
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 2741.8371
- 2026-08-05T00:15:18Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-05T00:15:18Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-05T00:15:20Z — run: node scripts/validate-foundry.mjs
  started 2026-08-05T00:15:18Z, exit 0 in 2.2s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-05T00:16:20Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-05T00:15:25Z, exit 0 in 55.1s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...................
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\clean-project\.agent-foundry-backups\20260805T001617494Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\clean-project
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\seed-upgrade-project\.agent-foundry-backups\20260805T001619048Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\clean-project\.agent-foundry-backups\20260805T001620145Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tdOt6v\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-05T00:16:24Z — moved to review (note: cold review round 3: rung 1 final round, fresh separate Claude Code 2.1.221 answer-only sessions with complete revised packet; focused suites, skill sync, structural validation, and clean-project bootstrap all pass)
- 2026-08-05T00:19:34Z — moved to in_progress (claimed by shift@Shiftor; note: round-3 cap adjudication: accepted bounded Now, explicit Later-preview count, brand flex shrink, and --help usage findings. Confirmed live run-checks.mjs recursively discovers every *.test.mjs under .agent-foundry, .agents, and .claude, so the packet-omission concern is void. Retained the defensive realpath containment assertion because the governing review standard explicitly requires link-aware confinement; both practical symlink escape paths are tested. No fourth review round will run.)
- 2026-08-05T00:20:31Z — run: node --test starter/.agent-foundry/project-status.test.mjs starter/.agent-foundry/project-overview.test.mjs
  started 2026-08-05T00:20:28Z, exit 0 in 2.8s
  output tail (truncated to last 30 lines):
  |       duration_ms: 303.5999
  |       type: 'test'
  |       ...
  |     # Subtest: falls back to the Claude tracker library and fails when neither tree exists
  |     ok 9 - falls back to the Claude tracker library and fails when neither tree exists
  |       ---
  |       duration_ms: 0.6679
  |       type: 'test'
  |       ...
  |     # Subtest: exercises the public CLI flags and failure exits
  |     ok 10 - exercises the public CLI flags and failure exits
  |       ---
  |       duration_ms: 670.8481
  |       type: 'test'
  |       ...
  |     1..10
  | ok 2 - project status
  |   ---
  |   duration_ms: 2636.2291
  |   type: 'suite'
  |   ...
  | 1..2
  | # tests 19
  | # suites 2
  | # pass 19
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 2701.0888
- 2026-08-05T00:20:31Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-05T00:20:31Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-05T00:20:33Z — run: node scripts/validate-foundry.mjs
  started 2026-08-05T00:20:31Z, exit 0 in 2.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-05T00:21:28Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-05T00:20:37Z, exit 0 in 51.8s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  |
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\clean-project\.agent-foundry-backups\20260805T002126002Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\clean-project
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\seed-upgrade-project\.agent-foundry-backups\20260805T002127460Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\clean-project\.agent-foundry-backups\20260805T002128480Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-yFBUCx\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-05T00:21:44Z — moved to review (note: final acceptance packet: focused suites 19/19, installed run-checks discovery assertion, skill sync, structural validation, and clean-project bootstrap all pass after the round-3 cap fixes)
- 2026-08-05T00:21:45Z — moved to done (note: accepted: one-screen data hierarchy, bounded Now/Later previews, complete drill-down evidence, explicit degraded states, escaped project text, link-aware local output, and installed generation are verified. Residual boundary: CSS was independently reviewed at desktop/narrow breakpoints but the in-app browser policy prevented a live file-page render.)
