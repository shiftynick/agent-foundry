import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runChecksMentionsSuite } from "./foundry-lib.mjs";

describe("runChecksMentionsSuite", () => {
  it("accepts a TAP Subtest banner", () => {
    const stdout = [
      "=== installed tests (18 suites) ===",
      "# Subtest: project overview",
      "ok 1 - renders the status contract",
      "",
    ].join("\n");
    assert.equal(runChecksMentionsSuite(stdout, "project overview"), true);
  });

  it("accepts a spec-reporter suite banner", () => {
    const stdout = [
      "=== installed tests (18 suites) ===",
      "▶ project overview",
      "  ✔ renders the status contract",
      "✔ project overview (1077.1484ms)",
      "",
    ].join("\n");
    assert.equal(runChecksMentionsSuite(stdout, "project overview"), true);
  });

  it("rejects a TAP-only matcher fixture that has only the spec banner", () => {
    const specOnly = "▶ project overview\n✔ project overview (1ms)\n";
    assert.equal(/Subtest: project overview/u.test(specOnly), false);
    assert.equal(runChecksMentionsSuite(specOnly, "project overview"), true);
  });

  it("does not treat a different suite as a hit", () => {
    const stdout = "▶ review-packet\n✔ review-packet (1ms)\n";
    assert.equal(runChecksMentionsSuite(stdout, "project overview"), false);
  });
});
