# ADR 0005: Maintained architecture source with a generated reading surface

- **Status:** accepted
- **Date:** 2026-08-13
- **Task:** task-054

## Context and problem statement

Installed projects already have a status projection and a generated work
overview. Those views answer "what is moving" and do not describe system
shape. A software engineer who needs to learn the current architecture needs
a deeper, high-to-low document that stays honest as the code changes, without
becoming a second status board or a class-level dump.

The operator confirmed this contract in a grill on 2026-08-13 and authorized
task-054.

## Decision drivers

- The page must teach system shape: neighbors, runtime pieces, then modules.
- Structure must be able to track the repository; intent must not be rewritten
  by a refresh.
- ADRs remain the "why" store. The architecture source points at them.
- The starter payload stays language-neutral, zero-dependency, and
  cross-platform.
- HTML is a reading surface. It is not another source of truth.
- `project-orientation` stays the work-status skill.

## Considered options

1. A five-minute literacy map generated only from the tree, with no committed
   source. Fast to refresh, but it cannot hold intent and it collides with the
   existing status overview's "generated snapshot" pattern for the wrong job.
2. A generated-only HTML projection rebuilt on demand from repo evidence, with
   ADRs inlined at render time. Honest about code, but intent lives nowhere
   durable except those ADRs, and the reading surface cannot accumulate
   project-owned structure notes.
3. A committed, project-owned architecture source that a skill updates. The
   skill patches structure from a refresh, preserves intent, marks conflicts
   when code or ADRs disagree, and renders Git-ignored HTML from the source.
   Show never mutates the source. Refresh runs only on an explicit ask or when
   a task changes system shape.

## Decision

Adopt option 3.

The committed source is `docs/architecture/architecture.json` (schema version
1). It is a seed: the project owns it after install. Each node splits
**structure** (ids, names, kinds, talks-to, entry files, flow steps) from
**intent** (`summary` plus `adrIds`).

`.agent-foundry/architecture-overview.mjs` is the only refresh writer:

- `show` renders HTML from the current source and does not write the JSON.
- `refresh --patch <file>` replaces structure from the patch, copies intent
  from matching ids, gives new ids empty intent, and turns omitted ids that
  still had intent into open conflicts. A patch that includes `intent` is
  rejected.

The agent inspects the repository in a language-neutral way and produces the
patch. The tool does not parse a programming language.

The HTML reading order is fixed: system in its world, runtime pieces, modules
inside each piece, then two or three main flows. Entry files are links, not a
file or class graph. Generated HTML is Git-ignored.

This skill is not part of cold-start orientation and is not merged into
`project-orientation`.

The operator accepted this decision explicitly on 2026-08-13 (grill
confirmation, then task-054).

## Consequences

### Good

- Engineers get a durable high-to-low architecture document.
- Refresh can update shape without destroying judgment recorded as intent.
- ADRs stay the decision log; the source references them instead of restating
  them.
- The status overview and the architecture overview cannot be confused: one
  is a projection of work truth, the other is a maintained architecture
  source plus a render.

### Bad

- Installed projects gain another committed schema to keep valid.
- A stale source with empty conflicts will look authoritative until someone
  runs refresh.
- Complete structure replacement means an incomplete patch can drop runtime
  pieces; recovery depends on Git history and preserved-intent conflicts.
- Language-neutral inspection is only as good as the agent's reading of the
  tree; the tool cannot prove that structure matches the code.

## Validation

Parse and merge tests must fail when a patch includes intent, when show writes
the JSON, and when omitted intent-bearing nodes do not become conflicts.
Render tests must require the three layer headings plus main flows, and must
escape untrusted text. Disposable bootstrap must install the seed, both skill
copies, the renderer, and the gitignore line.

## Follow-up

None at decision time. Later schema versions require a new ADR.
