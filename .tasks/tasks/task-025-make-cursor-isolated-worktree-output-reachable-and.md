---
id: task-025
title: Make Cursor isolated-worktree output reachable and reviewable
status: backlog
priority: p1
tags: [area:agent-headless]
blockedBy: [task-018]
createdAt: "2026-08-06T15:34:04Z"
updatedAt: "2026-08-06T15:34:04Z"
---

<!-- task-tracker:description -->
## Description

Operator decision 2026-08-06: keep Cursor's isolation, fix the handoff. Cursor exposes only answer-only, inspect, and edit-isolated - verified against cursor-agent 2026.08.04-aaa8809 - so edit-isolated IS the coding mode and already works. The gap is that a completed run leaves its work stranded in an isolated worktree with nothing pointing at it.

This is the difference between Cursor being usable as a workhorse and not. Today the sequence is: delegate, wait about eight minutes, receive a result that may say failed even on success (task-018), and then independently run git worktree list to discover roughly twenty modified files.

Scope: (1) the normalized result carries the effective worktree path on every outcome including failure - this overlaps task-018 acceptance item 3 and must not be implemented twice, so coordinate or fold them; (2) a documented, tested path from a finished isolated run to a reviewable diff in the caller's repository - at minimum a recorded command that shows the diff, at best an explicit integrate step the caller invokes after review; (3) the skill documents that path at the point of use, so an agent delegating to Cursor knows how the work comes back before it starts.

Explicitly out of scope by operator decision: adding edit-workspace to the Cursor adapter. The isolation is what makes an unsupervised bad run harmless; the evidence says the pain is the handoff, not the sandbox. Revisit only after run 002 reports per-provider success rates.

Acceptance: after a successful edit-isolated run, the caller can reach the diff using only what the runner returned, with no out-of-band git worktree list.

<!-- task-tracker:log -->
## Log

- 2026-08-06T15:34:04Z — created (status: backlog)
