---
id: task-022
title: Define a sanctioned wait pattern for CI deploy and background results
status: backlog
priority: p2
tags: [area:workflow]
blockedBy: []
createdAt: "2026-08-06T14:45:41Z"
updatedAt: "2026-08-06T14:45:41Z"
---

<!-- task-tracker:description -->
## Description

Pattern (session-audit run-001, 2026-08-05): agents hold a tool slot open waiting on external systems, and the two workarounds in use are both wasteful. This is a missing rule - no current document governs how an agent should wait.

Occurrences: 1.27 hours of explicit blocking waits (59 calls, mean 77s) across three sessions and two repositories, which is 20 percent of all tool execution. Verified instances: interra c2dc8481 line 1162 runs sleep 300 followed by gh run list; interra 54a4e2d3 line 136 runs gh run watch --interval 20 under a 600s timeout. The alternative strategy is no better - project-myriad 4257d334 polled a background task output file 27 times; corpus-wide 25 of 51 polling reads returned nothing and 8 were answered by the harness with 'Wasted call - file unchanged since your last Read'.

Compounding factor: foreground sleep is blocked by the harness inconsistently - refused at 98084e1c line 336, allowed at c2dc8481 line 1162 - so the agent cannot learn a rule from experience.

Cost: 1.27 hours of blocked tool time plus roughly 4 minutes of model round-trips spent on polling reads that returned nothing.

Proposed edit: name the pattern once, at the point of use, in the efficient-orchestration skill - when work depends on CI, a deploy, or a background agent, do not block a shell and do not poll an output file; state the sanctioned primitive and cadence.

Open question this task must answer before proposing wording: whether the waits were longer than the underlying pipelines actually took. Run 002 adds a CI-duration join that would settle it. Determine the correct primitive empirically before writing guidance.

Evidence: docs/research/session-audit-run-001-findings.md findings S1 and S2.

<!-- task-tracker:log -->
## Log

- 2026-08-06T14:45:41Z — created (status: backlog)
