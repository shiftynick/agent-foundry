---
name: nightly-audit
description: >-
  Foundry-repo-local skill (not part of the installed payload). Diagnose one
  day's agent sessions — Claude and Codex — across the operator's
  repositories: how the agents actually worked, what wasted time or tokens,
  what converged fast, with review outcomes as one signal among several.
  Produces a dated cross-repo report built on a five-metric dashboard with
  deltas against prior audits and advisory adopt/revise/stop candidates.
  Use when the user says "nightly audit", "audit today's runs", "how did the
  agents do today", or on a nightly cadence.
---

# Nightly Audit (foundry-local)

One day of agent work leaves a complete trail: session transcripts, task
logs, review rounds, recorded runs. This skill reads that trail for one day
and diagnoses the sessions themselves — so the next day's Claude and Codex
sessions are cheaper and better. The headline is **session behavior**: what
the agents did well, where they circled, waited, retried, over-read, or took
a wrong first approach. Review findings are one signal inside that
diagnosis, not the subject. The skill never edits anything; it files tasks
on this repo's board and phrases everything else as suggestions.

## Scope

- **Day-scoped.** Audit exactly one operator-local calendar day (default:
  today). When the operator names a range, produce one report per day.
- **Focus repos — always full depth:**
  - `N:\ai4c`
  - `N:\interra-api-proxy`
  - `N:\project-myriad`
- **Threshold repos — audited only when a session there was substantial**
  (default gate: transcript over 1 MB or active span over 30 minutes;
  tunable by the operator):
  - `N:\synoptic`
  - `N:\aigent-place`
- This repo (`N:\agent-foundry`) is not audited. Confirm the repo lists
  with the operator as projects come and go.
- **Both harnesses.** Attribute behavior to the provider and model recorded
  in the session, not to an assumption.
- **Read-only outside this repo.** Never modify a target repo.

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
     cwd recorded inside each session file. A session that started the
     previous day can carry today's work; when a repo's task logs cite
     today's activity that no indexed transcript shows, look one day back
     and say so in the report.

   Transcripts show what actually happened — wasted calls, blocked waits,
   retries, review dispatches and their raw findings, harness errors, dead
   ends the task log never mentions. Transcripts are large: build a
   deterministic marker index first (grep for review markers, task.mjs
   calls, error and wait markers, friction notes), then read only line
   windows around hits. Parallel read-only subagents (one per repo with
   material) work well. Never copy transcript content into the report or
   into Git; cite file and line offset.
2. **Task logs** (each repo's `.tasks/tasks/` and `.tasks/archive/`): the
   durable record of adjudications, recorded runs, and friction notes. Use
   them to corroborate the transcripts and to carry citations a reader can
   resolve without transcript access. Count only entries dated inside the
   audit day.
3. **Lead-finder (optional).** Each installed repo ships
   `.claude/skills/retrospective/scripts/process-signals.mjs`. Its `--since`
   flag selects task files by their latest timestamp and then emits that
   file's historical signals without dates — so its output is a lead list,
   never a count. Take every number from dated transcript or log entries.

## What to hunt

Session behavior first — for each session, answer: what did it set out to
do, what did it complete, and where did time or tokens go that produced
nothing? Concretely:

- **Waste events**: wasted or repeated tool calls, re-reading, circling on
  a wrong approach, redone work, dead ends, harness errors and retries
  (shell metacharacter failures, EPERM, malformed outputs), blocked waits
  with nothing overlapped into them.
- **Convergence quality**: warm self-passes that kept review rounds short,
  clean rounds earned, delta reviews closing in minutes, effective
  delegation and parallel dispatch — name what worked as plainly as what
  did not.
- **Review findings as a signal**: classify per
  `references/method.md`, with the preventable classes (packet-defect,
  evidence-gap, fix-defect) called out against the payload version the repo
  runs — 0.25.0+ carries rules targeting each.
- **Fit signals**: prompt or context gaps, task sizing, model/provider
  mismatches — anything where a different operator choice would have made
  the session cheaper or better.

## Report

Write `docs/research/run-audits/YYYY-MM-DD.md` in this repo. The spine is
the dashboard; keep prose short and evidence-backed.

1. **Dashboard** — per audited repo, the five tracked metrics, with deltas
   against the most recent prior report (first run: state there is no
   baseline):
   1. sessions and their active durations;
   2. work units completed (tasks done or milestones hit);
   3. review rounds per completed task;
   4. preventable-class occurrences (packet-defect / evidence-gap /
      fix-defect — target zero);
   5. waste events, with rough time lost.

   Plus two narrative lines per repo: **biggest waste of the day** and
   **best practice of the day**.
2. **Session notes** — per session: provider/model, what it worked on,
   outcome, and the behavior observations behind the dashboard numbers,
   each with a citation.
3. **Findings by class** — counts with one exemplar citation each; state
   whether batch entries were exploded or floored.
4. **Candidates** — each an explicit adopt / revise / stop line, addressed
   to one of three targets:
   - **payload** — file a task on this repo's board naming the exact skill,
     standard, or gate to change;
   - **operator habits** — a suggestion about prompting, task sizing,
     delegation, or model choice; suggestions only, never tasks;
   - **repo practice** — a suggestion for one repo's own docs, config, or
     gates; phrased for the operator to carry, never filed there.

   "No change earned today" is a valid and common outcome. Do not
   manufacture candidates because the audit ran.

The report carries citations, counts, and verdicts — never transcript
content, secrets, or pasted diffs.

## Acting on it

- File one task per payload adopt-candidate on this repo's board.
- When the same pattern recurs across three or more reports, cite the
  reports in the filed task — that is retrospective-grade evidence.
- This skill runs manually for now. Revisit scheduling once the report
  format has held stable for several runs.
- When the audit runs as a board task, record each command-expressible
  step:

  ```bash
  node starter/.claude/skills/task-tracker/scripts/task.mjs run task-NNN -- <exact command>
  ```

## Related

- `references/method.md` — entry schema, taxonomy, and metric definitions
  (required reading before extraction)
- `docs/research/review-findings-audit-001.md` — the corpus study behind
  the review-findings taxonomy
- `starter/.claude/skills/retrospective/` — the payload's cadence-based
  pattern-to-edit loop (installed repos run their own copy)
