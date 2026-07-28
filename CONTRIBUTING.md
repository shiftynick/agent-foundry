# Contributing to Agent Foundry

Read `AGENTS.md` and inspect the board before changing the starter payload.

Every change must preserve collision safety, dual-harness intent, genericity,
and clean-project bootstrap behavior. Update `README.md` or `BOOTSTRAP.md` when
installation or operator behavior changes.

Any change to installed behavior also bumps `VERSION` and adds a
`CHANGELOG.md` entry whose `Upgrade actions` are concrete enough for an agent
to execute against an already-customized project. Validation fails when the
current `VERSION` has no changelog entry.

Run `node scripts/validate-foundry.mjs` and
`node scripts/test-bootstrap.mjs`, then obtain separate cold SPEC and
STANDARDS reviews before completion.
