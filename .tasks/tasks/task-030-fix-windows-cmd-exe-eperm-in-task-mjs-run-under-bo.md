---
id: task-030
title: Fix Windows cmd.exe EPERM in task.mjs run under bootstrap
status: backlog
priority: p1
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-08T15:38:35Z"
updatedAt: "2026-08-08T15:38:35Z"
---

<!-- task-tracker:description -->
## Description

On this host, node scripts/test-bootstrap.mjs fails in the installed task-tracker suite: strips escape forms other than SGR from recorded evidence fails with spawnSync C:\WINDOWS\system32\cmd.exe EPERM. task.mjs run uses spawnSync(commandLine, { shell: true }). Simple task.mjs run commands still work; the ANSI-heavy -e fixture does not. Reproduced outside bootstrap against starter/.agents/skills/task-tracker/scripts/task.test.mjs. Restore a green disposable bootstrap on Windows without weakening escape sanitization coverage.

<!-- task-tracker:log -->
## Log

- 2026-08-08T15:38:35Z — created (status: backlog)
