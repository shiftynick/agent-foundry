---
name: task-tracker
description: >-
  Persistent file-based kanban for cross-session, cross-agent dev work.
  Use when starting non-trivial dev work, deciding what to work on, marking
  progress, hitting a blocker, finishing a task, discovering new follow-ups,
  or whenever the user mentions tasks, the board, kanban, "what's next",
  "what should I work on", in_progress, blocked, or review. Distinct from
  the in-conversation plan tool, which is for transcript-scoped step tracking
  only.
---

# Task Tracker

Persistent kanban at `<repo-root>/.tasks/tasks/` driven by a bundled
zero-dep Node script. Completed tasks get moved to
`<repo-root>/.tasks/archive/`. State lives in per-task `.md` files; the
script serializes writes through a repository lock and Windows-safe backup
replacement. No package install required.

This skill is **agent-autonomous**: a single agent is expected to drive
each task from claim through done and archive without waiting on the
user, gated by the review checklist below. Committing that work follows
the commit-authority rule in `docs/SDLC.md`, which a project may tighten
in its `AGENTS.md`.

## Invoking

The script lives at `scripts/task.mjs` next to this SKILL.md. Invoke it
from PowerShell or another shell with the install path:

    node <skill-dir>/scripts/task.mjs <verb> [args...]

In this repo:

    node .claude/skills/task-tracker/scripts/task.mjs <verb>

## When to use

- Before starting non-trivial work → `task.mjs next`
- When `next` returns nothing claimable → inspect blockers and underspecified
  work before asking for concrete missing input
- When starting → `task.mjs move <id> in_progress`
- When you discover follow-up work that won't fit this turn → `task.mjs add ...`
- When code is written and tests pass → `task.mjs move <id> review`
- When the review checklist is satisfied → `task.mjs move <id> done`
  (you do this yourself — don't wait for the user)
- When blocked → `task.mjs note <id> "<reason>"` then `task.mjs move <id> blocked`
- When wrapping up a session → `task.mjs archive`
- When user asks "what are we working on" → `task.mjs board`

## Standard workflow (autonomous)

```bash
# 1. Find work. If nothing is ready, triage first (see next section).
node .claude/skills/task-tracker/scripts/task.mjs next

# 2. Claim it.
node .claude/skills/task-tracker/scripts/task.mjs move task-007 in_progress

# 3. Work. Log meaningful decisions / direction changes inline.
node .claude/skills/task-tracker/scripts/task.mjs note task-007 "tried X, switched to Y"

# 4. Move to review when code+tests are in place.
node .claude/skills/task-tracker/scripts/task.mjs move task-007 review

# 5. Self-verify against the review checklist. If it passes, close it out.
node .claude/skills/task-tracker/scripts/task.mjs move task-007 done

# 6. Wrapping up the session — sweep done tasks into the archive.
node .claude/skills/task-tracker/scripts/task.mjs archive
```

The agent owns every step. Only stop and surface to the user when:
- the review checklist genuinely cannot be satisfied without their input
  (e.g., subjective design call, missing credentials, ambiguous spec), or
- a task is blocked by something outside the agent's control.

## When `next` is empty

`backlog` and `ready` are both claimable. Therefore, `next` returning no
output means every remaining task is blocked, already active, under review,
or complete.

1. Run `board` and `list --blocked`.
2. Resolve a dependency or clarify an underspecified card when the repository
   contains enough evidence.
3. Promote an unblocked backlog item to `ready` only as an intentional queue
   signal; promotion does not make it newly claimable.
4. If progress needs an operator decision or external change, report that
   exact condition rather than asking an open-ended "what next?".

## Review checklist (before `move <id> done`)

A task in `review` only moves to `done` once **all** applicable items
below are true. Document the evidence in a `task.mjs note` before the
move so the trail is auditable.

For any work touching code:
- [ ] Unit and/or integration tests covering the change exist and pass
  locally. New behavior → new tests; bug fix → regression test. If the
  surrounding code has no existing test infrastructure, add the minimum
  needed rather than skipping.
- [ ] The full relevant test suite (not just the new tests) passes.
- [ ] No lint/type errors introduced (run the project's checker if one
  exists).
- [ ] **Fresh-eyes review (required)** — hand the diff to a reviewer
  with no session context before promoting to `done`. Use the highest
  available rung of the cold-review ladder in `docs/SDLC.md`, and record
  which rung was used; the reviewer must receive only the task, rubric,
  standards, and diff. See the `execute-task` skill for the full two-axis
  review protocol.
- [ ] If a skill under `.claude/skills/` changed, the mirrored copy under
  the counterpart harness changed identically in the same commit. Verify
  with `node .agent-foundry/check-skill-sync.mjs`.

For any work that produces a runnable surface:
- [ ] Smoke-tested by actually running the application end-to-end on the
  golden path (CLI invocation, server boot + request, script execution,
  etc.), not just by reading the diff.
- [ ] If the change is observable in a frontend UI (new component,
  layout/behavior change, user-facing interaction), drive a real browser
  to confirm it renders and behaves as
  expected. Pure internal frontend refactors covered by tests are
  exempt.

For any work that changes operator behavior, setup, product concepts, APIs,
agent/delegation workflow, validation commands, troubleshooting, or supported
limitations:
- [ ] Updated `README.md`, the relevant doc under `docs/`, or an ADR when the
  change affects project framing, design contracts, API behavior, or runbooks.
- [ ] If no documentation update is needed, logged why in the task notes before
  moving out of `review`.

For docs / config / pure-text changes:
- [ ] Re-read the file end-to-end after the edit; no broken links,
  stale references, or contradictions with sibling docs.

If any box can't be checked, the task stays in `review`. Log what's
missing with `task.mjs note` and either finish the work or hand back to
the user with a specific question — never auto-promote to `done` on
faith.

## Archiving done tasks

Sweep `done` tasks to the archive when wrapping up a session, when the
`done` column starts crowding the board, or before producing a handoff.
Don't archive immediately on each move-to-done — leaving recent
completions visible briefly is useful context for the next claim.

```bash
node .claude/skills/task-tracker/scripts/task.mjs archive --dry-run  # preview
node .claude/skills/task-tracker/scripts/task.mjs archive            # apply
```

Archived tasks disappear from `board`, `list`, `show`, and `next`. A normal
archived `done` task satisfies dependencies; a soft-deleted task never does.

## Filing follow-ups

If you discover a follow-up that's out of scope for the current task:

```bash
node .claude/skills/task-tracker/scripts/task.mjs add "Refactor X once Y lands" \
  --priority p2 --tag area:process --blocked-by task-007
```

Tell the user (when surfacing): "Filed as task-NNN, blocked by current task."

### Writing durable task descriptions

Tasks often sit in `backlog` for weeks while the code moves underneath them,
so write descriptions that survive drift:

- **Name behaviors, interfaces, and concepts — not file paths or line
  numbers.** "The settings validator that all write paths share must also
  reject X" stays true after a refactor; `validation.rs:142` doesn't.
  Exception: a task being claimed immediately in the same session may carry
  paths as a convenience.
- **Size to one fresh agent session** (one context window: claim, implement,
  review, validate, commit). If honestly describing the work needs more than
  that, it's an epic — split it into session-sized tasks with `--blocked-by`
  edges instead of filing one oversized card.
- State the acceptance criteria as observable outcomes a cold reader could
  verify, not as "clean up / improve" adjectives.

## Columns

The CLI enforces the normal lifecycle below. `--force` is the explicit escape
hatch and may only be used when the user authorizes it.

`backlog → ready → in_progress → review → done`, plus `blocked`.

- `backlog` — known work, not yet triaged.
- `ready` — triaged and queued; explicit "do this next" signal.
- `in_progress` — actively being worked.
- `review` — code/changes complete, awaiting the review checklist
  verification.
- `done` — checklist satisfied, closed out.
- `blocked` — waiting on something the agent can't unblock; note the
  reason.

## Dependencies

`--blocked-by task-NNN` declares a dependency. The CLI prevents dependency
cycles on add/edit, rejects unknown or soft-deleted blocker IDs, and refuses
to move into `in_progress`, `review`, or `done` while any blocker is not a
live `done` task. Use
`--force` only when the user explicitly says so (the override is logged).

`next` only suggests tasks with all dependencies satisfied. Both
`backlog` and `ready` are treated as claimable. Within a priority
bucket, `ready` sorts first as a tiebreaker. `list --ready` applies the
same claimable filter.

## Tags

Convention is `key:value`. Common keys: `area:core`, `area:desktop`,
`area:architecture`, `area:tooling`, `area:process`, and `phase:<name>`.
Filter with `list --tag area:core`.

## Read commands

```bash
task.mjs board                              # ASCII kanban
task.mjs list                               # flat list
task.mjs list --status ready
task.mjs list --tag area:core
task.mjs list --blocked | --ready
task.mjs list --json
task.mjs show task-007
task.mjs next
```

Archived tasks are hidden from normal `board`, `list`, `show`, and `next`
output. A normal archived `done` task satisfies dependencies; a soft-deleted
task never does.

### HTML board view

For a human-friendly snapshot of the whole board (columns, priorities,
tags, blocker state, expandable descriptions/logs, collapsed archive):

```bash
node .claude/skills/task-tracker/scripts/board-html.mjs   # writes .tasks/board.html
```

Read-only and regenerated on demand — the markdown task files stay the
source of truth, and the output file is gitignored. Pass `--out <path>`
to write elsewhere. Offer to regenerate it whenever the user asks to
"see the board".

## Write commands

```bash
task.mjs add "<title>" [--priority p1] [--tag k:v ...] [--blocked-by task-NNN ...] [--description "..."]
task.mjs move <id> <status> [--force] [--note "..."]
task.mjs note <id> "<text>"
task.mjs edit <id> [--title ...] [--priority ...] [--add-tag ...] [--remove-tag ...]
                   [--add-blocked-by ...] [--remove-blocked-by ...] [--description "..."]
task.mjs rm <id>                            # soft-delete: status=done + tag deleted:true
task.mjs archive [--dry-run]                # move done tasks to .tasks/archive/
```

Priority enum: `p0 p1 p2 p3` (default `p2`). Default status on `add`: `backlog`.

Free text (titles, notes, descriptions) may start with dashes. If the text
could be mistaken for one of this CLI's own flags, end option parsing first
with a bare `--`, or use the `--flag=value` form:

```bash
task.mjs note task-007 -- "--force was required because ..."
task.mjs add --title="--weird but valid title"
```

## Exit codes

| Code | Meaning                                                        |
| ---- | -------------------------------------------------------------- |
| 0    | success (including "no claimable task" for `next`)             |
| 1    | runtime error                                                  |
| 2    | bad usage / validation failure (blocked move, cycle, bad enum) |
| 4    | task id not found                                              |
| 5    | concurrent lock or write conflict — the CLI already retried     |

## Concurrency

All board commands, including reads and HTML snapshots, serialize through
`.tasks/.write-lock`. This protects ID allocation and prevents readers from
observing a task halfway through a Windows-safe replacement. The lock records
its owning process; a later command recovers dead-owner locks and rolls back
interrupted backups. Individual updates also retain an mtime check.

Lock acquisition retries with a short backoff before giving up, so ordinary
multi-agent contention resolves without a visible failure. Exit code 5 means
one of two distinct things, and the message says which:

- `lock held by another process` — contention outlasted the retry window.
  Something is holding the board much longer than a normal command; check for
  a stuck process rather than immediately retrying again.
- `task file changed since read` — an mtime collision: another writer changed
  the task between this command's read and write. Re-read and reapply.

The consistency guarantee requires a writable `.tasks` directory even for
read commands. In a deliberately read-only checkout, inspect the Markdown task
files directly rather than claiming the CLI board is available.

## Common pitfalls

- **Don't auto-promote review → done without the checklist.** "Tests
  exist somewhere in the repo" is not the same as "this change is
  covered". If you can't point at the specific test that would have
  caught a regression, the checklist is not satisfied.
- **Don't skip fresh-eyes review because "the change looks simple".**
  Simple changes are where confirmation bias bites hardest. When no
  independent reviewer is available, descend the `docs/SDLC.md` cold-review
  ladder rather than skipping — and declare the rung you landed on.
- **Don't bypass dep guards casually.** If `move` refuses with "blocked
  by task-XXX", that's the safety net. Use `--force` only on explicit
  user instruction.
- **Don't ask an open-ended "what should I work on" before diagnosing the
  board.** If `next` is empty, inspect blockers and underspecified cards;
  promoting backlog to `ready` does not make it newly claimable.
- **Don't hand-edit task `## Log` sections.** The CLI is the writer.
  `## Description` is hand-editable except that
  `<!-- task-tracker:... -->` comments are reserved format markers.
- **`next` exit 0 with no output means "no claimable work"** — not an
  error. Distinguish from non-zero (actual error) before reporting to user.
- **Prefer `add` over expanding the current task's scope** when you
  discover follow-ups mid-stream.
- **Don't bake file paths/line numbers into backlog descriptions.** They
  go stale; describe the behavior or interface instead (see "Writing
  durable task descriptions").
