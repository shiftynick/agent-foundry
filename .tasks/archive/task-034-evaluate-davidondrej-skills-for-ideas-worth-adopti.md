---
id: task-034
title: Evaluate davidondrej/skills for ideas worth adopting
status: done
priority: p3
tags: [area:research]
blockedBy: []
createdAt: "2026-08-09T01:04:39Z"
updatedAt: "2026-08-09T01:31:04Z"
---

<!-- task-tracker:description -->
## Description

Review https://github.com/davidondrej/skills and assess whether any skills or patterns there are worth adapting into Agent Foundry's shared skill set. Deliverable: a short evaluation note (docs/research/ or task log) listing candidate ideas with adopt/adapt/skip per item and rationale; file separate tasks for anything worth building. Respect licensing; adapt concepts rather than copying text where license is unclear. Operator request 2026-08-08.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:04:39Z — created (status: backlog)
- 2026-08-09T01:11:04Z — moved to ready
- 2026-08-09T01:11:05Z — moved to in_progress (claimed by shift@Shiftor; note: Delegated to background research subagent)
- 2026-08-09T01:17:44Z — note: Evaluation complete via read-only research subagent. 44 skills + 3 hooks, MIT. Verdict: nothing worth wholesale ADOPT; 4 concepts worth adapting (decisions-disclosure -> execute-task = strongest; before-building fast mode -> the-fool; delegation-brief cross-check + worktree isolation -> efficient-orchestration; guardrails denylist = operator decision). Note: docs/research/skills-repo-evaluations-2026-08-08.md. Follow-ups filed: task-036 (p2), task-037 (p3), task-038 (p3, needs:operator). Full item-by-item table in the subagent result; deliverable is the note + filed tasks; no code or process change in this task, operator acceptance stands in for cold review.
- 2026-08-09T01:17:44Z — moved to review (note: Deliverable is an evaluation note; surfaced for operator acceptance)
- 2026-08-09T01:31:04Z — note: Operator 2026-08-08 accepted the evaluation with one amendment: task-038 (safety hooks) declined and removed; task-036 and task-037 accepted as filed.
- 2026-08-09T01:31:04Z — moved to done
