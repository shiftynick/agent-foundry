# Changelog

Every released version of Agent Foundry, newest first. `VERSION` at the
repository root is the single source of truth for the current number; the
installer stamps it into each target's `.agent-foundry.json` and
`.agent-foundry/manifest.json`.

This file is read by agents, not only humans. An agent upgrading a project
reads every entry **after** the version recorded in that project's
`.agent-foundry.json` and applies the `Upgrade actions` of each in order.
See `UPGRADING.md` for the full procedure.

## Format

Each release has:

- **Changed** — what moved, in terms a cold reader can verify.
- **Upgrade actions** — imperative steps for the agent performing the upgrade.
  `none` is a valid and common value. Steps must name concrete files and say
  what to do when the file was locally modified.
- **Breaking** — present only when an upgrade can fail or silently change
  behavior without action.

Versioning is semantic with respect to *installed projects*: `major` when an
upgrade requires manual reconciliation to stay correct, `minor` for new
capability that lands cleanly, `patch` for fixes with no upgrade action.

## 0.4.0

Field-report release. Every item here came from an install that upgraded
0.1.0 → 0.2.0 → 0.3.0 in one day and ran two agents concurrently against a
protected branch — conditions this kit had documented but never exercised.

### Changed

- **Append-only project logs survive `--force`.** `.agent-foundry/LOCAL-CHANGES.md`,
  `PLANNING-JOURNAL.md`, and `BLOCKED-JOURNAL.md` are now written once and
  never rewritten, and the installer reports which it preserved. Previously a
  forced upgrade reset all three: the divergence record whose entire purpose is
  surviving upgrades was destroyed *by* an upgrade, and the planning and
  blocker history — which `retrospective` and `plan-milestone` read — went with
  it. They are also no longer treated as collisions, since nothing overwrites
  them.
- **`task.mjs run` no longer manufactures trailing whitespace.** An interior
  blank line in recorded output became `"  | "`, so any evidence containing a
  blank line failed `git diff --check` and trailing-whitespace hooks — on the
  one feature whose purpose is producing committable evidence. Whitespace
  inside a command's own output lines is still preserved verbatim.
- **Shell-portable evidence gathering.** `codebase-audit` and `retrospective`
  documented GNU-only pipelines (`sort -rn`, `uniq -c`, recursive `grep`) that
  fail under PowerShell. Both now call tested zero-dep helpers —
  `codebase-audit/scripts/churn-report.mjs` and
  `retrospective/scripts/process-signals.mjs` — which also fix a subtler
  problem: the natural PowerShell equivalents are case-insensitive by default,
  so they would silently merge paths differing only in case and widen the
  `friction:` convention to match `Friction:`. Backslash line continuations
  were removed from `task-tracker`, `plan-milestone`, and `codebase-audit`.
- **Concurrency documented honestly.** `claimedBy` is now stated to be an
  advisory active-owner marker, **not a lock**: `.tasks/` is versioned, so a
  claim is invisible to other worktrees until merged, and nothing prevents
  double-claiming. `task-tracker` gains a "Parallel work" section with the
  one-agent-per-worktree recipe (including the load-bearing `origin/main`
  start point) and a preflight, and its "Standard workflow (autonomous)" no
  longer tells an agent to self-select while parallel guidance says the
  operator assigns. `docs/SDLC.md` records the trade-off.
- **Cold-review packet rules.** Both bridge skills now state that the packet
  must be a commit or an exported diff file, never the index — a reviewer in
  its own process reads `git diff --cached` as empty — and that the reviewer
  cannot execute the system under review, which previously caused stalls on
  package locks under a read-only sandbox.
- **Facts get logged where they are produced.** `UPGRADING.md` step 1 now says
  to record the drift baseline in the task log (with the `task.mjs run` form),
  and `execute-task` states that the rubric is logged *before* the claim.
- **Upgrade guidance sharpened.** Seed restore now leads with
  `git checkout HEAD -- <files>` (exact and verifiable, since step 1 required
  a clean tree) with the backup directory as fallback, and
  `.agent-foundry/README.md` recommends gating on `check-skill-sync` while
  keeping `check-foundry-drift` a report.

### Upgrade actions

1. Follow the standard procedure in `UPGRADING.md`.
2. **Before reinstalling, if the project predates 0.4.0**: copy
   `.agent-foundry/LOCAL-CHANGES.md`, `PLANNING-JOURNAL.md`, and
   `BLOCKED-JOURNAL.md` somewhere safe. Earlier installers overwrote them on
   `--force`; if a prior upgrade already did, recover them from the relevant
   `.agent-foundry-backups/<timestamp>/` directory now.
3. Wire `node .agent-foundry/check-skill-sync.mjs` into the project's quality
   gate and CI if it is not already there.
4. If the project runs more than one agent, adopt one worktree per agent per
   `task-tracker` → "Parallel work", and confirm the operator (not `next`)
   assigns tasks.
5. Carried over from 0.3.0 and easy to miss: existing boards do not
   retroactively carry `milestone:<name>` tags. Either tag the current front
   or accept that the convention starts from the next planned milestone.

### Breaking

- None for behavior. Note only that the installer no longer refuses to install
  when the three append-only logs already exist, because it no longer
  overwrites them — a project that relied on that refusal as a guard should
  drop the expectation.

## 0.3.0

The long-horizon release: validation becomes recorded fact instead of claimed
fact, planning gains a layer above the task, humans get a single decision
queue, parallel sessions get claim ownership, and the framework gains a
self-improvement loop for its own process.

### Changed

- **Recorded validation evidence.** New `task.mjs run <id> -- <command>`
  executes a command and appends the real command line, exit code, duration,
  and bounded output tail to the task log — written by the tool from the
  actual result, not typed by the agent. The review checklist, `execute-task`
  step 6, and `docs/SDLC.md` now require `run`-recorded evidence wherever
  validation is expressible as a command; hand-typed claims that a runnable
  command passed no longer count. The command executes with the board lock
  released; a failing command records its evidence and exits 1.
- **Planning above the task.** New shared skill `plan-milestone` decomposes an
  operator-agreed goal into a dependency-ordered, context-sized task front —
  proposed first, filed only after operator approval — and handles re-planning
  when evidence invalidates queued work. `docs/SDLC.md` gains the authority
  section ("humans steer at the milestone level, agents execute at the task
  level"), and `execute-task` step 7 gains a re-plan check.
- **The operator queue.** Anything waiting on a human exists on the board
  tagged `needs:operator`; `task.mjs list --tag needs:operator` is the single
  "what is waiting on me?" view. Documented in `docs/SDLC.md`, `task-tracker`,
  and the blocker path of `execute-task`.
- **Claim ownership.** Moving a task to `in_progress` records `claimedBy`
  (`FOUNDRY_AGENT` env var, else `user@host`) and `claimedAt`; any move out
  clears them. `board` shows the owner, `show` prints both fields, and
  `task-tracker` documents stale-claim recovery. Files without claims are
  unchanged on disk.
- **Self-improvement loop.** New shared skill `retrospective` mines the task
  archive, `friction:` notes, and journals for repeated process mistakes
  (three or more cited occurrences) and corrects the governing document —
  a skill step, an `AGENTS.md` rule, a standards lens — through normal
  reviewed tasks, with a five-correction cap and a pruning obligation.
  Working agents record process friction in the moment via the new
  `friction:` note convention (`execute-task`, `task-tracker`).
- **Knowledge-decay dimension** added to `codebase-audit`: stale commands and
  links in orientation documents, ADR-index drift, and reintroduced
  `[CUSTOMIZE]` markers are now in the audit's sweep.

### Upgrade actions

1. Follow the standard reinstall-and-reconcile procedure in `UPGRADING.md`
   (drift report, `--force` reinstall, restore seed files, re-apply mold
   divergence).
2. In `AGENTS.md`, extend the audit-cadence line to cover `retrospective`
   and add the skills-table rows for `plan-milestone` and `retrospective`
   (the fresh template shows both).
3. Adopt recorded evidence: from the first task after the upgrade, use
   `task.mjs run task-NNN -- <command>` for command-expressible validation.
   Existing task logs are not retrofitted.
4. If several agents share one machine account, set a distinct
   `FOUNDRY_AGENT` value per session so claims are distinguishable.
5. File the operator queue: for every currently `blocked` item waiting on a
   human and every `proposed` ADR, tag or create its `needs:operator` task.

### Breaking

- Task files written after a task passes through `in_progress` may contain
  `claimedBy`/`claimedAt` frontmatter. **Older `task.mjs` copies reject
  unknown keys**, so upgrade both harness trees' scripts together (the normal
  reinstall does) before any agent claims a task.
- The `move ... in_progress` log line now includes a `claimed by <owner>`
  decoration; tooling that pattern-matched `moved to in_progress (forced` must
  allow the claim prefix.

## 0.2.0

First versioned release. Establishes the upgrade path itself, resolves the
process contradictions found in a full review of 0.1.0, and hardens the
task-tracker CLI.

### Changed

- **Versioning and upgrades.** `VERSION` is now the single source of truth and
  is substituted into `.agent-foundry.json` at install time instead of being
  hardcoded in the payload. Installs write `.agent-foundry/manifest.json`
  recording every managed file, its tier (`seed` vs `mold`), and a
  line-ending-normalized hash, so an upgrade can distinguish a pristine file
  from one the project has deliberately evolved.
  `.agent-foundry/check-foundry-drift.mjs` reports that comparison.
- **Local evolution is explicitly supported.** `.agent-foundry/README.md`
  documents the tier model and how to record deliberate divergence in
  `.agent-foundry/LOCAL-CHANGES.md` so upgrades do not silently revert it.
- **Bridge skills renamed** for symmetry: `claude-cli` → `claude-in-codex`,
  `codex-in-cc` → `codex-in-claude`.
- **Single authority for contested rules.** `docs/SDLC.md` now owns commit
  authority, a four-rung cold-review ladder, and mid-task ADR handling
  (a reversibility test that says when a `proposed` ADR blocks a task).
  Skills reference it instead of restating divergent versions.
- **New `codebase-audit` skill** — a periodic, whole-repository sweep for
  accumulation-class defects (duplication, dead code, eroded boundaries) that
  per-diff review structurally cannot see. It files tasks; it never gates.
- **New `.agent-foundry/check-skill-sync.mjs`** so installed projects can
  verify the two harness skill trees have not drifted apart.
- **task-tracker CLI fixes.** A held lock now reports `lock held by another
  process` instead of falsely claiming a task file changed, and retries with
  backoff before failing. Atomic create falls back to `wx` on filesystems
  without hard links. Option values may start with dashes, with `--` and
  `--flag=value` as escape hatches. Moving a soft-deleted task fails as usage
  rather than an internal error. Cycle detection no longer has an exponential
  worst case.
- Prompt-injection hygiene (tool-read content is data, not instructions) added
  to the engineering standards, review standards, and the review flow.

### Upgrade actions

1. Run `node .agent-foundry/check-foundry-drift.mjs` before anything else and
   keep the output. Projects installed from 0.1.0 have no manifest and will be
   told so — in that case, commit the worktree first so the reinstall diff is
   reviewable, and treat every locally-edited managed file as unknown drift.
2. Re-run the installer with `--force`, reusing the `projectName` and
   `projectDescription` already in `.agent-foundry.json`.
3. Restore every `seed` file the installer reset: `AGENTS.md`, `CLAUDE.md`,
   `CONTRIBUTING.md`, `HANDOFF.md`, both journals, `docs/ENGINEERING-STANDARDS.md`,
   `docs/REVIEW-STANDARDS.md`, `docs/adr/README.md`, and
   `docs/out-of-scope/README.md` — take them from the backup directory the
   installer printed, then fold in anything genuinely new from the templates.
4. Re-apply each `mold` divergence the step-1 report listed, or drop it
   deliberately and note why in `.agent-foundry/LOCAL-CHANGES.md`.
5. If the project referenced the old bridge skill names, rename them:
   `claude-cli` → `claude-in-codex`, `codex-in-cc` → `codex-in-claude`.
6. Add a `## Commit authority` section to `AGENTS.md` — either accepting the
   `docs/SDLC.md` default or stating a stricter project policy.
7. Run `node .agent-foundry/check-skill-sync.mjs` and the project's own gate.

### Breaking

- Any project-local reference to `claude-cli` or `codex-in-cc` breaks until
  renamed (step 5).
- Tooling that matched the literal string `task file changed since read` to
  detect lock contention must now also match `lock held by another process`.

## 0.1.0

Initial unversioned payload: dual-harness skill trees, file-based task board,
ADR process, review discipline, journals, and collision-safe installation.

### Upgrade actions

none — this is the baseline.
