# HANDOFF — Agent Foundry, 2026-08-11

You are picking up the Agent Foundry bootstrap kit itself (not a project that
installed it). The visual-review front is **complete and merged**. The board is
empty. Every gate passes at **0.32.0**.

---

## TL;DR

Two capabilities landed and were reconciled into one release line:

- **`visual-review`** (this front): a zero-dependency loopback server that
  serves one HTML artifact for operator annotation in a browser and delivers
  the feedback to the agent through a long-poll endpoint. Decision records:
  ADR-0003 (build it in house, core loop only) and ADR-0004 (one-click choice
  annotations).
- **`browser-use`** (from `codex/task-051-050`, merged in): evidence-driven
  testing of a local web app through the browser-use CLI.

Both branches independently claimed the sixteenth skill slot and version
0.31.0. Resolved so `browser-use` keeps 0.31.0 and `visual-review` ships as
0.32.0, with every count reconciled to **seventeen shared skills**.

## Where to start

The board is empty, so there is no queued work. Confirm the tree is green:

```bash
node scripts/validate-foundry.mjs
node scripts/test-bootstrap.mjs
node starter/.agent-foundry/check-skill-sync.mjs starter
node starter/.agents/skills/task-tracker/scripts/task.mjs board
```

If you are planning the next front, use `plan-milestone` and get operator
approval before filing tasks.

## What visual-review is, in one paragraph

`node .claude/skills/visual-review/scripts/visual-review.mjs serve page.html`
prints a `127.0.0.1` URL. The operator opens it, clicks elements or selects
text, and comments; the agent receives annotations through
`poll --url ... --after <seq>`. `fs.watch` reloads the operator's page when the
agent edits the artifact. Options marked `data-vr-choice` send in one click
with no typing. It is an **operator feedback loop during implementation** —
never a rung of the cold-review ladder. `starter/docs/SDLC.md` still owns the
review model.

## Non-obvious things a cold reader will not infer

**The polling discipline is load-bearing and machine-enforced.** An agent that
prints the URL and stops leaves the operator annotating into a queue nobody
reads — this happened in real use. `scripts/validate-foundry.mjs` now asserts
the instruction's anchor sentences in both trees, so deleting them fails the
build. Do not "tidy" that prose away.

**Artifact-directory confinement depends on a pinned root.** `resolveStatic`
takes a root the caller has already resolved once at startup. An earlier
version re-resolved it per request, which meant replacing the artifact
*directory* with a link moved the boundary along with the target. If you
refactor that function, keep the pinned-root contract — there is a test named
"refuses reads after the artifact directory itself becomes a link out" that
fails against the old behavior.

**A `choice` annotation proves the artifact reported a click, not that a human
made one.** Only the artifact frame may post messages, but that frame is
untrusted markup and can self-report; a parent cannot observe a click inside a
sandboxed cross-origin iframe. Every annotation is feedback to weigh, never an
instruction. This is stated in the skill and is the reason ADR-0004's
constraint holds.

**The shell page has real tests.** Its browser-side behavior is executed by a
zero-dependency DOM shim in `visual-review.test.mjs`, not asserted by grepping
the generated HTML. If you change the shell script, those tests exercise it.

**Adding a skill touches many count-bearing places.** The hardcoded per-harness
count and shared-skill list in `scripts/validate-foundry.mjs`, the assertion in
`scripts/test-bootstrap.mjs`, and prose counts in `CLAUDE.md`, `README.md`,
`AGENTS.md`, `starter/AGENTS.md.template`, and both skill-tree `README.md`
tables. `validate-foundry.mjs` does not read that prose.

## Known residual risk

The final round of fixes on `task-6246861934000004` (pinned root, DOM shim
tests) shipped without their own cold review, because the protocol caps at
three rounds. Each is covered by a red-capable test and the root change is a
strict narrowing of an existing check. Recorded on that task's log.

## Validation state

- `node scripts/validate-foundry.mjs` — PASS
- `node scripts/test-bootstrap.mjs` — PASS, installs 0.32.0 into a clean project
- `node starter/.agent-foundry/check-skill-sync.mjs starter` — PASS (17 skills)
- `visual-review.test.mjs` — 49/49 in both harness trees

## Decisions on record

| Record | Says |
| --- | --- |
| `docs/adr/0003-in-house-visual-artifact-review.md` | Build the core loop in house; no whiteboard, layout audit, sharing, telemetry, or runtime playbooks |
| `docs/adr/0004-one-click-choice-annotations.md` | Extend the annotation UI with an opt-in `data-vr-choice` marker |
| `docs/research/visual-artifact-review-strategy-2026-08-11.md` | Why option (b) beat forking or wrapping lavish-axi |
| `docs/research/skills-repo-evaluations-2026-08-08.md` | Why lavish-axi must not be adopted as-is |
