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

- `.agents/skills/`: shared Codex workflows plus the `claude-cli` bridge.
- `.claude/skills/`: matching Claude workflows plus the `codex-in-cc` bridge.
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

Product architecture, stack choices, build commands, deployment rules, and
domain invariants are deliberately not supplied. The first bootstrap task
requires the project agent to discover and write those from live evidence.

## Layout

```text
agent-foundry/
  AGENTS.md
  BOOTSTRAP.md
  CONTRIBUTING.md
  README.md
  starter/                 files installed into a target project
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
3. Keep `claude-cli` only under `.agents` and `codex-in-cc` only under
   `.claude`.
4. Run:

   ```text
   node scripts/validate-foundry.mjs
   node scripts/test-bootstrap.mjs
   ```

5. Use a cold reviewer from the opposite model family for changes to process
   or agent behavior.
