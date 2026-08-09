# Fix malformed Cursor compatibility sentence in agent-headless

## Context

- Installed Agent Foundry version: **0.26.0**
- Harness trees in use: Codex (`.agents/skills/`) and Claude Code
  (`.claude/skills/`)
- Affected mold file, payload-relative path:
  `starter/.agent-foundry/agent-headless/COMPATIBILITY.md`
  (installed as `.agent-foundry/agent-headless/COMPATIBILITY.md`)
- Drift status: `node .agent-foundry/check-foundry-drift.mjs` reports this
  file under **Locally modified (mold)**. The project carries the correction
  locally and has re-applied it across upgrades.
- History: first observed in a 0.16.0 to 0.18.0 upgrade review. Confirmed still
  present, unchanged, in stock 0.24.0 and 0.26.0. Releases between those points
  were not inspected.

## Observed vs. expected

Stock `COMPATIBILITY.md` ships this paragraph (0.26.0, verbatim):

```text
Cursor's worktree does not sandbox arbitrary shell effects on Windows. An
Cursor rejects `auto`; when no model is named it falls back to a documented
default and reports `modelDefaulted`, so a caller can tell whether the operator
chose the model. Name one explicitly for cold review.
```

Two defects:

1. The trailing `An` is a fragment of the sentence that 0.18.0 replaced. It
   leaves the paragraph ungrammatical and makes the sentence boundary
   ambiguous on a first read.
2. The introductory clause `when no model is named` is not closed with a
   comma, which the rest of the document's style does apply.

Expected: the second sentence begins directly with `Cursor rejects`, and the
introductory clause is punctuated.

**How to see it:** read
`starter/.agent-foundry/agent-headless/COMPATIBILITY.md` in the foundry
checkout, around the provider capability table. No project context is needed
to reproduce this.

## Proposed change

Diff produced against the **stock 0.26.0 payload file** in a foundry checkout
(`starter/.agent-foundry/agent-headless/COMPATIBILITY.md`), compared with this
project's corrected installed copy:

```diff
--- starter/.agent-foundry/agent-headless/COMPATIBILITY.md (stock 0.26.0)
+++ .agent-foundry/agent-headless/COMPATIBILITY.md (this project)
@@ -16,7 +16,7 @@
 | Per-run budget | yes | unavailable | unavailable |
 | Model listing | unavailable | unavailable | yes |

-Cursor's worktree does not sandbox arbitrary shell effects on Windows. An
-Cursor rejects `auto`; when no model is named it falls back to a documented
+Cursor's worktree does not sandbox arbitrary shell effects on Windows.
+Cursor rejects `auto`; when no model is named, it falls back to a documented
 default and reports `modelDefaulted`, so a caller can tell whether the operator
 chose the model. Name one explicitly for cold review.
```

That is the whole change: drop the stray `An`, add one comma. The paragraph is
otherwise correct and the surrounding table is untouched.

## Impact

Low severity, but it is not a one-off: it lands in every installation of each
release where it was confirmed (0.18.0, 0.24.0, 0.26.0), it sits in the
provider compatibility contract that
agents are told to consult before selecting a headless provider, and each
downstream project that notices it pays the same reconciliation cost — a
LOCAL-CHANGES entry, a re-apply on every upgrade, and drift noise in the mold
tier forever. Fixing it upstream retires a permanent local divergence in at
least this project.
