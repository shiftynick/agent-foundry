---
id: task-029
title: Rewrite shared skill bodies into ASD-STE100
status: backlog
priority: p2
tags: [area:process, area:tooling]
blockedBy: []
createdAt: "2026-08-08T15:18:51Z"
updatedAt: "2026-08-08T15:18:51Z"
---

<!-- task-tracker:description -->
## Description

Goal: Convert shared skill guidance (SKILL.md and references/*.md in both harness trees) into ASD-STE100 Simplified Technical English without changing behavior.

Out of scope: scripts (*.mjs), tests, CLI help strings that are machine contracts, CHANGELOG history, archived tasks. Operator chat already requires STE via docs/SDLC.md (0.20.0); do not reopen that unless this work finds a contradiction.

Why: Skills are ~28.5k tokens per harness (~17.5k words). Industry STE cuts often land around 20-40% shorter. Real session savings are smaller because agents usually load 1-3 skills; prioritize the largest first.

Do this:
1. Read docs/SDLC.md Operator communication and ASD-STE100 Issue 9 writing rules (controlled vocabulary + grammar rules). Add only Foundry-approved technical names that STE cannot replace (example: task-tracker, agent-headless, claimedBy, mold, seed).
2. Rewrite in size order, both trees in the same change: task-tracker, execute-task, handoff-writer, efficient-orchestration, codebase-audit, diagnosing-bugs, agent-headless, then the rest. Keep .claude/ canonical and mirror to .agents/ with the usual harness-path transform.
3. Preserve meaning: every imperative, gate, ladder rung, safety rule, and file path must survive. STE must not soften must/never rules or collapse distinct concepts into one approved synonym when the distinction matters.
4. Keep skill descriptions (YAML frontmatter) accurate for trigger matching; shorten them in STE only when triggers stay clear.
5. After each skill (or small batch), run node starter/.agent-foundry/check-skill-sync.mjs starter and node scripts/validate-foundry.mjs. Before release, run node scripts/test-bootstrap.mjs.
6. Bump VERSION and write CHANGELOG with Upgrade actions: reconcile locally modified skills by meaning into the STE wording; do not reintroduce verbose pre-STE prose.
7. Cold SPEC/STANDARDS review: SPEC checks no behavior loss; STANDARDS checks dual-tree sync, neutrality, and that operator-chat vs skill-body STE scopes stay distinct.

Done when: all fifteen shared skills' guidance markdown is STE; both trees sync; validate-foundry and test-bootstrap pass; release notes ship.

<!-- task-tracker:log -->
## Log

- 2026-08-08T15:18:51Z — created (status: backlog)
