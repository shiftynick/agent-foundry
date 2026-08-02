---
id: task-015
title: Add shared agent-foundry-feedback skill
status: backlog
priority: p3
tags: [area:skills, type:feature]
blockedBy: []
createdAt: "2026-08-02T12:27:15Z"
updatedAt: "2026-08-02T12:27:15Z"
---

<!-- task-tracker:description -->
## Description

Installed projects gain a shared skill that packages foundry-directed feedback from where it already accumulates - friction notes, retrospective findings that target mold files, and recorded local divergences marked upstream-worthy - into a self-contained report carrying the installed foundry version and affected mold paths. Delivery is two-tier: always write the packet to a local file; offer GitHub issue filing only when the gh CLI is present and the operator approves. Consider recording the install source in the manifest so feedback routes to the right upstream. Overlaps task-011: this skill is a candidate delivery mechanism for LOCAL-CHANGES entries marked Upstream: yes. Acceptance: both harness trees carry the skill, counts and tables updated, and a generated packet from a dirty test install names the right version and mold files.

<!-- task-tracker:log -->
## Log

- 2026-08-02T12:27:15Z — created (status: backlog)
