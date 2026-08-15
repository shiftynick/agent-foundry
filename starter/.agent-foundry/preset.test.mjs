import assert from "node:assert/strict";
import test from "node:test";
import { buildRunnerArgs, validateColdReviewOptions } from "./cold-review.mjs";
import { buildDelegateArgs, runDelegate } from "./delegate-work.mjs";

const runner = "runner.js";

test("Antigravity cold reviews require an exact model and use a persistent plan session", () => {
  assert.deepEqual(validateColdReviewOptions({ provider: "antigravity" }), [
    "antigravity cold review requires an explicit --model (operator-chosen)",
  ]);
  const args = buildRunnerArgs({
    runner,
    provider: "antigravity",
    model: "gemini-3.7-flash-high",
    cwd: ".",
    promptFile: "review.md",
    timeoutMs: 1_000,
  });
  assert.equal(args.includes("ephemeral"), false);
  assert.deepEqual(args.slice(-2), ["--model", "gemini-3.7-flash-high"]);
  assert.equal(args[args.indexOf("--access") + 1], "answer-only");
});

test("Antigravity delegation is inspect-only until workspace access is explicit", () => {
  const defaults = buildDelegateArgs({
    runner,
    provider: "antigravity",
    cwd: ".",
    promptFile: "task.md",
    timeoutMs: 1_000,
  });
  assert.equal(defaults.access, "inspect");
  assert.equal(defaults.args.includes("ephemeral"), false);
  assert.equal(defaults.args[defaults.args.indexOf("--access") + 1], "inspect");

  const writes = buildDelegateArgs({
    runner,
    provider: "antigravity",
    access: "edit-workspace",
    cwd: ".",
    promptFile: "task.md",
    timeoutMs: 1_000,
  });
  assert.equal(writes.access, "edit-workspace");
});

test("non-Cursor presets reject trust-workspace before reading prompt input", async () => {
  assert.deepEqual(validateColdReviewOptions({ provider: "antigravity", model: "x", trustWorkspace: true }), [
    "--trust-workspace is supported only for Cursor",
  ]);
  const result = await runDelegate({ provider: "antigravity", trustWorkspace: true, promptFile: "missing.md" });
  assert.equal(result.ok, false);
  assert.deepEqual(result.problems, ["--trust-workspace is supported only for Cursor"]);
});
