---
id: task-044
title: Make seed restore preflight-then-mutate and reject link-traversing paths
status: backlog
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-09T02:58:15Z"
updatedAt: "2026-08-09T02:58:15Z"
---

<!-- task-tracker:description -->
## Description

Upstream packet from aigent-place, verified against stock 0.26.0: docs/research/upstream-packets/2026-08-08/aigent-place-reconcile-seeds-partial-restore-and-links.md.

Verified claim: starter/.agent-foundry/reconcile-seeds.mjs restoreSeedsFromHead() validates and mutates in a single loop - for each path it hash-checks, then immediately runs git checkout HEAD -- <path>. If a later path fails its hash check the function throws 'seed changed after installation; refusing to overwrite', but earlier paths have ALREADY been overwritten. The error states the opposite of what happened. The function also does not reject seed paths that traverse a symlink or junction.

Proposed: preflight every path first, then a single batched checkout, plus a confinement check that refuses link-traversing paths; two tests.

Acceptance: red-capable tests (a mid-list hash mismatch must leave every file untouched; a link-traversing path must be refused); zero-dep Node; gates green; VERSION+CHANGELOG; cold review. On landing, tell aigent-place so its LOCAL-CHANGES entries can retire.

<!-- task-tracker:log -->
## Log

- 2026-08-09T02:58:15Z — created (status: backlog)
