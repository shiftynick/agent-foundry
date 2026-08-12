---
id: task-6246861934000004
title: Cold-review the visual-review round-3 fixes with a scoped delta pass
status: review
priority: p2
tags: [area:process]
blockedBy: []
createdAt: "2026-08-12T00:41:14Z"
updatedAt: "2026-08-12T00:47:49Z"
---

<!-- task-tracker:description -->
## Description

The three fixes made in cold-review round 3 of task-6246861934000002 (link-aware confinement of the primary artifact, fs.watch degradation surfaced through /api/reload and the UI, browser-side send failures made visible instead of swallowed) shipped without their own cold review, because the protocol caps at three full rounds. Each has a test that fails on the pre-fix tree, but no independent reviewer examined the fixes. Operator chose a scoped delta review on 2026-08-11 during a visual-review session. Build a packet naming only those three fixes and dispatch a single cold call with --axis SPEC or --axis STANDARDS per cold-review.md's delta-check rule.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:41:14Z — created (status: backlog)
- 2026-08-12T00:47:14Z — note: rubric: (1) Each of the three round-3 fixes is present in both harness trees and does what the task log claims. (2) The link-aware confinement of the primary artifact rejects a symlinked artifact at startup and per read, with no path by which /artifact serves a file outside the artifact directory. (3) The watcher-degradation flag is truthful: it reports false when fs.watch cannot start or later errors, and that value reaches /api/reload and the UI. (4) Browser-side send failures are visible to the operator and do not discard the typed comment. (5) No fix introduced a new defect in an already-reviewed path (injectSdk, CSP, Origin/content-type gating, queue sequencing).
- 2026-08-12T00:47:14Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T00:47:49Z — moved to review
