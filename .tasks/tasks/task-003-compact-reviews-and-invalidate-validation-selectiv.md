---
id: task-003
title: Compact reviews and invalidate validation selectively
status: backlog
priority: p1
tags: [area:process]
blockedBy: []
createdAt: "2026-07-30T12:24:06Z"
updatedAt: "2026-07-30T12:24:06Z"
---

<!-- task-tracker:description -->
## Description

Reduce review and validation time/token cost without lowering quality. Make separate SPEC/STANDARDS calls parallel and findings-only with concise structured output; prevent review suggestions from silently expanding task scope; define a conservative file-to-gate invalidation rule so targeted checks run during editing and expensive full gates run once after the diff freezes, with high-risk and uncertain changes still receiving full validation. Keep SDLC as authority and both harness trees synchronized. Acceptance: review recall safeguards remain, validation reruns are safely decidable, VERSION/CHANGELOG actions are complete, cold reviews and Foundry gates pass.

<!-- task-tracker:log -->
## Log

- 2026-07-30T12:24:06Z — created (status: backlog)
