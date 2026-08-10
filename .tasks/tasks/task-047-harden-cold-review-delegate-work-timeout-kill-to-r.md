---
id: task-047
title: Harden cold-review/delegate-work timeout kill to reap provider process trees
status: ready
priority: p2
tags: [area:tooling, source:task-046]
blockedBy: []
createdAt: "2026-08-10T20:30:11Z"
updatedAt: "2026-08-10T20:30:47Z"
---

<!-- task-tracker:description -->
## Description

From task-046 cold-review round 3 STANDARDS (at cap, residual): cold-review.mjs and delegate-work.mjs SIGTERM on timeout then return without waiting for exit or killing descendants. A write-access delegate could keep running after the wrapper reports timed-out. Align with agent-headless process-tree termination (taskkill /t on Windows; SIGTERM then SIGKILL).

<!-- task-tracker:log -->
## Log

- 2026-08-10T20:30:11Z — created (status: backlog)
- 2026-08-10T20:30:47Z — moved to ready
