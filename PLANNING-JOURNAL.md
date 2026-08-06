# Planning journal

## 2026-08-04 — operator-interface

**Goal:** Give the operator a brief, understandable view of both agent
communication and real project direction.

**Done when:** Human-facing agent messages are concise and translate technical
evidence; a short status command and one-screen HTML overview reliably answer
where the project is going, what changed, what is happening next, what needs
the operator, and how current the evidence is.

Approved front:

1. `task-7846468488000001` — make operator communication brief and
   understandable.
2. `task-7846468488000002` — generate a trustworthy project status summary.
3. `task-7846468488000003` — render the operator project overview; depends on
   the status summary.

Assumptions:

- Technical task logs and cold-review records remain detailed; chat is their
  human-facing translation.
- Existing board, planning, ADR, validation, and Git state remain authoritative.
- The status tools label missing or old information instead of inventing it.

Out of scope: replacing the board or handoff, an always-running web service,
LLM-written status prose, and editing project state from the overview.

## 2026-08-06 — retrospective (first)

**Window:** first retrospective for this repository. Evidence is not the board
archive but session-audit run-001 — Claude Code transcripts for 2026-08-05
across the three installed projects (ai4c, interra-api-proxy, project-myriad):
8 parent sessions, 12 subagents, 80 commits, 2,769 tool calls. Findings:
`docs/research/session-audit-run-001-findings.md`.

**Note on the source.** This retro mined transcripts because the
`friction:` note convention produced almost nothing to mine — the projects
record task logs well but rarely flag process friction in the moment. That is
itself the finding behind the watch item on evidence supply below.

**Patterns confirmed (4 corrections filed, cap is 5):**

1. `task-019` (p1) — board transitions recorded as bookkeeping, not gates:
   two tasks reached `done` without the prescribed cold review, one by
   replaying the whole lifecycle in a single second after the fact, plus 13
   tasks chaining transitions within one second. Governing document:
   `starter/docs/SDLC.md`.
2. `task-020` (p2) — implementer-written tests pass vacuously; cold review,
   not the implementer, catches it. Four occurrences, three repositories.
   Governing document: `execute-task`.
3. `task-021` (p3) — `task.mjs` verb surface discovered by trial and error;
   nine failed calls across all three repositories. `help` is not a verb
   though bare invocation already prints usage. Governing document: the
   `task-tracker` script.
4. `task-022` (p2) — **missing rule**: nothing governs how an agent waits on
   CI, a deploy, or a background agent. 1.27h of blocked tool time, 20% of
   all tool execution; the alternative strategy (polling an output file) was
   no better. Candidate home: `efficient-orchestration`.

**Watched (below the three-occurrence bar; next retro checks whether they
matured):**

- Delegation prompts written as "assume nothing" discard environment facts
  the parent already paid to learn — a subagent burned six failed calls
  rediscovering a memory file its parent had read three minutes earlier.
  2 occurrences, 1 session, 1 repo.
- Worktree read-before-edit path mismatch in the `agent-headless` flow —
  12 of 14 Edit failures, but 2 sessions in 1 repo on 1 day.
- ADRs accepted at or after the code they govern. 2 occurrences,
  project-myriad only.
- Sessions running at ~272k tokens of context per request. Present in all 8
  sessions, but no governing document, no baseline, and no correction
  expressible as a small edit — an observation, not yet a finding.
- Thin `friction:` supply. The convention exists and is barely used, which
  makes every future retro dependent on transcript mining. Watch whether the
  four corrections above change the rate.

**Pruned:** nothing. This is the first retrospective, so no previously added
guidance exists to test against its own "has it fired?" standard. Recorded
explicitly because a retro that only adds is doing half the job — the next
one must prune, starting with the four corrections above.

**Result worth stating plainly:** the day's evidence did *not* support the
operator's leading hypothesis. Avoidable agent waste was 1.1% of active
time; the cost is volume (1.53M output tokens and a 3-round review ladder),
and that ladder is what stands between a demonstrably weak first pass and
shipped defects. Cutting review to go faster is contraindicated by this
data.

**Follow-on:** `task-023` — run 002 over a multi-day window with a
CI-duration join, to settle the watch list and answer the open question
blocking `task-022`.
