---
id: task-033
title: Add a nightly review-findings audit skill
status: done
priority: p2
tags: [area:process, area:tooling]
blockedBy: []
createdAt: "2026-08-09T01:04:39Z"
updatedAt: "2026-08-09T01:32:02Z"
---

<!-- task-tracker:description -->
## Description

Formalize what task-031 did by hand into a repeatable nightly process: a shared skill (both harness trees) that sweeps the day's cold-review findings across installed repos (Claude and Codex runs), classifies them against the taxonomy in docs/research/review-findings-audit-001.md, and reports recurring classes plus candidate shift-left edits. Inputs: each repo's .tasks logs (adjudications) and optionally session transcripts; reuse the extraction JSON shape from audit run 001 (findings-*.json: axis, round, task, repo, citation, gist, adjudication, resultingChange, class). Output: a dated report with per-class counts, deltas vs prior runs, and explicit adopt/revise/stop candidates - never auto-edits skills. Decide: skill-only (agent-driven) vs script-assisted extraction; how it triggers nightly (operator-run vs scheduled); where reports land in installed repos. Operator request 2026-08-08.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:04:39Z — created (status: backlog)
- 2026-08-09T01:11:05Z — moved to ready
- 2026-08-09T01:11:05Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T01:11:42Z — note: Rubric: (1) new shared skill 'nightly-audit' exists in both trees, mirrored, and examines one day's runs in the installed repo: review findings AND session efficiency/quality signals (rounds, cap hits, packet defects, friction notes, wasted work), for both Claude and Codex runs; (2) primary data source is the harness-neutral .tasks logs; transcripts optional and never quoted into Git; (3) output is a dated report with per-class counts, deltas vs prior reports, and explicit adopt/revise/stop candidates - the skill never edits other skills itself; (4) reuses the audit-001 taxonomy and findings-JSON shape by reference to docs/research/review-findings-audit-001.md schema, not restated; (5) distinct trigger surface from 'retrospective' (archive-mining, cadence) - nightly-audit is day-scoped and run-focused; overlap addressed explicitly in both skills' descriptions; (6) validate-foundry.mjs shared-skill list/count updated to 16; validate + test-bootstrap + check-skill-sync green; VERSION 0.26.0 + CHANGELOG together; (7) cold SPEC+STANDARDS review before done. Operator scope 2026-08-08: the process should improve efficiency and quality of Claude and Codex sessions by examining what is and is not working in the day's runs.
- 2026-08-09T01:13:46Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T01:13:43Z, exit 0 in 2.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T01:13:46Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T01:13:46Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-09T01:14:25Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T01:13:52Z, exit 1 in 33.6s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-WNXM7O\clean-project
  | node:internal/modules/run_main:123
  |     triggerUncaughtException(
  |     ^
  |
  | AssertionError [ERR_ASSERTION]: The input did not match the regular expression /skill-sync: PASS \(15 shared skills\)/u. Input:
  |
  | 'skill-sync: PASS (16 shared skills)\n'
  |
  |     at file:///N:/agent-foundry/scripts/test-bootstrap.mjs:332:10
  |     at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
  |     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
  |     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5) {
  |   generatedMessage: true,
  |   code: 'ERR_ASSERTION',
  |   actual: 'skill-sync: PASS (16 shared skills)\n',
  |   expected: /skill-sync: PASS \(15 shared skills\)/u,
  |   operator: 'match',
  |   diff: 'simple'
  | }
  |
  | Node.js v22.22.2
- 2026-08-09T01:16:40Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T01:15:26Z, exit 0 in 74.0s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\clean-project\.agent-foundry-backups\20260809T011636644Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\clean-project
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\seed-upgrade-project\.agent-foundry-backups\20260809T011638689Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\clean-project\.agent-foundry-backups\20260809T011640075Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-rwCPxg\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T01:18:28Z — moved to review (note: Diff frozen; gates recorded (validate PASS, sync PASS 16, bootstrap PASS 0.26.0 after fixing the second hardcoded count in test-bootstrap.mjs). Dispatching SPEC+STANDARDS to codex rung 1.)
- 2026-08-09T01:20:56Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T01:20:56Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-09T01:20:59Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T01:20:56Z, exit 0 in 3.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T01:22:21Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T01:21:04Z, exit 0 in 77.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\clean-project\.agent-foundry-backups\20260809T012217862Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\clean-project
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\seed-upgrade-project\.agent-foundry-backups\20260809T012219835Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\clean-project\.agent-foundry-backups\20260809T012221293Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.26.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-idxoL9\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T01:22:31Z — note: Round 1 adjudication. SPEC 4: F1 med confirmed (--since has no end bound) FIXED - skill instructs discarding signals dated after the audit day; F2 med confirmed (range ambiguity) FIXED - exactly one day per report, a range produces one report per day; F3 med = STANDARDS axis in flight at packet time, resolved by this round completing; F4 low confirmed packet gap - audit-001 report included in round-2 packet for taxonomy-fidelity check. STANDARDS 4: F1 med confirmed FIXED - upgrade actions now cover pre-existing content at the new nightly-audit paths (no overwrite, reconcile, LOCAL-CHANGES); F2 med = same window defect as SPEC F1, same fix; F3 med confirmed FIXED - real recorded invocation with full task.mjs path and process-signals arguments; F4 low confirmed packet gap - referenced files existence check recorded (ls) and listings included in round-2 packet. All gates re-recorded on the final tree after fixes (sync PASS 16, validate PASS, bootstrap PASS). Confirmed meds -> full round 2.
- 2026-08-09T01:28:39Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T01:28:36Z, exit 0 in 2.6s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T01:28:39Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T01:28:39Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-09T01:29:42Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T01:28:39Z, exit 0 in 62.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\clean-project\.agent-foundry-backups\20260809T012938171Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\clean-project
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\seed-upgrade-project\.agent-foundry-backups\20260809T012940258Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\clean-project\.agent-foundry-backups\20260809T012941587Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.25.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-ckSEpc\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T01:29:55Z — note: SCOPE CORRECTION (operator, 2026-08-08, mid-round-2): nightly-audit is NOT a payload skill - it belongs to this repo only, for auditing the operator's Agent-Foundry repos from here. Executed: (1) reverted all payload changes - starter/**/nightly-audit removed, retrospective SKILL.md both trees restored, validate-foundry and test-bootstrap counts back to 15, VERSION back to 0.25.0, 0.26.0 changelog entry dropped; (2) re-landed as repo-local .claude/skills/nightly-audit + .agents mirror (reviewed skill text carried over), adapted to cross-repo scope with the operator's real repo list, read-only outside this repo, reports to docs/research/run-audits/; (3) round-2 STANDARDS F1 med (process-signals.mjs --since selects files by latest timestamp then emits undated historical signals, so it cannot bound a window) FIXED in the local version: the miner is demoted to lead-finder only, all counts come from log entries timestamped inside the audit day, restated in method.md rules; (4) all payload gates re-recorded green on the reverted tree (validate PASS, sync PASS 15, bootstrap PASS 0.25.0). Round-2 verdicts on the withdrawn payload version: SPEC PASS full CHECKED, STANDARDS the single med above. Review disposition: the reviewed skill text survives relocation with the F1 fix applied; the payload-integration surface (counts, changelog, upgrade actions, dual-tree-validator coupling) that consumed most findings no longer exists. Dispatching one scoped delta check verifying the relocation and the F1 fix rather than a third full round.
- 2026-08-09T01:32:02Z — note: Scoped delta check: PASS on all three checks (relocation complete, F1 fixed in both documents, mirror sane). Review complete: r1 both axes adjudicated, r2 SPEC PASS / STANDARDS 1 med fixed, delta PASS on the relocated result.
- 2026-08-09T01:32:02Z — moved to done
