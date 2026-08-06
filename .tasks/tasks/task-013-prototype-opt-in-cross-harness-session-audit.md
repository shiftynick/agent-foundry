---
id: task-013
title: Prototype opt-in cross-harness session audit
status: in-progress
priority: p2
tags: [area:workflow, area:research]
blockedBy: []
createdAt: "2026-08-01T22:06:07Z"
updatedAt: "2026-08-06T00:00:00Z"
---

<!-- task-tracker:description -->
## Description

At the revisit threshold defined in docs/research/session-audit-poc.md, prototype a local, report-only audit of Codex and Claude session histories. Acceptance: provider adapters stream records without loading whole transcripts; sessions are assigned to repository and Foundry-version cohorts; deterministic reduction precedes any model analysis; parent and delegated sessions are not double-counted; redacted evidence packets remain bounded and auditable; the Aigent Place historical cohort validates the machinery while current-Foundry conclusions wait for the documented minimum cohort; no transcript or derived private data enters Git.

<!-- task-tracker:log -->
## Log

- 2026-08-01T22:06:07Z — created (status: backlog)
- 2026-08-06 — revisit threshold met: ai4c, interra-api-proxy, and project-myriad re-installed to current Foundry on 2026-08-05 with substantive post-upgrade sessions in all three. Run 001 planned in docs/research/session-audit-run-001-plan.md: Claude-only, 2026-08-05 cohort, durable reducer at scripts/session-audit/, adds context-noise measurement as a secondary lens. Status → in-progress, priority → p2.
- 2026-08-06 — tooling built at scripts/session-audit/ (discover/reduce/correlate + 41 tests) via orchestrated builder → cold-review → evidence-audit → fix cycle. Cold reviewer reproduced the run byte-identically; evidence auditor verified all 145 evidence records at their source offsets and recomputed metrics to 0 delta. Verified run-001b output (8 parent sessions + 12 subagents, 2026-08-05, three repos) now feeding speed/waste and quality analysts. Methodological catch worth keeping: summed per-session figures overstate wall-clock ~2.9x under session concurrency; summary.json carries a concurrency/union block so headline numbers stay honest.
- 2026-08-06 — analysis complete; findings synthesized in docs/research/session-audit-run-001-findings.md. Headlines: avoidable agent waste is 1.1% of active time (speed is volume — 1.53M output tokens + 3-round review ladder, plus 20% of tool execution blocked waiting on CI/deploys); quality verdict "partially substantiated, direction inverted" — first-pass quality low, cold review absorbing it, with two coverage holes (a zero-review refactor with a replayed board lifecycle, and a review-state loophole). 8 hypotheses handed to the retrospective (H1–H8). Recommendation: adopt; run 002 = wider window + CI-duration join + optional Codex adapter.
