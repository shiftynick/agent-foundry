# agent-headless compatibility matrix

Runtime probes add executable availability and version to these static
capabilities. Unsupported combinations fail before provider invocation.

| Capability | Claude | Codex | Cursor | Antigravity |
| --- | --- | --- | --- | --- |
| Answer-only | yes, tools disabled | yes, read-only sandbox | yes, ask mode | plan mode; AGY permissions apply |
| Read-only inspection | yes | yes | yes, plan mode | yes, plan mode |
| In-place workspace edits | yes | yes | unsupported | yes |
| Isolated worktree edits | yes | unsupported | yes | unavailable |
| Ephemeral sessions | yes | yes | unavailable | unavailable |
| Resume | yes | yes, inherits original access | yes | yes |
| Effort | native flag | config override except `max` | exact model variant | native low/medium/high |
| JSON Schema output | yes | file-based | unavailable | yes |
| Per-run budget | yes | unavailable | unavailable | unavailable |
| Model listing | Foundry allowlist | Foundry allowlist | Foundry allowlist | authenticated AGY catalog |

`models claude`, `models codex`, and `models cursor` print Foundry-allowed IDs
only (Claude: fable/opus/sonnet; Codex: gpt-5.6 sol/terra/luna; Cursor: Grok
low/medium/high plus Composer — no Grok fast). `models antigravity` prints
AGY's authenticated live catalog. See the skill's `references/models.md`.
Cursor's full live catalog is not exposed through this runner.

Cursor's worktree does not sandbox arbitrary shell effects on Windows.
Cursor rejects `auto`; when no model is named, it falls back to a documented
default and reports `modelDefaulted`, so a caller can tell whether the operator
chose the model. Name one explicitly for cold review. Claude Fable defaults
effort to `low` unless the caller sets one.

Antigravity uses `agy` in print mode. It resolves `AGY_BIN`, then PATH, then
the standard Windows `%LOCALAPPDATA%\agy\bin\agy.exe` install path. Its plan
mode is not a filesystem sandbox; command permissions are configured by AGY.
It has no isolated-worktree or ephemeral-session mode. Its authenticated model
catalog is live, so select and record an exact model before cold review.
`delegate-work.mjs` therefore defaults Antigravity to `inspect`; pass
`--access edit-workspace` only when the operator has approved in-place edits.
