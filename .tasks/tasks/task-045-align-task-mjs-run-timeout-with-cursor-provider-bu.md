---
id: task-045
title: Align task.mjs run timeout with Cursor provider budget
status: backlog
priority: p2
tags: [area:tooling, phase:audit, source:nightly-audit]
blockedBy: []
createdAt: "2026-08-10T12:47:09Z"
updatedAt: "2026-08-10T12:47:09Z"
---

<!-- task-tracker:description -->
## Description

From nightly audit 2026-08-09 (docs/research/run-audits/2026-08-09.md, candidate 1): when attack-the-board wraps Cursor coding runs under task.mjs run, the tracker default 900s ceiling kills the provider before Cursor's ~20m budget is spent. aigent-place lost ~80-100 min across task-048/049/051 to this mismatch, plus a ~30 min task-052 dead-end that imported nothing (N:\aigent-place task-048 log :56; task-049 :31; task-052 :25). Change point of use in task-tracker and/or agent-headless so a Cursor coding wrap either inherits a ceiling at or above the provider budget, or refuses/warns when the wrap timeout is shorter than the selected provider's known budget. Harness-neutral; dual-tree; VERSION+CHANGELOG if installed behavior changes.

<!-- task-tracker:log -->
## Log

- 2026-08-10T12:47:09Z — created (status: backlog)
