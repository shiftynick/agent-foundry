---
id: task-042
title: Scrub Git repository-local env vars before installed test runs
status: backlog
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-09T02:58:15Z"
updatedAt: "2026-08-09T02:58:15Z"
---

<!-- task-tracker:description -->
## Description

Upstream packet from project-myriad, verified against stock 0.26.0: docs/research/upstream-packets/2026-08-08/myriad-scrub-hook-git-environment-in-run-checks.md.

Verified claim: starter/.agent-foundry/run-checks.mjs runStep() calls spawnSync with cwd/stdio/windowsHide and NO env option, so the child inherits process.env. When run-checks runs from a Git hook (pre-commit), Git has exported repository-local variables - GIT_INDEX_FILE, GIT_DIR, GIT_WORK_TREE, GIT_PREFIX and the rest - and installed *.test.mjs suites that create temporary fixture repositories then have their git commands retarget and lock the CALLER'S real index. Corruption-risk class, not cosmetic. Payload suites that spawn fixture git today: project-overview, project-status, reconcile-seeds (per the reporting project's verification).

Proposed in the packet: an exported GIT_LOCAL_ENV_VARS list, an installedTestEnvironment() that strips those names from a copy of process.env with case folding (Windows env names are case-insensitive), and runStep gaining an environment parameter; plus regression coverage in run-checks.test.mjs that pins the live list and the case-variant behavior. Evaluate that shape - do not adopt verbatim without checking the case-folding logic and whether the list should be derived rather than hardcoded.

Acceptance: red-capable test (a seeded GIT_INDEX_FILE in the parent env must make the test fail before the fix); zero-dep Node; validate + test-bootstrap green; VERSION+CHANGELOG; cold review. On landing, tell project-myriad so its LOCAL-CHANGES entries for run-checks.mjs and run-checks.test.mjs can retire.

<!-- task-tracker:log -->
## Log

- 2026-08-09T02:58:15Z — created (status: backlog)
