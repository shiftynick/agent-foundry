---
id: task-026
title: Smoke-test Cursor with Grok end to end as a coding workhorse
status: backlog
priority: p2
tags: [area:agent-headless]
blockedBy: []
createdAt: "2026-08-06T15:34:04Z"
updatedAt: "2026-08-06T17:43:03Z"
---

<!-- task-tracker:description -->
## Description

Turn 'Cursor with Grok works' from opinion into recorded evidence, and give the two preceding changes a regression guard.

A repeatable check that delegates a trivial but real coding task to Cursor with no --model specified, in a scratch repository, and asserts: the run selects cursor-grok-4.5-medium (the documented default; this description originally said -high before the false disappeared-model claim was retracted - see task-024's history); the normalized result reports success rather than the task-018 false failure; the result carries a reachable worktree path; the expected file change actually exists in that worktree; and the caller can produce the diff from the returned data alone.

Must be honest about cost and flakiness: this spends real model time, so it belongs behind an explicit opt-in rather than in the default gate, and it must distinguish 'the provider failed' from 'we could not read what the provider said' - that distinction is the entire point of task-018.

Depends on the model default and the worktree handoff landing first. Also feeds task-023: the per-provider outcome tracking wants a known-good baseline run to validate its detectors against, particularly the status-versus-exitCode disagreement that signals a false failure.

<!-- task-tracker:log -->
## Log

- 2026-08-06T15:34:04Z — created (status: backlog)
- 2026-08-06T17:20:22Z — note: Rubric (logged before claiming): (1) the run is invoked through the vendored runner with NO --model, in a scratch repository outside both real repos, with edit-isolated access; (2) the result reports status succeeded, modelDefaulted true with cursor-grok-4.5-medium as the effective model, and a workspace whose worktree path exists on disk; (3) the expected file change exists inside that worktree, and the diff is produced using only data from the result (no git worktree list); (4) the full normalized result is archived as task evidence, including exact model string, duration, and any warnings - a false-failure signature (status disagreeing with exitCode 0) is itself a reportable outcome, not a retry; (5) the scratch repo and worktree are cleaned up afterward, and the run's cost (one real model invocation) was operator-authorized 2026-08-06.
- 2026-08-06T17:43:03Z — edited (description updated)
- 2026-08-06T17:43:03Z — note: Foundry round-3 SPEC finding ACCEPTED (medium): the description still demanded cursor-grok-4.5-high - the same contract-drift class caught on task-024 one round earlier, in the task filed to guard against exactly this kind of unverified claim. Description now names -medium and records the history inline.
