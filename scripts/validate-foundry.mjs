#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  listFiles,
  markdownFencesAreBalanced,
  run,
  samePath,
} from "./foundry-lib.mjs";

const foundryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const starterRoot = path.join(foundryRoot, "starter");
const agentSkillsRoot = path.join(starterRoot, ".agents", "skills");
const claudeSkillsRoot = path.join(starterRoot, ".claude", "skills");

function relativeFiles(root) {
  return listFiles(root).map((file) => path.relative(root, file));
}

function requireFile(relative) {
  const fullPath = path.join(starterRoot, ...relative.split("/"));
  if (!existsSync(fullPath)) {
    throw new Error(`Required starter contract is missing: ${relative}`);
  }
}

export function validateFoundry() {
  const maintainedRoots = [path.join(foundryRoot, "scripts"), starterRoot];
  const maintainedFiles = maintainedRoots.flatMap((root) => listFiles(root));
  const powerShellFiles = maintainedFiles.filter((file) => (
    file.toLowerCase().endsWith(".ps1")
  ));
  if (powerShellFiles.length > 0) {
    throw new Error(
      "PowerShell-only maintained scripts remain:\n"
      + powerShellFiles.map((file) => path.relative(foundryRoot, file)).join("\n"),
    );
  }

  for (const file of maintainedFiles.filter((item) => item.endsWith(".mjs"))) {
    run(process.execPath, ["--check", file], {
      label: `Node syntax check: ${path.relative(foundryRoot, file)}`,
    });
  }

  const decoder = new TextDecoder("utf-8", { fatal: true });
  for (const file of listFiles(starterRoot)) {
    try {
      decoder.decode(readFileSync(file));
    } catch {
      throw new Error(`Starter payload is not valid UTF-8 text: ${file}`);
    }
  }

  const agentSkillFiles = listFiles(agentSkillsRoot)
    .filter((file) => path.basename(file) === "SKILL.md");
  const claudeSkillFiles = listFiles(claudeSkillsRoot)
    .filter((file) => path.basename(file) === "SKILL.md");
  if (agentSkillFiles.length !== 8 || claudeSkillFiles.length !== 8) {
    throw new Error(
      "Expected 8 skills per harness; "
      + `found agents=${agentSkillFiles.length}, `
      + `claude=${claudeSkillFiles.length}.`,
    );
  }

  for (const skillFile of [...agentSkillFiles, ...claudeSkillFiles]) {
    const text = readFileSync(skillFile, "utf8");
    if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) {
      throw new Error(`Missing YAML frontmatter: ${skillFile}`);
    }
    if (!markdownFencesAreBalanced(text)) {
      throw new Error(`Unbalanced code fences: ${skillFile}`);
    }
  }

  requireFile(".agents/skills/claude-in-codex/SKILL.md");
  requireFile(".claude/skills/codex-in-claude/SKILL.md");
  if (existsSync(path.join(claudeSkillsRoot, "claude-in-codex"))) {
    throw new Error("claude-in-codex must exist only in the Codex-facing tree.");
  }
  if (existsSync(path.join(agentSkillsRoot, "codex-in-claude"))) {
    throw new Error("codex-in-claude must exist only in the Claude-facing tree.");
  }

  const sharedSkills = [
    "adr",
    "diagnosing-bugs",
    "execute-task",
    "grill-me",
    "handoff-writer",
    "task-tracker",
    "the-fool",
  ];
  for (const skill of sharedSkills) {
    const agentRoot = path.join(agentSkillsRoot, skill);
    const claudeRoot = path.join(claudeSkillsRoot, skill);
    const agentRelative = relativeFiles(agentRoot);
    const claudeRelative = relativeFiles(claudeRoot);
    if (agentRelative.join("\n") !== claudeRelative.join("\n")) {
      throw new Error(`Shared skill file set differs: ${skill}`);
    }

    for (const relative of agentRelative) {
      const agentText = readFileSync(path.join(agentRoot, relative), "utf8");
      const claudeText = readFileSync(path.join(claudeRoot, relative), "utf8");
      if (
        agentText.includes(".claude/skills/")
        || agentText.includes(".\\.claude\\skills\\")
      ) {
        throw new Error(
          `Codex-facing shared skill contains a Claude path: ${skill}/${relative}`,
        );
      }
      if (
        claudeText.includes(".agents/skills/")
        || claudeText.includes(".\\.agents\\skills\\")
      ) {
        throw new Error(
          `Claude-facing shared skill contains a Codex path: ${skill}/${relative}`,
        );
      }

      const normalizedAgent = agentText
        .replaceAll(".agents/skills/", ".claude/skills/")
        .replaceAll(".\\.agents\\skills\\", ".\\.claude\\skills\\")
        .replaceAll("Codex-facing", "HARNESS-facing");
      const normalizedClaude = claudeText.replaceAll(
        "Claude-facing",
        "HARNESS-facing",
      );
      if (normalizedAgent !== normalizedClaude) {
        throw new Error(
          `Shared skill content differs beyond harness paths: ${skill}/${relative}`,
        );
      }
    }
  }

  const knownSourceRegressions = /cog[ -]arc|slide-42|cadre|refs\/cog-arc|V0 architecture contract|select_operation|conductor module|crate\/package|#\[cfg\(test\)\]|EXPLAIN QUERY PLAN/iu;
  const absoluteHostPath = /(?<![A-Za-z0-9_])(?:[A-Za-z]:[\\/]|\/(?:Users|home)\/[^/\s]+\/|\/mnt\/[A-Za-z]\/)/u;
  const tokenPattern = /\{\{[A-Z][A-Z0-9_]*\}\}/gu;
  const allowedTemplateTokens = new Set([
    "{{PROJECT_NAME}}",
    "{{PROJECT_DESCRIPTION}}",
    "{{PROJECT_NAME_JSON}}",
    "{{PROJECT_DESCRIPTION_JSON}}",
    "{{INSTALLED_AT_JSON}}",
  ]);
  for (const file of listFiles(starterRoot)) {
    const text = readFileSync(file, "utf8");
    if (knownSourceRegressions.test(text)) {
      throw new Error(`Source-project assumption found in starter payload: ${file}`);
    }
    if (absoluteHostPath.test(text)) {
      throw new Error(`Absolute host path found in starter payload: ${file}`);
    }
    const tokens = [...text.matchAll(tokenPattern)].map((match) => match[0]);
    const invalidTokens = file.toLowerCase().endsWith(".template")
      ? tokens.filter((token) => !allowedTemplateTokens.has(token))
      : tokens;
    if (invalidTokens.length > 0) {
      throw new Error(
        `Invalid or unresolved identity token in ${file}: ${invalidTokens[0]}`,
      );
    }
  }

  [
    "AGENTS.md.template",
    "CLAUDE.md.template",
    ".agent-foundry.json.template",
    "CONTRIBUTING.md.template",
    "HANDOFF.md.template",
    "docs/adr/README.md",
    "docs/adr/template.md",
    "docs/ENGINEERING-STANDARDS.md",
    "docs/REVIEW-STANDARDS.md",
    "docs/SDLC.md",
    "docs/out-of-scope/README.md",
    "BLOCKED-JOURNAL.md",
    "PLANNING-JOURNAL.md",
    ".gitignore.append",
    ".agent-foundry/check-skill-sync.mjs",
    ".agent-foundry/check-skill-sync.test.mjs",
  ].forEach(requireFile);

  console.log("Agent Foundry structural validation: PASS");
}

function main() {
  try {
    validateFoundry();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && samePath(fileURLToPath(import.meta.url), process.argv[1])) {
  main();
}
