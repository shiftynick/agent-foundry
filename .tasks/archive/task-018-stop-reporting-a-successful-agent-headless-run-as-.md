---
id: task-018
title: Stop reporting a successful agent-headless run as failed when its JSONL cannot be parsed
status: done
priority: p1
tags: [area:agent-headless]
blockedBy: []
createdAt: "2026-08-05T22:57:55Z"
updatedAt: "2026-08-06T18:23:04Z"
---

<!-- task-tracker:description -->
## Description

Reported from a consuming project on foundry 0.16.0 (cursor-agent 2026.07.23-e383d2b, Windows 11, --provider cursor --access edit-isolated --json). A delegated implementation run returned status failed, events [], exitCode 0, stderr empty, warnings ['invalid JSONL at line 1'] after about eight minutes - while the provider had in fact succeeded and written roughly twenty files into the isolated worktree it created under the user's ~/.cursor/worktrees. Nothing in the normalized result indicated success, and no field pointed at the worktree holding the work, so the completed change was discoverable only by independently running git worktree list. The failure signal is indistinguishable from a genuine no-op. Mechanism: parseJsonLines aborts on the first unparseable stdout line and returns an error for the entire stream; the Cursor adapter's parse propagates it as protocolError; run status is then derived directly as parsed.protocolError ? 'failed' : 'succeeded', so one non-JSON line at index 0 produces exactly this shape while exitCode 0 - the signal that contradicts the verdict - is ignored. Identical logic exists in agent-headless/index.js and agent-headless/cli.js; no local drift, so this is stock behavior. Acceptance: (1) an unparseable line no longer discards the run - such lines are skipped and collected as bounded warnings, and the run fails only when no events parsed AND no terminal result was found, proven by a test feeding a valid stream prefixed with a non-JSON banner line; (2) a parse failure alone no longer decides status when the provider exited 0 - either success-with-warning or a distinct third status such as unparsed, so callers can separate 'the provider failed' from 'we could not read what the provider said'; (3) every write-access run reports its effective workspace or worktree path in the normalized result on all outcomes including failure, which is the change that turns an unreadable run from invisible into recoverable. Deterministic repro without a provider: parseJsonLines('cursor', 'not json\\n' + validJsonlStream) returns zero events and a line-1 error regardless of what follows.

<!-- task-tracker:log -->
## Log

- 2026-08-05T22:57:55Z — created (status: backlog)
- 2026-08-05T22:58:04Z — note: Reported by the Interra API Proxy project (foundry 0.16.0), originating task task-6627529457000001, 2026-08-05. Impact as the reporting project judged it: the mutation itself is safe because it is isolated in a worktree - the hazard is the report. A caller believing the run produced nothing either redoes the work, paying twice for an eight-minute model run, or proceeds while a completed change sits stranded in a stray worktree. For a kit whose delegation story rests on trusting the runner's verdict, a false failed is more damaging than a loud false succeeded.
- 2026-08-06T15:46:47Z — note: Rubric (logged before claiming, per SDLC Entry criteria): (1) parseJsonLines skips unparseable lines and collects them as bounded warnings instead of aborting the stream, and reports an error only when NOTHING parsed - proven by a test feeding a valid stream prefixed with a non-JSON banner line; (2) when the process exited 0, a parse failure no longer yields status failed - a distinct status separates 'the provider failed' from 'we could not read what the provider said'; (3) every write-access run reports its effective workspace or worktree location on all outcomes including failure, so a run whose output is unreadable is still recoverable; (4) the fix lands UPSTREAM in the agent-headless source, not in the vendored artifacts, because validate-foundry verifies their SHA-256 against PROVENANCE.md; (5) upstream check passes and the Foundry re-vendor updates artifacts, hashes, version, and patch series together.
- 2026-08-06T15:46:47Z — note: Scope discovered on claim: starter/.agent-foundry/agent-headless/{index.js,cli.js} are vendored build artifacts whose SHA-256 are verified by scripts/validate-foundry.mjs:191-196 against PROVENANCE.md. Editing them directly would fail the gate and bypass the documented refresh process. Upstream source is local at N:/agent-headless and its HEAD 3a631b9 matches the recorded source commit exactly, so there is no drift to reconcile. This is therefore a two-repository change: fix and test upstream, then re-vendor.
- 2026-08-06T15:46:48Z — moved to ready
- 2026-08-06T15:46:49Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-06T16:51:17Z — note: Upstream fix committed as agent-headless 1908084 (v0.3.0) after two cold-review rounds on both axes. Round 1 found a Codex turn.failed being relabelled unparsed; round 2 found the same class surviving in Claude and Cursor, where a success result was selected ahead of any later error - both reproduced from the built distribution, not argued from source. Vendored into the Foundry: cli.js and index.js refreshed, PROVENANCE version/hashes/source-commit updated, patch 0003 added to the series, COMPATIBILITY corrected (it still claimed an exact Cursor model is required).
- 2026-08-06T16:51:55Z — run: node scripts/validate-foundry.mjs
  started 2026-08-06T16:51:53Z, exit 0 in 2.7s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-06T16:51:56Z — run: node --test starter/.agent-foundry/agent-headless/cli.test.mjs
  started 2026-08-06T16:51:55Z, exit 0 in 0.8s
  output tail (truncated to last 30 lines):
  |   duration_ms: 54.9618
  |   type: 'test'
  |   ...
  | # Subtest: default invocations are answer-only and exclude dangerous bypass flags
  | ok 4 - default invocations are answer-only and exclude dangerous bypass flags
  |   ---
  |   duration_ms: 2.1795
  |   type: 'test'
  |   ...
  | # Subtest: Cursor isolated writes do not claim sandboxing on Windows
  | ok 5 - Cursor isolated writes do not claim sandboxing on Windows
  |   ---
  |   duration_ms: 0.6689
  |   type: 'test'
  |   ...
  | # Subtest: live cancellation terminates the bundled process runner
  | ok 6 - live cancellation terminates the bundled process runner
  |   ---
  |   duration_ms: 488.169
  |   type: 'test'
  |   ...
  | 1..6
  | # tests 6
  | # suites 0
  | # pass 6
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 742.8562
- 2026-08-06T16:59:35Z — note: Operator decision 2026-08-06 on the version step: both cold-review axes found (SPEC finding 1, STANDARDS finding 3, each high) that declaring three broken contracts and four reconciliation actions meets this repository's own written trigger for a major release, and that 0.18.0 therefore contradicts the published policy. The operator was shown that finding, the recommendation to cut 1.0.0, and the alternative of amending the policy first, and chose to keep 0.18.0. Recorded as an operator override of a substantiated review finding, not as a refutation of it. The policy text still does not describe what this release does; if a later release wants this carve-out to be legitimate rather than overridden each time, the versioning section needs a category for changes that affect consumers of a bundled dependency without affecting the mold.
- 2026-08-06T17:01:01Z — run: node scripts/verify-vendor-reconstruction.mjs N:/agent-headless
  started 2026-08-06T17:01:01Z, exit 0 in 0.5s
  output:
  | vendor-reconstruction: PASS (3 patches, base 7600ff8 -> source 1908084, tree 8e27152d762e)
- 2026-08-06T17:11:36Z — note: STANDARDS finding 2 ACCEPTED (high) and closed: the bundled cli.test.mjs asserted nothing this release changed - the previous 0.2.0 artifacts passed all six of its tests, so Foundry validation could not distinguish a correct artifact from the one being replaced. Added coverage for tolerant parsing, unparsed status, last-terminal-marker ordering, the unchanged non-zero-exit path, and Cursor model defaulting including the caller-intent distinction. Proof of red-capability: swapping the previous artifacts back in fails 5 of 11 (the four new behavioural tests plus the provenance version check) while the unchanged-behaviour guard still passes; restoring the new artifacts returns 11/11. A worktree-path assertion is still to be added once the upstream reachability fix lands.
- 2026-08-06T17:11:37Z — run: node --test starter/.agent-foundry/agent-headless/cli.test.mjs
  started 2026-08-06T17:11:36Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   duration_ms: 0.5288
  |   type: 'test'
  |   ...
  | # Subtest: a non-zero exit is still a plain failure
  | ok 9 - a non-zero exit is still a plain failure
  |   ---
  |   duration_ms: 0.3698
  |   type: 'test'
  |   ...
  | # Subtest: Cursor defaults its model and says so
  | ok 10 - Cursor defaults its model and says so
  |   ---
  |   duration_ms: 0.7902
  |   type: 'test'
  |   ...
  | # Subtest: live cancellation terminates the bundled process runner
  | ok 11 - live cancellation terminates the bundled process runner
  |   ---
  |   duration_ms: 482.1093
  |   type: 'test'
  |   ...
  | 1..11
  | # tests 11
  | # suites 0
  | # pass 11
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 788.0159
- 2026-08-06T17:18:54Z — run: node scripts/validate-foundry.mjs
  started 2026-08-06T17:18:51Z, exit 0 in 3.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-06T18:23:03Z — note: Review termination rationale, recorded as a judgment rather than silence: seven Foundry review rounds ran, plus two upstream. The last BEHAVIORAL finding was round 6 (envValue first-match vs effectiveEnv last-wins, plus the missed childEnvValue reader). Round 7 on both axes: zero behavioral findings - each independently traced single keys, arbitrary casing, duplicate orders, present-but-undefined, deleted-last, and absent through all four functions and found agreement, and each independently verified every oracle red against the prior defect. Both axes raised the identical structural finding (envKeyPart's independent fold), closed at upstream 2aa51a8 by single-sourcing: foldEnvName is the one definition of name-sameness, lastEnvMatch of winner-ship, and effectiveEnv, envValue, childEnvValue, and envKeyPart are all expressed through them - STANDARDS itself acknowledged that commit addresses its finding. Termination grounds: two consecutive rounds with zero behavioral findings, all structural findings closed by construction rather than promise, every fix pinned by red-proven oracles, and an eleven-patch provenance chain that reconstructs the source tree exactly.
- 2026-08-06T18:23:03Z — note: Final delivery: upstream agent-headless 0.3.0 at 2aa51a8 (nine commits from the 0.2.0 base), vendored with all hashes verified and reconstruction proven. The three acceptance criteria hold and are pinned by the bundled suite: (1) an unparseable line no longer discards the run - banner-line repro test; (2) a parse failure alone no longer decides status when the provider exited 0 - unparsed status, distinct CLI exit code, last-terminal-marker rule in both directions; (3) every write-access run reports its effective workspace, and for Cursor the worktree path is derived by construction so it survives unreadable output - guaranteed-location tests on unreadable, timed-out, and failed runs.
- 2026-08-06T18:23:03Z — moved to review
- 2026-08-06T18:23:04Z — moved to done
