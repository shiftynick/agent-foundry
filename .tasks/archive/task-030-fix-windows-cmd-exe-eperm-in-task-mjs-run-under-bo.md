---
id: task-030
title: Fix Windows cmd.exe EPERM in task.mjs run under bootstrap
status: done
priority: p1
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-08T15:38:35Z"
updatedAt: "2026-08-08T16:00:46Z"
---

<!-- task-tracker:description -->
## Description

On this host, node scripts/test-bootstrap.mjs fails in the installed task-tracker suite: strips escape forms other than SGR from recorded evidence fails with spawnSync C:\WINDOWS\system32\cmd.exe EPERM. task.mjs run uses spawnSync(commandLine, { shell: true }). Simple task.mjs run commands still work; the ANSI-heavy -e fixture does not. Reproduced outside bootstrap against starter/.agents/skills/task-tracker/scripts/task.test.mjs. Restore a green disposable bootstrap on Windows without weakening escape sanitization coverage.

<!-- task-tracker:log -->
## Log

- 2026-08-08T15:38:35Z — created (status: backlog)
- 2026-08-08T15:51:01Z — note: rubric: (1) task.mjs run no longer fails with cmd.exe EPERM on the ANSI-escape fixture under Windows. (2) Escape sanitization still strips non-SGR forms from recorded evidence; that test still asserts the same sanitization outcome. (3) Simple task.mjs run commands keep working. (4) Dual-tree task-tracker scripts stay in sync; validate-foundry and the focused task-tracker tests pass. (5) VERSION/CHANGELOG updated if installed behavior changes.
- 2026-08-08T15:51:02Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-08T15:53:07Z — note: chose Buffer.from fixture because Windows CreateProcess EPERM fires on the combined \u001b-literal command line even with shell:false; shell:true must stay so npm.cmd resolves on Windows
- 2026-08-08T15:53:38Z — moved to review
- 2026-08-08T15:53:38Z — note: behaviors under test: (1) non-SGR escape forms still scrubbed to abcde; mutation that restored \u001b-literal cmdline would EPERM on this host or weaken coverage if scrub removed. Docs: changelog+VERSION only; no skill prose change.
- 2026-08-08T15:56:55Z — note: SPEC adjudication (rung 1, claude answer-only): (1) missing validate/bootstrap evidence — accept as process gap, will record via task.mjs run. (2) fromCharCode still may trip AV — accept, hardened to temp .mjs file so CreateProcess cmdline has no escape generators. (3) DCS mislabel — accept, comment corrected. STANDARDS: PASS.
- 2026-08-08T15:58:37Z — note: SPEC/STANDARDS r2 (claude rung 1) adjudication: writeFileSync already imported (reject ReferenceError). Absolute fixture path applied (accept). Fixture inside empty .git mkdir tree + finally rmSync (reject unclean-worktree risk). Missing gate evidence — recording now. .tmp-reviews not committed. Changelog upgrade-actions style matches 0.14.1 patch precedent.
- 2026-08-08T15:58:37Z — run: node --test --test-name-pattern strips escape forms other than SGR|strips ANSI|strips 8-bit|ends a control|records command|sanitizes the recorded starter/.agents/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-08T15:58:37Z, exit 255 in 0.0s
  output:
  | 'strips' is not recognized as an internal or external command,
  | operable program or batch file.
- 2026-08-08T15:58:41Z — run: node --test --test-name-pattern=strips escape forms other than SGR|strips ANSI|strips 8-bit|ends a control|records command|sanitizes the recorded starter/.agents/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-08T15:58:41Z, exit 255 in 0.0s
  output:
  | 'strips' is not recognized as an internal or external command,
  | operable program or batch file.
- 2026-08-08T15:59:14Z — run: node --test starter/.agents/skills/task-tracker/scripts/task.test.mjs
  started 2026-08-08T15:58:46Z, exit 0 in 27.8s
  output tail (truncated to last 30 lines):
  |       duration_ms: 65.9722
  |       type: 'test'
  |       ...
  |     # Subtest: points at a reference file that exists in this tree
  |     ok 5 - points at a reference file that exists in this tree
  |       ---
  |       duration_ms: 0.3706
  |       type: 'test'
  |       ...
  |     # Subtest: still rejects an unknown verb with exit 2
  |     ok 6 - still rejects an unknown verb with exit 2
  |       ---
  |       duration_ms: 62.6211
  |       type: 'test'
  |       ...
  |     1..6
  | ok 14 - task help
  |   ---
  |   duration_ms: 329.7715
  |   type: 'suite'
  |   ...
  | 1..14
  | # tests 74
  | # suites 14
  | # pass 74
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 27772.1524
- 2026-08-08T15:59:23Z — run: node scripts/validate-foundry.mjs
  started 2026-08-08T15:59:21Z, exit 0 in 2.7s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-08T16:00:28Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-08T15:59:23Z, exit 0 in 64.9s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.22.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\clean-project\.agent-foundry-backups\20260808T160024992Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.22.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\clean-project
  | Agent Foundry 0.22.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\seed-upgrade-project\.agent-foundry-backups\20260808T160026887Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.22.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\clean-project\.agent-foundry-backups\20260808T160028205Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.22.1 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-F1139p\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-08T16:00:46Z — note: cold-review rung: 1 (agent-headless provider=claude, family=Anthropic; implementer=Cursor/Composer). Round 1 SPEC findings fixed; round 2 findings adjudicated; STANDARDS PASS both rounds. Rubric satisfied. Docs: VERSION+CHANGELOG only.
- 2026-08-08T16:00:46Z — moved to done
