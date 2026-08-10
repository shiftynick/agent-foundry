---
id: task-045
title: Align task.mjs run timeout with Cursor provider budget
status: done
priority: p2
tags: [area:tooling, phase:audit, source:nightly-audit]
blockedBy: []
createdAt: "2026-08-10T12:47:09Z"
updatedAt: "2026-08-10T20:30:55Z"
---

<!-- task-tracker:description -->
## Description

From nightly audit 2026-08-09 (docs/research/run-audits/2026-08-09.md, candidate 1): when attack-the-board wraps Cursor coding runs under task.mjs run, the tracker default 900s ceiling kills the provider before Cursor's ~20m budget is spent. aigent-place lost ~80-100 min across task-048/049/051 to this mismatch, plus a ~30 min task-052 dead-end that imported nothing (N:\aigent-place task-048 log :56; task-049 :31; task-052 :25). Change point of use in task-tracker and/or agent-headless so a Cursor coding wrap either inherits a ceiling at or above the provider budget, or refuses/warns when the wrap timeout is shorter than the selected provider's known budget. Harness-neutral; dual-tree; VERSION+CHANGELOG if installed behavior changes.

<!-- task-tracker:log -->
## Log

- 2026-08-10T12:47:09Z — created (status: backlog)
- 2026-08-10T20:10:37Z — edited (+blockedBy task-046)
- 2026-08-10T20:10:37Z — note: Superseded in scope by task-046 (timeout stack is item 1 of the speed recommendations package).
- 2026-08-10T20:30:47Z — moved to ready
- 2026-08-10T20:30:47Z — note: Delivered inside task-046 (25m default, --timeout-ms, provider-wrap floor). Closing as done.
- 2026-08-10T20:30:47Z — note: fast-path: trivial — docs/process timeout alignment only, covered by task-046 review evidence.
- 2026-08-10T20:30:55Z — edited (-blockedBy task-046)
- 2026-08-10T20:30:55Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-10T20:30:55Z — moved to review
- 2026-08-10T20:30:55Z — moved to done
