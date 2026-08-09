---
name: nightly-audit
description: >-
  Foundry-repo-local skill (not part of the installed payload). Examine one
  day's agent runs — Claude and Codex — across the operator's repositories
  that use Agent Foundry, to find what worked and what did not: review
  findings by class, wasted rounds, packet defects, friction, run outcomes.
  Produces a dated cross-repo report with deltas against prior audits and
  explicit adopt/revise/stop candidates for the Foundry payload. Use when the
  user says "nightly audit", "audit today's runs", "how did the agents do
  today", or on a nightly cadence.
---

# Nightly Audit (foundry-local)

One day of agent work across the installed repos leaves a durable trail:
task logs, review rounds, adjudications, recorded runs, and friction notes.
This skill reads that trail for one day and reports what is working and what
is not, so the next day's Claude and Codex sessions are cheaper and better.
It never edits skills or standards itself. It files tasks on this repo's
board (candidate payload changes), or hands recurring patterns to the
payload's `retrospective` loop in the affected repo.

## Scope

- **Day-scoped.** Audit exactly one operator-local calendar day (default:
  today). When the operator names a range, produce one report per day.
- **Cross-repo.** Default repo set — confirm with the operator and extend as
  repos are added (this repo itself is not audited):
  - `N:\ai4c`
  - `N:\interra-api-proxy`
  - `N:\project-myriad`
  - `N:\synoptic`
- **Both harnesses.** Attribute findings to the provider and model recorded
  in the log, not to an assumption.
- **Read-only outside this repo.** Never modify a target repo. The report
  and any filed tasks live here.

## Sources, in order

1. **Session transcripts — the primary source.** Read the day's complete
   Claude Code and Codex sessions for each audited repo, from the harness
   session stores in the user profile:
   - Claude Code: `C:\Users\shift\.claude\projects\<encoded-repo-dir>\`
     (`*.jsonl` parent sessions plus their `subagents\` transcripts; a
     session is in the day when its first timestamped record falls inside
     the audit day).
   - Codex CLI: `C:\Users\shift\.codex\sessions\<YYYY>\<MM>\<DD>\` — the
     date tree makes day selection direct; match sessions to a repo by the
     cwd recorded inside each session file.

   Transcripts show what actually happened — wasted calls, blocked waits,
   retries, review dispatches and their raw findings, harness errors, dead
   ends the task log never mentions. Transcripts are large: grep for
   markers, read surrounding lines, stay surgical. Parallel read-only
   subagents (one per repo) work well here. Never copy transcript content
   into the report or into Git; cite file and line offset.
2. **Task logs** (each repo's `.tasks/tasks/` and `.tasks/archive/`): the
   durable record of adjudications, recorded runs, and friction notes. Use
   them to corroborate what the transcripts show and to carry citations a
   reader can resolve without transcript access. Count only entries dated
   inside the audit day.
3. **Lead-finder (optional).** Each installed repo ships
   `.agents/skills/retrospective/scripts/process-signals.mjs`. Its `--since`
   flag selects task files by their latest timestamp and then emits that
   file's historical signals without dates — so its output is a lead list,
   never a count. Use it to find tasks worth reading; take every number from
   the dated transcript or log entries themselves.

## Extraction

Record one entry per review finding, and one entry per clean round, in the
shape defined in `references/method.md`. Every entry cites a task-log line
(or transcript offset). A claim without a citation does not enter the
report. When a log line reports a batch ("SPEC 4 + STANDARDS 8 findings"),
explode it into per-member entries when the day is small enough; otherwise
record the batch as one entry, cite the line, and count it as a floor —
and say which was done.

Classify each entry with the taxonomy in `references/method.md`. Add a new
class only when no listed class fits, and mark it as new.

Also record, per reviewed task: rounds used, cap hits, findings rejected in
adjudication and why, and whether any round was spent on a packet defect, a
stale-evidence defect, or a fix that was claimed but not applied — these
three classes are preventable, the 0.25.0 payload rules target them, and
their target rate is zero.

## Report

Write `docs/research/run-audits/YYYY-MM-DD.md` in this repo. Keep it short.
Sections:

1. **Runs observed** — per repo: tasks touched, review rounds, providers and
   models used, gates recorded.
2. **What worked** — name it plainly; a clean round earned by a warm
   self-pass is a result, not an absence.
3. **What did not** — finding entries by class with counts and one exemplar
   citation each; wasted rounds and their cause; friction notes.
4. **Deltas** — compare class counts and rounds-per-task against the most
   recent prior report in `docs/research/run-audits/`. First run: state
   there is no baseline. Track the preventable-class rate against the
   payload version each repo runs (a 0.25.0+ repo should trend to zero).
5. **Candidates** — for each recurring class, one explicit line: adopt
   (file a task on this repo's board naming the exact payload skill,
   standard, or gate to change), revise (existing guidance covers it; name
   it), or stop (review is the correct net). "No change earned today" is a
   valid and common outcome. Do not manufacture candidates because the audit
   ran.

The report carries citations, counts, and verdicts — never transcript
content, secrets, or pasted diffs.

## Acting on it

- File one task per adopt candidate on this repo's board.
- When the same class recurs across three or more reports, that is
  `retrospective`-grade evidence — cite the reports in the filed task.
- When the audit runs as a board task, record each command-expressible step:

  ```bash
  node starter/.agents/skills/task-tracker/scripts/task.mjs run task-NNN -- <exact command>
  ```

## Related

- `references/method.md` — entry schema and taxonomy (required reading
  before extraction)
- `docs/research/review-findings-audit-001.md` — the corpus study this
  skill operationalizes
- `starter/.agents/skills/retrospective/` — the payload's cadence-based
  pattern-to-edit loop (installed repos run their own copy)
