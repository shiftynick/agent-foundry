# Agent upgrade procedure

Use this when asked to move an existing project to a newer Agent Foundry
release. Run it from the **target project**, not from the Foundry.

The hard part of an upgrade is not copying files — it is not destroying the
work the project has done to its own workflow since installation. Installed
skills and documents are meant to evolve locally (see
`.agent-foundry/README.md` in the target). Treat every step below as protecting
that.

## 1. Establish the starting point

**File the upgrade task and log its rubric before touching anything.** An
upgrade is normally triggered by an operator saying "pull in the new Foundry
version", which enters this document directly and bypasses `execute-task`'s
preamble — so the rubric gets reconstructed afterward, and a rubric written
after the work cannot fail the work that produced it. The acceptance criteria
are the same every time, so they are written out here:

```text
node .claude/skills/task-tracker/scripts/task.mjs add "Upgrade Agent Foundry <from> -> <to>" --priority p1 --tag area:process --tag phase:upgrade
node .claude/skills/task-tracker/scripts/task.mjs move task-NNN in_progress
node .claude/skills/task-tracker/scripts/task.mjs note task-NNN "rubric: (1) every upgrade action from every intervening release applied or explicitly justified as a no-op; (2) every seed file restored and re-merged, none left as template; (3) every mold divergence from the step-1 report re-applied, retired, or recorded in LOCAL-CHANGES.md, file by file; (4) each retirement verified against the installed file rather than trusted from the changelog; (5) post-upgrade drift is fully explainable line by line; (6) run-checks passes"
```

Criterion 4 is the one that matters most. Verifying each retirement against
the installed tree — rather than believing the changelog's claim that a defect
was fixed — is what makes a large reduction in divergence trustworthy instead
of optimistic.

Then establish the baseline:

```text
git status --short
node .agent-foundry/check-foundry-drift.mjs
```

- A dirty worktree stops the upgrade. Commit or stash first; the diff is the
  only review surface an upgrade has.
- Record the current version from `.agent-foundry.json` and **keep the drift
  report** — it is the list of everything you must consciously preserve.
- No manifest (projects installed before 0.2.0) means drift is unknown. Say so
  explicitly, and inspect every managed file that the project's history shows
  it has touched.

**Write these into the task log now**, before going further — the version you
came from, the full drift report, and (after step 3) the exact reinstall
command and backup path:

```text
node .agent-foundry/check-foundry-drift.mjs
node .claude/skills/task-tracker/scripts/task.mjs run <id> -- node .agent-foundry/check-foundry-drift.mjs
```

The second form records the baseline as evidence rather than leaving it in
the session, where it evaporates and has to be reconstructed under review.

## 2. Read the changelog forward

Read `<agent-foundry-root>/CHANGELOG.md` from the version *after* the one
recorded in `.agent-foundry.json` through the newest, in order. Collect the
`Upgrade actions` of every intervening release, not just the newest one, and
note any `Breaking` entries.

Report the collected plan to the operator before writing anything.

## 3. Install over the top

```text
node "<agent-foundry-root>/scripts/bootstrap-project.mjs" --target-path "<project-root>" --project-name "<from .agent-foundry.json>" --project-description "<from .agent-foundry.json>" --force
```

`--force` is required and is the point: it backs up every file it replaces
under `.agent-foundry-backups/<timestamp>/` before writing. Capture that path.
Never delete it until the upgrade is accepted.

## 4. Reconcile, tier by tier

The manifest classifies every managed file:

- **`seed`** — the project owns it. The installer has just reset it to a
  template. Restore the project's version, then fold in anything genuinely new
  from the fresh template. Never accept the template wholesale.

  Because step 1 required a clean worktree, Git is the exact and easily
  verified route; the backup directory is the fallback when the file was not
  committed:

  ```text
  git checkout HEAD -- AGENTS.md CONTRIBUTING.md HANDOFF.md docs/ENGINEERING-STANDARDS.md docs/REVIEW-STANDARDS.md docs/adr/README.md docs/out-of-scope/README.md
  git diff HEAD -- <the same paths>    # then re-add anything new from the templates
  ```

  **Not reset, and never to be restored:** `.agent-foundry/LOCAL-CHANGES.md`,
  `PLANNING-JOURNAL.md`, and `BLOCKED-JOURNAL.md`. Since 0.4.0 the installer
  preserves these append-only logs even under `--force` and prints which ones
  it kept. If your project predates 0.4.0, check them first — an older
  installer overwrote them, and the backup directory holds the only copy.
- **`mold`** — the Foundry owns it. The new version is authoritative. For each
  file the step-1 report flagged as locally modified, re-apply the local change
  on top of the new file, or drop it deliberately — and either way record the
  outcome in `.agent-foundry/LOCAL-CHANGES.md`.

Anything not in the manifest — the board under `.tasks/`, real ADRs, journal
entries, out-of-scope records — is project state the installer never touches.

## 5. Apply the collected upgrade actions

Work through the steps gathered in step 2, oldest release first.

## 6. Validate

```text
node .agent-foundry/run-checks.mjs
node .agent-foundry/check-foundry-drift.mjs
```

`run-checks` discovers and runs the skill-sync gate plus **every** test suite
the installed kit owns, including any a new release added. Never enumerate
suite paths here — a hand-maintained list silently falls behind the payload,
and tests that ship but never run are worse than no tests.

Then the project's own quality gate, and a read-through of `AGENTS.md` for
`[CUSTOMIZE]` markers reintroduced by a reset seed file.

The second drift run is the check that matters: every remaining difference
should be one you can name and justify from `LOCAL-CHANGES.md`.

## 7. Close out

Commit the upgrade as its own task-scoped change, referencing the version
moved from and to. Report the backup path and confirm the operator accepts the
result before deleting it.

If an upgrade action cannot be completed, stop and surface it rather than
leaving the project half-migrated — a partially upgraded workflow is worse than
an old one, because neither document set describes what is actually running.
