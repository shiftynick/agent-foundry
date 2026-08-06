---
id: task-024
title: Default the Cursor provider model to cursor-grok-4.5-high
status: backlog
priority: p2
tags: [area:agent-headless]
blockedBy: []
createdAt: "2026-08-06T15:34:04Z"
updatedAt: "2026-08-06T15:34:04Z"
---

<!-- task-tracker:description -->
## Description

Operator decision 2026-08-06: Cursor with Grok is to become a coding workhorse, and it should not require naming the model on every call.

Today --model is mandatory for Cursor (cli.js help: 'Provider model or alias (required for Cursor)') and the provider rejects auto. Make it optional, defaulting to cursor-grok-4.5-high.

Environment facts verified 2026-08-06 against cursor-agent 2026.08.04-aaa8809: cursor-grok-4.5-medium, the model used 62 times in the 2026-08-05 session cohort under cursor-agent 2026.07.23-e383d2b, is GONE from the model list. Current grok IDs are cursor-grok-4.5-high and cursor-grok-4.5-high-fast. The default must therefore be cursor-grok-4.5-high, and the implementation must fail loudly with the live model list if that ID is ever absent rather than silently falling back to auto or another family.

REQUIRED POLICY SPLIT - this is the subtle part. The default applies to implementation and other delegated WORK. It must NOT apply to cold review. docs/SDLC.md cold-review ladder rung 1 admits an operator-selected neutral router only when the operator explicitly selected its exact model and that model's family differs from the implementer. If a defaulted model can serve as a reviewer, rung 1 silently degrades: the operator never chose the family doing the reviewing. Either keep --model mandatory when the call is a review, or make the runner record that the model was defaulted so a review packet using it cannot claim rung 1.

Files: the agent-headless bundle (index.js and cli.js, including the help text), the agent-headless skill in both harness trees, the cursor-cli alias skill, and the docs/SDLC.md ladder wording if the split needs stating there. Shared-skill edits land in both trees byte-identically. Acceptance: a Cursor run with no --model uses cursor-grok-4.5-high; an explicit --model still wins; a review-shaped call cannot silently inherit the default; tests cover all three.

<!-- task-tracker:log -->
## Log

- 2026-08-06T15:34:04Z — created (status: backlog)
