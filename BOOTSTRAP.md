# Agent bootstrap procedure

Use this procedure when asked to prepare a project with Agent Foundry.

The bundled installer is supported on Windows, macOS, and Linux with Node.js
20 or newer and Git.

## 1. Inspect before writing

From the target project:

1. Resolve the repository root and read existing `README.md`, `AGENTS.md`,
   `CLAUDE.md`, contribution docs, build configuration, and task tooling.
2. Run `git status --short` when the target is a Git repository.
   Install from the repository's current default branch when one exists; the
   installer records that branch for collision-safe task ID allocation.
   `origin/HEAD` is authoritative when configured; with no `origin`, a single
   other remote HEAD is used.
3. Identify existing `.agents`, `.claude`, `.tasks`, `docs/adr`, or similarly
   named process files.
4. Do not overwrite or flatten an existing workflow. If managed paths collide,
   compare intent and ask the operator before using `--force`.
5. Derive the project name and a factual one-sentence description from live
   repository evidence. Do not invent product claims.

## 2. Install

Run from any shell:

```text
node "<agent-foundry-root>/scripts/bootstrap-project.mjs" --target-path "<absolute-repository-root>" --project-name "<project name>" --project-description "<one factual sentence>"
```

Replace `<agent-foundry-root>` with the absolute path of the Agent Foundry
folder you are reading.

Use `--create-target` only when the operator asked to create the project
directory. A new or existing non-Git directory also requires
`--initialize-git`. Never use `--force` without explicit overwrite approval
after showing the exact collisions. A forced update backs up every overwritten
managed file under `.agent-foundry-backups/<timestamp>/`; report that path to
the operator and do not delete it until the update is accepted. If a timestamp
is already present, the installer adds a numeric suffix. Ancestor-file,
directory, symlink, and other non-file collisions cannot be overridden with
`--force`.

The installer:

- copies the generic starter payload;
- substitutes the project name and description;
- merges Foundry's ignore entries without replacing `.gitignore`;
- runs every installed test file and checks installed skill frontmatter and
  Markdown fence balance; and
- creates and claims the first task when the board is empty.

`--skip-validation` and `--skip-bootstrap-task` exist for focused diagnostics
and tests. Do not use either in a normal installation or claim the skipped
behavior succeeded.

It also writes two pieces of generated provenance — do not hand-edit either:

- `.agent-foundry.json`: Foundry schema/version, project identity, install
  time.
- `.agent-foundry/manifest.json`: every managed file with its tier (`seed` =
  the project owns it from now on, `mold` = the Foundry owns it) and a content
  hash. This is what lets a later upgrade tell deliberate local evolution from
  an untouched file.

Upgrading an existing installation is a different procedure — see
`UPGRADING.md`, not this document.

If the target already has active board tasks, the installer deliberately does
not choose or mutate one. Create and claim the tailoring task yourself:

```text
node .agents/skills/task-tracker/scripts/task.mjs add "Tailor Agent Foundry bootstrap to this project" --priority p0 --tag area:process --tag phase:bootstrap --description "Reconcile the installed workflow with live project evidence, preserve existing process intent, and validate both harnesses."
node .agents/skills/task-tracker/scripts/task.mjs move task-NNN in_progress
```

## 3. Tailor the installed contract

Complete the generated or manually added bootstrap task. At minimum:

1. Replace every `[CUSTOMIZE]` marker in `AGENTS.md`, `CONTRIBUTING.md`,
   `HANDOFF.md`, `docs/ENGINEERING-STANDARDS.md`, and
   `docs/REVIEW-STANDARDS.md` using repository evidence.
2. Record real sources of truth and their precedence.
3. Write only genuine product invariants. Delete placeholder sections that do
   not apply.
4. Replace generic validation examples with the project's executable commands.
5. Keep generic engineering rules that fit; remove or supersede rules that
   conflict with the actual stack.
6. Add initial dependency-ordered tasks sized to one fresh agent context each.
7. Create proposed ADRs for architecture decisions still awaiting operator
   agreement. Do not mark them accepted without explicit approval.

Do not copy architecture, stack, domain rules, task backlog, or handoff state
from Agent Foundry or another project.

## 4. Validate

Run:

```text
node .agents/skills/task-tracker/scripts/task.mjs board
node --test .agent-foundry/agent-headless/cli.test.mjs .agents/skills/claude-in-codex/scripts/claude-ask.test.mjs .agents/skills/cursor-cli/scripts/cursor-agent.test.mjs .agents/skills/task-tracker/scripts/task.test.mjs .agents/skills/task-tracker/scripts/_lib.test.mjs .agents/skills/task-tracker/scripts/board-html.test.mjs
node --test .claude/skills/cursor-cli/scripts/cursor-agent.test.mjs .claude/skills/task-tracker/scripts/task.test.mjs .claude/skills/task-tracker/scripts/_lib.test.mjs .claude/skills/task-tracker/scripts/board-html.test.mjs
node --test .agent-foundry/check-skill-sync.test.mjs .agent-foundry/check-foundry-drift.test.mjs
node .agent-foundry/check-skill-sync.mjs
node .agent-foundry/agent-headless/cli.js --version
node .agent-foundry/check-foundry-drift.mjs
```

Then verify:

- every referenced command and relative link exists;
- no `[CUSTOMIZE]` marker remains in a document treated as authoritative;
- the shared skill trees differ only where the harness path or counterpart CLI
  intentionally differs (the sync check above proves this);
- `AGENTS.md` states a commit-authority policy, or explicitly accepts the
  `docs/SDLC.md` default;
- `AGENTS.md` records a `codebase-audit` cadence;
- a fresh install reports no drift;
- `agent-headless capabilities <provider>` accurately reports each configured
  CLI as available, missing, or unusable;
- the board reflects the real implementation front; and
- no unrelated pre-existing file was modified.

Move that bootstrap task to `review`, run separate cold SPEC and STANDARDS
passes, adjudicate findings against the live repository, and commit only the
bootstrap task's files if the operator authorized a commit.
