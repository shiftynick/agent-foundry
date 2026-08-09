---
id: task-032
title: Implement P1-P4 shift-left review preventions in execute-task
status: done
priority: p1
tags: [area:process]
blockedBy: [task-031]
createdAt: "2026-08-09T00:38:35Z"
updatedAt: "2026-08-09T01:08:33Z"
---

<!-- task-tracker:description -->
## Description

Implement the four ADOPT proposals from docs/research/review-findings-audit-001.md as one bounded edit to the execute-task skill (both trees) plus CHANGELOG/VERSION: P1 packet discipline (regenerate file list per round, include gate evidence and recorded decisions, UTF-8); P2 red-capable oracle demonstrated not asserted (one mutation/rejection fixture per new oracle before dispatch); P3 evidence-follows-the-edit; P4 diff-verify round-N fixes before dispatching round N+1. Operator directive 2026-08-08: if any finding class traces to the gates/guidance/overengineered workflow itself, prefer revising or simplifying the existing guidance over adding rules.

<!-- task-tracker:log -->
## Log

- 2026-08-09T00:38:35Z — created (status: backlog)
- 2026-08-09T00:38:43Z — moved to ready (forced; note: task-031 report delivered; operator approved P1-P4)
- 2026-08-09T00:38:53Z — moved to in_progress (claimed by shift@Shiftor; forced; note: Authorized parallel start: operator approved P1-P4 in the same breath as the report; 031 sits in review awaiting the same cold-review dispatch that covers this diff)
- 2026-08-09T00:38:53Z — note: Rubric: (1) all four preventions land as text at the point of use in execute-task, no SDLC restatement; (2) both trees mirrored byte-identical apart from the Claude-facing/Codex-facing transform; (3) prefer simplifying existing guidance over net-new rules where the class traces to workflow overengineering (operator directive); (4) VERSION bump + CHANGELOG entry land together; (5) validate-foundry + test-bootstrap + check-skill-sync green; (6) cold SPEC and STANDARDS review of report + diff from the opposite model family before done.
- 2026-08-09T00:40:36Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T00:40:34Z, exit 0 in 2.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T00:41:51Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T00:40:42Z, exit 0 in 68.8s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\clean-project\.agent-foundry-backups\20260809T004147135Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\clean-project
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\seed-upgrade-project\.agent-foundry-backups\20260809T004149384Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\clean-project\.agent-foundry-backups\20260809T004150643Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-i8ElMP\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T00:42:13Z — note: Red-capable oracle demonstrated per the new rule itself: seeded a one-line desync into .agents execute-task SKILL.md; check-skill-sync FAILed (exit 1, 'differs beyond harness paths'); restored via transform; re-run PASS (15 shared skills).
- 2026-08-09T00:42:20Z — moved to review (forced; note: Diff frozen after gates: validate-foundry PASS, test-bootstrap PASS (0.25.0), check-skill-sync PASS. 031 dependency intentionally held open: one cold dispatch covers the report and this diff. Dispatching SPEC+STANDARDS to codex (opposite family).)
- 2026-08-09T00:43:25Z — note: Cold review rung 1 dispatched: two independent codex (OpenAI family, codex-cli 0.145.0) calls via agent-headless, answer-only, ephemeral, no conversation history. Packet built per the new packet rules (fresh diff from current tree, git status, untracked in-scope contents incl. report and both task logs with rubrics/decisions/gate evidence, UTF-8). SPEC covers task-031 report + task-032 rubrics; STANDARDS covers dual-tree invariant, neutrality, no-SDLC-restatement, ASD-STE100, VERSION/CHANGELOG conventions.
- 2026-08-09T00:55:14Z — note: Round 1 adjudication (SPEC 4, STANDARDS 3, all confirmed except SPEC-4 which is the inherent review-in-flight state): SPEC-1 high ACCEPTED - report now names the three findings-*.json dataset files (289 entries, JSON-validated) and states citations resolve to committed task-log lines; exemplar citations expanded to full filenames. SPEC-2 ACCEPTED - taxonomy table re-sorted by total desc with a per-class Disposition column covering all 11 classes. SPEC-3 ACCEPTED - all gates re-recorded on final tree below. SPEC-4 resolved by this adjudication being recorded. STD-1 ACCEPTED as packet gap - archived task-029/030 moves are prior board bookkeeping, excluded from round-2 in-scope list with contents included for the archive files. STD-2 ACCEPTED - skill-sync runs now recorded via task.mjs run including seeded-defect failing run. STD-3 ACCEPTED - severity assignment removed from cold-review.md ('is itself a finding to record and resolve'); SDLC keeps severity authority. Confirmed med/high findings trigger a full round 2 per severity-gated rule.
- 2026-08-09T00:55:14Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T00:55:14Z, exit 1 in 0.1s
  output:
  | skill-sync: FAIL
  |   execute-task: references\cold-review.md differs beyond harness paths
  |
  | Edit both copies of a shared skill in the same commit. Only harness
  | invocation paths may differ between the trees.
- 2026-08-09T00:55:22Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T00:55:22Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-09T00:55:24Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T00:55:22Z, exit 0 in 2.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T00:56:31Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T00:55:29Z, exit 0 in 61.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\clean-project\.agent-foundry-backups\20260809T005627103Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\clean-project
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\seed-upgrade-project\.agent-foundry-backups\20260809T005629258Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\clean-project\.agent-foundry-backups\20260809T005630708Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-4tlUFO\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T01:00:29Z — note: Round 2 adjudication: STANDARDS PASS (full CHECKED, all round-1 fixes verified in tree). SPEC 3 findings, all confirmed: (1) high - count conflicts (~285 vs 289 vs 291) and dataset unverifiable from packet; FIXED - report now states exactly 291 entries (100+99+92, computed from the JSON files: 281 finding entries + 10 clean-round entries), entry-vs-finding distinction defined, per-class counts relabeled as entries; round-3 packet includes the three dataset files verbatim. (2) med - preventability ranking absent; FIXED - proposals section now states the two-factor criterion (mechanical checkability, then recurrence) and the ordering rationale. (3) low - P5 lacked a disposition; FIXED - P5 is ADOPT (delivered inside P1) and the final Recommendation enumerates all seven dispositions. Confirmed high/med -> full round 3 (cap round) per severity-gated rule.
- 2026-08-09T01:05:56Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T01:05:56Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-09T01:05:59Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T01:05:56Z, exit 0 in 2.6s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T01:07:08Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T01:06:05Z, exit 0 in 62.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\clean-project\.agent-foundry-backups\20260809T010705024Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\clean-project
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\seed-upgrade-project\.agent-foundry-backups\20260809T010706943Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\clean-project\.agent-foundry-backups\20260809T010708119Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-TEQ0ej\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T01:07:22Z — note: Round 3 (cap) adjudication. STANDARDS: PASS, full CHECKED. SPEC: 6 findings, all confirmed, all fixed at cap except one residual: F1 high (batch entries lack per-member rows) - PARTIALLY FIXED: granularity limitation now stated prominently in the report with the explode-batches instruction for follow-on runs; full per-member re-extraction NOT done at cap - RESIDUAL, surfaced to operator. F2 high (gates not re-recorded after round-2 edits - the new P3 rule catching its own author twice) - FIXED: all three gates re-recorded above on the final tree after every round-3 edit. F3 high (interra citations truncated) - FIXED mechanically: 92/92 refs resolved to real task-log filenames, 0 unresolved (fix-citations.mjs in run dir). F4 med (P2 wording allowed one demo for many checks) - FIXED both trees: 'one run per new check'. F5 med (no class crosswalk) - FIXED: full source-label to merged-class crosswalk table added. F6 med (declared ranking method did not produce published order) - FIXED: explicit preventability ranking P1>P3>P4>P2 with rationale; P-numbers documented as stable references, not rank. Cap reached: no round 4. Unresolved risk surfaced before promotion: batch-entry granularity (class totals are floors).
- 2026-08-09T01:08:33Z — moved to done
