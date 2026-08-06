// Shared record adapter for session-audit tooling.
//
// This is operator-side tooling, not installed payload. It reads Claude Code
// JSONL transcripts strictly read-only and strictly streaming: a transcript is
// never loaded into memory as a whole, and every helper here works on one
// record at a time.
//
// The adapter is deliberately version-tolerant. Claude Code has changed record
// shapes across harness versions, so unknown record types are skipped rather
// than treated as errors, and every accessor tolerates a missing field.

import { closeSync, createReadStream, openSync, readSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

export const PROVIDER_CLAUDE = "claude";

// Tools whose input names a single file the agent read.
const READ_TOOLS = new Set(["Read", "NotebookRead"]);
// Tools whose input names a single file the agent modified.
const WRITE_TOOLS = new Set(["Edit", "Write", "NotebookEdit", "MultiEdit"]);
// Tools that spawn a delegated session; their wall clock is delegation wait,
// not local tool execution, and must not be double counted against subagents.
const DELEGATION_TOOLS = new Set(["Agent", "Task"]);
// Tools that block on the human. Their elapsed time is operator wait wearing a
// tool call's clothing; counting it as tool execution would answer the "where
// does the time go" question wrongly.
const OPERATOR_BLOCKING_TOOLS = new Set(["AskUserQuestion", "ExitPlanMode"]);

export function isReadTool(name) {
  return READ_TOOLS.has(name);
}

export function isWriteTool(name) {
  return WRITE_TOOLS.has(name);
}

export function isDelegationTool(name) {
  return DELEGATION_TOOLS.has(name);
}

export function isOperatorBlockingTool(name) {
  return OPERATOR_BLOCKING_TOOLS.has(name);
}

export class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = "UsageError";
  }
}

// Minimal `--flag value` parser in the style of the other maintained scripts:
// explicit definitions, no positional arguments, no abbreviations.
export function parseOptions(argv, definitions) {
  const values = new Map();
  for (const [name, definition] of definitions) {
    if (definition.default !== undefined) {
      values.set(name, definition.default);
    }
  }

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new UsageError(`Unexpected argument: ${token}`);
    }
    const [flag, inlineValue] = splitFlag(token.slice(2));
    const definition = definitions.get(flag);
    if (!definition) {
      throw new UsageError(`Unknown option: --${flag}`);
    }
    if (definition.boolean) {
      values.set(flag, inlineValue === undefined ? true : inlineValue !== "false");
      continue;
    }
    const value = inlineValue === undefined ? argv[index + 1] : inlineValue;
    if (value === undefined || value.startsWith("--")) {
      throw new UsageError(`Option --${flag} requires a value.`);
    }
    if (inlineValue === undefined) {
      index += 1;
    }
    values.set(flag, value);
  }

  for (const [name, definition] of definitions) {
    if (definition.required && values.get(name) === undefined) {
      throw new UsageError(`Option --${name} is required.`);
    }
  }

  return values;
}

function splitFlag(token) {
  const equals = token.indexOf("=");
  if (equals === -1) {
    return [token, undefined];
  }
  return [token.slice(0, equals), token.slice(equals + 1)];
}

// Streams a file as lines while tracking exact byte offsets, which evidence
// packets need in order to be re-verified against the original transcript.
// Only one line is materialized at a time.
export async function* streamLines(filePath) {
  const stream = createReadStream(filePath);
  let pending = Buffer.alloc(0);
  let consumed = 0;
  let lineNumber = 0;

  for await (const chunk of stream) {
    pending = pending.length === 0 ? chunk : Buffer.concat([pending, chunk]);
    let start = 0;
    let newline = pending.indexOf(0x0a, start);
    while (newline !== -1) {
      const slice = pending.subarray(start, newline);
      lineNumber += 1;
      yield {
        lineNumber,
        byteOffset: consumed + start,
        byteLength: slice.length,
        text: decodeLine(slice),
      };
      start = newline + 1;
      newline = pending.indexOf(0x0a, start);
    }
    consumed += start;
    pending = Buffer.from(pending.subarray(start));
  }

  if (pending.length > 0) {
    lineNumber += 1;
    yield {
      lineNumber,
      byteOffset: consumed,
      byteLength: pending.length,
      text: decodeLine(pending),
    };
  }
}

function decodeLine(buffer) {
  const end = buffer.length > 0 && buffer[buffer.length - 1] === 0x0d
    ? buffer.length - 1
    : buffer.length;
  return buffer.toString("utf8", 0, end);
}

// Streams parsed records. Malformed lines are reported, never thrown: a single
// truncated write at the tail of a live transcript must not fail an audit.
export async function* streamRecords(filePath) {
  for await (const line of streamLines(filePath)) {
    if (line.text.trim() === "") {
      continue;
    }
    let record = null;
    try {
      record = JSON.parse(line.text);
    } catch {
      yield { ...line, record: null, malformed: true };
      continue;
    }
    if (record === null || typeof record !== "object" || Array.isArray(record)) {
      yield { ...line, record: null, malformed: true };
      continue;
    }
    yield { ...line, record, malformed: false };
  }
}

// Re-reads one recorded line by byte offset so an evidence packet can quote the
// original transcript without a second full pass.
export function readLineAt(filePath, byteOffset, byteLength) {
  const handle = openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(byteLength);
    let read = 0;
    while (read < byteLength) {
      const chunk = readSync(handle, buffer, read, byteLength - read, byteOffset + read);
      if (chunk === 0) {
        break;
      }
      read += chunk;
    }
    return decodeLine(buffer.subarray(0, read));
  } finally {
    closeSync(handle);
  }
}

// Claude Code encodes a project root into a directory name by replacing every
// character outside [A-Za-z0-9] with "-": "X:\\example-repo" becomes
// "X--example-repo".
export function encodeProjectDirName(repoPath) {
  const resolved = path.resolve(repoPath);
  const trimmed = resolved.length > 1 && /[\\/]$/u.test(resolved)
    ? resolved.slice(0, -1)
    : resolved;
  return trimmed.replaceAll(/[^A-Za-z0-9]/gu, "-");
}

// A caller may pass either a repository path or an already-encoded project
// directory name; anything without a separator or drive colon is taken as the
// latter.
export function projectDirNameFor(repoArgument) {
  if (/[\\/:]/u.test(repoArgument)) {
    return encodeProjectDirName(repoArgument);
  }
  return repoArgument;
}

export function timestampMs(record) {
  const raw = record?.timestamp;
  if (typeof raw !== "string") {
    return null;
  }
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

// Operator-local calendar day. The audit window is expressed in the operator's
// timezone, not UTC, because "sessions I ran on the 5th" is a local-day claim.
export function localDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function assertDateKey(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new UsageError(`${label} must be a YYYY-MM-DD date; found: ${value}`);
  }
  return value;
}

export function contentBlocks(record) {
  const content = record?.message?.content;
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }
  if (Array.isArray(content)) {
    return content.filter((block) => block && typeof block === "object");
  }
  return [];
}

export function toolUsesOf(record) {
  if (record?.type !== "assistant") {
    return [];
  }
  return contentBlocks(record)
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      id: typeof block.id === "string" ? block.id : null,
      name: typeof block.name === "string" ? block.name : "(unknown)",
      input: block.input && typeof block.input === "object" ? block.input : {},
    }));
}

export function toolResultsOf(record) {
  if (record?.type !== "user") {
    return [];
  }
  const blocks = contentBlocks(record).filter((block) => block.type === "tool_result");
  // `toolUseResult` is a per-record sidecar, so it is only safely attributable
  // when the record carries exactly one result block.
  const sidecar = blocks.length === 1 ? record.toolUseResult : undefined;
  return blocks.map((block) => {
    const text = toolResultText(block);
    const declaredBytes = typeof sidecar?.persistedOutputSize === "number"
      ? sidecar.persistedOutputSize
      : null;
    const fileContent = typeof sidecar?.file?.content === "string"
      ? sidecar.file.content
      : null;
    return {
      toolUseId: typeof block.tool_use_id === "string" ? block.tool_use_id : null,
      isError: block.is_error === true || sidecar?.isError === true,
      text,
      // Persisted (spilled) outputs report their real size; the inline payload
      // is only a preview, so the declared size is the honest number.
      approxBytes: declaredBytes ?? Buffer.byteLength(text, "utf8"),
      fileBytes: fileContent === null ? null : Buffer.byteLength(fileContent, "utf8"),
      persisted: declaredBytes !== null,
    };
  });
}

function toolResultText(block) {
  const content = block?.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((entry) => (typeof entry?.text === "string" ? entry.text : ""))
      .join("\n");
  }
  return "";
}

export function assistantText(record) {
  if (record?.type !== "assistant") {
    return "";
  }
  return contentBlocks(record)
    .filter((block) => block.type === "text")
    .map((block) => (typeof block.text === "string" ? block.text : ""))
    .join("\n");
}

export function assistantThinkingText(record) {
  if (record?.type !== "assistant") {
    return "";
  }
  return contentBlocks(record)
    .filter((block) => block.type === "thinking")
    .map((block) => (typeof block.thinking === "string" ? block.thinking : ""))
    .join("\n");
}

export function userText(record) {
  if (record?.type !== "user") {
    return "";
  }
  return contentBlocks(record)
    .filter((block) => block.type === "text")
    .map((block) => (typeof block.text === "string" ? block.text : ""))
    .join("\n");
}

export function usageOf(record) {
  const usage = record?.message?.usage;
  if (!usage || typeof usage !== "object") {
    return null;
  }
  const number = (value) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
  return {
    inputTokens: number(usage.input_tokens),
    cacheCreationTokens: number(usage.cache_creation_input_tokens),
    cacheReadTokens: number(usage.cache_read_input_tokens),
    outputTokens: number(usage.output_tokens),
  };
}

export function modelOf(record) {
  const model = record?.message?.model;
  return typeof model === "string" ? model : null;
}

// The harness writes a placeholder assistant record (model "<synthetic>", zero
// usage) when a session is resumed or a turn is abandoned. It is bookkeeping,
// not a model response: counting it would charge an overnight idle stretch to
// model latency and inject a zero-context turn into the usage series.
export function isSyntheticAssistant(record) {
  return record?.type === "assistant" && record?.message?.model === "<synthetic>";
}

export function isSidechainRecord(record) {
  return record?.isSidechain === true;
}

export function isCompactSummary(record) {
  return record?.isCompactSummary === true;
}

// A user record the harness wrote rather than the human:
//
//   <local-command-stdout>...</local-command-stdout>
//     the harness echoing a local command's output back into the conversation.
//
// Counting one as an operator turn inflates the turn count and, worse, books
// the gap that preceded it to operator wait -- so an idle stretch ending in a
// harness echo gets charged to the human twice.
//
// A slash-command envelope is deliberately NOT in this set:
//
//   <command-message>foo is running…</command-message>
//   <command-name>/foo</command-name><command-args>use the 718 branch</command-args>
//
// The harness formats that envelope, but the human typed the command and wrote
// the arguments, and the preceding gap really is time the session spent waiting
// on them. Treating it as harness output undercounts operator turns and moves
// genuine operator wait into background wait, which corrupts every per-turn
// rate. It is flagged instead, via `isSlashCommandPrompt`.
const HARNESS_ECHO_MARKERS = [
  "<local-command-stdout>",
  "<local-command-stderr>",
];

const SLASH_COMMAND_MARKERS = ["<command-name>", "<command-message>", "<command-args>"];

export function isHarnessEcho(record) {
  if (record?.type !== "user") {
    return false;
  }
  const text = userText(record);
  if (text === "") {
    return false;
  }
  return HARNESS_ECHO_MARKERS.some((marker) => text.includes(marker));
}

// A human turn entered as a slash command. Still an operator turn; the flag
// exists so a reader can tell a typed prompt from an invoked command.
export function isSlashCommandPrompt(record) {
  if (record?.type !== "user" || isHarnessEcho(record)) {
    return false;
  }
  const text = userText(record);
  return text !== "" && SLASH_COMMAND_MARKERS.some((marker) => text.includes(marker));
}

// A real operator prompt, as opposed to a tool result, a system-injected
// notification, a harness echo, or a compaction summary replayed as a user
// turn. Newer harness versions label the source explicitly; older ones do not,
// so the fallback is structural.
export function isOperatorPrompt(record) {
  if (record?.type !== "user" || isSidechainRecord(record)) {
    return false;
  }
  if (record.isMeta === true || isCompactSummary(record)) {
    return false;
  }
  if (contentBlocks(record).some((block) => block.type === "tool_result")) {
    return false;
  }
  // Checked before the explicit label as well: a harness echo is not a human
  // turn even when the harness stamps it `origin.kind === "human"`, which some
  // versions do because the record is replayed on the user side.
  if (isHarnessEcho(record)) {
    return false;
  }
  const kind = record.origin?.kind;
  if (typeof kind === "string") {
    return kind === "human";
  }
  return true;
}

export function approxTokens(charCount) {
  // Documented crudeness: a chars/4 heuristic, not a tokenizer. It is used only
  // for relative comparisons inside one session.
  return Math.ceil(charCount / 4);
}

// Values that cannot be a credential however secret-ish the name reads: flags,
// and the short numbers that settings like `TOKEN_TTL=3600` carry.
//
// The numeric allowance is capped at six digits deliberately. An unbounded
// `\d+` here is a hole, not a nicety: `DB_PASSWORD=98765432` is a password and
// would sail straight through. Six digits is too short to be worth protecting
// and long enough for the timeouts, sizes and ports that caused the
// over-redaction in the first place.
const NON_SECRET_ENV_VALUE = /^(?:true|false|null|none|nil|yes|no|on|off|enabled|disabled|\d{1,6}(?:\.\d+)?)$/iu;
// Names that describe where a secret lives rather than being one.
//
// `url`/`uri`/`name` are deliberately NOT here. A webhook URL
// (`SECRET_URL=https://hooks.slack.com/services/...`) IS the credential -- the
// path is the secret -- so excusing those names re-opens the hole this guard
// exists to close. Over-redacting an innocent `AUTH_URL` is the cheaper error.
const LOCATION_ENV_NAME = /[_-](?:path|file|dir|directory|location|enabled|disabled|required|type|algo|algorithm|length|size|count|ttl|timeout)$/iu;

const REDACTIONS = [
  [/\bsk-[A-Za-z0-9_-]{16,}/gu, "[REDACTED:api-key]"],
  [/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/gu, "[REDACTED:token]"],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}/gu, "[REDACTED:token]"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/gu, "[REDACTED:token]"],
  [/\bxapp-[A-Za-z0-9-]{10,}/gu, "[REDACTED:token]"],
  [/\bAKIA[0-9A-Z]{16}\b/gu, "[REDACTED:aws-key-id]"],
  [/\bAIza[0-9A-Za-z_-]{30,}/gu, "[REDACTED:api-key]"],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/gu, "[REDACTED:jwt]"],
  // No \b anchor: "-" is a non-word character, so \b would only match when the
  // header follows a word character, which never happens in a real key.
  // The optional " BLOCK" suffix and the digits in the label class are what
  // make PGP ("-----BEGIN PGP PRIVATE KEY BLOCK-----") match: its header does
  // not end in "PRIVATE KEY-----".
  [
    /-----BEGIN [A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----/gu,
    "[REDACTED:private-key]",
  ],
  // Credentials embedded in a connection URL (postgres://user:pass@host).
  [/\b([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s:@/]+):[^\s@/]+@/gu, "$1:[REDACTED:url-password]@"],
  // `Authorization: Bearer <token>` and friends, where the value follows a
  // space rather than a separator.
  [/\bBearer\s+[A-Za-z0-9_\-.~+/]{16,}={0,2}/giu, "Bearer [REDACTED]"],
  // Longer minimum for these two: "Basic authentication" and "Token 1234 rows"
  // are ordinary prose that a 12-character floor would mangle.
  [/\b(Basic|Token)\s+[A-Za-z0-9_\-.~+/]{24,}={0,2}/gu, "$1 [REDACTED]"],
  // key=value / "key": "value" style secrets. The name is matched with its
  // surrounding word characters so `aws_secret_access_key` and `db-password`
  // are caught, not only the bare word.
  [
    /([A-Za-z0-9_.-]{0,48}(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token|refresh[_-]?token|secret|password|passwd|pwd|token|credential)[A-Za-z0-9_.-]{0,48})(\s*[:=]\s*|"\s*:\s*")["']?([^\s"',;}]{6,})/giu,
    // Same guard as the env rules below: a secret-ish name whose value is a
    // flag, a number, or a filesystem location is a setting, not a credential,
    // and redacting it destroys evidence for nothing.
    (match, name, separator, value) => (
      NON_SECRET_ENV_VALUE.test(value) || LOCATION_ENV_NAME.test(name)
        ? match
        : `${name}=[REDACTED]`
    ),
  ],
  // Shell/env assignments of screaming-snake names. Deliberately NOT a blanket
  // `NAME=value` rule: that fired on ordinary SQL and prose ("WHERE
  // ORDER_ID=12345678", "SET BATCH_SIZE=10000000") and destroyed evidence. Two
  // narrower rules replace it.
  //
  // (a) The name itself is secret-ish -- but the value still has to be capable
  // of being a secret. `OAUTH_ENABLED=true`, `IS_PRIVATE=false` and
  // `PUBLIC_KEY_PATH=/etc/ssl/pub.pem` all contain a secret-ish word and none
  // of them is a secret, so flags, numbers and location-naming suffixes are
  // excluded.
  [
    /\b([A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|PWD|CREDENTIALS?|APIKEY|AUTH|SALT|PASSPHRASE|PRIVATE|SIGNATURE|DSN)[A-Z0-9_]*)=(?!\s)([^\s"';]{4,})/gu,
    (match, name, value) => (
      NON_SECRET_ENV_VALUE.test(value) || LOCATION_ENV_NAME.test(name)
        ? match
        : `${name}=[REDACTED:env]`
    ),
  ],
  // (b) The name is neutral but the value has key shape: long, and mixing
  // lowercase with digits. An all-digit id or an all-caps enum is left alone.
  [
    /\b([A-Z][A-Z0-9_]{3,})=(?!\s)([A-Za-z0-9_+/-]{16,})/gu,
    (match, name, value) => (
      /[a-z]/u.test(value) && /[0-9]/u.test(value)
        ? `${name}=[REDACTED:env]`
        : match
    ),
  ],
  // Long opaque blobs: base64-looking runs, and hex long enough that it is far
  // more likely to be a key than a digest. 40-character hex is deliberately
  // left alone: those are Git SHA-1s, and the correlation stage and the
  // verification gate both need them intact.
  [/[A-Za-z0-9+/]{200,}={0,2}/gu, "[REDACTED:blob]"],
  [/\b[0-9a-fA-F]{64,}\b/gu, "[REDACTED:hex]"],
];

export function redact(text) {
  if (typeof text !== "string" || text === "") {
    return "";
  }
  let output = text;
  for (const [pattern, replacement] of REDACTIONS) {
    output = output.replaceAll(pattern, replacement);
  }
  return output;
}

// The cap is in bytes, because the packet size budget is a disk budget and one
// character of CJK or emoji costs three or four bytes.
export function clip(text, limitBytes) {
  if (typeof text !== "string") {
    return "";
  }
  if (Buffer.byteLength(text, "utf8") <= limitBytes) {
    return text;
  }
  const suffix = (dropped) => `…[truncated ${dropped} chars]`;
  // Reserve room for the marker, then shrink until the whole string fits.
  let keep = Math.min(text.length, limitBytes);
  while (keep > 0
    && Buffer.byteLength(text.slice(0, keep) + suffix(text.length - keep), "utf8") > limitBytes) {
    keep -= Math.max(1, Math.ceil(keep / 16));
  }
  keep = Math.max(0, keep);
  const output = text.slice(0, keep) + suffix(text.length - keep);
  if (Buffer.byteLength(output, "utf8") <= limitBytes) {
    return output;
  }
  // Degenerate budget: even the truncation marker does not fit. Emit only the
  // prefix the budget allows rather than silently overrunning it.
  return Buffer.from(output, "utf8")
    .subarray(0, Math.max(0, limitBytes))
    .toString("utf8");
}

// Redact first, then clip, so a secret can never survive by being split across
// the truncation boundary. Every caller that assembles an excerpt from parts
// must redact each part on its own for the same reason.
export function redactedExcerpt(text, limitBytes) {
  return clip(redact(text), limitBytes);
}

export function normalizePath(value) {
  if (typeof value !== "string" || value === "") {
    return null;
  }
  const resolved = path.resolve(value);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

// The single file a tool call names, when it names one.
export function toolTargetPath(name, input) {
  if (!input || typeof input !== "object") {
    return null;
  }
  const candidate = input.file_path ?? input.path ?? input.notebook_path;
  if (typeof candidate !== "string") {
    return null;
  }
  if (isReadTool(name) || isWriteTool(name)) {
    return candidate;
  }
  return null;
}

// The line range a read tool asked for, as a half-open [start, end) interval of
// 1-based line numbers. A read with neither `offset` nor `limit` is the whole
// file, which is represented as [1, Infinity).
export function readRangeOf(name, input) {
  if (!isReadTool(name) || !input || typeof input !== "object") {
    return null;
  }
  const number = (value) => (
    typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null
  );
  const offset = number(input.offset);
  const limit = number(input.limit);
  if (offset === null && limit === null) {
    return { start: 1, end: Infinity, whole: true };
  }
  const start = offset === null ? 1 : Math.max(1, offset);
  const end = limit === null ? Infinity : start + limit;
  return { start, end, whole: end === Infinity && start === 1 };
}

// Two reads of the same file are only "the same read again" when the line
// ranges they asked for actually intersect. Paging through a large file in
// disjoint windows is deliberate work, not waste, and counting it as a repeated
// read is the single most common way a re-reading metric lies.
//
// Adjoining pages routinely share a line or two, because an agent asks for the
// next chunk starting slightly before the last one ended. A two-line intersection
// between two eighty-line windows is that, not a re-read, so bounded ranges must
// overlap by more than a token amount before they count.
const MIN_OVERLAP_LINES = 5;

export function readRangesOverlap(left, right) {
  // An unknown range (a tool whose input the adapter could not read) is treated
  // as the whole file: the conservative reading is that it might overlap.
  const a = left ?? { start: 1, end: Infinity };
  const b = right ?? { start: 1, end: Infinity };
  const overlap = Math.min(a.end, b.end) - Math.max(a.start, b.start);
  if (overlap <= 0) {
    return false;
  }
  // An unbounded read (whole file, or "from line N to the end") pulls in
  // everything the other read did, however small the nominal intersection.
  if (a.end === Infinity || b.end === Infinity) {
    return true;
  }
  // The tolerance is capped by the shorter range, so identical or nested reads
  // always count however short they are. A flat `overlap >= 5` would have
  // called two identical three-line reads "disjoint" and filed them as paging.
  const shortest = Math.min(a.end - a.start, b.end - b.start);
  return overlap >= Math.min(MIN_OVERLAP_LINES, shortest);
}

// A stable identity for "the same call again", used for repeated-command and
// retry detection. Ordered JSON keeps key order from mattering.
export function toolCallSignature(name, input) {
  // Digested rather than kept verbatim: a Write tool's input is an entire file,
  // and the reducer retains one signature per tool call for a whole session.
  return createHash("sha256")
    .update(name)
    .update(" ")
    .update(stableStringify(input))
    .digest("hex")
    .slice(0, 32);
}

export function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

export function toolInputPreview(name, input, limit = 80) {
  if (!input || typeof input !== "object") {
    return "";
  }
  const preferred = input.command
    ?? input.file_path
    ?? input.pattern
    ?? input.path
    ?? input.description
    ?? input.prompt;
  const source = typeof preferred === "string" ? preferred : stableStringify(input);
  return redactedExcerpt(source.replaceAll(/\s+/gu, " ").trim(), limit);
}

// Crude reference proxy: pull identifier-ish tokens (file names, dotted paths,
// CamelCase symbols) out of a payload so a later turn mentioning one can be
// treated as evidence the payload was used. This is a string-overlap heuristic
// with known false positives and false negatives; see the reduce.mjs notes.
export function extractIdentifiers(text, limit = 40) {
  const found = new Set();
  const pattern = /[A-Za-z0-9_.-]{6,}/gu;
  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    if (!/[A-Za-z]/u.test(token)) {
      continue;
    }
    if (!/[._-]/u.test(token) && !/[a-z][A-Z]/u.test(token)) {
      continue;
    }
    found.add(token);
    if (found.size >= limit) {
      break;
    }
  }
  return [...found];
}

export function ensureProvider(provider) {
  if (provider !== PROVIDER_CLAUDE) {
    throw new UsageError(
      `Only --provider ${PROVIDER_CLAUDE} is implemented; found: ${provider}`,
    );
  }
  return provider;
}

export function defaultProjectsRoot() {
  const home = process.env.CLAUDE_CONFIG_DIR
    ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? ".", ".claude");
  return path.join(home, "projects");
}

// Both downstream stages consume the discovery inventory, and both must reject
// a hand-edited or older-format file with a message rather than a TypeError.
export function readDiscovery(discoveryPath, readFileSyncImpl) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSyncImpl(discoveryPath, "utf8"));
  } catch (error) {
    throw new UsageError(
      `Discovery inventory is not readable JSON (${discoveryPath}): `
      + `${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new UsageError(`Discovery inventory is not an object: ${discoveryPath}`);
  }
  if (!Array.isArray(parsed.sessions)) {
    throw new UsageError(`Discovery inventory has no "sessions" array: ${discoveryPath}`);
  }
  if (parsed.window === null || typeof parsed.window !== "object") {
    throw new UsageError(`Discovery inventory has no "window" object: ${discoveryPath}`);
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// Run-directory safety
// ---------------------------------------------------------------------------

// `.gitignore` guards two conventional names, but `--out` takes an arbitrary
// path and an operator who points it at a working directory inside the
// repository would commit transcript-derived content. The ignore rules cannot
// be relied on for a name nobody anticipated, so the refusal is at runtime.
const IGNORED_RUN_DIR_PATTERNS = [
  /^session-audit-out$/u,
  /\.session-audit-run$/u,
];

export function repoRootFor(startDir, existsSyncImpl) {
  let current = path.resolve(startDir);
  for (;;) {
    if (existsSyncImpl(path.join(current, ".git"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

export function assertRunDirOutsideRepo(outDir, repoRoot) {
  if (!repoRoot) {
    return path.resolve(outDir);
  }
  const resolved = path.resolve(outDir);
  const root = path.resolve(repoRoot);
  const relative = path.relative(root, resolved);
  const inside = relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
  if (!inside) {
    return resolved;
  }
  const segments = relative.split(/[\\/]/u).filter(Boolean);
  if (segments.some((segment) => (
    IGNORED_RUN_DIR_PATTERNS.some((pattern) => pattern.test(segment))
  ))) {
    return resolved;
  }
  throw new UsageError(
    `--out resolves inside the repository (${resolved}) and does not match a `
    + "gitignored run-directory name. Derived audit output must never enter Git: "
    + "write it outside the repository, or name a directory matching "
    + "`session-audit-out/` or `*.session-audit-run/`.",
  );
}

// ---------------------------------------------------------------------------
// `--help`
// ---------------------------------------------------------------------------

export function wantsHelp(argv) {
  return argv.some((token) => token === "--help" || token === "-h" || token === "-?");
}

// ---------------------------------------------------------------------------
// Interval math, used for the concurrency caveats: the eight sessions of a run
// overlap, so summing their spans and their operator wait double counts real
// calendar time. Both the sum and the union are reported.
// ---------------------------------------------------------------------------

export function unionIntervals(intervals) {
  const sorted = intervals
    .filter((interval) => (
      Number.isFinite(interval?.startMs)
      && Number.isFinite(interval?.endMs)
      && interval.endMs > interval.startMs
    ))
    .map((interval) => ({ startMs: interval.startMs, endMs: interval.endMs }))
    .sort((left, right) => left.startMs - right.startMs || left.endMs - right.endMs);
  const merged = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (last && interval.startMs <= last.endMs) {
      last.endMs = Math.max(last.endMs, interval.endMs);
    } else {
      merged.push({ ...interval });
    }
  }
  return merged;
}

export function unionDurationMs(intervals) {
  return unionIntervals(intervals).reduce(
    (total, interval) => total + (interval.endMs - interval.startMs),
    0,
  );
}

export const GAP_HISTOGRAM_BUCKETS = [
  { label: "<1m", maxMs: 60000 },
  { label: "1-5m", maxMs: 300000 },
  { label: "5-15m", maxMs: 900000 },
  { label: "15-60m", maxMs: 3600000 },
  { label: "1-4h", maxMs: 14400000 },
  { label: ">4h", maxMs: Infinity },
];

export function gapHistogram(durationsMs) {
  const buckets = GAP_HISTOGRAM_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: 0,
    totalMs: 0,
  }));
  for (const duration of durationsMs) {
    if (!Number.isFinite(duration) || duration < 0) continue;
    const index = GAP_HISTOGRAM_BUCKETS.findIndex((bucket) => duration < bucket.maxMs);
    const target = buckets[index === -1 ? buckets.length - 1 : index];
    target.count += 1;
    target.totalMs += duration;
  }
  return buckets;
}

export function median(values) {
  const sorted = [...values].filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return null;
  }
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function sum(values) {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total;
}

export function round(value, digits = 2) {
  if (!Number.isFinite(value)) {
    return null;
  }
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
