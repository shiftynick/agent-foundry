---
id: task-023
title: Run session-audit run 002 over a multi-day post-upgrade window
status: backlog
priority: p2
tags: [area:research]
blockedBy: []
createdAt: "2026-08-06T14:45:58Z"
updatedAt: "2026-08-06T14:45:58Z"
---

<!-- task-tracker:description -->
## Description

Follow-on to run-001 (docs/research/session-audit-run-001-findings.md), which recommended adopt. Run 001 covered a single day (2026-08-05), which was enough to establish mechanical facts but too narrow for trend claims - four hypotheses were left on the watch list purely for want of a second day.

Scope for run 002:
1. Widen the window to the full post-upgrade cohort (2026-08-05 onward; the three projects were re-installed 2026-08-05 ~02:00 UTC, so the cohort boundary is clean). Keep pre-upgrade sessions in a separate cohort or excluded.
2. Add a CI-duration join. Run 001 could not determine whether the 1.27 hours of blocked waiting exceeded what the pipelines actually took, which is the open question blocking task-022.
3. Settle the watch list: delegation prompts dropping session-learned environment facts (2 occurrences, 1 repo); worktree read-before-edit path mismatch in the agent-headless flow (12 failures but 2 sessions, 1 repo, 1 workflow); ADR accepted at or after the code it governs (2 occurrences, project-myriad only).
4. Optional and separable: a Codex adapter for cross-harness comparison. 57 Codex session files (~110 MB) existed in the same window. Treat as its own task if it grows.

Baseline figures from run-001 to track across runs: avoidable-waste fraction 1.1 percent of active agent time; 15.7 ms per output token; review rounds per task and cap-hit rate; four vacuous-oracle instances caught in review; blocked waiting at 20 percent of tool execution; roughly 272k tokens of context per request.

Tooling already exists at scripts/session-audit/ (discover, reduce, correlate; 41 tests). Acceptance: the run is reproducible, evidence is offset-verifiable, no transcript content enters Git, and the report ends with an explicit adopt/revise/stop recommendation rather than manufacturing findings because the run happened.

<!-- task-tracker:log -->
## Log

- 2026-08-06T14:45:58Z — created (status: backlog)
