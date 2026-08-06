#!/usr/bin/env node
// Verifies the vendored agent-headless provenance chain end to end: that the
// recorded source patches, applied in order to the recorded public base commit,
// reproduce exactly the tree of the recorded source commit.
//
// validate-foundry.mjs checks that the patch files hash to their recorded
// values and that the commit fields are 40-hex. That proves the bundle is
// internally consistent, not that the patches actually reconstruct the source
// the artifacts were built from — a patch series that no longer applies, or a
// source commit belonging to different work, passes those checks unchanged.
//
// Usage: node scripts/verify-vendor-reconstruction.mjs <path-to-upstream-clone>
//
// The upstream clone is an operator input because the Foundry deliberately does
// not vendor upstream history. Run this when re-vendoring, not on every build.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BUNDLE = path.join("starter", ".agent-foundry", "agent-headless");

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`vendor-reconstruction: FAIL — ${message}`);
  process.exit(1);
}

const upstream = process.argv[2];
if (!upstream) fail("pass the path to an upstream agent-headless clone");

const provenance = readFileSync(path.join(BUNDLE, "PROVENANCE.md"), "utf8");
const field = (label) => {
  const match = provenance.match(new RegExp("^- " + label + ": `([^`]+)`$", "mu"));
  if (!match) fail(`provenance has no ${label}`);
  return match[1];
};
const base = field("Public base commit");
const source = field("Source commit");
const patches = [...provenance.matchAll(/^ {2}- `([^`]+\.patch\.b64)`: `[0-9a-f]{64}`$/gmu)].map((m) => m[1]);
if (!patches.length) fail("provenance lists no source patches");

const work = mkdtempSync(path.join(tmpdir(), "foundry-recon-"));
try {
  const repo = path.join(work, "repo");
  const patchDir = path.join(work, "patches");
  mkdirSync(patchDir);
  execFileSync("git", ["clone", "--quiet", "--no-local", upstream, repo], { stdio: "pipe" });
  git(repo, ["checkout", "--quiet", base]);

  patches.forEach((relative, index) => {
    const decoded = Buffer.from(readFileSync(path.join(BUNDLE, ...relative.split("/")), "utf8"), "base64");
    writeFileSync(path.join(patchDir, `${String(index + 1).padStart(4, "0")}.patch`), decoded);
  });

  try {
    execFileSync("git", ["-c", "user.name=verify", "-c", "user.email=verify@local", "am", "--quiet",
      ...patches.map((_, i) => path.join(patchDir, `${String(i + 1).padStart(4, "0")}.patch`))], { cwd: repo, stdio: "pipe" });
  } catch {
    fail(`the recorded patch series does not apply cleanly to base ${base}`);
  }

  const rebuilt = git(repo, ["rev-parse", "HEAD^{tree}"]);
  const recorded = git(upstream, ["rev-parse", `${source}^{tree}`]);
  if (rebuilt !== recorded) {
    fail(`reconstructed tree ${rebuilt} does not match source commit ${source} (tree ${recorded})`);
  }
  console.log(`vendor-reconstruction: PASS (${patches.length} patches, base ${base.slice(0, 7)} -> source ${source.slice(0, 7)}, tree ${rebuilt.slice(0, 12)})`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
