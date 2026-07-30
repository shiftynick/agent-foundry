---
id: task-005
title: Prevent seed customization loss during upgrades
status: backlog
priority: p0
tags: [area:upgrade, type:defect]
blockedBy: []
createdAt: "2026-07-30T19:16:20Z"
updatedAt: "2026-07-30T19:16:20Z"
---

<!-- task-tracker:description -->
## Description

Replace UPGRADING.md's hand-maintained seed restore list with a manifest-derived mechanism. Reproduce that --force resets a locally edited CLAUDE.md, prove the current post-upgrade drift check cannot detect the reset, restore and re-merge every non-preserved seed without losing local edits, and add regression coverage for current and future seed files.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:16:20Z — created (status: backlog)
