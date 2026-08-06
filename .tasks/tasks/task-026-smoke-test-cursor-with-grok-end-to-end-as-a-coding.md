---
id: task-026
title: Smoke-test Cursor with Grok end to end as a coding workhorse
status: backlog
priority: p2
tags: [area:agent-headless]
blockedBy: []
createdAt: "2026-08-06T15:34:04Z"
updatedAt: "2026-08-06T15:34:04Z"
---

<!-- task-tracker:description -->
## Description

Turn 'Cursor with Grok works' from opinion into recorded evidence, and give the two preceding changes a regression guard.

A repeatable check that delegates a trivial but real coding task to Cursor with no --model specified, in a scratch repository, and asserts: the run selects cursor-grok-4.5-high; the normalized result reports success rather than the task-018 false failure; the result carries a reachable worktree path; the expected file change actually exists in that worktree; and the caller can produce the diff from the returned data alone.

Must be honest about cost and flakiness: this spends real model time, so it belongs behind an explicit opt-in rather than in the default gate, and it must distinguish 'the provider failed' from 'we could not read what the provider said' - that distinction is the entire point of task-018.

Depends on the model default and the worktree handoff landing first. Also feeds task-023: the per-provider outcome tracking wants a known-good baseline run to validate its detectors against, particularly the status-versus-exitCode disagreement that signals a false failure.

<!-- task-tracker:log -->
## Log

- 2026-08-06T15:34:04Z — created (status: backlog)
