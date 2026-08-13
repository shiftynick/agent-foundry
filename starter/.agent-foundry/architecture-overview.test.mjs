import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  applyRefresh,
  emptySource,
  escapeHtml,
  parsePatch,
  parseSource,
  refresh,
  renderArchitectureOverview,
  serializeSource,
  show,
  writeArchitectureOverview,
  writeSource,
} from "./architecture-overview.mjs";

const SCRIPT = fileURLToPath(new URL("./architecture-overview.mjs", import.meta.url));
const SEED = fileURLToPath(new URL("../docs/architecture/architecture.json", import.meta.url));

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function fixture(source = emptySource()) {
  const root = mkdtempSync(join(tmpdir(), "foundry-architecture-overview-"));
  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.email", "architecture@example.invalid"]);
  git(root, ["config", "user.name", "Architecture Test"]);
  git(root, ["config", "commit.gpgsign", "false"]);
  mkdirSync(join(root, "docs", "architecture"), { recursive: true });
  writeFileSync(join(root, "docs", "architecture", "architecture.json"), serializeSource(source), "utf8");
  git(root, ["add", "."]);
  git(root, ["commit", "-m", "fixture"]);
  return root;
}

function filledSource() {
  const source = emptySource();
  source.system.name = "Catalog";
  source.system.intent = { summary: "Keep the catalog trustworthy.", adrIds: ["ADR-0001"] };
  source.containers = [{
    id: "api",
    name: "API",
    kind: "app",
    talksTo: ["store"],
    entryFiles: ["src/server.js"],
    modules: [{
      id: "http",
      name: "HTTP",
      allowedDependsOn: ["domain"],
      entryFiles: ["src/http.js"],
      intent: { summary: "HTTP stays a delivery shell.", adrIds: ["ADR-0001"] },
    }, {
      id: "domain",
      name: "Domain",
      allowedDependsOn: [],
      entryFiles: ["src/domain.js"],
      intent: { summary: "Domain owns catalog rules.", adrIds: [] },
    }],
    intent: { summary: "The request process.", adrIds: [] },
  }, {
    id: "store",
    name: "Store",
    kind: "store",
    talksTo: [],
    entryFiles: [],
    modules: [],
    intent: { summary: "Durable catalog records.", adrIds: [] },
  }];
  source.flows = [{
    id: "read-item",
    name: "Read an item",
    kind: "request",
    steps: [{ from: "api", to: "store", via: "sql" }],
    intent: { summary: "Typical read.", adrIds: [] },
  }];
  return parseSource(serializeSource(source));
}

function structurePatch(overrides = {}) {
  return {
    schemaVersion: 1,
    structure: {
      system: {
        id: "this-system",
        name: "Catalog",
        actors: [],
        externals: [],
      },
      containers: [{
        id: "api",
        name: "API",
        kind: "app",
        talksTo: [],
        entryFiles: ["src/server.js"],
        modules: [{
          id: "http",
          name: "HTTP",
          allowedDependsOn: [],
          entryFiles: ["src/http.js"],
        }],
      }],
      flows: [],
      ...overrides.structure,
    },
    conflicts: overrides.conflicts ?? [],
  };
}

describe("architecture source schema", () => {
  it("accepts the installed empty seed and round-trips it", () => {
    const text = readFileSync(SEED, "utf8");
    const parsed = parseSource(text);
    assert.deepEqual(parsed, emptySource());
    assert.equal(serializeSource(parsed), text);
  });

  it("rejects a patch that includes intent", () => {
    const patch = structurePatch();
    patch.structure.system.intent = { summary: "stolen", adrIds: [] };
    assert.throws(
      () => parsePatch(JSON.stringify(patch)),
      /must not include intent/u,
    );
  });
});

describe("refresh merge", () => {
  it("preserves intent, empties new ids, and conflicts omitted intent-bearing nodes", () => {
    const source = filledSource();
    const patch = parsePatch(JSON.stringify({
      schemaVersion: 1,
      structure: {
        system: {
          id: "this-system",
          name: "Catalog",
          actors: [{ id: "operator", name: "Operator", relationship: "uses" }],
          externals: [],
        },
        containers: [{
          id: "api",
          name: "API process",
          kind: "app",
          talksTo: ["worker"],
          entryFiles: ["src/server.js"],
          modules: [{
            id: "http",
            name: "HTTP",
            allowedDependsOn: ["new-mod"],
            entryFiles: ["src/http.js"],
          }, {
            id: "new-mod",
            name: "New module",
            allowedDependsOn: [],
            entryFiles: ["src/new.js"],
          }],
        }, {
          id: "worker",
          name: "Worker",
          kind: "worker",
          talksTo: [],
          entryFiles: ["src/worker.js"],
          modules: [],
        }],
        flows: [{
          id: "read-item",
          name: "Read an item",
          kind: "request",
          steps: [{ from: "api", to: "worker", via: "queue" }],
        }],
      },
      conflicts: [{
        codeEvidence: "docs/adr/0001.md still says the store is required.",
        sourceClaim: "Runtime pieces no longer include store.",
        proposedPatch: "Restore store or supersede ADR-0001.",
        adrIds: ["ADR-0001"],
      }],
    }));
    const next = applyRefresh(source, patch, "2026-08-13T12:00:00.000Z");
    assert.equal(next.system.intent.summary, "Keep the catalog trustworthy.");
    assert.equal(next.containers[0].intent.summary, "The request process.");
    assert.equal(next.containers[0].modules[0].intent.summary, "HTTP stays a delivery shell.");
    assert.equal(next.containers[0].modules[1].intent.summary, "");
    assert.equal(next.containers[1].intent.summary, "");
    assert.equal(next.flows[0].intent.summary, "Typical read.");
    const omitted = next.conflicts.filter((conflict) => conflict.codeEvidence.includes("omitted"));
    assert.equal(omitted.length, 2);
    assert.ok(omitted.some((conflict) => conflict.preservedIntent.summary === "Domain owns catalog rules."));
    assert.ok(omitted.some((conflict) => conflict.codeEvidence.includes("'store'")));
    assert.ok(next.conflicts.some((conflict) => conflict.proposedPatch.includes("supersede ADR-0001")));
    assert.equal(next.updatedAt, "2026-08-13T12:00:00.000Z");
    const again = applyRefresh(next, patch, "2026-08-13T12:01:00.000Z");
    assert.equal(again.conflicts.length, next.conflicts.length);
    const withAdr = structuredClone(patch);
    withAdr.conflicts = [{
      ...patch.conflicts[0],
      adrIds: ["ADR-0002"],
    }];
    const distinguished = applyRefresh(next, withAdr, "2026-08-13T12:02:00.000Z");
    assert.equal(distinguished.conflicts.length, next.conflicts.length + 1);
  });

  it("rejects dangling structure references", () => {
    const patch = structurePatch();
    patch.structure.containers[0].talksTo = ["missing-store"];
    assert.throws(
      () => parsePatch(JSON.stringify(patch)),
      /talksTo unknown id: missing-store/u,
    );
  });
});

describe("architecture HTML", () => {
  it("renders the three layers, main flows, entry files, and no file graph", () => {
    const html = renderArchitectureOverview(filledSource(), "2026-08-13T12:00:00.000Z");
    assert.match(html, /<h2>System in its world<\/h2>/u);
    assert.match(html, /<h2>Runtime pieces<\/h2>/u);
    assert.match(html, /<h2>Modules<\/h2>/u);
    assert.match(html, /<h2>Main flows<\/h2>/u);
    assert.match(html, /<a href="\.\.\/src\/server\.js"><code>src\/server\.js<\/code><\/a>/u);
    assert.match(html, /not a class or file graph/u);
    assert.doesNotMatch(html, /Class diagram|File graph/u);
  });

  it("shows a conflict banner and escapes untrusted text", () => {
    const source = emptySource();
    source.system.name = `Useful <script>alert("x")</script>`;
    source.conflicts = [{
      id: "c-001",
      openedAt: "2026-08-13T12:00:00.000Z",
      status: "open",
      codeEvidence: "saw <img>",
      sourceClaim: "source & claim",
      proposedPatch: "do 'nothing'",
      preservedIntent: { summary: "", adrIds: [] },
      adrIds: [],
    }];
    const html = renderArchitectureOverview(source, "2026-08-13T12:00:00.000Z");
    assert.match(html, /Open conflicts:/u);
    assert.match(html, /Useful &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/u);
    assert.match(html, /saw &lt;img&gt;/u);
    assert.doesNotMatch(html, /<script>alert/u);
  });
});

describe("show and refresh writers", () => {
  it("show writes HTML and leaves the source bytes unchanged", () => {
    const root = fixture();
    try {
      const before = readFileSync(join(root, "docs", "architecture", "architecture.json"));
      const result = show(root, { nowIso: "2026-08-13T12:00:00.000Z" });
      assert.equal(result.output, join(root, ".agent-foundry", "architecture-overview.html"));
      assert.deepEqual(
        readFileSync(join(root, "docs", "architecture", "architecture.json")),
        before,
      );
      const html = readFileSync(result.output, "utf8");
      assert.match(html, /<h2>System in its world<\/h2>/u);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refresh writes structure, preserves intent, and does not apply intent from a patch", () => {
    const root = fixture(filledSource());
    try {
      const patchPath = join(root, "patch.json");
      writeFileSync(patchPath, JSON.stringify(structurePatch()), "utf8");
      const result = refresh(root, readFileSync(patchPath, "utf8"), {
        nowIso: "2026-08-13T12:00:00.000Z",
      });
      assert.equal(result.document.containers[0].intent.summary, "The request process.");
      assert.equal(result.document.containers[0].name, "API");
      assert.equal(result.document.containers.length, 1);
      assert.ok(result.document.conflicts.some((conflict) => conflict.preservedIntent.summary === "Domain owns catalog rules."));
      const saved = parseSource(readFileSync(join(root, "docs", "architecture", "architecture.json"), "utf8"));
      assert.equal(saved.containers[0].intent.summary, "The request process.");
      assert.match(readFileSync(result.output, "utf8"), /Open conflicts:/u);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reports that the source was updated if the HTML write fails", () => {
    const root = fixture(filledSource());
    try {
      writeFileSync(join(root, ".agent-foundry"), "not a directory\n");
      const patch = JSON.stringify(structurePatch());
      assert.throws(
        () => refresh(root, patch, { nowIso: "2026-08-13T12:00:00.000Z" }),
        /architecture source refreshed but overview HTML write failed/u,
      );
      const saved = parseSource(readFileSync(join(root, "docs", "architecture", "architecture.json"), "utf8"));
      assert.equal(saved.updatedAt, "2026-08-13T12:00:00.000Z");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses to write HTML through a symlinked output directory", (context) => {
    const root = mkdtempSync(join(tmpdir(), "foundry-architecture-html-root-"));
    const outside = mkdtempSync(join(tmpdir(), "foundry-architecture-html-target-"));
    try {
      try {
        symlinkSync(outside, join(root, ".agent-foundry"), process.platform === "win32" ? "junction" : "dir");
      } catch (error) {
        if (["EPERM", "EACCES", "ENOTSUP"].includes(error.code)) {
          context.skip(`symlinks unavailable: ${error.code}`);
          return;
        }
        throw error;
      }
      assert.throws(
        () => writeArchitectureOverview(root, emptySource(), "2026-08-13T12:00:00.000Z"),
        /refusing to write through a symlinked/u,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it("refuses to write the source through a symlinked docs ancestor", (context) => {
    const root = mkdtempSync(join(tmpdir(), "foundry-architecture-docs-root-"));
    const outside = mkdtempSync(join(tmpdir(), "foundry-architecture-docs-target-"));
    try {
      try {
        symlinkSync(outside, join(root, "docs"), process.platform === "win32" ? "junction" : "dir");
      } catch (error) {
        if (["EPERM", "EACCES", "ENOTSUP"].includes(error.code)) {
          context.skip(`symlinks unavailable: ${error.code}`);
          return;
        }
        throw error;
      }
      assert.throws(
        () => writeSource(root, emptySource()),
        /refusing to write through a symlinked/u,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

describe("architecture-overview CLI", () => {
  it("documents commands, rejects bad args, and keeps show from taking a patch", () => {
    assert.equal(escapeHtml(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
    const help = spawnSync(process.execPath, [SCRIPT, "--help"], { encoding: "utf8" });
    assert.match(help.stdout, /show \[--stdout\]/u);
    assert.match(help.stdout, /refresh --patch/u);
    assert.equal(spawnSync(process.execPath, [SCRIPT, "--bad"]).status, 2);
    assert.equal(spawnSync(process.execPath, [SCRIPT, "show", "--patch", "x.json"]).status, 2);
    const dangling = fixture();
    try {
      const patchPath = join(dangling, "dangling.json");
      const patch = structurePatch();
      patch.structure.containers[0].talksTo = ["missing-store"];
      writeFileSync(patchPath, JSON.stringify(patch), "utf8");
      assert.equal(
        spawnSync(process.execPath, [SCRIPT, "refresh", "--patch", patchPath], { cwd: dangling }).status,
        2,
      );
    } finally {
      rmSync(dangling, { recursive: true, force: true });
    }
    const outside = mkdtempSync(join(tmpdir(), "foundry-architecture-outside-"));
    try {
      assert.equal(spawnSync(process.execPath, [SCRIPT, "show"], { cwd: outside }).status, 1);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it("show --stdout does not write the HTML file", () => {
    const root = fixture();
    try {
      const result = spawnSync(process.execPath, [SCRIPT, "show", "--stdout"], {
        cwd: root,
        encoding: "utf8",
      });
      assert.equal(result.status, 0);
      assert.match(result.stdout, /<h2>System in its world<\/h2>/u);
      assert.equal(existsSync(join(root, ".agent-foundry", "architecture-overview.html")), false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refresh --patch rejects intent and leaves the source unchanged", () => {
    const root = fixture(filledSource());
    try {
      const before = readFileSync(join(root, "docs", "architecture", "architecture.json"));
      const patchPath = join(root, "bad-patch.json");
      const patch = structurePatch();
      patch.structure.containers[0].intent = { summary: "nope", adrIds: [] };
      writeFileSync(patchPath, JSON.stringify(patch), "utf8");
      const result = spawnSync(
        process.execPath,
        [SCRIPT, "refresh", "--patch", patchPath],
        { cwd: root, encoding: "utf8" },
      );
      assert.equal(result.status, 2);
      assert.match(result.stderr, /must not include intent/u);
      assert.deepEqual(
        readFileSync(join(root, "docs", "architecture", "architecture.json")),
        before,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
