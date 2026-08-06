# Session audit — run 001 findings (2026-08-05 cohort)

Status: complete, executes `task-013`
Plan: `docs/research/session-audit-run-001-plan.md`
Data: 8 Claude Code parent sessions + 12 subagents, repos ai4c /
interra-api-proxy / project-myriad, 2026-08-05 (24.43h calendar window, up to
4 concurrent sessions), 80 commits, 2,769 tool calls, 23.4 MB of transcript.

Method: deterministic reduction (`scripts/session-audit/`) → independent cold
review (byte-identical reproduction) → evidence audit (all 145 evidence
records verified at source offsets; recomputed metrics matched to 0 delta) →
fix cycle → two independent analysts (speed/waste, quality) → this synthesis.
Every top finding was re-verified at its transcript offsets before shipping.
Evidence packets and metrics live outside the repo
(session-audit run-001b output directory); citations here are
session ID + transcript line offsets, resolvable via `discovery.json`.

**Sample caveat on everything below: one day, one provider (Claude Code,
harness 2.1.221), three repos of one operator.** "Recurring" means observed
in ≥2 sessions; it is a candidate pattern, not an established trend.

---

## 1. The speed question

**The agent is not slow because it wastes time.** Measured avoidable waste —
failed calls, retries, re-reads, recovery turns — totals **~9 minutes of
~13.5h of agent-active time (1.1%)**. Of the 105 failed tool calls, 48 were
informative (real test/build/CI failures — the feedback loop working). Cache
behavior is healthy: zero cache-miss stretches, hit ratios 0.976–0.991, zero
compactions.

Where the active time actually goes:

| Bucket | Hours | What it is |
| --- | --- | --- |
| Model latency | 6.36 (+0.66 subagent) | Purely output-token-bound: 14.1–17.7 ms/output-token in every session (~64 tok/s). No slow session exists; 6.36h bought 1.46M parent output tokens. Only lever: emit fewer tokens. |
| Tool execution | 6.28 | ~98% shell. gh CLI (PR/CI) 106m; node/npm gates 62m; task-tracker CLI 56m; deploys/ssh 40m; dotnet 23m; git 21m. |
| Background wait | 2.68 | Waiting on background tasks/agents. |
| Operator-blocking tools | 1.17 | AskUserQuestion / plan approval. |

Operator wait (19.7h unioned) is excluded from analysis per operator
direction; 66% of it is three >4h overnight/absence gaps and it does not
describe the working day.

### Speed findings, ranked by cost

**S1 — The agent blocks inside shell calls waiting on external systems.
1.27h = 20% of all tool execution.** (Recurring: 3+ sessions, both CI repos.)
Explicit `sleep`/poll constructs (59 calls, mean 77s) plus `gh run watch`
holding a tool slot while GitHub Actions runs. Verified: c2dc8481 ln1162
(`sleep 300; gh run list`), 54a4e2d3 ln136 (`gh run watch --interval 20`,
600s timeout). Whether the pipeline itself was the bottleneck is
undetermined (no CI-duration join this run).

**S2 — There is no reliable "wait for background result" primitive, and the
two workarounds are both bad.** (Recurring: 5 sessions, 3 repos.) One
session polled a task output file 27 times (25 of 51 corpus-wide polling
reads returned nothing; 8 were harness-labelled "Wasted call — file
unchanged"); another blocked 23.6m in `until [ -s … ]` loops. Foreground
`sleep` is blocked by the harness *inconsistently* (blocked at 98084e1c
ln336, allowed at c2dc8481 ln1162), so the agent cannot learn the rule.
Verified: 4257d334 ln373/405.

**S3 — Sessions run at ~272k tokens of context per request** (per-session
213k–310k; peak 340k–539k), ~70% of it tool_result payload, across 2,286
requests = 622M cache-read tokens. Cost is volume, not thrash (zero misses).
(Recurring: all 8 sessions.)

**S4 — Delegation: background spawns are genuine wins; synchronous spawns
are losses; prompts drop facts the parent already paid for.** 10 background
spawns overlapped parent work almost entirely (2.81h of 3.11h subagent time
ran in parallel; the two big interra spawns shipped two committed features
with zero file overlap). Both synchronous spawns were net losses (parent
blocked ~100–180s for survey-sized output). The recurring defect: a
"you have seen nothing of this project" prompt caused a subagent to burn 6
failed calls rediscovering `memory/gh-token-invocation.md` — the exact file
its parent had read 3 minutes before spawning it (parent c2dc8481 ln24–27,
subagent agent-add096b5… ln27–38). Candidate-recurring (twice, one session).

**S5 — task-tracker CLI surface is discovered by trial and error in all
three repos.** 9 avoidable failures (`unknown verb: tag/help`, `unknown
flag: --tags`, `illegal transition`) across 4 sessions — the only avoidable
failure class present in every repo. There is no `help` verb. 56.5m of tool
time went through this CLI (296 calls), so its ergonomics are on the hot
path.

**S6 — Edit retry chains cluster in the worktree workflow.** 12 of 14 Edit
failures are in the two `agent-headless` worktree sessions (interra):
read-before-edit state appears keyed to the main-repo path while edits
target the worktree path (verified 54a4e2d3 ln290/291); plus one
retry-without-re-read (ln701/705) and formatter-induced staleness (ln720).
Same workflow, same repo, one day — needs a second day to confirm.

### Context noise (measured; verdict: small)

70% of context is tool output — but of the 80 largest tool outputs across
all sessions (214k tokens), **exactly one was never referenced later**
(upper-bound proxy: string containment). Re-read fraction of file bytes is
~8.8% corpus-wide, and most of that is the background-polling described in
S2, not source re-reading. **No large context-noise win exists in this
data**; per the plan's measure-first rule, no tooling change is proposed.

---

## 2. The quality question

**Verdict: partially substantiated, with the direction inverted.** No
evidence of shipped-defect problems; strong evidence that first-pass quality
is low and the cold-review ladder is absorbing it — plus two holes in review
coverage that are invisible in the record.

What the reviews caught on this one day (all real, all fixed pre-merge): an
int overflow silently serving page one; an enum allow-list accepting corrupt
numeric values; rebuild runs posing as successful provider pulls; an
unbounded read collapsing to a full-table scan; a metric denominator that
would have driven a wrong product decision; a prompt defect judging all four
verticals against sales' criteria. Validation claims were honest in every
checked case: no "tests pass" assertion lacked a preceding recorded run.

Next-day fixup rate was 0/80 but is **uninformative** — the 08-06 morning
was bookkeeping-only; nothing had the chance to be fixed up. Same-day signal:
ai4c's 46% same-day revision rate vs 0% in the other repos measures commit
granularity (ai4c commits per review round; interra squashes; myriad commits
once), not quality difference.

### Quality findings, ranked by risk

**Q1 — A review bypass with a compliant-looking audit trail.** ai4c
task-721 (`984faf2b`, 8 files, 78 deletions): zero review passes, no rubric,
and all four board lifecycle transitions recorded in the same second
(23:17:36Z) after the work was done. The record reads compliant; the process
did not occur. Verified: task log + absence of any `agent-headless` call in
d48c966f L863→L1322. One-off, but it defeats the mechanism everything else
depends on.

**Q2 — Implementer-written tests pass vacuously; only cold review catches
it.** (Recurring: 4 instances, 3 repos.) An untested non-flagship code path
whose deletion kept every test green (`0669e1c7`); per-vertical tests
checking one door so dropping doors 2–4 passed (`a51c0a83`); a page test
proving compile, not render (`84806ebe`); seeded data all inside the
24h window making the window filter deletable without a failure (interra
task-…003 log 23:34:52Z). First-pass quality is low; quality is therefore
proportional to review coverage — which Q1/Q3 show has holes.

**Q3 — The review-state loophole.** ai4c task-715 (`328a06f5`, 23 files): a
task parked in `review` for a copy proposal absorbed the full change on
operator approval and exited `review → done` without the code ever getting a
pass. Low-risk content this time; structural hole regardless.

**Q4 — Reviews hit the 3-round cap with findings still open.** (Recurring:
all 3 repos — ai4c task-718, interra `3f277ccd`, myriad `2b00fc2f`.) When
the final round still finds defects, the residual defect count is unknown by
construction.

**Q5 — ADRs accepted at or after the code they govern.** (Repo-level
pattern: myriad ×2 — ADR 0014 shipped `proposed` inside the implementation
commit, accepted 2.5h later; ADR 0012 flipped `proposed → accepted` in the
implementation commit itself.) SDLC requires acceptance before
`in_progress`.

Supporting observation: the board state machine is bookkeeping, not a gate —
13 of the day's tasks chained ≥2 lifecycle transitions within one second
(7 ai4c, 6 interra, 0 myriad). Mostly benign; Q1 is the degenerate case.

Churn autopsy: none of the top churn cases (including 32 edits to one file)
is error-thrash — all are authoring phases or review-driven repair mapping
1:1 to named findings.

---

## 3. Synthesis: the speed complaint and the quality concern are the same fact

The dominant consumer of agent time is not waste — it is **volume**: 1.53M
output tokens and a 3-round × 2-axis cold-review ladder per task. That same
ladder is what stands between the demonstrably weak first pass (Q2) and the
operator. The day's evidence says the process is buying real quality with
real time. Three consequences:

1. **Cutting review to go faster is contraindicated by this data.** The
   first pass ships real defects; review catches them. The cheap speed wins
   are elsewhere (S1, S2, S4, S5).
2. **The durable speed lever is raising first-pass quality**, so review
   converges in fewer rounds (Q4 shows it currently hits the cap). Every
   round avoided saves model latency, review tool time, and rework tokens.
3. **The urgent quality work is closing the coverage holes (Q1, Q3), not
   improving the reviews themselves** — the reviews are good; the guarantee
   that they happen is not.

## 4. Hypotheses handed to the retrospective

Per the POC doc, the audit does not edit Foundry guidance; these go to the
existing retrospective/board process as candidates:

- H1 (S1/S2): a sanctioned background-wait pattern for CI/deploy/agent
  results (poll cadence, or harness `Monitor`-style primitive) instead of
  blocked shells and empty-file polling.
- H2 (S4): delegation prompts should carry session-learned environment facts
  (auth invocations, repo slugs, memory-file pointers) — "assume nothing"
  prompts discard paid-for knowledge.
- H3 (S5): `task.mjs` needs a `help` verb / discoverable surface.
- H4 (S6): worktree read-before-edit path mismatch in the `agent-headless`
  flow — reproduce, then fix path canonicalization.
- H5 (Q1/Q3): board transitions to `done` should require recorded review
  evidence for code changes (and re-entry into `review` when code lands on a
  task already parked there).
- H6 (Q2): execute-task guidance: an explicit oracle-vacuity self-check
  ("which change would this test fail to catch?") before requesting review.
- H7 (Q5): enforce ADR acceptance before `in_progress` when a task declares
  an architecture decision.
- H8 (S3): investigate ending long sessions earlier / splitting work — the
  quarter-million-token per-request payload is the price of session length,
  not of any defect.

## 5. What this run could not determine

- Whether CI/deploy waits exceeded pipeline duration (no CI-duration join).
- Whether 1.53M output tokens is high (no tokens-per-shipped-commit
  baseline).
- Reasoning-effort vs latency (effort not recorded per-request).
- Post-compaction behavior (zero compactions occurred — untested, not
  disproven).
- Whether S6 (worktree edits) and S4's fact-dropping recur beyond one
  day/repo.
- Defect escape rate (no staging/production evidence in window).
- Anything about Codex sessions (out of scope this run).

## 6. Recommendation

**Adopt.** The machinery met its acceptance criteria (deterministic,
reproducible, offset-verified, ≥99:1 evidence reduction, secrets clean, and
it rediscovered known friction unprompted). Run 002 should widen the window
(multi-day, post-upgrade only), add the CI-duration join, and optionally the
Codex adapter for cross-harness comparison. The 08-05 baseline numbers worth
tracking across runs: avoidable-waste fraction (1.1%), ms/output-token
(15.7), review rounds per task (cap-hit rate), first-pass defect classes
caught in review (4 vacuous-oracle instances), and blocked-wait share of
tool execution (20%).
