---
id: task-028
title: Require ASD-STE100 for operator chat
status: done
priority: p1
tags: [area:process]
blockedBy: []
createdAt: "2026-08-08T15:18:09Z"
updatedAt: "2026-08-08T15:21:13Z"
---

<!-- task-tracker:description -->
## Description

Update docs/SDLC.md Operator communication to require ASD-STE100 Simplified Technical English for operator-facing chat (questions, updates, explanations, review/validation reports, closeouts). Keep AGENTS.md as a pointer only. Do not rewrite skill bodies in this task; that is a separate follow-up.

<!-- task-tracker:log -->
## Log

- 2026-08-08T15:18:09Z — created (status: backlog)
- 2026-08-08T15:18:09Z — note: rubric: (1) SDLC Operator communication names ASD-STE100 as the required style for operator chat and keeps evidence/records out of that style mandate; (2) root AGENTS.md and starter AGENTS.md.template point at that authority without duplicating the rules; (3) grill-me and execute-task operator-facing wording defer to SDLC/STE rather than a second plain-language standard; (4) VERSION 0.20.0 with CHANGELOG Upgrade actions; (5) validate-foundry and skill-sync pass; (6) a separate board task describes skill-body STE conversion
- 2026-08-08T15:18:09Z — moved to in_progress (claimed by shift@Shiftor; note: implementing STE operator-chat authority)
- 2026-08-08T15:19:05Z — run: node scripts/validate-foundry.mjs
  started 2026-08-08T15:19:02Z, exit 0 in 2.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-08T15:19:05Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-08T15:19:05Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-08T15:19:05Z — note: filed follow-up task-029 for skill-body STE conversion
- 2026-08-08T15:19:05Z — moved to review (note: implementation ready for cold review)
- 2026-08-08T15:21:11Z — note: cold review rung 1: agent-headless provider=codex answer-only. Round1 SPEC finding (AGENTS duplicated evidence sentence) fixed; STANDARDS PASS. Round2 SPEC rework PASS.
- 2026-08-08T15:21:13Z — run: node scripts/validate-foundry.mjs
  started 2026-08-08T15:21:11Z, exit 0 in 2.2s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-08T15:21:13Z — moved to done (note: STE operator-chat authority shipped; skill STE is task-029)
