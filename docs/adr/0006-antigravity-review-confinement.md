# ADR 0006: Antigravity review uses explicit AGY permission acceptance

- **Status:** accepted
- **Date:** 2026-08-15
- **Task:** task-8561984443000001

## Context and problem statement

Antigravity CLI provides plan mode but not a runner-enforced read-only sandbox
or an isolated worktree. Its command permissions belong to AGY. A Foundry cold
review must make that weaker boundary visible before it runs.

## Decision drivers

- Cold-review authority and writable scope must be explicit.
- Claude and Codex remain the normal cross-family review pair.
- The Foundry must not claim an isolation guarantee the provider does not make.

## Considered options

1. Treat AGY plan mode as equivalent to enforced read-only access. This is not
   accurate because AGY controls command permissions separately.
2. Exclude Antigravity from cold review. This removes a useful operator option.
3. Allow Antigravity only with an exact operator-selected model and explicit
   acceptance of AGY's configured command permissions.

## Decision

Adopt option 3. Antigravity is an operator-selected rung-1 transport only.
`starter/docs/SDLC.md` is the authority for its eligibility and task-log
requirements. This ADR records the security boundary: without the acceptance
that SDLC requires, use a provider with runner-enforced read-only behavior.
Delegation defaults to `inspect`; `edit-workspace` needs separate explicit
access.

## Consequences

### Good

- The real security boundary is visible in routing policy and invocation docs.
- Operators can still use an authenticated AGY catalog when they accept its
  permissions model.

### Bad

- Antigravity is not a drop-in substitute for the default cold-review pair.
- Operators must make and record an additional authorization decision.

## Validation

Payload tests keep Antigravity cold reviews model-explicit, keep delegation
inspect-only by default, and reject unsupported modes. Skill sync and clean
bootstrap verify the same guidance ships to both harnesses.

## Follow-up

Revisit this ADR if AGY adds runner-verifiable read-only isolation or
isolated-worktree support.
