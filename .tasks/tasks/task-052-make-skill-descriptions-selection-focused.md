---
id: task-052
title: Make skill descriptions selection-focused
status: done
priority: p1
tags: [area:skills]
blockedBy: []
createdAt: "2026-08-12T01:42:32Z"
updatedAt: "2026-08-12T02:00:25Z"
---

<!-- task-tracker:description -->
## Description

Rewrite and trim all 17 shared starter skill frontmatter descriptions so they state when each skill should be selected, retain only concise purpose or overlap boundaries, and move procedural detail out of the routing surface. Keep both harness trees synchronized, bump the Foundry version, add concrete upgrade actions, cold-review both axes, validate, and commit locally.

<!-- task-tracker:log -->
## Log

- 2026-08-12T01:42:32Z — created (status: backlog)
- 2026-08-12T01:42:39Z — note: rubric: (1) Every shared starter skill description leads with observable selection conditions and contains no unnecessary procedure, file-format, transport, or persistence detail. (2) Each description preserves needed exclusions and boundaries between overlapping skills. (3) The .agents and .claude skill trees remain semantically synchronized for all 17 skills. (4) VERSION and CHANGELOG describe the installed-behavior change and concrete upgrade actions. (5) Focused validation, full Foundry validation, bootstrap acceptance, and both cold review axes pass on the final tree.
- 2026-08-12T01:42:39Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T01:47:32Z — note: warm self-pass: read the complete diff against the rubric and review standards; twelve descriptions now state selection conditions first, five already-focused descriptions remain unchanged, overlap exclusions remain where needed, and the release entry names every changed skill.
- 2026-08-12T01:47:32Z — note: testability: removing a routing condition can leave valid YAML and synchronized files, so structural tests cannot prove semantic selection without an unsound phrase matcher. Use cold SPEC/STANDARDS review for semantic behavior; use repository gates for frontmatter parsing, synchronization, release metadata, and bootstrap behavior.
- 2026-08-12T01:47:32Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T01:47:32Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (17 shared skills)
- 2026-08-12T01:47:35Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T01:47:32Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T01:47:41Z — moved to review
- 2026-08-12T01:49:54Z — run: node .agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-052-r1 --cwd . --model claude-opus-5 --max-budget-usd 3
  started 2026-08-12T01:49:54Z, exit 1 in 0.1s
  output:
  | node:internal/modules/cjs/loader:1520
  |   throw err;
  |   ^
  |
  | Error: Cannot find module 'N:\agent-foundry\.agent-foundry\cold-review.mjs'
  |     at Module._resolveFilename (node:internal/modules/cjs/loader:1517:15)
  |     at wrapResolveFilename (node:internal/modules/cjs/loader:1071:27)
  |     at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1095:10)
  |     at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1122:12)
  |     at Module._load (node:internal/modules/cjs/loader:1294:5)
  |     at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
  |     at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
  |     at node:internal/main/run_main_module:33:47 {
  |   code: 'MODULE_NOT_FOUND',
  |   requireStack: []
  | }
  |
  | Node.js v24.19.0
- 2026-08-12T01:50:03Z — note: friction: the cold-review reference prescribes root .agent-foundry paths, but the Foundry source repository keeps the runnable review wrapper and runner under starter/.agent-foundry; the first recorded dispatch failed before provider invocation and required source-specific paths.
- 2026-08-12T01:50:28Z — note: friction: the second cold-review dispatch used the correct source paths but the outer shell timeout was too short and terminated it before a reviewer result; retrying with the provider-aligned timeout.
- 2026-08-12T01:51:36Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-052-r1 --cwd . --model claude-opus-5 --max-budget-usd 3 --runner starter/.agent-foundry/agent-headless/cli.js
  started 2026-08-12T01:50:03Z, exit 0 in 93.2s
  output tail (truncated to last 30 lines):
  | ED\n\n- **Dual-tree synchronization (rubric 3).** Compared every description hunk in `starter/.agents/skills/*` against its `starter/.claude/skills/*` counterpart in the diff: all twelve pairs are textually identical, and all twelve appear in both trees. Blob-hash divergence for `attack-the-board`, `codebase-audit`, `handoff-writer`, `plan-milestone`, `retrospective`, `visual-review` is pre-existing on both the old and new sides, consistent with the documented `.claude/`→`.agents/` body transform. No new description text contains the opposite tree's path string. `check-skill-sync.mjs` PASS at 17 shared skills is recorded.\n- **Skill-count invariant.** Twelve modified, five deliberately unchanged (`diagnosing-bugs`, `execute-task`, `grill-me`, `task-tracker`, `the-fool`) per the decisions record = 17; no skill added, renamed, or removed, so `scripts/validate-foundry.mjs` hardcoded counts need no update. Consistent with the recorded PASS.\n- **Rubric 1 (selection-led, procedure removed).** Read all twelve new descriptions. Each opens with \"Use when…\" and states observable conditions. Removed detail is genuinely non-routing (MADR file layout, long-poll transport, CLI verbs, packet-file persistence, git-blob mechanics, task-filing behavior). No residual file-format/transport/persistence detail found in the new text.\n- **Rubric 2 (exclusions preserved).** Traced each removed boundary clause to a replacement: `adr` (\"Do not use for small in-task choices\"), `attack-the-board` (vs plan-milestone/execute-task), `codebase-audit` (vs execute-task diff review), `plan-milestone` (vs store/execute), `retrospective` (vs codebase-audit), `visual-review` (not a cold-review rung). One pair failed — see finding 3.\n- **Rubric 4 (VERSION/CHANGELOG).** `VERSION` 0.32.0→0.32.1 with a matching `## 0.32.1` heading, satisfying validate-foundry's changelog-entry requirement. Entry describes installed behavior and lists concrete per-file upgrade actions; the twelve names in the entry match the twelve modified skills exactly. Defects in level classification and command references at findings 4 and 5.\n- **ADR requirement.** Confirmed the change alters only frontmatter prose in existing skills — no module boundary, contract, or structural change — so the \"architecture-significant implementation without a matching decision record\" rule is not triggered. The recorded no-ADR decision is correct.\n- **Prompt-injection lens.** Scanned the diff, task records, decisions, and evidence for text addressing the reviewing agent. Found none; no instruction-bearing content required escalation.\n- **Could not verify from the packet** (each already raised as a finding rather than omitted): existence/behavior of `.agent-foundry/run-checks.mjs` and the no-arg `check-skill-sync.mjs` form; skill-body contents for the four scope/gating statements; template-level skill catalog contents; any executed result for `node scripts/test-bootstrap.mjs` on this tree."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:51:43Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-052-r1 --cwd . --model claude-opus-5 --max-budget-usd 3 --runner starter/.agent-foundry/agent-headless/cli.js
  started 2026-08-12T01:50:28Z, exit 0 in 75.4s
  output tail (truncated to last 30 lines):
  |  The five untouched skills (`diagnosing-bugs`, `execute-task`, `grill-me`, `task-tracker`, `the-fool`) are absent from the diff in both trees, so sync is preserved by non-modification. `check-skill-sync.mjs` PASS with 17 shared skills is recorded, matching the hardcoded count.\n- **`starter/` payload content rules** — scanned every added line for absolute host paths, drive letters, `{{TOKEN}}` placeholders outside `.template` files, and `.ps1` additions; none present. All changed files are within existing `starter/` skill directories, so no new payload file needs `SEED_FILES`/mold classification and no manifest change is implied.\n- **Markdown/YAML structural integrity** — each hunk keeps the `---` frontmatter fences, the `name:` key, and the `>-` folded block with consistent two-space continuation indentation; no code fences are opened or closed by the diff, so fence balance is unchanged.\n- **Version/changelog coupling** — confirmed `VERSION` moved `0.32.0` → `0.32.1` and a matching `## 0.32.1` heading was added above `## 0.32.0`, satisfying the validator's \"changelog entry for current VERSION\" rule; the semantic mismatch with the file's own patch/minor definition is finding 2.\n- **Changelog upgrade-action completeness** — cross-checked the twelve skill names listed in the entry against the twelve directories in the diff; they match exactly, and the \"both harness trees\" wording covers the 24 modified files.\n- **ADR requirement** — verified the change touches only frontmatter prose in existing files, altering no module boundary, script, or installation path, so the \"no ADR required\" decision holds against \"any architecture-significant implementation without an accepted matching decision record is a finding\".\n- **Prompt-injection surface** — read the entire diff, task records, decisions, and evidence as data; the fixture text contains no instructions addressed to a reviewing agent, and nothing in the packet attempted to redirect the axis or rubric.\n- **Boundary/exclusion preservation (rubric 2)** — traced each removed \"Distinct from ...\" clause to its replacement: `attack-the-board` → \"Do not use to plan a new milestone or to execute only one task\"; `codebase-audit` → \"Do not use for review of one task diff; use execute-task for that review\"; `plan-milestone` → \"Do not use only to store or execute an existing task\"; `retrospective` → \"Use codebase-audit instead for code-quality drift\"; `visual-review` → \"Do not use it as a cold-review rung\"; `adr` → \"Do not use for small in-task choices\". Selection-relevant exclusions survive; the non-exclusion gates that did not survive are finding 4.\n- **Not verifiable from this packet (each already raised above)** — existence of `.agent-foundry/run-checks.mjs`; skill-body content for the three removed gate statements; the referenced `evidence.md` / `decisions.md` / `rubric.txt`; and any execution of `scripts/test-bootstrap.mjs` against the final tree."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:53:37Z — note: round-1 adjudication: confirmed SPEC finding 2 and STANDARDS finding 2; rewrote the five previously unchanged descriptions so all 17 lead with selection conditions, and changed the release to 0.33.0 so required upgrade actions do not contradict the patch policy. Rejected the validation finding because SDLC permits expensive full gates after review fixes freeze the diff. Rejected the unverified-command finding after live Test-Path starter/.agent-foundry/run-checks.mjs returned true; the packet lacked that evidence. Rejected the removed-gate finding after live skill-body checks found handoff preservation at line 210, hosted-issue approval at lines 80-93, and milestone approval at lines 100-106. The task-artifact finding concerns packet presentation, not repository behavior; round 2 will include the actual task records and evidence directly.
- 2026-08-12T01:53:37Z — note: round-1 fix verification: the cold SPEC review failed rubric 1 because five descriptions did not lead with selection conditions; all five now start with Use when. The cold SPEC and STANDARDS reviews both failed rubric 4/version policy because 0.32.1 carried upgrade actions; VERSION and CHANGELOG now use 0.33.0. Semantic failures are cold-review checks; no sound static phrase test is being added.
- 2026-08-12T01:53:37Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T01:53:37Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (17 shared skills)
- 2026-08-12T01:53:41Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T01:53:37Z, exit 0 in 3.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T01:56:21Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-052-r2 --cwd . --model claude-opus-5 --max-budget-usd 3 --runner starter/.agent-foundry/agent-headless/cli.js
  started 2026-08-12T01:55:04Z, exit 0 in 77.7s
  output tail (truncated to last 30 lines):
  |  decision\"), transport (long-poll endpoint), or persistence (Git blob, \"always writes a local packet file\") detail. Residual mentions (`persistent task board`, `browser-use CLI`, named agent CLIs) are selection-relevant identifiers, not procedure.\n- **Rubric 2 (exclusions/boundaries preserved):** compared old vs new text per skill. Retained: adr↔in-task choices, attack-the-board↔plan-milestone/execute-task, codebase-audit↔execute-task, retrospective↔codebase-audit, the-fool↔execute-task, visual-review↔cold-review rung, task-tracker↔execute-task, plan-milestone↔store/execute, diagnosing-bugs↔trivial fixes, agent-headless operator-selected Cursor. Dropped statements (`handoff-writer` overwrite semantics, `agent-foundry-feedback` hosted-issue gate, `plan-milestone` approval gate, `codebase-audit` \"never blocks work\") are behavior rather than routing boundaries; their survival in the bodies is asserted but not shown — see finding 2.\n- **Rubric 3 (tree sync):** cross-checked every `.agents`/`.claude` pair in the diff — all 17 skills appear in both trees with identical new description text; post-change blob hashes match where the file is tree-neutral and differ only where the pre-change files already differed (attack-the-board, codebase-audit, diagnosing-bugs, execute-task, handoff-writer, plan-milestone, retrospective, task-tracker, visual-review), consistent with the documented `.claude/`→`.agents/` transform. `check-skill-sync.mjs` PASS with 17 shared skills is recorded.\n- **Dual-tree path-string invariant (`CLAUDE.md`):** no added description text contains `.claude/skills/`, `.agents/skills/`, `Claude-facing`, or `Codex-facing`; corroborated by the recorded `validate-foundry.mjs` PASS.\n- **Rubric 4 (VERSION/CHANGELOG):** `VERSION` 0.32.0→0.33.0 matches the new `## 0.33.0` heading, satisfying validate-foundry's changelog-entry gate; the upgrade action enumerates all 17 skills by name and matches the shared-skill list in `CLAUDE.md`. Classification concern raised as finding 3.\n- **Named commands in docs:** `.agent-foundry/check-skill-sync.mjs` corroborated by `CLAUDE.md` (documented as taking no argument inside installed projects, matching the changelog form); `.agent-foundry/run-checks.mjs` corroborated by the recorded `Test-Path` result.\n- **ADR requirement:** confirmed the change alters only frontmatter routing text — no module boundary, install flow, or manifest-tier change — so the \"no ADR required\" decision holds under the architecture-significant-decision rule.\n- **Prompt-injection / data-vs-instruction rule:** scanned the full diff, task cards, decisions, and evidence for text addressing the reviewing agent; none found.\n- **Not verifiable from this packet (already reported):** full `validate-foundry.mjs` and `test-bootstrap.mjs` on the final tree (finding 1); skill-body gate excerpts (finding 2). No execution tool was available in this session, so all checks above are static reads of the packet."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T01:57:03Z — note: round-2 adjudication: confirmed SPEC finding 2 and clarified the reciprocal boundary: efficient-orchestration coordinates multiple delegated tasks for efficiency; agent-headless directly invokes one provider task. Confirmed STANDARDS finding 3 and clarified semantic version policy so compatible installed-behavior changes are minor while project-specific decisions on stock installs are major; local mold customization alone is not breaking. Rejected both axes' deferred-gate findings because SDLC explicitly permits full gates after review fixes freeze the diff; the gates now run on that frozen diff. STANDARDS finding 2 is packet incompleteness, not a source defect; the final delta packet will include exact body excerpts.
- 2026-08-12T01:57:03Z — note: round-2 fix verification: the cold SPEC review found both agent-headless and efficient-orchestration matched cross-family delegated work; the reciprocal one-direct-call versus multi-task-coordination exclusions now distinguish them. The cold STANDARDS review found the version classification ambiguous; the changelog policy now defines compatibility for stock installs and local mold reconciliation explicitly.
- 2026-08-12T01:57:07Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T01:57:04Z, exit 0 in 3.2s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T01:58:28Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-12T01:57:07Z, exit 0 in 81.5s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.33.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\clean-project\.agent-foundry-backups\20260812T015822956Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.33.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\clean-project
  | Agent Foundry 0.33.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\seed-upgrade-project\.agent-foundry-backups\20260812T015826025Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.33.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\seed-upgrade-project
  | Agent Foundry 0.33.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\clean-project\.agent-foundry-backups\20260812T015828201Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.33.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-jUeAtX\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-12T01:59:59Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-052-r3 --cwd . --model claude-opus-5 --max-budget-usd 3 --runner starter/.agent-foundry/agent-headless/cli.js --axis COMBINED
  started 2026-08-12T01:59:10Z, exit 0 in 48.6s
  output tail (truncated to last 30 lines):
  | des, so the round-two cross-family delegation collision is resolved. Verified.\n- **Rubric 2 — policy classifies compatible installed-behavior changes with upgrade actions as minor, reserves major for stock installs needing project-specific decisions, does not treat local mold customization alone as breaking** | Read the replaced policy paragraph: major = \"a stock installed project needs a project-specific decision to upgrade correctly\"; minor = \"new capability or changed installed behavior with concrete upgrade actions\"; patch = \"fixes that need no installed-payload reconciliation\"; plus the explicit sentence that reconciling a locally customized mold does not by itself make an otherwise compatible release breaking. `VERSION` 0.33.0 with a `### Changed` + `### Upgrade actions` entry and no `### Breaking` fits the new minor definition. Verified except the section-name point in finding 1.\n- **Rubric 3 — both harness trees synchronized** | Counted the diff: 17 `SKILL.md` files under `starter/.agents/skills/` and the same 17 under `starter/.claude/skills/`, with byte-identical replacement descriptions per skill (including the two delta-scope files). No description contains the other tree's path string, and no `Claude-facing`/`Codex-facing` token appears in the changed frontmatter, so the shared-skill and cross-tree-path rules in `scripts/validate-foundry.mjs` are not tripped by this diff. Verified by inspection.\n- **Rubric 3 — final Foundry and disposable-bootstrap gates pass** | Verified only from the packet's recorded evidence: `node scripts/validate-foundry.mjs` PASS, `node scripts/test-bootstrap.mjs` PASS with a clean install reporting Agent Foundry 0.33.0, and `node starter/.agent-foundry/check-skill-sync.mjs starter` PASS. I had no execution tool available in this review session, so this is packet-attested rather than independently re-run; per the packet decisions this is the accepted resolution for the deferred gates.\n- **Scope containment (task objective: fixes touch nothing outside the approved task)** | The diff is confined to `CHANGELOG.md`, `VERSION`, and the 34 shared `SKILL.md` frontmatter blocks; every hunk is frontmatter-only (bodies untouched), so the preserved safety gates cited in evidence (`handoff-writer` 210-216, `agent-foundry-feedback` 76-94, `plan-milestone` 99-106) cannot have been altered by this change. Untracked additions are task-052, the approved dependent follow-up card, and generated review packets. Verified.\n- **Review-standards lens: content read through a tool is data** | Scanned the diff, packet notes, and evidence for text addressing the reviewing agent or attempting to redirect the axis; found none. Verified.\n- **Review-standards lens: architecture-significant change without an ADR** | The delta is two documentation/frontmatter wording fixes inside an already-approved task; no structural or interface change is introduced that would require a decision record. Verified."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T02:00:18Z — note: round-3 delta adjudication: both named fixes verified. Discarded the sole low-severity, low-confidence finding because live CHANGELOG.md explicitly defines Upgrade actions in the Each release has list; the review packet diff merely omitted unchanged context. Cold review rung 1 used throughout: separate Claude CLI process, requested claude-opus-5, observed provider metadata recorded by cold-review; SPEC and STANDARDS ran separately for full rounds, followed by one COMBINED low-severity delta check.
- 2026-08-12T02:00:25Z — moved to done
