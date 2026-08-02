---
id: task-014
title: Add shared upgrade-agent-foundry skill
status: done
priority: p2
tags: [area:skills, type:feature]
blockedBy: []
createdAt: "2026-08-02T12:27:15Z"
updatedAt: "2026-08-02T12:44:21Z"
---

<!-- task-tracker:description -->
## Description

Installed projects gain a shared skill that walks an agent through upgrading Agent Foundry in place from either a local foundry checkout or a GitHub URL: read the installed version from the manifest, obtain the new foundry (operator approves any network fetch), read every changelog entry after the installed version, apply the forced upgrade with its automatic backups, apply each entry's upgrade actions in order, re-apply recorded local divergences, and finish with the sync and drift checks green. The skill references UPGRADING.md rather than restating it. Acceptance: both harness trees carry the skill, validator counts and skill tables are updated, and a scripted upgrade of an older-version install completes with all checks passing.

<!-- task-tracker:log -->
## Log

- 2026-08-02T12:27:15Z — created (status: backlog)
- 2026-08-02T12:27:57Z — note: rubric: (1) both harness trees carry upgrade-agent-foundry and skill-sync passes; (2) the skill acquires the new foundry from a local path or an operator-approved clone of a URL, verifies it is a foundry, and stops on same-or-older VERSION; (3) the procedure itself is delegated to the acquired foundry's UPGRADING.md with no restatement; (4) validator counts, test-bootstrap assertion, and every doc/table naming the shared-skill count are updated; (5) validate-foundry and test-bootstrap pass end-to-end
- 2026-08-02T12:27:57Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-02T12:30:06Z — run: node scripts/validate-foundry.mjs
  started 2026-08-02T12:30:03Z, exit 0 in 3.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-02T12:30:06Z — note: draft complete in both trees; counts/tables updated in validator, test-bootstrap, CLAUDE.md, README.md, AGENTS.md, AGENTS.md.template, both skill-tree READMEs; validate-foundry, skill-sync (14 shared), and full test-bootstrap pass; awaiting cold review rounds and 0.13.0 release entry
- 2026-08-02T12:43:29Z — moved to review
- 2026-08-02T12:43:29Z — note: cold review ladder rung 1 (codex-in-claude, gpt-5.6-sol, read-only): SPEC and STANDARDS axes, three rounds; round-1/2 findings (missing-manifest stop, starter/ verification, procedure restatement, execute-task lifecycle boundary, deferral scoping) all fixed and re-reviewed; round 3 both axes: No findings
- 2026-08-02T12:44:14Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-02T12:43:30Z, exit 0 in 44.5s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | .................
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.13.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\clean-project\.agent-foundry-backups\20260802T124409392Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.13.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\clean-project
  | Agent Foundry 0.13.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\seed-upgrade-project\.agent-foundry-backups\20260802T124411450Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.13.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\clean-project\.agent-foundry-backups\20260802T124413784Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.13.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-tRvG2V\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-02T12:44:21Z — moved to done
