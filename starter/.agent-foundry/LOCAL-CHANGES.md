# Local changes to the installed workflow

Deliberate divergence from stock Agent Foundry, newest first. An upgrade reads
this file to know what must survive being overwritten — an unrecorded change is
one a future upgrade will silently revert.

Only `mold` files need an entry (the skills, `docs/SDLC.md`, the ADR template,
the checks under `.agent-foundry/`). `seed` files such as `AGENTS.md` and the
standards documents are owned by this project by definition; editing them is
the normal case and needs no record here.

Run `node .agent-foundry/check-foundry-drift.mjs` to list what has actually
diverged, then make sure every `mold` entry it reports appears below.

## Format

```markdown
## <file path>

- **Changed:** what is different from stock, concretely.
- **Why:** the project-specific reason. "Cleaner" is not a reason.
- **On upgrade:** re-apply / re-evaluate / drop once <condition>.
- **Upstream:** yes (generic — propose to Agent Foundry) | no (project-specific).
```

<!-- Add entries below. Delete this line once the first one exists. -->

_No local changes recorded yet._
