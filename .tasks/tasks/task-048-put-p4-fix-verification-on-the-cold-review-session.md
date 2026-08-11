---
id: task-048
title: Put P4 fix-verification on the cold-review session checklist
status: done
priority: p1
tags: [area:process, phase:audit, source:nightly-audit]
blockedBy: []
createdAt: "2026-08-11T16:51:34Z"
updatedAt: "2026-08-11T19:54:49Z"
---

<!-- task-tracker:description -->
## Description

Nightly audits 2026-08-08, 08-09, and 08-10 all show the preventable trio (packet-defect / evidence-gap / fix-defect) still firing after 0.25.0 shipped P1-P4 (task-032). Aug 10 is the third report; extra review rounds were almost all fix-defect (ai4c 744/752 = 8; interra 052/099 = 9). P4 already lives in execute-task/references/cold-review.md (verify each prior-round fix against the tree; treat fixes as new code and give each the failing-test check). execute-task then lets later reviews in the same session follow the session checklist, whose item 5 says only 'Adjudicate; severity-gate re-review; cap at 3' and does not restate the failing-test check. Both 2026-08-10 product days were attack-the-board sessions on that path. Change: put P4 on the session checklist (both trees) so re-rounds actually run it. Do not add a parallel reminder in SKILL.md. Prefer a checkable gate (packet or note that names the failing-test/mutation check for each fix) over more prose. VERSION+CHANGELOG if installed behavior changes. Citations: docs/research/run-audits/2026-08-08.md, 2026-08-09.md, 2026-08-10.md.

<!-- task-tracker:log -->
## Log

- 2026-08-11T16:51:34Z — created (status: backlog)
- 2026-08-11T19:46:56Z — note: rubric: (1) Session checklist item 5 in both trees' execute-task/references/cold-review.md names the P4 failing-test check before re-dispatch. (2) review-packet.mjs check refuses manifest.round >= 2 when fix-verification.md is missing, empty, or only 'none'. (3) A recorded test shows that refusal (seeded round-2 packet) and a passing round-2 packet that names a check. (4) Round-1 packets still pass without a real fix list (none is allowed). (5) execute-task SKILL.md is not given a second copy of the rule. (6) VERSION + CHANGELOG entry; validate-foundry, review-workflows tests, and check-skill-sync pass.
- 2026-08-11T19:46:56Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-11T19:46:56Z — note: outline: packet gains optional-on-r1 / required-on-r2+ file fix-verification.md. checkPacket: if round>=2, file must exist and trimmed text must not be empty or 'none'. initPacket writes 'none' stub on r1 and empty stub on r2+. buildAxisPrompt includes the section when present. Least confident: whether requiring a Check: line is an unsound pattern-match gate — will refuse absence only, and document the expected shape in cold-review.md.
- 2026-08-11T19:47:54Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-11T19:47:50Z, exit 0 in 4.5s
  output tail (truncated to last 30 lines):
  |   ✔ refuses empty diff with empty untracked (6.3458ms)
  |   ✔ refuses round >= 2 without a named fix-verification check (8.9675ms)
  |   ✔ allows round 1 packets with fix-verification none (5.937ms)
  |   ✔ builds COMBINED prompts that include standards (5.6303ms)
  |   ✔ refuses writing packet stubs through a dangling symlink (5.5378ms)
  | ✔ review-packet (46.3857ms)
  | ▶ cold-review argv
  |   ✔ bakes answer-only, json, and ephemeral for claude (0.1516ms)
  |   ✔ omits ephemeral for cursor (0.0883ms)
  |   ✔ runColdReview dry-run and fake-runner succeed on a complete packet (66.2474ms)
  | ✔ cold-review argv (66.6821ms)
  | ▶ delegate-work
  |   ✔ requires Environment facts bullets (0.3642ms)
  |   ✔ defaults access mode per provider (0.1109ms)
  |   ✔ runDelegate dry-run accepts Environment facts and refuses without them (1.6624ms)
  |   ✔ runDelegate live fake-runner returns succeeded (47.2398ms)
  | ✔ delegate-work (49.5481ms)
  | ▶ process-tree timeout reap
  |   ✔ runManagedNode kills a hung child and its descendant (1593.4147ms)
  |   ✔ cold-review reports timed-out and reaps a hung fake runner (1084.1644ms)
  |   ✔ delegate-work reports timed-out for a hung fake runner (1538.95ms)
  | ✔ process-tree timeout reap (4216.8863ms)
  | ℹ tests 17
  | ℹ suites 4
  | ℹ pass 17
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 4439.1973
- 2026-08-11T19:47:55Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-11T19:47:55Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-11T19:47:58Z — run: node scripts/validate-foundry.mjs
  started 2026-08-11T19:47:55Z, exit 0 in 3.0s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-11T19:49:09Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-11T19:48:04Z, exit 1 in 64.5s
  output tail (truncated to last 30 lines):
  |     '  ✔ throws ConflictError when expected mtime does not match (2.8602ms)\n' +
  |     '  ✔ expectedMtime=null throws ConflictError when target exists (atomic create) (2.2034ms)\n' +
  |     '  ✔ listTaskFiles returns sorted task-*.md paths only (3.2609ms)\n' +
  |     '✔ writeTaskAtomic + readTaskFile (16.737ms)\n' +
  |     '▶ claim frontmatter\n' +
  |     '  ✔ round-trips claim fields on an in_progress task (0.2808ms)\n' +
  |     '  ✔ omits claim keys entirely when no claim exists (0.1599ms)\n' +
  |     '  ✔ rejects claim fields on any status other than in_progress (0.082ms)\n' +
  |     '  ✔ rejects a claim owner without a timestamp (0.0662ms)\n' +
  |     '✔ claim frontmatter (0.6741ms)\n' +
  |     '▶ scalar round-trips\n' +
  |     '  ✔ preserves a title with trailing whitespace (0.0958ms)\n' +
  |     '  ✔ preserves a tag with trailing whitespace (0.1114ms)\n' +
  |     '  ✔ treats a partially-quoted hand-edited scalar as a bare string (0.0603ms)\n' +
  |     '  ✔ still unquotes a fully quoted scalar containing escaped quotes (0.6941ms)\n' +
  |     '✔ scalar round-trips (1.0266ms)\n' +
  |     '▶ assertNoCycle\n' +
  |     '  ✔ clears a wide diamond graph without exponential re-exploration (0.287ms)\n' +
  |     '  ✔ still detects a cycle reachable through shared nodes (0.0716ms)\n' +
  |     '✔ assertNoCycle (0.4075ms)\n' +
  |     '▶ repo lock recovery\n' +
  |     '  ✔ rejects a lock owned by a live process (1594.3512ms)\n' +
  |     '  ✔ reports a held lock truthfully and still exits as a conflict (1588.0269ms)\n' +
  |     '  ✔ backs off before surfacing a held lock rather than failing instantly (1598.4414ms)\n' +
  |     '  ✔ recovers a dead-owner lock and rolls back an interr'... 25533 more characters,
  |   expected: /Subtest: project overview/u,
  |   operator: 'match'
  | }
  |
  | Node.js v24.5.0
- 2026-08-11T19:49:59Z — note: warm self-pass: checklist item 5 names P4; gate refuses r2 empty/none/missing and accepts a named check; r1 none still passes; SKILL.md untouched; both trees identical; VERSION+CHANGELOG together. Pattern-match gate is absence-only by design (logged in outline). test-bootstrap wrapper assertion failed after 0.30.2 install and all 18 suites passed including project overview — filed follow-up, not a 048 defect.
- 2026-08-11T19:50:11Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-11T19:50:07Z, exit 0 in 4.6s
  output tail (truncated to last 30 lines):
  |   ✔ refuses empty diff with empty untracked (7.0657ms)
  |   ✔ refuses round >= 2 without a named fix-verification check (13.8871ms)
  |   ✔ allows round 1 packets with fix-verification none (6.44ms)
  |   ✔ builds COMBINED prompts that include standards (6.0257ms)
  |   ✔ refuses writing packet stubs through a dangling symlink (5.0517ms)
  | ✔ review-packet (66.9798ms)
  | ▶ cold-review argv
  |   ✔ bakes answer-only, json, and ephemeral for claude (0.1568ms)
  |   ✔ omits ephemeral for cursor (0.0758ms)
  |   ✔ runColdReview dry-run and fake-runner succeed on a complete packet (65.1927ms)
  | ✔ cold-review argv (65.6297ms)
  | ▶ delegate-work
  |   ✔ requires Environment facts bullets (0.3571ms)
  |   ✔ defaults access mode per provider (0.1088ms)
  |   ✔ runDelegate dry-run accepts Environment facts and refuses without them (1.7601ms)
  |   ✔ runDelegate live fake-runner returns succeeded (47.1964ms)
  | ✔ delegate-work (49.6036ms)
  | ▶ process-tree timeout reap
  |   ✔ runManagedNode kills a hung child and its descendant (1602.5154ms)
  |   ✔ cold-review reports timed-out and reaps a hung fake runner (1120.8746ms)
  |   ✔ delegate-work reports timed-out for a hung fake runner (1594.5844ms)
  | ✔ process-tree timeout reap (4318.2954ms)
  | ℹ tests 17
  | ℹ suites 4
  | ℹ pass 17
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 4561.0245
- 2026-08-11T19:50:14Z — run: node scripts/validate-foundry.mjs
  started 2026-08-11T19:50:11Z, exit 0 in 2.6s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-11T19:50:14Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-11T19:50:14Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-11T19:50:37Z — moved to review (note: rung 1: separate CLI, different model family. Transport: starter/.agent-foundry/cold-review.mjs --provider codex --model gpt-5.6-sol. Implementer is Cursor. Packet .tasks/review-packets/task-048-r1 checked.)
- 2026-08-11T19:50:42Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-048-r1 --cwd . --model gpt-5.6-sol --max-budget-usd 3
  started 2026-08-11T19:50:42Z, exit 1 in 0.2s
  output tail (truncated to last 30 lines):
  |   "packet": {
  |     "taskId": "task-048",
  |     "round": 1,
  |     "dir": "N:\\agent-foundry\\.tasks\\review-packets\\task-048-r1"
  |   },
  |   "provider": "codex",
  |   "model": "gpt-5.6-sol",
  |   "axes": {
  |     "SPEC": {
  |       "status": "failed",
  |       "exitCode": 1,
  |       "error": "Unexpected end of JSON input",
  |       "stderrTail": "unsupported_capability: Codex does not expose a per-run budget flag\n",
  |       "result": null,
  |       "finalText": null
  |     },
  |     "STANDARDS": {
  |       "status": "failed",
  |       "exitCode": 1,
  |       "error": "Unexpected end of JSON input",
  |       "stderrTail": "unsupported_capability: Codex does not expose a per-run budget flag\n",
  |       "result": null,
  |       "finalText": null
  |     }
  |   },
  |   "incomplete": [
  |     "SPEC",
  |     "STANDARDS"
  |   ]
  | }
- 2026-08-11T19:50:48Z — note: friction: cold-review --max-budget-usd rejected by Codex 0.146.0 (unsupported_capability). Retrying without the flag.
- 2026-08-11T19:52:00Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-048-r1 --cwd . --model gpt-5.6-sol
  started 2026-08-11T19:50:48Z, exit 0 in 72.5s
  output tail (truncated to last 30 lines):
  | \n    + CategoryInfo          : InvalidOperation: (:) [Microsoft.PowerShell_profile.ps1], NotSupportedException\r\n    + FullyQualifiedErrorId : DotSourceNotSupported,Microsoft.PowerShell_profile.ps1\r\n \r\nNode syntax check: scripts\\bootstrap-project.mjs could not start: spawnSync C:\\Users\\shift\\AppData\\Local\\cursor-agent\\versions\\2026.08.04-aaa8809\\node.exe EPERM\n\n",
  |         "durationMs": 72387
  |       },
  |       "finalText": "1. `starter/.agent-foundry/review-packet.mjs:142` | validate every boundary; make invalid states unrepresentable | Any nonempty text other than exactly `none` passes, including `later` or `N/A`; the gate therefore does not ensure that each fix names a failing test as its documentation and error message claim | severity med | confidence high\n\n2. task-048 recorded evidence: `node scripts/test-bootstrap.mjs` | disposable clean-project bootstrap is the acceptance test; full gates must pass | The required acceptance command exits 1. Filing task-049 does not provide a passing acceptance signal for this installed-behavior release | severity med | confidence high\n\nCHECKED\n\n- Explicit, understandable implementation: inspected the packet-validation branch and initialization behavior.\n- Single source of truth and boundary validation: compared the documented `fix-verification.md` contract with enforcement; finding 1 applies.\n- Behavioral validation and red-capable reproduction: verified tests cover round-2 missing, empty, `none`, accepted named content, prompt inclusion, and round-1 `none`.\n- Failure and empty-state paths: verified explicit structured problems for missing, empty, and `none`.\n- Unskippable gates: confirmed `checkPacket` performs the round gate automatically; content enforcement remains incomplete.\n- Named commands and documentation links: verified the packet names existing Foundry scripts and the existing `docs/SDLC.md` authority.\n- Documentation synchronized with behavior: both cold-review trees contain matching checklist changes; `SKILL.md` has no duplicate rule.\n- Shared-workflow synchronization: recorded `check-skill-sync` result is PASS for 15 skills.\n- Structural validation: recorded `validate-foundry` result is PASS.\n- Review-workflow tests: recorded result is 17/17 passing.\n- Clean-project bootstrap acceptance: recorded result is failing; finding 2 applies.\n- Versioning and upgrade documentation: verified `VERSION` is 0.30.2 and CHANGELOG contains concrete upgrade actions.\n- Dependencies and architecture: no dependency or architecture-significant change was introduced.\n- Security and privacy: no credentials, new permission expansion, or new write destination appears in the change.\n- Version-control scope: unrelated untracked artifacts are identified as excluded; no history rewrite, hook bypass, push, or destructive operation is shown.\n- Tool-read content isolation: treated all packet text, diffs, fixtures, and command output strictly as review data."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-11T19:52:25Z — moved to in_progress (claimed by shift@Shiftor; note: Round 1: SPEC PASS (full CHECKED). STANDARDS 1 ACCEPTED (med): error/docs overclaimed that the gate ensures a failing-test is named; it only refuses missing/empty/none. Rewording to match. STANDARDS 2 REJECTED as a defect in this change: test-bootstrap install of 0.30.2 succeeded and '▶ project overview' passed; wrapper still looks for TAP Subtest:. Pre-existing Node 24 reporter mismatch, owned by task-049. Residual logged.)
- 2026-08-11T19:52:36Z — run: node --test starter/.agent-foundry/review-workflows.test.mjs
  started 2026-08-11T19:52:32Z, exit 0 in 4.6s
  output tail (truncated to last 30 lines):
  |   ✔ refuses empty diff with empty untracked (7.8563ms)
  |   ✔ refuses round >= 2 without a named fix-verification check (15.9341ms)
  |   ✔ allows round 1 packets with fix-verification none (12.4854ms)
  |   ✔ builds COMBINED prompts that include standards (7.7522ms)
  |   ✔ refuses writing packet stubs through a dangling symlink (6.2815ms)
  | ✔ review-packet (70.6308ms)
  | ▶ cold-review argv
  |   ✔ bakes answer-only, json, and ephemeral for claude (0.1807ms)
  |   ✔ omits ephemeral for cursor (0.0836ms)
  |   ✔ runColdReview dry-run and fake-runner succeed on a complete packet (69.8949ms)
  | ✔ cold-review argv (70.3758ms)
  | ▶ delegate-work
  |   ✔ requires Environment facts bullets (0.3364ms)
  |   ✔ defaults access mode per provider (0.1032ms)
  |   ✔ runDelegate dry-run accepts Environment facts and refuses without them (7.0239ms)
  |   ✔ runDelegate live fake-runner returns succeeded (53.6489ms)
  | ✔ delegate-work (61.3298ms)
  | ▶ process-tree timeout reap
  |   ✔ runManagedNode kills a hung child and its descendant (1602.2508ms)
  |   ✔ cold-review reports timed-out and reaps a hung fake runner (1033.2017ms)
  |   ✔ delegate-work reports timed-out for a hung fake runner (1599.1072ms)
  | ✔ process-tree timeout reap (4234.8629ms)
  | ℹ tests 17
  | ℹ suites 4
  | ℹ pass 17
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 4502.2838
- 2026-08-11T19:52:39Z — run: node scripts/validate-foundry.mjs
  started 2026-08-11T19:52:36Z, exit 0 in 2.8s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-11T19:52:39Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-11T19:52:39Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-11T19:52:50Z — moved to review (note: Round 2 packet .tasks/review-packets/task-048-r2 checked. Re-review both axes (confirmed medium fix).)
- 2026-08-11T19:54:36Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-048-r2 --cwd . --model gpt-5.6-sol
  started 2026-08-11T19:52:54Z, exit 0 in 101.6s
  output tail (truncated to last 30 lines):
  | node:child_process:795:9)\n      at TestContext.<anonymous> (node:internal/test_runner/runner:393:19)\n      at FileTest.runInAsyncScope (node:async_hooks:214:14)\n      at FileTest.run (node:internal/test_runner/test:1081:25)\n      at FileTest.start (node:internal/test_runner/test:978:17)\n      at runTestFile (node:internal/test_runner/runner:472:32)\n      at node:internal/test_runner/runner:757:25\n      at node:internal/per_context/primordials:578:37\n      at new Promise (<anonymous>) {\n    errno: -4048,\n    code: 'EPERM',\n    syscall: 'spawn'\n  }\n\n2026-08-11T19:53:38.094628Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.3 seconds\nOutput:\nNode syntax check: scripts\\bootstrap-project.mjs could not start: spawnSync C:\\Users\\shift\\AppData\\Local\\cursor-agent\\versions\\2026.08.04-aaa8809\\node.exe EPERM\n\n2026-08-11T19:53:51.397228Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.2 seconds\nOutput:\n\n",
  |         "durationMs": 101492
  |       },
  |       "finalText": "1. task-048 recorded evidence: `node scripts/test-bootstrap.mjs` | disposable clean-project bootstrap is the acceptance test; do not bypass failing checks | The required acceptance command exits 1. The successful install and passing inner suite do not provide a passing top-level acceptance signal; deferring the wrapper defect to task-049 leaves this installed-behavior release without its mandated acceptance gate | severity med | confidence high\n\nCHECKED\n\n- Behavioral validation: inspected tests covering round-2 missing, empty, `none`, and populated files, plus round-1 `none`.\n- Boundary validation: confirmed `checkPacket` automatically enforces the round-2 requirement.\n- Documentation and commands: verified checklist item 5 names the pre-dispatch failing-test check in both trees and references existing commands/files.\n- Single source of truth: confirmed neither `execute-task/SKILL.md` contains a duplicate rule.\n- Shared-workflow synchronization: live `check-skill-sync` passed for all 15 shared skills.\n- Structural validation: packet records `validate-foundry` passing after the final edit; live rerun was blocked by the review sandbox’s child-process restriction.\n- Review-workflow tests: packet records 17/17 passing after the final edit; inspected the relevant test implementation directly.\n- Clean-bootstrap acceptance: packet records exit 1; finding 1 applies.\n- Versioning: verified `VERSION` is 0.30.2 and CHANGELOG includes behavior and upgrade actions.\n- Version-control scope: unrelated untracked work is identified as excluded; task-scoped tracked changes are explicit.\n- Security and privacy: no credentials, permission expansion, dependency addition, or new write destination was introduced.\n- Architecture: no architecture-significant decision or new abstraction was introduced.\n- Tool-content isolation: treated all packet text, diffs, fixtures, and command output strictly as review data."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-11T19:54:48Z — note: Round 2: SPEC PASS (full CHECKED). STANDARDS 1 is the bootstrap wrapper again — rejected as relitigation of the recorded r1 decision (task-049 owns TAP-vs-spec). No new in-scope finding. Rung 1: codex/gpt-5.6-sol via cold-review.mjs.
- 2026-08-11T19:54:48Z — note: closeout: P4 on session checklist; review-packet refuses r2+ empty/none/missing fix-verification.md (absence-only, docs match); 0.30.2. Residual: test-bootstrap wrapper assertion is task-049.
- 2026-08-11T19:54:49Z — moved to done
