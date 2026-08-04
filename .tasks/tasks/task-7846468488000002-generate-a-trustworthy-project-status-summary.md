---
id: task-7846468488000002
title: Generate a trustworthy project status summary
status: done
priority: p1
tags: [milestone:operator-interface, area:tooling]
blockedBy: []
createdAt: "2026-08-04T23:07:03Z"
updatedAt: "2026-08-04T23:57:51Z"
---

<!-- task-tracker:description -->
## Description

A dependency-free Node 20 command derives a compact, deterministic project summary from existing Foundry sources. It reports what changed since the operator last looked, current approved direction with freshness, active and next eligible work using tracker semantics, operator decisions, blockers, recorded validation, and Git state. Text output fits a short terminal view; unknown or stale facts are labeled rather than invented.

<!-- task-tracker:log -->
## Log

- 2026-08-04T23:07:03Z — created (status: backlog)
- 2026-08-04T23:26:01Z — note: rubric: (1) a zero-dependency Node 20 command emits stable JSON and a human-readable status of at most 12 nonblank lines from authoritative repository state; (2) milestone goal/finish line come verbatim from the latest planning entry with age/freshness, and missing state is labeled unknown; (3) active, review, blocked, operator-needed, and next work use the task tracker's own parsing, blocker, and ordering semantics rather than a second implementation; (4) Git branch/commit/dirty state, latest recorded validation, recent completed outcomes, and since-marker changes are factual and tested, with an explicit local mark-seen operation; (5) both harness docs expose the command without a duplicate skill, upgrade docs are current, and focused/full gates plus independent SPEC/STANDARDS reviews pass
- 2026-08-04T23:26:01Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-04T23:29:50Z — run: node --test starter/.agent-foundry/project-status.test.mjs
  started 2026-08-04T23:29:49Z, exit 0 in 1.7s
  output tail (truncated to last 30 lines):
  |       duration_ms: 479.1996
  |       type: 'test'
  |       ...
  |     # Subtest: uses an explicit local marker for since-last-look changes
  |     ok 3 - uses an explicit local marker for since-last-look changes
  |       ---
  |       duration_ms: 580.8476
  |       type: 'test'
  |       ...
  |     # Subtest: keeps text output short and labels unknown planning state
  |     ok 4 - keeps text output short and labels unknown planning state
  |       ---
  |       duration_ms: 440.1292
  |       type: 'test'
  |       ...
  |     1..4
  | ok 1 - project status
  |   ---
  |   duration_ms: 1502.3551
  |   type: 'suite'
  |   ...
  | 1..1
  | # tests 4
  | # suites 1
  | # pass 4
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1585.9871
- 2026-08-04T23:30:28Z — run: node scripts/validate-foundry.mjs
  started 2026-08-04T23:30:26Z, exit 0 in 2.0s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-04T23:31:00Z — run: node --test starter/.agent-foundry/project-status.test.mjs
  started 2026-08-04T23:30:59Z, exit 0 in 1.1s
  output tail (truncated to last 30 lines):
  |       duration_ms: 302.4485
  |       type: 'test'
  |       ...
  |     # Subtest: uses an explicit local marker for since-last-look changes
  |     ok 3 - uses an explicit local marker for since-last-look changes
  |       ---
  |       duration_ms: 367.848
  |       type: 'test'
  |       ...
  |     # Subtest: keeps text output short and labels unknown planning state
  |     ok 4 - keeps text output short and labels unknown planning state
  |       ---
  |       duration_ms: 299.5989
  |       type: 'test'
  |       ...
  |     1..4
  | ok 1 - project status
  |   ---
  |   duration_ms: 971.7532
  |   type: 'suite'
  |   ...
  | 1..1
  | # tests 4
  | # suites 1
  | # pass 4
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1031.5075
- 2026-08-04T23:31:00Z — run: node starter/.agent-foundry/project-status.mjs --json
  started 2026-08-04T23:31:00Z, exit 0 in 0.2s
  output tail (truncated to last 30 lines):
  |         "tags": [
  |           "area:skills",
  |           "type:feature"
  |         ],
  |         "blockedBy": [],
  |         "unmetBlockers": [],
  |         "createdAt": "2026-08-02T12:27:15Z",
  |         "updatedAt": "2026-08-02T12:44:21Z",
  |         "archived": true
  |       }
  |     ]
  |   },
  |   "validation": {
  |     "latest": {
  |       "taskId": "task-7846468488000002",
  |       "recordedAt": "2026-08-04T23:31:00Z",
  |       "command": "node --test starter/.agent-foundry/project-status.test.mjs",
  |       "startedAt": "2026-08-04T23:30:59Z",
  |       "exitCode": 0,
  |       "durationSeconds": 1.1
  |     }
  |   },
  |   "since": {
  |     "marker": null,
  |     "firstLook": true,
  |     "changedTasks": [],
  |     "completed": [],
  |     "needsOperator": []
  |   }
  | }
- 2026-08-04T23:31:00Z — moved to review
- 2026-08-04T23:31:17Z — note: cold review round 1: rung 1, fresh separate Claude Code 2.1.221 answer-only sessions with complete diff, untracked files, task log, tracker library, and standards embedded
- 2026-08-04T23:39:12Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-04T23:39:12Z — note: round-1 review adjudication: accepted the plan-order, Git-unknown, timestamp-boundary, commit-delta, milestone-correlation, shared-run-parser, harness-neutral import, CLI/error coverage, marker-containment, changed-path contract, and installed-doc findings. Clarified that 0.16.0 is the current unreleased milestone version and added the ignore upgrade action. Full bootstrap remains intentionally after review fixes freeze.
- 2026-08-04T23:39:17Z — run: node --test starter/.agent-foundry/project-status.test.mjs starter/.agents/skills/task-tracker/scripts/_lib.test.mjs starter/.claude/skills/task-tracker/scripts/_lib.test.mjs
  started 2026-08-04T23:39:12Z, exit 1 in 5.1s
  output tail (truncated to last 30 lines):
  |       type: 'test'
  |       ...
  |     1..1
  | ok 36 - parseRunEvidenceLog
  |   ---
  |   duration_ms: 0.4661
  |   type: 'suite'
  |   ...
  | # Subtest: nowIso
  |     # Subtest: returns YYYY-MM-DDTHH:MM:SSZ
  |     ok 1 - returns YYYY-MM-DDTHH:MM:SSZ
  |       ---
  |       duration_ms: 0.0621
  |       type: 'test'
  |       ...
  |     1..1
  | ok 37 - nowIso
  |   ---
  |   duration_ms: 0.093
  |   type: 'suite'
  |   ...
  | 1..37
  | # tests 120
  | # suites 37
  | # pass 115
  | # fail 5
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 4967.7522
- 2026-08-04T23:39:36Z — run: node --test starter/.agent-foundry/project-status.test.mjs starter/.agents/skills/task-tracker/scripts/_lib.test.mjs starter/.claude/skills/task-tracker/scripts/_lib.test.mjs
  started 2026-08-04T23:39:31Z, exit 1 in 5.0s
  output tail (truncated to last 30 lines):
  |       type: 'test'
  |       ...
  |     1..1
  | ok 36 - parseRunEvidenceLog
  |   ---
  |   duration_ms: 0.5078
  |   type: 'suite'
  |   ...
  | # Subtest: nowIso
  |     # Subtest: returns YYYY-MM-DDTHH:MM:SSZ
  |     ok 1 - returns YYYY-MM-DDTHH:MM:SSZ
  |       ---
  |       duration_ms: 0.0608
  |       type: 'test'
  |       ...
  |     1..1
  | ok 37 - nowIso
  |   ---
  |   duration_ms: 0.0888
  |   type: 'suite'
  |   ...
  | 1..37
  | # tests 120
  | # suites 37
  | # pass 117
  | # fail 3
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 4919.3746
- 2026-08-04T23:39:50Z — run: node --test starter/.agent-foundry/project-status.test.mjs
  started 2026-08-04T23:39:48Z, exit 1 in 2.2s
  output tail (truncated to last 30 lines):
  |     ok 5 - labels Git and marker failures instead of claiming clean or first look
  |       ---
  |       duration_ms: 250.7543
  |       type: 'test'
  |       ...
  |     # Subtest: exercises the public CLI flags and failure exits
  |     ok 6 - exercises the public CLI flags and failure exits
  |       ---
  |       duration_ms: 654.6146
  |       type: 'test'
  |       ...
  |     1..6
  | not ok 1 - project status
  |   ---
  |   duration_ms: 2056.0308
  |   type: 'suite'
  |   location: 'N:\\agent-foundry\\starter\\.agent-foundry\\project-status.test.mjs:119:1'
  |   failureType: 'subtestsFailed'
  |   error: '1 subtest failed'
  |   code: 'ERR_TEST_FAILURE'
  |   ...
  | 1..1
  | # tests 6
  | # suites 1
  | # pass 5
  | # fail 1
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 2120.1335
- 2026-08-04T23:40:07Z — run: node --test starter/.agent-foundry/project-status.test.mjs
  started 2026-08-04T23:40:05Z, exit 0 in 2.2s
  output tail (truncated to last 30 lines):
  |       duration_ms: 308.7521
  |       type: 'test'
  |       ...
  |     # Subtest: labels Git and marker failures instead of claiming clean or first look
  |     ok 5 - labels Git and marker failures instead of claiming clean or first look
  |       ---
  |       duration_ms: 241.5629
  |       type: 'test'
  |       ...
  |     # Subtest: exercises the public CLI flags and failure exits
  |     ok 6 - exercises the public CLI flags and failure exits
  |       ---
  |       duration_ms: 672.0953
  |       type: 'test'
  |       ...
  |     1..6
  | ok 1 - project status
  |   ---
  |   duration_ms: 2035.582
  |   type: 'suite'
  |   ...
  | 1..1
  | # tests 6
  | # suites 1
  | # pass 6
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 2099.076
- 2026-08-04T23:40:08Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-04T23:40:07Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-04T23:40:10Z — run: node scripts/validate-foundry.mjs
  started 2026-08-04T23:40:08Z, exit 0 in 2.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-04T23:40:20Z — moved to review
- 2026-08-04T23:40:20Z — note: cold review round 2: rung 1, fresh separate Claude Code 2.1.221 answer-only sessions with the revised complete packet and round-1 adjudication
- 2026-08-04T23:48:57Z — moved to in_progress (claimed by shift@Shiftor; note: round-2 adjudication: accepted soft-delete exclusion, exact snapshot comparison, commit-count unknown/truncation, bounded terminal fields with full JSON, milestone tag correlation, marker schema validation, migration guidance, ADR, fallback-path tests, and validation-parser coverage. Confirmed run-checks auto-discovers managed *.test.mjs suites; full bootstrap remains the post-review acceptance gate.)
- 2026-08-04T23:49:07Z — run: node --test starter/.agent-foundry/project-status.test.mjs starter/.agents/skills/task-tracker/scripts/_lib.test.mjs starter/.claude/skills/task-tracker/scripts/_lib.test.mjs
  started 2026-08-04T23:49:02Z, exit 0 in 5.1s
  output tail (truncated to last 30 lines):
  |       type: 'test'
  |       ...
  |     1..2
  | ok 36 - parseRunEvidenceLog
  |   ---
  |   duration_ms: 0.9291
  |   type: 'suite'
  |   ...
  | # Subtest: nowIso
  |     # Subtest: returns YYYY-MM-DDTHH:MM:SSZ
  |     ok 1 - returns YYYY-MM-DDTHH:MM:SSZ
  |       ---
  |       duration_ms: 0.1473
  |       type: 'test'
  |       ...
  |     1..1
  | ok 37 - nowIso
  |   ---
  |   duration_ms: 0.1985
  |   type: 'suite'
  |   ...
  | 1..37
  | # tests 124
  | # suites 37
  | # pass 124
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 4980.5027
- 2026-08-04T23:49:14Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-04T23:49:14Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-04T23:49:17Z — run: node scripts/validate-foundry.mjs
  started 2026-08-04T23:49:14Z, exit 0 in 2.8s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-04T23:49:20Z — moved to review (note: implementation packet frozen for cold review round 3 after focused suites, shared-skill synchronization, and structural validation passed)
- 2026-08-04T23:56:22Z — moved to in_progress (claimed by shift@Shiftor; note: cold review round 3 (rung 1, Claude Code 2.1.221) completed both axes. Fixed material findings: multiline and invalid-date planning inputs, partial Git failures, NUL-delimited paths, warning visibility, JSON field semantics/docs, and same-date coverage. Rejected false positives: deleted:true tasks are structurally required to be done and cannot be claimable; git is already a Foundry/bootstrap prerequisite; the explicit <=12 rule counts nonblank output lines, not terminal wrapping. ADR 0002 is accepted because the operator explicitly approved the data-first status plus visual-overview proposal with 'i like it, proceed' on 2026-08-04. At the three-round cap, remaining low risks are local marker symlink test portability and unresolvable-marker Git detail; both fail closed or report unknown.)
- 2026-08-04T23:56:27Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-04T23:56:27Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-04T23:56:29Z — run: node scripts/validate-foundry.mjs
  started 2026-08-04T23:56:27Z, exit 0 in 2.2s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-04T23:57:32Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-04T23:56:33Z, exit 0 in 58.2s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ..........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\clean-project\.agent-foundry-backups\20260804T235728621Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\clean-project
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\seed-upgrade-project\.agent-foundry-backups\20260804T235730323Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\clean-project\.agent-foundry-backups\20260804T235731597Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.16.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-nC34uP\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-04T23:57:51Z — moved to review (note: final acceptance packet: focused tests 126/126, skill-sync PASS, structural validation PASS, and disposable clean-project bootstrap PASS)
- 2026-08-04T23:57:51Z — moved to done (note: accepted after three cold-review rounds; stable JSON and the <=12-line operator view fail honestly on missing evidence and preserve full detail for generated consumers)
