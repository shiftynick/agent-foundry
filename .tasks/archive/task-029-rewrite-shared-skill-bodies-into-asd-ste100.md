---
id: task-029
title: Rewrite shared skill bodies into ASD-STE100
status: done
priority: p2
tags: [area:process, area:tooling]
blockedBy: []
createdAt: "2026-08-08T15:18:51Z"
updatedAt: "2026-08-08T16:09:54Z"
---

<!-- task-tracker:description -->
## Description

Goal: Convert shared skill guidance (SKILL.md and references/*.md in both harness trees) into ASD-STE100 Simplified Technical English without changing behavior.

Out of scope: scripts (*.mjs), tests, CLI help strings that are machine contracts, CHANGELOG history, archived tasks. Operator chat already requires STE via docs/SDLC.md (0.20.0); do not reopen that unless this work finds a contradiction.

Why: Skills are ~28.5k tokens per harness (~17.5k words). Industry STE cuts often land around 20-40% shorter. Real session savings are smaller because agents usually load 1-3 skills; prioritize the largest first.

Do this:
1. Read docs/SDLC.md Operator communication and ASD-STE100 Issue 9 writing rules (controlled vocabulary + grammar rules). Add only Foundry-approved technical names that STE cannot replace (example: task-tracker, agent-headless, claimedBy, mold, seed).
2. Rewrite in size order, both trees in the same change: task-tracker, execute-task, handoff-writer, efficient-orchestration, codebase-audit, diagnosing-bugs, agent-headless, then the rest. Keep .claude/ canonical and mirror to .agents/ with the usual harness-path transform.
3. Preserve meaning: every imperative, gate, ladder rung, safety rule, and file path must survive. STE must not soften must/never rules or collapse distinct concepts into one approved synonym when the distinction matters.
4. Keep skill descriptions (YAML frontmatter) accurate for trigger matching; shorten them in STE only when triggers stay clear.
5. After each skill (or small batch), run node starter/.agent-foundry/check-skill-sync.mjs starter and node scripts/validate-foundry.mjs. Before release, run node scripts/test-bootstrap.mjs.
6. Bump VERSION and write CHANGELOG with Upgrade actions: reconcile locally modified skills by meaning into the STE wording; do not reintroduce verbose pre-STE prose.
7. Cold SPEC/STANDARDS review: SPEC checks no behavior loss; STANDARDS checks dual-tree sync, neutrality, and that operator-chat vs skill-body STE scopes stay distinct.

Done when: all fifteen shared skills' guidance markdown is STE; both trees sync; validate-foundry and test-bootstrap pass; release notes ship.

<!-- task-tracker:log -->
## Log

- 2026-08-08T15:18:51Z — created (status: backlog)
- 2026-08-08T16:01:03Z — note: rubric: (1) All 15 shared skills' SKILL.md and references/*.md rewritten in ASD-STE100 in both harness trees without behavior change. (2) Dual-tree sync passes (claude canonical, agents mirrored). (3) validate-foundry and test-bootstrap pass. (4) VERSION+CHANGELOG with Upgrade actions for STE wording reconciliation. (5) Cold SPEC (no behavior loss) and STANDARDS (sync, neutrality, chat-vs-skill STE scopes) adjudicated.
- 2026-08-08T16:01:03Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-08T16:01:32Z — note: routing: orchestrator=Cursor/Composer; work slices=parallel subagents (same family) rewriting .claude skill batches to STE; mirror to .agents via path/harness transform; cold review=agent-headless claude (Anthropic). Foundry technical nouns kept: task-tracker, execute-task, agent-headless, claimedBy, mold, seed, SPEC, STANDARDS, ADR, board statuses, and skill/CLI names. SDLC Operator communication updated: skill guidance is STE (contradiction with prior 'skill bodies stay normal English').
- 2026-08-08T16:04:24Z — note: STE pass complete on all 15 shared skills + refs; .claude canonical mirrored to .agents; sync+validate PASS. Word count ~17461→~17399 (style STE, not a mass cut). Reverted efficient-orchestration should→must strengthening (behavior drift).
- 2026-08-08T16:04:24Z — moved to review
- 2026-08-08T16:08:12Z — note: SPEC r1 (rung 2 fresh subagent): restored handoff-writer should/has-to modality (4 should→must strengthenings). STANDARDS PASS. Recording gates.
- 2026-08-08T16:08:21Z — run: node scripts/validate-foundry.mjs
  started 2026-08-08T16:08:19Z, exit 0 in 2.8s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-08T16:09:36Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-08T16:08:21Z, exit 0 in 74.1s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.23.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\clean-project\.agent-foundry-backups\20260808T160932143Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.23.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\clean-project
  | Agent Foundry 0.23.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\seed-upgrade-project\.agent-foundry-backups\20260808T160934186Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.23.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\clean-project\.agent-foundry-backups\20260808T160935489Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.23.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-185UeD\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-08T16:09:36Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-08T16:09:36Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-08T16:09:54Z — note: cold-review rung: 2 (fresh subagent, same family as implementer Cursor/Composer). SPEC FAIL→fix→PASS on handoff modality; STANDARDS PASS. Rubric satisfied. Docs: SDLC Operator communication + VERSION 0.23.0 + CHANGELOG.
- 2026-08-08T16:09:54Z — moved to done
