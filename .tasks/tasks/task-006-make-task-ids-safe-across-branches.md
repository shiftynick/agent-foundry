---
id: task-006
title: Make task IDs safe across branches
status: backlog
priority: p1
tags: [area:task-tracker, type:defect]
blockedBy: []
createdAt: "2026-07-30T19:16:21Z"
updatedAt: "2026-07-30T19:16:21Z"
---

<!-- task-tracker:description -->
## Description

Prevent duplicate numeric task IDs created from branches that do not contain the latest board state. Add an immediate upgrade-flow guard that starts task creation from the current default branch, then design and implement collision-tolerant allocation or deterministic recovery/renumbering that preserves filenames, frontmatter, and dependencies. Cover sequential stale-branch and concurrent-branch merge scenarios.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:16:21Z — created (status: backlog)
