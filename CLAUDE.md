# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Agent Foundry is a **bootstrap kit**, not an application. It installs a
file-based development workflow (task board, agent skills, ADR process, review
discipline) into *other* projects that are developed with both Codex CLI and
Claude Code.

Consequences that shape every change here:

- There is no build step, no package manager, no dependencies. Zero-dep Node.js
  20+ using only built-ins. Everything is run directly with `node`.
- The acceptance test is "install into a disposable clean project and validate
  the result", not a unit-test suite of this repo's own behavior.
- `starter/` content must stay domain-, language-, and framework-neutral. It is
  a mold. Product decisions, stack choices, and task state must never leak into
  it from a source project.

## Commands

```bash
node scripts/validate-foundry.mjs    # structural checks on starter/ (fast)
node scripts/test-bootstrap.mjs      # end-to-end install into a temp dir (~30s)
```

`VERSION` is the single source of truth for the release number and is
substituted into the payload at install time. `validate-foundry.mjs` fails if
`CHANGELOG.md` has no entry for the current `VERSION`, so a version bump and a
changelog entry always land together.

Both must pass before any change is complete. `test-bootstrap.mjs` runs
`validate-foundry.mjs` first, so run them in that order when debugging.

Run a single test file, or one test by name:

```bash
node --test starter/.claude/skills/task-tracker/scripts/_lib.test.mjs
node --test --test-name-pattern "lock held" starter/.claude/skills/task-tracker/scripts/_lib.test.mjs
```

Verify the two harness trees are still mirrored (also runs inside installed
projects, where it takes no argument):

```bash
node starter/.agent-foundry/check-skill-sync.mjs starter
```

## The dual-tree invariant (most common source of breakage)

`starter/.agents/skills/` (Codex) and `starter/.claude/skills/` (Claude Code)
contain **the same fifteen shared skills**: `adr`, `agent-foundry-feedback`,
`agent-headless`, `attack-the-board`, `codebase-audit`, `diagnosing-bugs`,
`efficient-orchestration`, `execute-task`, `grill-me`, `handoff-writer`,
`plan-milestone`, `retrospective`, `task-tracker`, `the-fool`,
`upgrade-agent-foundry`. Editing one copy without the other fails validation.

Treat `.claude/` as canonical and mirror to `.agents/` with this transform:

| In `.claude/` | In `.agents/` |
| --- | --- |
| `.claude/skills/` | `.agents/skills/` |
| `Claude-facing` | `Codex-facing` |

Everything else must be byte-identical. Additionally, a shared skill in one
tree must **never** contain the other tree's path string — `validate-foundry.mjs`
rejects that even if both copies agree.

Each harness ships exactly 15 `SKILL.md` files; the counts and the
shared-skill list are hardcoded in `scripts/validate-foundry.mjs`, so
adding or renaming a skill means updating that file too.

## `starter/` is payload, not this repo's configuration

Files under `starter/` are installed into *target* projects. Do not read them as
instructions for working here, and do not "fix" them to describe this repo.

- This repo's own agent contract is `AGENTS.md` (root).
- `starter/AGENTS.md.template` and `starter/CLAUDE.md.template` are what target
  projects receive.
- `starter/docs/SDLC.md` describes the lifecycle *installed projects* follow.

`starter/docs/SDLC.md` is the single authority for **commit authority**, the
**cold-review ladder**, and **mid-task ADR handling**. Skills reference it rather
than restating those rules — this was a deliberate fix for contradictions
between documents, so resist re-explaining any of them inside a skill.

## How installation works

`scripts/bootstrap-project.mjs` walks all of `starter/`, so **any file added
there is automatically installed** — there is no manifest to update. Two
conventions apply during the copy:

- A `.template` suffix is stripped (`AGENTS.md.template` → `AGENTS.md`), and
  `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, and their `_JSON` variants plus
  `{{INSTALLED_AT_JSON}}` are substituted. These tokens are only permitted in
  `.template` files.
- `.gitignore.append` is special-cased: its lines are merged into the target's
  existing `.gitignore` rather than copied over it.

Any `*.test.mjs` in the payload is executed against the freshly installed tree
as part of installation, so a new script in `starter/` should ship with a test.

Installation also writes `.agent-foundry/manifest.json`, recording every
managed file with a tier (`seed` = project owns it after install, `mold` =
Foundry owns it) and a line-ending-normalized hash. This is what makes upgrades
non-destructive, so a new payload file should be classified: add it to
`SEED_FILES` in `bootstrap-project.mjs` if the project is meant to own it, or
leave it as mold. `bootstrap-project.mjs` deliberately imports its hash
function from the payload's `check-foundry-drift.mjs` so the recorded and
verified hashes cannot diverge.

Collision safety is a core invariant and is heavily tested: existing files are
never overwritten without `--force`, `--force` backs up every overwritten file
under `.agent-foundry-backups/<timestamp>/` first, and directory, symlink, or
ancestor-file collisions are refused even with `--force`.

## Validation rules that reject content in `starter/`

`scripts/validate-foundry.mjs` will fail the build if `starter/` contains:

- absolute host paths (drive letters, `/Users/...`, `/home/...`, `/mnt/...`)
- `{{TOKEN}}` placeholders outside a `.template` file
- strings from the `knownSourceRegressions` regex — leftovers from projects this
  kit was extracted from
- non-UTF-8 bytes, unbalanced Markdown code fences, or a `SKILL.md` without YAML
  frontmatter
- any `.ps1` file (maintained scripts must be cross-platform Node)

## Reviewing changes here

Changes to process or agent behavior require separate cold **SPEC** and
**STANDARDS** review passes, ideally from the opposite model family (this repo
ships `agent-headless` for exactly that). Because the payload *is* the
product, a change to a skill is reviewed like code: trigger accuracy,
instructions, repository references, and a real invocation when scripts are
involved.
