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

## 0.26.0

### Changed

- Installer default-branch resolution
  (`scripts/bootstrap-project.mjs` → `resolveDefaultBranch`): when the
  target repository has no remote HEAD, the installer no longer records the
  active branch blindly. It now prefers, in order, a local branch named by
  `git config init.defaultBranch`, an existing local `main`, an existing
  local `master`, and only then the current HEAD. Fixes an installed
  project's report of a task branch being recorded as `defaultBranch` when
  bootstrapping mid-task in a remoteless repository. Covered by a bootstrap
  test fixture on a task branch.
- `execute-task` → Validate (both harness trees): recorded commands that
  need quoting or shell metacharacters are written to a script file and the
  script's run is recorded, instead of an inline one-liner — inline
  metacharacters failed or truncated records seven times across three
  installed repos in one audited day, once costing a full extra review
  round.
- `execute-task` `references/cold-review.md` (both trees): each review-axis
  dispatch is recorded through `task.mjs run` keeping the runner's JSON
  result, so provider and model metadata stay durable; unrecorded
  invocations lost review provenance and forced repair work in one
  installed repo.

### Upgrade actions

- Replace both trees' `execute-task/SKILL.md` and
  `execute-task/references/cold-review.md` with the 0.26.0 copies. If a copy
  was locally modified, merge the two additions (script-file rule in
  Validate; recorded-dispatch rule in the prompt-template section) and
  record the divergence in `LOCAL-CHANGES.md`.
- No action for the installer change: it affects future installs and
  upgrades. A project whose `.agent-foundry.json` `defaultBranch` already
  records a task branch should correct that field manually to the real
  default branch.

## 0.25.0

### Changed

- Review-packet discipline in `execute-task` `references/cold-review.md`
  (both harness trees), from the adversarial-review findings audit
  (`docs/research/review-findings-audit-001.md`): the packet is rebuilt
  fresh each round — diff and in-scope file list regenerated from the
  current tree, never reused from a prior round; it includes the recorded
  gate evidence for each rubric claim and every recorded decision the change
  relies on (accepted ADRs, rubric amendments, operator rulings); and it is
  exported as UTF-8. Findings that contradict a decision recorded in the
  packet are answered by citation, not re-litigated.
- Fix-applied verification between review rounds (`cold-review.md`, both
  trees): before dispatching the next round, each previous-round fix is
  diff-verified against the working tree; a fix the log claims but the tree
  lacks is itself a high-severity finding, and review-round fixes get the
  same failing-test check as the original change.
- The red-capable-oracle requirement in `execute-task` (both trees) is now
  demonstrated, not asserted: a change that adds a gate, probe, or check
  records one run where it rejects a seeded defect; a check that cannot be
  made to fail is declared unsound in the review packet instead of being
  hardened for another round.
- Evidence follows the edit (`execute-task` → Validate, both trees): after
  the last edit of any round, gates are re-recorded on the final tree before
  review is requested or re-entered; earlier evidence does not count.

### Upgrade actions

- Replace `.claude/skills/execute-task/SKILL.md`,
  `.agents/skills/execute-task/SKILL.md`, and both trees'
  `execute-task/references/cold-review.md` with the 0.25.0 copies. If a copy
  was locally modified, merge the four guidance additions (packet-per-round,
  fix-applied verification, demonstrated oracle, evidence-follows-the-edit)
  into the local version and record the divergence in `LOCAL-CHANGES.md`.

## 0.24.0

### Changed

- `plan-milestone` (both harness trees) gains three planning lenses adapted
  from the "Software Factory" 4-gate workflow: a 3-6 sentence user
  announcement for user-facing milestones (step 1 and the proposal
  template), a tracer-bullet-first decomposition rule that bans by-layer
  task fronts (step 3), and a "Least confident decisions" line in the
  step-4 proposal template so silent low-confidence calls reach the
  operator before code exists.
- `execute-task` (both harness trees): when a task creates a new interface,
  public signature set, or module boundary, the agent outlines types and
  signatures without bodies and logs the outline plus least-confident
  choices as a task note before implementing.
- `docs/SDLC.md` gains an "External facts" section: facts outside the
  repository that agents need to know exist (env var names, dashboards,
  test accounts, webhooks) are recorded in `docs/external/` as discovered.
- Shift-left review guidance in `execute-task` (both harness trees): each
  rubric line must be checkable by a cold reviewer without interpretation;
  the implementer reads `docs/REVIEW-STANDARDS.md` and applicable
  `docs/ENGINEERING-STANDARDS.md` sections before writing code; and a warm
  self-pass over the frozen diff (rubric, then standards lenses) runs before
  the task enters review.
- Re-review is now severity-gated. `docs/SDLC.md` → "Review" is the
  authority: only confirmed `high`/`medium` findings trigger a fresh full
  two-axis round; confirmed `low`-severity fixes get a single scoped delta
  check or become follow-up tasks; `low`-severity `low`-confidence findings
  never block or trigger a round. Findings that cite no rubric line, written
  standard, or invariant are discarded at adjudication without a response.
  `execute-task` `references/cold-review.md` (both trees) mirrors the rule.

### Upgrade actions

1. Apply the normal forced upgrade so both skill trees and `docs/SDLC.md`
   land. If `plan-milestone`, `execute-task`, or `docs/SDLC.md` was locally
   modified, merge these additions by meaning; none of them changes an
   existing gate, path, or CLI contract.
2. `docs/external/` is created lazily on first use; no directory needs to be
   added during the upgrade.
3. If the project's `docs/SDLC.md` review section was locally modified,
   merge the severity-gated re-review rule by meaning; the three-round cap
   and the two-axis structure are unchanged. Tasks already mid-review keep
   the rule under which their current round started.

### Breaking

None.

## 0.23.0

### Changed

- Shared skill guidance (`SKILL.md` and skill `references/*.md` in both
  harness trees) is rewritten in ASD-STE100 Simplified Technical English.
  Behavior, gates, ladder rungs, safety rules, paths, and CLI contracts are
  unchanged. Frontmatter trigger text stays accurate.
- `docs/SDLC.md` → Operator communication now states that shared skill
  guidance uses STE. Operator chat remains STE. Task logs, ADRs, and
  CHANGELOG stay in normal technical English.

### Upgrade actions

1. Apply the normal forced upgrade so mold skills and `docs/SDLC.md` land.
2. When reconciling locally modified shared skills, merge by meaning into the
   STE wording. Do not reintroduce verbose pre-STE prose.
3. Keep operator-chat STE scope distinct from skill-body STE: chat is still
   governed by `docs/SDLC.md`; skill bodies are the installed guidance text.

### Breaking

None. Installed behavior of scripts and CLI contracts is unchanged.

## 0.22.1

### Changed

- `task-tracker` escape-sanitization fixture no longer embeds a dense mix of
  CSI/OSC/C1 escape generators in the `task.mjs run` CreateProcess command
  line. On some Windows hosts that pattern made `spawnSync` fail with
  `cmd.exe`/`node` `EPERM` before the child could write, breaking
  `test-bootstrap`. The test now writes the payload to a temp `.mjs` under the
  fixture repo and runs `node` against that absolute path, so coverage of
  non-SGR scrubbing is unchanged while the spawn command line stays clean.

### Upgrade actions

1. Apply the normal forced upgrade so the mold `task-tracker` test lands.
2. No reconciliation step: this is a test-only fixture change.

### Breaking

None.

## 0.22.0

### Changed

- `.agent-foundry/LOCAL-CHANGES.md` gives every `Upstream: yes` entry a
  lightweight delivery state: **Upstream status**
  (`unsent` | `packeted` | `filed` | `landed` | `dropped`) and **Upstream
  ref** (packet path, issue URL, PR, or foundry commit/task). No second
  coordination system — status lives on the entry.
- `agent-foundry-feedback` updates those fields when a packet is written
  (`packeted`) and when it is published (`filed`), and prefers unsent entries
  when gathering.
- `retrospective` surfaces unsent/packeted upstream entries and routes unsent
  ones through `agent-foundry-feedback`.
- `upgrade-agent-foundry` reports the same list before acquiring a new foundry
  so mold overwrites do not strand unsent generic fixes.
- `docs/SDLC.md` and `.agent-foundry/README.md` point at this path.

### Upgrade actions

1. Apply the normal forced upgrade for mold skills and docs.
2. When reconciling project-owned `LOCAL-CHANGES.md`, add **Upstream status**
   and **Upstream ref** to every existing `Upstream: yes` entry. Default
   status to `unsent` unless a feedback packet or filed issue already exists
   (then `packeted`/`filed` with that ref). Keep `Upstream: no` entries
   unchanged.
3. No new tracker or board column is required.

### Breaking

None. Until seed reconciliation adds the fields, skills treat a missing
**Upstream status** on an `Upstream: yes` entry as `unsent`.

## 0.21.0

### Changed

- `docs/SDLC.md` gains **Deploy-dependent acceptance**: when a task needs an
  authorized post-merge deploy as acceptance proof, tag
  `needs:deploy-acceptance`, deliver the branch under existing commit
  authority, then wait in `blocked` (or on a split acceptance card) until
  deploy evidence is recorded. Ordinary definition of done now requires that
  evidence for tagged cards. Split implementation vs acceptance cards when
  other work depends only on the code landing.
- `execute-task` points at that section before moving a card to `done`.
- `task-tracker` CLI reference lists the `needs:deploy-acceptance` tag.

### Upgrade actions

1. Apply the normal forced upgrade so mold `docs/SDLC.md`, `execute-task`, and
   `task-tracker` references land.
2. When reconciling a locally modified `docs/SDLC.md`, keep or merge the
   Deploy-dependent acceptance section by meaning. Do not recreate a second
   done-definition elsewhere.
3. Existing open cards that already wait on deploy should gain the
   `needs:deploy-acceptance` tag and move to `blocked` (or a split acceptance
   card) rather than sitting in `review`/`in_progress`.

### Breaking

None for installer mechanics. Projects that treated "merged" as "done" for
deploy-gated work must adopt the blocked-or-split path above.

## 0.20.0

### Changed

- `docs/SDLC.md` → "Operator communication" now requires **ASD-STE100
  Simplified Technical English (STE)** for operator chat: questions, updates,
  explanations, review results, validation results, and closeouts. Durable
  records (task logs, ADRs, skill bodies, CHANGELOG) stay in normal technical
  English unless a later task changes that rule. The section keeps the existing
  outcome-first, evidence-separation, and one-question contracts.
- Installed and foundry `AGENTS.md` pointers name STE while still deferring to
  SDLC as the single authority (pointer only; no duplicated conversation rules).
- `grill-me` and `execute-task` operator-facing wording cite SDLC/STE instead
  of a second "plain language" standard. Skill bodies are not rewritten in STE
  in this release.

### Upgrade actions

1. Apply the normal forced upgrade so mold `docs/SDLC.md` and the shared
   `grill-me` / `execute-task` skills land.
2. When reconciling project-owned `AGENTS.md`, keep or add the stock Operator
   communication pointer that names ASD-STE100 and points at
   `docs/SDLC.md` → "Operator communication". Preserve any stricter local
   audience rules.
3. No action required for skill-body STE conversion; that work is not in this
   release.

### Breaking

None for installed mechanics. Operator-facing chat style is stricter
(ASD-STE100). Projects that customized the Operator communication section
must merge the STE requirement by meaning when reconciling `docs/SDLC.md`.

## 0.19.0

### Changed

- Retired the post-0.15.x provider compatibility aliases. `claude-in-codex`,
  `codex-in-claude`, and `cursor-cli` (both harness trees) no longer ship.
  Shared `agent-headless` plus `.agent-foundry/agent-headless/cli.js` is the
  only provider entry point for Claude, Codex, and operator-selected Cursor.
- Each harness now installs exactly fifteen shared skills. Validation rejects
  the retired alias directories if they reappear in the mold.
- Skill catalogs, bootstrap smoke commands, and foundry maintenance docs drop
  the 16+1 bridge invariant and point counterpart-CLI orchestration at
  `agent-headless`.

### Upgrade actions

1. Apply the normal forced upgrade and keep its backup directory.
2. Map any remaining callers of the old wrappers to
   `node .agent-foundry/agent-headless/cli.js run`:
   - `claude-ask --prompt/--context-file` → `--provider claude
     --access answer-only --prompt-file`
   - `cursor-agent --model/--mode/--allow-write` → `--provider cursor`
     plus `--access answer-only|inspect|edit-isolated` and an explicit
     `--model` when the call is cold review
   - raw `codex exec` policy stays in `docs/SDLC.md`; invoke Codex through
     `agent-headless --provider codex` for Foundry-mediated runs
3. Delete the retired directories from the project (the installer does not
   remove stale mold paths):
   - `.agents/skills/claude-in-codex/`
   - `.agents/skills/cursor-cli/`
   - `.claude/skills/codex-in-claude/`
   - `.claude/skills/cursor-cli/`
   If any of those were locally customized, copy the customization into
   `docs/SDLC.md` or the shared `agent-headless` skill first, or record the
   divergence in `.agent-foundry/LOCAL-CHANGES.md` before deleting.
4. When reconciling seed files (`AGENTS.md`, skill-tree `README.md` files),
   drop rows and prose for the retired aliases; keep harness-specific paths
   on the fifteen shared skills.
5. Run `node .agent-foundry/check-skill-sync.mjs`,
   `node .agent-foundry/run-checks.mjs`, and the project quality gate. Expect
   `skill-sync: PASS (15 shared skills)`.

### Breaking

- The skill names `claude-in-codex`, `codex-in-claude`, and `cursor-cli` are
  gone from fresh installs and from the mold. Old wrapper scripts
  (`scripts/claude-ask.mjs`, `scripts/cursor-agent.mjs`) no longer ship;
  callers must use `agent-headless`. Existing projects keep the directories
  until step 3 of the upgrade actions deletes them.

## 0.18.0

### Changed

- Bundled `agent-headless` moves to `0.3.0`. It no longer reports a successful
  delegated run as failed. Previously a single non-JSON line anywhere in a
  provider's output discarded the entire stream, so a Cursor run that exited 0
  and wrote roughly twenty files into an isolated worktree came back as
  `failed` with no events and nothing pointing at the worktree — the finished
  work was reachable only by running `git worktree list` out of band. Now
  unparseable lines are skipped as bounded warnings, a stream-level error is
  reported only when nothing parsed, and the run fails only when the provider
  itself failed.
- A new `unparsed` status separates "we could not read the output" from "the
  provider failed", used only when the process exited 0. The last terminal
  marker in the stream decides the verdict, so a success followed by an error
  is a failure and an error followed by a later success is not.
- Every result now carries a `workspace` descriptor — `cwd`, `access`, and the
  worktree — on all outcomes including timeout, cancellation, and non-zero
  exit. Cursor is never invoked with a bare `--worktree`: the runner names the
  worktree itself, so a finished isolated run is reachable from the result
  alone even when its output could not be read.
- Cursor no longer requires `--model`. It falls back to a documented default
  and reports `modelDefaulted`, derived from what the caller asked for rather
  than from a string comparison.
- `agent-headless` documents how to read a result: what each status means, that
  branching on `failed` alone silently misses `unparsed`, and that a
  non-empty `warnings` is no longer a failure signal. The skill previously
  documented no statuses at all, which is why nothing in the mold ever noticed
  the false failures.
- The same skill records the model split: delegated implementation may take the
  default, cold review must name a model, because a defaulted model was chosen
  by the runner rather than the operator and so does not satisfy the top rung
  of the ladder in `docs/SDLC.md`. Check `modelDefaulted` rather than assuming.

### Upgrade actions

1. Review any project-local automation that branches on an `agent-headless`
   result. A caller testing `status === "failed"` to detect trouble will now
   miss `unparsed` runs; treat anything other than `succeeded` as needing
   attention, and prefer the CLI's exit code, which is non-zero for both.
2. Review anything that parses or stores Cursor worktree paths. Isolated runs
   now land in a runner-named worktree (`agent-headless-…`) rather than one
   Cursor chose, and the effective name is reported in `workspace`.
3. Anything asserting that a healthy run has no warnings needs updating:
   skipped-line notes now appear on successful runs.
4. Cursor calls for delegated work may drop `--model`. Keep it on cold-review
   calls; the reviewing model must be operator-chosen.
5. No action for the bundle itself — `.agent-foundry/agent-headless/` is
   Foundry-owned and the normal upgrade replaces it along with its provenance.

### Breaking

Yes, for projects with local automation built on the runner's result shape.
Three observable contracts changed: the status set gained `unparsed`, so
`failed` is no longer the whole failure surface; the CLI exit code for an
unreadable-but-clean run is distinct from an ordinary failure; and isolated
Cursor runs report a runner-named worktree path instead of a provider-named
one. Projects that only invoke the runner through the `agent-headless` skill
and read its normalized output need no changes. The version step is `minor`
because nothing in the mold itself consumes these contracts — the reconciliation
above applies only to project-local code.

## 0.17.0

### Changed

Four corrections from the first cross-project session audit, which analyzed a
day of real agent transcripts across three installed projects. The first
correction spans two documents, so five edits follow. Each names the
failure it prevents at the point in the document where the failure happens,
rather than adding a rule somewhere a reader would have to go looking for it.

- `docs/SDLC.md` "Lifecycle" now states what happens when a task already in
  `review` receives new implementation work: it returns to `in_progress` and
  takes a fresh pass, because the pass that already ran reviewed a different
  change. Observed failure: a task parked in `review` for an unrelated
  proposal absorbed a 23-file change and exited to `done` with the code never
  reviewed. This does not duplicate "Definition of done", which requires the
  rung to be *recorded*; the new rule requires the recorded rung to belong to
  the change being closed.
- `task-tracker` names the corresponding failure where `review → done` is
  documented: recording a transition is not evidence that it happened, because
  a lifecycle written after the work reads exactly like one written as the work
  proceeded. Observed failure: a refactor deleting 78 lines shipped with no
  review pass, its four lifecycle transitions written in the same second
  afterwards, leaving an audit trail that reads compliant. What the log must
  contain remains stated once, in `docs/SDLC.md`.
- `execute-task` adds one pre-review check: list the behaviors a change adds or
  alters, and for each name a change that leaves the code compiling and running
  but removes that behavior, then confirm a test fails on it. A behavior with
  no such test is untested, and a test that only fails when the code is deleted
  or no longer compiles proves execution rather than behavior. Observed
  failure: four tests across three projects that executed the code but would
  not have failed if the behavior under test were removed — every one caught by
  cold review rather than by the implementer.
- `efficient-orchestration` gains "Waiting on external work": do not hold a
  shell open for a long external wait, do not re-read an unchanged artifact,
  scale the interval to what is being waited on, and fill the wait with
  independent work. Observed failure: blocking waits on CI and deploys
  accounted for a fifth of all tool execution, while the alternative in use —
  polling an output file — returned nothing on half its reads. The guidance
  deliberately names no harness-specific primitive, because harnesses differ
  in what they permit.
- `task-tracker`'s `task.mjs` accepts `help` as a verb, and its usage output
  now points at `references/cli-reference.md` for flags, statuses, and
  transitions. `-h`, `--help`, and the no-argument form already printed usage
  and exited 0; their behavior is unchanged except that all four forms now emit
  the added reference line. Observed failure: agents discovering the CLI surface
  by trial and error, including failures on flags and transitions that a verb
  list alone would not have prevented.

### Upgrade actions

1. Adopt the new `docs/SDLC.md` "Lifecycle" paragraph about re-entering
   `in_progress` from `review`. If the project rewrote that section, add the
   rule in the project's own words; the requirement is that the state machine
   forbids closing a task on a review that examined a different change.
2. Reconcile locally changed `execute-task`, `task-tracker`, and
   `efficient-orchestration` skills by preserving project-specific steps and
   adopting the three skill additions above: a checklist bullet in
   `execute-task`, a sentence in `task-tracker`, and one new subsection in
   `efficient-orchestration`. Each is additive, so a locally modified skill
   keeps its own content.
3. If `task.mjs` was modified locally, re-apply all three parts: the `help` verb
   alias, `help` in the printed verb list (the list is built from the verb
   table, which the alias is handled outside of, so it must be appended
   explicitly), and the usage pointer with the reference path matching this
   harness tree. Projects that did not modify it get all three from the normal
   upgrade.
4. No action is required for the audit tooling itself: it lives in the Foundry
   repository, not in the payload, and is not installed into projects.

### Breaking

None. Every change is additive guidance or a new CLI alias; no existing verb,
transition, flag, or exit code changes behavior. `task.mjs` usage text gains a
reference line and lists `help`, as the Changed section records; help output is
diagnostic, not a declared stable-output contract, so no reconciliation is
required.

## 0.16.0

### Changed

- `docs/SDLC.md` now gives human-facing conversation one compact authority:
  lead with the practical outcome, default to brief plain language, define
  necessary technical terms, and translate raw command, review, and delegated
  output into the problem, practical effect, and recommendation. Installed
  `AGENTS.md` points to that authority so the rule is always visible without
  being duplicated.
- `grill-me` is presented as a decision interview. It keeps its decision map
  private, asks one concrete question with a recommendation, explains the
  cost and ease of undoing a wrong choice, and gives a light progress estimate
  without repeatedly replaying the full interview.
- `execute-task` keeps detailed review evidence in durable records while
  reporting only a plain-language operator summary by default.
- New dependency-free `.agent-foundry/project-status.mjs` produces stable JSON
  and a terminal briefing capped at twelve lines. It quotes the latest approved
  milestone goal and finish line, uses the task tracker's own next/blocker
  logic, reports Git and recorded-check state, labels old or missing direction,
  and supports an explicit Git-ignored `--mark-seen` comparison point.
- New `.agent-foundry/project-overview.mjs` renders that same projection as a
  self-contained one-screen visual: approved direction, change signals,
  Now/Next/Later flow, operator decisions, check/Git evidence, and recent
  outcomes stay prominent while raw tasks and paths remain drill-down detail.
  Its generated `.agent-foundry/project-overview.html` is local and ignored.

### Upgrade actions

1. When reconciling the project-owned `AGENTS.md`, add the stock `Operator
   communication` pointer unless the project already has an equivalent or
   stricter plain-language rule. Keep project-specific audience needs. The
   upgraded mold skills and `docs/SDLC.md` remain self-consistent before this
   optional seed-file adoption.
2. Reconcile locally changed `grill-me` and `execute-task` skills by preserving
   project-specific workflow requirements while adopting the plain-language
   interview and review-translation behavior.
3. Use `node .agent-foundry/project-status.mjs` for the short operator view.
   Run it once with `--mark-seen` after reading to establish the local baseline;
   ensure the normal upgrade merged `.agent-foundry/project-status-seen.json`
   into `.gitignore`, and do not commit that marker.
4. If `PLANNING-JOURNAL.md` only has free-form milestone notes, reconcile the
   latest still-accepted direction into the dated `Goal`, `Done when`, and
   `Approved front` format documented by `plan-milestone`. Until that happens,
   the status view intentionally labels milestone direction as unknown.
5. Run `node .agent-foundry/project-overview.mjs` to generate the local visual
   and merge `.agent-foundry/project-overview.html` into `.gitignore`. Do not
   commit the generated snapshot; refresh it when the operator needs it.

### Breaking

None. Detailed task, review, and validation records remain available; only the
default human-facing presentation changes. Skipping the optional seed-file
pointer leaves the project correct but without the new rule in general chat.

## 0.15.0

### Changed

- New shared `agent-headless` skill gives both harnesses one invocation
  contract for Claude Code, Codex CLI, and operator-selected Cursor Agent.
  Provider mechanics run through a single Node 20 bundle installed at
  `.agent-foundry/agent-headless/cli.js`; capability probes explicitly report
  `available`, `missing`, or `unusable`, including Windows shim resolution.
- The bundled runner is generated from `shiftynick/agent-headless` 0.2.0. It
  preserves raw provider events while classifying stable lifecycle kinds,
  validates capability combinations, sends prompts over stdin, never emits
  dangerous approval/sandbox bypass flags, preserves partial failure output,
  and terminates process trees on cancellation or timeout. `PROVENANCE.md`
  records source/public-base commits, version, license, and artifact hashes;
  encoded source patches make an unpushed build reconstructable. Validation
  verifies all of them, executes bundled adapter/permission/cancellation tests,
  and scans for forbidden bypass flags.
- `docs/SDLC.md` remains the routing authority: Codex normally selects Claude,
  Claude Code normally selects Codex, and Cursor plus its exact model remain
  operator-selected. The old `claude-in-codex`, `codex-in-claude`, and
  `cursor-cli` skill names are compatibility aliases through 0.15.x. Existing
  wrapper scripts remain for command compatibility but are no longer the
  documented entry point.
- Source-only proposed ADR 0001 records why Foundry vendors one validated
  bundle instead of requiring a network/global dependency or duplicating
  provider wrappers; it is not installed into target projects.

### Upgrade actions

1. Apply the normal forced upgrade. The shared `agent-headless` skill lands in
   both harness trees, and `.agent-foundry/agent-headless/cli.js` plus
   `PROVENANCE.md` land once outside them.
2. Optionally, when reconciling `AGENTS.md` and `CLAUDE.md`, prefer normal invocation guidance
   with `.agents/skills/agent-headless/` or
   `.claude/skills/agent-headless/`. Preserve local model-routing policy, but
   keep the stock rule that Cursor and its exact model require operator choice.
3. Gradually update project scripts or documentation that invoke old wrapper
   paths to `node .agent-foundry/agent-headless/cli.js run`: map
   `claude-ask --prompt/--context-file` to `--provider claude
   --access answer-only --prompt-file`, and map `cursor-agent
   --model/--mode/--allow-write` to `--provider cursor --model` plus
   `--access answer-only|inspect|edit-isolated`. The old paths still work in
   0.15.x, so this migration need not be atomic; do not add new callers.
4. If the project chooses to migrate a locally changed provider skill or wrapper, separate policy
   from mechanics: move routing/policy into `docs/SDLC.md` or the shared skill,
   and retain a recorded compatibility divergence only when the new runner
   cannot express required behavior. Verify with
   `node .agent-foundry/agent-headless/cli.js capabilities <provider>`.

### Breaking

None. Compatibility skill names and wrapper commands remain functional through
0.15.x; actions 2-4 are an incremental migration path, not correctness work
required before upgrading.

## 0.14.1

### Changed

- `task.mjs run` no longer writes terminal escape sequences or trailing
  whitespace into recorded evidence. Colorized tool output previously
  survived as scrub artifacts like `?[0m` and could leave a trailing space
  on an evidence line, failing a trailing-whitespace gate on the one feature
  whose purpose is producing committable evidence. Escapes are now removed
  before the control-character scrub — CSI (including SGR), control strings
  (OSC, DCS, SOS, PM, APC) ended at their own terminator or cancelled by
  CAN/SUB, and two-character escapes, each in both their 7-bit and 8-bit
  spellings, plus any remaining C1 control the C0 scrub cannot reach — and
  each evidence line is trimmed;
  interior blank lines still render as a bare `  |`. The same sanitization
  applies to the recorded command line, which is forced onto one line and
  falls back to a placeholder when sanitizing empties it. Recorded evidence
  is a readable record, not a verbatim byte copy — the full output still
  streams to the console. Eight regression tests cover colored output,
  non-SGR escape forms, 8-bit C1 introducers, control-string terminator
  semantics, a reset followed by a trailing space, command-line
  sanitization, an all-escape command, and reserved-marker scrubbing.

### Upgrade actions

1. Apply the normal forced upgrade. Both harness copies of
   `task-tracker/scripts/task.mjs` and `task.test.mjs` are replaced
   together; they must stay identical.
2. If the project locally modified either file, re-apply its recorded
   divergences from `.agent-foundry/LOCAL-CHANGES.md` on top of the new
   versions, and keep `stripTerminalEscapes` ahead of the control-character
   scrub inside `sanitizeForLog` — reordering them reintroduces the `?[`
   artifacts.
3. Evidence already recorded in existing task logs is not rewritten. A task
   file that fails a trailing-whitespace gate from a pre-upgrade `run` entry
   is fixed by trimming those lines by hand; the CLI owns `## Log`, so make
   the edit only when a gate actually rejects the file.

## 0.14.0

### Changed

- New shared skill `agent-foundry-feedback` in both harness trees: package
  feedback about the installed kit — defects, recurring friction, and
  locally fixed mold files worth upstreaming — into self-contained packets
  under `.agent-foundry/feedback/`. It gathers only from signal that
  already exists — the operator's named concern, `friction:` notes,
  retrospective findings that target a mold file *and* are generic rather
  than project-specific, and `LOCAL-CHANGES.md` entries marked
  `Upstream: yes` — preferring a real diff against stock and naming the
  baseline that produced it, falling back to the changed region's current
  content when no baseline is recoverable. Delivery is two tiers: the local
  packet file always; a hosted issue only when an issue-filing CLI is
  available and authenticated and the operator names the destination,
  reviews the sanitized packet in full, and authorizes the submission. Both
  skill-tree `README.md` tables and the installed `AGENTS.md` skill table
  list it.
- `.gitignore.append` ignores `.agent-foundry/feedback/`: packets are
  transient working material that can quote project content, so they are
  not committed by accident. `.agent-foundry/README.md` documents the
  directory and its unmanaged, delete-once-delivered lifecycle.

### Upgrade actions

1. Apply the normal forced upgrade; the new skill directories land in both
   trees automatically.
2. If the project's `AGENTS.md` keeps the stock project-local skills table,
   fold in the new `agent-foundry-feedback` row when reconciling that seed;
   projects that replaced the table need no action.
3. Add `.agent-foundry/feedback/` to the project's `.gitignore` if the
   installer's merge did not (it appends only lines that are missing).

## 0.13.0

### Changed

- New shared skill `upgrade-agent-foundry` in both harness trees: a
  triggerable entry point for moving an installed project to a newer
  foundry release. It reads the installed version from
  `.agent-foundry.json`, acquires the new foundry from an operator-named
  local checkout or a Git URL (confirming before any network fetch and
  cloning outside the project), verifies the source is foundry-shaped and
  strictly newer, reports source and versions before changing anything, and
  then follows the acquired foundry's `UPGRADING.md` completely as the
  single authority for the procedure, deferring to it wherever the two
  disagree, while the upgrade task itself still completes under
  `execute-task`. Both
  skill-tree `README.md` tables and the installed `AGENTS.md` skill table
  list it.

### Upgrade actions

1. Apply the normal forced upgrade; the new skill directories land in both
   trees automatically.
2. If the project's `AGENTS.md` keeps the stock project-local skills table,
   fold in the new `upgrade-agent-foundry` row when reconciling that seed;
   projects that replaced the table need no action.

## 0.12.0

### Changed

- New shared skill `attack-the-board` in both harness trees: interrogate the
  remaining backlog up front, then execute as much of it as possible
  autonomously. It scopes the remaining in-filter work (offering filters when the
  backlog is large and none was given), orders a work path, harvests every
  operator-only question in one quick per-task pass and records the answers
  as board notes, then drives task after task through the unchanged
  `execute-task` lifecycle — efficient-orchestration posture by default,
  operator-selectable worker family — routing around real blockers (a
  closed four-item list) until nothing claimable remains, ending with a
  completed/blocked/filed report. Both skill-tree `README.md` tables list it.
- `efficient-orchestration` gained an "Announce the dials" section: before
  dispatching, the orchestrator states which backend and model family the
  workers run on and which model tier and effort level each slice class gets
  (work vs. review/verification), and announces any mid-run dial change with
  its reason.

### Upgrade actions

1. Apply the normal forced upgrade; the new skill directories land in both
   trees automatically.
2. Replace both copies of `efficient-orchestration/SKILL.md` with the new
   molds. If a project locally modified them, re-apply its recorded
   divergences on top and keep the "Announce the dials" section.

## 0.11.1

### Changed

- `run-checks.mjs` no longer loses its final summary line. It called
  `process.exit()` immediately after writing, and on Windows a piped stdout
  write is asynchronous, so the `FAIL (...)` line could be truncated — the
  CLI's own regression test failed intermittently for exactly this reason,
  most visibly when run from a pre-commit hook. It now sets
  `process.exitCode` and returns, letting Node flush before exiting.
- Both skill-tree `README.md` files list the shared `cursor-cli` skill,
  which shipped in 0.9.0 but was never added to their tables.
- `docs/adr/template.md` states Status/Date/Task as a list instead of
  trailing-whitespace hard breaks, and no longer ends with a blank line, so
  a project whose convention is a clean `git diff --check` does not inherit
  a violation in every ADR copied from it.
- `.agent-foundry/README.md` no longer claims the installer "never reads or
  writes" `.tasks/`: the payload ships the two `.gitkeep` files. Board cards
  and archives are untouched, which is what the sentence meant to say.
- `.agent-foundry/LOCAL-CHANGES.md` says what its own lifecycle is: entries
  are live records of present divergence, deleted when the divergence goes
  away, rather than an append-only log that accumulates retired entries.

### Upgrade actions

1. Apply the normal forced upgrade and reconcile as usual.
2. If `run-checks.mjs` was locally modified, re-apply that change on top of
   the new version and keep the `process.exitCode` return path — do not
   restore a `process.exit()` call that follows a `stdout.write`.
3. No action for the documentation fixes; they are seed-adjacent text in
   Foundry-owned files and land with the upgrade.

## 0.11.0

### Changed

- The cold-review output contract in `starter/docs/SDLC.md` now closes every
  axis result with a `CHECKED` coverage attestation: a list naming each
  rubric line or standard the reviewer actively verified and how. `PASS` is
  a complete terminal result only when its `CHECKED` list demonstrates real
  coverage; a thin or missing list makes the axis incomplete and the axis is
  re-run with a more complete packet. This closes the silence-as-pass
  failure mode where an under-informed reviewer returns `PASS` because it
  saw nothing, not because it verified anything.
- `starter/.claude/skills/execute-task/references/cold-review.md` and its
  `.agents` mirror gained a "Prompt template" section: a per-axis review
  prompt encoding that contract, with the SDLC finding schema (`location |
  rubric line or standard violated | concrete failure | severity |
  confidence`, numbered, highest severity first) and the `CHECKED` section.
  One call per axis, consistent with the two-independent-calls contract.

### Upgrade actions

- Replace `docs/SDLC.md` and both copies of
  `execute-task/references/cold-review.md` with the new molds. If the
  project locally modified either file, re-apply its recorded divergences
  from `.agent-foundry/LOCAL-CHANGES.md` on top of the new versions; a
  project whose divergence was an equivalent review-prompt graft can drop
  that entry after confirming the installed files match the new molds.
- Reviews dispatched after this upgrade must end with the `CHECKED` list;
  treat a bare `PASS` from an older prompt as an incomplete axis and re-run
  it.

## 0.10.0

### Changed

- Added a manifest-driven seed reconciliation command. It restores every
  committed, non-preserved project seed after `--force`, including
  `CLAUDE.md` and seeds introduced by future releases, while leaving new seeds
  and append-only logs intact.
- Upgrade guidance now starts task creation from the current default branch,
  uses stock-to-stock diffs to isolate new template content when both source
  versions are available, and reconciles restructured mold files by meaning
  rather than obsolete line placement.
- Task IDs created away from the known default branch use a stable numeric
  branch namespace. Independently created stale or concurrent branch cards no
  longer collide when merged; default-branch cards retain compact sequential
  IDs. Installation metadata records the default branch so local-only
  repositories do not depend on `origin/HEAD` discovery.
- The stock commit policy treats the repository default branch as
  integration-only unless `AGENTS.md` explicitly permits direct local
  commits. Branch naming remains project- or harness-owned, and push,
  publishing, and deployment authority is unchanged.
- `run-checks.mjs` now fails closed when its required skill-sync checker is
  missing or fails, excludes nested `node_modules` trees, and has CLI-level
  exit and output regression coverage.
- `task.mjs archive <id>` now explains that archive sweeps every done task and
  accepts only `--dry-run`. Cursor CLI guidance identifies the standard
  `%LOCALAPPDATA%\cursor-agent\agent.cmd` Windows shim and retains the
  cross-platform `CURSOR_AGENT_BIN` fallback.

### Upgrade actions

1. Apply the normal forced upgrade and keep its backup directory.
2. From the target project root, run
   `node .agent-foundry/reconcile-seeds.mjs --list`, then
   `node .agent-foundry/reconcile-seeds.mjs --restore-from-head`. Recover any
   uncommitted seed from the backup, and merge genuinely new stock content
   into the restored project files.
3. If old and new Foundry source refs or snapshots are available, diff their
   `starter/` trees to identify changed seed templates before merging. If a
   locally modified mold file was restructured, place the behavior in the new
   entrypoint or reference by meaning; do not recreate removed structure.
4. Reconcile local task-tracker changes into both harness trees. Preserve any
   stricter project concurrency rules, but retain branch-namespaced allocation
   for cards created away from the known default branch and the
   `.agent-foundry.json` default-branch metadata written by the installer.
5. Reconcile `docs/SDLC.md` and the project's `AGENTS.md` commit policy.
   Explicitly record any project permission for direct default-branch commits
   and any required branch naming; otherwise use a task branch for local
   commits. Do not broaden push, publish, deploy, tag, or history-rewrite
   authority.
6. Reconcile local `run-checks.mjs` changes so a missing skill-sync checker is
   a failure and dependency-tree tests are excluded. Do not retain a
   conditional skip for the required checker.
7. If either Cursor skill was locally customized, retain those changes while
   adding the Windows shim discovery path and cross-platform executable
   lookup guidance.
8. Run `node .agent-foundry/run-checks.mjs`, the project quality gate, and the
   post-upgrade drift report. Confirm the aggregate gate actually executes and
   reports skill synchronization.

Unmodified installations upgrade cleanly as a minor release.

## 0.9.0

### Changed

- Added one shared `cursor-cli` skill to both harnesses. It invokes Cursor
  Agent noninteractively for operator-selected reviews, planning, second
  opinions, or isolated implementation work.
- Cursor is never an automatic reviewer or worker. Every invocation requires
  the operator to request Cursor and name an exact model ID; `auto` is
  rejected because Cursor routes across model families.
- The bundled cross-platform wrapper defaults to read-only `ask` mode, accepts
  large packets over standard input, and gates write access behind
  `--allow-write`, an explicit workspace, and Cursor's isolated worktree.
- Cold-review independence follows the selected model family, not the Cursor
  transport: a different-family model may satisfy rung 1, while same-family
  or unknown-family selection is rung 2 at best.

### Upgrade actions

1. Apply the normal upgrade. Unmodified installations receive
   `.agents/skills/cursor-cli/` and `.claude/skills/cursor-cli/`, including
   their wrapper tests.
2. If either target path already exists, reconcile the collision into one
   shared skill: preserve useful local invocation details, but require an
   explicit non-`auto` model and keep the read-only/write-isolated boundary.
3. If `docs/SDLC.md` has local cold-review ladder changes, reconcile its rung
   1 with the explicit Cursor transport, model-ID, and model-family rule while
   preserving any stricter independence requirements.
4. During normal seed-file reconciliation, optionally add `cursor-cli` to any
   project-maintained skill index. A stale local index does not prevent the
   new shared skill or its checks from working.
5. Do not replace `claude-in-codex` or `codex-in-claude` as the automatic
   counterpart review bridge. Cursor remains opt-in, and its selected model
   family determines the cold-review rung.
6. From the installed project root, run
   `node .agent-foundry/run-checks.mjs`; confirm skill synchronization and both
   Cursor wrapper suites pass.

Unmodified installations upgrade cleanly as a minor release. No Cursor
installation or authentication is required unless the project invokes the
new skill.

## 0.8.0

### Changed

- Slimmed the default-loaded `execute-task` and `task-tracker` instructions.
  `execute-task` is now the sole detailed task-lifecycle authority, while
  `task-tracker` is the sole detailed board and CLI authority.
- Moved phase-specific cold-review and decision/blocker mechanics, plus
  uncommon concurrency, task-authoring, and CLI details, into explicitly
  routed reference files. Agents load them only at the relevant phase or
  condition; safety rules and command behavior are unchanged.
- Cold SPEC and STANDARDS reviews remain independent but are now dispatched
  concurrently when supported. Their output is `PASS` or concise findings
  tied to an existing rubric line, standard, or invariant, so review prose
  and uncited scope expansion do not consume the task.
- Validation now uses targeted checks during editing and runs expensive
  applicable full gates once after the diff freezes. Post-gate edits rerun
  full applicable gates unless a versioned, CI-enforced file-to-gate map
  proves a narrower set; uncertain, high-risk, and cross-cutting changes
  always run full applicable validation.
- Both counterpart-CLI bridges operationalize the centralized SDLC review
  rules without defining a second policy.

### Upgrade actions

1. Apply the normal upgrade. Unmodified skill directories receive the shorter
   entrypoints and their new `references/` files automatically.
2. If either installed `execute-task/SKILL.md` was customized, reconcile its
   lifecycle changes into the new entrypoint and move local cold-review or
   blocker detail into the matching reference instead of restoring duplicate
   prose.
3. If either installed `task-tracker/SKILL.md` was customized, keep board and
   CLI semantics in that skill, move lifecycle requirements to `execute-task`,
   and preserve project-specific concurrency or task-authoring guidance in
   the matching reference.
4. If `docs/SDLC.md` has local review or validation policy, reconcile it with
   the concurrent-but-separate review contract and conservative invalidation
   rule. Preserve stricter full-gate requirements.
5. If the target already contains files at any new reference path under
   `execute-task/references/` or `task-tracker/references/`, reconcile each
   collision. Retain useful project-specific mechanics while adopting the new
   routing and centralized policy references.
6. If either counterpart bridge is locally modified, retain its invocation
   details but add concurrent independent dispatch and the findings-only
   output contract.
7. From the installed project root, run
   `node .agent-foundry/run-checks.mjs`. It must run skill synchronization and
   discover the managed test suites; discovering no test suites means the
   installation is incomplete and the upgrade has failed.

Unmodified installations upgrade cleanly as a minor release. The conditional
reconciliation steps above apply only to project-owned drift in managed
`mold` files.

## 0.7.0

### Changed

- Added a lightweight agent-boundary convention to `docs/SDLC.md`.
  Delegations now state their objective, mutation ceiling, and scope; results
  distinguish observed, reported, and inferred evidence; blocked receivers
  return a reason, options, recommendation, and resume condition. This is
  intentionally a prose handoff convention, not an authorization protocol.
- `efficient-orchestration` now defers boundary semantics to the SDLC rather
  than growing a second set of rules in the skill.

### Upgrade actions

1. Apply the normal upgrade; unmodified managed files receive the new SDLC
   section and skill pointer without manual work.
2. Only when `docs/SDLC.md` has local delegation-policy changes, reconcile the
   new "Agent boundaries" section with them. Preserve stricter project rules,
   but keep the three mutation ceilings and evidence labels semantically
   recognizable.
3. Only when either copy of `efficient-orchestration/SKILL.md` has local
   changes, add the SDLC reference at its handoff-packet step rather than
   replacing the customized workflow.

## 0.6.0

Second field-report release, from a project that traversed 0.1.0 → 0.5.0 in a
week. Two of the defects were in code 0.4.0 and 0.5.0 shipped — surfaced by a
project *using* the kit, not by the kit's own tests.

### Changed

- **`retrospective --since` no longer trusts filesystem mtime.** It filtered on
  `statSync().mtimeMs`, which any fresh clone, new worktree, or CI checkout
  resets to "now" — so `--since` silently matched everything and degraded to no
  filter. Since the skill's premise is counting *recent repeated* occurrences
  to justify editing a governing document, that let months-old friction be
  scored as a current pattern. It now reads the task's own `updatedAt`
  frontmatter, falling back to the newest dated log line, and keeps files with
  no usable timestamp rather than dropping evidence. This mattered most in a
  worktree, which 0.4.0 itself recommends for parallel agents — the two
  features were in tension as shipped.
- **The bridge skills' packet escape hatch no longer drops content.** Both
  suggested `git diff > packet.diff`, which is working-tree *versus index* and
  therefore omits exactly the staged changes the surrounding paragraph exists
  to rescue — reintroducing the wasted review round it was added to prevent.
  Now `git diff --binary HEAD`, plus an explicit instruction to list untracked
  files with `git ls-files --others --exclude-standard` and attach their
  contents, since a task that adds a module has its most important files
  untracked. `execute-task` carries the same correction.
- **Review-packet commits are part of the lifecycle.** The bridge skills said
  the packet must be a commit while `docs/SDLC.md` placed the commit after
  review — both authoritative, and jointly unsatisfiable. Commit authority now
  states that committing to a task branch so a cold reviewer can see the work
  is part of the review step, not a claim of completion; what requires the task
  to be complete is merging or delivering the branch.
- **One tag convention per concept.** `task-tracker` listed `phase:<name>`
  while `plan-milestone` files and queries `milestone:<name>`, so a hand-seeded
  front was invisible to the skill that owns it — and the failure is silent, a
  partial result reading as "most of the milestone is done". The tag list now
  distinguishes `milestone:` (the work front, queried by `plan-milestone`) from
  `phase:` (kind or provenance, such as `phase:bootstrap` or `phase:audit`).
- **New `.agent-foundry/run-checks.mjs`.** Discovers and runs the skill-sync
  gate plus every `*.test.mjs` under the managed trees. The kit now ships
  executable code inside the skill trees, and hand-maintained suite lists in
  `UPGRADING.md` had already fallen behind — 0.4.0's two new suites shipped but
  a project following the procedure exactly never ran them. Upgrade, gate, and
  bootstrap docs now name this one command instead of enumerating paths.
- **`UPGRADING.md` opens by filing the upgrade task**, with a standing rubric,
  because the procedure is normally entered directly from an operator request
  and bypasses `execute-task`'s preamble — so the rubric was being written
  after the work, where it cannot fail the work that produced it. The rubric
  promotes verifying each retirement against the installed file rather than
  trusting the changelog.
- `LOCAL-CHANGES.md`'s header no longer describes itself as a `mold` file it
  is no longer classified as.

### Upgrade actions

1. Follow the standard procedure in `UPGRADING.md` — which now starts by
   filing the upgrade task and logging its rubric.
2. Replace any project gate or CI step that runs `check-skill-sync.mjs` or a
   hand-listed set of `--test` paths with `node .agent-foundry/run-checks.mjs`.
3. Audit the board for front cards tagged `phase:<name>` that were meant as
   milestones and retag them `milestone:<name>`; `list --tag` will not report
   the split.
4. If any local process documentation repeats `git diff > packet.diff` as the
   review-packet command, correct it to `git diff --binary HEAD` plus the
   untracked-file listing.

### Breaking

- None.

## 0.5.0

Adds the cost dimension the kit was missing: how to spend the expensive
model's tokens only where its judgment matters.

### Changed

- **New shared skill `efficient-orchestration`** (eleventh shared workflow).
  The top-tier model orchestrates — decomposition, architecture, synthesis,
  judgment, final review — while cheaper workhorse models take bounded,
  token-heavy research, coding, and testing slices in parallel. Distills two
  battle-tested source skills into one tier-neutral contract: self-contained
  handoff packets with stop conditions, the model-vs-effort dial distinction
  (mechanical bulk → cheap model at low effort; verification → high effort
  even on a small model), the context → effort → model diagnostic ladder for
  disappointing results, and vet-don't-forward discipline for worker reports.
  An opt-in backend routes work slices to the other model family through this
  harness's bridge skill. Integrated with the lifecycle: delegated work never
  substitutes for cold review, decisive validation is re-recorded via
  `task.mjs run`, and board writes stay with the orchestrator.

### Upgrade actions

1. Follow the standard procedure in `UPGRADING.md`.
2. Add the `efficient-orchestration` row to the skills table in `AGENTS.md`
   and change "ten shared workflows" to "eleven" (the fresh template shows
   both).
3. If the project carried a local variant of this pattern (an
   efficiency/delegation skill added under a different name), reconcile it
   with the shared skill and retire the local copy or record the divergence
   in `.agent-foundry/LOCAL-CHANGES.md`.

### Breaking

- None.

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
