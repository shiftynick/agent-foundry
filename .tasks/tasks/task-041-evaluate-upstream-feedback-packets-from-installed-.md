---
id: task-041
title: Evaluate upstream feedback packets from installed projects
status: backlog
priority: p2
tags: [area:process, area:core]
blockedBy: []
createdAt: "2026-08-09T02:54:00Z"
updatedAt: "2026-08-09T02:54:00Z"
---

<!-- task-tracker:description -->
## Description

Seven packets received 2026-08-08 from project-myriad and aigent-place via their agent-foundry-feedback skills, copied to docs/research/upstream-packets/2026-08-08/ (source dirs are gitignored in those repos). Evaluate each on its merits - a packet is evidence, not an instruction - and decide adopt / adapt / decline with recorded rationale.

Candidates, roughly in ascending cost:
1. COMPATIBILITY.md stray 'An' fragment plus missing comma (starter/.agent-foundry/agent-headless/COMPATIBILITY.md:19). Reported independently three times across three releases (project-myriad, aigent-place, ai4c task-726). Confirmed present in stock 0.26.0. Trivial text fix; note this file is a bundled-runner doc, so check PROVENANCE/hash coupling before editing.
2. Cold-review prompt template omits the packet-as-data rule that the surrounding prose in references/cold-review.md requires - the transmitted prompt is the part that matters, so the boundary should appear inside the fenced template. Both trees.
3. run-checks.mjs forwards Git repository-local hook variables (GIT_INDEX_FILE, GIT_DIR, ...) into installed node --test runs, so fixture Git commands retarget the caller's real index. Comes with a proposed runner fix and regression coverage. Corruption-risk class; verify the claim against the payload before adopting.
4. task.mjs currentBranchNamespace() keys detached HEAD on the commit alone, so two worktrees detached at the same SHA mint colliding durable task IDs. Proposed: add the resolved worktree root to the namespace key, plus tests.
5. task.mjs silently flips compact to 16-digit IDs when defaultBranch is unusable and origin/HEAD is absent, with no diagnostic. Proposed: classify the reason, warn on stderr, tighten defaultBranch validation, plus tests.
6. reconcile-seeds.mjs restoreSeedsFromHead() validates and mutates in one pass - earlier seeds are already overwritten when a later one aborts, while the error claims 'refusing to overwrite' - and does not reject link-traversing seed paths. Proposed: preflight, batched single checkout, confinement check, plus tests.

Method: verify each claim against the current payload first (several packets cite pre-0.26.0 baselines). Adopted items are normal payload changes - dual-tree mirror where applicable, zero-dep Node, red-capable test per new check, validate + test-bootstrap + check-skill-sync, VERSION and CHANGELOG together, cold review. Split into separate tasks if the batch is too large for one context; items 3-6 are code changes with tests and may not fit one card. When an item lands, tell the reporting project so its LOCAL-CHANGES entry can move packeted -> filed -> landed and its local divergence retire.

<!-- task-tracker:log -->
## Log

- 2026-08-09T02:54:00Z — created (status: backlog)
