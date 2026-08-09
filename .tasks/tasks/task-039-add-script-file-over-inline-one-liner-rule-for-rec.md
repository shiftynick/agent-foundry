---
id: task-039
title: Add script-file-over-inline-one-liner rule for recorded commands
status: backlog
priority: p2
tags: [area:process]
blockedBy: []
createdAt: "2026-08-09T01:49:00Z"
updatedAt: "2026-08-09T01:49:00Z"
---

<!-- task-tracker:description -->
## Description

From nightly audit 2026-08-08 (docs/research/run-audits/2026-08-08.md, candidate 1): recorded evidence commands failed on Windows shell metacharacters seven times across three repos in one day - PowerShell quoting (project-myriad task-054 log lines 25-29 and the 0.24-upgrade log line 309), native argument forwarding truncating task notes (0.24-upgrade log line 295, which cost a full extra two-axis review round under the severity gate), and equivalents in synoptic and interra-api-proxy. Add one sentence at the point of use in execute-task -> Validate (both trees): when a recorded command needs quoting or shell metacharacters, write a script file (e.g. a temp .mjs) and record the run of that file, instead of an inline one-liner. Harness- and OS-neutral phrasing; no SDLC restatement. VERSION+CHANGELOG per convention.

<!-- task-tracker:log -->
## Log

- 2026-08-09T01:49:00Z — created (status: backlog)
