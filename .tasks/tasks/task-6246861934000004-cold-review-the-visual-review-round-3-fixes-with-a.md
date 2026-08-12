---
id: task-6246861934000004
title: Cold-review the visual-review round-3 fixes with a scoped delta pass
status: done
priority: p2
tags: [area:process]
blockedBy: []
createdAt: "2026-08-12T00:41:14Z"
updatedAt: "2026-08-12T01:03:23Z"
---

<!-- task-tracker:description -->
## Description

The three fixes made in cold-review round 3 of task-6246861934000002 (link-aware confinement of the primary artifact, fs.watch degradation surfaced through /api/reload and the UI, browser-side send failures made visible instead of swallowed) shipped without their own cold review, because the protocol caps at three full rounds. Each has a test that fails on the pre-fix tree, but no independent reviewer examined the fixes. Operator chose a scoped delta review on 2026-08-11 during a visual-review session. Build a packet naming only those three fixes and dispatch a single cold call with --axis SPEC or --axis STANDARDS per cold-review.md's delta-check rule.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:41:14Z — created (status: backlog)
- 2026-08-12T00:47:14Z — note: rubric: (1) Each of the three round-3 fixes is present in both harness trees and does what the task log claims. (2) The link-aware confinement of the primary artifact rejects a symlinked artifact at startup and per read, with no path by which /artifact serves a file outside the artifact directory. (3) The watcher-degradation flag is truthful: it reports false when fs.watch cannot start or later errors, and that value reaches /api/reload and the UI. (4) Browser-side send failures are visible to the operator and do not discard the typed comment. (5) No fix introduced a new defect in an already-reviewed path (injectSdk, CSP, Origin/content-type gating, queue sequencing).
- 2026-08-12T00:47:14Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T00:47:49Z — moved to review
- 2026-08-12T00:49:49Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0004-r1 --cwd .
  started 2026-08-12T00:47:49Z, exit 0 in 120.2s
  output tail (truncated to last 30 lines):
  | reates a TOCTOU path by which `GET /artifact` can serve an outside file. The replacement test covers only a symlink installed before the request, not this race. | severity med | confidence high\n\n2. starter/.claude/skills/visual-review/scripts/visual-review.test.mjs:311 and mirrored .agents test | Testing: new behavior and meaningful error paths require behavioral tests | The watcher test covers successful construction and construction failure, but never causes a successfully constructed watcher to emit `error`. Removing the `watcher.on(\"error\", ...)` transition would leave all tests passing, so the claimed later-error behavior is unverified. | severity med | confidence high\n\n3. starter/.claude/skills/visual-review/scripts/visual-review.test.mjs:323 and mirrored .agents test | Testing: bug fixes require a red-capable behavioral reproduction | The send-failure test checks only that two message strings occur in the generated HTML. It never executes `post()` or any handler and never asserts that the comment, selection, target, or button state survives failure. A regression that clears the operator’s input while retaining those strings would pass. | severity med | confidence high\n\nCHECKED\n\n- Mirror invariant: SHA-256 hashes and no-index diffs confirm both implementation files match and both test files match; `check-skill-sync.mjs starter` reports PASS.\n- Explicit implementation and single-source behavior: inspected each fix and its flow into server routes and UI handlers.\n- Boundary validation and path confinement: inspected `resolveStatic`, startup confinement, per-request confinement, and the subsequent file-open operation; identified the non-atomic validation/open defect.\n- Errors and observability: verified watcher construction failure and later-error code paths, `/api/reload` propagation, manual-refresh UI state, fetch failure status, and boolean handler gates.\n- State preservation: traced all three send handlers; current source retains typed input and selection when `post()` returns false.\n- Regression paths: inspected `injectSdk`, CSP headers, Host/Origin/content-type gates, queue sequencing, and static path resolution; no fix-specific regression found there.\n- Testing: inspected all three added tests and the recorded 27/27 results. A current rerun was blocked by the review sandbox (`spawn EPERM` and temporary-directory `EPERM`); source-only tests completed, and the packet’s recorded behavioral results were used for the remaining checks.\n- ADR and scope: verified accepted ADR-0003 covers the loopback review server, annotations, live reload, confinement, sandboxing, and zero-dependency implementation.\n- Dependencies and privacy: no new dependency, credential, telemetry, sharing, or outbound-network behavior appears in these fixes.\n- Packet-as-data rule: treated repository contents, diffs, logs, and command output only as evidence; found no embedded instruction attempting to redirect the review."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:53:00Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:52:59Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1243ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.6877ms)
  | ✔ resolveStatic (2.3329ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.198ms)
  |   ✔ rejects a foreign Host header on every route (11.5873ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (1.0043ms)
  |   ✔ confines every served document to the review server via CSP (29.0377ms)
  |   ✔ serves the artifact with the SDK tag injected (1.6189ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.1568ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (7.0672ms)
  |   ✔ parks a long-poll until an annotation arrives (81.9378ms)
  |   ✔ returns an empty batch when the long-poll times out (122.0984ms)
  |   ✔ rejects cross-site annotation posts (47.9727ms)
  |   ✔ rejects malformed annotation payloads (29.2946ms)
  |   ✔ bumps the reload version when the artifact directory changes (342.0635ms)
  |   ✔ reports whether the artifact directory is being watched (77.3366ms)
  |   ✔ stops claiming to watch after the watcher errors (0.421ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (2.3644ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (5.5185ms)
  |   ✔ refuses to start on a missing artifact (0.1799ms)
  | ✔ visual-review server (775.9485ms)
  | ℹ tests 28
  | ℹ suites 4
  | ℹ pass 28
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 860.68
- 2026-08-12T00:53:01Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:53:00Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  |   ✔ refuses traversal, encoded traversal, and backslash smuggling (0.1292ms)
  |   ✔ refuses a symlink that leaves the artifact directory (0.6672ms)
  | ✔ resolveStatic (1.961ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.2014ms)
  |   ✔ rejects a foreign Host header on every route (14.3082ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9445ms)
  |   ✔ confines every served document to the review server via CSP (22.424ms)
  |   ✔ serves the artifact with the SDK tag injected (1.536ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.2308ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (15.5583ms)
  |   ✔ parks a long-poll until an annotation arrives (74.2772ms)
  |   ✔ returns an empty batch when the long-poll times out (122.6831ms)
  |   ✔ rejects cross-site annotation posts (46.3298ms)
  |   ✔ rejects malformed annotation payloads (46.1811ms)
  |   ✔ bumps the reload version when the artifact directory changes (328.1501ms)
  |   ✔ reports whether the artifact directory is being watched (76.2353ms)
  |   ✔ stops claiming to watch after the watcher errors (0.3479ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (2.2666ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (6.3316ms)
  |   ✔ refuses to start on a missing artifact (0.2399ms)
  | ✔ visual-review server (773.4714ms)
  | ℹ tests 28
  | ℹ suites 4
  | ℹ pass 28
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 904.7708
- 2026-08-12T00:53:01Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T00:53:01Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-12T00:53:13Z — note: round-1 adjudication (both axes, provider codex, rung 1): FIXED - (a) TOCTOU between confineArtifact() and readFileSync: /artifact now reads through a descriptor opened with O_RDONLY|O_NOFOLLOW, removing the second path lookup; O_NOFOLLOW is POSIX-only and the comment says so. (b) watcher 'error' transition untested: createReloadSignal takes an injectable watch factory; new test emits error on a fake watcher and asserts watching() flips false. (c) post() asserted 'live' over a degraded watcher: the reload poll now owns a reloadStatus string that post() restores. HONEST LIMIT on the send-failure test: asserting message strings in generated HTML is a pattern match over a serialized artifact, unsound by construction per cold-review.md; rather than harden it for another round, the behavior was verified in a real browser - typed comment preserved, zero entries added to the sent list, failure visible after the server was killed mid-session. That session also exposed a residual defect of the same class as finding 2, fixed here: a send-failure message could be overwritten by the reload poll's next tick, so send failures are now sticky until the next successful send.
- 2026-08-12T00:53:13Z — note: red-capable evidence for the new checks: deleting the watcher error transition fails 'stops claiming to watch after the watcher errors' (27 pass / 1 fail); stubbing the confined artifact read fails the artifact-serving tests (27 pass / 1 fail); restoring both returns 28/28.
- 2026-08-12T00:54:53Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0004-r2 --cwd .
  started 2026-08-12T00:53:46Z, exit 0 in 67.5s
  output tail (truncated to last 30 lines):
  | act with an outbound symlink between those calls is followed. On POSIX, `O_NOFOLLOW` protects only the final component, so replacing an ancestor directory with an outbound symlink remains possible. Therefore `GET /artifact` can still open and serve content outside the artifact directory. | severity med | confidence high\n\n2. `starter/.agents/skills/visual-review/scripts/visual-review.test.mjs:340` and mirrored `.claude` copy | Testing: new behavior has a test that fails without it; make gates unskippable | The retained send-failure test only pattern-matches serialized shell HTML and does not execute `post()`, the reload loop, retry behavior, or comment preservation. The recorded manual browser session is behavioral evidence, but it is not a repeatable gate and cannot detect later removal of `sendFailed`, comment retention, or degraded-status restoration. | severity med | confidence high\n\nCHECKED\n\n- Harness parity: compared both diff sections and the recorded synchronization result; implementation and test changes match.\n- Primary-artifact startup confinement: traced `startServer()` through `confineArtifact()` and `resolveStatic()`; startup rejects an already-outbound symlink.\n- Primary-artifact per-read confinement: traced validation, opening, descriptor reading, and closure; found the remaining validation/open race above.\n- Watcher startup failure: verified `watching` remains false when `watchFactory` throws.\n- Watcher later-error behavior: verified the error listener changes `watching` to false and the new injected-watcher test executes that transition.\n- Watcher propagation: traced `reload.watching()` through `/api/reload` to `data.watching` and the manual-refresh UI status.\n- Send failure and recovery: traced element, note, and completion handlers; failed sends do not clear the textarea or record success, and the failure status remains sticky until a successful send.\n- Existing reviewed paths: checked the changed context around SDK injection, CSP delivery, Origin/content-type validation, queue sequencing, and static/path resolution; found no additional delta-caused regression.\n- Error observability: verified watcher degradation and browser send failure are exposed rather than swallowed.\n- State ownership: verified reload state remains owned by `createReloadSignal` and UI status arbitration is explicit.\n- Security boundaries: checked Host, Origin, content type, iframe/CSP, loopback polling, and artifact-path confinement in the changed paths.\n- ADR coverage: packet identifies accepted ADR-0003 for the architecture and security scope; no new architecture-significant mechanism outside that scope was introduced.\n- Dependency discipline: confirmed the delta uses only Node standard-library APIs and adds no dependency.\n- Scope and version-control discipline: reviewed only the attached in-scope diff; both harness copies and their tests are task-scoped, with no indicated hook bypass or history rewrite."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T00:56:53Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:56:52Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   ✔ closes the descriptor even when identity fails (0.2074ms)
  |   ✔ returns null when the artifact leaves its directory (0.0393ms)
  | ✔ readConfinedArtifact (1.4215ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.1802ms)
  |   ✔ rejects a foreign Host header on every route (11.7955ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.9566ms)
  |   ✔ confines every served document to the review server via CSP (19.2235ms)
  |   ✔ serves the artifact with the SDK tag injected (1.8443ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.2249ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (18.5982ms)
  |   ✔ parks a long-poll until an annotation arrives (70.1361ms)
  |   ✔ returns an empty batch when the long-poll times out (122.7658ms)
  |   ✔ rejects cross-site annotation posts (47.2518ms)
  |   ✔ rejects malformed annotation payloads (33.5591ms)
  |   ✔ bumps the reload version when the artifact directory changes (326.6401ms)
  |   ✔ reports whether the artifact directory is being watched (78.0793ms)
  |   ✔ stops claiming to watch after the watcher errors (0.2289ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (0.9093ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (5.5933ms)
  |   ✔ refuses to start on a missing artifact (0.1782ms)
  | ✔ visual-review server (753.0033ms)
  | ℹ tests 32
  | ℹ suites 5
  | ℹ pass 32
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 835.7219
- 2026-08-12T00:56:54Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T00:56:53Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   ✔ closes the descriptor even when identity fails (0.1738ms)
  |   ✔ returns null when the artifact leaves its directory (0.0454ms)
  | ✔ readConfinedArtifact (1.4031ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.182ms)
  |   ✔ rejects a foreign Host header on every route (11.6753ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.8749ms)
  |   ✔ confines every served document to the review server via CSP (26.2288ms)
  |   ✔ serves the artifact with the SDK tag injected (2.065ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.1997ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (26.3428ms)
  |   ✔ parks a long-poll until an annotation arrives (93.5152ms)
  |   ✔ returns an empty batch when the long-poll times out (124.5824ms)
  |   ✔ rejects cross-site annotation posts (29.1476ms)
  |   ✔ rejects malformed annotation payloads (32.3295ms)
  |   ✔ bumps the reload version when the artifact directory changes (324.6018ms)
  |   ✔ reports whether the artifact directory is being watched (61.8655ms)
  |   ✔ stops claiming to watch after the watcher errors (0.3639ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (0.8574ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (5.4066ms)
  |   ✔ refuses to start on a missing artifact (0.1811ms)
  | ✔ visual-review server (755.5357ms)
  | ℹ tests 32
  | ℹ suites 5
  | ℹ pass 32
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 839.8351
- 2026-08-12T00:59:41Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-0004-r3 --cwd .
  started 2026-08-12T00:57:19Z, exit 0 in 142.7s
  output tail (truncated to last 30 lines):
  |       : ObjectNotFound: (C:\\Users\\shift\\...review\\SKILL.md:String) [Get-Content], ItemNotFoundEx \r\n   ception\r\n    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetContentCommand\r\n \r\n\n2026-08-12T00:57:41.207005Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.3 seconds\nOutput:\n\n",
  |         "durationMs": 142564
  |       },
  |       "finalText": "1. `starter/.agents/skills/visual-review/scripts/visual-review.mjs:158-170` and mirrored `.claude` copy | General boundary validation; Security treatment of user-controlled paths; ADR-0003 confinement invariant | `resolveStatic()` recalculates the real artifact root on every read. If the artifact directory is replaced with a symlink to an outside directory before a request, both the file and recalculated root resolve outside; `stat` and `fstat` then match, so `GET /artifact` serves the outside file. The identity check does not cover the claimed ancestor-directory swap. | severity high | confidence high\n\n2. `starter/.agents/skills/visual-review/scripts/visual-review.test.mjs:383-387` and mirrored `.claude` copy | Testing: new behavior needs a red-capable behavioral test; compilation or source inspection is not behavioral validation | The send-failure test only searches serialized HTML for two messages. It still passes if `post()` is never invoked, the reload loop overwrites the failure, or the comment is cleared after failure. Thus operator-visible failure and typed-comment retention remain behaviorally unverified; filing a follow-up does not satisfy this task’s testing standard. | severity med | confidence high\n\nCHECKED\n\n- General: inspected both implementations for explicit state ownership, boundary validation, duplication, and scope.\n- Errors and observability: traced watcher startup failure, later `error`, `/api/reload`, UI status precedence, send success, and send failure paths.\n- State and data: verified reload-state ownership and confirmed queue sequencing was unchanged.\n- Security and privacy: traced startup and per-read artifact resolution, `stat`/open identity checks, CSP, iframe sandboxing, Host validation, Origin validation, content-type gating, and SDK injection.\n- Testing: inspected all added tests and the packet’s recorded 32/32 results; confirmed the watcher and descriptor-mismatch seams execute behavior, but the browser-send test is source-pattern-only.\n- Dependencies: confirmed the changes use only Node standard-library APIs and add no dependency or lockfile change.\n- Documentation and architecture: verified the implementation remains within accepted ADR-0003 and documents the intended confinement limitation and in-memory ownership.\n- Shared-skill invariant: compared both harness deltas and verified the recorded and locally repeated skill-sync check passes.\n- Version control: inspected the scoped diff and status; found no history rewrite, hook bypass, credential, or unrelated executable change."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:03:01Z — run: node --test starter/.claude/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:03:00Z, exit 0 in 0.9s
  output tail (truncated to last 30 lines):
  |   ✔ clears the comment and logs the entry when a send succeeds (0.3369ms)
  |   ✔ does not send an empty comment (0.0959ms)
  | ✔ shell page behavior (executed, not pattern-matched) (29.1031ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.1222ms)
  |   ✔ rejects a foreign Host header on every route (6.3732ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (1.6564ms)
  |   ✔ confines every served document to the review server via CSP (9.2021ms)
  |   ✔ serves the artifact with the SDK tag injected (1.544ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.5039ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (11.969ms)
  |   ✔ parks a long-poll until an annotation arrives (81.4802ms)
  |   ✔ returns an empty batch when the long-poll times out (124.1339ms)
  |   ✔ rejects cross-site annotation posts (32.348ms)
  |   ✔ rejects malformed annotation payloads (45.1573ms)
  |   ✔ bumps the reload version when the artifact directory changes (326.2341ms)
  |   ✔ reports whether the artifact directory is being watched (75.421ms)
  |   ✔ stops claiming to watch after the watcher errors (0.2763ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (0.9859ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (5.5427ms)
  |   ✔ refuses to start on a missing artifact (0.1825ms)
  | ✔ visual-review server (729.2469ms)
  | ℹ tests 36
  | ℹ suites 6
  | ℹ pass 36
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 841.752
- 2026-08-12T01:03:02Z — run: node --test starter/.agents/skills/visual-review/scripts/visual-review.test.mjs
  started 2026-08-12T01:03:01Z, exit 0 in 1.0s
  output tail (truncated to last 30 lines):
  |   ✔ clears the comment and logs the entry when a send succeeds (0.3069ms)
  |   ✔ does not send an empty comment (0.102ms)
  | ✔ shell page behavior (executed, not pattern-matched) (29.2722ms)
  | ▶ visual-review server
  |   ✔ binds the loopback interface only (0.1453ms)
  |   ✔ rejects a foreign Host header on every route (6.6389ms)
  |   ✔ serves the shell page with a sandboxed iframe and no allow-same-origin (0.8101ms)
  |   ✔ confines every served document to the review server via CSP (11.4617ms)
  |   ✔ serves the artifact with the SDK tag injected (1.6496ms)
  |   ✔ serves sibling assets but never files outside the artifact directory (2.8406ms)
  |   ✔ delivers a queued annotation through the long-poll endpoint (20.7416ms)
  |   ✔ parks a long-poll until an annotation arrives (84.1075ms)
  |   ✔ returns an empty batch when the long-poll times out (125.7546ms)
  |   ✔ rejects cross-site annotation posts (46.4361ms)
  |   ✔ rejects malformed annotation payloads (32.127ms)
  |   ✔ bumps the reload version when the artifact directory changes (311.0524ms)
  |   ✔ reports whether the artifact directory is being watched (77.3163ms)
  |   ✔ stops claiming to watch after the watcher errors (0.4491ms)
  |   ✔ surfaces send failures in the shell page instead of swallowing them (1.4635ms)
  |   ✔ refuses a primary artifact that becomes a link out of its directory (4.7828ms)
  |   ✔ refuses to start on a missing artifact (0.1865ms)
  | ✔ visual-review server (732.3223ms)
  | ℹ tests 36
  | ℹ suites 6
  | ℹ pass 36
  | ℹ fail 0
  | ℹ cancelled 0
  | ℹ skipped 0
  | ℹ todo 0
  | ℹ duration_ms 898.6657
- 2026-08-12T01:03:02Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T01:03:02Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (16 shared skills)
- 2026-08-12T01:03:16Z — note: round-3 (cap) adjudication. FINDING 1 (high, both axes) CONFIRMED and it was a real hole in my own round-2 fix: resolveStatic recomputed realpathSync(artifactDir) on every request, so replacing the artifact DIRECTORY with a link to another directory moved the boundary along with the target and every file 'inside' it passed. My round-2 fix-verification claim that the identity check covered ancestor swaps was wrong. Fixed by pinning the real root once at startServer and comparing every later decision against that pinned value; resolveStatic now documents that its root argument must already be real. Red-capable proof: restoring the per-request root resolution fails the new test 'refuses reads after the artifact directory itself becomes a link out' (32 pass / 1 fail); pinned root returns 33/33. FINDING 2 (med) CONFIRMED for the third consecutive round: the shell-page assertions were source-pattern-only. The reviewer is right that filing a follow-up does not discharge this task's testing standard, so it is now fixed rather than deferred - a zero-dependency DOM shim executes the real shell script with fetch under test control, covering failed send (comment kept, nothing logged, failure visible, selection kept), successful send (comment cleared, entry logged), and empty-comment refusal. Red-capable proof: clearing the comment regardless of failure fails 1 test; making send failures silent fails 2. task-6246861934000008 is therefore obsolete and should be dropped rather than worked.
- 2026-08-12T01:03:17Z — note: RESIDUAL RISK at the 3-round cap, for operator awareness: the round-3 fixes above (pinned root, DOM shim tests) are themselves uncooled, exactly the condition that created this task. Both are covered by red-capable tests and the pinned-root change is a strict narrowing of an existing check, but a fourth round was not run because cold-review.md caps at three. Also recorded honestly: the threat model these confinement layers serve is a malicious REQUEST PATH from the browser, which is fully covered. An attacker with write access to the artifact directory already controls what the operator sees; the layers reduce that to a refusal rather than an out-of-directory read, and Node exposes no openat, so atomicity is not achievable in the payload.
- 2026-08-12T01:03:23Z — moved to done
