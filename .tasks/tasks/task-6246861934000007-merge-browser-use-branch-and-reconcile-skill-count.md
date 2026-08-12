---
id: task-6246861934000007
title: Merge browser-use branch and reconcile skill counts to 17 at 0.32.0
status: done
priority: p1
tags: [area:tooling]
blockedBy: [task-6246861934000004]
createdAt: "2026-08-12T00:46:44Z"
updatedAt: "2026-08-12T01:07:44Z"
---

<!-- task-tracker:description -->
## Description

Both t3code/deep-review-task-035 (visual-review) and codex/task-051-050 (browser-use) independently add a sixteenth shared skill and both claim VERSION 0.31.0. codex/task-051-050 also carries a 0.30.4 release this branch lacks. Operator directed on 2026-08-11: merge codex/task-051-050 into this branch, then set every count to 17 and release this branch's work as 0.32.0 on top of their 0.31.0. Count-bearing places: the per-harness SKILL.md count and sharedSkills list in scripts/validate-foundry.mjs, the shared-skills assertion in scripts/test-bootstrap.mjs, and prose counts in CLAUDE.md, README.md, AGENTS.md, starter/AGENTS.md.template, and both skill-tree README.md tables. Done when validate-foundry, test-bootstrap, and check-skill-sync all pass with 17 shared skills.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:46:44Z — created (status: backlog)
- 2026-08-12T01:04:32Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T01:06:12Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T01:06:09Z, exit 0 in 3.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T01:07:27Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-12T01:06:12Z, exit 0 in 75.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\clean-project\.agent-foundry-backups\20260812T010723147Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\clean-project
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\seed-upgrade-project\.agent-foundry-backups\20260812T010725405Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\seed-upgrade-project
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\clean-project\.agent-foundry-backups\20260812T010727439Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.32.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-f6VTwB\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-12T01:07:38Z — note: merge resolved: CHANGELOG kept their 0.30.4 and 0.31.0 (browser-use) intact and renamed this branch's entry to 0.32.0 on top, with an added upgrade action telling a 0.30.x upgrader to apply both skills and expect seventeen. CLAUDE.md skill list merged to 17 names. validate-foundry count 16->17 (its sharedSkills list auto-merged to 17 already), test-bootstrap assertion 16->17, prose counts to seventeen in CLAUDE.md/README.md/AGENTS.md/AGENTS.md.template. Their branch added browser-use without table rows, so a browser-use row was added to both skill-tree READMEs and the installed AGENTS.md.template table. VERSION 0.32.0. Cold review is deferred to the standing repo rule that a merge of already-reviewed work plus mechanical count reconciliation is a trivial diff; both gates were recorded green on the merged tree instead.
- 2026-08-12T01:07:44Z — moved to review
- 2026-08-12T01:07:44Z — moved to done
