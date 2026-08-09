---
id: task-038
title: Decide whether Foundry ships agent safety hooks
status: done
priority: p3
tags: [area:process, needs:operator, deleted:true]
blockedBy: []
createdAt: "2026-08-09T01:17:32Z"
updatedAt: "2026-08-09T01:30:57Z"
---

<!-- task-tracker:description -->
## Description

Operator decision needed before any work: should the starter payload include a PreToolUse-style safety hook (denylist of catastrophic shell commands) for installed projects? Concept from davidondrej/skills global-agent-guardrails (MIT) - genuinely harness-neutral idea with a well-engineered pattern file, but the reference implementation is bash+jq (fails Windows, violates zero-dep Node) and hooks are configuration the mold currently does not touch. If approved: zero-dep Node 20 port, dual-tree wiring where each harness supports hooks, collision-safe install. If declined: close with rationale. Source: docs/research/skills-repo-evaluations-2026-08-08.md.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:17:32Z — created (status: backlog)
- 2026-08-09T01:30:57Z — note: Operator 2026-08-08: declined - Foundry will not ship agent safety hooks. Closing per operator decision.
- 2026-08-09T01:30:57Z — removed (soft delete)
