---
id: task-017
title: Adopt agent-headless as the unified provider bridge
status: review
priority: p1
tags: [area:workflow, area:release]
blockedBy: []
createdAt: "2026-08-03T18:30:37Z"
updatedAt: "2026-08-03T19:20:05Z"
---

<!-- task-tracker:description -->
## Description

Harden the standalone agent-headless package for Node 20 and native Windows, borrow useful capability/event/testing/process ideas from researched alternatives without taking a dependency, then replace Foundry's three provider-mechanics skills with one shared agent-headless skill while retaining directional cold-review policy and a documented compatibility transition.

<!-- task-tracker:log -->
## Log

- 2026-08-03T18:30:37Z — created (status: backlog)
- 2026-08-03T18:30:46Z — note: rubric: (1) agent-headless runs as a packaged Node 20 CLI/library on Windows with no Bun runtime requirement and deterministic provider/capability/process tests; (2) useful external ideas are represented proportionally: runtime capability status, normalized lifecycle events, safe cancellation/process cleanup, mockable execution, and a compatibility matrix, without permissive bypass defaults or orchestration creep; (3) Foundry installs one shared agent-headless workflow in both harnesses while directional cold-review selection remains authoritative in SDLC; (4) existing provider skills have an explicit compatibility/upgrade path with validation preventing stale or contradictory guidance; (5) version/changelog/upgrade docs identify installed behavior changes; (6) package and Foundry focused/full gates plus cold SPEC and STANDARDS reviews pass.
- 2026-08-03T18:30:46Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-03T18:40:41Z — note: decision: provisionally vendor one validated agent-headless 0.2.0 Node bundle under .agent-foundry so clean installs remain dependency-free; keep provider routing in SDLC and preserve old skill/script names through 0.15.x as compatibility aliases. ADR 0001 records alternatives and costs.
- 2026-08-03T18:41:43Z — run: bun --cwd N:\agent-headless run check
  started 2026-08-03T18:41:43Z, exit 0 in 0.1s
  output tail (truncated to last 30 lines):
  |       --cwd=<val>                     Absolute path to resolve files & entry points from. This just changes the process' cwd.
  |   -c, --config=<val>                  Specify path to Bun config file. Default <d>$cwd<r>/bunfig.toml
  |   -h, --help                          Display this menu and exit
  |
  | Examples:
  |   Run a JavaScript or TypeScript file
  |   bun run ./index.js
  |   bun run ./index.tsx
  |
  |   Run a package.json script
  |   bun run dev
  |   bun run lint
  |
  | Full documentation is available at https://bun.com/docs/cli/run
  |
  | package.json scripts (5 found):
  |   $ bun run build
  |     bun build ./src/index.ts ./src/cli.ts --outdir ./dist --target node --format esm && bunx tsc -p tsconfig.build.json --emitDeclarationOnly
  |
  |   $ bun run check
  |     bunx tsc --noEmit && bun run test && bun run build && node --test test/node-runtime.test.mjs
  |
  |   $ bun run test
  |     bun test test/adapters.test.ts test/runtime.test.ts test/validation.test.ts test/live.test.ts
  |
  |   $ bun run test:live
  |     bun test ./test/live.test.ts
  |
  |   $ bun run prepack
  |     bun run check && bun run build
- 2026-08-03T18:41:46Z — run: node scripts/validate-foundry.mjs
  started 2026-08-03T18:41:43Z, exit 0 in 3.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-03T18:42:24Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-03T18:41:46Z, exit 0 in 37.5s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | .......
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\clean-project\.agent-foundry-backups\20260803T184220064Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\clean-project
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\seed-upgrade-project\.agent-foundry-backups\20260803T184221912Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\clean-project\.agent-foundry-backups\20260803T184223565Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-fwei1n\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-03T18:42:24Z — run: node -e process.chdir('starter'); import('./starter/.agent-foundry/check-skill-sync.mjs')
  started 2026-08-03T18:42:24Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-08-03T18:42:42Z — run: bun run --cwd N:\agent-headless check
  started 2026-08-03T18:42:37Z, exit 0 in 5.1s
  output tail (truncated to last 30 lines):
  | (pass) CursorAdapter > parses Cursor JSONL
  | (pass) protocol validation > rejects malformed and incomplete JSONL
  |
  | test\live.test.ts:
  | (skip) Claude headless adapter completes a structured answer-only run
  | (skip) Codex headless adapter completes a structured answer-only run
  | (skip) Cursor headless adapter completes a structured answer-only run
  |
  | test\runtime.test.ts:
  | (pass) onEvent receives JSONL before the provider exits [485.00ms]
  | (pass) an already-aborted signal never launches the provider
  | (pass) capability probing launches a Windows cmd shim and reports resolved availability [109.00ms]
  |
  | test\validation.test.ts:
  | (pass) normalizeRequest > uses ephemeral sessions for Claude and Codex
  | (pass) normalizeRequest > uses persistent sessions for Cursor because it has no ephemeral flag
  | (pass) normalizeRequest > rejects missing prompt and nonexistent cwd
  | (pass) Windows command resolution uses the real case-preserved Path key [16.00ms]
  |
  | 3 tests skipped:
  | (skip) Claude headless adapter completes a structured answer-only run
  | (skip) Codex headless adapter completes a structured answer-only run
  | (skip) Cursor headless adapter completes a structured answer-only run
  |
  |  26 pass
  |  3 skip
  |  0 fail
  |  50 expect() calls
  | Ran 29 tests across 4 files. [673.00ms]
  | $ bun build ./src/index.ts ./src/cli.ts --outdir ./dist --target node --format esm && bunx tsc -p tsconfig.build.json --emitDeclarationOnly
- 2026-08-03T18:52:03Z — note: friction: the 18:41:43 bun command printed help and exited zero because cwd was positioned incorrectly. It is invalid evidence; the later bun run --cwd command is the real package gate.
- 2026-08-03T18:52:03Z — note: review round 1: rung 1, Claude Code 2.1.220, separate SPEC and STANDARDS calls through bundled agent-headless. Confirmed and fixed provenance reproducibility/license/hash, payload ADR leakage, stale root/template/orchestration guidance, Windows Cursor sandbox handling, compatibility test retention, payload behavior tests, safety claim/guard scope, partial failure output, streaming parse visibility, and compatibility matrix. ADR 0001 remains source-only proposed under the SDLC reversibility rule; no release publication occurs without explicit acceptance.
- 2026-08-03T18:52:33Z — run: bun run --cwd N:\agent-headless check
  started 2026-08-03T18:52:29Z, exit 0 in 4.7s
  output tail (truncated to last 30 lines):
  | (pass) CursorAdapter > parses Cursor JSONL
  | (pass) protocol validation > rejects malformed and incomplete JSONL
  |
  | test\live.test.ts:
  | (skip) Claude headless adapter completes a structured answer-only run
  | (skip) Codex headless adapter completes a structured answer-only run
  | (skip) Cursor headless adapter completes a structured answer-only run
  |
  | test\runtime.test.ts:
  | (pass) onEvent receives JSONL before the provider exits [469.00ms]
  | (pass) an already-aborted signal never launches the provider
  | (pass) capability probing launches a Windows cmd shim and reports resolved availability [94.00ms]
  |
  | test\validation.test.ts:
  | (pass) normalizeRequest > uses ephemeral sessions for Claude and Codex
  | (pass) normalizeRequest > uses persistent sessions for Cursor because it has no ephemeral flag
  | (pass) normalizeRequest > rejects missing prompt and nonexistent cwd
  | (pass) Windows command resolution uses the real case-preserved Path key
  |
  | 3 tests skipped:
  | (skip) Claude headless adapter completes a structured answer-only run
  | (skip) Codex headless adapter completes a structured answer-only run
  | (skip) Cursor headless adapter completes a structured answer-only run
  |
  |  27 pass
  |  3 skip
  |  0 fail
  |  52 expect() calls
  | Ran 30 tests across 4 files. [639.00ms]
  | $ bun build ./src/index.ts ./src/cli.ts --outdir ./dist --target node --format esm && bunx tsc -p tsconfig.build.json --emitDeclarationOnly
- 2026-08-03T18:52:42Z — run: node --test starter/.agent-foundry/agent-headless/cli.test.mjs starter/.agents/skills/claude-in-codex/scripts/claude-ask.test.mjs starter/.agents/skills/cursor-cli/scripts/cursor-agent.test.mjs starter/.claude/skills/cursor-cli/scripts/cursor-agent.test.mjs
  started 2026-08-03T18:52:42Z, exit 0 in 0.3s
  output tail (truncated to last 30 lines):
  |   duration_ms: 1.3508
  |   type: 'test'
  |   ...
  | # Subtest: launches a POSIX executable and sends payload on stdin
  | ok 27 - launches a POSIX executable and sends payload on stdin # SKIP
  |   ---
  |   duration_ms: 0.0511
  |   type: 'test'
  |   ...
  | # Subtest: translates a nonzero Cursor exit
  | ok 28 - translates a nonzero Cursor exit
  |   ---
  |   duration_ms: 26.7831
  |   type: 'test'
  |   ...
  | # Subtest: launches a Windows command shim and sends payload on stdin
  | ok 29 - launches a Windows command shim and sends payload on stdin
  |   ---
  |   duration_ms: 31.0822
  |   type: 'test'
  |   ...
  | 1..29
  | # tests 29
  | # suites 0
  | # pass 27
  | # fail 0
  | # cancelled 0
  | # skipped 2
  | # todo 0
  | # duration_ms 245.5366
- 2026-08-03T18:52:51Z — run: node scripts/validate-foundry.mjs
  started 2026-08-03T18:52:48Z, exit 0 in 2.7s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-03T19:02:34Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-03T19:01:52Z, exit 0 in 41.8s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | .............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\clean-project\.agent-foundry-backups\20260803T190229851Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\clean-project
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\seed-upgrade-project\.agent-foundry-backups\20260803T190231797Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\clean-project\.agent-foundry-backups\20260803T190233450Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-JSMHK9\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-03T19:04:09Z — note: review round 2: rung 1, Claude Code 2.1.220, separate SPEC and STANDARDS calls. Fixed least-privilege default access, live cancellation coverage, vendored adapter argv tests, external CLI verification stamps, CLI resume help, source reconstruction from a public base, stale compatibility prose, provenance-derived bootstrap versioning, and validation of aliases plus cold-review packet commands. Findings about the cold-review reference were packet-evidence gaps; the live file contains both required commands and is now pinned by validation.
- 2026-08-03T19:04:17Z — run: node scripts/validate-foundry.mjs
  started 2026-08-03T19:04:14Z, exit 0 in 2.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-03T19:04:22Z — run: node --test starter/.agent-foundry/agent-headless/cli.test.mjs
  started 2026-08-03T19:04:21Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   duration_ms: 58.4996
  |   type: 'test'
  |   ...
  | # Subtest: default invocations are answer-only and exclude dangerous bypass flags
  | ok 4 - default invocations are answer-only and exclude dangerous bypass flags
  |   ---
  |   duration_ms: 2.2824
  |   type: 'test'
  |   ...
  | # Subtest: Cursor isolated writes do not claim sandboxing on Windows
  | ok 5 - Cursor isolated writes do not claim sandboxing on Windows
  |   ---
  |   duration_ms: 0.7902
  |   type: 'test'
  |   ...
  | # Subtest: live cancellation terminates the bundled process runner
  | ok 6 - live cancellation terminates the bundled process runner
  |   ---
  |   duration_ms: 566.3976
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
  | # duration_ms 810.6445
- 2026-08-03T19:15:48Z — note: review round 3: initial 600 KB SPEC/STANDARDS calls both exited without results, so no verdict was substituted. Retried same rung with generated bundles/base64 patches represented by verified hashes and the exact authored upstream source diff. Confirmed and fixed actionable findings: current full-gate reruns, actionable upgrade commands, Cursor alias validation, both-bundle bypass scanning, SDLC-only routing, honest CLI verification dates, installed compatibility matrix, .agent-foundry ownership docs, symmetric write precautions, and installed run-checks/mold-tier assertions. Residual decision: source-only ADR 0001 remains proposed; publication awaits explicit operator acceptance.
- 2026-08-03T19:15:48Z — moved to review
- 2026-08-03T19:16:02Z — run: bun run --cwd N:\agent-headless check
  started 2026-08-03T19:15:57Z, exit 0 in 5.4s
  output tail (truncated to last 30 lines):
  |
  | test\live.test.ts:
  | (skip) Claude headless adapter completes a structured answer-only run
  | (skip) Codex headless adapter completes a structured answer-only run
  | (skip) Cursor headless adapter completes a structured answer-only run
  |
  | test\runtime.test.ts:
  | (pass) onEvent receives JSONL before the provider exits [469.00ms]
  | (pass) an already-aborted signal never launches the provider
  | (pass) capability probing launches a Windows cmd shim and reports resolved availability [110.00ms]
  | (pass) mid-run cancellation terminates a live provider process [687.00ms]
  |
  | test\validation.test.ts:
  | (pass) normalizeRequest > uses ephemeral sessions for Claude and Codex
  | (pass) normalizeRequest > uses persistent sessions for Cursor because it has no ephemeral flag
  | (pass) normalizeRequest > defaults every new session to least-privilege answer-only access
  | (pass) normalizeRequest > rejects missing prompt and nonexistent cwd
  | (pass) Windows command resolution uses the real case-preserved Path key
  |
  | 3 tests skipped:
  | (skip) Claude headless adapter completes a structured answer-only run
  | (skip) Codex headless adapter completes a structured answer-only run
  | (skip) Cursor headless adapter completes a structured answer-only run
  |
  |  29 pass
  |  3 skip
  |  0 fail
  |  58 expect() calls
  | Ran 32 tests across 4 files. [1339.00ms]
  | $ bun build ./src/index.ts ./src/cli.ts --outdir ./dist --target node --format esm && bunx tsc -p tsconfig.build.json --emitDeclarationOnly
- 2026-08-03T19:16:09Z — run: node scripts/validate-foundry.mjs
  started 2026-08-03T19:16:06Z, exit 0 in 2.6s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-03T19:17:09Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-03T19:16:12Z, exit 1 in 56.2s
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
  | ....................
  | ....................
  | ....................
  | .............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-K7jK3A\clean-project
  | file:///N:/agent-foundry/scripts/test-bootstrap.mjs:372
  |     manifest.files[".agent-foundry/agent-headless/cli.js"].tier,
  |                   ^
  |
  | TypeError: Cannot read properties of undefined (reading '.agent-foundry/agent-headless/cli.js')
  |     at file:///N:/agent-foundry/scripts/test-bootstrap.mjs:372:19
  |     at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
  |     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
  |     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
  |
  | Node.js v22.22.2
- 2026-08-03T19:18:26Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-03T19:17:23Z, exit 0 in 62.9s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | .............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\clean-project\.agent-foundry-backups\20260803T191822622Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\clean-project
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\seed-upgrade-project\.agent-foundry-backups\20260803T191824383Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\clean-project\.agent-foundry-backups\20260803T191825647Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.15.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-LsnFwp\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-03T19:18:38Z — run: node starter/.agent-foundry/agent-headless/cli.js capabilities
  started 2026-08-03T19:18:37Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  |     "sessions": [
  |       "ephemeral",
  |       "persistent",
  |       "resume"
  |     ],
  |     "supportsModel": true,
  |     "supportsEffort": true,
  |     "supportsSchema": true,
  |     "supportsModelListing": false
  |   },
  |   {
  |     "provider": "cursor",
  |     "executable": "C:\\Users\\shift\\AppData\\Local\\cursor-agent\\agent.CMD",
  |     "availability": "available",
  |     "version": "2026.07.23-e383d2b",
  |     "access": [
  |       "answer-only",
  |       "inspect",
  |       "edit-isolated"
  |     ],
  |     "sessions": [
  |       "persistent",
  |       "resume"
  |     ],
  |     "supportsModel": true,
  |     "supportsEffort": true,
  |     "supportsSchema": false,
  |     "supportsModelListing": true
  |   }
  | ]
- 2026-08-03T19:20:05Z — run: git -C N:\temp\agent-headless-reconstruct-20260803 diff --exit-code 3a631b93e48c88e3f9fcf96ac0509ed4112db371 --
  started 2026-08-03T19:20:05Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-08-03T19:20:05Z — note: Cold review cap completed: three SPEC and three STANDARDS rounds. All must-fix findings were addressed. Final gates passed: agent-headless 29 tests passed/3 live skipped plus 2 Node tests; Foundry structural validation passed; bundled payload 6/6 tests passed; clean bootstrap and installed full run-checks passed; all three installed CLIs reported available; vendored source patches reconstructed the exact reviewed source tree. Residual adjudicated risks: validator negative-fixture coverage is a possible later hardening task; source-to-artifact binding is verified by hashes and reconstruction evidence rather than an automatic Bun rebuild in the dependency-free Foundry gate. ADR 0001 remains proposed and requires explicit operator acceptance before release finalization.
