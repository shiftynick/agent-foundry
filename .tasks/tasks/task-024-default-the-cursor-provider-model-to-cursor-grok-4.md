---
id: task-024
title: Default the Cursor provider model to cursor-grok-4.5-medium
status: done
priority: p2
tags: [area:agent-headless]
blockedBy: []
createdAt: "2026-08-06T15:34:04Z"
updatedAt: "2026-08-06T18:23:04Z"
---

<!-- task-tracker:description -->
## Description

Operator decision 2026-08-06: Cursor with Grok is to become a coding workhorse, and it should not require naming the model on every call. Make --model optional for Cursor, defaulting to cursor-grok-4.5-medium - the model the operator originally asked for.

History, kept honest: this task was first filed requiring cursor-grok-4.5-high, on the strength of a claim that cursor-grok-4.5-medium had disappeared from the model list. That claim was false - it came from reading a listing truncated to its first 20 of 193 entries - and is retracted in the log below. The live list from cursor-agent 2026.08.04-aaa8809 contains all six grok 4.5 variants (low/medium/high and their -fast pairs). The default is medium; with an effort option the runner resolves the matching variant.

REQUIRED POLICY SPLIT: the default applies to delegated implementation WORK only. A review-shaped call must not silently inherit it - docs/SDLC.md rung 1 requires an operator-selected exact model - so the result reports modelDefaulted, derived from caller intent rather than string comparison, and the agent-headless skill tells reviewers to check it.

Acceptance: a Cursor run with no --model uses cursor-grok-4.5-medium; an explicit --model always wins, including a caller explicitly naming the default (modelDefaulted stays false); modelDefaulted true only when the runner chose; a rejected defaulted model surfaces the live model list resolved against the run's own executable and environment; tests cover each of these and fail against the wrong implementations they guard.

<!-- task-tracker:log -->
## Log

- 2026-08-06T15:34:04Z — created (status: backlog)
- 2026-08-06T16:13:43Z — note: FACTUAL CORRECTION 2026-08-06: the earlier note claiming cursor-grok-4.5-medium is gone from the model list is WRONG and is retracted. The live list from cursor-agent 2026.08.04-aaa8809 contains 193 models including cursor-grok-4.5-low, -low-fast, -medium, -medium-fast, -high and -high-fast. The error came from reading a list truncated to its first 20 entries and inferring absence from it. The upstream default is therefore cursor-grok-4.5-medium, which is what the operator originally asked for; the switch to -high was made only on the strength of the mistaken claim. What remains true and still matters for run 002: cursor-agent moved from 2026.07.23-e383d2b to 2026.08.04-aaa8809 during the analysis window, so per-provider tracking must record the exact model string observed rather than assume a stable set - but do not carry forward the specific claim that a model disappeared.
- 2026-08-06T16:51:16Z — moved to ready
- 2026-08-06T16:51:16Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T16:51:56Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-06T16:51:56Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-06T16:56:25Z — edited (title "Default the Cursor provider model to cursor-grok-4.5-high"→"Default the Cursor provider model to cursor-grok-4.5-medium")
- 2026-08-06T16:56:25Z — note: SPEC finding 3 ACCEPTED (medium): the corrective note fixed the evidence but left the authoritative task contract - title, description and acceptance - still demanding cursor-grok-4.5-high, contradicting both the operator's actual instruction and the shipped implementation. Title corrected. The acceptance to check against is: a Cursor run with no --model uses cursor-grok-4.5-medium; an explicit --model still wins; a defaulted model is reported via modelDefaulted so a review-shaped call cannot silently inherit it; tests cover all three. The -high value in the original description text is superseded by this note and by the retraction above.
- 2026-08-06T17:23:46Z — edited (description updated)
- 2026-08-06T17:25:05Z — note: Foundry round-2 SPEC finding 2 ACCEPTED (medium): the description itself still demanded cursor-grok-4.5-high and repeated the retracted disappearance claim, leaving contradictory contracts for a later agent to reconcile. The description is now rewritten honestly - it records the false claim and its retraction as history, states medium as the default, and carries the corrected acceptance including the caller-names-the-default case.
- 2026-08-06T18:23:04Z — note: Closing: default is cursor-grok-4.5-medium per the corrected contract; explicit model always wins including a caller naming the default (modelDefaulted reflects intent, red-proven); rejected defaults surface the live list resolved against the run's own executable and environment; the skill routes the review/work split through docs/SDLC.md rather than restating it.
- 2026-08-06T18:23:04Z — moved to review
- 2026-08-06T18:23:04Z — moved to done
