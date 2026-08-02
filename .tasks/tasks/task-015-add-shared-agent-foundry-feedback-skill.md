---
id: task-015
title: Add shared agent-foundry-feedback skill
status: done
priority: p3
tags: [area:skills, type:feature]
blockedBy: []
createdAt: "2026-08-02T12:27:15Z"
updatedAt: "2026-08-02T14:01:53Z"
---

<!-- task-tracker:description -->
## Description

Installed projects gain a shared skill that packages foundry-directed feedback from where it already accumulates - friction notes, retrospective findings that target mold files, and recorded local divergences marked upstream-worthy - into a self-contained report carrying the installed foundry version and affected mold paths. Delivery is two-tier: always write the packet to a local file; offer GitHub issue filing only when the gh CLI is present and the operator approves. Consider recording the install source in the manifest so feedback routes to the right upstream. Overlaps task-011: this skill is a candidate delivery mechanism for LOCAL-CHANGES entries marked Upstream: yes. Acceptance: both harness trees carry the skill, counts and tables updated, and a generated packet from a dirty test install names the right version and mold files.

<!-- task-tracker:log -->
## Log

- 2026-08-02T12:27:15Z — created (status: backlog)
- 2026-08-02T13:46:27Z — note: rubric: (1) both harness trees carry agent-foundry-feedback and skill-sync passes; (2) the skill assembles a self-contained packet from where feedback already accumulates (friction notes, retrospective findings targeting mold files, LOCAL-CHANGES entries marked Upstream: yes) carrying the installed foundry version and affected mold paths; (3) delivery is two-tier: local packet file always, GitHub issue only when gh exists and the operator approves the destination; (4) no restatement of retrospective/task-tracker/LOCAL-CHANGES semantics - referenced, not copied; (5) validator counts, test-bootstrap assertion, and every count-bearing doc/table updated; (6) validate-foundry and test-bootstrap pass
- 2026-08-02T13:46:27Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-02T13:48:47Z — run: node scripts/validate-foundry.mjs
  started 2026-08-02T13:48:44Z, exit 0 in 2.8s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-02T13:48:47Z — note: draft complete in both trees; counts/tables updated (16 files / 15 shared) in validator, test-bootstrap, CLAUDE.md, README.md, AGENTS.md, AGENTS.md.template, both skill-tree READMEs; validate-foundry, skill-sync (15 shared), and full test-bootstrap pass; packet dir is .agent-foundry/feedback/, delivery two-tier with operator-gated issue filing; awaiting cold review rounds and 0.14.0 release entry
- 2026-08-02T14:00:58Z — moved to review
- 2026-08-02T14:00:58Z — note: cold review ladder rung 1 (codex-in-claude, gpt-5.6-sol, read-only): SPEC and STANDARDS axes, three rounds; findings fixed across rounds 1-2 (stock-diff baseline unrecoverable from manifest hashes, feedback dir ungitignored, gather rule contradicted retrospective on project-specific mold divergence, gh had no verification command, sanitization did not cover diffs/fallback content reaching a published issue, .agent-foundry/README.md omitted feedback/); round 3 both axes: No findings
- 2026-08-02T14:01:43Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-02T14:00:58Z, exit 0 in 45.3s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | .................
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.14.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\clean-project\.agent-foundry-backups\20260802T140139546Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.14.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\clean-project
  | Agent Foundry 0.14.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\seed-upgrade-project\.agent-foundry-backups\20260802T140141681Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.14.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\clean-project\.agent-foundry-backups\20260802T140143321Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.14.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4OIlFD\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-02T14:01:53Z — moved to done
