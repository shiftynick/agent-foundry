---
id: task-035
title: Evaluate and incorporate kunchenguid/lavish-axi skill into Foundry
status: backlog
priority: p3
tags: [area:process]
blockedBy: []
createdAt: "2026-08-09T01:04:39Z"
updatedAt: "2026-08-09T01:04:39Z"
---

<!-- task-tracker:description -->
## Description

Operator request 2026-08-08: incorporate the skill at https://github.com/kunchenguid/lavish-axi into Agent Foundry. Step 1 is evaluation: fetch the repo, read the skill, determine what it does, check license and quality, and confirm it fits Foundry's constraints (domain/language/framework-neutral starter payload, dual-tree mirror, ASD-STE100 style, zero-dep Node). Step 2, if it passes: add it to both harness trees, update the shared-skill count and list in scripts/validate-foundry.mjs, CHANGELOG + VERSION bump, validate + test-bootstrap. If evaluation finds it unsuitable, report why and stop - surface to operator before adapting heavily.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:04:39Z — created (status: backlog)
