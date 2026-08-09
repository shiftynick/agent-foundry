# Nightly audit method

Read this file completely before you extract findings.

## Entry schema

One JSON object per review finding or clean round. Keep the day's entries in
a scratch file outside Git; the report carries only counts and citations.

```json
{
  "axis": "SPEC | STANDARDS | SPEC+STANDARDS | unknown",
  "round": 1,
  "task": "task-NNN",
  "repo": "<repository name>",
  "provider": "<provider/model recorded in the log, or unknown>",
  "citation": "<task-log path>:<line> (or <transcript file>:<offset>)",
  "gist": "<1-2 sentences; short quote fragments only>",
  "adjudication": "accepted | rejected | partially accepted | unknown",
  "resultingChange": "<what changed, or none>",
  "class": "<one taxonomy class below>"
}
```

Rules:

- Every entry cites the exact line that evidences it, and only transcript
  or log entries timestamped inside the audit day are counted.
- A batch log line is exploded into per-member entries when the day is small
  enough; otherwise it becomes one entry counted as a floor. Say which was
  done.
- A clean round (an axis returning PASS with a full CHECKED section) is an
  entry with class `clean-round`. Clean rounds are the denominator; record
  them.

## Taxonomy

Merged classes from docs/research/review-findings-audit-001.md (291-entry
corpus, 2026-08-05..08). Use the closest class; add a new one only when none
fits, and mark it new.

| Class | Covers |
| --- | --- |
| `vacuous-oracle` | verification that cannot fail: decoy-passable gates, presence-only checks, probes that always exit 0, tests asserting a subset of required behavior |
| `security-boundary` | real product defects: auth gaps, TOCTOU, races, injection, credential confinement, overflow |
| `weak-validation` | fail-open paths, silent failures, unvalidated input shapes, swallowed errors |
| `evidence-gap` | gates recorded before the final edit, promised-not-recorded commands, stale or unverifiable evidence |
| `missing-test` | a changed path with no executed coverage |
| `missing-semantics` | undefined lifecycle, identity, concurrency, or metric semantics; rubric lines that are not checkable |
| `doc-contradiction` | documents disagreeing with code or each other; staleness |
| `packet-defect` | false findings caused by the review packet: stale file lists, omitted evidence, encoding corruption, reviewer information gaps |
| `overclaim` | claims without recorded support; paraphrase drift; incomplete disclosure |
| `fix-defect` | defects introduced by review-round fixes; fixes claimed but not applied |
| `relitigation` | findings re-raising a recorded, adjudicated decision |
| `review-harness-failure` | aborted or malformed review dispatches: budget caps, protocol violations, interrupted axes |
| `clean-round` | an axis that returned PASS with full CHECKED coverage |

## Preventable classes

`packet-defect`, `evidence-gap`, and `fix-defect` are mechanically
preventable; the 0.25.0 payload's `execute-task` and
`references/cold-review.md` carry the rules. Their target rate is zero —
each occurrence names the rule that did not hold and the payload version the
repo runs, which is a stronger signal than the count.

## Waste events

Session-behavior observations, distinct from review findings. Record each
with a citation and a rough time cost:

| Event | Covers |
| --- | --- |
| `wasted-call` | a tool call that produced nothing and was retried or abandoned (bad quoting, wrong path, misuse) |
| `harness-retry` | shell metacharacter failures, argument truncation, EPERM, malformed provider output, killed dispatches |
| `blocked-wait` | waiting on reviews, CI, or background work with nothing overlapped into the wait |
| `circling` | repeated reads or attempts on the same problem without new information |
| `redone-work` | work done twice because evidence, state, or a decision was not durable |
| `dead-end` | an approach abandoned after real investment |
| `env-setup-miss` | avoidable setup failure (missing install, stale worktree state) |

## Dashboard metrics

The five numbers tracked day over day, per repo:

1. **Sessions and active durations** — from transcript first/last
   timestamps, minus obvious idle gaps.
2. **Work units completed** — tasks moved to done, or milestones hit.
3. **Review rounds per completed task** — dispatched full rounds (delta
   checks noted separately) divided by tasks completed.
4. **Preventable-class occurrences** — `packet-defect` + `evidence-gap` +
   `fix-defect` entry counts. Target zero; name the payload version.
5. **Waste events** — count from the table above, with total rough time
   lost.

Judge deltas against prior reports' numbers, not an absolute target.
