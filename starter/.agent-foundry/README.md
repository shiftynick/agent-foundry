# Agent Foundry in this project

This directory holds the installed Foundry's own metadata and checks. It is not
product code and it is not the task board.

| File | Purpose |
| --- | --- |
| `manifest.json` | What was installed, at which version, with a hash and tier per managed file. Generated — do not hand-edit. |
| `check-skill-sync.mjs` | Verifies the two harness skill trees still agree. |
| `check-foundry-drift.mjs` | Reports how installed files differ from what was installed. |
| `LOCAL-CHANGES.md` | Your record of deliberate divergence from the stock workflow. |

## The installed workflow is yours to evolve

Agent Foundry ships a starting point, not a frozen standard. Tailoring it to
this project is expected: sharpen a skill's trigger, add a checklist item that
catches a defect this codebase actually produces, encode a real command in a
validation step, delete a section that does not apply here.

The one thing local evolution must not do is drift silently. A future upgrade
replaces Foundry-owned files, and anything undocumented is lost with no
argument. So:

1. **Make the change in both harness trees** when it touches a shared skill,
   and verify with `node .agent-foundry/check-skill-sync.mjs`.
2. **Record it in `LOCAL-CHANGES.md`** — what changed, why, and whether it
   should be upstreamed. One entry per divergence.
3. **Upstream what is generic.** A change that would help any project belongs
   in the Foundry itself, not in ten copies of it.

## Tiers

`manifest.json` classifies every managed file:

- **`seed`** — installed once; this project owns it from then on. `AGENTS.md`,
  `CONTRIBUTING.md`, `HANDOFF.md`, the journals, and the two standards
  documents. Editing these is the normal case and needs no `LOCAL-CHANGES.md`
  entry. An upgrade must not overwrite them.
- **`mold`** — the Foundry owns it: the skills, `docs/SDLC.md`, the ADR
  template, these checks. Upgrades replace them, so divergence here is what
  `LOCAL-CHANGES.md` exists to protect.

Everything else — `.tasks/`, real ADRs, journal entries, out-of-scope records —
is project state the installer never reads or writes.

## Routine checks

```bash
node .agent-foundry/check-skill-sync.mjs      # harness trees agree
node .agent-foundry/check-foundry-drift.mjs   # what we have changed
```

Neither is a gate. `check-skill-sync` fails on real drift between the trees
because that is always a mistake; `check-foundry-drift` only reports, because
divergence from stock is a legitimate choice this project is allowed to make.

Upgrade procedure: `UPGRADING.md` in the Agent Foundry repository.
