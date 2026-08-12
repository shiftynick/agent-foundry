---
id: task-5212327209000001
title: Exercise browser-use skill against a local app
status: done
priority: p2
tags: [area:core]
blockedBy: [task-050]
createdAt: "2026-08-12T00:40:49Z"
updatedAt: "2026-08-12T00:45:30Z"
---

<!-- task-tracker:description -->
## Description

Run the actual browser-use CLI against a temporary local web app and an isolated CDP Chrome session. Prove navigation, DOM inspection, framework-style input, real click dispatch, result verification, and screenshot capture. Record exact commands and clean up only the owned fixture server, Chrome process, profile, and artifacts. If the live flow contradicts the shipped skill, fix the skill through its normal mirrored/versioned lifecycle.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:40:49Z — created (status: backlog)
- 2026-08-12T00:40:57Z — note: rubric: (1) A temporary loopback web app responds and exposes an input, action button, and deterministic result state. (2) browser-use attaches to an isolated Chrome CDP endpoint and successfully navigates, inspects page state, fills the input, clicks the button, and observes the expected result. (3) browser-use captures a non-empty PNG screenshot and reports its path and dimensions. (4) The fixture server, Chrome process, temporary profile, and test artifacts are owned by this run and are stopped or removed after evidence is recorded. (5) Any contradiction in the shipped skill is fixed and revalidated; otherwise the task records that no product edit was required.
- 2026-08-12T00:40:57Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T00:42:49Z — run: node --check .tasks/browser-use-integration-server.mjs
  started 2026-08-12T00:42:49Z, exit 1 in 0.1s
  output:
  | N:\agent-foundry\.tasks\browser-use-integration-server.mjs:32
  |         result.textContent = `Saved: \${input.value}`;
  |                               ^^^^^
  |
  | SyntaxError: Unexpected identifier 'Saved'
  |     at checkSyntax (node:internal/main/check_syntax:72:5)
  |
  | Node.js v24.19.0
- 2026-08-12T00:42:52Z — run: powershell -NoProfile -ExecutionPolicy Bypass -File .tasks/run-browser-use-integration.ps1
  started 2026-08-12T00:42:49Z, exit 1 in 3.0s
  output:
  | browser-use integration cleanup: PASS
  | Fixture server exited early with code .
  | At N:\agent-foundry\.tasks\run-browser-use-integration.ps1:47 char:13
  | +             throw "Fixture server exited early with code $($serverPro ...
  | +             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  |     + CategoryInfo          : OperationStopped: (Fixture server exited early with code .:String) [], RuntimeException
  |     + FullyQualifiedErrorId : Fixture server exited early with code .
- 2026-08-12T00:44:05Z — run: node --check .tasks/browser-use-integration-server.mjs
  started 2026-08-12T00:44:05Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-08-12T00:44:14Z — run: powershell -NoProfile -ExecutionPolicy Bypass -File .tasks/run-browser-use-integration.ps1
  started 2026-08-12T00:44:08Z, exit 1 in 6.8s
  output:
  | {"serverPid":90600,"chromePath":"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe","fixtureUrl":"http://127.0.0.1:43117","chromePid":68600,"runtimeRoot":"N:\\agent-foundry\\.tasks\\browser-use-integration-runtime","cdpUrl":"http://127.0.0.1:43118"}
  | daemon stopped — will restart fresh on next call
  | browser-use daemon cleanup exit: 0
  | browser-use integration cleanup: PASS
  | Traceback (most recent call last):
  |   File "<frozen runpy>", line 198, in _run_module_as_main
  |   File "<frozen runpy>", line 88, in _run_code
  |   File "C:\Users\shift\AppData\Local\uv\cache\archive-v0\4_A1KA3YnU0sh-SEFA2q9\Scripts\browser-use.exe\__main__.py", line 10, in <module>
  |   File "C:\Users\shift\AppData\Local\uv\cache\archive-v0\4_A1KA3YnU0sh-SEFA2q9\Lib\site-packages\browser_use\cli.py", line 433, in main
  |     result, command = _dispatch(args)
  |                       ^^^^^^^^^^^^^^^
  |   File "C:\Users\shift\AppData\Local\uv\cache\archive-v0\4_A1KA3YnU0sh-SEFA2q9\Lib\site-packages\browser_use\cli.py", line 391, in _dispatch
  |     return _run_browser_harness(), args[0] if args else 'run'
  |            ^^^^^^^^^^^^^^^^^^^^^^
  |   File "C:\Users\shift\AppData\Local\uv\cache\archive-v0\4_A1KA3YnU0sh-SEFA2q9\Lib\site-packages\browser_use\cli.py", line 201, in _run_browser_harness
  |     run.main()
  |   File "C:\Users\shift\AppData\Local\uv\cache\archive-v0\4_A1KA3YnU0sh-SEFA2q9\Lib\site-packages\browser_harness\run.py", line 247, in main
  |     _run(args)
  |   File "C:\Users\shift\AppData\Local\uv\cache\archive-v0\4_A1KA3YnU0sh-SEFA2q9\Lib\site-packages\browser_harness\run.py", line 387, in _run
  |     exec(code, globals())
  |   File "<string>", line 19, in <module>
  | RuntimeError: unexpected title: '🐴 Browser Use Integration Fixture'
  | browser-use exited with code 1.
  | At N:\agent-foundry\.tasks\run-browser-use-integration.ps1:109 char:9
  | +         throw "browser-use exited with code $LASTEXITCODE."
  | +         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  |     + CategoryInfo          : OperationStopped: (browser-use exited with code 1.:String) [], RuntimeException
  |     + FullyQualifiedErrorId : browser-use exited with code 1.
- 2026-08-12T00:44:31Z — run: powershell -NoProfile -ExecutionPolicy Bypass -File .tasks/run-browser-use-integration.ps1
  started 2026-08-12T00:44:24Z, exit 0 in 6.4s
  output:
  | {"serverPid":31768,"chromePath":"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe","fixtureUrl":"http://127.0.0.1:43117","chromePid":100068,"runtimeRoot":"N:\\agent-foundry\\.tasks\\browser-use-integration-runtime","cdpUrl":"http://127.0.0.1:43118"}
  | {"integration": "PASS", "result": "Saved: integration value", "screenshot": "N:\\agent-foundry\\.tasks\\browser-use-integration-runtime\\browser-use-integration.png", "screenshotBytes": 15464, "screenshotDimensions": [764, 485], "title": "\ud83d\udc34 Browser Use Integration Fixture", "typed": "integration value", "url": "http://127.0.0.1:43117/"}
  | daemon stopped — will restart fresh on next call
  | browser-use daemon cleanup exit: 0
  | browser-use integration cleanup: PASS
- 2026-08-12T00:45:16Z — note: Real browser-use integration passed against an isolated local fixture and Chrome CDP session. Verified navigation, DOM inspection, fill_input, coordinate click, deterministic result (Saved: integration value), and a non-empty 15,464-byte PNG at 764x485. The browser-use title decoration (horse icon prefix) was observed and accepted. Post-run cleanup verified runtime directory absent, ports 43117/43118 closed, and zero owned Chrome or named Python daemon processes. No shipped skill contradiction or product edit was required.
- 2026-08-12T00:45:30Z — note: Review disposition: validation-only task with no product or installed-payload diff. The executable acceptance evidence and cleanup audit satisfy the rubric; cold SPEC/STANDARDS review is not applicable because agent behavior did not change.
- 2026-08-12T00:45:30Z — moved to review
- 2026-08-12T00:45:30Z — moved to done
