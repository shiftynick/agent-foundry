# ADR 0004: Extend visual-review with one-click choice annotations

- **Status:** accepted
- **Date:** 2026-08-11
- **Task:** task-6246861934000005

## Context and problem statement

ADR-0003 fixed the visual-review annotation UI at two input modes: element
selection and text selection. Both require the operator to select a target,
type a comment, and press Send.

The first real use of the tool exposed the cost of that shape. The agent
presented a development plan whose four questions each offered three options.
Answering them meant clicking an option and typing "this one" four times. The
operator asked for the option itself to be clickable and to send the choice
without typing.

This is a third input mode, so it is outside the scope ADR-0003 fixed. The
operator directed on 2026-08-11 that the extension be recorded as a decision
before implementation rather than absorbed as a refinement.

## Decision drivers

- Presenting choices to an operator and collecting the answer is the tool's
  most valuable use, and it is currently its most tedious.
- ADR-0003's scope boundary exists to stop feature drift toward the upstream
  product this capability deliberately did not adopt. An extension must be
  justified in the same terms, not waved through.
- The security posture is not negotiable: an added input mode must not widen
  the trust surface, and artifact markup stays untrusted data.
- The payload must remain zero-dependency, cross-platform Node.

## Considered options

1. Treat the request as a refinement of element annotation and implement it
   without a record. Cheapest, but it erodes the scope boundary that keeps
   this tool small: the next request would face no recorded limit either.
2. Extend the accepted scope with a third input mode, recorded here, driven
   by an opt-in marker in the artifact's own markup.
3. Decline and let artifact authors emulate choices with ordinary element
   annotation. Preserves scope exactly, but leaves the tool's best use case
   as its worst experience, and the operator has already rejected it in use.
4. Add a general-purpose form-and-widget layer to the annotation sidebar.
   Rejected as the beginning of the peripheral feature growth ADR-0003
   deliberately refused.

## Decision

Adopt option 2. The injected SDK recognises an opt-in marker on elements in
the artifact — an author-supplied data attribute — and a click on a marked
element posts an annotation immediately, with that element's label as the
comment and no typing or Send press. Unmarked artifacts behave exactly as
before; this mode is inert unless the artifact author opts in.

Constraints carried from ADR-0003 without change:

- No new network surface, no persistence, no outbound calls; the annotation
  travels the existing `POST /api/annotations` path with its existing
  content-type and Origin gating and existing length caps.
- Artifact markup remains untrusted data. A marked element contributes a
  label and a selector only. It cannot direct the agent, and the agent treats
  the resulting annotation as operator feedback, exactly as it treats every
  other annotation kind.
- Still no whiteboard, no layout audit, no sharing, no telemetry, no runtime
  playbooks.

## Consequences

### Good

- The tool's strongest use — putting a plan or a set of options in front of
  the operator and collecting decisions — costs one click per answer.
- Opt-in markup means existing artifacts and third-party HTML are unaffected.
- The annotation contract, transport, and security gating are unchanged, so
  the reviewed surface grows by one SDK code path rather than a subsystem.

### Bad

- The scope ADR-0003 fixed is now larger, and a precedent exists for
  extending it again; each future request must still earn its own record.
- Artifact authors must learn a marker convention, which is one more thing
  the skill has to document and keep accurate.
- A click on a marked element sends immediately, so a misclick becomes a real
  annotation the operator cannot retract through the UI. The agent sees a
  correction only if the operator sends another annotation saying so.

## Validation

Payload tests, run against a freshly installed tree by
`scripts/test-bootstrap.mjs`, that a marked element produces exactly one
queued annotation carrying its label without any typed comment, that an
unmarked artifact's behavior is unchanged, that the marker cannot inject a
comment longer than the existing cap, and that the existing content-type and
Origin gating still rejects the same requests. A manual session confirms the
loop end to end in a browser.

## Follow-up

- task-6246861934000005: implement the marker, its tests, and the SKILL.md
  documentation in both harness trees.
- Revisit condition: if a later request needs operator input the marker
  cannot express — free-text fields, multi-select, ordering — do not grow
  the marker. Evaluate whether the artifact should be an application rather
  than a review target, in a new ADR.
