# ADR 0003: Build an in-house visual-artifact review capability

- **Status:** accepted
- **Date:** 2026-08-11
- **Task:** task-6246861934000001 (strategy: task-035)

## Context and problem statement

The operator wants a capability in installed projects: an agent renders an
HTML artifact, a human reviews and annotates it in a browser, and the agent
receives the feedback and applies it in a loop. The existing tool in this
space, kunchenguid/lavish-axi (MIT), was evaluated and rejected for direct
adoption (`docs/research/skills-repo-evaluations-2026-08-08.md`): unpinned
`npx -y` execution, default-on telemetry, public-by-default sharing, and a
runtime-fetched playbook instruction channel. The operator directed that the
capability be delivered under Foundry control. A strategy comparison
(`docs/research/visual-artifact-review-strategy-2026-08-11.md`) weighed the
delivery options; the operator approved one on 2026-08-11. This ADR records
that decision and how the new review modality relates to the installed SDLC.

## Decision drivers

- Full Foundry control: no un-reviewed runtime instruction channels, no
  telemetry, no third-party publishing, no network install at use time.
- The starter payload must stay zero-dependency, self-contained Node 20+,
  and cross-platform including Windows.
- The installed review model in `starter/docs/SDLC.md` must not be diluted:
  the cold-review ladder stays the single authority for review independence.
- Sustained maintenance cost must be proportional to the capability's value.

## Considered options

1. Hard fork of lavish-axi in a separate repository: full feature set
   (whiteboard, layout audit) but inherits Node 22+, a pnpm/esbuild
   toolchain, eight runtime dependencies including the author's own SDK, and
   a fast-moving upstream to track or diverge from. Incompatible with the
   payload's zero-dependency mold.
2. Minimal in-house rebuild of the core loop only, zero-dependency, shipped
   as a payload shared skill plus script.
3. Thin wrapper skill over a pinned `npx lavish-axi@<version>` with telemetry
   forced off and sharing forbidden by skill text: lowest effort, but the
   runtime playbook channel and network install remain, so it fails the
   control requirement.

## Decision

Adopt option 2. Build a zero-dependency Node implementation of the core
review loop and ship it in the starter payload as a new shared skill with a
paired script (the `task-tracker` shape). Scope: serve one HTML artifact on
loopback via `node:http`, inject one SDK script tag by string transform,
element and text-selection annotation UI, a prompt queue, a long-poll
endpoint for the agent, and live reload via `fs.watch`; print the review URL
instead of auto-opening a browser. Security requirements: bind 127.0.0.1
only, validate the Host header, make no outbound network calls, confine
asset serving to the artifact directory, and sandbox the artifact iframe
without `allow-same-origin`.

SDLC position: visual artifact review is an **operator feedback loop during
implementation**. It complements the cold-review ladder in
`starter/docs/SDLC.md` and never substitutes for SPEC or STANDARDS review or
any rung of that ladder.

The operator accepted this decision explicitly on 2026-08-11 after the
written comparison was surfaced (task-035 log; plan confirmation in-session).

## Consequences

### Good

- The capability is fully auditable and under Foundry control; installed
  projects gain it offline with no new runtime requirements.
- The payload's zero-dependency, cross-platform invariants hold.
- No new trust surfaces: no telemetry, no hosted sharing, no runtime-fetched
  instructions.

### Bad

- Upstream's Mermaid whiteboard and automated layout audit are lost; if they
  become necessary, the fallback is option 1 as a separate repository.
- The Foundry owns the implementation and its security posture permanently,
  including the annotation server's attack surface.
- A sixteenth shared skill widens the dual-tree mirror and the hardcoded
  lists in `scripts/validate-foundry.mjs`.

## Validation

The implementation task ships payload tests that run against a freshly
installed tree (`scripts/test-bootstrap.mjs`), including checks that the
server binds loopback only, rejects foreign Host headers, refuses path
escapes from the artifact directory, and delivers queued annotations through
the long-poll endpoint. `scripts/validate-foundry.mjs` passes with the
updated skill count.

## Follow-up

- task-6246861934000002: build the tool and the shared skill pair.
- task-6246861934000003: validation and release wiring (skill lists,
  VERSION, CHANGELOG).
- Revisit condition: if operators need the whiteboard or layout-audit
  features, evaluate the separate-repo fork (option 1) in a new ADR.
