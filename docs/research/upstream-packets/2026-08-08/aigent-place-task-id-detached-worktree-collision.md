# Detached worktrees at the same commit mint colliding durable task IDs

## Context

- Installed Agent Foundry version: 0.26.0 (`.agent-foundry.json`,
  `.agent-foundry/manifest.json`)
- Harness trees in use: `.agents/` and `.claude/`
- Affected mold files (payload-relative), each present identically in both
  harness trees — one concern, mirrored:
  - `starter/.claude/skills/task-tracker/scripts/task.mjs`
    (+ `.agents/` mirror)
  - `starter/.claude/skills/task-tracker/scripts/task.test.mjs`
    (+ `.agents/` mirror)
  - `starter/.claude/skills/task-tracker/references/concurrency.md`
    (+ `.agents/` mirror)
- Drift status: all six files are reported **locally modified (mold)** by
  `node .agent-foundry/check-foundry-drift.mjs` and recorded in
  `.agent-foundry/LOCAL-CHANGES.md`.
- Related but separate packet: `2026-08-08-task-id-default-branch-ambiguity.md`
  covers a second hunk in the same function. The two are independent and can be
  accepted separately.

## Observed vs. expected

`currentBranchNamespace()` in `task.mjs` derives the namespace that makes task
IDs unique across concurrent branches. In detached HEAD state, stock 0.26.0
keys the namespace on the commit alone:

```js
  const branch = gitText(root, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
  if (!branch) {
    const head = gitText(root, ["rev-parse", "--verify", "HEAD"]);
    if (head) return branchTaskNamespace(`detached:${head}`);
    return null;
  }
```

Observed: two worktrees of the same repository, both detached at the same
commit — the ordinary shape of parallel agent work, and the shape the
`agent-headless` worktree isolation produces — hash to the same namespace, so
both allocate from the same sequence and can mint the **same** durable task ID
for two different cards. The commit is not a worktree identity; nothing else in
the key distinguishes them.

Expected: the property `concurrency.md` already claims for branches —
"concurrent branches do not mint the same sequential ID" — should also hold for
concurrent detached worktrees, which are exactly the concurrent case the
namespace exists to protect.

Reproduction (stock tree, no project content involved):

```bash
git -C repo switch --detach                 # HEAD = <sha>
git -C repo worktree add --detach ../wt <sha>
node .claude/skills/task-tracker/scripts/task.mjs add "A"   # run in repo
node .claude/skills/task-tracker/scripts/task.mjs add "B"   # run in ../wt
# stock: both IDs come from one namespace and collide
```

A colliding durable ID is not a cosmetic problem: task IDs are filenames,
dependency references (`blocked-by`), and log keys. A collision is a silent
board corruption discovered later, when two cards claim one file.

## Proposed change

Baseline diffed against: the Agent Foundry checkout at **0.26.0**
(`git show <0.26.0>:starter/.claude/skills/task-tracker/scripts/task.mjs`),
the version installed here.

Implementation (identical in both harness trees):

```diff
-import { argv, env, exit, stderr, stdout } from "node:process";
+import { argv, env, exit, platform, stderr, stdout } from "node:process";
@@
-import { basename, join } from "node:path";
+import { basename, join, resolve } from "node:path";
@@
   if (!branch) {
     const head = gitText(root, ["rev-parse", "--verify", "HEAD"]);
-    if (head) return branchTaskNamespace(`detached:${head}`);
+    if (head) {
+      // Include the absolute worktree root so concurrent detached worktrees at
+      // the same commit cannot mint colliding durable IDs. Lowercase only on
+      // Windows, where paths are case-insensitive.
+      let worktreeKey = resolve(root).replace(/\\/gu, "/");
+      if (platform === "win32") worktreeKey = worktreeKey.toLowerCase();
+      return branchTaskNamespace(`detached:${head}:${worktreeKey}`);
+    }
     return null;
   }
```

Documentation (`references/concurrency.md`, both trees) — first sentence of the
added paragraph:

```diff
 concurrent branches do not mint the same sequential ID. The filename,
 frontmatter, and dependency syntax remain `task-<digits>`.

+Detached HEAD namespaces also include the absolute worktree root. Thus, two
+detached worktrees at the same commit cannot mint colliding IDs.
```

Coverage (`scripts/task.test.mjs`, both trees) adds two `node --test` cases
against the CLI:

- `uses a stable namespace in detached HEAD state` — asserts the detached
  allocation still yields a namespaced `task-\d{16}` ID.
- `mints distinct IDs for concurrent detached worktrees at the same commit` —
  creates a second `git worktree add --detach` at the same SHA, allocates one
  card in each, asserts both are namespaced and **not equal**. This is the
  regression test for the defect above; it fails on stock 0.26.0.

Note on the key: the worktree root is an absolute host path, so it is hashed
into the namespace, never written into a task file or printed. Nothing
path-shaped leaks into the board.

## Impact

Corruption risk, low frequency, high cost when it lands. It requires concurrent
detached worktrees, which is uncommon in solo use but is the normal shape of
parallel agent execution — the case the Foundry actively encourages. The
failure is silent at allocation time and surfaces as two cards mapping to one
durable ID. The fix is contained to one branch of one function and is covered
by a test that fails without it.
