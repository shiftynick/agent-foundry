# Cross-harness session audit POC

Status: deferred research backing `task-013`

## Decision

Wait before evaluating current Agent Foundry behavior. Build the proof of
concept only after the revisit threshold below is met. Historical sessions may
be used to develop and validate parsers, but they must not be presented as
evidence about a newer Foundry release.

The proposed capability is an opt-in, local, report-only audit of session data
written by Codex and Claude. It would reduce raw histories deterministically,
then use agents only on small evidence packets to find repeated sources of
latency, token waste, rework, coordination overhead, and workflow friction.
Cursor support is deliberately outside the first POC because its currently
observed transcript format is thinner and its useful metadata still needs to
be located.

## Why wait

The candidate repositories do not yet contain a meaningful current-Foundry
cohort:

| Repository | Historical evidence observed on 2026-08-01 | Current-Foundry evidence |
| --- | --- | --- |
| Aigent Place | 21 Codex parent sessions and 2 Claude parent sessions; useful installation and upgrade history | No parent session began after its 0.9 or 0.10 upgrade |
| AI4C | 485 Codex parent sessions; 24 Claude parent sessions and 162 Claude subagent transcripts | No parent session began after its 0.10/0.11 adoption |
| Cadre | 177 Codex parent sessions; 6 Claude parent sessions and 87 Claude subagent transcripts | Two Codex parent sessions and no Claude parent session began after its 0.10 adoption |

Aigent Place is therefore a good historical parser fixture, not a control for
the current workflow. AI4C and Cadre can later test scale and delegated-session
handling, but their pre-adoption histories must remain separate cohorts.

## Revisit threshold

Start `task-013` when all of the following are true:

- At least one installed project has 10-15 substantive completed sessions
  under one materially equivalent Foundry generation.
- The cohort includes implementation, review, validation, and closeout work,
  rather than installation or upgrade sessions alone.
- At least five parent sessions exist from each harness if the POC will compare
  Codex with Claude.
- Several sessions used real delegation if orchestration efficiency will be
  evaluated.
- Repository task state, Git history, and validation evidence are available to
  distinguish efficient completion from short or abandoned work.

Changing a version number does not automatically split a cohort. Group patch
or minor releases together only after checking whether their workflow changes
could affect the signal being measured.

## Questions the POC should answer

- Which workflow stages consume the most time and tokens?
- How often do agents repeat repository orientation, file reads, commands, or
  validation without an intervening change that justifies the repetition?
- Which review findings cause confirmed rework, and which review activity is
  duplicated or low-yield?
- When does delegation save time, and when does coordination or duplicated
  exploration cost more than it returns?
- Are expensive models being used for mechanical inventory or log reduction
  that a cheaper worker or deterministic script could perform?
- Which user corrections and process failures recur often enough to reach the
  retrospective evidence bar?

Transcript metrics alone cannot establish quality. Findings must be
correlated with completed tasks, commits, validation results, review findings,
blockers, and explicit user correction.

## Proposed pipeline

1. **Discover.** Select providers, repository roots, and a date or version
   window explicitly. Do not scan unrelated projects.
2. **Normalize.** Stream JSONL line by line through version-aware Codex and
   Claude adapters. Record provider, session identity, parent/delegated
   relationship, repository, branch, model, effort, timestamps, usage, tool
   activity, and source offsets when available.
3. **Cohort.** Assign each session to the Foundry version in effect at session
   start using repository Git history and installation provenance. Preserve
   pre-Foundry and upgrade-session labels.
4. **Detect.** Use deterministic rules for repeated reads and commands, failed
   tools, retries, long idle gaps, review churn, compaction followed by
   repeated orientation, excessive response volume, and duplicated delegated
   exploration.
5. **Reduce.** Produce compact facts and bounded, redacted evidence windows
   only for candidate signals. Exclude encrypted reasoning, attachments,
   base64 data, secrets, bulk tool output, and repeated content by default.
6. **Analyze.** Give independent agents small, non-overlapping signal clusters.
   Never give every worker complete raw histories. Keep synthesis and
   acceptance with the primary agent.
7. **Verify.** Reopen a sample of decisive source offsets and compare findings
   with the repository board, Git history, and recorded validation.
8. **Distill.** Feed confirmed repeated patterns into the existing
   retrospective. The audit does not create a second self-improvement path or
   edit Foundry guidance automatically.

## Privacy and authority constraints

- Invocation is explicit and `report-only` by default.
- Scope is limited by provider, repository, and time/version window.
- Original session files are never modified or deleted.
- Derived caches and evidence packets stay outside repositories and out of
  Git; reports containing excerpts are private unless the operator chooses a
  destination.
- Unknown provider schemas fail closed or produce metadata-only inventory.
- Likely secrets and environment values are removed before model analysis.
- Raw histories from one provider are not sent to another provider without
  explicit operator approval.
- Parent and subagent histories are correlated so delegated work is not
  counted twice.
- Findings retain provider, session ID, timestamp, and source offsets for
  verification, while user-facing summaries avoid reproducing private
  transcript content.

## POC scope

The first implementation should remain small enough for one task context:

- Codex and Claude adapters only.
- Aigent Place as the historical fixture.
- Metadata extraction plus a small set of mechanical detectors.
- No persistent service, graph database, embeddings, scheduler, UI, or
  automatic policy edits.
- A stratified sample rather than semantic analysis of every session.

AI4C and Cadre may supply a few historical scale fixtures after the Aigent
Place pipeline works. Full current-Foundry comparison waits for the revisit
threshold.

## Acceptance criteria

The POC is successful when it:

1. Discovers the intended Aigent Place Codex and Claude parent sessions without
   selecting unrelated repositories.
2. Streams files without loading a complete transcript into memory.
3. Separates parent sessions from delegated sessions and avoids double counts.
4. Assigns historical sessions to the correct pre-Foundry or Foundry-version
   cohort.
5. Emits useful mechanical metrics without an LLM call.
6. Produces auditable evidence packets with a fixed per-signal size limit and
   at least a 100:1 raw-data-to-packet reduction for the selected corpus.
7. Rediscovers at least one independently known workflow inefficiency without
   being told where it occurs.
8. Demonstrates source-offset verification on a sample of findings.
9. Writes no raw transcript, secret, or private derived cache into Git.
10. Ends with an explicit adopt, revise, or stop recommendation; it does not
    manufacture a Foundry change merely because the experiment ran.

## Non-goals

- Continuous surveillance or automatic scheduled analysis.
- Ranking individual people or agents.
- Treating low token count as a proxy for quality.
- Comparing model families without controlling for task type and workflow
  version.
- Building a universal transcript schema or graph infrastructure.
- Replacing task logs, Git evidence, codebase audit, or retrospective.
