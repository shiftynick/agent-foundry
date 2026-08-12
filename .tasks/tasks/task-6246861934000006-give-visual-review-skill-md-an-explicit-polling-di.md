---
id: task-6246861934000006
title: Give visual-review SKILL.md an explicit polling discipline
status: backlog
priority: p2
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-12T00:41:14Z"
updatedAt: "2026-08-12T00:41:14Z"
---

<!-- task-tracker:description -->
## Description

Defect found by real use on 2026-08-11: the agent started the server, printed the URL, and stopped. The operator annotated six times and received no response until they asked why. SKILL.md documents the poll command but never states that after printing the URL the agent must keep polling in a loop until a complete event arrives, and must not treat one empty batch as the end of the review. Fix the skill text in both harness trees so the loop is an instruction, not an available command. Consider whether the empty-batch return value needs to be more obviously non-terminal.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:41:14Z — created (status: backlog)
