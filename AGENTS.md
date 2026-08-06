# AGENTS.md

Agent Foundry is the reusable bootstrap source for dual Codex/Claude project
workflows. It is process infrastructure, not a product template.

## Sources of truth

1. `README.md` defines scope and maintenance policy.
2. `BOOTSTRAP.md` defines the agent-facing installation procedure.
3. `UPGRADING.md` defines the agent-facing upgrade procedure.
4. `VERSION` and `CHANGELOG.md` define the current release and what an upgrade
   from any prior version must do.
5. `scripts/bootstrap-project.mjs` defines actual installation behavior.
6. `starter/` is the canonical installed payload.
7. The task board records active work and validation evidence.

## Working method

Invoke the foundry's bundled tracker from the repository root:

```text
node starter/.agents/skills/task-tracker/scripts/task.mjs board
node starter/.agents/skills/task-tracker/scripts/task.mjs next
```

Use the lifecycle in `starter/.agents/skills/execute-task/SKILL.md`. Changes to
agent behavior require separate cold SPEC and STANDARDS reviews from the other
model family.

## Operator communication

For human-facing questions, updates, explanations, and closeouts, follow
`starter/docs/SDLC.md` → "Operator communication". It keeps the conversation
brief and understandable while detailed evidence stays in project records.

## Invariants

- Starter content remains domain-, language-, and framework-neutral.
- Installation never overwrites an existing managed file without `--force`.
- Agents never use `--force` without explicit approval after listing collisions.
- Existing `.gitignore` content is merged, not replaced.
- The fifteen shared workflows remain semantically synchronized across harnesses;
  `starter/.agent-foundry/check-skill-sync.mjs` is the check installed projects
  use for the same invariant.
- `starter/docs/SDLC.md` is the single authority for commit authority, the
  cold-review ladder, and mid-task ADR handling. Skills reference it rather
  than restating a second, divergent rule.
- `agent-headless` is the sole provider-mechanics skill and bundled runtime for
  Claude, Codex, and operator-selected Cursor.
- A disposable clean-project bootstrap is the acceptance test.
- Product decisions and task state never leak from a source project.
- Every change that alters installed behavior bumps `VERSION` and adds a
  `CHANGELOG.md` entry with concrete `Upgrade actions`. Validation enforces
  that the current version has an entry.
- Installed projects may evolve their own copies; upgrades must reconcile that
  divergence rather than silently reverting it.

## Validation

```text
node scripts/validate-foundry.mjs
node scripts/test-bootstrap.mjs
```

Also scan `starter/` for source-project names, absolute repository paths, and
unresolved identity tokens outside designated templates.

## Git discipline

- Keep commits task-scoped and stage named paths.
- Preserve unrelated changes.
- Do not push, publish, or rewrite history unless explicitly asked.
