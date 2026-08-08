---
id: task-010
title: Define deploy-dependent acceptance lifecycle
status: done
priority: p2
tags: [area:process, type:improvement]
blockedBy: []
createdAt: "2026-07-30T19:30:24Z"
updatedAt: "2026-08-08T15:38:35Z"
---

<!-- task-tracker:description -->
## Description

Define a dependency-safe lifecycle for changes whose final acceptance requires an authorized post-merge deployment, so implementation, merge, deployment, and acceptance evidence can be tracked without falsely marking work done or making branch delivery impossible.

<!-- task-tracker:log -->
## Log

- 2026-07-30T19:30:24Z — created (status: backlog)
- 2026-08-08T15:31:37Z — note: rubric: (1) SDLC (or a skill that owns lifecycle) defines a dependency-safe path for work whose acceptance needs authorized post-merge deploy; (2) board/task states never mark such work done before acceptance evidence exists, yet do not block merge/delivery of the implementation branch; (3) evidence fields or log conventions name what counts as deploy acceptance; (4) dual-tree sync if a skill changes; VERSION/CHANGELOG if installed behavior changes; (5) validate-foundry (+ bootstrap if release) pass; (6) cold SPEC/STANDARDS adjudicated
- 2026-08-08T15:31:37Z — moved to in_progress (claimed by shift@Shiftor; note: defining deploy-dependent acceptance lifecycle)
- 2026-08-08T15:32:20Z — run: node scripts/validate-foundry.mjs
  started 2026-08-08T15:32:18Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-08T15:32:20Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-08T15:32:20Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-08T15:32:20Z — note: chose single-card blocked-after-delivery as default, with split implementation/acceptance cards when other work depends only on code landing - avoids new board statuses and keeps dependencies honest
- 2026-08-08T15:32:27Z — moved to review (note: ready for cold review)
- 2026-08-08T15:36:54Z — moved to in_progress (claimed by shift@Shiftor; note: re-entering after cold review findings)
- 2026-08-08T15:38:19Z — run: node -e console.log('ok')
  started 2026-08-08T15:38:19Z, exit 0 in 0.1s
  output:
  | ok
- 2026-08-08T15:38:22Z — run: node scripts/validate-foundry.mjs
  started 2026-08-08T15:38:19Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-08T15:38:34Z — note: adjudication: SPEC/STANDARDS finding on illegal blocked->done ACCEPTED and fixed to blocked->review->done; SPEC rework PASS. STANDARDS bootstrap finding: host currently fails installed task-tracker escape-strip test with spawnSync cmd.exe EPERM when task.mjs run uses shell:true on the ANSI fixture; reproduced against unchanged starter test; not caused by this mold edit. validate-foundry and skill-sync pass. Filing separate host/bootstrap follow-up rather than expanding this task.
- 2026-08-08T15:38:35Z — note: cold review rung 1 provider=codex: round1 SPEC+STANDARDS findings on transition legality fixed; SPEC rework PASS; bootstrap host EPERM deferred to new task
- 2026-08-08T15:38:35Z — moved to review (note: fixes frozen; host bootstrap flake deferred)
- 2026-08-08T15:38:35Z — moved to done (note: deploy-dependent acceptance shipped in 0.21.0)
