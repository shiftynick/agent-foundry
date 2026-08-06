---
id: task-021
title: Accept help as a task.mjs verb
status: backlog
priority: p3
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-06T14:45:41Z"
updatedAt: "2026-08-06T14:45:41Z"
---

<!-- task-tracker:description -->
## Description

Pattern (session-audit run-001, 2026-08-05): agents discover the task.mjs verb surface by trial and error. Nine failed invocations across four sessions and all three repositories - unknown verb: tag, unknown verb: help, unknown flag: --tag, --tags, illegal transition, title must be non-empty.

Verified in this repository: 'task.mjs help' exits 2 with 'ERROR: unknown verb: help', while bare 'task.mjs' prints 'usage: task.mjs <verb> [args...]' followed by the verb list. The affordance already exists; it is simply unreachable by the name an agent reaches for first.

Cost: small per event (about 1.3 minutes and 1,790 recovery output tokens across the day) but on a hot path - task.mjs carried 296 calls and 56.5 minutes of tool execution in this cohort, the third-largest command family.

Governing document: the task-tracker skill's task.mjs script.

Proposed edit: treat help, --help and -h as aliases that print the existing usage output and exit 0. This is a shared-skill change and must land in both harness trees byte-identically.

Evidence: docs/research/session-audit-run-001-findings.md finding S5.

<!-- task-tracker:log -->
## Log

- 2026-08-06T14:45:41Z — created (status: backlog)
