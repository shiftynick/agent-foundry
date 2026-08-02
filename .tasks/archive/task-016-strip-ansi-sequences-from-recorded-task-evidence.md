---
id: task-016
title: Strip ANSI sequences from recorded task evidence
status: done
priority: p2
tags: [area:skills, type:fix]
blockedBy: []
createdAt: "2026-08-02T14:03:36Z"
updatedAt: "2026-08-02T14:37:02Z"
---

<!-- task-tracker:description -->
## Description

Recorded evidence must stay committable: a command whose output carries ANSI escapes previously left scrub artifacts and trailing whitespace in the task log, failing a trailing-whitespace gate on the one feature whose purpose is producing committable evidence. Strip escape sequences before the control-character scrub and trim per-line trailing whitespace, with tests covering colored output, a reset followed by trailing space, and reserved-marker scrubbing.

<!-- task-tracker:log -->
## Log

- 2026-08-02T14:03:36Z — created (status: backlog)
- 2026-08-02T14:03:37Z — note: rubric: (1) ANSI sequences never reach recorded evidence and leave no ?[ artifacts; (2) no recorded evidence line ends in whitespace; (3) tests cover color, reset-then-space, and reserved markers; (4) payload comments stay language- and incident-neutral; (5) both harness copies identical and skill-sync passes; (6) changelog entry with upgrade actions for the installed behavior change
- 2026-08-02T14:03:37Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-02T14:20:07Z — run: node --test starter/.claude/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-02T14:19:29Z, exit 0 in 37.5s
  output tail (truncated to last 30 lines):
  |   type: 'suite'
  |   ...
  | # Subtest: task rm
  |     # Subtest: soft-deletes by setting status=done and adding deleted:true tag
  |     ok 1 - soft-deletes by setting status=done and adding deleted:true tag
  |       ---
  |       duration_ms: 360.8282
  |       type: 'test'
  |       ...
  |     # Subtest: keeps dependents blocked when their blocker is soft-deleted
  |     ok 2 - keeps dependents blocked when their blocker is soft-deleted
  |       ---
  |       duration_ms: 866.2042
  |       type: 'test'
  |       ...
  |     1..2
  | ok 13 - task rm
  |   ---
  |   duration_ms: 1227.1803
  |   type: 'suite'
  |   ...
  | 1..13
  | # tests 65
  | # suites 13
  | # pass 65
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 37386.9944
- 2026-08-02T14:20:16Z — note: cold review round 1 (codex-in-claude, gpt-5.6-sol, read-only): SPEC found the CSI parameter class omitted <,=,> plus unhandled OSC/8-bit CSI/VT/truncated forms, and that commandLine was recorded unsanitized; STANDARDS found incident-dated and assertion-narrating comments. Reworked into stripTerminalEscapes + sanitizeForLog applied to both the output tail and the command line; two tests added; a 16-case harness over the extracted helpers confirmed every reviewer-named form
- 2026-08-02T14:27:13Z — note: cold review round 2: SPEC found 8-bit OSC/DCS C1 introducers still surviving (C0 scrub excludes U+0080-9F) and that an emptied or multiline command line reintroduced trailing whitespace; STANDARDS found the ST fixture depended on a literal backslash surviving the platform shell, a raw ESC byte embedded in installed source, and regex-narrating comments. All fixed: C1 range covered, command line collapsed/trimmed with placeholder fallback, fixture built via fromCharCode, raw bytes eliminated (scan clean), comments reduced to the ordering constraint
- 2026-08-02T14:27:42Z — run: node --test starter/.agents/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-02T14:27:14Z, exit 0 in 28.5s
  output tail (truncated to last 30 lines):
  |   type: 'suite'
  |   ...
  | # Subtest: task rm
  |     # Subtest: soft-deletes by setting status=done and adding deleted:true tag
  |     ok 1 - soft-deletes by setting status=done and adding deleted:true tag
  |       ---
  |       duration_ms: 219.3545
  |       type: 'test'
  |       ...
  |     # Subtest: keeps dependents blocked when their blocker is soft-deleted
  |     ok 2 - keeps dependents blocked when their blocker is soft-deleted
  |       ---
  |       duration_ms: 520.7992
  |       type: 'test'
  |       ...
  |     1..2
  | ok 13 - task rm
  |   ---
  |   duration_ms: 740.2798
  |   type: 'suite'
  |   ...
  | 1..13
  | # tests 67
  | # suites 13
  | # pass 67
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 28370.0596
- 2026-08-02T14:35:46Z — note: cold review round 3 (cap): SPEC and STANDARDS converged on the missing 8-bit SOS introducer; SPEC additionally found the terminator alternation wrongly let BEL end DCS/SOS/PM/APC (releasing payload) and ignored CAN/SUB cancellation. Both fixed: SOS added, and the control-string rule split so BEL ends OSC only, with CAN/SUB cancelling any control string. Residual risk: these last fixes landed after the third round and are covered by a 24-case local harness over the extracted helpers plus a new CLI-level regression test, not by a fourth cold round
- 2026-08-02T14:36:13Z — run: node --test starter/.agents/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-02T14:35:46Z, exit 0 in 26.5s
  output tail (truncated to last 30 lines):
  |   type: 'suite'
  |   ...
  | # Subtest: task rm
  |     # Subtest: soft-deletes by setting status=done and adding deleted:true tag
  |     ok 1 - soft-deletes by setting status=done and adding deleted:true tag
  |       ---
  |       duration_ms: 203.6532
  |       type: 'test'
  |       ...
  |     # Subtest: keeps dependents blocked when their blocker is soft-deleted
  |     ok 2 - keeps dependents blocked when their blocker is soft-deleted
  |       ---
  |       duration_ms: 472.4487
  |       type: 'test'
  |       ...
  |     1..2
  | ok 13 - task rm
  |   ---
  |   duration_ms: 676.2096
  |   type: 'suite'
  |   ...
  | 1..13
  | # tests 68
  | # suites 13
  | # pass 68
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 26448.9219
- 2026-08-02T14:37:02Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-02T14:36:20Z, exit 0 in 42.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | .......
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.14.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\clean-project\.agent-foundry-backups\20260802T143658961Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.14.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\clean-project
  | Agent Foundry 0.14.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\seed-upgrade-project\.agent-foundry-backups\20260802T143700849Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.14.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\clean-project\.agent-foundry-backups\20260802T143702256Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.14.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fEFQV2\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-02T14:37:02Z — moved to review
- 2026-08-02T14:37:02Z — moved to done
