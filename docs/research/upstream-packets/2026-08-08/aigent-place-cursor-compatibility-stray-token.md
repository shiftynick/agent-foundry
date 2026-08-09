# Cursor compatibility sentence contains a stray token

## Context

- Installed Agent Foundry version: 0.18.0
- Harness trees in use: `.agents/` and `.claude/`
- Affected mold file: `.agent-foundry/agent-headless/COMPATIBILITY.md`
- Drift status after the local correction: locally modified and recorded in
  `.agent-foundry/LOCAL-CHANGES.md`

## Observed vs. expected

Stock 0.18.0 joins two Cursor limitations with a stray `An`:

```text
Cursor's worktree does not sandbox arbitrary shell effects on Windows. An
Cursor rejects `auto`; when no model is named it falls back to a documented
```

The first sentence should end after `Windows.` and the next sentence should
begin directly with `Cursor rejects`. The malformed transition is user-facing
safety and model-selection guidance; the installed project's `AGENTS.md`
points operators to this file as the compatibility authority.

## Proposed change

Baseline: the local Agent Foundry 0.18.0 checkout's stock starter file.

```diff
-Cursor's worktree does not sandbox arbitrary shell effects on Windows. An
+Cursor's worktree does not sandbox arbitrary shell effects on Windows.
 Cursor rejects `auto`; when no model is named it falls back to a documented
```

The project verified this is the complete difference with `git diff
--no-index` against the current local 0.18.0 starter file. No surrounding
safety text is removed.

## Impact

Localized documentation corruption in an authoritative compatibility note.
It is low implementation risk but recurring maintenance cost for every
installed project that corrects it locally.
