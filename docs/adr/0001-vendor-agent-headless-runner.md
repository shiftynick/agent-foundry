# ADR 0001: Vendor the agent-headless runner once

- **Status:** accepted
- **Date:** 2026-08-03
- **Task:** task-017

## Context and problem statement

Foundry has provider-specific skill surfaces and duplicated wrappers.
The reusable `agent-headless` project supplies one safe Node 20 interface, but
requiring a global or network install would break dependency-free bootstrap.

## Decision drivers

- Fresh installs work offline after acquiring the Foundry source.
- Claude, Codex, Cursor, and Antigravity mechanics have one tested implementation.
- Antigravity review confinement is governed by ADR 0006.
- Both harnesses share behavior without duplicating a generated bundle.
- Provider routing and review policy remain in `starter/docs/SDLC.md`.

## Considered options

1. Require a global install from npm or GitHub.
2. Keep provider-specific wrappers and only add common prose.
3. Vendor the validated Node CLI/library artifacts and reconstructable source
   patches once under `.agent-foundry/`, and have one shared skill invoke them.

## Decision

Adopt option 3. The upstream package remains the source
for implementation and tests; Foundry stores generated artifacts, encoded
source patches from a public base, license, and provenance. The shared skill owns invocation mechanics. Installed SDLC policy
owns model-family selection, permissions, and review acceptance.

## Consequences

### Good

- Installed projects need only Foundry's existing Node 20 runtime.
- Both harnesses execute the same artifact and capability model.
- The payload remains auditable even before the upstream commits are pushed.
- Provider-specific aliases can retire without policy loss.

### Bad

- Foundry releases must deliberately refresh and verify a generated artifact.
- Upstream fixes reach installed projects only through a Foundry upgrade.
- Bundled JavaScript is less readable than its TypeScript source.

## Validation

Run upstream checks and Node 20 package smoke tests; verify artifact hash,
license, version, and capability behavior in a disposable bootstrap; then pass
both Foundry suites and the shared-skill synchronization check.

## Follow-up

- Operator acceptance was recorded on 2026-08-03.
- Compatibility aliases (`claude-in-codex`, `codex-in-claude`, `cursor-cli`)
  were retired in 0.19.0; `agent-headless` is the sole provider entry point.
