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

- `.agents/skills/` and `.claude/skills/`: matching workflows, including the
  shared `agent-headless` entry point for Claude, Codex, and operator-selected
  Cursor calls.
- `.agent-foundry/agent-headless/`: one bundled Node 20 runner used by both
  harnesses.
- `.agent-foundry/project-status.mjs`: a short operator briefing and stable JSON
  derived from the real board, planning journal, recorded checks, and Git.
- `.agent-foundry/project-overview.mjs`: a one-screen, self-contained visual
  generated from the status JSON; its local HTML output is Git-ignored.
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
- `.agent-foundry/`: install manifest, the skill-sync and drift checks, the
  project-status and operator-overview views, local-evolution guide, and the
  `LOCAL-CHANGES.md` divergence log.

Product architecture, stack choices, build commands, deployment rules, and
domain invariants are deliberately not supplied. The first bootstrap task
requires the project agent to discover and write those from live evidence.

## Versioning and upgrades

`VERSION` is the single source of truth for the release number. The installer
stamps it into each target's `.agent-foundry.json` and
`.agent-foundry/manifest.json`, so every installed project knows exactly which
release it came from.

`CHANGELOG.md` is written for the agent performing an upgrade as much as for
people: each release carries **Upgrade actions** — concrete, imperative steps —
and flags anything **Breaking**. An upgrading agent reads every entry after the
project's recorded version and applies them in order.

The install manifest records a tier and hash for every managed file:

- **`seed`** — installed once, then owned by the project (`AGENTS.md`, the
  standards documents, journals). Upgrades must not overwrite these.
- **`mold`** — owned by the Foundry (skills, `docs/SDLC.md`, the checks).
  Upgrades replace these, and local divergence is surfaced rather than lost.

Installed projects are expected to evolve their own copies; that is documented
in `.agent-foundry/README.md` inside every install, and deliberate divergence
is recorded in `.agent-foundry/LOCAL-CHANGES.md` so an upgrade can preserve it.

To upgrade a project, point an agent at `UPGRADING.md`. In short: commit the
worktree, run `node .agent-foundry/check-foundry-drift.mjs` to learn what the
project has customized, reinstall with `--force` (which backs up everything it
replaces), then reconcile by tier and re-run the checks.

The board under `.tasks/`, real ADRs, and journal entries are project state the
installer never touches. There is no in-place migration tool; the backup
directory is the rollback.

## Layout

```text
agent-foundry/
  AGENTS.md
  BOOTSTRAP.md
  CHANGELOG.md             per-release upgrade actions, read by agents
  CONTRIBUTING.md
  README.md
  UPGRADING.md             agent-facing upgrade procedure
  VERSION                  single source of truth for the release number
  starter/                 files installed into a target project
    .agent-foundry/        install manifest, in-project checks, local-change log
  scripts/
    bootstrap-project.mjs
    foundry-lib.mjs
    test-bootstrap.mjs
    validate-foundry.mjs
```

## Maintaining the foundry

1. Edit the canonical files under `starter/`.
2. Keep the fifteen shared workflow skills semantically synchronized between
   `.agents` and `.claude`; preserve only intentional harness-specific paths.
3. Provider mechanics belong in the shared `agent-headless` skill and bundled
   runner; do not reintroduce tree-exclusive provider aliases.
4. Keep `starter/docs/SDLC.md` the single authority for commit authority, the
   cold-review ladder, and mid-task ADR handling; skills reference it rather
   than restating it.
5. Bump `VERSION` and add a `CHANGELOG.md` entry with concrete
   `Upgrade actions` whenever installed behavior changes. Validation fails if
   the current `VERSION` has no changelog entry.
6. Run:

   ```text
   node scripts/validate-foundry.mjs
   node scripts/test-bootstrap.mjs
   ```

7. Use a cold reviewer from the opposite model family for changes to process
   or agent behavior.
