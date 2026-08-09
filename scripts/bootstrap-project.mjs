#!/usr/bin/env node

import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalPath,
  CommandError,
  isSameOrDescendant,
  listFiles,
  markdownFencesAreBalanced,
  pathKind,
  run,
  samePath,
} from "./foundry-lib.mjs";
// Imported from the payload on purpose: the installer records these hashes and
// the installed drift checker verifies them, so they must be the same function.
import { hashManagedFile } from "../starter/.agent-foundry/check-foundry-drift.mjs";

const foundryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const starterRoot = path.join(foundryRoot, "starter");

// Files the installer seeds once and the project owns from then on. An upgrade
// must never silently overwrite these; everything else is "mold" the Foundry
// owns and replaces, with local edits surfaced as drift instead.
const SEED_FILES = new Set([
  ".agent-foundry/LOCAL-CHANGES.md",
  "AGENTS.md",
  "BLOCKED-JOURNAL.md",
  "CLAUDE.md",
  "CONTRIBUTING.md",
  "HANDOFF.md",
  "PLANNING-JOURNAL.md",
  "docs/ENGINEERING-STANDARDS.md",
  "docs/REVIEW-STANDARDS.md",
  "docs/adr/README.md",
  "docs/out-of-scope/README.md",
]);

export function readFoundryVersion() {
  const version = readFileSync(path.join(foundryRoot, "VERSION"), "utf8").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version)) {
    throw new Error(`VERSION must contain a semantic version; found: ${version}`);
  }
  return version;
}

const optionDefinitions = new Map([
  ["--target-path", { name: "targetPath", takesValue: true }],
  ["--project-name", { name: "projectName", takesValue: true }],
  ["--project-description", {
    name: "projectDescription",
    takesValue: true,
  }],
  ["--create-target", { name: "createTarget", takesValue: false }],
  ["--initialize-git", { name: "initializeGit", takesValue: false }],
  ["--force", { name: "force", takesValue: false }],
  ["--skip-validation", { name: "skipValidation", takesValue: false }],
  ["--skip-bootstrap-task", {
    name: "skipBootstrapTask",
    takesValue: false,
  }],
  ["--help", { name: "help", takesValue: false }],
]);

function usage() {
  return [
    "Usage:",
    "  node scripts/bootstrap-project.mjs --target-path <absolute-repository-root> --project-name <name> --project-description <factual-description> [options]",
    "",
    "Options:",
    "  --create-target         Create a missing target directory.",
    "  --initialize-git        Run git init when the target is not a repository.",
    "  --force                 Overwrite managed-file collisions after approval.",
    "  --skip-validation       Skip installed test and skill validation.",
    "  --skip-bootstrap-task   Do not create the initial tailoring task.",
    "  --help                  Show this help.",
  ].join("\n");
}

export function parseArguments(args) {
  const options = {};
  const seen = new Set();

  for (let index = 0; index < args.length; index += 1) {
    const raw = args[index];
    const equalsIndex = raw.indexOf("=");
    const flag = equalsIndex === -1 ? raw : raw.slice(0, equalsIndex);
    const inlineValue = equalsIndex === -1
      ? undefined
      : raw.slice(equalsIndex + 1);
    const definition = optionDefinitions.get(flag);

    if (!definition) {
      throw new Error(`Unknown option: ${flag}\n\n${usage()}`);
    }
    if (seen.has(flag)) {
      throw new Error(`Option may only be provided once: ${flag}`);
    }
    seen.add(flag);
    if (!definition.takesValue) {
      if (inlineValue !== undefined) {
        throw new Error(`${flag} does not take a value.`);
      }
      options[definition.name] = true;
      continue;
    }

    const value = inlineValue ?? args[index + 1];
    if (inlineValue === undefined) {
      index += 1;
    }
    if (
      value === undefined
      || value === ""
      || (inlineValue === undefined && optionDefinitions.has(value))
    ) {
      throw new Error(`${flag} requires a non-empty value.`);
    }
    options[definition.name] = value;
  }

  return options;
}

function requireString(options, name, flag) {
  if (typeof options[name] !== "string" || options[name].length === 0) {
    throw new Error(`${flag} is required.\n\n${usage()}`);
  }
  if (/[\u0000-\u001f\u007f\u2028\u2029]/u.test(options[name])) {
    throw new Error(`${flag} must be a single line without control characters.`);
  }
}

function buildCopyPlan(targetRoot) {
  return listFiles(starterRoot)
    .filter((source) => path.basename(source) !== ".gitignore.append")
    .map((source) => {
      let relative = path.relative(starterRoot, source);
      if (relative.toLowerCase().endsWith(".template")) {
        relative = relative.slice(0, -".template".length);
      }
      const key = relative.split(path.sep).join("/");
      return {
        source,
        relative,
        destination: path.join(targetRoot, relative),
        // Append-only project logs: the payload version is an empty header
        // with no upgrade value, while the project's version is irreplaceable
        // history. Seeding them once is the whole contract; overwriting them
        // on a later --force destroys exactly what they exist to accumulate.
        preserveIfExists: PRESERVE_IF_EXISTS.has(key),
      };
    });
}

// Once written, never rewritten — not even with --force. `seed` files are
// reset by an upgrade and reconciled from the backup; these are not, because
// the file whose purpose is surviving upgrades must actually survive them.
const PRESERVE_IF_EXISTS = new Set([
  ".agent-foundry/LOCAL-CHANGES.md",
  "BLOCKED-JOURNAL.md",
  "PLANNING-JOURNAL.md",
]);

function isPreserved(item) {
  return item.preserveIfExists && pathKind(item.destination) === "file";
}

function findCollisions(copyPlan, targetRoot, targetExists) {
  if (!targetExists) {
    return [];
  }

  const ancestorCollisions = new Set();
  for (const item of copyPlan) {
    let cursor = path.dirname(item.destination);
    while (!samePath(cursor, targetRoot)) {
      if (pathKind(cursor) !== "missing" && pathKind(cursor) !== "directory") {
        ancestorCollisions.add(path.relative(targetRoot, cursor));
      }
      const parent = path.dirname(cursor);
      if (samePath(parent, cursor)) {
        break;
      }
      cursor = parent;
    }
  }
  if (ancestorCollisions.size > 0) {
    throw new Error(
      "Agent Foundry cannot install beneath file paths:\n"
      + [...ancestorCollisions].sort().join("\n"),
    );
  }

  const nonFileCollisions = copyPlan.filter((item) => {
    const kind = pathKind(item.destination);
    return kind !== "missing" && kind !== "file";
  });
  if (nonFileCollisions.length > 0) {
    throw new Error(
      "Agent Foundry cannot replace non-file paths:\n"
      + nonFileCollisions.map((item) => item.relative).sort().join("\n"),
    );
  }

  // A preserved log is not a collision: nothing overwrites it, so there is
  // nothing to refuse and nothing to back up.
  return copyPlan.filter((item) => (
    pathKind(item.destination) === "file" && !item.preserveIfExists
  ));
}

function verifyRuntime() {
  const major = Number.parseInt(process.versions.node.split(".", 1)[0], 10);
  if (!Number.isInteger(major) || major < 20) {
    throw new Error(
      `Node.js 20 or newer is required; found ${process.version}.`,
    );
  }

  run("git", ["--version"], { label: "git" });
}

function getGitRoot(targetRoot) {
  try {
    return run(
      "git",
      ["-C", targetRoot, "rev-parse", "--show-toplevel"],
      {
        env: { ...process.env, LANG: "C", LC_ALL: "C" },
        label: "git rev-parse",
      },
    ).stdout.trim();
  } catch (error) {
    const detail = error instanceof CommandError
      ? `${error.stdout}\n${error.stderr}`
      : "";
    if (/not a git repository/iu.test(detail)) {
      return null;
    }
    throw error;
  }
}

function initializeOrVerifyGit(targetRoot, initializeGit) {
  let gitRoot = getGitRoot(targetRoot);
  if (!gitRoot) {
    if (!initializeGit) {
      throw new Error(
        `--target-path is not a Git repository. Re-run with --initialize-git: ${targetRoot}`,
      );
    }
    run("git", ["-C", targetRoot, "init"], { label: "git init" });
    gitRoot = getGitRoot(targetRoot);
    if (!gitRoot) {
      throw new Error(
        `--target-path did not become a readable Git repository: ${targetRoot}`,
      );
    }
  }

  const prefix = run(
    "git",
    ["-C", targetRoot, "rev-parse", "--show-prefix"],
    { label: "git rev-parse --show-prefix" },
  ).stdout.trim();
  if (prefix || !samePath(gitRoot, targetRoot)) {
    throw new Error(
      `--target-path must be the Git root, not a subdirectory`
      + (prefix ? ` (prefix: ${prefix})` : "."),
    );
  }
}

function optionalGitText(targetRoot, args) {
  try {
    return run("git", ["-C", targetRoot, ...args], {
      label: `git ${args[0]}`,
    }).stdout.trim();
  } catch (error) {
    if (error instanceof CommandError) return "";
    throw error;
  }
}

function resolveDefaultBranch(targetRoot) {
  const originHead = optionalGitText(
    targetRoot,
    ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"],
  );
  if (originHead) return originHead.replace(/^origin\//u, "");
  const remoteHeads = optionalGitText(
    targetRoot,
    ["for-each-ref", "--format=%(symref:short)", "refs/remotes/*/HEAD"],
  ).split(/\r?\n/u).filter(Boolean);
  if (remoteHeads.length === 1) {
    return remoteHeads[0].replace(/^[^/]+\//u, "");
  }
  // No remote HEAD at all: the active branch may be a task branch (the
  // installer often runs mid-task), so prefer the configured or
  // conventional default when such a local branch exists before trusting
  // HEAD. Ambiguous multi-remote-HEAD repositories keep the prior
  // active-HEAD fallback.
  if (remoteHeads.length === 0) {
    const configured = optionalGitText(targetRoot, ["config", "--get", "init.defaultBranch"]);
    for (const candidate of [configured, "main", "master"].filter(Boolean)) {
      const exists = optionalGitText(
        targetRoot,
        ["rev-parse", "--verify", "--quiet", `refs/heads/${candidate}`],
      );
      if (exists) return candidate;
    }
  }
  return optionalGitText(
    targetRoot,
    ["symbolic-ref", "--quiet", "--short", "HEAD"],
  ) || null;
}

function backupCollisions(targetRoot, collisions, installedAt) {
  if (collisions.length === 0) {
    return null;
  }

  const stamp = installedAt.replace(/[-:.]/gu, "");
  const parent = path.join(targetRoot, ".agent-foundry-backups");
  mkdirSync(parent, { recursive: true });
  let backupRoot = path.join(parent, stamp);
  let suffix = 1;
  while (existsSync(backupRoot)) {
    backupRoot = path.join(parent, `${stamp}-${suffix}`);
    suffix += 1;
  }
  mkdirSync(backupRoot);

  for (const collision of collisions) {
    const backupDestination = path.join(backupRoot, collision.relative);
    mkdirSync(path.dirname(backupDestination), { recursive: true });
    copyFileSync(collision.destination, backupDestination);
  }
  console.log(`Previous managed files were backed up to ${backupRoot}`);
  return backupRoot;
}

function renderStarter(copyPlan, options, installedAt, foundryVersion, defaultBranch) {

  const replacements = new Map([
    ["{{PROJECT_NAME}}", options.projectName],
    ["{{PROJECT_DESCRIPTION}}", options.projectDescription],
    ["{{PROJECT_NAME_JSON}}", JSON.stringify(options.projectName)],
    [
      "{{PROJECT_DESCRIPTION_JSON}}",
      JSON.stringify(options.projectDescription),
    ],
    ["{{INSTALLED_AT_JSON}}", JSON.stringify(installedAt)],
    ["{{FOUNDRY_VERSION_JSON}}", JSON.stringify(foundryVersion)],
    ["{{DEFAULT_BRANCH_JSON}}", JSON.stringify(defaultBranch)],
  ]);

  const tokenPattern = /\{\{(?:PROJECT_NAME|PROJECT_DESCRIPTION|PROJECT_NAME_JSON|PROJECT_DESCRIPTION_JSON|INSTALLED_AT_JSON|FOUNDRY_VERSION_JSON|DEFAULT_BRANCH_JSON)\}\}/gu;
  const preserved = [];
  for (const item of copyPlan) {
    if (isPreserved(item)) {
      preserved.push(item.relative);
      continue;
    }
    mkdirSync(path.dirname(item.destination), { recursive: true });
    const content = readFileSync(item.source, "utf8").replace(
      tokenPattern,
      (token) => replacements.get(token),
    );
    writeFileSync(item.destination, content, "utf8");
  }
  if (preserved.length > 0) {
    console.log(
      `Preserved existing project logs (not overwritten):\n  ${
        preserved.sort().join("\n  ")
      }`,
    );
  }
}

// Records what was installed, at which version, and the hash of every managed
// file as written. An upgrade reads this to tell a pristine file (safe to
// replace) from one the project has deliberately evolved (must be reconciled).
function writeInstallManifest(targetRoot, copyPlan, installedAt, foundryVersion) {
  const files = {};
  for (const item of copyPlan) {
    const relative = item.relative.split(path.sep).join("/");
    files[relative] = {
      tier: SEED_FILES.has(relative) ? "seed" : "mold",
      sha256: hashManagedFile(readFileSync(item.destination, "utf8")),
      ...(item.preserveIfExists ? { preserveIfExists: true } : {}),
    };
  }
  const manifestPath = path.join(targetRoot, ".agent-foundry", "manifest.json");
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        foundryVersion,
        installedAt,
        files: Object.fromEntries(Object.entries(files).sort()),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function mergeGitignore(targetRoot) {
  const source = path.join(starterRoot, ".gitignore.append");
  const destination = path.join(targetRoot, ".gitignore");
  const existing = existsSync(destination)
    ? readFileSync(destination, "utf8")
    : "";
  const existingLines = new Set(existing.split(/\r?\n/u));
  const missingLines = readFileSync(source, "utf8")
    .split(/\r?\n/u)
    .filter((line) => line.length > 0 && !existingLines.has(line));

  if (missingLines.length === 0) {
    return;
  }

  const newline = existing.includes("\r\n") ? "\r\n" : "\n";
  const prefix = existing.length > 0 && !existing.endsWith("\n")
    ? newline
    : "";
  appendFileSync(
    destination,
    `${prefix}${missingLines.join(newline)}${newline}`,
    "utf8",
  );
}

function validateInstalledPayload(targetRoot, copyPlan) {
  const installedTests = copyPlan
    .map((item) => item.destination)
    .filter((file) => file.endsWith(".test.mjs"));

  // Both harnesses must ship their own tests; a tree that installed without
  // them would pass validation vacuously.
  for (const harness of [".agents", ".claude"]) {
    const harnessRoot = path.join(targetRoot, harness);
    const harnessTests = installedTests.filter((file) => (
      isSameOrDescendant(file, harnessRoot)
    ));
    if (harnessTests.length === 0) {
      throw new Error(`No ${harness}-side tests were installed.`);
    }
  }

  // Run every installed test, including payload outside the harness trees.
  run(
    process.execPath,
    ["--test", "--test-reporter=dot", ...installedTests],
    {
      cwd: targetRoot,
      label: "installed tests",
      stdio: "inherit",
    },
  );

  const skillFiles = copyPlan
    .map((item) => item.destination)
    .filter((file) => path.basename(file) === "SKILL.md");
  for (const skillFile of skillFiles) {
    const text = readFileSync(skillFile, "utf8");
    if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) {
      throw new Error(`Skill is missing YAML frontmatter: ${skillFile}`);
    }
    if (!markdownFencesAreBalanced(text)) {
      throw new Error(`Skill has unbalanced code fences: ${skillFile}`);
    }
  }
}

function createBootstrapTask(targetRoot) {
  const tasksRoot = path.join(targetRoot, ".tasks", "tasks");
  const activeTasks = readdirSync(tasksRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^task-.*\.md$/u.test(entry.name));
  if (activeTasks.length > 0) {
    console.log(
      "The target board already has active tasks; no bootstrap task was created.",
    );
    return;
  }

  const taskCli = path.join(
    targetRoot,
    ".agents",
    "skills",
    "task-tracker",
    "scripts",
    "task.mjs",
  );
  const addResult = run(process.execPath, [
    taskCli,
    "add",
    "Tailor Agent Foundry bootstrap to this project",
    "--priority",
    "p0",
    "--tag",
    "area:process",
    "--tag",
    "phase:bootstrap",
    "--description",
    "Replace customization markers using live repository evidence; record sources of truth, product invariants, real validation commands, and the initial dependency-ordered implementation front. Validate both skill trees and run cold SPEC/STANDARDS review.",
  ], { cwd: targetRoot, label: "bootstrap task creation" });
  const taskIds = addResult.stdout
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => /^task-\d+$/u.test(line));
  if (taskIds.length !== 1) {
    throw new Error(
      "Bootstrap task creation did not return exactly one valid task id.",
    );
  }
  const [taskId] = taskIds;

  run(process.execPath, [taskCli, "move", taskId, "in_progress"], {
    cwd: targetRoot,
    label: `claim ${taskId}`,
    stdio: "inherit",
  });
  run(process.execPath, [
    taskCli,
    "note",
    taskId,
    "rubric: (1) authoritative project orientation is evidence-based; (2) all customization markers are resolved or explicitly scoped; (3) validation commands execute; (4) initial tasks are dependency-ordered and context-sized; (5) cold SPEC and STANDARDS reviews are adjudicated",
  ], {
    cwd: targetRoot,
    label: `write ${taskId} rubric`,
    stdio: "inherit",
  });
}

export function bootstrap(options) {
  requireString(options, "targetPath", "--target-path");
  requireString(options, "projectName", "--project-name");
  requireString(options, "projectDescription", "--project-description");
  const fullyQualified = process.platform === "win32"
    ? /^(?:[A-Za-z]:[\\/]|\\\\[^\\/]+[\\/][^\\/]+)/u.test(options.targetPath)
    : path.isAbsolute(options.targetPath);
  if (!fullyQualified) {
    throw new Error("--target-path must be an absolute path.");
  }

  verifyRuntime();

  const targetRoot = canonicalPath(options.targetPath);
  if (isSameOrDescendant(targetRoot, foundryRoot)) {
    throw new Error(
      "TargetPath cannot be Agent Foundry itself or one of its descendants.",
    );
  }

  const targetKind = pathKind(targetRoot);
  const targetExists = targetKind !== "missing";
  if (!targetExists && !options.createTarget) {
    throw new Error(
      `--target-path does not exist. Re-run with --create-target: ${targetRoot}`,
    );
  }
  if (!targetExists && !options.initializeGit) {
    throw new Error(
      "A newly created target also requires --initialize-git.",
    );
  }
  if (targetExists && targetKind !== "directory") {
    throw new Error(`--target-path is not a directory: ${targetRoot}`);
  }

  if (!targetExists) {
    let existingAncestor = path.dirname(targetRoot);
    while (pathKind(existingAncestor) === "missing") {
      const parent = path.dirname(existingAncestor);
      if (parent === existingAncestor) {
        break;
      }
      existingAncestor = parent;
    }
    const ancestorGitRoot = getGitRoot(existingAncestor);
    if (ancestorGitRoot) {
      throw new Error(
        "--target-path must be the Git root, not a subdirectory.",
      );
    }
  }

  const copyPlan = buildCopyPlan(targetRoot);
  const collisions = findCollisions(copyPlan, targetRoot, targetExists);
  const ignoreKind = pathKind(path.join(targetRoot, ".gitignore"));
  if (ignoreKind !== "missing" && ignoreKind !== "file") {
    throw new Error(
      "Agent Foundry cannot merge the non-file path: .gitignore",
    );
  }
  if (collisions.length > 0 && !options.force) {
    throw new Error(
      "Agent Foundry refused to overwrite existing files. Review these "
      + "collisions and re-run with explicit --force approval if appropriate:\n"
      + collisions.map((item) => item.relative).sort().join("\n"),
    );
  }

  let createdTarget = false;
  if (!targetExists) {
    mkdirSync(targetRoot, { recursive: true });
    createdTarget = true;
  }
  try {
    initializeOrVerifyGit(targetRoot, options.initializeGit);
  } catch (error) {
    if (createdTarget) {
      rmSync(targetRoot, { recursive: true, force: true });
    }
    throw error;
  }
  const installedAt = new Date().toISOString();
  const foundryVersion = readFoundryVersion();
  const defaultBranch = resolveDefaultBranch(targetRoot);
  if (options.force) {
    backupCollisions(targetRoot, collisions, installedAt);
  }
  renderStarter(copyPlan, options, installedAt, foundryVersion, defaultBranch);
  writeInstallManifest(targetRoot, copyPlan, installedAt, foundryVersion);
  mergeGitignore(targetRoot);

  if (!options.skipValidation) {
    validateInstalledPayload(targetRoot, copyPlan);
  }
  if (!options.skipBootstrapTask) {
    createBootstrapTask(targetRoot);
  }

  console.log(
    `Agent Foundry ${foundryVersion} installed successfully at ${targetRoot}`,
  );
}

function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      return;
    }
    bootstrap(options);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && samePath(fileURLToPath(import.meta.url), process.argv[1])) {
  main();
}
