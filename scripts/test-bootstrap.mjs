#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run, samePath } from "./foundry-lib.mjs";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const foundryRoot = path.resolve(scriptsRoot, "..");
const bootstrap = path.join(scriptsRoot, "bootstrap-project.mjs");
const validator = path.join(scriptsRoot, "validate-foundry.mjs");
const tempRoot = mkdtempSync(path.join(os.tmpdir(), "agent-foundry-tests-"));
const testRoot = path.join(tempRoot, "clean-project");
const collisionRoot = path.join(tempRoot, "collision-project");
const missingRoot = path.join(tempRoot, "missing-project");
const seedUpgradeRoot = path.join(tempRoot, "seed-upgrade-project");
const projectName = String.raw`Foundry "Test" \ Project $& $' $1 {{PROJECT_DESCRIPTION}}`;
const projectDescription = String.raw`A disposable "quoted" $& project fixture.`;

function invokeBootstrap(args, { expectFailure } = {}) {
  let result;
  try {
    result = run(process.execPath, [bootstrap, ...args], {
      label: "Agent Foundry bootstrap",
    });
  } catch (error) {
    if (!expectFailure) {
      throw error;
    }
    return error;
  }
  if (expectFailure) {
    assert.fail("Bootstrap unexpectedly succeeded.");
  }
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  return result;
}

function bootstrapArgs(targetPath, extras = []) {
  return [
    "--target-path",
    targetPath,
    "--project-name",
    projectName,
    "--project-description",
    projectDescription,
    ...extras,
  ];
}

function assertFailure(error, pattern) {
  assert(error instanceof Error);
  assert.match(error.message, pattern);
}

function listDirectories(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name));
}

try {
  run(process.execPath, [validator], {
    label: "Agent Foundry structural validation",
    stdio: "inherit",
  });

  const relativeError = invokeBootstrap(
    bootstrapArgs(path.join("relative", "project"), [
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(relativeError, /absolute path/u);

  const selfError = invokeBootstrap(
    bootstrapArgs(foundryRoot, [
      "--force",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(selfError, /cannot be Agent Foundry/u);

  if (process.platform !== "win32") {
    const foundryAlias = path.join(tempRoot, "foundry-alias");
    symlinkSync(foundryRoot, foundryAlias, "dir");
    const aliasError = invokeBootstrap(
      bootstrapArgs(foundryAlias, [
        "--force",
        "--skip-validation",
        "--skip-bootstrap-task",
      ]),
      { expectFailure: true },
    );
    assertFailure(aliasError, /cannot be Agent Foundry/u);
    rmSync(foundryAlias);
  }

  const descendantError = invokeBootstrap(
    bootstrapArgs(path.join(foundryRoot, "nested"), [
      "--force",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(descendantError, /cannot be Agent Foundry/u);

  const missingError = invokeBootstrap(
    bootstrapArgs(missingRoot, [
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(missingError, /does not exist/u);
  assert.equal(existsSync(missingRoot), false);

  const initializeError = invokeBootstrap(
    bootstrapArgs(missingRoot, [
      "--create-target",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(initializeError, /requires --initialize-git/u);
  assert.equal(existsSync(missingRoot), false);

  const swallowedFlagError = invokeBootstrap([
    "--target-path",
    missingRoot,
    "--project-name",
    "--force",
    "--project-description",
    projectDescription,
    "--create-target",
    "--initialize-git",
  ], { expectFailure: true });
  assertFailure(swallowedFlagError, /requires a non-empty value/u);
  assert.equal(existsSync(missingRoot), false);

  const multilineArgs = bootstrapArgs(missingRoot, [
    "--create-target",
    "--initialize-git",
    "--skip-validation",
    "--skip-bootstrap-task",
  ]);
  multilineArgs[multilineArgs.indexOf(projectName)] = "Invalid\nProject";
  const multilineError = invokeBootstrap(multilineArgs, {
    expectFailure: true,
  });
  assertFailure(multilineError, /single line/u);
  assert.equal(existsSync(missingRoot), false);

  mkdirSync(collisionRoot);
  writeFileSync(path.join(collisionRoot, "docs"), "ancestor file collision");
  const ancestorError = invokeBootstrap(
    bootstrapArgs(collisionRoot, [
      "--initialize-git",
      "--force",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(ancestorError, /cannot install beneath file paths/u);
  assert.equal(existsSync(path.join(collisionRoot, ".git")), false);
  rmSync(path.join(collisionRoot, "docs"));

  // AGENTS.md is a seed file the installer does overwrite, so it is a real
  // collision. (The append-only journals are deliberately not — see the
  // preserve-if-exists assertions further down.)
  writeFileSync(
    path.join(collisionRoot, "AGENTS.md"),
    "pre-existing contract",
  );
  const preflightError = invokeBootstrap(
    bootstrapArgs(collisionRoot, [
      "--initialize-git",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(preflightError, /refused to overwrite existing files/u);
  assert.equal(existsSync(path.join(collisionRoot, ".git")), false);
  rmSync(path.join(collisionRoot, "AGENTS.md"));

  mkdirSync(path.join(collisionRoot, "HANDOFF.md"));
  const directoryError = invokeBootstrap(
    bootstrapArgs(collisionRoot, [
      "--initialize-git",
      "--force",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(directoryError, /cannot replace non-file paths/u);
  assert.equal(existsSync(path.join(collisionRoot, ".git")), false);
  rmSync(path.join(collisionRoot, "HANDOFF.md"), { recursive: true });

  mkdirSync(path.join(collisionRoot, ".gitignore"));
  const ignoreDirectoryError = invokeBootstrap(
    bootstrapArgs(collisionRoot, [
      "--initialize-git",
      "--force",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(ignoreDirectoryError, /cannot merge the non-file path/u);
  assert.equal(existsSync(path.join(collisionRoot, ".git")), false);
  rmSync(path.join(collisionRoot, ".gitignore"), { recursive: true });

  if (process.platform !== "win32") {
    const externalDestination = path.join(tempRoot, "outside-agents.md");
    symlinkSync(externalDestination, path.join(collisionRoot, "AGENTS.md"));
    const danglingLinkError = invokeBootstrap(
      bootstrapArgs(collisionRoot, [
        "--initialize-git",
        "--force",
        "--skip-validation",
        "--skip-bootstrap-task",
      ]),
      { expectFailure: true },
    );
    assertFailure(danglingLinkError, /cannot replace non-file paths/u);
    assert.equal(existsSync(externalDestination), false);
    assert.equal(existsSync(path.join(collisionRoot, ".git")), false);
    rmSync(path.join(collisionRoot, "AGENTS.md"));
  }

  const foreignIgnore = "foreign-entry\n\n# existing section";
  writeFileSync(path.join(collisionRoot, ".gitignore"), foreignIgnore);
  const gitError = invokeBootstrap(
    bootstrapArgs(collisionRoot, [
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(gitError, /not a Git repository/u);
  assert.equal(existsSync(path.join(collisionRoot, ".git")), false);

  invokeBootstrap(
    bootstrapArgs(collisionRoot, [
      "--initialize-git",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
  );
  const mergedForeignIgnore = readFileSync(
    path.join(collisionRoot, ".gitignore"),
    "utf8",
  );
  assert(mergedForeignIgnore.startsWith(foreignIgnore));
  assert(mergedForeignIgnore.includes(".tasks/board.html"));

  invokeBootstrap(
    bootstrapArgs(testRoot, ["--create-target", "--initialize-git"]),
  );

  const required = [
    ".agents/skills/claude-in-codex/SKILL.md",
    ".agents/skills/claude-in-codex/scripts/claude-ask.mjs",
    ".agents/skills/claude-in-codex/scripts/claude-ask.test.mjs",
    ".agents/skills/agent-headless/SKILL.md",
    ".agents/skills/cursor-cli/SKILL.md",
    ".agents/skills/cursor-cli/scripts/cursor-agent.mjs",
    ".agents/skills/cursor-cli/scripts/cursor-agent.test.mjs",
    ".agents/skills/diagnosing-bugs/scripts/hitl-loop.template.mjs",
    ".claude/skills/codex-in-claude/SKILL.md",
    ".claude/skills/agent-headless/SKILL.md",
    ".claude/skills/cursor-cli/SKILL.md",
    ".claude/skills/cursor-cli/scripts/cursor-agent.mjs",
    ".claude/skills/cursor-cli/scripts/cursor-agent.test.mjs",
    ".claude/skills/diagnosing-bugs/scripts/hitl-loop.template.mjs",
    ".agents/skills/task-tracker/scripts/task.mjs",
    ".claude/skills/task-tracker/scripts/task.mjs",
    ".tasks/tasks/task-001-tailor-agent-foundry-bootstrap-to-this-project.md",
    "docs/adr/template.md",
    "docs/ENGINEERING-STANDARDS.md",
    "docs/REVIEW-STANDARDS.md",
    "docs/SDLC.md",
    "docs/out-of-scope/README.md",
    "BLOCKED-JOURNAL.md",
    "PLANNING-JOURNAL.md",
    "AGENTS.md",
    "CLAUDE.md",
    "CONTRIBUTING.md",
    "HANDOFF.md",
    ".agent-foundry.json",
    ".agent-foundry/check-skill-sync.mjs",
    ".agent-foundry/agent-headless/cli.js",
    ".agent-foundry/agent-headless/index.js",
    ".agent-foundry/agent-headless/PROVENANCE.md",
    ".agent-foundry/agent-headless/LICENSE",
    ".agent-foundry/agent-headless/cli.test.mjs",
    ".agent-foundry/agent-headless/COMPATIBILITY.md",
    ".agent-foundry/project-status.mjs",
    ".agent-foundry/project-status.test.mjs",
    ".agent-foundry/project-overview.mjs",
    ".agent-foundry/project-overview.test.mjs",
  ];
  for (const relative of required) {
    assert(
      existsSync(path.join(testRoot, ...relative.split("/"))),
      `Bootstrap did not create required file: ${relative}`,
    );
  }

  // The installed sync checker must pass on a freshly installed tree; if it
  // does not, the two harness copies shipped out of step.
  const syncOutput = run(
    process.execPath,
    [path.join(testRoot, ".agent-foundry", "check-skill-sync.mjs")],
    { cwd: testRoot, label: "installed skill-sync check" },
  ).stdout;
  assert.match(syncOutput, /skill-sync: PASS \(16 shared skills\)/u);

  const projectStatus = JSON.parse(run(
    process.execPath,
    [path.join(testRoot, ".agent-foundry", "project-status.mjs"), "--json"],
    { cwd: testRoot, label: "installed project status" },
  ).stdout);
  assert.equal(projectStatus.schemaVersion, 1);
  assert.equal(projectStatus.project.name, projectName);
  assert.equal(projectStatus.work.inProgress[0].id, "task-001");
  assert.equal(projectStatus.milestone.freshness, "unknown");

  run(
    process.execPath,
    [path.join(testRoot, ".agent-foundry", "project-overview.mjs")],
    { cwd: testRoot, label: "installed project overview" },
  );
  const projectOverviewPath = path.join(
    testRoot,
    ".agent-foundry",
    "project-overview.html",
  );
  assert.equal(existsSync(projectOverviewPath), true);
  const projectOverview = readFileSync(projectOverviewPath, "utf8");
  assert.match(projectOverview, /Current approved direction/u);
  assert.match(projectOverview, /Work flow/u);

  const runnerVersion = run(
    process.execPath,
    [path.join(testRoot, ".agent-foundry", "agent-headless", "cli.js"), "--version"],
    { cwd: testRoot, label: "installed agent-headless version" },
  ).stdout.trim();
  const installedProvenance = readFileSync(
    path.join(testRoot, ".agent-foundry", "agent-headless", "PROVENANCE.md"),
    "utf8",
  );
  const installedVersion = installedProvenance.match(/^- Version: `([^`]+)`$/mu)?.[1];
  assert(installedVersion, "Installed agent-headless provenance version is missing");
  assert.equal(runnerVersion, installedVersion);

  const installedChecks = run(
    process.execPath,
    [path.join(testRoot, ".agent-foundry", "run-checks.mjs")],
    { cwd: testRoot, label: "installed full Foundry checks" },
  ).stdout;
  assert.match(installedChecks, /PASS \(skill-sync \+ \d+ suites\)/u);
  assert.match(
    installedChecks,
    /Subtest: project overview/u,
    "installed run-checks did not discover project-overview.test.mjs",
  );

  const agents = readFileSync(path.join(testRoot, "AGENTS.md"), "utf8");
  assert(agents.includes(projectName));
  assert(!agents.replaceAll(projectName, "").includes("{{PROJECT_"));

  const manifestText = readFileSync(
    path.join(testRoot, ".agent-foundry.json"),
    "utf8",
  );
  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.projectName, projectName);
  assert.equal(manifest.projectDescription, projectDescription);
  assert.equal(typeof manifest.defaultBranch, "string");
  assert.notEqual(manifest.defaultBranch, "");
  const foundryVersion = readFileSync(
    path.join(foundryRoot, "VERSION"),
    "utf8",
  ).trim();
  assert.equal(manifest.foundryVersion, foundryVersion);

  // The install manifest drives every upgrade decision, so assert its shape
  // and that a freshly installed tree reports zero drift against it.
  const installManifest = JSON.parse(
    readFileSync(
      path.join(testRoot, ".agent-foundry", "manifest.json"),
      "utf8",
    ),
  );
  assert.equal(installManifest.foundryVersion, foundryVersion);
  assert.equal(installManifest.files["AGENTS.md"].tier, "seed");
  assert.equal(
    installManifest.files["PLANNING-JOURNAL.md"].preserveIfExists,
    true,
  );
  assert.equal(installManifest.files["docs/SDLC.md"].tier, "mold");
  assert.equal(
    installManifest.files[".agent-foundry/agent-headless/cli.js"].tier,
    "mold",
  );
  assert.equal(
    installManifest.files[".claude/skills/task-tracker/SKILL.md"].tier,
    "mold",
  );
  const driftOutput = run(
    process.execPath,
    [path.join(testRoot, ".agent-foundry", "check-foundry-drift.mjs")],
    { cwd: testRoot, label: "installed drift check" },
  ).stdout;
  assert.match(driftOutput, /No drift: all \d+ managed files match the install/u);
  for (const templatedFile of [
    "AGENTS.md",
    "CLAUDE.md",
    "CONTRIBUTING.md",
    "HANDOFF.md",
  ]) {
    const text = readFileSync(path.join(testRoot, templatedFile), "utf8");
    const withoutExpectedValues = text
      .replaceAll(projectName, "")
      .replaceAll(projectDescription, "");
    assert(!withoutExpectedValues.includes("{{PROJECT_"));
  }

  const taskCli = path.join(
    testRoot,
    ".agents",
    "skills",
    "task-tracker",
    "scripts",
    "task.mjs",
  );
  const task = run(process.execPath, [taskCli, "show", "task-001"], {
    cwd: testRoot,
    label: "read bootstrap task",
  }).stdout;
  assert.match(task, /status: in_progress/u);
  const taskFile = readdirSync(path.join(testRoot, ".tasks", "tasks"))
    .find((name) => /^task-001-.*\.md$/u.test(name));
  assert(taskFile);
  const taskPath = path.join(testRoot, ".tasks", "tasks", taskFile);
  const taskBytesBeforeForce = readFileSync(taskPath);

  const nestedRoot = path.join(testRoot, "nested");
  mkdirSync(nestedRoot);
  const nestedError = invokeBootstrap(
    bootstrapArgs(nestedRoot, [
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(nestedError, /must be the Git root/u);
  assert.equal(existsSync(path.join(nestedRoot, ".agents")), false);

  const missingNestedRoot = path.join(testRoot, "missing-nested");
  const missingNestedError = invokeBootstrap(
    bootstrapArgs(missingNestedRoot, [
      "--create-target",
      "--initialize-git",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(missingNestedError, /must be the Git root/u);
  assert.equal(existsSync(missingNestedRoot), false);

  const collisionError = invokeBootstrap(
    bootstrapArgs(testRoot, [
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
    { expectFailure: true },
  );
  assertFailure(collisionError, /refused to overwrite existing files/u);

  const ignorePath = path.join(testRoot, ".gitignore");
  appendFileSync(ignorePath, "existing-project-entry\r\n", "utf8");
  const ignoreBeforeForce = readFileSync(ignorePath, "utf8");
  const agentsBeforeForce = readFileSync(path.join(testRoot, "AGENTS.md"));

  // Append-only project logs accumulate irreplaceable history and must
  // survive a forced reinstall untouched — LOCAL-CHANGES.md especially, since
  // it is the record an upgrade consults to know what not to revert.
  const preservedLogs = [
    path.join(".agent-foundry", "LOCAL-CHANGES.md"),
    "PLANNING-JOURNAL.md",
    "BLOCKED-JOURNAL.md",
  ];
  const preservedBefore = new Map();
  for (const relative of preservedLogs) {
    const full = path.join(testRoot, relative);
    appendFileSync(full, `\nproject-authored entry for ${relative}\n`, "utf8");
    preservedBefore.set(relative, readFileSync(full, "utf8"));
  }

  invokeBootstrap(
    bootstrapArgs(testRoot, [
      "--force",
      "--skip-validation",
    ]),
  );

  for (const relative of preservedLogs) {
    assert.equal(
      readFileSync(path.join(testRoot, relative), "utf8"),
      preservedBefore.get(relative),
      `--force overwrote an append-only project log: ${relative}`,
    );
  }
  const ignore = readFileSync(ignorePath, "utf8");
  assert(ignore.includes("existing-project-entry"));
  assert(ignore.startsWith(ignoreBeforeForce));
  assert.equal(
    ignore.split(/\r?\n/u).filter((line) => line === ".tasks/board.html").length,
    1,
  );
  assert.equal(
    ignore.split(/\r?\n/u).filter((line) => (
      line === ".agent-foundry/project-status-seen.json"
    )).length,
    1,
  );
  assert.equal(
    ignore.split(/\r?\n/u).filter((line) => (
      line === ".agent-foundry/project-overview.html"
    )).length,
    1,
  );

  let backupRoots = listDirectories(
    path.join(testRoot, ".agent-foundry-backups"),
  );
  assert.equal(backupRoots.length, 1);
  const backedUpAgents = readFileSync(path.join(backupRoots[0], "AGENTS.md"));
  assert.deepEqual(backedUpAgents, agentsBeforeForce);
  assert(ignore.includes(".agent-foundry-backups/"));
  assert.deepEqual(readFileSync(taskPath), taskBytesBeforeForce);
  assert.match(
    run(process.execPath, [taskCli, "board"], {
      cwd: testRoot,
      label: "board after forced reinstall",
    }).stdout,
    /task-001/u,
  );

  // A forced upgrade resets seed files and rewrites the manifest, so the
  // ordinary drift report cannot detect the loss afterward. The installed
  // reconciliation command must derive the complete seed set from that new
  // manifest and restore committed project content, including CLAUDE.md.
  invokeBootstrap(
    bootstrapArgs(seedUpgradeRoot, [
      "--create-target",
      "--initialize-git",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
  );
  run("git", ["config", "user.email", "foundry-test@example.invalid"], {
    cwd: seedUpgradeRoot,
    label: "configure seed fixture Git email",
  });
  run("git", ["config", "user.name", "Foundry Test"], {
    cwd: seedUpgradeRoot,
    label: "configure seed fixture Git name",
  });
  run("git", ["config", "commit.gpgsign", "false"], {
    cwd: seedUpgradeRoot,
    label: "disable seed fixture signing",
  });
  run("git", ["config", "core.autocrlf", "false"], {
    cwd: seedUpgradeRoot,
    label: "pin seed fixture line endings",
  });
  run("git", ["config", "core.hooksPath", ".no-hooks"], {
    cwd: seedUpgradeRoot,
    label: "isolate seed fixture hooks",
  });
  run("git", ["add", "."], { cwd: seedUpgradeRoot, label: "stage seed fixture" });
  run("git", ["commit", "-m", "baseline"], {
    cwd: seedUpgradeRoot,
    label: "commit seed fixture baseline",
  });
  const claudePath = path.join(seedUpgradeRoot, "CLAUDE.md");
  appendFileSync(claudePath, "\nProject-specific Claude instruction.\n", "utf8");
  const customizedClaude = readFileSync(claudePath, "utf8");
  run("git", ["add", "CLAUDE.md"], {
    cwd: seedUpgradeRoot,
    label: "stage customized CLAUDE.md",
  });
  run("git", ["commit", "-m", "customize Claude instructions"], {
    cwd: seedUpgradeRoot,
    label: "commit customized CLAUDE.md",
  });
  invokeBootstrap(
    bootstrapArgs(seedUpgradeRoot, [
      "--force",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
  );
  assert.notEqual(readFileSync(claudePath, "utf8"), customizedClaude);
  const resetDrift = run(
    process.execPath,
    [path.join(seedUpgradeRoot, ".agent-foundry", "check-foundry-drift.mjs")],
    { cwd: seedUpgradeRoot, label: "drift after forced seed reset" },
  ).stdout;
  assert.match(resetDrift, /No drift:/u);
  const seedRestore = run(
    process.execPath,
    [
      path.join(seedUpgradeRoot, ".agent-foundry", "reconcile-seeds.mjs"),
      "--restore-from-head",
    ],
    { cwd: seedUpgradeRoot, label: "restore project seed files" },
  ).stdout;
  assert.match(seedRestore, /restored: CLAUDE\.md/u);
  assert.equal(readFileSync(claudePath, "utf8"), customizedClaude);

  invokeBootstrap(
    bootstrapArgs(testRoot, [
      "--force",
      "--skip-validation",
      "--skip-bootstrap-task",
    ]),
  );
  backupRoots = listDirectories(
    path.join(testRoot, ".agent-foundry-backups"),
  );
  assert.equal(backupRoots.length, 2);

  console.log("Agent Foundry clean-project bootstrap: PASS");
} finally {
  const resolved = path.resolve(tempRoot);
  assert(
    samePath(path.dirname(resolved), path.resolve(os.tmpdir())),
    `Refusing to remove unexpected test path: ${resolved}`,
  );
  rmSync(resolved, { recursive: true, force: true });
}
