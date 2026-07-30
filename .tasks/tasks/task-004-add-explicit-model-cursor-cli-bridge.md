---
id: task-004
title: Add explicit-model Cursor CLI bridge
status: done
priority: p1
tags: [area:workflow, area:skills]
blockedBy: []
createdAt: "2026-07-30T17:28:25Z"
updatedAt: "2026-07-30T17:47:56Z"
---

<!-- task-tracker:description -->
## Description

Add a small, shared Cursor Agent CLI integration to both installed harnesses.
Cursor remains operator-selected rather than automatic, requires an exact
model ID, defaults to read-only review/planning, and gates implementation work
behind explicit authorization and Cursor worktree isolation. Keep the standard
Claude/Codex counterpart bridges as the automatic cold-review defaults.

<!-- task-tracker:log -->
## Log

- 2026-07-30T17:28:25Z — created (status: backlog)
- 2026-07-30T17:28:32Z — note: rubric: (1) both harnesses install one synchronized cursor-cli skill with a tested cross-platform wrapper; (2) every invocation requires an explicit operator-selected Cursor model and Cursor is never selected implicitly; (3) review defaults are read-only and count as cross-family cold review only when the selected model family differs from the implementer; (4) write-capable work requires explicit operator authorization, scoped workspace, sandbox, and post-run diff review without force/yolo/trust; (5) VERSION and CHANGELOG give concrete upgrade actions; (6) skill sync, wrapper tests, structural validation, disposable bootstrap, and cold SPEC/STANDARDS review pass
- 2026-07-30T17:28:32Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-30T17:29:03Z — note: live CLI finding: Cursor refuses noninteractive execution until workspace trust is established. Revised safety rule: never use force/yolo; permit --trust only for an explicit scoped workspace, with read-only ask/plan by default and write mode additionally gated by explicit operator authorization plus --allow-write.
- 2026-07-30T17:29:13Z — note: live CLI finding: Cursor sandbox is unavailable on this Windows host. Revised write isolation: delegated write mode must use Cursor's --worktree isolation; ask/plan modes remain read-only. Do not weaken to in-place force/yolo.
- 2026-07-30T17:34:13Z — run: node --test starter/.agents/skills/cursor-cli/scripts/cursor-agent.test.mjs starter/.claude/skills/cursor-cli/scripts/cursor-agent.test.mjs
  started 2026-07-30T17:34:13Z, exit 0 in 0.2s
  output tail (truncated to last 30 lines):
  |   duration_ms: 0.2107
  |   type: 'test'
  |   ...
  | # Subtest: combines instructions with inline, file, or stdin context
  | ok 10 - combines instructions with inline, file, or stdin context
  |   ---
  |   duration_ms: 2.4811
  |   type: 'test'
  |   ...
  | # Subtest: rejects ambiguous or unsupported options
  | ok 11 - rejects ambiguous or unsupported options
  |   ---
  |   duration_ms: 0.1901
  |   type: 'test'
  |   ...
  | # Subtest: launches a Windows command shim and sends payload on stdin
  | ok 12 - launches a Windows command shim and sends payload on stdin
  |   ---
  |   duration_ms: 28.8567
  |   type: 'test'
  |   ...
  | 1..12
  | # tests 12
  | # suites 0
  | # pass 12
  | # fail 0
  | # cancelled 0
  | # skipped 0
  | # todo 0
  | # duration_ms 101.6505
- 2026-07-30T17:34:22Z — run: node starter/.agents/skills/cursor-cli/scripts/cursor-agent.mjs --model gpt-5.4-mini-low --prompt Reply_exactly_CURSOR_WRAPPER_OK
  started 2026-07-30T17:34:13Z, exit 0 in 8.4s
  output:
  | Reply_exactly_CURSOR_WRAPPER_OK
- 2026-07-30T17:34:22Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T17:34:22Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (12 shared skills)
- 2026-07-30T17:34:25Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T17:34:22Z, exit 0 in 2.8s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T17:34:51Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T17:34:51Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (12 shared skills)
- 2026-07-30T17:34:51Z — run: git diff --check
  started 2026-07-30T17:34:51Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T17:34:51Z — moved to review
- 2026-07-30T17:42:50Z — note: round 1 rung 1 (Claude counterpart CLI) adjudication: accepted explicit workspace before trust, centralized Cursor-family rung policy in SDLC, root CLAUDE count, portable process/error coverage, honest Windows residual risk, wrapped model listing, objective text, and live worktree proof. Live gpt-5.4-mini-low write probe created only C:/Users/shift/.cursor/worktrees/agent-foundry-cursor-probe/master-165; caller checkout stayed unchanged; worktree, branch, and probe repo were removed. Rejected with live evidence: run-checks.mjs exists and discovers payload tests; starter/CLAUDE.md delegates the shared skill table to AGENTS.md; changelog uses its required Changed heading.
- 2026-07-30T17:42:50Z — run: node --test starter/.agents/skills/cursor-cli/scripts/cursor-agent.test.mjs starter/.claude/skills/cursor-cli/scripts/cursor-agent.test.mjs
  started 2026-07-30T17:42:50Z, exit 0 in 0.2s
  output tail (truncated to last 30 lines):
  |   duration_ms: 0.4131
  |   type: 'test'
  |   ...
  | # Subtest: rejects cmd metacharacters and translates missing executables
  | ok 16 - rejects cmd metacharacters and translates missing executables
  |   ---
  |   duration_ms: 2.0926
  |   type: 'test'
  |   ...
  | # Subtest: launches a POSIX executable and sends payload on stdin
  | ok 17 - launches a POSIX executable and sends payload on stdin # SKIP
  |   ---
  |   duration_ms: 0.0774
  |   type: 'test'
  |   ...
  | # Subtest: launches a Windows command shim and sends payload on stdin
  | ok 18 - launches a Windows command shim and sends payload on stdin
  |   ---
  |   duration_ms: 33.6856
  |   type: 'test'
  |   ...
  | 1..18
  | # tests 18
  | # suites 0
  | # pass 16
  | # fail 0
  | # cancelled 0
  | # skipped 2
  | # todo 0
  | # duration_ms 121.9814
- 2026-07-30T17:42:50Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T17:42:50Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (12 shared skills)
- 2026-07-30T17:42:53Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T17:42:50Z, exit 0 in 3.0s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T17:45:45Z — note: round 2 rung 1 (Claude counterpart CLI) adjudication: accepted leading-flag model rejection, SDLC rung-1 upgrade reconciliation, nonzero Cursor exit coverage, and single-source model-list arguments. SPEC had no behavioral finding beyond the pending disposable bootstrap gate.
- 2026-07-30T17:45:45Z — run: node --test starter/.agents/skills/cursor-cli/scripts/cursor-agent.test.mjs starter/.claude/skills/cursor-cli/scripts/cursor-agent.test.mjs
  started 2026-07-30T17:45:45Z, exit 0 in 0.3s
  output tail (truncated to last 30 lines):
  |   duration_ms: 1.5733
  |   type: 'test'
  |   ...
  | # Subtest: launches a POSIX executable and sends payload on stdin
  | ok 18 - launches a POSIX executable and sends payload on stdin # SKIP
  |   ---
  |   duration_ms: 0.0575
  |   type: 'test'
  |   ...
  | # Subtest: translates a nonzero Cursor exit
  | ok 19 - translates a nonzero Cursor exit
  |   ---
  |   duration_ms: 36.2866
  |   type: 'test'
  |   ...
  | # Subtest: launches a Windows command shim and sends payload on stdin
  | ok 20 - launches a Windows command shim and sends payload on stdin
  |   ---
  |   duration_ms: 82.8364
  |   type: 'test'
  |   ...
  | 1..20
  | # tests 20
  | # suites 0
  | # pass 18
  | # fail 0
  | # cancelled 0
  | # skipped 2
  | # todo 0
  | # duration_ms 204.1083
- 2026-07-30T17:45:45Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-30T17:45:45Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (12 shared skills)
- 2026-07-30T17:45:48Z — run: node scripts/validate-foundry.mjs
  started 2026-07-30T17:45:45Z, exit 0 in 2.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-30T17:46:11Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-30T17:45:48Z, exit 0 in 23.5s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.9.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-cS8crl\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-cS8crl\clean-project\.agent-foundry-backups\20260730T174611164Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.9.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-cS8crl\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-cS8crl\clean-project\.agent-foundry-backups\20260730T174611606Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.9.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-cS8crl\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-30T17:46:12Z — run: git diff --check
  started 2026-07-30T17:46:11Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-30T17:47:56Z — note: round 3 final cold review at ladder rung 1 (Claude counterpart CLI): SPEC PASS and STANDARDS PASS on the frozen validated packet.
- 2026-07-30T17:47:56Z — moved to done
