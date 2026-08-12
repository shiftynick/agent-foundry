# HANDOFF — Agent Foundry, 2026-08-11

You are picking up the Agent Foundry bootstrap kit itself (not a project that
installed it). Work front in flight: controlled visual-artifact review under
Foundry control. Strategy and ADR are done; the tool has not been built yet.

---

## TL;DR

Operator wants human-in-the-loop HTML artifact review (agent renders HTML →
human annotates in browser → agent polls feedback). Upstream lavish-axi was
rejected as-is. Strategy option **(b)** is approved: a minimal zero-dependency
in-house rebuild shipped as a new shared skill. ADR-0003 records that as
accepted. Current release on this tree is **0.30.3**. Branch
`t3code/deep-review-task-035` has two local commits for this front; nothing
pushed from this session. Next claimable work is
`task-6246861934000002` (build the tool + dual-tree skill).

---

## To pick up tomorrow

Confirm the tree is green, then claim the build task:

```bash
node scripts/validate-foundry.mjs
node starter/.agent-foundry/check-skill-sync.mjs starter
node starter/.agents/skills/task-tracker/scripts/task.mjs show task-6246861934000002
node starter/.agents/skills/task-tracker/scripts/task.mjs move task-6246861934000002 in_progress
```

Read these before writing code (in this order):

1. `docs/adr/0003-in-house-visual-artifact-review.md` — decision, scope, security requirements, SDLC position
2. `docs/research/visual-artifact-review-strategy-2026-08-11.md` — option comparison and accepted trade-offs
3. `docs/research/skills-repo-evaluations-2026-08-08.md` — why lavish-axi must not be incorporated as-is

Then follow `execute-task`: rubric note → implement → warm self-pass → cold
review → `validate-foundry` + `test-bootstrap` → commit. The release-wiring
task (`task-6246861934000003`) is blocked until the build lands; it owns the
15→16 skill-list updates, VERSION bump, and CHANGELOG.

## What's where

| Thing | Location |
| --- | --- |
| This repo's own agent contract | `AGENTS.md` (root) — *not* `starter/AGENTS.md.template` |
| Payload installed into other projects | `starter/**` |
| Claude-facing skills (canonical) | `starter/.claude/skills/` |
| Codex-facing mirror | `starter/.agents/skills/` |
| Foundry-repo ADRs (not installed) | `docs/adr/` |
| Installed-project ADR mold | `starter/docs/adr/` |
| Visual-review strategy (approved) | `docs/research/visual-artifact-review-strategy-2026-08-11.md` |
| Lavish-axi evaluation (rejected as-is) | `docs/research/skills-repo-evaluations-2026-08-08.md` |
| ADR-0003 (accepted) | `docs/adr/0003-in-house-visual-artifact-review.md` |
| Validation (counts, neutrality, fences) | `scripts/validate-foundry.mjs` |
| End-to-end install test | `scripts/test-bootstrap.mjs` |
| Mirror check | `starter/.agent-foundry/check-skill-sync.mjs` |
| Release number | `VERSION` (currently `0.30.3`) |
| Board | `.tasks/tasks/` |
| Review packets (gitignored / untracked) | `.tasks/review-packets/` |

## Mental model (don't lose this)

**The payload is the product.** A change to a skill is reviewed like code:
trigger accuracy, instructions, repository references, and a real invocation
when scripts are involved.

**Visual artifact review is not a cold-review rung.** ADR-0003 places it as
an *operator feedback loop during implementation*. It complements
`starter/docs/SDLC.md`'s cold-review ladder; it must never substitute for
SPEC or STANDARDS. Do not restating a second review model inside the skill —
point at SDLC + the ADR.

**Option (b) scope is deliberately thin.** Core loop only: `node:http` on
127.0.0.1, string-level SDK injection, element + text-selection annotations,
prompt queue, long-poll for the agent, `fs.watch` live reload, print URL (no
`open`). Out of scope: Mermaid whiteboard, layout audit, sharing, telemetry,
playbooks. Security non-negotiables: loopback-only, Host-header validation,
zero outbound network, artifact-directory confinement, sandboxed iframe
without `allow-same-origin`. If whiteboard/layout-audit later matter, the
documented fallback is a separate-repo fork of lavish-axi — new ADR, not a
quiet scope creep.

**Adding one shared skill touches many count-bearing places.** Hardcoded
per-harness file count *and* shared-skill list in
`scripts/validate-foundry.mjs`, assertions in `scripts/test-bootstrap.mjs`,
and prose counts in `CLAUDE.md`, `README.md`, `AGENTS.md`,
`starter/AGENTS.md.template`, plus both skill-tree `README.md` tables. The
template prose is easy to miss — `validate-foundry.mjs` will not catch it.
That wiring is explicitly owned by `task-6246861934000003`, not the build
task, but do not invent a seventeenth skill name that the wiring task cannot
find.

**Single-authority discipline is enforced socially, not mechanically.**
`starter/docs/SDLC.md` owns commit authority, the cold-review ladder, and
mid-task ADRs. Skills must *reference* them, not restate them.

**Repo-level ADRs vs payload ADRs.** `docs/adr/` describes the Foundry
source. `starter/docs/adr/` is the empty mold installed into targets.
ADR-0003 correctly lives only in `docs/adr/`.

## What was finished this session

- **task-035** (`b01171e`) — strategy comparison written and operator-approved
  for option (b). Follow-up tasks filed. Card `done`.
- **task-6246861934000001** (`e92afa9`) — ADR-0003 accepted (operator had
  already decided; skill rule allows `accepted` with citation). Index row in
  `docs/adr/README.md`. Trivial-diff cold review via
  `cold-review.mjs --provider codex --axis COMBINED` → PASS, zero findings.
  `validate-foundry.mjs` recorded exit 0.
- Unblocked the build task; release-wiring task remains blocked on the build.

## What's in progress / half-done

Nothing claimed. Ready next:

| ID | Title | Notes |
| --- | --- | --- |
| `task-6246861934000002` | Build zero-dep visual-review tool and shared skill pair | backlog, unblocked, p2 |
| `task-6246861934000003` | Wire visual-review skill into validation and release | backlog, blocked by 0002 |

Untracked only: `.tasks/review-packets/` (ADR r1 packet; leave uncommitted
unless someone wants it archived).

Branch: `t3code/deep-review-task-035` — two commits ahead of whatever this
worktree was cut from; **not pushed** this session.

## Open questions for the human

None required before starting `task-6246861934000002`. Scope and trade-offs
were locked in the plan approval and ADR-0003.

Optional later: whether to push this branch / open a PR — outside autonomous
authority unless asked.

## Validation state

- `node scripts/validate-foundry.mjs` — PASS (recorded on the ADR task after
  final edits).
- `node scripts/test-bootstrap.mjs` — not re-run this session (no `starter/`
  changes). Re-run after the build task touches the payload.
- Cold review rung for ADR: ladder rung 1 (Codex COMBINED fast-path), PASS.

## Worktree and operational state

- Branch: `t3code/deep-review-task-035`
- HEAD: `e92afa9` (ADR-0003)
- Working tree: clean except untracked `.tasks/review-packets/`
- VERSION: `0.30.3` (no bump yet; bump lands with task-6246861934000003)

## Known blockers and risks

- **No product risk on the ADR path.** The expensive-to-reverse decision is
  already accepted; implementation can proceed.
- **Build task will add a 16th shared skill.** Expect dual-tree sync and the
  wiring task's count updates to be the main validation surface. Do not ship
  the skill without a payload `*.test.mjs` that `test-bootstrap` will run.
- **Cold-reviewer sandbox EPERM on Windows.** During ADR review, Codex's
  sandboxed `node scripts/validate-foundry.mjs` failed with
  `spawnSync ... node.exe EPERM`. Treat that as environmental, not a gate
  failure; keep `task.mjs run` evidence from the implementer environment as
  authority.

## Recent commit history (last 20)

```text
e92afa9 task-6246861934000001: accept ADR-0003, in-house visual-artifact review capability
b01171e task-035: record approved visual-review strategy (option b) and file follow-ups
6665817 audit results
9c4b4b2 task-022: treat review/worker pings as wait-pattern waste (0.30.3)
b2e9a26 task-049: accept TAP and spec suite banners in test-bootstrap
c43d813 board: file task-049 for test-bootstrap TAP vs spec assertion
44f9c22 task-048: require fix-verification on cold-review re-rounds (0.30.2)
7825dba board: drop 023/036/037, unblock 022, archive done sweep
f767368 task-047: reap provider process trees on cold-review/delegate timeout (0.30.1)
88cb36d task-046: ship speed presets, packet gate, and timeout stack as 0.30.0
7ef927a Release 0.29.0: curated agent-headless model allowlists
89f0120 docs: notices to reporting projects for 0.28.0 and 0.27.0
f05c5bd board: close tasks 042-044
3360239 task-044: make seed restore preflight-then-mutate, reject link-traversing paths; release 0.28.0
1ff5e34 task-043: key detached task-ID namespaces on the worktree, and report an unknown default branch
2e965a8 task-042: scrub repository-local Git variables before installed test runs
e35383c board: archive completed tasks 031-034, 038-041
b2781fd release 0.27.0: adopt upstream packet fixes from installed projects
3268141 receive upstream feedback packets from installed projects
28fa4be release 0.26.0: fixes from the first nightly audit
```

## Frequently-needed commands

```bash
node scripts/validate-foundry.mjs
node scripts/test-bootstrap.mjs
node starter/.agent-foundry/check-skill-sync.mjs starter
node starter/.agents/skills/task-tracker/scripts/task.mjs board
node starter/.agents/skills/task-tracker/scripts/task.mjs show task-6246861934000002
node starter/.agents/skills/task-tracker/scripts/task.mjs next
```

Review packet + cold review (prefer Foundry wrappers):

```bash
node starter/.agent-foundry/review-packet.mjs init .tasks/review-packets/task-NNN-r1 --task-id task-NNN --round 1
node starter/.agent-foundry/review-packet.mjs check .tasks/review-packets/task-NNN-r1
node starter/.agents/skills/task-tracker/scripts/task.mjs run task-NNN -- node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-NNN-r1 --cwd . --axis COMBINED
```

On Windows PowerShell, do **not** chain with `&&` on older hosts; run
commands sequentially. Prefer `Out-File -Encoding utf8` (or Node) when
writing review-packet files — bare `>` can emit UTF-16 and break
`review-packet.mjs check`.

## Common pitfalls

- **`validate-foundry.mjs` will not catch a stale prose count.** It checks
  the file count and shared list it hardcodes; `starter/AGENTS.md.template`'s
  skill table and "N shared workflows" sentence are prose it never reads.
- **`git diff` omits staged work when building a review packet.** Use
  `git diff --binary HEAD` and separately list untracked files with
  `git ls-files --others --exclude-standard`; a new skill's `SKILL.md` is
  untracked and would otherwise be reviewed as if it did not exist.
- **Packet files must be UTF-8.** On Windows PowerShell 5, `>` redirection
  writes UTF-16. Use `Out-File -Encoding utf8` or write via Node.
- **Do not pull lavish-axi into the payload.** Evaluation and ADR forbid
  as-is adoption and the thin wrapper. Rebuild core loop only; borrow
  security *requirements*, not their express/chokidar/parse5 stack.
- **Do not restate SDLC review rules inside the new skill.** Point at
  `docs/SDLC.md` and ADR-0003 for modality placement.
- **Expect the first review round to find real defects on skill text.**
  Restated authority and unhandled Windows/path edges are recurring
  findings; budget for rounds rather than treating round one as a formality.
- **Editing payload source through a tool that processes escapes can corrupt
  it.** Regex literals like `\u001b` in tracker scripts have been mangled
  before; verify with a raw C0/C1 scan when touching escape-heavy code.
