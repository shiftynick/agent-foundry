---
id: task-039
title: Add script-file-over-inline-one-liner rule for recorded commands
status: done
priority: p2
tags: [area:process]
blockedBy: []
createdAt: "2026-08-09T01:49:00Z"
updatedAt: "2026-08-09T02:01:08Z"
---

<!-- task-tracker:description -->
## Description

From nightly audit 2026-08-08 (docs/research/run-audits/2026-08-08.md, candidate 1 and watch 5), two evidence-durability guidance fixes to execute-task (both trees): (1) Validate section: when a recorded command needs quoting or shell metacharacters, write a script file (for example a temp .mjs) and record the run of that file, instead of an inline one-liner - recorded evidence commands failed on Windows metacharacters seven times across three repos in one day, once costing a full extra two-axis round (project-myriad 0.24-upgrade log line 295; task-054 log lines 25-29; synoptic and interra equivalents). (2) references/cold-review.md dispatch guidance: record each axis dispatch through task.mjs run and keep the runner's JSON result so provider/model metadata stays durable - synoptic task-001 round 3 partly existed to repair provenance lost by non-JSON invocations (N:\synoptic task-001 log line 340). Harness- and OS-neutral phrasing, no SDLC restatement, VERSION+CHANGELOG per convention.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:49:00Z — created (status: backlog)
- 2026-08-09T01:52:36Z — edited (description updated)
- 2026-08-09T01:52:36Z — moved to ready
- 2026-08-09T01:52:36Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T01:52:36Z — note: Rubric: (1) script-file rule lands as one sentence at the point of use in execute-task Validate, both trees; (2) provenance sentence lands in cold-review.md dispatch guidance, both trees; (3) no new mechanism, no SDLC restatement, harness/OS-neutral; (4) VERSION 0.26.0 + CHANGELOG entry land together with task-040; (5) validate + test-bootstrap + check-skill-sync green on final tree; (6) cold SPEC+STANDARDS review (one packet covering 039+040) before done.
- 2026-08-09T01:55:11Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T01:55:11Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-09T01:56:40Z — moved to review (note: Diff frozen; gates recorded)
- 2026-08-09T01:58:40Z — note: Round 1 adjudication (shared packet with 040). STANDARDS: F1 med confirmed - '.mjs' example was language-specific for shared starter guidance; FIXED to 'temporary script file'. F2 low confirmed - 'may need a repeat round' encroached on the SDLC review-ladder authority; FIXED, consequence removed. SPEC: F2 low confirmed - additions were two sentences vs the one-sentence rubric; FIXED, each collapsed to a single sentence with the rationale as a because-clause.
- 2026-08-09T01:58:40Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T01:58:40Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-09T02:01:08Z — note: Round 2: SPEC PASS + STANDARDS PASS, both full CHECKED; all round-1 fixes verified in tree.
- 2026-08-09T02:01:08Z — moved to done
