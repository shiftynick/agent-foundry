---
id: task-002
title: Slim task-tracker and execute-task instruction loading
status: done
priority: p1
tags: [area:process]
blockedBy: []
createdAt: "2026-07-30T12:24:06Z"
updatedAt: "2026-07-30T15:40:40Z"
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
- 2026-07-30T15:28:31Z — note: cold review round 1 used rung 1 with concurrent separate Claude SPEC/STANDARDS calls. Accepted and fixed: wrong Claude harness path, dropped trigger phrases, missing paired-skill gate, lost new-test/regression/lint obligations, reviewer-output trust reminder, reserved task markers and claim/list/force semantics, and proposed-ADR operator queue routing. Retained concise lifecycle reminders in task-tracker as non-authoritative safety pointers; execute-task/SDLC remain explicit authorities. Rejected with live evidence: UTF-8 punctuation is intact, run-checks.mjs exists in the installed payload, and 0.8.0 is a clean minor upgrade for unmodified installs with reconciliation only for project drift. Re-review required after material fixes.
- 2026-07-30T15:33:55Z — note: Round 2 adjudication: accepted exact dependency-state wording, centralized validation authority, cold-review contract deduplication, new-file upgrade collision handling, and refreshed size measurement. Current default entrypoints are 1,325 words total (execute-task 680; task-tracker 645), versus 5,309 before: 75.0% smaller.
- 2026-07-30T15:37:35Z — run: node -e const fs=require('fs');const ps=['starter/.agents/skills/execute-task/SKILL.md','starter/.agents/skills/task-tracker/SKILL.md'];const cs=ps.map(p=>fs.readFileSync(p,'utf8').trim().split(/\s+/).length);console.log(ps.map((p,i)=>p+' '+cs[i]).join('\n'));console.log('total '+cs.reduce((a,b)=>a+b,0))
  started 2026-07-30T15:37:35Z, exit 1 in 0.1s
  output:
  | [eval]:1
  | const
  |
  | Unexpected token `<eof>`. Expected yield, an identifier, [ or {
  |
  | SyntaxError: Unexpected end of input
  |     at makeContextifyScript (node:internal/vm:185:14)
  |     at compileScript (node:internal/process/execution:383:10)
  |     at evalTypeScript (node:internal/process/execution:256:22)
  |     at node:internal/main/eval_string:74:3
  |
  | Node.js v22.22.2
- 2026-07-30T15:37:48Z — run: node -e fs=require('fs');ps=['starter/.agents/skills/execute-task/SKILL.md','starter/.agents/skills/task-tracker/SKILL.md'];cs=ps.map(p=>fs.readFileSync(p,'utf8').trim().split(/\s+/).length);console.log(ps.map((p,i)=>p+'='+cs[i]).join('\n'));console.log('total='+cs.reduce((a,b)=>a+b,0))
  started 2026-07-30T15:37:48Z, exit 1 in 0.1s
  output:
  | [eval]:1
  | fs=require('fs');ps=['starter/.agents/skills/execute-task/SKILL.md','starter/.agents/skills/task-tracker/SKILL.md'];cs=ps.map(p=,'utf8').trim().split(/\s+/).length);console.log(ps.map((p,i)=='+cs[i]).join('\n'));console.log('total='+cs.reduce((a,b)=,0))
  |                                                                                                                                 ^
  | Expression expected
  |
  | SyntaxError: Unexpected token ','
  |     at makeContextifyScript (node:internal/vm:185:14)
  |     at compileScript (node:internal/process/execution:383:10)
  |     at evalTypeScript (node:internal/process/execution:256:22)
  |     at node:internal/main/eval_string:74:3
  |
  | Node.js v22.22.2
- 2026-07-30T15:38:11Z — run: node -e eval(Buffer.from('Y29uc3QgZnM9cmVxdWlyZSgnZnMnKTtjb25zdCBwcz1bJ3N0YXJ0ZXIvLmFnZW50cy9za2lsbHMvZXhlY3V0ZS10YXNrL1NLSUxMLm1kJywnc3RhcnRlci8uYWdlbnRzL3NraWxscy90YXNrLXRyYWNrZXIvU0tJTEwubWQnXTtjb25zdCBjcz1wcy5tYXAocD0+ZnMucmVhZEZpbGVTeW5jKHAsJ3V0ZjgnKS50cmltKCkuc3BsaXQoL1xzKy8pLmxlbmd0aCk7Y29uc29sZS5sb2cocHMubWFwKChwLGkpPT5wKyc9Jytjc1tpXSkuam9pbignXG4nKSk7Y29uc29sZS5sb2coJ3RvdGFsPScrY3MucmVkdWNlKChhLGIpPT5hK2IsMCkpOw==','base64').toString())
  started 2026-07-30T15:38:11Z, exit 0 in 0.1s
  output:
  | starter/.agents/skills/execute-task/SKILL.md=680
  | starter/.agents/skills/task-tracker/SKILL.md=642
  | total=1322
- 2026-07-30T15:38:11Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T15:38:11Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (11 shared skills)
- 2026-07-30T15:38:13Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T15:38:11Z, exit 0 in 2.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T15:38:37Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T15:38:13Z, exit 0 in 23.2s
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
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-IrD4MO\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-IrD4MO\clean-project\.agent-foundry-backups\20260730T153836043Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-IrD4MO\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-IrD4MO\clean-project\.agent-foundry-backups\20260730T153836747Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.8.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-IrD4MO\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T15:38:37Z — run: git diff --check
  started 2026-07-30T15:38:37Z, exit 2 in 0.1s
  output:
  | .tasks/tasks/task-002-slim-task-tracker-and-execute-task-instruction-loa.md:75: trailing whitespace.
  | +  |
- 2026-07-30T15:38:59Z — run: git diff --check
  started 2026-07-30T15:38:59Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T15:40:40Z — note: Cold review round 3 complete at ladder rung 1 (Claude counterpart CLI): SPEC PASS and shared STANDARDS PASS after adjudicated fixes. Frozen-tree gates passed; measurement command recorded 1,322 default words (680 + 642), 75.1% below the 5,309-word baseline.
- 2026-07-30T15:40:40Z — moved to done
