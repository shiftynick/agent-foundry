import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  realpathSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import path from "node:path";

export function listFiles(root) {
  const files = [];

  for (const entry of readdirSync(root, {
    withFileTypes: true,
    encoding: "utf8",
  })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    } else {
      throw new Error(`Unsupported filesystem entry: ${fullPath}`);
    }
  }

  return files.sort((left, right) => {
    if (left < right) {
      return -1;
    }
    return left > right ? 1 : 0;
  });
}

export function pathKind(filePath) {
  let stat;
  try {
    stat = lstatSync(filePath);
  } catch (error) {
    if (error && (error.code === "ENOENT" || error.code === "ENOTDIR")) {
      return "missing";
    }
    throw error;
  }

  if (stat.isFile()) {
    return "file";
  }
  if (stat.isDirectory()) {
    return "directory";
  }
  return "other";
}

export function canonicalPath(value) {
  let cursor = path.resolve(value);
  const missingSegments = [];

  while (!existsSync(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) {
      return path.resolve(value);
    }
    missingSegments.unshift(path.basename(cursor));
    cursor = parent;
  }

  return path.join(realpathSync.native(cursor), ...missingSegments);
}

export function samePath(left, right) {
  const normalize = (value) => {
    const resolved = canonicalPath(value);
    return process.platform === "win32" ? resolved.toLowerCase() : resolved;
  };
  return normalize(left) === normalize(right);
}

export function isSameOrDescendant(candidate, parent) {
  const relative = path.relative(canonicalPath(parent), canonicalPath(candidate));
  return relative === ""
    || (!relative.startsWith(`..${path.sep}`)
      && relative !== ".."
      && !path.isAbsolute(relative));
}

export function markdownFencesAreBalanced(text) {
  // This intentionally checks delimiter balance only; it is not a full
  // Markdown parser and does not interpret indentation or frontmatter.
  let openFence = null;

  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^\s*(`{3,}|~{3,})(.*)$/u);
    if (!match) {
      continue;
    }

    const marker = match[1];
    if (!openFence) {
      openFence = marker;
      continue;
    }

    if (
      marker[0] === openFence[0]
      && marker.length >= openFence.length
      && match[2].trim() === ""
    ) {
      openFence = null;
    }
  }

  return openFence === null;
}

export class CommandError extends Error {
  constructor(message, result) {
    super(message);
    this.name = "CommandError";
    this.status = result.status;
    this.signal = result.signal;
    this.stdout = result.stdout ?? "";
    this.stderr = result.stderr ?? "";
  }
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    input: options.input,
    stdio: options.stdio ?? "pipe",
    maxBuffer: options.maxBuffer ?? 16 * 1024 * 1024,
    timeout: options.timeout ?? 10 * 60 * 1000,
    killSignal: "SIGTERM",
    env: options.env,
    windowsHide: true,
  });

  if (result.error) {
    if (result.error.code === "ETIMEDOUT") {
      throw new CommandError(
        `${options.label ?? command} timed out`,
        result,
      );
    }
    throw new Error(
      `${options.label ?? command} could not start: ${result.error.message}`,
      { cause: result.error },
    );
  }
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();
    const outcome = result.signal
      ? `was terminated by signal ${result.signal}`
      : `failed with exit code ${result.status}`;
    throw new CommandError(
      `${options.label ?? command} ${outcome}`
      + (detail ? `\n${detail}` : ""),
      result,
    );
  }

  return result;
}

export function readUtf8(filePath) {
  return readFileSync(filePath, "utf8");
}
