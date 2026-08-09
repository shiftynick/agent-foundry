---
id: task-033
title: Add a nightly review-findings audit skill
status: backlog
priority: p2
tags: [area:process, area:tooling]
blockedBy: []
createdAt: "2026-08-09T01:04:39Z"
updatedAt: "2026-08-09T01:04:39Z"
---

<!-- task-tracker:description -->
## Description

Formalize what task-031 did by hand into a repeatable nightly process: a shared skill (both harness trees) that sweeps the day's cold-review findings across installed repos (Claude and Codex runs), classifies them against the taxonomy in docs/research/review-findings-audit-001.md, and reports recurring classes plus candidate shift-left edits. Inputs: each repo's .tasks logs (adjudications) and optionally session transcripts; reuse the extraction JSON shape from audit run 001 (findings-*.json: axis, round, task, repo, citation, gist, adjudication, resultingChange, class). Output: a dated report with per-class counts, deltas vs prior runs, and explicit adopt/revise/stop candidates - never auto-edits skills. Decide: skill-only (agent-driven) vs script-assisted extraction; how it triggers nightly (operator-run vs scheduled); where reports land in installed repos. Operator request 2026-08-08.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:04:39Z — created (status: backlog)
