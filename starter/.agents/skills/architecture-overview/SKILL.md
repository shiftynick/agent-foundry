---
name: architecture-overview
description: >-
  Use when the operator asks for an architecture overview, architecture HTML,
  or to refresh the architecture source, or when a software engineer needs to
  learn the current system shape. Use project-orientation for work status.
  Use adr to record a decision; this skill only points at ADRs.
---

# Architecture Overview

Use the committed architecture source for a high-to-low reading surface. The
HTML is generated. It is not the source. Do not merge this view into
`project-orientation`. Do not run this on every cold start.

The source is `docs/architecture/architecture.json`. The project owns that
file after install. Structure may change on refresh. Intent stays, and it
points at ADRs.

## Choose the action

**Show** renders HTML from the current source. It does not write the JSON.

```text
node .agent-foundry/architecture-overview.mjs show
```

The command refreshes the Git-ignored
`.agent-foundry/architecture-overview.html` file. Use `--stdout` when a
consumer needs the complete HTML without writing that file.

**Refresh** inspects the repository, writes a structure-only patch, updates
the source, then renders. Use it only on an explicit ask, or when a task
changes system shape: a new runtime piece, a new boundary, or a new external
system.

```text
node .agent-foundry/architecture-overview.mjs refresh --patch <patch.json>
```

Never rewrite `docs/architecture/architecture.json` by hand during refresh.
Never put `intent` in the patch. The tool rejects that patch and leaves the
source unchanged.

## Inspect without a language parser

Read the tree, documented entry points, ADRs, and obvious runtime pieces.
Stay language-neutral. Do not parse one programming language's imports as
the architecture.

The patch replaces structure. Matching ids keep intent. New ids get empty
intent. Omitted ids that still had intent become open conflicts. If code and
the source disagree, or an ADR and the current shape disagree, add a conflict
on the patch with code evidence, the source claim, and a proposed patch. Do
not apply that proposed patch.

Keep the map to three layers plus two or three main flows. Record entry files
as links. Do not add a class or file graph.

After refresh, tell the operator which structure changed and which conflicts
are open. After show, give the HTML path and any open-conflict count.

## Related

- `project-orientation` - work status and the status overview, not system shape
- `adr` - architecture decisions; this source points at them
- `.agent-foundry/README.md` - installed tool details
