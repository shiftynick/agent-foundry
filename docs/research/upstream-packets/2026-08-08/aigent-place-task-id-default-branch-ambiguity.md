# Unusable defaultBranch metadata silently changes task-ID shape

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
- Related but separate packet:
  `2026-08-08-task-id-detached-worktree-collision.md` covers a different hunk in
  the same function. The two are independent and can be accepted separately.

## Observed vs. expected

`currentBranchNamespace()` decides between a **compact** sequence
(`task-001`, used on the default branch) and a **namespaced** ID
(`task-<16 digits>`, used everywhere else). Stock 0.26.0 resolves the default
branch like this:

```js
  const foundryMetadata = join(root, ".agent-foundry.json");
  if (existsSync(foundryMetadata)) {
    try {
      const configured = JSON.parse(readFileSync(foundryMetadata, "utf8")).defaultBranch;
      if (typeof configured === "string" && branch === configured) return null;
    } catch {
      // Foundry validation diagnoses malformed metadata. Allocation still
      // fails safe to a branch namespace here.
    }
  }
  const remoteHead = gitText(root, ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"]);
  if (remoteHead && branch === remoteHead.replace(/^[^/]+\//u, "")) return null;
  return branchTaskNamespace(branch);
```

Observed: when `.agent-foundry.json` is absent, malformed, or carries a
`defaultBranch` that is not a usable branch name, and `refs/remotes/origin/HEAD`
is also missing (a clone made without it, or a repository with no remote), the
CLI silently switches the whole project from compact IDs to 16-digit namespaced
IDs on its own default branch. `task.mjs add` exits 0 and prints an ID. Nothing
says the metadata could not be read.

The stock code comments that "Foundry validation diagnoses malformed metadata",
but that validation runs elsewhere and at a different time; an operator running
`task.mjs add` gets no signal at the moment the fallback is taken. The result
looks like a cosmetic change and is not: a board whose IDs change shape
mid-project reads as two conventions, and the operator has no pointer to the
cause.

The fail-safe direction is correct — a namespaced ID cannot collide. The defect
is that it is **silent**, and that the truthiness check accepts a `defaultBranch`
value that can never match a real branch (empty string, or one containing
whitespace or `..`) as if it were meaningful configuration.

Reproduction (stock tree):

```bash
printf '{ malformed\n' > repo/.agent-foundry.json      # no origin/HEAD in repo
node .claude/skills/task-tracker/scripts/task.mjs add "Card"
# stock 0.26.0: prints task-<16 digits>, exit 0, stderr empty
```

Expected: the same fail-safe ID, plus one line on stderr naming why the default
branch could not be identified. Exit code unchanged.

## Proposed change

Baseline diffed against: the Agent Foundry checkout at **0.26.0**
(`git show <0.26.0>:starter/.claude/skills/task-tracker/scripts/task.mjs`),
the version installed here.

Implementation (identical in both harness trees) — classify why the default
branch is unknown, then warn only when no other source can resolve it:

```diff
+  let defaultBranchIssue = null;
   const foundryMetadata = join(root, ".agent-foundry.json");
-  if (existsSync(foundryMetadata)) {
+  if (!existsSync(foundryMetadata)) {
+    defaultBranchIssue = "absent .agent-foundry.json";
+  } else {
     try {
-      const configured = JSON.parse(readFileSync(foundryMetadata, "utf8")).defaultBranch;
-      if (typeof configured === "string" && branch === configured) return null;
+      const raw = JSON.parse(readFileSync(foundryMetadata, "utf8")).defaultBranch;
+      if (typeof raw !== "string") {
+        defaultBranchIssue = "missing or invalid defaultBranch in .agent-foundry.json";
+      } else {
+        const configured = raw.trim();
+        if (configured === "") {
+          defaultBranchIssue = "missing or invalid defaultBranch in .agent-foundry.json";
+        } else if (/\s/u.test(configured) || configured.includes("..")) {
+          defaultBranchIssue = "invalid defaultBranch in .agent-foundry.json";
+        } else if (branch === configured) {
+          return null;
+        }
+      }
     } catch {
-      // Foundry validation diagnoses malformed metadata. Allocation still
-      // fails safe to a branch namespace here.
+      defaultBranchIssue = "malformed .agent-foundry.json";
     }
   }
+
   const remoteHead = gitText(
     root,
     ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"],
   );
   if (remoteHead && branch === remoteHead.replace(/^[^/]+\//u, "")) return null;
+  if (!remoteHead && defaultBranchIssue) {
+    stderr.write(
+      `task-tracker: warning: cannot identify default branch (${defaultBranchIssue}; refs/remotes/origin/HEAD missing); using namespaced task IDs on branch '${branch}'\n`,
+    );
+  }
   return branchTaskNamespace(branch);
```

The warning goes to stderr only, so `task.mjs add` remains safe to consume on
stdout (the ID). Exit status is unchanged. No warning is emitted when
`origin/HEAD` successfully answers the question.

Documentation (`references/concurrency.md`, both trees) — second half of the
added paragraph:

```diff
+If `.agent-foundry.json` cannot name the default branch and
+`refs/remotes/origin/HEAD` is missing, allocation uses a namespaced ID and
+prints a `task-tracker: warning` on stderr.
```

Coverage (`scripts/task.test.mjs`, both trees) adds three `node --test` cases
against the CLI:

- `keeps compact IDs on an unborn default branch` — pins the existing
  bootstrap behavior so the new classification cannot regress it.
- `uses remote HEAD when installed default-branch metadata is malformed` —
  asserts `origin/HEAD` still resolves the default branch and yields
  `task-001`, i.e. the warning path is not entered when a fallback exists.
- `warns when default-branch metadata is unusable and remote HEAD is missing` —
  asserts exit 0, a `task-\d{16}` ID on stdout, and the warning text on stderr.

## Impact

Every-task friction plus a diagnosability gap, not corruption. Any project
whose clone lacks `origin/HEAD`, or whose `.agent-foundry.json` is edited or
hand-written, gets a permanently different ID shape with no explanation, and an
operator debugging it has to read `task.mjs` to find the cause. The change keeps
the existing fail-safe behavior and only makes it observable; the stricter
`defaultBranch` validation additionally stops an unusable value from being
treated as configuration.
