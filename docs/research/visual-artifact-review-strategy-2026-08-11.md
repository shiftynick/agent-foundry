# Visual-artifact review capability: strategy comparison (task-035)

Date: 2026-08-11. Status: operator approved option (b) on 2026-08-11.

## Goal

The operator wants this capability under Foundry control: an agent renders an
HTML artifact, a human reviews and annotates it in a browser, and the agent
receives the feedback and applies it in a loop. Incorporating
kunchenguid/lavish-axi as-is was evaluated and rejected
(`docs/research/skills-repo-evaluations-2026-08-08.md`): unpinned `npx -y`
execution, default-on telemetry, public-by-default sharing, and a
runtime-fetched playbook instruction channel.

## Upstream snapshot (2026-08-11)

- lavish-axi v0.1.50, MIT, ~2.7k stars, active with a fast release cadence
  (release-please automation).
- Requires Node >= 22. Eight runtime dependencies, including the author's own
  `axi-sdk-js`, express 5, chokidar, parse5, `open`, cross-spawn, and
  Tailwind/DaisyUI assets. Build uses pnpm and esbuild and bundles an
  Excalidraw whiteboard; `mermaid` is pinned exactly because versions
  >= 11.14.0 break the whiteboard converter.
- The core review loop is small: a local HTTP server serves the artifact,
  injects one SDK script tag, receives annotations through an API, and the
  agent long-polls `/api/poll`. The bulk and the churn are in peripheral
  features: whiteboard, layout audit, hosted sharing, telemetry, playbooks.
- Upstream's own architecture notes document a sound security model that is a
  useful design reference for any option: loopback binding with a Host-header
  allowlist (DNS-rebinding defense), a sandboxed iframe without
  `allow-same-origin`, and asset serving confined to the artifact directory.

## Options compared

### (a) Hard fork of lavish-axi

MIT permits it. Full feature set on day one: whiteboard, layout audit, live
reload, session management. Costs:

- Inherits Node 22+, the pnpm/esbuild toolchain, eight dependencies (one being
  the author's SDK), an exactly-pinned Mermaid, and release automation.
- Cannot live in the starter payload: it violates the zero-dependency,
  self-contained mold. It would need its own repository and release process.
- Upstream moves fast. Tracking it means continuous merge work; diverging
  means the fork decays and we own a large codebase we did not write.

Verdict: highest sustained maintenance cost; the features that justify it
(whiteboard, layout audit) are not the capability the operator asked for.

### (b) Minimal in-house rebuild — APPROVED

A zero-dependency Node implementation of only the core loop:

- `node:http` instead of express; `fs.watch` instead of chokidar;
  string-level script-tag injection instead of parse5; print the URL instead
  of the `open` package.
- Scope: serve one HTML artifact on loopback, an element and text-selection
  annotation UI, a prompt queue, a long-poll endpoint for the agent, and live
  reload.
- Explicitly out of scope: Mermaid whiteboard, layout audit, hosted sharing,
  telemetry, runtime playbooks, browser auto-open.
- Estimated size: roughly 1-2k lines plus tests. Ships as a payload skill
  with a script, the same shape as `task-tracker` shipping `task.mjs`.
- Security requirements borrowed from upstream's design (as requirements, not
  code): bind 127.0.0.1 only, validate the Host header, make no outbound
  network calls, confine asset serving to the artifact directory, sandbox the
  artifact iframe without `allow-same-origin`.

Verdict: recommended and approved. It is the only option compatible with the
payload's zero-dependency invariant, it is fully under Foundry control, and
it is cross-platform (including Windows) by construction.

Accepted trade-off, stated at approval: no whiteboard and no layout audit.
If those become necessary later, option (a) as a separate repository is the
fallback.

### (c) Thin wrapper over pinned upstream

Skill text runs `npx lavish-axi@0.1.50` with `LAVISH_AXI_TELEMETRY=0` and
forbids the share feature. Lowest effort, but:

- The runtime playbook fetch remains an instruction channel outside the
  reviewed skill text (prompt-injection surface).
- Pinning decays; someone must track upstream anyway.
- Every installed project inherits Node 22+ and a network install on first
  use, against the self-contained mold.

Verdict: rejected. Fails the operator's control requirement.

## Cross-cutting decisions

- **Where it lives**: in the starter payload as a new shared skill plus a
  zero-dep script. This makes it the sixteenth shared skill: both harness
  trees must be updated, and the hardcoded skill list and counts in
  `scripts/validate-foundry.mjs` must change, with a VERSION bump and
  CHANGELOG entry.
- **SDLC integration**: a new review modality requires an ADR. Position:
  visual artifact review is an operator feedback loop during implementation.
  It complements the cold-review ladder in `docs/SDLC.md`; it never
  substitutes for SPEC or STANDARDS review.
- **Windows**: zero-dep Node built-ins only; no shelling out to
  platform-specific openers.
- **Security posture**: loopback-only, Host-header validation, zero outbound
  network traffic, artifact-directory confinement.

## Follow-up tasks (filed on approval)

1. ADR: adopt visual artifact review as an operator feedback modality and
   define its relationship to the cold-review ladder.
2. Build the zero-dep review tool and the paired shared skill (both harness
   trees), with tests that run against the installed payload.
3. Wire the new skill into `scripts/validate-foundry.mjs` (list and counts),
   bump VERSION, and add the CHANGELOG entry with upgrade actions.
