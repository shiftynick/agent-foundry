---
id: task-6246861934000008
title: Make the visual-review shell-page UI behavior a repeatable gate
status: done
priority: p3
tags: [area:tooling, deleted:true]
blockedBy: []
createdAt: "2026-08-12T00:56:52Z"
updatedAt: "2026-08-12T01:03:33Z"
---

<!-- task-tracker:description -->
## Description

Two consecutive cold-review rounds on task-6246861934000004 flagged the same structural gap: the shell page's browser-side behavior (post() failure handling, comment and selection preservation, sticky send-failure status, reload-status arbitration) is asserted only by pattern-matching strings in the generated HTML. That is a check over a serialized artifact and cannot fail for the right reason. Behavior has been verified manually in a real browser, but a manual session is evidence, not a gate, and cannot catch later removal of sendFailed or of comment retention. Options to weigh: extract the client script to a served file and drive it with a minimal DOM shim built from node: built-ins only; or move the assertions to a scripted browser session recorded as evidence per run. Zero-dependency and cross-platform constraints still apply, so a headless-browser dependency is not acceptable in the payload.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:56:52Z — created (status: backlog)
- 2026-08-12T01:03:33Z — removed (soft delete)
