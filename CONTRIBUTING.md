# Contributing to Agent Foundry

Read `AGENTS.md` and inspect the board before changing the starter payload.

Every change must preserve collision safety, dual-harness intent, genericity,
and clean-project bootstrap behavior. Update `README.md` or `BOOTSTRAP.md` when
installation or operator behavior changes.

Run `node scripts/validate-foundry.mjs` and
`node scripts/test-bootstrap.mjs`, then obtain separate cold SPEC and
STANDARDS reviews before completion.
