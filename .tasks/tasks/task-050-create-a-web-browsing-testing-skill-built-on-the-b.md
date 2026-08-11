---
id: task-050
title: Create a web browsing/testing skill built on the browser-use CLI v3
status: backlog
priority: p2
tags: [area:core]
blockedBy: []
createdAt: "2026-08-11T23:48:43Z"
updatedAt: "2026-08-11T23:48:43Z"
---

<!-- task-tracker:description -->
## Description

Add a new shared skill (both .claude/skills/ and .agents/skills/ trees) for local testing and debugging of web apps using the browser-use CLI v3 (https://docs.browser-use.com/open-source/browser-use-cli). The skill should cover: installing/verifying the browser-use CLI, launching and driving a local web app (navigate, click, type, inspect), capturing screenshots/state for debugging, and using it in an agentic test loop against a locally running dev server. Keep the payload domain/framework-neutral per starter/ rules. Remember: adding a skill means updating the hardcoded shared-skill list and counts in scripts/validate-foundry.mjs, mirroring both harness trees with the Claude-facing/Codex-facing transform, and passing validate-foundry + test-bootstrap.

<!-- task-tracker:log -->
## Log

- 2026-08-11T23:48:43Z — created (status: backlog)
