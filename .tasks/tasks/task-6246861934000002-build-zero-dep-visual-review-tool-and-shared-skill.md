---
id: task-6246861934000002
title: Build zero-dep visual-review tool and shared skill pair
status: backlog
priority: p2
tags: [area:tooling]
blockedBy: [task-6246861934000001]
createdAt: "2026-08-11T23:06:07Z"
updatedAt: "2026-08-11T23:06:07Z"
---

<!-- task-tracker:description -->
## Description

Implement the approved option (b) from docs/research/visual-artifact-review-strategy-2026-08-11.md: a zero-dependency Node script in the starter payload implementing the core review loop only - serve one HTML artifact on 127.0.0.1 via node:http, inject one SDK script tag by string transform, element and text-selection annotation UI, prompt queue, long-poll endpoint for the agent, live reload via fs.watch, print the URL (no browser auto-open). Out of scope: whiteboard, layout audit, sharing, telemetry, playbooks. Security requirements: loopback-only bind, Host-header validation, zero outbound network calls, artifact-directory confinement, sandboxed iframe without allow-same-origin. Ship as a new shared skill in BOTH harness trees (.claude canonical, mirrored to .agents) with a payload *.test.mjs so test-bootstrap exercises it. Cross-platform (Windows) required.

<!-- task-tracker:log -->
## Log

- 2026-08-11T23:06:07Z — created (status: backlog)
