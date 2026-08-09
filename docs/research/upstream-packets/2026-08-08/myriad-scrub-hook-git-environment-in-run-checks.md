# Scrub repository-local Git variables before installed test runs

## Context

- Installed Agent Foundry version: **0.26.0**
- Harness trees in use: Codex (`.agents/skills/`) and Claude Code
  (`.claude/skills/`)
- Affected mold files, payload-relative paths:
  - `starter/.agent-foundry/run-checks.mjs`
  - `starter/.agent-foundry/run-checks.test.mjs`
  (installed as `.agent-foundry/run-checks.mjs` and
  `.agent-foundry/run-checks.test.mjs`)
- Drift status: `node .agent-foundry/check-foundry-drift.mjs` reports **both**
  files under **Locally modified (mold)**.
- History: found when wiring the installed checks into a Git `pre-commit`
  hook on Agent Foundry 0.18.0. Stock `run-checks.mjs` was confirmed to still
  forward the hook environment unchanged in 0.24.0 and 0.26.0. Releases
  between those points were not inspected.
- Scope note: the runner change and its regression coverage are filed as one
  packet because they are one concern. The test is the mechanism that keeps
  the variable list from going stale; neither half is meaningful alone.

## Observed vs. expected

`node .agent-foundry/run-checks.mjs` passed repeatedly from an ordinary
shell, but the same suite failed when run from a committed `pre-commit` hook.
Installed tests that create temporary Git fixture repositories reported
index-lock collisions and objects that did not belong to the fixture — they
belonged to the calling repository.

Cause: Git exports repository-local variables (`GIT_INDEX_FILE`, `GIT_DIR`,
`GIT_WORK_TREE`, `GIT_PREFIX`, and the rest of
`git rev-parse --local-env-vars`) to hook processes. Stock `run-checks.mjs`
spawns `node --test` with the inherited environment, so every fixture `git`
command inside an installed test silently retargets the caller's real index
instead of the fixture's.

**Reproduce without a hook**, from any project with the Foundry installed:

```bash
GIT_INDEX_FILE="$(git rev-parse --git-dir)/index" node .agent-foundry/run-checks.mjs
```

The affected tests are any installed test that runs `git` against a temporary
fixture repository. In stock 0.26.0 the payload's own tests that run `git` against a
temporary fixture root are `starter/.agent-foundry/project-overview.test.mjs`,
`starter/.agent-foundry/project-status.test.mjs`, and
`starter/.agent-foundry/reconcile-seeds.test.mjs`; a project's own installed
tests may add more. The signature to look
for is a fixture `git` invocation failing with an index-lock or
`fatal: ... unable to create '.../index.lock'` style message, or reporting
objects and paths that belong to the caller's repository rather than the
fixture. Exact wording varies by Git version, so match on "the fixture's git
touched the caller's repository" rather than on one string.

Expected: installed suites inherit ordinary process configuration (PATH, node
options, CI flags) but **not** the calling repository's Git identity, so a
fixture repository is the only repository they can touch.

Observed: they inherit it, and fixture `git` calls act on the caller's real
`.git`.

## Proposed change

Two changes. Both diffs were produced against the **stock 0.26.0 payload
files** in a foundry checkout, compared with this project's corrected
installed copies. All quoted content is Foundry-owned; no project code
appears.

### 1. `starter/.agent-foundry/run-checks.mjs`

Copy the environment, delete every repository-local Git name (matched
case-insensitively so Windows casing variants cannot survive), and pass the
result only to the installed-test step. The caller's own environment and the
other gate commands are untouched.

```diff
--- starter/.agent-foundry/run-checks.mjs (stock 0.26.0)
+++ .agent-foundry/run-checks.mjs (this project)
@@ -24,6 +24,23 @@
 import { fileURLToPath } from "node:url";

 const MANAGED_ROOTS = [".agent-foundry", ".agents", ".claude"];
+export const GIT_LOCAL_ENV_VARS = [
+  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
+  "GIT_COMMON_DIR",
+  "GIT_CONFIG",
+  "GIT_CONFIG_COUNT",
+  "GIT_CONFIG_PARAMETERS",
+  "GIT_DIR",
+  "GIT_GRAFT_FILE",
+  "GIT_IMPLICIT_WORK_TREE",
+  "GIT_INDEX_FILE",
+  "GIT_NO_REPLACE_OBJECTS",
+  "GIT_OBJECT_DIRECTORY",
+  "GIT_PREFIX",
+  "GIT_REPLACE_REF_BASE",
+  "GIT_SHALLOW_FILE",
+  "GIT_WORK_TREE",
+];

 export function findRepoRoot(startDir = cwd(), maxDepth = 12) {
   let dir = startDir;
@@ -53,10 +70,11 @@
   return found.sort();
 }

-function runStep(label, command, args, repoRoot) {
+function runStep(label, command, args, repoRoot, environment) {
   stdout.write(`\n=== ${label} ===\n`);
   const result = spawnSync(command, args, {
     cwd: repoRoot,
+    ...(environment ? { env: environment } : {}),
     stdio: "inherit",
     windowsHide: true,
   });
@@ -67,6 +85,19 @@
   return result.status === 0;
 }

+function installedTestEnvironment() {
+  const childEnvironment = { ...process.env };
+  // Git exports repository-local variables to hooks. Installed suites create
+  // temporary repositories, so forwarding those variables makes fixture Git
+  // commands operate on (and lock) the caller's real index instead.
+  const fold = (name) => name.toUpperCase();
+  const localNames = new Set(GIT_LOCAL_ENV_VARS.map(fold));
+  for (const name of Object.keys(childEnvironment)) {
+    if (localNames.has(fold(name))) delete childEnvironment[name];
+  }
+  return childEnvironment;
+}
+
 function main() {
   const repoRoot = findRepoRoot();
   if (!repoRoot) {
@@ -100,6 +131,7 @@
     execPath,
     ["--test", ...tests],
     repoRoot,
+    installedTestEnvironment(),
   )) {
     failures.push("installed tests");
   }
```

### 2. `starter/.agent-foundry/run-checks.test.mjs`

A hardcoded list goes stale silently, and the case-insensitive match is easy
to regress. Two tests bind it: one asserts the list still covers everything
the *installed* Git reports from `git rev-parse --local-env-vars`; one drives
the CLI end-to-end with foreign canonical and mixed-case values and has a
nested installed test assert none of them arrived.

```diff
--- starter/.agent-foundry/run-checks.test.mjs (stock 0.26.0)
+++ .agent-foundry/run-checks.test.mjs (this project)
@@ -5,7 +5,7 @@
 import { tmpdir } from "node:os";
 import { dirname, join, relative } from "node:path";
 import { fileURLToPath } from "node:url";
-import { discoverTestFiles, findRepoRoot } from "./run-checks.mjs";
+import { discoverTestFiles, findRepoRoot, GIT_LOCAL_ENV_VARS } from "./run-checks.mjs";

 const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "run-checks.mjs");

@@ -75,12 +75,12 @@
   });
 });

-function runCli(files) {
+function runCli(files, envOverrides = {}) {
   return withRepo(Object.keys(files), (root) => {
     for (const [relativePath, content] of Object.entries(files)) {
       writeFileSync(join(root, ...relativePath.split("/")), content, "utf8");
     }
-    const childEnv = { ...process.env };
+    const childEnv = { ...process.env, ...envOverrides };
     // The CLI under test starts its own `node --test` process. Do not leak the
     // parent test runner's recursion marker into that independent invocation.
     delete childEnv.NODE_TEST_CONTEXT;
@@ -106,6 +106,53 @@
   assert.match(result.stdout, /PASS \(skill-sync \+ 1 suites\)/u);
 });

+test("Git-local environment list stays aligned with the installed Git", () => {
+  const result = spawnSync("git", ["rev-parse", "--local-env-vars"], {
+    cwd: dirname(SCRIPT),
+    encoding: "utf8",
+    windowsHide: true,
+  });
+  assert.equal(result.error, undefined, result.error?.message);
+  assert.equal(result.status, 0, result.stderr ?? "git rev-parse exited without diagnostics");
+  const reported = result.stdout.trim().split(/\r?\n/u).filter(Boolean).sort();
+  const configured = new Set(GIT_LOCAL_ENV_VARS);
+  const unhandled = reported.filter((name) => !configured.has(name));
+  assert.deepEqual(unhandled, [], `unhandled Git-local environment names: ${unhandled.join(", ")}`);
+});
+
+test("CLI scrubs repository-local Git variables before installed tests", () => {
+  const environmentProbe = `
+    import assert from "node:assert/strict";
+    import test from "node:test";
+    test("fixture Git environment is isolated", () => {
+      const forbidden = new Set(["GIT_INDEX_FILE", "GIT_DIR", "GIT_WORK_TREE", "GIT_PREFIX"]);
+      for (const name of Object.keys(process.env)) {
+        assert.equal(forbidden.has(name.toUpperCase()), false, name);
+      }
+    });
+  `;
+  for (const [label, environment] of [
+    ["canonical", {
+      GIT_INDEX_FILE: "canonical-index",
+      GIT_DIR: "canonical-git-dir",
+      GIT_WORK_TREE: "canonical-work-tree",
+      GIT_PREFIX: "canonical-prefix",
+    }],
+    ["mixed-case", {
+      Git_Index_File: "foreign-index",
+      git_dir: "foreign-git-dir",
+      Git_Work_Tree: "foreign-work-tree",
+      git_prefix: "foreign-prefix",
+    }],
+  ]) {
+    const result = runCli({
+      ".agent-foundry/check-skill-sync.mjs": passingSync,
+      ".agents/git-environment.test.mjs": environmentProbe,
+    }, environment);
+    assert.equal(result.status, 0, `${label}\n${result.stdout}\n${result.stderr}`);
+  }
+});
+
 test("CLI fails closed when the skill-sync checker is missing", () => {
   const result = runCli({ ".agents/sample.test.mjs": passingTest });
   assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
```

Notes a maintainer may want to weigh:

- The list is a snapshot rather than a live `git rev-parse` call so the runner
  stays zero-dependency and does not require Git to be on PATH to launch
  tests. The first test is what keeps the snapshot honest, and it is skippable
  logic if the Foundry would rather query Git live.
- Case-insensitive matching is a no-op correctness-wise on POSIX (where only
  the canonical names exist) and is what makes the fix hold on Windows, where
  environment lookup is case-insensitive but `Object.keys` returns the
  caller's casing.
- Only the installed-test step gets the scrubbed environment. The skill-sync
  step and any project gate commands keep the inherited environment, so a
  project whose own gate legitimately needs `GIT_DIR` is unaffected.

## Impact

**Validation integrity and repository safety — the highest-severity of the
divergences this project carries.**

- A project that wires `run-checks.mjs` into a Git hook (which the Foundry's
  own material encourages) can see the installed suite fail from the hook
  while passing from a shell. The exposure is conditional: it needs Git to
  export repository-local variables to the hook (the normal case) and at least
  one installed test that runs `git` against a fixture repository. Stock 0.26.0
  ships three such tests, so a stock installation driven from such a hook
  qualifies without adding any project tests. The natural reaction
  to the resulting failure is to distrust or disable the gate.
- Worse than the false failure: fixture `git` commands inside installed tests
  can target — and attempt to write — the **caller's real index** while a
  commit is in flight, from tests that believe they own a throwaway directory.
  This project observed index-lock collisions and foreign objects, which is
  evidence of the retargeting; it did not capture a completed write, and the
  set of Git subcommands a given fixture runs decides how far it gets.

The failure is invisible outside a hook, so a project can carry it for a long
time before the symptom is understood.
