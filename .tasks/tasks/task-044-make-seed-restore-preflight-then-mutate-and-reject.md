---
id: task-044
title: Make seed restore preflight-then-mutate and reject link-traversing paths
status: review
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-09T02:58:15Z"
updatedAt: "2026-08-09T22:29:41Z"
---

<!-- task-tracker:description -->
## Description

Upstream packet from aigent-place, verified against stock 0.26.0: docs/research/upstream-packets/2026-08-08/aigent-place-reconcile-seeds-partial-restore-and-links.md.

Verified claim: starter/.agent-foundry/reconcile-seeds.mjs restoreSeedsFromHead() validates and mutates in a single loop - for each path it hash-checks, then immediately runs git checkout HEAD -- <path>. If a later path fails its hash check the function throws 'seed changed after installation; refusing to overwrite', but earlier paths have ALREADY been overwritten. The error states the opposite of what happened. The function also does not reject seed paths that traverse a symlink or junction.

Proposed: preflight every path first, then a single batched checkout, plus a confinement check that refuses link-traversing paths; two tests.

Acceptance: red-capable tests (a mid-list hash mismatch must leave every file untouched; a link-traversing path must be refused); zero-dep Node; gates green; VERSION+CHANGELOG; cold review. On landing, tell aigent-place so its LOCAL-CHANGES entries can retire.

<!-- task-tracker:log -->
## Log

- 2026-08-09T02:58:15Z — created (status: backlog)
- 2026-08-09T21:58:10Z — note: rubric: (1) restoreSeedsFromHead validates every path before it mutates anything - a mid-list hash mismatch leaves every file on disk untouched; (2) the refusal message stays true, because nothing was overwritten; (3) a seed path that reaches its target through a symlink or junction, or is itself a link, is refused before any checkout; (4) the restore itself is one batched 'git checkout HEAD --' call; (5) both new behaviors have tests that fail without the fix; gates green.
- 2026-08-09T21:58:10Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T22:02:10Z — moved to review
- 2026-08-09T22:26:02Z — run: node --test starter/.agent-foundry/reconcile-seeds.test.mjs
  started 2026-08-09T22:26:00Z, exit 0 in 1.3s
  output tail (truncated to last 30 lines):
  |   duration_ms: 222.4852
  |   type: 'test'
  |   ...
  | # Subtest: refuses a seed path that reaches its target through a link
  | ok 5 - refuses a seed path that reaches its target through a link
  |   ---
  |   duration_ms: 227.0707
  |   type: 'test'
  |   ...
  | # Subtest: refuses a seed file that is itself a link
  | ok 6 - refuses a seed file that is itself a link
  |   ---
  |   duration_ms: 187.9738
  |   type: 'test'
  |   ...
  | # Subtest: refuses to overwrite a seed changed after installation
  | ok 7 - refuses to overwrite a seed changed after installation
  |   ---
  |   duration_ms: 212.2168
  |   type: 'test'
  |   ...
  | 1..7
  | # tests 7
  | # suites 0
  | # pass 7
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 1252.6029
- 2026-08-09T22:26:15Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T22:26:12Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T22:29:31Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T22:28:28Z, exit 0 in 63.1s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | .
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\clean-project\.agent-foundry-backups\20260809T222927342Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\clean-project
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\seed-upgrade-project\.agent-foundry-backups\20260809T222928958Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\seed-upgrade-project
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\clean-project\.agent-foundry-backups\20260809T222930556Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.28.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JkLniL\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T22:29:41Z — note: cold review: Codex CLI 0.145.0, answer-only, ephemeral, both axes. Round 1: SPEC PASS; STANDARDS found the link test placed the linked path first, so a per-path check-then-mutate regression could still pass. Accepted: the test now puts a cleanly restorable tracked path first and asserts it was NOT restored. Declined the related suggestion to assert git invocation count, which needs an injected git runner this payload script does not have; the reordered test pins the behavior that matters. Round 2: PASS on both axes.
