import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  createReloadSignal,
  hostAllowed,
  injectSdk,
  resolveStatic,
  startServer,
} from "./visual-review.mjs";

const ARTIFACT_HTML = `<!doctype html>
<html><head><title>Fixture</title></head>
<body><h1 id="headline">Hello</h1><img src="logo.svg" alt=""></body></html>
`;

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "vr-fixture-"));
  const artifactDir = join(root, "artifact");
  mkdirSync(artifactDir);
  writeFileSync(join(artifactDir, "page.html"), ARTIFACT_HTML);
  writeFileSync(join(artifactDir, "logo.svg"), "<svg xmlns=\"http://www.w3.org/2000/svg\"/>");
  writeFileSync(join(root, "outside-secret.txt"), "must never be served");
  return { root, artifactDir, artifactPath: join(artifactDir, "page.html") };
}

// fetch() refuses a hand-set Host header, so the foreign-host probe goes
// through node:http directly.
function rawGet(port, urlPath, hostHeader) {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: "127.0.0.1",
        port,
        path: urlPath,
        headers: hostHeader === undefined ? {} : { host: hostHeader },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({
          status: res.statusCode,
          body: Buffer.concat(chunks).toString("utf8"),
        }));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

describe("injectSdk", () => {
  it("injects exactly one SDK tag before the closing body tag", () => {
    const html = injectSdk("<html><body><p>x</p></body></html>");
    const matches = html.match(/__vr_sdk\.js/gu) ?? [];
    assert.equal(matches.length, 1);
    assert.ok(html.indexOf("__vr_sdk.js") < html.indexOf("</body>"));
  });

  it("targets the final closing body tag when markup embeds an earlier one", () => {
    const html = injectSdk("<body><pre>&lt;/body&gt;</pre><code></body></code></body>");
    assert.ok(html.lastIndexOf("__vr_sdk.js") > html.indexOf("</code>"));
  });

  it("is idempotent: re-injecting an already-tagged document keeps one tag", () => {
    const once = injectSdk("<html><body><p>x</p></body></html>");
    const twice = injectSdk(once);
    assert.equal(twice, once);
    assert.equal((twice.match(/__vr_sdk\.js/gu) ?? []).length, 1);
  });

  it("collapses duplicate pre-existing SDK tags to exactly one", () => {
    const tag = '<script src="/__vr_sdk.js"></script>';
    const html = injectSdk(`<body><p>x</p>${tag}${tag}</body>`);
    assert.equal((html.match(/<script[^>]*__vr_sdk\.js/gu) ?? []).length, 1);
  });

  it("still injects when the route is only mentioned in text or a comment", () => {
    const html = injectSdk("<body><!-- see /__vr_sdk.js --><p>/__vr_sdk.js</p></body>");
    assert.equal((html.match(/<script[^>]*__vr_sdk\.js/gu) ?? []).length, 1);
  });

  it("appends the tag when no closing body tag exists", () => {
    const html = injectSdk("<h1>fragment</h1>");
    assert.match(html, /<h1>fragment<\/h1>\n<script src="\/__vr_sdk\.js"><\/script>/u);
  });
});

describe("hostAllowed", () => {
  it("accepts loopback names with and without the port", () => {
    assert.equal(hostAllowed("127.0.0.1:8123", 8123), true);
    assert.equal(hostAllowed("localhost:8123", 8123), true);
    assert.equal(hostAllowed("LOCALHOST", 8123), true);
  });

  it("rejects foreign, wrong-port, and missing hosts", () => {
    assert.equal(hostAllowed("evil.example", 8123), false);
    assert.equal(hostAllowed("127.0.0.1.evil.example:8123", 8123), false);
    assert.equal(hostAllowed("127.0.0.1:9", 8123), false);
    assert.equal(hostAllowed(undefined, 8123), false);
    assert.equal(hostAllowed("", 8123), false);
  });
});

describe("resolveStatic", () => {
  const { root, artifactDir } = makeFixture();
  after(() => rmSync(root, { recursive: true, force: true }));

  it("serves a file inside the artifact directory", () => {
    assert.ok(resolveStatic(artifactDir, "/logo.svg"));
  });

  it("refuses traversal, encoded traversal, and backslash smuggling", () => {
    assert.equal(resolveStatic(artifactDir, "/../outside-secret.txt"), null);
    assert.equal(resolveStatic(artifactDir, "/%2e%2e/outside-secret.txt"), null);
    assert.equal(resolveStatic(artifactDir, "/..%5coutside-secret.txt"), null);
    assert.equal(resolveStatic(artifactDir, "/a/../../outside-secret.txt"), null);
  });

  it("refuses a symlink that leaves the artifact directory", (t) => {
    const linkPath = join(artifactDir, "escape.txt");
    try {
      symlinkSync(join(root, "outside-secret.txt"), linkPath);
    } catch {
      // Symlink creation needs privileges on some Windows setups; the
      // structural checks above still cover the non-link escapes.
      t.skip("cannot create symlinks here");
      return;
    }
    assert.equal(resolveStatic(artifactDir, "/escape.txt"), null);
  });
});

describe("visual-review server", () => {
  let fixture;
  let handle;

  before(async () => {
    fixture = makeFixture();
    handle = await startServer({ artifactPath: fixture.artifactPath });
  });

  after(async () => {
    await handle.close();
    rmSync(fixture.root, { recursive: true, force: true });
  });

  it("binds the loopback interface only", () => {
    assert.equal(handle.server.address().address, "127.0.0.1");
  });

  it("rejects a foreign Host header on every route", async () => {
    for (const urlPath of ["/", "/artifact", "/api/poll?timeout=0"]) {
      const response = await rawGet(handle.port, urlPath, "evil.example:80");
      assert.equal(response.status, 403, urlPath);
    }
  });

  it("serves the shell page with a sandboxed iframe and no allow-same-origin", async () => {
    const response = await rawGet(handle.port, "/");
    assert.equal(response.status, 200);
    assert.match(response.body, /<iframe[^>]*sandbox="allow-scripts"/u);
    assert.doesNotMatch(response.body, /allow-same-origin/u);
  });

  it("confines every served document to the review server via CSP", async () => {
    for (const urlPath of ["/", "/artifact", "/logo.svg"]) {
      const response = await fetch(`${handle.url.replace(/\/$/u, "")}${urlPath}`);
      const csp = response.headers.get("content-security-policy") ?? "";
      assert.match(csp, /default-src 'self'/u, urlPath);
      assert.match(csp, /connect-src 'self'/u, urlPath);
      assert.match(csp, /frame-src 'self'/u, urlPath);
      assert.doesNotMatch(csp, /https?:\/\//u, urlPath);
    }
  });

  it("serves the artifact with the SDK tag injected", async () => {
    const response = await rawGet(handle.port, "/artifact");
    assert.equal(response.status, 200);
    assert.match(response.body, /<h1 id="headline">Hello<\/h1>/u);
    assert.equal((response.body.match(/__vr_sdk\.js/gu) ?? []).length, 1);
    const sdk = await rawGet(handle.port, "/__vr_sdk.js");
    assert.equal(sdk.status, 200);
    assert.match(sdk.body, /postMessage/u);
  });

  it("serves sibling assets but never files outside the artifact directory", async () => {
    const asset = await rawGet(handle.port, "/logo.svg");
    assert.equal(asset.status, 200);
    for (const urlPath of [
      "/../outside-secret.txt",
      "/%2e%2e/outside-secret.txt",
      "/..%5coutside-secret.txt",
    ]) {
      const response = await rawGet(handle.port, urlPath);
      assert.equal(response.status, 404, urlPath);
      assert.doesNotMatch(response.body, /must never be served/u);
    }
  });

  it("delivers a queued annotation through the long-poll endpoint", async () => {
    const posted = await fetch(`${handle.url}api/annotations`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "element",
        selector: "#headline",
        text: "Hello",
        comment: "Make this the product name.",
      }),
    });
    assert.equal(posted.status, 201);
    const { seq } = await posted.json();
    const polled = await fetch(`${handle.url}api/poll?after=${seq - 1}&timeout=0`);
    const { events } = await polled.json();
    assert.equal(events.length, 1);
    assert.equal(events[0].seq, seq);
    assert.equal(events[0].kind, "element");
    assert.equal(events[0].selector, "#headline");
    assert.equal(events[0].comment, "Make this the product name.");
  });

  it("parks a long-poll until an annotation arrives", async () => {
    const drained = await (await fetch(`${handle.url}api/poll?after=0&timeout=0`)).json();
    const lastSeq = drained.events.at(-1)?.seq ?? 0;
    const pending = fetch(`${handle.url}api/poll?after=${lastSeq}&timeout=5000`);
    setTimeout(() => {
      fetch(`${handle.url}api/annotations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "note", comment: "late arrival" }),
      });
    }, 50);
    const { events } = await (await pending).json();
    assert.equal(events.length, 1);
    assert.equal(events[0].comment, "late arrival");
  });

  it("returns an empty batch when the long-poll times out", async () => {
    const drained = await (await fetch(`${handle.url}api/poll?after=0&timeout=0`)).json();
    const lastSeq = drained.events.at(-1)?.seq ?? 0;
    const start = Date.now();
    const { events } = await (
      await fetch(`${handle.url}api/poll?after=${lastSeq}&timeout=100`)
    ).json();
    assert.equal(events.length, 0);
    assert.ok(Date.now() - start >= 90);
  });

  it("rejects cross-site annotation posts", async () => {
    const plain = await fetch(`${handle.url}api/annotations`, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify({ kind: "note", comment: "csrf probe" }),
    });
    assert.equal(plain.status, 415);
    const foreign = await fetch(`${handle.url}api/annotations`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://evil.example",
      },
      body: JSON.stringify({ kind: "note", comment: "csrf probe" }),
    });
    assert.equal(foreign.status, 403);
    const loopback = await fetch(`${handle.url}api/annotations`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: `http://127.0.0.1:${handle.port}`,
      },
      body: JSON.stringify({ kind: "note", comment: "same-origin ok" }),
    });
    assert.equal(loopback.status, 201);
  });

  it("rejects malformed annotation payloads", async () => {
    for (const body of ["not json", JSON.stringify({ kind: "unknown", comment: "x" }), JSON.stringify({ kind: "note" })]) {
      const response = await fetch(`${handle.url}api/annotations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });
      assert.equal(response.status, 400);
    }
  });

  it("bumps the reload version when the artifact directory changes", async () => {
    const first = await (await fetch(`${handle.url}api/reload?after=0`)).json();
    const pending = fetch(`${handle.url}api/reload?after=${first.version}`);
    // fs.watch delivery can lag; keep touching the file until the poll returns.
    let done = false;
    let touch = 0;
    const nudge = setInterval(() => {
      touch += 1;
      if (!done) writeFileSync(fixture.artifactPath, `${ARTIFACT_HTML}<!-- touch ${touch} -->`);
    }, 200);
    try {
      const next = await pending.then((r) => r.json());
      done = true;
      assert.ok(next.version > first.version);
    } finally {
      clearInterval(nudge);
    }
  });

  it("reports whether the artifact directory is being watched", async () => {
    const live = await (await fetch(`${handle.url}api/reload?after=0`)).json();
    assert.equal(live.watching, true);
    const dead = createReloadSignal(join(fixture.root, "no-such-dir"));
    try {
      assert.equal(dead.watching(), false);
      assert.equal(await dead.wait(dead.current(), 50), dead.current());
    } finally {
      dead.close();
    }
  });

  it("surfaces send failures in the shell page instead of swallowing them", async () => {
    const response = await rawGet(handle.port, "/");
    assert.match(response.body, /send failed — is the review server still running\?/u);
    assert.match(response.body, /live reload unavailable — refresh manually/u);
  });

  it("refuses a primary artifact that becomes a link out of its directory", async (t) => {
    const dir = join(fixture.root, "swap");
    mkdirSync(dir);
    const page = join(dir, "page.html");
    writeFileSync(page, ARTIFACT_HTML);
    const swapped = await startServer({ artifactPath: page });
    try {
      rmSync(page);
      try {
        symlinkSync(join(fixture.root, "outside-secret.txt"), page);
      } catch {
        t.skip("cannot create symlinks here");
        return;
      }
      const escaped = await rawGet(swapped.port, "/artifact");
      assert.equal(escaped.status, 403);
      assert.doesNotMatch(escaped.body, /must never be served/u);
      assert.throws(
        () => startServer({ artifactPath: page }),
        /resolving inside its own directory/u,
      );
    } finally {
      await swapped.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("refuses to start on a missing artifact", () => {
    assert.throws(
      () => startServer({ artifactPath: join(fixture.root, "missing.html") }),
      /Artifact file not found/u,
    );
  });
});
