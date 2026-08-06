---
id: task-020
title: Add an oracle-vacuity self-check before requesting cold review
status: backlog
priority: p2
tags: [area:workflow]
blockedBy: []
createdAt: "2026-08-06T14:45:40Z"
updatedAt: "2026-08-06T14:45:40Z"
---

<!-- task-tracker:description -->
## Description

Pattern (session-audit run-001, 2026-08-05): implementer-written tests pass vacuously, and cold review rather than the implementer is what catches it. Four occurrences across three repositories in a single day.

Occurrences: ai4c 0669e1c7 - the composer non-flagship path had no executed test, so the whole path could have been deleted with every test still green. ai4c a51c0a83 - per-vertical tests asserted a single door per vertical, so a renderer dropping doors 2-4 would have passed. ai4c 84806ebe - the page test proved compilation, not render. interra-api-proxy task-6627529457000003 - every seeded run sat inside the 24-hour window, so the window filter could have been deleted without failing a test.

Cost: each instance consumed a review round and a follow-up commit. The validation gate is the primary quality claim in the SDLC, and in this cohort it was systematically weaker than the record implies.

Governing document: the execute-task skill, at its validation step, before review is requested.

Proposed edit (one checklist line at the point of use): before requesting cold review, state for the new or changed tests which specific change to the implementation they would fail to catch. If the answer is none, the oracle is vacuous and the test does not yet validate anything.

Evidence: docs/research/session-audit-run-001-findings.md finding Q2, verified against commit bodies and task logs.

<!-- task-tracker:log -->
## Log

- 2026-08-06T14:45:40Z — created (status: backlog)
