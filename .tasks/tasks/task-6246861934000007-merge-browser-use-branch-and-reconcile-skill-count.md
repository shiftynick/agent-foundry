---
id: task-6246861934000007
title: Merge browser-use branch and reconcile skill counts to 17 at 0.32.0
status: backlog
priority: p1
tags: [area:tooling]
blockedBy: [task-6246861934000004]
createdAt: "2026-08-12T00:46:44Z"
updatedAt: "2026-08-12T00:46:44Z"
---

<!-- task-tracker:description -->
## Description

Both t3code/deep-review-task-035 (visual-review) and codex/task-051-050 (browser-use) independently add a sixteenth shared skill and both claim VERSION 0.31.0. codex/task-051-050 also carries a 0.30.4 release this branch lacks. Operator directed on 2026-08-11: merge codex/task-051-050 into this branch, then set every count to 17 and release this branch's work as 0.32.0 on top of their 0.31.0. Count-bearing places: the per-harness SKILL.md count and sharedSkills list in scripts/validate-foundry.mjs, the shared-skills assertion in scripts/test-bootstrap.mjs, and prose counts in CLAUDE.md, README.md, AGENTS.md, starter/AGENTS.md.template, and both skill-tree README.md tables. Done when validate-foundry, test-bootstrap, and check-skill-sync all pass with 17 shared skills.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:46:44Z — created (status: backlog)
