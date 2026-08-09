---
id: task-031
title: Audit adversarial review findings and propose shift-left preventions
status: done
priority: p2
tags: [area:research]
blockedBy: []
createdAt: "2026-08-09T00:25:57Z"
updatedAt: "2026-08-09T01:08:32Z"
---

<!-- task-tracker:description -->
## Description

Follow-on to session-audit run-001 (docs/research/session-audit-run-001-findings.md), separable from task-023. Question: what are the cold SPEC and STANDARDS review passes actually catching, do finding classes recur, and which classes can be prevented upstream so review stops being the net that catches them?

Scope:
1. Extract every SPEC and STANDARDS finding from review rounds across the post-upgrade cohort (2026-08-05 onward), from task logs and session transcripts. For each finding record: axis, review round, task and repo, whether it forced a change, whether the same class recurred in a later task.
2. Classify into a taxonomy that emerges from the data (candidate seeds from run-001: vacuous oracle, missing rubric or lifecycle before work, harness-neutrality violation, scope drift, document contradiction). Do not pre-commit to categories.
3. Rank classes by preventability: a class recurring across tasks or repos is a candidate for a shift-left fix - a rule in a skill, a validator check in scripts/validate-foundry.mjs, or an entry-criteria gate. For each class, propose one concrete prevention or state explicitly that review is the correct place to catch it.
4. Track review economics per class: rounds consumed, cap hits, whether findings were adjudicated as accepted or rejected.

Known exemplars already in the corpus: run-001 caught four vacuous-oracle instances in review; task-022 log shows both axes independently flagging the same missing-rubric process deviation.

Method: use parallel read-only subagents liberally for extraction and classification over the transcript corpus (operator directive 2026-08-08); synthesis and prevention proposals stay in the main context.

Acceptance: reproducible extraction, every finding offset-verifiable to its source, no transcript content enters Git, report lands in docs/research/ and ends with a ranked prevention list plus an explicit adopt/revise/stop recommendation per proposal - do not manufacture preventions where review is working as intended.

<!-- task-tracker:log -->
## Log

- 2026-08-09T00:25:57Z — created (status: backlog)
- 2026-08-09T00:26:07Z — moved to ready (note: Operator approved proceeding immediately 2026-08-08)
- 2026-08-09T00:26:07Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T00:26:07Z — note: Rubric before work: (1) every extracted finding cites session file + offset, verifiable without rereading whole transcripts; (2) taxonomy emerges from data - seed classes may be renamed or dropped; (3) prevention proposals must name the exact file/gate they would change; (4) no transcript content committed to Git - report carries citations only; (5) subagent extraction is read-only; synthesis in main context; (6) explicit adopt/revise/stop per proposal, 'review is working as intended' is an acceptable answer.
- 2026-08-09T00:34:43Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T00:34:41Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T00:34:43Z — note: Extraction complete: 3 parallel read-only subagents over ai4c / interra-api-proxy / project-myriad task logs + in-scope transcripts (discovery manifest: 16 parents, 35 subagents, ~53 MB, 2026-08-05..08). ~173 review rounds, ~285 findings, ~33 clean rounds extracted with per-finding citations. Report: docs/research/review-findings-audit-001.md. Headline: vacuous-oracle (~31), evidence-gap (~25), missing-test (~24) lead; ~13 false findings caused by packet defects. Proposals P1-P4 adopt (packet discipline, red-capable-oracle demonstration, evidence-follows-the-edit, fix-applied verification), P6 revise (already covered), P7 stop (security findings are review working as intended).
- 2026-08-09T00:38:35Z — note: Operator 2026-08-08: proceed with P1-P4 (filed as follow-up task) and dispatch cold review of this report. Directive: where root cause is the gates/guidance/overengineered workflow, revise those instead of adding rules.
- 2026-08-09T00:38:53Z — moved to review (note: Report delivered; cold review dispatching alongside the P1-P4 implementation diff)
- 2026-08-09T01:07:22Z — note: Cold review of the report completed inside task-032's three rounds (same packet). Final state: STANDARDS PASS; SPEC residual at cap = batch-entry granularity (totals are floors), disclosed in the report itself. All other SPEC findings on the report (counts, citations, crosswalk, preventability ranking, P5 disposition) fixed and verified in round 3 fixes.
- 2026-08-09T01:08:32Z — moved to done
