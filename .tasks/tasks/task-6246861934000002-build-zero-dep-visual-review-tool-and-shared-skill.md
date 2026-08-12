---
id: task-6246861934000002
title: Build zero-dep visual-review tool and shared skill pair
status: done
priority: p2
tags: [area:tooling]
blockedBy: [task-6246861934000001]
createdAt: "2026-08-11T23:06:07Z"
updatedAt: "2026-08-12T00:09:57Z"
---

<!-- task-tracker:description -->
## Description

Implement the approved option (b) from docs/research/visual-artifact-review-strategy-2026-08-11.md: a zero-dependency Node script in the starter payload implementing the core review loop only - serve one HTML artifact on 127.0.0.1 via node:http, inject one SDK script tag by string transform, element and text-selection annotation UI, prompt queue, long-poll endpoint for the agent, live reload via fs.watch, print the URL (no browser auto-open). Out of scope: whiteboard, layout audit, sharing, telemetry, playbooks. Security requirements: loopback-only bind, Host-header validation, zero outbound network calls, artifact-directory confinement, sandboxed iframe without allow-same-origin. Ship as a new shared skill in BOTH harness trees (.claude canonical, mirrored to .agents) with a payload *.test.mjs so test-bootstrap exercises it. Cross-platform (Windows) required.

<!-- task-tracker:log -->
## Log

- 2026-08-11T23:06:07Z — created (status: backlog)
- 2026-08-11T23:49:07Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-11T23:51:21Z — note: rubric: (1) starter/.claude/skills/visual-review/ and starter/.agents/skills/visual-review/ exist with SKILL.md, scripts/visual-review.mjs, scripts/visual-review.test.mjs; check-skill-sync reports 16 shared skills PASS. (2) node --test on visual-review.test.mjs passes, including tests that the server binds 127.0.0.1 only, returns 403 on a foreign Host header, refuses path escapes outside the artifact directory, serves the artifact with exactly one injected SDK script tag, and delivers a queued annotation through the long-poll endpoint. (3) The script uses only node: built-ins, makes zero outbound network calls, never auto-opens a browser (prints the URL), and the shell page iframe sandbox attribute omits allow-same-origin. (4) SKILL.md points to docs/SDLC.md for review-model placement and restates no cold-review rules. (5) validate-foundry passes on every check except the hardcoded 15-skill count/list, which task-6246861934000003 owns.
- 2026-08-11T23:51:33Z — note: outline: single zero-dep script visual-review.mjs. CLI: 'serve <artifact.html> [--port N] [--poll-timeout-ms N]' starts server, prints URL; 'poll --url <base> [--after N] [--timeout-ms N]' does one long-poll and prints JSON (agent convenience). Exports for tests: injectSdk(html), hostAllowed(hostHeader), resolveStatic(artifactDir, urlPath), startServer(opts). HTTP surface: GET / (shell page: sandboxed iframe allow-scripts only, annotation sidebar), GET /artifact (artifact file with one SDK tag string-injected before </body>), GET /__vr_sdk.js (iframe-side capture of element clicks + text selections, postMessage to parent), POST /api/annotations (queue, seq-numbered), GET /api/poll?after=N (long-poll), POST /api/complete (operator-done event), GET /api/reload?after=N (fs.watch-driven live-reload long-poll), GET /api/health, fallback GET static confined to artifact dir. Least-confident choices: (a) click-to-select always preventDefaults inside the artifact iframe - review mode over interactivity; (b) selector generation is id-or-nth-of-type path, no uniqueness proof; (c) /api/reload long-poll instead of SSE to keep one parking mechanism; (d) in-memory queue only, no persistence across server restarts.
- 2026-08-11T23:56:09Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-11T23:56:08Z, exit 0 in 0.8s
  output tail (truncated to last 30 lines):
  | ▶ hostAllowed
  |   ✔ accepts loopback names with and without the port (0.1025ms)
  |   ✔ rejects foreign, wrong-port, and missing hosts (0.9339ms)
  | ✔ hostAllowed (1.1531ms)
  | ▶ resolveStatic
  |   ✔ serves a file inside the artifact directory (0.4192ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.0996ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.7643ms)
  | ✔ resolveStatic (2.2125ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2162ms)
  |   ✔ rejects a foreign Host header on every route (11.5592ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9663ms)
  |   ✔ serves the artifact with the SDK tag injected (1.2373ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.3281ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (13.5738ms)
  |   ✔ parks a long-poll until an annotation arrives (81.1396ms)
  |   ✔ returns an empty batch when the long-poll times out (122.1446ms)
  |   ✔ rejects malformed annotation payloads (45.4333ms)
  |   ✔ bumps the reload version when the artifact directory changes (325.727ms)
  |   ✔ refuses to start on a missing artifact (0.5159ms)
  | ✔ visual-review server (618.0941ms)
  | ℹ tests 19
  | ℹ suites 4
  | ℹ pass 19
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 729.6972
- 2026-08-11T23:56:15Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-11T23:56:14Z, exit 0 in 0.8s
  output tail (truncated to last 30 lines):
  | ▶ hostAllowed
  |   ✔ accepts loopback names with and without the port (0.1064ms)
  |   ✔ rejects foreign, wrong-port, and missing hosts (0.5897ms)
  | ✔ hostAllowed (0.8079ms)
  | ▶ resolveStatic
  |   ✔ serves a file inside the artifact directory (0.3925ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.0904ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.8111ms)
  | ✔ resolveStatic (2.1467ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2103ms)
  |   ✔ rejects a foreign Host header on every route (9.9919ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.8943ms)
  |   ✔ serves the artifact with the SDK tag injected (1.3208ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.6707ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (12.3248ms)
  |   ✔ parks a long-poll until an annotation arrives (82.1235ms)
  |   ✔ returns an empty batch when the long-poll times out (107.5208ms)
  |   ✔ rejects malformed annotation payloads (44.5991ms)
  |   ✔ bumps the reload version when the artifact directory changes (326.2344ms)
  |   ✔ refuses to start on a missing artifact (0.5322ms)
  | ✔ visual-review server (602.4057ms)
  | ℹ tests 19
  | ℹ suites 4
  | ℹ pass 19
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 681.5918
- 2026-08-11T23:56:15Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-11T23:56:15Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-11T23:56:24Z — note: smoke: real CLI invocation performed - 'serve' on a fixture page printed the URL and did not open a browser; /api/health OK; POST /api/annotations returned seq 1; 'poll --url http://127.0.0.1:45911 --after 0' returned the queued event as JSON; GET / with Host: evil.example returned 403. Server then stopped and port freed.
- 2026-08-11T23:56:24Z — note: validate-foundry not recorded green on this task by design: its hardcoded 15-skill count and sharedSkills list, plus test-bootstrap's '15 shared skills' regex and prose counts, are owned by task-6246861934000003. All other validate-foundry lenses were kept satisfied (UTF-8, frontmatter, balanced fences, no cross-tree paths, no absolute host paths, no tokens, no .ps1).
- 2026-08-11T23:56:59Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-11T23:56:58Z, exit 0 in 0.8s
  output tail (truncated to last 30 lines):
  | ▶ hostAllowed
  |   ✔ accepts loopback names with and without the port (0.0996ms)
  |   ✔ rejects foreign, wrong-port, and missing hosts (0.5713ms)
  | ✔ hostAllowed (0.784ms)
  | ▶ resolveStatic
  |   ✔ serves a file inside the artifact directory (0.3898ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.0961ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.7013ms)
  | ✔ resolveStatic (2.077ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2017ms)
  |   ✔ rejects a foreign Host header on every route (10.7478ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9302ms)
  |   ✔ serves the artifact with the SDK tag injected (1.3608ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.3916ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (11.9159ms)
  |   ✔ parks a long-poll until an annotation arrives (96.9554ms)
  |   ✔ returns an empty batch when the long-poll times out (124.3268ms)
  |   ✔ rejects malformed annotation payloads (47.7121ms)
  |   ✔ bumps the reload version when the artifact directory changes (328.8908ms)
  |   ✔ refuses to start on a missing artifact (0.4347ms)
  | ✔ visual-review server (639.1289ms)
  | ℹ tests 19
  | ℹ suites 4
  | ℹ pass 19
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 737.8568
- 2026-08-11T23:57:12Z — moved to review
- 2026-08-11T23:59:07Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0002-r1 --cwd .
  started 2026-08-11T23:57:59Z, exit 0 in 68.2s
  output tail (truncated to last 30 lines):
  |  | severity high | confidence high\n\n2. starter/.claude/skills/visual-review/scripts/visual-review.mjs: injectSdk (mirrored under .agents) | rubric 2: artifact has exactly one injected SDK script tag | The transform always adds a tag without removing or detecting an existing `<script src=\"/__vr_sdk.js\">`; such an artifact is served with two SDK tags and duplicate annotation handlers. The test covers only input without a pre-existing SDK tag. | severity med | confidence high\n\n3. recorded gate evidence | rubric 5; objective that test-bootstrap exercises the payload test | The packet contains no `node scripts/validate-foundry.mjs` result, so it does not establish that every check other than the expressly excluded 15-skill wiring passes. It also contains no `node scripts/test-bootstrap.mjs` result showing that bootstrap discovers and executes the new payload tests. This finding does not concern the deferred count/list failures themselves. | severity med | confidence high\n\nCHECKED\n\n- Architecture decision: verified the packet identifies accepted ADR 0003 and matches option (b)’s core-loop scope.\n- Shared-skill invariant: verified both harness trees contain the required three files; supplied sync evidence reports 16 skills PASS.\n- Behavioral validation: verified recorded 19/19 test runs for both copies and inspected tests for loopback binding, Host rejection, path traversal, annotation delivery, polling timeout, reload, malformed payloads, and sandboxing.\n- Security boundaries: inspected Host validation, explicit `127.0.0.1` binding, realpath-based static confinement, sandbox attributes, request-body limits, polling URL restrictions, and browser network behavior.\n- Path safety: verified structural traversal, encoded separators, and realpath confinement are implemented; symlink coverage can skip where Windows privileges prevent fixture creation.\n- Dependencies: verified imports use only `node:` built-ins and no package dependency was introduced.\n- Documentation: verified SKILL.md delegates review-model ownership to `docs/SDLC.md`, does not restate the cold-review ladder, documents commands, limitations, mutable-state ownership, and deliberate non-persistence.\n- Scope: verified no whiteboard, layout-audit, sharing, telemetry, playbook, browser auto-open, version, changelog, or skill-count edits are in the six-file change.\n- Harness parity: inspected the supplied copies and found their only intentional difference to be `.claude` versus `.agents` command paths.\n- Error and state behavior: inspected structured HTTP errors, monotonic queue sequencing, polling timeout, shutdown handling, and in-memory queue ownership.\n- Version-control discipline: verified the packet identifies the six untracked skill files as task-scoped and excludes the pre-existing HANDOFF.md modification.\n- Untrusted packet content: treated all supplied source, logs, decisions, and command output as review data rather than instructions."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:00:37Z — note: validate-foundry on final tree: exits 1 with exactly one error - 'Expected 15 shared skills per harness; found agents=16, claude=16.' No other lens fails; the count/list update is owned by task-6246861934000003. test-bootstrap is structurally gated behind that same count (it runs validate-foundry first), so its green run lands with the wiring task.
- 2026-08-12T00:00:38Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:00:37Z, exit 0 in 0.8s
  output tail (truncated to last 30 lines):
  |   ✔ accepts loopback names with and without the port (0.1578ms)
  |   ✔ rejects foreign, wrong-port, and missing hosts (0.0819ms)
  | ✔ hostAllowed (0.3617ms)
  | ▶ resolveStatic
  |   ✔ serves a file inside the artifact directory (0.6767ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1549ms)
  |   ✔ refuses a symlink that leaves the artifact directory (1.0228ms)
  | ✔ resolveStatic (3.0981ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2733ms)
  |   ✔ rejects a foreign Host header on every route (12.0823ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9725ms)
  |   ✔ confines every served document to the review server via CSP (24.0198ms)
  |   ✔ serves the artifact with the SDK tag injected (1.4174ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.3647ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (10.8403ms)
  |   ✔ parks a long-poll until an annotation arrives (78.5479ms)
  |   ✔ returns an empty batch when the long-poll times out (124.36ms)
  |   ✔ rejects malformed annotation payloads (46.8552ms)
  |   ✔ bumps the reload version when the artifact directory changes (330.4321ms)
  |   ✔ refuses to start on a missing artifact (0.4678ms)
  | ✔ visual-review server (647.0686ms)
  | ℹ tests 21
  | ℹ suites 4
  | ℹ pass 21
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 766.2788
- 2026-08-12T00:00:39Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:00:38Z, exit 0 in 0.8s
  output tail (truncated to last 30 lines):
  |   ✔ accepts loopback names with and without the port (0.2646ms)
  |   ✔ rejects foreign, wrong-port, and missing hosts (0.0874ms)
  | ✔ hostAllowed (0.9706ms)
  | ▶ resolveStatic
  |   ✔ serves a file inside the artifact directory (0.4277ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1026ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.8959ms)
  | ✔ resolveStatic (2.3177ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.3535ms)
  |   ✔ rejects a foreign Host header on every route (12.1712ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9567ms)
  |   ✔ confines every served document to the review server via CSP (26.1627ms)
  |   ✔ serves the artifact with the SDK tag injected (2.0056ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (3.0231ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (25.0402ms)
  |   ✔ parks a long-poll until an annotation arrives (94.9655ms)
  |   ✔ returns an empty batch when the long-poll times out (122.2944ms)
  |   ✔ rejects malformed annotation payloads (31.5694ms)
  |   ✔ bumps the reload version when the artifact directory changes (329.8439ms)
  |   ✔ refuses to start on a missing artifact (0.5598ms)
  | ✔ visual-review server (664.7563ms)
  | ℹ tests 21
  | ℹ suites 4
  | ℹ pass 21
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 749.5491
- 2026-08-12T00:00:39Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T00:00:39Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-12T00:04:12Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0002-r2 --cwd .
  started 2026-08-12T00:01:09Z, exit 0 in 183.2s
  output tail (truncated to last 30 lines):
  | ter/.claude/skills/visual-review/scripts/visual-review.mjs:74-81` and mirrored `.agents` copy | General/Testing — make invalid states unrepresentable and test behavior-removing inputs | `injectSdk()` treats any occurrence of `/__vr_sdk.js` as proof that exactly one SDK script tag exists. A comment containing that text produces zero tags, while an artifact containing two tags remains unchanged with two. Focused probes reproduced both cases, violating the implementation’s documented exactly-one invariant. | severity med | confidence high\n\nCHECKED\n\n- Architecture and scope: verified accepted ADR 0003 matches the implementation boundary; no unapproved extension points or out-of-scope whiteboard, sharing, telemetry, layout-audit, or playbook behavior appeared.\n- Implementation structure: inspected the complete canonical and mirrored skill, script, and test files for explicit control flow, module size, ownership boundaries, and separation of server transport, queue state, reload state, and UI presentation.\n- Errors and observability: inspected startup, parsing, routing, polling, shutdown, watcher-error, malformed-input, and HTTP error paths; checked sequence identifiers for asynchronous events.\n- State and data: verified the in-memory queue owner, monotonic ordering, `after` semantics, concurrent parked polls, timeout/empty behavior, reload versioning, and deliberate non-persistence.\n- Security and privacy: inspected loopback binding, Host validation, path decoding, traversal rejection, realpath/symlink confinement, iframe sandboxing, CSP, request-body limits, serialized-input validation, logging, and outbound-capable code. Focused probes exposed findings 1 and 2.\n- Testing: inspected all 21 tests in each mirror for success, failure, timeout, delayed delivery, malformed input, confinement, Host rejection, reload, and missing-artifact behavior. The packet records 21/21 passing in both trees; local re-execution was restricted by the review sandbox, while pure-function and server probes ran successfully.\n- Dependencies: verified runtime imports are Node built-ins only and found no package, shell-out, browser-opening, telemetry, publishing, or remote-fetch dependency.\n- Documentation: verified the documented `serve` and `poll` commands, existing `docs/SDLC.md` path, review-model ownership, limitations, and installed `execute-task`/`task-tracker` references. No cold-review procedure is restated.\n- Shared-payload invariants: executed `check-skill-sync`; it reported `PASS (16 shared skills)`. Verified all six expected files exist in both harness trees.\n- Validation wiring: inspected the payload test naming and packet evidence for bootstrap discovery and `validate-foundry`; excluded only the explicitly deferred 15-skill count/list and release wiring.\n- Version control scope: checked status and confirmed the six visual-review files are the implementation scope; the pre-existing `HANDOFF.md` change remains separate."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:05:57Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:05:56Z, exit 0 in 0.8s
  output tail (truncated to last 30 lines):
  |   ✔ rejects foreign, wrong-port, and missing hosts (0.081ms)
  | ✔ hostAllowed (0.3675ms)
  | ▶ resolveStatic
  |   ✔ serves a file inside the artifact directory (0.4568ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1106ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.7781ms)
  | ✔ resolveStatic (2.1463ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.545ms)
  |   ✔ rejects a foreign Host header on every route (10.831ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.879ms)
  |   ✔ confines every served document to the review server via CSP (18.8137ms)
  |   ✔ serves the artifact with the SDK tag injected (1.8377ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.2478ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (17.4555ms)
  |   ✔ parks a long-poll until an annotation arrives (69.304ms)
  |   ✔ returns an empty batch when the long-poll times out (124.7942ms)
  |   ✔ rejects cross-site annotation posts (14.9637ms)
  |   ✔ rejects malformed annotation payloads (45.2296ms)
  |   ✔ bumps the reload version when the artifact directory changes (326.5795ms)
  |   ✔ refuses to start on a missing artifact (0.516ms)
  | ✔ visual-review server (648.8271ms)
  | ℹ tests 24
  | ℹ suites 4
  | ℹ pass 24
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 730.5099
- 2026-08-12T00:05:58Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:05:57Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   ✔ rejects foreign, wrong-port, and missing hosts (0.1201ms)
  | ✔ hostAllowed (0.4064ms)
  | ▶ resolveStatic
  |   ✔ serves a file inside the artifact directory (0.4555ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1591ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.8316ms)
  | ✔ resolveStatic (2.4374ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.201ms)
  |   ✔ rejects a foreign Host header on every route (10.8384ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.845ms)
  |   ✔ confines every served document to the review server via CSP (13.9828ms)
  |   ✔ serves the artifact with the SDK tag injected (1.3026ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.1941ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (25.6663ms)
  |   ✔ parks a long-poll until an annotation arrives (77.9812ms)
  |   ✔ returns an empty batch when the long-poll times out (125.4597ms)
  |   ✔ rejects cross-site annotation posts (45.6136ms)
  |   ✔ rejects malformed annotation payloads (31.1782ms)
  |   ✔ bumps the reload version when the artifact directory changes (329.4439ms)
  |   ✔ refuses to start on a missing artifact (0.4558ms)
  | ✔ visual-review server (679.297ms)
  | ℹ tests 24
  | ℹ suites 4
  | ℹ pass 24
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 762.7822
- 2026-08-12T00:05:58Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T00:05:58Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-12T00:07:39Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0002-r3 --cwd .
  started 2026-08-12T00:06:29Z, exit 0 in 69.8s
  output tail (truncated to last 30 lines):
  |  delivery and provides no failure or recovery behavior | severity med | confidence high\n\n3. `starter/.claude/skills/visual-review/scripts/visual-review.mjs:shellPage` and mirrored `.agents` file | Errors and observability: do not swallow failures; review standard requiring failure, retry, and recovery checks | annotation and completion handlers await `post()` without handling rejection. If the server stops or rejects a request, the operator receives no visible failure or retry guidance, and the browser produces only an unhandled promise rejection. No behavioral test exercises this externally visible failure path | severity med | confidence high\n\nCHECKED\n\n- Architecture decision: packet identifies accepted ADR 0003 and approved option (b).\n- Shared payload: verified all six required files are present in the packet.\n- Harness synchronization: compared both payloads and reviewed recorded 16-skill sync PASS.\n- Behavioral validation: reviewed recorded 24/24 results for both harness tests.\n- Loopback binding and Host validation: inspected explicit `127.0.0.1` bind, host allowlist, and foreign-Host tests.\n- Path security: inspected traversal decoding, separator rejection, lexical confinement, `realpathSync` checks, symlink test, and the uncovered primary-artifact case.\n- SDK injection: inspected string transformation and duplicate, textual-mention, fragment, and idempotence tests.\n- Annotation transport: inspected input validation, queue sequencing, immediate polling, parked polling, timeout, and malformed-input tests.\n- Cross-site protection: inspected JSON requirement, Origin validation, and corresponding rejection tests.\n- Outbound networking: inspected imports and network calls; the only client call is the loopback-restricted poll command.\n- Browser behavior: verified the CLI prints the URL and contains no browser-open operation.\n- Iframe isolation: verified `sandbox=\"allow-scripts\"` and absence of `allow-same-origin`.\n- Browser request confinement: inspected CSP on shell, artifact, and static responses, including `frame-src 'self'`.\n- Live reload: inspected `fs.watch`, debounce, reload polling, success test, and missing failure handling.\n- Mutable state: verified annotations and reload state have explicit in-memory owners and monotonic sequence/version values.\n- Dependencies: verified implementation and tests import only `node:` built-ins.\n- Documentation: verified named serve and poll commands correspond to implemented CLI forms; verified `docs/SDLC.md` is identified as review-model authority without duplicating cold-review rules.\n- Scope: found no whiteboard, layout-audit, sharing, telemetry, or playbook implementation.\n- Task boundaries: did not treat the deferred hardcoded skill counts, prose counts, VERSION, or CHANGELOG work as findings.\n- Version-control scope: packet identifies only the six visual-review files as task-scoped and marks pre-existing `HANDOFF.md` changes as unrelated."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:09:42Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:09:41Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  |   ✔ serves a file inside the artifact directory (0.3788ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1132ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.6726ms)
  | ✔ resolveStatic (2.175ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2041ms)
  |   ✔ rejects a foreign Host header on every route (11.0179ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9583ms)
  |   ✔ confines every served document to the review server via CSP (23.0076ms)
  |   ✔ serves the artifact with the SDK tag injected (1.7838ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.9978ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (10.0694ms)
  |   ✔ parks a long-poll until an annotation arrives (81.6195ms)
  |   ✔ returns an empty batch when the long-poll times out (123.5232ms)
  |   ✔ rejects cross-site annotation posts (29.7643ms)
  |   ✔ rejects malformed annotation payloads (46.7494ms)
  |   ✔ bumps the reload version when the artifact directory changes (326.5ms)
  |   ✔ reports whether the artifact directory is being watched (76.1225ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (1.9998ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (5.6405ms)
  |   ✔ refuses to start on a missing artifact (0.2223ms)
  | ✔ visual-review server (754.9342ms)
  | ℹ tests 27
  | ℹ suites 4
  | ℹ pass 27
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 876.3557
- 2026-08-12T00:09:43Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:09:42Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   ✔ serves a file inside the artifact directory (0.4952ms)
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1502ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.8478ms)
  | ✔ resolveStatic (2.4128ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2036ms)
  |   ✔ rejects a foreign Host header on every route (11.0813ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.8636ms)
  |   ✔ confines every served document to the review server via CSP (21.4101ms)
  |   ✔ serves the artifact with the SDK tag injected (1.6599ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.2526ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (5.5022ms)
  |   ✔ parks a long-poll until an annotation arrives (69.6527ms)
  |   ✔ returns an empty batch when the long-poll times out (123.4124ms)
  |   ✔ rejects cross-site annotation posts (45.4487ms)
  |   ✔ rejects malformed annotation payloads (47.1721ms)
  |   ✔ bumps the reload version when the artifact directory changes (313.1868ms)
  |   ✔ reports whether the artifact directory is being watched (76.2006ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (2.3862ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (6.0736ms)
  |   ✔ refuses to start on a missing artifact (0.1992ms)
  | ✔ visual-review server (738.8855ms)
  | ℹ tests 27
  | ℹ suites 4
  | ℹ pass 27
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 854.2724
- 2026-08-12T00:09:43Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T00:09:43Z, exit 0 in 0.6s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-12T00:09:52Z — note: cold review: ladder rung 1, provider codex, both axes each round, 3 full rounds (cap). R1: CSP missing (high, fixed), duplicate SDK tag (med, fixed), missing validate-foundry evidence (med, evidence recorded). R2: iframe self-navigation escape (high, fixed with frame-src 'self'), CSRF on /api/annotations (med, fixed with JSON content-type + loopback-Origin gate), injectSdk substring false-positive/negative (med, fixed with tag-shaped strip-then-inject). R3: symlinked primary artifact escapes confinement (high, fixed by routing the artifact through link-aware resolveStatic at startup and per read), silent watcher degradation (med, fixed with watching flag surfaced to /api/reload and UI), swallowed browser-side send failures (med, fixed with visible failure + input preserved). Every fix has a test that fails on the pre-fix tree; 27/27 pass in both trees after the final edit. RESIDUAL RISK at cap: the round-3 fixes themselves are not cold-reviewed (protocol caps at 3 rounds); surfaced to operator.
- 2026-08-12T00:09:57Z — moved to done
