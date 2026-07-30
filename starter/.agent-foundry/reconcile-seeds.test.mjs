import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { restorableSeedPaths, restoreSeedsFromHead } from "./reconcile-seeds.mjs";
import { hashManagedFile } from "./check-foundry-drift.mjs";

test("derives every non-preserved seed from the manifest", () => {
  const manifest = {
    files: {
      "CLAUDE.md": { tier: "seed" },
      "future/NEW-SEED.md": { tier: "seed" },
      "PLANNING-JOURNAL.md": { tier: "seed", preserveIfExists: true },
      "docs/SDLC.md": { tier: "mold" },
    },
  };
  assert.deepEqual(
    restorableSeedPaths(manifest),
    ["CLAUDE.md", "future/NEW-SEED.md"],
  );
});

test("rejects unsafe manifest paths", () => {
  assert.throws(
    () => restorableSeedPaths({ files: { "../outside.md": { tier: "seed" } } }),
    /unsafe managed path/u,
  );
});

test("restores tracked ASCII and non-ASCII seeds while keeping new seeds", () => {
  const root = mkdtempSync(join(tmpdir(), "reconcile-seeds-"));
  const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" });
  try {
    git(["init", "-b", "integration"]);
    git(["config", "user.email", "seed-test@example.invalid"]);
    git(["config", "user.name", "Seed Test"]);
    git(["config", "commit.gpgsign", "false"]);
    git(["config", "core.autocrlf", "false"]);
    git(["config", "core.hooksPath", ".no-hooks"]);
    writeFileSync(join(root, "CLAUDE.md"), "project Claude\n");
    writeFileSync(join(root, "guidé.md"), "project unicode\n");
    git(["add", "CLAUDE.md", "guidé.md"]);
    git(["commit", "-m", "project seeds"]);

    writeFileSync(join(root, "CLAUDE.md"), "reset template\n");
    writeFileSync(join(root, "guidé.md"), "reset unicode template\n");
    writeFileSync(join(root, "NEW-SEED.md"), "new stock seed\n");
    const records = Object.fromEntries(
      ["CLAUDE.md", "NEW-SEED.md", "guidé.md"].map((path) => [
        path,
        { sha256: hashManagedFile(readFileSync(join(root, path), "utf8")) },
      ]),
    );

    const result = restoreSeedsFromHead(
      root,
      ["CLAUDE.md", "NEW-SEED.md", "guidé.md"],
      records,
    );
    assert.deepEqual(result.restored, ["CLAUDE.md", "guidé.md"]);
    assert.deepEqual(result.newSeeds, ["NEW-SEED.md"]);
    assert.equal(readFileSync(join(root, "CLAUDE.md"), "utf8"), "project Claude\n");
    assert.equal(readFileSync(join(root, "guidé.md"), "utf8"), "project unicode\n");
    assert.equal(readFileSync(join(root, "NEW-SEED.md"), "utf8"), "new stock seed\n");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("refuses to overwrite a seed changed after installation", () => {
  const root = mkdtempSync(join(tmpdir(), "reconcile-seeds-dirty-"));
  const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" });
  try {
    git(["init", "-b", "integration"]);
    git(["config", "user.email", "seed-test@example.invalid"]);
    git(["config", "user.name", "Seed Test"]);
    git(["config", "commit.gpgsign", "false"]);
    git(["config", "core.autocrlf", "false"]);
    git(["config", "core.hooksPath", ".no-hooks"]);
    writeFileSync(join(root, "CLAUDE.md"), "project\n");
    git(["add", "CLAUDE.md"]);
    git(["commit", "-m", "project seed"]);
    writeFileSync(join(root, "CLAUDE.md"), "fresh template\n");
    const records = {
      "CLAUDE.md": { sha256: hashManagedFile("fresh template\n") },
    };
    writeFileSync(join(root, "CLAUDE.md"), "edited after install\n");
    assert.throws(
      () => restoreSeedsFromHead(root, ["CLAUDE.md"], records),
      /refusing to overwrite/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
