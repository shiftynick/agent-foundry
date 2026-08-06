---
id: task-019
title: Require recorded review evidence before a code task reaches done
status: backlog
priority: p1
tags: [area:workflow]
blockedBy: []
createdAt: "2026-08-06T14:45:40Z"
updatedAt: "2026-08-06T14:45:40Z"
---

<!-- task-tracker:description -->
## Description

Pattern (session-audit run-001, 2026-08-05): board transitions are recorded as bookkeeping rather than as gates, so a task can reach done without the cold review the SDLC prescribes.

Occurrences: ai4c task-721 - four lifecycle transitions recorded in the same second (23:17:36Z) after the work was done, zero review passes, no rubric, on a change deleting 78 lines across 8 files. ai4c task-715 - 23 files landed on a task already parked in review for an unrelated copy proposal, then exited review to done without the code receiving a pass. Plus 13 tasks across ai4c and interra-api-proxy chained two or more transitions within one second on 2026-08-05.

Cost: two substantive changes shipped unreviewed, and the audit trail reads compliant in both cases, so the bypass is invisible to exactly the record a reviewer would consult.

Governing document: starter/docs/SDLC.md is the authority on the cold-review ladder; the task-tracker skill owns move semantics.

Proposed edit (small, two parts): (1) In SDLC.md where the review ladder is defined, state that a task whose diff touches code reaches done only when its log records the review invocation and its outcome, and that a task already in review which absorbs new code must re-enter in_progress and take a fresh pass. (2) In the task-tracker skill, name the failure at the point of use: moving to done without recorded review evidence produces a log that asserts compliance that did not occur.

Evidence: docs/research/session-audit-run-001-findings.md findings Q1 and Q3, verified at transcript offsets.

<!-- task-tracker:log -->
## Log

- 2026-08-06T14:45:40Z — created (status: backlog)
