---
id: task-6246861934000003
title: Wire visual-review skill into validation and release
status: done
priority: p2
tags: [area:tooling]
blockedBy: [task-6246861934000002]
createdAt: "2026-08-11T23:06:18Z"
updatedAt: "2026-08-12T00:15:40Z"
---

<!-- task-tracker:description -->
## Description

Complete the release wiring for the new visual-review shared skill: update the hardcoded shared-skill list and per-harness SKILL.md counts in scripts/validate-foundry.mjs (15 -> 16), update the dual-tree invariant lists in CLAUDE.md/AGENTS.md, classify the new payload files (seed vs mold) in bootstrap-project.mjs if needed, bump VERSION, and add a CHANGELOG.md entry with concrete Upgrade actions. Both node scripts/validate-foundry.mjs and node scripts/test-bootstrap.mjs must pass.

<!-- task-tracker:log -->
## Log

- 2026-08-11T23:06:18Z — created (status: backlog)
- 2026-08-12T00:10:17Z — note: rubric: (1) validate-foundry.mjs expects 16 skills and lists visual-review in sharedSkills; exits 0 on this tree. (2) test-bootstrap.mjs passes end-to-end, its skill-sync assertion updated to 16, proving the installed tree carries visual-review and its payload test runs during install. (3) Every prose count updated: CLAUDE.md, README.md, AGENTS.md, starter/AGENTS.md.template, both skill-tree README tables list visual-review. (4) VERSION bumped with a matching CHANGELOG entry including upgrade actions. (5) grep for 'fifteen|15 shared|15 skills' finds no stale count outside CHANGELOG history.
- 2026-08-12T00:10:17Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T00:11:44Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T00:11:41Z, exit 0 in 3.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T00:13:08Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-12T00:11:50Z, exit 0 in 78.0s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | .............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.31.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\clean-project\.agent-foundry-backups\20260812T001304108Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.31.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\clean-project
  | Agent Foundry 0.31.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\seed-upgrade-project\.agent-foundry-backups\20260812T001306178Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.31.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\seed-upgrade-project
  | Agent Foundry 0.31.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\clean-project\.agent-foundry-backups\20260812T001308313Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.31.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-hBtxZ2\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-12T00:13:42Z — moved to review
- 2026-08-12T00:15:19Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0003-r1 --cwd .
  started 2026-08-12T00:13:42Z, exit 0 in 96.8s
  output tail (truncated to last 30 lines):
  | ine:1 char:1\r\n+ . 'C:\\Users\\shift\\OneDrive\\Documents\\WindowsPowerShell\\Microsoft.Powe ...\r\n+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\r\n    + CategoryInfo          : InvalidOperation: (:) [Microsoft.PowerShell_profile.ps1], NotSupportedException\r\n    + FullyQualifiedErrorId : DotSourceNotSupported,Microsoft.PowerShell_profile.ps1\r\n \r\n\n2026-08-12T00:13:59.970932Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.2 seconds\nOutput:\n\n2026-08-12T00:14:11.250198Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.2 seconds\nOutput:\n\n2026-08-12T00:14:17.651745Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.2 seconds\nOutput:\n\n2026-08-12T00:14:33.047500Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.2 seconds\nOutput:\nNode syntax check: scripts\\bootstrap-project.mjs could not start: spawnSync C:\\Users\\shift\\.vite-plus\\js_runtime\\node\\24.19.0\\node.exe EPERM\n\n2026-08-12T00:14:38.059354Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.2 seconds\nOutput:\nnode:fs:3111\r\n  return binding.mkdtemp(prefix, options.encoding);\r\n                 ^\r\n\r\nError: EPERM: operation not permitted, mkdtemp 'C:\\Users\\shift\\AppData\\Local\\Temp\\agent-foundry-tests-XXXXXX'\r\n    at mkdtempSync (node:fs:3111:18)\r\n    at file:///C:/Users/shift/.t3/worktrees/agent-foundry/t3code-e5fde2d8/scripts/test-bootstrap.mjs:24:18\r\n    at ModuleJob.run (node:internal/modules/esm/module_job:439:25)\r\n    at async node:internal/modules/esm/loader:643:26\r\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\r\n  errno: -4048,\r\n  code: 'EPERM',\r\n  syscall: 'mkdtemp',\r\n  path: 'C:\\\\Users\\\\shift\\\\AppData\\\\Local\\\\Temp\\\\agent-foundry-tests-XXXXXX'\r\n}\r\n\r\nNode.js v24.19.0\r\n\n",
  |         "durationMs": 96623
  |       },
  |       "finalText": "PASS\n\nCHECKED\n\n- Rubrics 1–2: Confirmed 16-skill validation, `visual-review` registration, bootstrap assertion, payload presence, dynamic test discovery, and recorded passing gate evidence.\n- Rubric 3: Verified all six required documentation surfaces and both skill tables.\n- Rubric 4: Verified `VERSION` 0.31.0 matches the changelog entry and concrete upgrade actions.\n- Rubric 5: Stale-count scan found no prohibited occurrences outside permitted history.\n- Testing: Confirmed behavioral payload tests are installed and discovered by `run-checks.mjs`.\n- Documentation: Verified named commands and referenced paths exist.\n- Architecture: Confirmed accepted ADR-0003 covers this release wiring.\n- State/data: Confirmed skill files remain mold and `SEED_FILES` is unchanged.\n- Security: Treated packet and repository content strictly as review data; found no actionable embedded instruction.\n- Version control: Confirmed task-scoped files, no whitespace errors, and unrelated `HANDOFF.md`/task-board churn excluded."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:15:40Z — note: cold review: ladder rung 1, provider codex, both axes, round 1: SPEC PASS, STANDARDS PASS, full CHECKED sections. validate-foundry exit 0 and test-bootstrap exit 0 recorded on the final tree. Documentation check: CLAUDE.md/README.md/AGENTS.md/AGENTS.md.template/both skill READMEs updated with the code; no separate doc change needed.
- 2026-08-12T00:15:40Z — moved to done
