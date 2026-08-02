# HANDOFF — Agent Foundry, 2026-08-02

You are picking up the Agent Foundry bootstrap kit itself (not a project that
installed it). Four releases shipped this session; the tree is clean and every
gate passes.

---

## TL;DR

This session added three shared skills — `attack-the-board`,
`upgrade-agent-foundry`, `agent-foundry-feedback` — plus a dial-announcement
rule in `efficient-orchestration` and a correctness fix to recorded task
evidence. Four releases landed (0.12.0 → 0.14.1), each with its own two-axis
cold review. Nothing is in progress, nothing is blocked, and **nothing is
pushed** — all commits are local on `master`. The backlog holds three
untouched p2/p3 cards from before this session.

---

## To pick up tomorrow

Confirm the tree is still green before doing anything else:

```bash
node scripts/validate-foundry.mjs && node starter/.agent-foundry/check-skill-sync.mjs starter && node scripts/test-bootstrap.mjs
```

Then look at what's left:

```bash
node starter/.claude/skills/task-tracker/scripts/task.mjs board
```

The immediate decision is whether to push the four local commits — that was
deliberately left to the operator and is the only thing standing between this
work and a published release.

## What's where

| Thing | Location |
| --- | --- |
| This repo's own agent contract | `AGENTS.md` (root) — *not* `starter/AGENTS.md.template` |
| Payload installed into other projects | `starter/**` |
| Claude-facing skills (canonical) | `starter/.claude/skills/` |
| Codex-facing mirror | `starter/.agents/skills/` |
| Validation (counts, neutrality, fences) | `scripts/validate-foundry.mjs` |
| End-to-end install test | `scripts/test-bootstrap.mjs` |
| Mirror check (also runs in installed projects) | `starter/.agent-foundry/check-skill-sync.mjs` |
| Release number (single source of truth) | `VERSION` |
| Upgrade procedure agents follow | `UPGRADING.md` |
| Board / archive | `.tasks/tasks/`, `.tasks/archive/` |

## Mental model (don't lose this)

**The payload is the product.** A change to a skill is reviewed like code:
trigger accuracy, instructions, repository references, and a real invocation
when scripts are involved.

**Adding one shared skill touches seven count-bearing places.** The hardcoded
per-harness file count *and* the shared-skill list in
`scripts/validate-foundry.mjs`, the assertion in `scripts/test-bootstrap.mjs`,
and the prose counts in `CLAUDE.md`, `README.md`, `AGENTS.md`,
`starter/AGENTS.md.template`, plus the tables in both skill-tree
`README.md` files. The template one is easy to miss — a cold reviewer caught
it this session, not the validator.

**Single-authority discipline is enforced socially, not mechanically.**
`starter/docs/SDLC.md` owns commit authority, the cold-review ladder, and
mid-task ADRs; `UPGRADING.md` owns the upgrade procedure. Skills must
*reference* them. Every skill written this session drew a review finding for
restating one of those authorities — expect it and write the reference form
first.

**`upgrade-agent-foundry` defers to the acquired foundry's `UPGRADING.md`** —
the version being upgraded *to*, not the copy shipped with the installed
version. That's what keeps the procedure from going stale, and it's the one
design point to preserve if that skill is edited.

## What was finished this session

- **0.12.0** (`0eac9ae`) — `attack-the-board`: scope the remaining in-filter
  work, plan a path, harvest every operator-only question in one batch, then
  run tasks through the normal `execute-task` lifecycle, routing around real
  blockers (a closed four-item list) until nothing claimable remains. Also
  added "Announce the dials" to `efficient-orchestration`: state backend,
  family, specific model, and effort per slice class (work vs.
  review/verification), and announce mid-run changes.
- **0.13.0** (`102112d`) — `upgrade-agent-foundry`: establishes the installed
  version, acquires the new foundry from a local path or an operator-approved
  clone, verifies it is foundry-shaped and strictly newer, then follows the
  acquired `UPGRADING.md`.
- **0.14.0** (`01d3de5`) — `agent-foundry-feedback`: packages defects and
  upstream-worthy fixes into self-contained packets under
  `.agent-foundry/feedback/` (now git-ignored and documented as unmanaged);
  local file always, hosted issue only with `gh auth status` passing and
  explicit operator approval of destination and full sanitized body.
- **0.14.1** (`f8629d1`) — `task.mjs run` no longer writes terminal escapes or
  trailing whitespace into recorded evidence, for both the output tail and the
  recorded command line. 68 tests pass in each tree.
- Archived task-014, task-015, task-016 to `.tasks/archive/`.

## What's in progress / half-done

Nothing. No task is claimed, no work is staged, and the worktree is clean.

## Open questions for the human

1. **Push or not.** Four commits sit local on `master`. Pushing is outside
   autonomous commit authority under `starter/docs/SDLC.md`.
2. **Backlog direction.** Three cards remain (`task-010` deploy-dependent
   acceptance lifecycle, `task-011` routing upstream-worthy local changes,
   `task-013` cross-harness session audit POC). `task-011` now overlaps
   `agent-foundry-feedback`, which is a candidate delivery mechanism for its
   `Upstream: yes` entries — decide whether to fold them together before
   picking `task-011` up.

## Known blockers and risks

- **One unreviewed-at-cap change.** In task-016 the last two fixes (8-bit SOS
  introducer; splitting the control-string terminator rule so BEL ends OSC
  only, with CAN/SUB cancelling) landed after the third review round, which is
  the ladder's cap. They are covered by a 24-case local harness over the
  extracted helpers and a CLI-level regression test, but not by a fourth cold
  round. Recorded in the archived task log.

## Recent commit history

```text
f8629d1 task-016 / release 0.14.1: strip terminal escapes from recorded evidence
01d3de5 task-015 / release 0.14.0: add shared agent-foundry-feedback skill
102112d task-014 / release 0.13.0: add shared upgrade-agent-foundry skill
c9873ab tasks: file upgrade-agent-foundry and agent-foundry-feedback skills
0eac9ae release 0.12.0: add attack-the-board skill and orchestration dial announcements
47a6d78 docs: normalize session audit note
793f633 tasks: defer cross-harness session audit POC
154807d release 0.11.1: fix a truncated failure summary and four stale claims
```

## Frequently-needed commands

```bash
node scripts/validate-foundry.mjs
node scripts/test-bootstrap.mjs
node starter/.agent-foundry/check-skill-sync.mjs starter
node --test starter/.claude/skills/task-tracker/scripts/task.mjs
node starter/.claude/skills/task-tracker/scripts/task.mjs board
```

Mirror the canonical Claude copy to the Codex tree after editing a shared
skill (the only permitted transform is the path string):

```bash
sed 's|\.claude/skills/|.agents/skills/|g' starter/.claude/skills/<name>/SKILL.md > starter/.agents/skills/<name>/SKILL.md
```

Cold review, one call per axis, run concurrently:

```bash
codex exec -C "N:/agent-foundry" -s read-only --ephemeral -o result.md - < prompt.txt
```

## Common pitfalls

- **Editing payload source through a tool that processes escapes will corrupt
  it.** `task.mjs` contains regex literals like `\u001b`; an edit that passes
  them through shell *and* JS string layers silently turns them into real
  control bytes or drops a backslash. This cost several attempts this session.
  Build such edits with `String.fromCharCode(92)` in a script file, and verify
  after with a scan for raw C0/C1 bytes before committing.
- **`validate-foundry.mjs` will not catch a stale prose count.** It checks the
  file count and shared list it hardcodes; `starter/AGENTS.md.template`'s
  skill table and "N shared workflows" sentence are prose it never reads.
- **A payload test that shells out must not rely on backslash survival.** The
  test fixture for an ST-terminated escape passed on Windows and would have
  broken under POSIX `sh`, where `\\` inside double quotes reduces. Payload
  tests run during installation on every platform — build byte-exact fixtures
  with `String.fromCharCode`.
- **`git diff` omits staged work when building a review packet.** Use
  `git diff --binary HEAD` and separately list untracked files with
  `git ls-files --others --exclude-standard`; a new skill's `SKILL.md` is
  untracked and would otherwise be reviewed as if it didn't exist.
- **Expect the first review round to find real defects, not nits.** Every
  skill this session drew findings on restated authority or an unhandled edge
  case; the evidence fix drew concrete failing inputs in all three rounds.
  Budget for three rounds rather than treating round one as a formality.
