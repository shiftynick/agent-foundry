#!/usr/bin/env node
// Maintained architecture source plus a generated HTML reading surface.
// see ADR-0005

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  copyFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { cwd, stderr, stdout } from "node:process";
import { fileURLToPath } from "node:url";

export const SCHEMA_VERSION = 1;
export const SOURCE_RELATIVE = "docs/architecture/architecture.json";
export const OUTPUT_RELATIVE = ".agent-foundry/architecture-overview.html";

const ID_PATTERN = /^[a-z][a-z0-9-]{0,63}$/u;
const INTENT_KEYS = ["summary", "adrIds"];
const SYSTEM_KEYS = ["id", "name", "actors", "externals", "intent"];
const ACTOR_KEYS = ["id", "name", "relationship"];
const EXTERNAL_KEYS = ["id", "name", "kind", "relationship"];
const CONTAINER_KEYS = ["id", "name", "kind", "talksTo", "entryFiles", "modules", "intent"];
const MODULE_KEYS = ["id", "name", "allowedDependsOn", "entryFiles", "intent"];
const FLOW_KEYS = ["id", "name", "kind", "steps", "intent"];
const STEP_KEYS = ["from", "to", "via"];
const CONFLICT_KEYS = [
  "id",
  "openedAt",
  "status",
  "codeEvidence",
  "sourceClaim",
  "proposedPatch",
  "preservedIntent",
  "adrIds",
];
const DOCUMENT_KEYS = [
  "schemaVersion",
  "updatedAt",
  "system",
  "containers",
  "flows",
  "conflicts",
];
const PATCH_KEYS = ["schemaVersion", "structure", "conflicts"];
const STRUCTURE_KEYS = ["system", "containers", "flows"];
const STRUCTURE_SYSTEM_KEYS = ["id", "name", "actors", "externals"];
const STRUCTURE_CONTAINER_KEYS = ["id", "name", "kind", "talksTo", "entryFiles", "modules"];
const STRUCTURE_MODULE_KEYS = ["id", "name", "allowedDependsOn", "entryFiles"];
const STRUCTURE_FLOW_KEYS = ["id", "name", "kind", "steps"];
const PATCH_CONFLICT_KEYS = ["codeEvidence", "sourceClaim", "proposedPatch", "adrIds"];

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function emptyIntent() {
  return { summary: "", adrIds: [] };
}

export function emptySource() {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: null,
    system: {
      id: "this-system",
      name: "",
      actors: [],
      externals: [],
      intent: emptyIntent(),
    },
    containers: [],
    flows: [],
    conflicts: [],
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function keysOf(value) {
  return Object.keys(value);
}

function rejectUnknownKeys(value, allowed, label) {
  const extra = keysOf(value).filter((key) => !allowed.includes(key));
  if (extra.length > 0) {
    throw new Error(`${label} has unknown key: ${extra[0]}`);
  }
}

function requireObject(value, label) {
  if (!isPlainObject(value)) throw new Error(`${label} must be an object`);
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string") throw new Error(`${label} must be a string`);
  return value;
}

function optionalString(value, label) {
  if (value == null) return "";
  return requireString(value, label);
}

function requireId(value, label) {
  const id = requireString(value, label);
  if (!ID_PATTERN.test(id)) {
    throw new Error(`${label} must be a lowercase kebab id`);
  }
  return id;
}

function requireStringList(value, label) {
  return requireArray(value, label).map((item, index) => requireString(item, `${label}[${index}]`));
}

function parseEntryFile(value, label) {
  const file = requireString(value, label);
  const parts = file.split("/");
  if (
    file === ""
    || isAbsolute(file)
    || file.includes("\\")
    || parts.includes("..")
    || parts.includes("")
    || /:\/\//u.test(file)
  ) {
    throw new Error(`${label} must be a repository-relative file path`);
  }
  return file;
}

function parseEntryFiles(value, label) {
  return requireArray(value, label).map((item, index) => parseEntryFile(item, `${label}[${index}]`));
}

function requireIdList(value, label) {
  return requireArray(value, label).map((item, index) => requireId(item, `${label}[${index}]`));
}

function parseIntent(value, label) {
  const intent = requireObject(value, label);
  rejectUnknownKeys(intent, INTENT_KEYS, label);
  return {
    summary: requireString(intent.summary, `${label}.summary`),
    adrIds: requireStringList(intent.adrIds, `${label}.adrIds`),
  };
}

function intentIsEmpty(intent) {
  return !intent.summary.trim() && intent.adrIds.length === 0;
}

function parseActor(value, label) {
  const actor = requireObject(value, label);
  rejectUnknownKeys(actor, ACTOR_KEYS, label);
  return {
    id: requireId(actor.id, `${label}.id`),
    name: requireString(actor.name, `${label}.name`),
    relationship: requireString(actor.relationship, `${label}.relationship`),
  };
}

function parseExternal(value, label) {
  const external = requireObject(value, label);
  rejectUnknownKeys(external, EXTERNAL_KEYS, label);
  return {
    id: requireId(external.id, `${label}.id`),
    name: requireString(external.name, `${label}.name`),
    kind: requireString(external.kind, `${label}.kind`),
    relationship: requireString(external.relationship, `${label}.relationship`),
  };
}

function parseModule(value, label) {
  const module = requireObject(value, label);
  rejectUnknownKeys(module, MODULE_KEYS, label);
  return {
    id: requireId(module.id, `${label}.id`),
    name: requireString(module.name, `${label}.name`),
    allowedDependsOn: requireIdList(module.allowedDependsOn, `${label}.allowedDependsOn`),
    entryFiles: parseEntryFiles(module.entryFiles, `${label}.entryFiles`),
    intent: parseIntent(module.intent, `${label}.intent`),
  };
}

function parseContainer(value, label) {
  const container = requireObject(value, label);
  rejectUnknownKeys(container, CONTAINER_KEYS, label);
  return {
    id: requireId(container.id, `${label}.id`),
    name: requireString(container.name, `${label}.name`),
    kind: requireString(container.kind, `${label}.kind`),
    talksTo: requireIdList(container.talksTo, `${label}.talksTo`),
    entryFiles: parseEntryFiles(container.entryFiles, `${label}.entryFiles`),
    modules: requireArray(container.modules, `${label}.modules`).map((item, index) => (
      parseModule(item, `${label}.modules[${index}]`)
    )),
    intent: parseIntent(container.intent, `${label}.intent`),
  };
}

function parseStep(value, label) {
  const step = requireObject(value, label);
  rejectUnknownKeys(step, STEP_KEYS, label);
  return {
    from: requireId(step.from, `${label}.from`),
    to: requireId(step.to, `${label}.to`),
    via: optionalString(step.via, `${label}.via`),
  };
}

function parseFlow(value, label) {
  const flow = requireObject(value, label);
  rejectUnknownKeys(flow, FLOW_KEYS, label);
  return {
    id: requireId(flow.id, `${label}.id`),
    name: requireString(flow.name, `${label}.name`),
    kind: requireString(flow.kind, `${label}.kind`),
    steps: requireArray(flow.steps, `${label}.steps`).map((item, index) => (
      parseStep(item, `${label}.steps[${index}]`)
    )),
    intent: parseIntent(flow.intent, `${label}.intent`),
  };
}

function parseConflict(value, label) {
  const conflict = requireObject(value, label);
  rejectUnknownKeys(conflict, CONFLICT_KEYS, label);
  const status = requireString(conflict.status, `${label}.status`);
  if (status !== "open" && status !== "resolved") {
    throw new Error(`${label}.status must be open or resolved`);
  }
  return {
    id: requireId(conflict.id, `${label}.id`),
    openedAt: requireString(conflict.openedAt, `${label}.openedAt`),
    status,
    codeEvidence: requireString(conflict.codeEvidence, `${label}.codeEvidence`),
    sourceClaim: requireString(conflict.sourceClaim, `${label}.sourceClaim`),
    proposedPatch: requireString(conflict.proposedPatch, `${label}.proposedPatch`),
    preservedIntent: parseIntent(conflict.preservedIntent, `${label}.preservedIntent`),
    adrIds: requireStringList(conflict.adrIds, `${label}.adrIds`),
  };
}

function parseSystem(value, label) {
  const system = requireObject(value, label);
  rejectUnknownKeys(system, SYSTEM_KEYS, label);
  return {
    id: requireId(system.id, `${label}.id`),
    name: requireString(system.name, `${label}.name`),
    actors: requireArray(system.actors, `${label}.actors`).map((item, index) => (
      parseActor(item, `${label}.actors[${index}]`)
    )),
    externals: requireArray(system.externals, `${label}.externals`).map((item, index) => (
      parseExternal(item, `${label}.externals[${index}]`)
    )),
    intent: parseIntent(system.intent, `${label}.intent`),
  };
}

function uniqueIds(ids, label) {
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`${label} repeats id: ${id}`);
    seen.add(id);
  }
}

function collectDocumentIds(document) {
  const ids = [document.system.id];
  for (const actor of document.system.actors) ids.push(actor.id);
  for (const external of document.system.externals) ids.push(external.id);
  for (const container of document.containers) {
    ids.push(container.id);
    for (const module of container.modules) ids.push(module.id);
  }
  for (const flow of document.flows) ids.push(flow.id);
  for (const conflict of document.conflicts) ids.push(conflict.id);
  return ids;
}

function validateReferences(document, label) {
  const containers = new Set(document.containers.map((container) => container.id));
  const externals = new Set(document.system.externals.map((external) => external.id));
  const modules = new Set(
    document.containers.flatMap((container) => container.modules.map((module) => module.id)),
  );
  const flowNodes = new Set([
    document.system.id,
    ...document.system.actors.map((actor) => actor.id),
    ...externals,
    ...containers,
    ...modules,
  ]);
  for (const container of document.containers) {
    for (const id of container.talksTo) {
      if (!containers.has(id) && !externals.has(id)) {
        throw new Error(`${label} container '${container.id}' talksTo unknown id: ${id}`);
      }
    }
    for (const module of container.modules) {
      for (const id of module.allowedDependsOn) {
        if (!modules.has(id)) {
          throw new Error(`${label} module '${module.id}' allowedDependsOn unknown id: ${id}`);
        }
      }
    }
  }
  for (const flow of document.flows) {
    for (const [index, step] of flow.steps.entries()) {
      if (!flowNodes.has(step.from)) {
        throw new Error(`${label} flow '${flow.id}' steps[${index}].from unknown id: ${step.from}`);
      }
      if (!flowNodes.has(step.to)) {
        throw new Error(`${label} flow '${flow.id}' steps[${index}].to unknown id: ${step.to}`);
      }
    }
  }
}

function parseDocument(value, label = "architecture") {
  const document = requireObject(value, label);
  rejectUnknownKeys(document, DOCUMENT_KEYS, label);
  if (document.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`${label} has unsupported schemaVersion`);
  }
  const parsed = {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: document.updatedAt === null
      ? null
      : requireString(document.updatedAt, `${label}.updatedAt`),
    system: parseSystem(document.system, `${label}.system`),
    containers: requireArray(document.containers, `${label}.containers`).map((item, index) => (
      parseContainer(item, `${label}.containers[${index}]`)
    )),
    flows: requireArray(document.flows, `${label}.flows`).map((item, index) => (
      parseFlow(item, `${label}.flows[${index}]`)
    )),
    conflicts: requireArray(document.conflicts, `${label}.conflicts`).map((item, index) => (
      parseConflict(item, `${label}.conflicts[${index}]`)
    )),
  };
  uniqueIds(collectDocumentIds(parsed), label);
  validateReferences(parsed, label);
  return parsed;
}

export function parseSource(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("architecture source is not valid JSON");
  }
  return parseDocument(value);
}

function rejectIntentKey(value, label) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectIntentKey(item, `${label}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) return;
  if (Object.hasOwn(value, "intent")) {
    throw new Error(`${label} must not include intent`);
  }
  for (const [key, child] of Object.entries(value)) {
    rejectIntentKey(child, `${label}.${key}`);
  }
}

function parseStructureSystem(value, label) {
  const system = requireObject(value, label);
  rejectUnknownKeys(system, STRUCTURE_SYSTEM_KEYS, label);
  return {
    id: requireId(system.id, `${label}.id`),
    name: requireString(system.name, `${label}.name`),
    actors: requireArray(system.actors, `${label}.actors`).map((item, index) => (
      parseActor(item, `${label}.actors[${index}]`)
    )),
    externals: requireArray(system.externals, `${label}.externals`).map((item, index) => (
      parseExternal(item, `${label}.externals[${index}]`)
    )),
  };
}

function parseStructureModule(value, label) {
  const module = requireObject(value, label);
  rejectUnknownKeys(module, STRUCTURE_MODULE_KEYS, label);
  return {
    id: requireId(module.id, `${label}.id`),
    name: requireString(module.name, `${label}.name`),
    allowedDependsOn: requireIdList(module.allowedDependsOn, `${label}.allowedDependsOn`),
    entryFiles: parseEntryFiles(module.entryFiles, `${label}.entryFiles`),
  };
}

function parseStructureContainer(value, label) {
  const container = requireObject(value, label);
  rejectUnknownKeys(container, STRUCTURE_CONTAINER_KEYS, label);
  return {
    id: requireId(container.id, `${label}.id`),
    name: requireString(container.name, `${label}.name`),
    kind: requireString(container.kind, `${label}.kind`),
    talksTo: requireIdList(container.talksTo, `${label}.talksTo`),
    entryFiles: parseEntryFiles(container.entryFiles, `${label}.entryFiles`),
    modules: requireArray(container.modules, `${label}.modules`).map((item, index) => (
      parseStructureModule(item, `${label}.modules[${index}]`)
    )),
  };
}

function parseStructureFlow(value, label) {
  const flow = requireObject(value, label);
  rejectUnknownKeys(flow, STRUCTURE_FLOW_KEYS, label);
  return {
    id: requireId(flow.id, `${label}.id`),
    name: requireString(flow.name, `${label}.name`),
    kind: requireString(flow.kind, `${label}.kind`),
    steps: requireArray(flow.steps, `${label}.steps`).map((item, index) => (
      parseStep(item, `${label}.steps[${index}]`)
    )),
  };
}

function parsePatchConflict(value, label) {
  const conflict = requireObject(value, label);
  rejectUnknownKeys(conflict, PATCH_CONFLICT_KEYS, label);
  return {
    codeEvidence: requireString(conflict.codeEvidence, `${label}.codeEvidence`),
    sourceClaim: requireString(conflict.sourceClaim, `${label}.sourceClaim`),
    proposedPatch: requireString(conflict.proposedPatch, `${label}.proposedPatch`),
    adrIds: requireStringList(conflict.adrIds, `${label}.adrIds`),
  };
}

export function parsePatch(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("architecture patch is not valid JSON");
  }
  const patch = requireObject(value, "patch");
  rejectUnknownKeys(patch, PATCH_KEYS, "patch");
  rejectIntentKey(patch, "patch");
  if (patch.schemaVersion !== SCHEMA_VERSION) {
    throw new Error("patch has unsupported schemaVersion");
  }
  const structure = requireObject(patch.structure, "patch.structure");
  rejectUnknownKeys(structure, STRUCTURE_KEYS, "patch.structure");
  const parsed = {
    schemaVersion: SCHEMA_VERSION,
    structure: {
      system: parseStructureSystem(structure.system, "patch.structure.system"),
      containers: requireArray(structure.containers, "patch.structure.containers").map((item, index) => (
        parseStructureContainer(item, `patch.structure.containers[${index}]`)
      )),
      flows: requireArray(structure.flows, "patch.structure.flows").map((item, index) => (
        parseStructureFlow(item, `patch.structure.flows[${index}]`)
      )),
    },
    conflicts: requireArray(patch.conflicts ?? [], "patch.conflicts").map((item, index) => (
      parsePatchConflict(item, `patch.conflicts[${index}]`)
    )),
  };
  const structureDocument = {
    system: { ...parsed.structure.system, intent: emptyIntent() },
    containers: parsed.structure.containers.map((container) => ({
      ...container,
      modules: container.modules.map((module) => ({ ...module, intent: emptyIntent() })),
      intent: emptyIntent(),
    })),
    flows: parsed.structure.flows.map((flow) => ({ ...flow, intent: emptyIntent() })),
    conflicts: [],
  };
  uniqueIds(collectDocumentIds(structureDocument), "patch.structure");
  validateReferences(structureDocument, "patch.structure");
  return parsed;
}

function indexIntent(document) {
  const byId = new Map();
  const remember = (id, intent, kind, name) => {
    byId.set(id, { intent, kind, name });
  };
  remember(document.system.id, document.system.intent, "system", document.system.name);
  for (const container of document.containers) {
    remember(container.id, container.intent, "container", container.name);
    for (const module of container.modules) {
      remember(module.id, module.intent, "module", module.name);
    }
  }
  for (const flow of document.flows) {
    remember(flow.id, flow.intent, "flow", flow.name);
  }
  return byId;
}

function attachIntent(id, previous) {
  return previous.get(id)?.intent ?? emptyIntent();
}

function allocateConflictId(used) {
  let n = 1;
  while (used.has(`c-${String(n).padStart(3, "0")}`)) n += 1;
  const id = `c-${String(n).padStart(3, "0")}`;
  used.add(id);
  return id;
}

function conflictFingerprint(conflict) {
  return [
    conflict.codeEvidence,
    conflict.sourceClaim,
    conflict.proposedPatch,
    [...(conflict.adrIds ?? [])].sort().join(","),
  ].join("\n");
}

function pushUniqueConflict(conflicts, usedIds, incoming) {
  const fingerprint = conflictFingerprint(incoming);
  const duplicate = conflicts.some((conflict) => (
    conflict.status === "open" && conflictFingerprint(conflict) === fingerprint
  ));
  if (duplicate) return;
  conflicts.push({
    ...incoming,
    id: allocateConflictId(usedIds),
  });
}

export function applyRefresh(source, patch, nowIso) {
  const previous = indexIntent(source);
  const nextIds = new Set(collectDocumentIds({
    system: { ...patch.structure.system, intent: emptyIntent() },
    containers: patch.structure.containers.map((container) => ({
      ...container,
      modules: container.modules.map((module) => ({ ...module, intent: emptyIntent() })),
      intent: emptyIntent(),
    })),
    flows: patch.structure.flows.map((flow) => ({ ...flow, intent: emptyIntent() })),
    conflicts: [],
  }));

  const conflicts = source.conflicts.map((conflict) => ({ ...conflict }));
  const usedIds = new Set([...nextIds, ...conflicts.map((conflict) => conflict.id)]);
  for (const [id, record] of previous) {
    if (nextIds.has(id) || intentIsEmpty(record.intent)) continue;
    pushUniqueConflict(conflicts, usedIds, {
      openedAt: nowIso,
      status: "open",
      codeEvidence: `Refresh omitted ${record.kind} '${id}'.`,
      sourceClaim: `${record.kind} '${record.name || id}' was in the architecture source.`,
      proposedPatch: "Restore the node in a later patch, or resolve this conflict after confirming the removal.",
      preservedIntent: record.intent,
      adrIds: [...record.intent.adrIds],
    });
  }
  for (const incoming of patch.conflicts) {
    pushUniqueConflict(conflicts, usedIds, {
      openedAt: nowIso,
      status: "open",
      codeEvidence: incoming.codeEvidence,
      sourceClaim: incoming.sourceClaim,
      proposedPatch: incoming.proposedPatch,
      preservedIntent: emptyIntent(),
      adrIds: incoming.adrIds,
    });
  }

  return parseDocument({
    schemaVersion: SCHEMA_VERSION,
    updatedAt: nowIso,
    system: {
      ...patch.structure.system,
      intent: attachIntent(patch.structure.system.id, previous),
    },
    containers: patch.structure.containers.map((container) => ({
      ...container,
      modules: container.modules.map((module) => ({
        ...module,
        intent: attachIntent(module.id, previous),
      })),
      intent: attachIntent(container.id, previous),
    })),
    flows: patch.structure.flows.map((flow) => ({
      ...flow,
      intent: attachIntent(flow.id, previous),
    })),
    conflicts,
  });
}

function present(value, fallback = "Not described yet") {
  const text = String(value ?? "").replace(/\s+/gu, " ").trim();
  return text || fallback;
}

function listOrEmpty(items, renderItem, emptyText) {
  if (!items.length) return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  return items.map(renderItem).join("");
}

function intentBlock(intent) {
  const summary = intent.summary.trim();
  const adrs = intent.adrIds.filter((id) => id.trim());
  if (!summary && adrs.length === 0) {
    return '<p class="empty">No intent recorded. Point at an ADR when the why is known.</p>';
  }
  const adrHtml = adrs.length
    ? `<p class="adrs">ADRs: ${adrs.map((id) => `<code>${escapeHtml(id)}</code>`).join(" ")}</p>`
    : "";
  return `${summary ? `<p>${escapeHtml(summary)}</p>` : ""}${adrHtml}`;
}

function fileHref(file) {
  return `../${file.split("/").map((part) => encodeURIComponent(part)).join("/")}`;
}

function fileList(files) {
  if (!files.length) return '<p class="empty">No entry files recorded.</p>';
  return `<ul class="files">${files.map((file) => `<li><a href="${escapeHtml(fileHref(file))}"><code>${escapeHtml(file)}</code></a></li>`).join("")}</ul>`;
}

function chipList(ids, label) {
  if (!ids.length) return `<span class="muted">${escapeHtml(label)}</span>`;
  return ids.map((id) => `<span class="chip">${escapeHtml(id)}</span>`).join("");
}

export function renderArchitectureOverview(document, generatedAt) {
  const parsed = parseDocument(document);
  const openConflicts = parsed.conflicts.filter((conflict) => conflict.status === "open");
  const systemName = present(parsed.system.name, "Unnamed system");
  const modules = parsed.containers.flatMap((container) => (
    container.modules.map((module) => ({ container, module }))
  ));

  const actorCards = listOrEmpty(
    parsed.system.actors,
    (actor) => `<article class="card"><span class="eyebrow">${escapeHtml(actor.relationship)}</span><strong>${escapeHtml(present(actor.name, actor.id))}</strong><code>${escapeHtml(actor.id)}</code></article>`,
    "No actors recorded.",
  );
  const externalCards = listOrEmpty(
    parsed.system.externals,
    (external) => `<article class="card"><span class="eyebrow">${escapeHtml(external.kind)}</span><strong>${escapeHtml(present(external.name, external.id))}</strong><p>${escapeHtml(external.relationship)}</p><code>${escapeHtml(external.id)}</code></article>`,
    "No external systems recorded.",
  );
  const containerCards = listOrEmpty(
    parsed.containers,
    (container) => `<article class="card">
      <span class="eyebrow">${escapeHtml(container.kind)}</span>
      <strong>${escapeHtml(present(container.name, container.id))}</strong>
      <code>${escapeHtml(container.id)}</code>
      <p class="chips">Talks to ${chipList(container.talksTo, "nobody yet")}</p>
      ${fileList(container.entryFiles)}
      ${intentBlock(container.intent)}
    </article>`,
    "No runtime pieces recorded.",
  );
  const moduleSections = parsed.containers.length === 0
    ? '<p class="empty">Modules appear after runtime pieces are recorded.</p>'
    : parsed.containers.map((container) => `<article class="card wide">
        <span class="eyebrow">Inside ${escapeHtml(present(container.name, container.id))}</span>
        ${container.modules.length === 0 ? '<p class="empty">No modules recorded in this piece.</p>' : container.modules.map((module) => `<section class="module">
          <h3>${escapeHtml(present(module.name, module.id))}</h3>
          <code>${escapeHtml(module.id)}</code>
          <p class="chips">May depend on ${chipList(module.allowedDependsOn, "no other module")}</p>
          ${fileList(module.entryFiles)}
          ${intentBlock(module.intent)}
        </section>`).join("")}
      </article>`).join("");
  const flowCards = listOrEmpty(
    parsed.flows,
    (flow) => `<article class="card wide">
      <span class="eyebrow">${escapeHtml(flow.kind)}</span>
      <strong>${escapeHtml(present(flow.name, flow.id))}</strong>
      ${flow.steps.length === 0 ? '<p class="empty">No steps recorded.</p>' : `<ol class="steps">${flow.steps.map((step) => `<li><code>${escapeHtml(step.from)}</code> → <code>${escapeHtml(step.to)}</code>${step.via ? ` via ${escapeHtml(step.via)}` : ""}</li>`).join("")}</ol>`}
      ${intentBlock(flow.intent)}
    </article>`,
    "No main flows recorded.",
  );
  const conflictBanner = openConflicts.length === 0
    ? ""
    : `<div class="warning-banner"><strong>Open conflicts:</strong> ${escapeHtml(String(openConflicts.length))} structure or ADR mismatch${openConflicts.length === 1 ? "" : "es"} need a decision.</div>`;
  const conflictList = openConflicts.length === 0
    ? ""
    : `<section id="conflicts" class="panel">
        <div class="section-head"><h2>Open conflicts</h2><span>Proposed patches, not applied edits</span></div>
        ${openConflicts.map((conflict) => `<article class="card wide">
          <code>${escapeHtml(conflict.id)}</code>
          <p><strong>Code:</strong> ${escapeHtml(conflict.codeEvidence)}</p>
          <p><strong>Source:</strong> ${escapeHtml(conflict.sourceClaim)}</p>
          <p><strong>Proposed patch:</strong> ${escapeHtml(conflict.proposedPatch)}</p>
          ${intentBlock(conflict.preservedIntent)}
        </article>`).join("")}
      </section>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(systemName)} architecture</title>
  <style>
    :root { --bg:#f4f7f7; --panel:#fff; --ink:#163034; --muted:#5b7478; --line:#d5e1e3; --accent:#0f6f78; --warn:#8a3b12; --warn-bg:#fff3ea; }
    * { box-sizing:border-box; } body { margin:0; font:15px/1.45 "Segoe UI",sans-serif; color:var(--ink); background:var(--bg); }
    .shell { width:min(100% - 32px, 1100px); margin:0 auto; padding:18px 0 40px; }
    nav { position:sticky; top:0; z-index:2; background:var(--bg); padding:10px 0; display:flex; gap:12px; flex-wrap:wrap; border-bottom:1px solid var(--line); }
    nav a { color:var(--accent); text-decoration:none; font-size:13px; }
    .panel { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:18px 20px; margin:16px 0; }
    .section-head { display:flex; justify-content:space-between; gap:12px; align-items:baseline; }
    h1,h2,h3 { margin:0 0 8px; } h1 { font-size:28px; } h2 { font-size:18px; } h3 { font-size:16px; }
    .eyebrow { display:block; text-transform:uppercase; letter-spacing:.08em; font-size:11px; color:var(--muted); margin-bottom:4px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; margin-top:12px; }
    .card { border:1px solid var(--line); border-radius:12px; padding:14px; background:#fbfefe; }
    .card.wide { margin-top:12px; } .module { margin-top:12px; padding-top:12px; border-top:1px solid var(--line); }
    .empty,.muted { color:var(--muted); } .chips { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
    .chip { background:#e7f3f4; color:var(--accent); border-radius:999px; padding:2px 8px; font-size:12px; }
    .files, .steps { margin:8px 0 0; padding-left:18px; } code { font-family:ui-monospace,"Cascadia Code",monospace; font-size:.92em; }
    .warning-banner { background:var(--warn-bg); color:var(--warn); border-radius:12px; padding:12px 14px; margin:16px 0; }
    footer { margin-top:18px; color:var(--muted); font-size:12px; display:flex; justify-content:space-between; gap:16px; }
    @media (max-width:640px) { footer { display:block; } }
  </style>
</head>
<body>
  <div class="shell">
    <nav>
      <a href="#system">System in its world</a>
      <a href="#runtime">Runtime pieces</a>
      <a href="#modules">Modules</a>
      <a href="#flows">Main flows</a>
      ${openConflicts.length ? '<a href="#conflicts">Open conflicts</a>' : ""}
    </nav>
    ${conflictBanner}
    <header class="panel">
      <span class="eyebrow">Architecture reading surface</span>
      <h1>${escapeHtml(systemName)}</h1>
      ${intentBlock(parsed.system.intent)}
      <p class="muted">Generated ${escapeHtml(present(generatedAt))} · source ${escapeHtml(SOURCE_RELATIVE)}</p>
    </header>
    <section id="system" class="panel">
      <div class="section-head"><h2>System in its world</h2><span>People and neighbors</span></div>
      <div class="grid">${actorCards}${externalCards}</div>
    </section>
    <section id="runtime" class="panel">
      <div class="section-head"><h2>Runtime pieces</h2><span>What actually runs</span></div>
      <div class="grid">${containerCards}</div>
    </section>
    <section id="modules" class="panel">
      <div class="section-head"><h2>Modules</h2><span>Boundaries inside each piece</span></div>
      ${moduleSections}
    </section>
    <section id="flows" class="panel">
      <div class="section-head"><h2>Main flows</h2><span>Typical request, job, or failure path</span></div>
      ${flowCards}
    </section>
    ${conflictList}
    <footer>
      <span>Show with <code>node .agent-foundry/architecture-overview.mjs show</code></span>
      <span>Not a status board · not a class or file graph · ${escapeHtml(String(modules.length))} module${modules.length === 1 ? "" : "s"}</span>
    </footer>
  </div>
</body>
</html>
`;
}

export function findRepoRoot(startDir = cwd(), maxDepth = 12) {
  let dir = startDir;
  for (let i = 0; i < maxDepth; i++) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

function confinedPath(root, relativePath, { symlinkDirMsg, symlinkFileMsg, missingOk = false }) {
  const rootResolved = resolve(root);
  const parts = relativePath.split("/");
  let current = rootResolved;
  for (let i = 0; i < parts.length; i += 1) {
    current = join(current, parts[i]);
    const isLast = i === parts.length - 1;
    if (!existsSync(current)) {
      if (isLast || missingOk) continue;
      throw new Error(`missing directory for ${relativePath}`);
    }
    if (lstatSync(current).isSymbolicLink()) {
      throw new Error(isLast ? symlinkFileMsg : symlinkDirMsg);
    }
  }
  const output = join(rootResolved, ...parts);
  const outputDirectory = dirname(output);
  const fromRoot = relative(rootResolved, outputDirectory);
  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    throw new Error(`${relativePath} resolves outside the repository`);
  }
  return output;
}

export function serializeSource(document) {
  return `${JSON.stringify(parseDocument(document), null, 2)}\n`;
}

export function loadSource(root) {
  const sourcePath = confinedPath(root, SOURCE_RELATIVE, {
    symlinkDirMsg: "refusing to read through a symlinked docs/architecture directory",
    symlinkFileMsg: "refusing to read a symlinked architecture source",
  });
  if (!existsSync(sourcePath)) {
    throw new Error(`architecture source missing: ${SOURCE_RELATIVE}`);
  }
  return { path: sourcePath, document: parseSource(readFileSync(sourcePath, "utf8")) };
}

export function writeSource(root, document) {
  const sourcePath = confinedPath(root, SOURCE_RELATIVE, {
    symlinkDirMsg: "refusing to write through a symlinked docs/architecture directory",
    symlinkFileMsg: "refusing to overwrite a symlinked architecture source",
    missingOk: true,
  });
  mkdirSync(dirname(sourcePath), { recursive: true });
  const tempPath = `${sourcePath}.tmp`;
  if (existsSync(tempPath) && lstatSync(tempPath).isSymbolicLink()) {
    throw new Error("refusing to overwrite a symlinked architecture source temp file");
  }
  writeFileSync(tempPath, serializeSource(document), "utf8");
  try {
    copyFileSync(tempPath, sourcePath);
  } catch (error) {
    throw new Error(
      `architecture source write failed; original source left in place if it existed; temp file at ${SOURCE_RELATIVE}.tmp: ${error.message}`,
    );
  }
  unlinkSync(tempPath);
  return sourcePath;
}

export function writeArchitectureOverview(root, document, generatedAt) {
  const output = confinedPath(root, OUTPUT_RELATIVE, {
    symlinkDirMsg: "refusing to write through a symlinked .agent-foundry directory",
    symlinkFileMsg: "refusing to overwrite a symlinked architecture overview",
    missingOk: true,
  });
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, renderArchitectureOverview(document, generatedAt), "utf8");
  return output;
}

function nowIso() {
  return new Date().toISOString();
}

export function show(root, options = {}) {
  const { document } = loadSource(root);
  const generatedAt = options.nowIso ?? nowIso();
  const html = renderArchitectureOverview(document, generatedAt);
  if (options.stdout) return { html, document, output: null };
  const output = writeArchitectureOverview(root, document, generatedAt);
  return { html, document, output };
}

export function refresh(root, patchText, options = {}) {
  const loaded = loadSource(root);
  const patch = parsePatch(patchText);
  const document = applyRefresh(loaded.document, patch, options.nowIso ?? nowIso());
  const html = renderArchitectureOverview(document, document.updatedAt);
  writeSource(root, document);
  if (options.stdout) return { html, document, output: null };
  try {
    const output = writeArchitectureOverview(root, document, document.updatedAt);
    return { html, document, output };
  } catch (error) {
    throw new Error(`architecture source refreshed but overview HTML write failed: ${error.message}`);
  }
}

function usage() {
  return [
    "Usage:",
    "  node .agent-foundry/architecture-overview.mjs show [--stdout]",
    "  node .agent-foundry/architecture-overview.mjs refresh --patch <file> [--stdout]",
    "  node .agent-foundry/architecture-overview.mjs --help",
    "",
  ].join("\n");
}

function readPatchFile(root, patchPath) {
  if (!patchPath) throw new Error("refresh requires --patch <file>");
  const resolved = resolve(root, patchPath);
  if (!existsSync(resolved)) throw new Error(`patch file missing: ${patchPath}`);
  if (lstatSync(resolved).isSymbolicLink()) {
    throw new Error("refusing to read a symlinked patch file");
  }
  return readFileSync(resolved, "utf8");
}

export function main(args, io = { stdout, stderr, cwd }) {
  const cwdNow = typeof io.cwd === "function" ? io.cwd() : io.cwd;
  let command = null;
  let stdoutFlag = false;
  let patchPath = null;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help") {
      io.stdout.write(usage());
      return 0;
    }
    if (arg === "--stdout") {
      stdoutFlag = true;
      continue;
    }
    if (arg === "--patch") {
      patchPath = args[index + 1];
      if (!patchPath) {
        io.stderr.write("error: --patch requires a file path\n");
        return 2;
      }
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      io.stderr.write(`error: unknown argument: ${arg}\n`);
      return 2;
    }
    if (command) {
      io.stderr.write(`error: unexpected argument: ${arg}\n`);
      return 2;
    }
    command = arg;
  }
  if (!command) {
    io.stderr.write(usage());
    return 2;
  }
  if (command !== "show" && command !== "refresh") {
    io.stderr.write(`error: unknown command: ${command}\n`);
    return 2;
  }
  if (command === "show" && patchPath) {
    io.stderr.write("error: show does not take --patch\n");
    return 2;
  }
  const root = findRepoRoot(cwdNow);
  if (!root) {
    io.stderr.write("error: not inside a Git repository\n");
    return 1;
  }
  try {
    if (command === "show") {
      const result = show(root, { stdout: stdoutFlag });
      if (stdoutFlag) io.stdout.write(result.html);
      else io.stdout.write(`Architecture overview updated: ${result.output}\n`);
      return 0;
    }
    const result = refresh(root, readPatchFile(root, patchPath), { stdout: stdoutFlag });
    if (stdoutFlag) io.stdout.write(result.html);
    else io.stdout.write(`Architecture source refreshed: ${SOURCE_RELATIVE}\nArchitecture overview updated: ${result.output}\n`);
    return 0;
  } catch (error) {
    io.stderr.write(`error: ${error.message}\n`);
    return error.message.includes("must not include intent")
      || error.message.includes("unknown key")
      || error.message.includes("unknown id")
      || error.message.includes("must be a lowercase kebab")
      || error.message.includes("must be a repository-relative")
      || error.message.includes("unsupported schemaVersion")
      || error.message.includes("not valid JSON")
      || error.message.includes("--patch")
      ? 2
      : 1;
  }
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === thisFile) {
  process.exitCode = main(process.argv.slice(2));
}
