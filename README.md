# Agent Foundry

Agent Foundry is a reusable, local bootstrap kit for projects developed with
both Codex CLI and Claude Code. It installs a durable file-based task board,
paired agent skills, architecture-decision records, review discipline,
engineering standards, journals, and cold-start handoff conventions.

The bundled installer and maintained scripts run on Node.js 20 or newer on
Windows, macOS, and Linux. Git is also required.

The name reflects the intent: this repository contains molds and tooling for
starting projects, not project-specific product decisions.

## Point an agent here

From a new or existing project, tell the agent:

> Read `<agent-foundry-root>/BOOTSTRAP.md` completely, then bootstrap this
> repository with Agent Foundry. Preserve existing files and ask before any
> overwrite.

The agent-facing procedure includes inspection, installation, customization,
validation, and the first board task.

## Direct installation

```text
node "<agent-foundry-root>/scripts/bootstrap-project.mjs" --target-path "<absolute-project-path>" --project-name "My Project" --project-description "One sentence explaining the project." --create-target --initialize-git
```

Replace `<agent-foundry-root>` with the absolute path where this repository is
installed.

The target directory must already exist unless `--create-target` is supplied.
Use `--initialize-git` when it is not already a Git repository.
The script refuses file collisions by default. `--force` is intentionally
required to overwrite existing managed files; before doing so it copies their
exact prior contents under a unique
`.agent-foundry-backups/<timestamp>[-<suffix>]/` directory.
Ancestor-file, directory, symlink, and other non-file collisions are refused
even with `--force`.

## What gets installed

- `.agents/skills/`: shared Codex workflows plus the `claude-in-codex` bridge.
- `.claude/skills/`: matching Claude workflows plus the `codex-in-claude`
  bridge.
- `.tasks/`: Git-backed kanban state.
- `docs/adr/`: ADR process and template.
- `docs/SDLC.md`: task lifecycle and two-axis cold review.
- `docs/ENGINEERING-STANDARDS.md`: generic engineering defaults.
- `docs/REVIEW-STANDARDS.md`: generic seed lenses plus recurring project
  defect patterns.
- `docs/out-of-scope/`: durable rejected/deferred directions and revisit
  conditions.
- `AGENTS.md`: project orientation and agent operating contract.
- `CLAUDE.md`: Claude Code entry point that delegates shared policy to
  `AGENTS.md`.
- `CONTRIBUTING.md`, `HANDOFF.md`, and planning/blocker journals.
- `.agent-foundry.json`: commit-friendly installation provenance and version.
- `.agent-foundry/check-skill-sync.mjs`: in-project check that the two harness
  skill trees have not drifted apart.

Product architecture, stack choices, build commands, deployment rules, and
domain invariants are deliberately not supplied. The first bootstrap task
requires the project agent to discover and write those from live evidence.

## Updating an installed project

`.agent-foundry.json` records the schema and version a project was installed
with. To move a project to a newer Foundry release:

1. Commit or stash the project's worktree first — the update overwrites
   managed files and a clean tree is what makes the result reviewable.
2. Re-run the installer against the same target with `--force`, using the
   project name and description already recorded in `.agent-foundry.json`.
3. Read the backup path the installer prints. Every overwritten managed file
   is preserved verbatim under `.agent-foundry-backups/<timestamp>/`.
4. Diff the result and reapply project-specific customization — `AGENTS.md`,
   `CONTRIBUTING.md`, `HANDOFF.md`, and the two standards documents are
   tailored per project and will have been reset to templates.
5. Run the project's own gate plus
   `node .agent-foundry/check-skill-sync.mjs`, then delete the backup
   directory once the update is accepted.

The board under `.tasks/` is not managed payload and is never overwritten.
There is no in-place migration tool; the backup directory is the rollback.

## Layout

```text
agent-foundry/
  AGENTS.md
  BOOTSTRAP.md
  CONTRIBUTING.md
  README.md
  starter/                 files installed into a target project
    .agent-foundry/        in-project checks (skill-tree sync)
  scripts/
    bootstrap-project.mjs
    foundry-lib.mjs
    test-bootstrap.mjs
    validate-foundry.mjs
```

## Maintaining the foundry

1. Edit the canonical files under `starter/`.
2. Keep the seven shared workflow skills semantically synchronized between
   `.agents` and `.claude`; preserve only intentional harness-specific paths.
3. Keep `claude-in-codex` only under `.agents` and `codex-in-claude` only
   under `.claude`.
4. Keep `starter/docs/SDLC.md` the single authority for commit authority, the
   cold-review ladder, and mid-task ADR handling; skills reference it rather
   than restating it.
5. Run:

   ```text
   node scripts/validate-foundry.mjs
   node scripts/test-bootstrap.mjs
   ```

6. Use a cold reviewer from the opposite model family for changes to process
   or agent behavior.
