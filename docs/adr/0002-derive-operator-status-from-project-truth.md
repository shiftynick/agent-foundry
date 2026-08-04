# ADR 0002: Derive operator status from project truth

- **Status:** accepted
- **Date:** 2026-08-04
- **Task:** task-7846468488000002

## Context and problem statement

Foundry's durable task, planning, validation, and Git records are useful to
agents but expensive for an operator to reconstruct repeatedly. A useful
overview must stay brief without becoming another manually maintained source
of truth or inventing project health from incomplete evidence.

## Decision drivers

- Human-facing state must be quick to scan and explain unknowns honestly.
- Generated views must agree with the task tracker's blocker and next-task
  semantics.
- The same factual projection must support a terminal view and later visual
  consumers.
- Fresh bootstraps remain dependency-free on Node 20.
- "Since last look" must be explicit, local, and must not change shared board
  state merely because someone viewed it.

## Considered options

1. Teach operators to read the existing task board, journals, and Git output
   directly.
2. Maintain a separate hand-written project summary or generated prose report.
3. Derive one stable JSON projection from existing project truth, render a
   bounded terminal summary from it, and let later views consume the same JSON.

## Decision

Adopt option 3. `.agent-foundry/project-status.mjs` loads the installed task
tracker's shared library, parses the stable milestone journal contract, reads
recorded validation evidence and Git, and labels missing or failed evidence as
unknown. It emits stable JSON first and an at-most-twelve-line terminal view.

The optional `--mark-seen` flag writes only a Git-ignored local marker. The
marker records the exact Git head and task-version snapshot that produced the
view, so later comparisons do not depend on wall-clock precision. The task
board, planning journal, recorded check log, and Git remain authoritative.

## Consequences

### Good

- Humans can see direction, active work, decisions, blockers, and the latest
  check without reading several process files.
- Terminal and visual views share one factual model rather than drifting.
- The projection can be tested independently of presentation.
- Viewing status is read-only unless the operator explicitly marks it seen.

### Bad

- The projection now depends on a stable milestone-journal shape and the task
  tracker's exported query functions.
- Locally evolved tracker or journal formats may need reconciliation during an
  upgrade.
- Facts not recorded in Foundry's durable sources remain unknown; the view
  cannot infer product health or unrecorded work.
- The ignored marker is local to one checkout and does not synchronize an
  operator's reading state across machines.

## Validation

Exercise the JSON and text surfaces in temporary Git repositories, including
missing and stale plans, task dependencies, soft-deleted tasks, failed checks,
Git failures, marker schema failures, and same-second task changes. Then run
skill synchronization, Foundry validation, and a disposable clean bootstrap.

## Follow-up

- Operator acceptance of the data-first status and visual-overview proposal
  was recorded on 2026-08-04.
- The next milestone task may build a one-screen HTML view only by consuming
  this projection; it must not create a parallel state model.
