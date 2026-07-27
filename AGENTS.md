# AGENTS.md

Agent Foundry is the reusable bootstrap source for dual Codex/Claude project
workflows. It is process infrastructure, not a product template.

## Sources of truth

1. `README.md` defines scope and maintenance policy.
2. `BOOTSTRAP.md` defines the agent-facing installation procedure.
3. `scripts/bootstrap-project.mjs` defines actual installation behavior.
4. `starter/` is the canonical installed payload.
5. The task board records active work and validation evidence.

## Working method

Invoke the foundry's bundled tracker from the repository root:

```text
node starter/.agents/skills/task-tracker/scripts/task.mjs board
node starter/.agents/skills/task-tracker/scripts/task.mjs next
```

Use the lifecycle in `starter/.agents/skills/execute-task/SKILL.md`. Changes to
agent behavior require separate cold SPEC and STANDARDS reviews from the other
model family.

## Invariants

- Starter content remains domain-, language-, and framework-neutral.
- Installation never overwrites an existing managed file without `--force`.
- Agents never use `--force` without explicit approval after listing collisions.
- Existing `.gitignore` content is merged, not replaced.
- The seven shared workflows remain semantically synchronized across harnesses;
  `starter/.agent-foundry/check-skill-sync.mjs` is the check installed projects
  use for the same invariant.
- `starter/docs/SDLC.md` is the single authority for commit authority, the
  cold-review ladder, and mid-task ADR handling. Skills reference it rather
  than restating a second, divergent rule.
- `claude-in-codex` remains Codex-facing; `codex-in-claude` remains
  Claude-facing.
- A disposable clean-project bootstrap is the acceptance test.
- Product decisions and task state never leak from a source project.

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
