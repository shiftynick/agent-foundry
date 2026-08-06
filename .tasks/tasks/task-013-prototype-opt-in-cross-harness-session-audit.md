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
