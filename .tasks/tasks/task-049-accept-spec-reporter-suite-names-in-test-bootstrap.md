---
id: task-049
title: Accept spec-reporter suite names in test-bootstrap run-checks assertion
status: backlog
priority: p2
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-11T19:49:59Z"
updatedAt: "2026-08-11T19:49:59Z"
---

<!-- task-tracker:description -->
## Description

test-bootstrap.mjs asserts installed run-checks stdout matches /Subtest: project overview/ (TAP). On Node 24.5.0 the piped spec reporter prints '▶ project overview' instead, so the wrapper fails after every installed suite including project-overview has already passed. Seen on task-048's recorded bootstrap run. Change the assertion to accept both TAP and spec suite banners, or pin node --test --test-reporter=tap in run-checks. Do not treat a green project-overview suite as a miss.

<!-- task-tracker:log -->
## Log

- 2026-08-11T19:49:59Z — created (status: backlog)
