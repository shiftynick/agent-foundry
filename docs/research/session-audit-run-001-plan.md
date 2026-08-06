# Session audit — run 001 plan (2026-08-05 cohort)

Status: planned, executes `task-013`
Parent design: `docs/research/session-audit-poc.md`

## Why now

The POC doc's revisit threshold is met: ai4c, interra-api-proxy, and
project-myriad were re-installed to the current Foundry generation on
2026-08-05 ~02:00 UTC and have been in daily substantive use since. A
single-day window of 2026-08-05 sits entirely inside the post-upgrade cohort,
so no version confound has to be controlled for on the first run.

## Operator questions, in priority order

1. **Speed.** Development feels slow. Where does wall-clock time actually go —
   model inference, tool execution (tests, builds), waiting on the operator,
   or waste (re-orientation, retries, duplicated exploration)?
2. **Code quality.** Is the resulting code sound? Are reviews catching real
   defects, are tests verifying rather than confirming, is rework churn
   happening inside sessions?
3. **Context noise** (secondary this run). How much of each session's context
   window is tool-call output and file-read content that never influenced a
   later decision? If the fraction is large, tooling changes to reduce it are
   candidate wins — measure first, propose later.

## Scope

- **Provider:** Claude Code only. Codex deferred to a later run.
- **Repos:** N:\ai4c, N:\interra-api-proxy, N:\project-myriad.
- **Window:** parent sessions whose *first record* timestamp falls on
  2026-08-05 (operator-local day). Selection reads the first line of each
  candidate file — file mtime is not trusted, because resumed sessions carry a
  later mtime than their start. Sidechain/subagent transcripts belonging to a
  selected parent are included and attributed to that parent, never counted as
  independent sessions.
- Expected corpus: roughly 5–8 parent sessions plus their subagents, order of
  10–20 MB.

## Tooling: a durable reducer, not a throwaway

The deterministic stage becomes a maintained tool at
`scripts/session-audit/` in this repository (operator-side tooling, like
`validate-foundry.mjs` — **not** payload, so no dual-tree mirroring and no
installation into target projects). Conventions:

- Zero-dep Node 20+, cross-platform, no `.ps1`.
- Streams JSONL line-by-line; never loads a whole transcript into memory.
- Ships with a `*.test.mjs` exercised against a small synthetic fixture
  checked into `scripts/session-audit/fixtures/` (synthetic records only —
  no real transcript content enters Git).
- All derived output (metrics, evidence packets, caches) is written outside
  the repository, under a run directory the operator names; `.gitignore`
  guards against accidents.
- Invocation is explicit and parameterized: `--provider claude --repos ...
  --from 2026-08-05 --to 2026-08-05 --out <dir>`. Report-only; original
  session files are never modified.

Proposed shape:

```
scripts/session-audit/
  discover.mjs      # select sessions by provider/repo/date, first-record check
  reduce.mjs        # stream + emit per-session metrics and evidence packets
  correlate.mjs     # join metrics with git log and .tasks board state
  _lib.mjs          # shared record adapter (Claude schema, version-aware)
  _lib.test.mjs     # synthetic-fixture tests
```

## Stage 1 — deterministic reduction (no LLM)

Per session, per repo, and aggregate:

**Speed / time accounting**
- Wall-clock per user turn; session span vs. active span.
- Gap classification: model latency (assistant record cadence), tool
  execution (assistant `tool_use` timestamp → matching `tool_result`
  timestamp), operator wait (last assistant output → next user prompt).
- Longest-running tool calls (test suites, builds) named explicitly.

**Waste**
- Repeated file reads and repeated commands with no intervening edit.
- Re-orientation after compaction (summary followed by re-reading the same
  files).
- Failed tool calls and retry chains.
- Cache economics: cache-read vs. cache-creation tokens; cache-miss stretches.

**Delegation**
- Subagent count, tokens, wall-clock; overlap between delegated exploration
  and files the parent had already read.

**Rework**
- Same-file edit churn within a session; edits reverted or re-edited after
  review feedback.

**Context composition (the noise question)**
- Per session: total context growth attributed to tool results vs.
  conversation, using both (a) approximate token counts of `tool_result`
  payloads and (b) `input_tokens` deltas between consecutive assistant turns.
- Top-N largest tool outputs per session, with whether any later turn
  referenced them (crude proxy: filename/symbol reuse in later assistant
  text or tool calls).
- Fraction of file-read bytes re-read later in the same session.

Output: one `metrics.json` per session, an aggregate `summary.json`, and
bounded, redacted evidence packets (fixed per-signal size cap, source offsets
retained) only for candidate signals. Secrets and environment values are
stripped before anything reaches a model.

## Stage 2 — correlation with ground truth

Transcript metrics alone cannot establish speed *or* quality (POC doc rule).
For 2026-08-05 in each repo, join against:

- `git log` — commits produced, files touched, later fixups/reverts of that
  day's commits (including on 08-06).
- `.tasks/` board — task state transitions and log entries for the day.
- Validation evidence recorded in task logs (test runs, review passes).

A slow stretch that shipped a completed, validated task is not a finding. A
fast stretch whose commit needed a fixup the next morning is.

## Stage 3 — targeted model analysis (quality)

Only after Stages 1–2, and only on evidence packets:

- For each commit of the day, read the transcript stretch that produced it:
  were tests written to verify behavior or to pass? Did review passes engage
  or rubber-stamp? Were ADR-worthy decisions made inline without the ADR
  process? Did implementation drift from the task's stated acceptance?
- Independent agents get small, non-overlapping packet clusters; synthesis
  and acceptance stay with the primary agent. No worker receives a raw
  transcript.

## Verification gate

Before any finding is written down: re-open its source offset in the original
transcript and confirm the evidence supports the claim. Findings without
provider + session ID + timestamp + offset do not ship. A sample of
Stage 1 mechanical detections is also hand-verified against raw records.

## Deliverables

1. `scripts/session-audit/` tooling with tests (committed).
2. `docs/research/session-audit-run-001-findings.md` — findings with
   evidence citations, split into: speed, quality, context noise; each with
   an explicit confidence level and the single-day-sample caveat.
3. `task-013` status/log updated; the run either validates the machinery for
   a wider-window run 002 or records why it should stop.
4. Confirmed *repeated* patterns feed the existing retrospective skill; the
   audit does not edit Foundry guidance directly (POC doc rule).

## Acceptance for run 001

- Discovers exactly the 2026-08-05 parent sessions (first-record check), no
  unrelated repos, no double-counted subagents.
- Emits useful mechanical metrics with zero LLM calls.
- Evidence packets respect the size cap and ≥100:1 reduction.
- Rediscovers at least one inefficiency the operator already suspects,
  without being told where.
- At least one speed finding and one quality observation survive the
  verification gate, or the report explicitly states none did.
- No transcript content, secret, or derived cache enters Git.

## Non-goals this run

- Codex adapter, cross-harness comparison, multi-day trends.
- Tooling changes to reduce context noise (measure only; proposals go to the
  board as candidate tasks).
- Any automatic or scheduled re-run; each run is an explicit invocation.
