# reconcile-seeds restores seeds before it knows the run will abort, and follows links out of the repo

## Context

- Installed Agent Foundry version: 0.26.0 (`.agent-foundry.json`,
  `.agent-foundry/manifest.json`)
- Harness trees in use: `.agents/` and `.claude/` (this file is harness-neutral;
  it ships once, under `.agent-foundry/`)
- Affected mold files (payload-relative):
  - `starter/.agent-foundry/reconcile-seeds.mjs`
  - `starter/.agent-foundry/reconcile-seeds.test.mjs`
- Drift status: both are reported **locally modified (mold)** by
  `node .agent-foundry/check-foundry-drift.mjs` and recorded in
  `.agent-foundry/LOCAL-CHANGES.md`.

This is one concern — "reconciliation must decide before it mutates" — with two
symptoms that share a single restructure of `restoreSeedsFromHead()`.

## Observed vs. expected

`restoreSeedsFromHead()` is the recovery path after a forced upgrade: it walks
the manifest's `seed` entries and restores each from `HEAD`, refusing any seed
whose on-disk content no longer matches the hash recorded at install. Stock
0.26.0 does that in a single pass that validates and mutates in the same loop:

```js
  for (const relative of paths) {
    const expected = records?.[relative]?.sha256;
    if (typeof expected !== "string" || hashManagedFile(...) !== expected) {
      throw new Error(`seed changed after installation; refusing to overwrite: ${relative}`);
    }
    if (!trackedAtHead(repoRoot, relative)) { newSeeds.push(relative); continue; }
    const result = runGit(repoRoot, ["checkout", "HEAD", "--", relative]);
    ...
    restored.push(relative);
  }
```

### Symptom 1 — partial restore on abort

Seeds are sorted, so the walk order is deterministic and arbitrary with respect
to which seed is dirty. Observed: if seed `B.md` was edited after installation,
`A.md` (earlier in sort order) has **already been overwritten from `HEAD`** by
the time the `B.md` check throws. The caller sees a thrown error and reasonably
concludes nothing happened; in fact the tree is half-reconciled, and the safety
message says "refusing to overwrite" while an overwrite has occurred.

Expected: the refusal is all-or-nothing. Validate every seed first; mutate only
if the whole set passes.

Reproduction (no project content; two throwaway seed files):

```bash
# A.md and B.md committed, then both replaced by the "template" content
# recorded in the manifest, then B.md edited by hand afterwards
node -e 'import("./.agent-foundry/reconcile-seeds.mjs").then(m =>
  m.restoreSeedsFromHead(root, ["A.md","B.md"], records))'
# stock 0.26.0: throws on B.md, and A.md has already been reverted to HEAD
```

### Symptom 2 — link traversal is not checked

`safeManagedPath()` rejects absolute paths and `..` segments in manifest keys,
which stops lexical escapes. It does not stop a **symbolic link or directory
junction** inside the repository: a manifest key of the shape `linked/SEED.md`,
where `linked` is a link to a directory outside the repository root, resolves
outside the repo, and the hash check plus `git checkout` then operate on a path
the repository does not own. The manifest is a local file, so this is a write
boundary the tool should enforce for itself rather than a remote attack —
but "reconciliation writes only inside this repository" is exactly the kind of
invariant a recovery tool should not leave implicit.

Expected: refuse a seed path that traverses a link, or whose real path resolves
outside the repository root, before any mutation.

## Proposed change

Baseline diffed against: the Agent Foundry checkout at **0.26.0**
(`git show <0.26.0>:starter/.agent-foundry/reconcile-seeds.mjs`), the version
installed here.

Add a per-path confinement check, then split validation from mutation and issue
one batched `git checkout` for all approved seeds:

```diff
-import { readFileSync } from "node:fs";
+import { lstatSync, readFileSync, realpathSync } from "node:fs";
-import { isAbsolute, join, normalize, resolve } from "node:path";
+import {
+  isAbsolute, join, normalize, relative as relativePath, resolve, sep,
+} from "node:path";
@@
+function assertConfinedRegularPath(repoRoot, relative) {
+  const root = realpathSync(repoRoot);
+  let cursor = root;
+  for (const segment of relative.split("/")) {
+    cursor = join(cursor, segment);
+    if (lstatSync(cursor).isSymbolicLink()) {
+      throw new Error(`seed path traverses a symbolic link: ${relative}`);
+    }
+  }
+  const resolved = realpathSync(cursor);
+  const fromRoot = relativePath(root, resolved);
+  if (
+    fromRoot === ""
+    || fromRoot === ".."
+    || fromRoot.startsWith(`..${sep}`)
+    || isAbsolute(fromRoot)
+  ) {
+    throw new Error(`seed path escapes repository root: ${relative}`);
+  }
+}
+
 export function restoreSeedsFromHead(repoRoot, paths, records) {
   const restored = [];
   const newSeeds = [];
   for (const relative of paths) {
+    assertConfinedRegularPath(repoRoot, relative);
     const expected = records?.[relative]?.sha256;
     ...
       newSeeds.push(relative);
       continue;
     }
-    const result = runGit(repoRoot, ["checkout", "HEAD", "--", relative]);
+    restored.push(relative);
+  }
+  if (restored.length > 0) {
+    const result = runGit(repoRoot, ["checkout", "HEAD", "--", ...restored]);
     if (result.error) throw result.error;
     if (result.status !== 0) {
-      throw new Error(result.stderr.trim() || `git checkout failed for ${relative}`);
+      throw new Error(result.stderr.trim() || "git checkout failed for project seeds");
     }
-    restored.push(relative);
   }
   return { restored, newSeeds };
 }
```

The loop now only classifies (`restored` = approved-and-tracked,
`newSeeds` = untracked); the single `git checkout` afterwards is the only
mutation, so any refusal leaves the tree untouched. Batching also drops the
per-seed `git` process. The one behavior trade-off worth naming: the
`git checkout` failure message is no longer per-path. Git's own stderr is
preferred when present, so the generic text only appears when Git said nothing.

Coverage (`reconcile-seeds.test.mjs`) adds two `node --test` cases:

- `validates every seed before restoring any of them` — two seeds, the later
  one dirty; asserts the call throws `/refusing to overwrite/` **and** that the
  earlier seed still holds its post-install content.
- `refuses seed paths that traverse a symbolic link` — links a directory from
  outside the repository into it, asserts the call throws `/symbolic link/` and
  that the outside file is unchanged. The test calls `t.skip()` on `EPERM` /
  `EACCES` so it is inert on Windows hosts without symlink privilege (it creates
  a junction there when permitted).

## Impact

Corruption risk in a recovery path. `reconcile-seeds` runs precisely when a
forced upgrade has already overwritten project-owned files, so it is the tool an
operator reaches for when the tree is already in a bad state; a partial restore
that reports failure is the worst available outcome there — the operator is told
nothing happened while their seeds have silently moved. Frequency is low
(forced upgrades only), severity is high, and the fix is a reordering rather
than new behavior: every seed that would have been restored still is.
