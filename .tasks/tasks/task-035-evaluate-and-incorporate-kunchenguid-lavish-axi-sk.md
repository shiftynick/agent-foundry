---
id: task-035
title: Plan strategy for a controlled visual-artifact review capability
status: done
priority: p3
tags: [area:process]
blockedBy: []
createdAt: "2026-08-09T01:04:39Z"
updatedAt: "2026-08-11T23:06:56Z"
---

<!-- task-tracker:description -->
## Description

Operator wants lavish-axi's capability (agent renders an HTML artifact, human reviews and annotates in a browser, agent applies feedback in a loop) under our control. Incorporating upstream as-is was evaluated and rejected (docs/research/skills-repo-evaluations-2026-08-08.md: unpinned npx execution, default-on telemetry, public-by-default share, runtime playbook injection channel). This task plans the exact strategy and ends with an operator-approved proposal, not code. Compare at minimum: (a) hard fork of lavish-axi (MIT permits it) - pin version, strip telemetry and share, vendor the playbooks, own the release; maintenance cost of tracking a fast-moving upstream; (b) minimal in-house tool with the same core loop (serve artifact + annotation UI + poll API) - lavish's core is express+chokidar+parse5, scope a zero-or-low-dep rebuild; (c) thin wrapper: pinned exact-version npx with telemetry env forced off and share forbidden by skill text - lowest effort, weakest control. For the chosen option, specify: where it lives (this repo vs payload vs separate repo), how the skill integrates with docs/SDLC.md's review model (a new review modality needs an SDLC decision - likely an ADR), Windows support, and security posture for the annotation server. Deliverable: written comparison + recommendation surfaced to operator; follow-up implementation tasks filed on approval. A scratchpad clone of upstream exists from the evaluation session for inspection.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:04:39Z — created (status: backlog)
- 2026-08-09T01:11:05Z — moved to ready
- 2026-08-09T01:11:05Z — moved to in_progress (claimed by shift@Shiftor; note: Delegated to background research subagent (evaluation phase only))
- 2026-08-09T01:17:44Z — note: Evaluation complete via read-only research subagent. lavish-axi is real and popular (~2.6k stars, MIT) but is an npm CLI product with a companion skill, not an adoptable skill: unpinned 'npx -y' execution model, default-on telemetry to the author's domain, public-by-default share to ht-ml.app, runtime-fetched playbook instruction channel (injection surface), trigger collides with native artifacts, review loop outside docs/SDLC.md's model, no dual-tree discipline upstream. Verdict UNSUITABLE for the starter payload; recommended alternative is per-project upstream install. Full detail: docs/research/skills-repo-evaluations-2026-08-08.md. Surfacing to operator per task description: recommend NOT incorporating.
- 2026-08-09T01:17:44Z — edited (+tag needs:operator)
- 2026-08-09T01:17:44Z — moved to blocked (note: Blocked on operator decision: evaluation recommends against incorporation)
- 2026-08-09T01:30:57Z — note: Operator direction 2026-08-08 after evaluation: do NOT drop the goal. The operator wants the capability - human-visual HTML artifact review in the loop - via either (a) a fork of lavish-axi under our control, or (b) a similar tool with the same features built/chosen by us. Task repurposed to strategy planning; incorporation-as-is remains rejected per the evaluation (docs/research/skills-repo-evaluations-2026-08-08.md).
- 2026-08-09T01:30:57Z — edited (title "Evaluate and incorporate kunchenguid/lavish-axi skill into Foundry"→"Plan strategy for a controlled visual-artifact review capability"; -tag needs:operator; description updated)
- 2026-08-09T01:31:04Z — moved to backlog (note: Unblocked: operator direction received (fork-we-control or equivalent capability); repurposed as strategy-planning task)
- 2026-08-11T23:05:02Z — moved to in_progress (claimed by shift@Shiftor; note: Operator approved strategy option (b): minimal zero-dep in-house rebuild of the core review loop. Writing strategy doc and filing follow-ups.)
- 2026-08-11T23:06:37Z — note: Strategy comparison complete and operator-approved 2026-08-11: option (b) minimal zero-dep in-house rebuild of the core review loop (serve artifact on loopback + annotation UI + long-poll API), shipped as a payload shared skill. Fork (a) rejected: Node 22+/pnpm/esbuild/8-dep fast-moving upstream incompatible with the mold; wrapper (c) rejected: runtime playbook channel and network install fail the control requirement. Accepted trade-off: no whiteboard, no layout audit. Written deliverable: docs/research/visual-artifact-review-strategy-2026-08-11.md. Follow-ups filed: task-6246861934000001 (ADR), task-6246861934000002 (build tool+skill), task-6246861934000003 (validation/release wiring).
- 2026-08-11T23:06:44Z — moved to review (note: Deliverable is the strategy doc (docs/research/visual-artifact-review-strategy-2026-08-11.md); operator approved the recommendation in-session.)
- 2026-08-11T23:06:56Z — moved to done (note: Planning task: deliverable was a written comparison plus an operator decision, not code. Operator approval of option (b) is the review; no agent-behavior change ships from this task itself (that lands in the follow-up tasks, which will go through the normal cold-review ladder).)
