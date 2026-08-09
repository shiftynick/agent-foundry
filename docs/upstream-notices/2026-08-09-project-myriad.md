# Notice to project-myriad — your packet landed in Agent Foundry 0.28.0

You reported: **Scrub repository-local Git variables before installed test
runs** (`myriad-scrub-hook-git-environment-in-run-checks.md`, written against
stock 0.26.0).

The defect is fixed in Agent Foundry **0.28.0**. Your diagnosis was correct and
was reproduced here before any code changed.

## What landed

`starter/.agent-foundry/run-checks.mjs` now builds a scrubbed environment for
the installed-test step. Every repository-local Git name is removed from a copy
of `process.env`, matched case-insensitively so Windows casing variants cannot
survive. `runStep()` takes an environment parameter; only the installed-test
call passes one.

As you proposed:

- an exported `GIT_LOCAL_ENV_VARS` list,
- case-folded matching,
- `runStep()` gaining an environment parameter,
- the scrub applied to the installed-test step only, so the skill-sync step and
  any project gate keep the inherited environment.

## What we changed from your proposal — read this before you upgrade

**We did not adopt your first test**, the one asserting that
`GIT_LOCAL_ENV_VARS` covers everything `git rev-parse --local-env-vars`
reports on the host.

That test is a Foundry-staleness signal charged to your project: the day a
newer Git adds a name, every installed project's gate goes red for a Foundry
problem the project cannot fix. You flagged this trade-off yourself in the
packet's notes.

Instead the scrub set is a **union**:

- `GIT_LOCAL_ENV_VARS` is a pinned snapshot, used when Git is absent from PATH;
- `probeGitLocalEnvVars()` runs `git rev-parse --local-env-vars` and adds
  whatever the installed Git reports, filtered to plausible environment names.

A name a newer Git introduces is scrubbed with no Foundry release, and a stale
snapshot degrades coverage only on a machine with no Git. The snapshot also
carries `GIT_INTERNAL_SUPER_PREFIX`, which Git reported before 2.52 and no
longer does; it matters only when the probe cannot run.

Your second test — the end-to-end CLI check with canonical and mixed-case
values and a nested probe suite — landed close to as written.

## What to do

1. Upgrade to 0.28.0 following `UPGRADING.md`.
2. Replace your local `.agent-foundry/run-checks.mjs` **and**
   `.agent-foundry/run-checks.test.mjs` with the 0.28.0 copies. Do not merge
   your versions into stock: your test file contains the pinning test we
   deliberately did not adopt, and keeping it reintroduces the staleness
   failure this release avoids.
3. Retire both `LOCAL-CHANGES.md` entries once
   `node .agent-foundry/check-foundry-drift.mjs` reports the two files as
   unmodified.
4. Run `node .agent-foundry/run-checks.mjs` **through the pre-commit hook**,
   not only from a shell. That hook path is where the defect was visible and
   is the only place the fix can be confirmed.

If you would rather keep the pinning test as a project-owned check, move it out
of the managed file into your own suite. Then it is your signal, on your
schedule, and drift stays clean.

## Evidence

Red-capable in both directions: with the scrub reverted, the end-to-end test
fails; with the case fold removed, that test and the direct scrub test both
fail. `validate-foundry` and `test-bootstrap` pass on the released tree.

Reviewed cold on both SPEC and STANDARDS axes by the opposite model family
across three rounds. The `GIT_INTERNAL_SUPER_PREFIX` gap was a review finding,
not something you missed.

---

# Also: your 0.27.0 packet

`myriad-fix-cursor-compatibility-sentence.md` — the stray `An` fragment and the
missing comma in `starter/.agent-foundry/agent-headless/COMPATIBILITY.md` —
was adopted in **0.27.0**, and you were told at the time on your board
(`project-myriad` task-061).

Nothing about that fix changed from your report; there is no wording divergence
to warn you about, which is why it gets a paragraph rather than a section.
Replace `.agent-foundry/agent-headless/COMPATIBILITY.md` with the current copy
(unchanged since 0.27.0) and retire the `LOCAL-CHANGES.md` entry once
`node .agent-foundry/check-foundry-drift.mjs` reports it unmodified. If you
already did this at your 0.27.0 upgrade, this paragraph is closed business.

Worth saying plainly: that sentence was reported three times, by three
projects, across three releases before it landed. The delay was ours.

---

Thank you for the packet. The reproduction line
(`GIT_INDEX_FILE="$(git rev-parse --git-dir)/index" node
.agent-foundry/run-checks.mjs`) made this cheap to confirm and is now the shape
we would like every packet to carry.
