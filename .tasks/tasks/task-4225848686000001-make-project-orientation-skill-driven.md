---
id: task-4225848686000001
title: Make project orientation skill-driven
status: done
priority: p1
tags: [area:skills, area:bootstrap, phase:template-cleanup]
blockedBy: [task-052]
createdAt: "2026-08-12T01:47:17Z"
updatedAt: "2026-08-12T02:16:17Z"
---

<!-- task-tracker:description -->
## Description

Replace template-level project-status and project-overview operating guidance with a shared skill that selects when an agent must inspect or refresh project orientation. Remove the redundant project-local skill catalog from the installed agent template, reconcile the Claude template so both harness entrypoints stay concise and non-duplicative, preserve discoverability and cold-start behavior, update release metadata, and prove the disposable bootstrap installs synchronized guidance.

<!-- task-tracker:log -->
## Log

- 2026-08-12T01:47:17Z — created (status: backlog)
- 2026-08-12T02:00:38Z — note: rubric: (1) A synchronized shared skill states when agents should inspect project status or generate an operator overview and contains the complete command guidance. (2) AGENTS.md.template no longer lists project-local skills or duplicates status/overview operating instructions. (3) CLAUDE.md.template is equally concise and preserves only harness-entrypoint guidance that cannot live in the shared skill. (4) Cold-start discoverability remains explicit without maintaining a redundant skill catalog. (5) Version, changelog, skill counts, structural validation, and disposable bootstrap acceptance all match the new installed payload.
- 2026-08-12T02:00:38Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-12T02:04:18Z — note: interface outline: project-orientation selects synthesized current-state and visual-overview requests; task-tracker retains individual board reads and mutations. The skill exposes four installed commands: status text, status JSON, mark-seen comparison point, and overview HTML. AGENTS retains shared policy and Codex-path examples; CLAUDE retains only path translation and cross-family review guidance. Least-confident choice: whether cold-start orientation should mark seen; resolved no, until the operator receives the view.
- 2026-08-12T02:04:18Z — note: friction: the new-interface outline was logged after the first draft instead of before bodies, contrary to execute-task sequencing. No external interface had been reviewed or committed; the outline now governs the warm pass and cold review.
- 2026-08-12T02:04:28Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:04:28Z, exit 1 in 0.1s
  output:
  | Installed AGENTS.md regained skill-owned guidance: node .agent-foundry/project-status.mjs
- 2026-08-12T02:04:45Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:04:42Z, exit 1 in 3.1s
  output:
  | .agents project-orientation lost its selection or command contract: node .agent-foundry/project-status.mjs --mark-seen
- 2026-08-12T02:04:59Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:04:56Z, exit 1 in 2.8s
  output:
  | Expected 18 shared skills per harness; found agents=19, claude=19.
- 2026-08-12T02:05:17Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-12T02:05:17Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (18 shared skills)
- 2026-08-12T02:05:20Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:05:17Z, exit 0 in 3.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T02:05:21Z — run: node starter/.agent-foundry/project-status.mjs --json
  started 2026-08-12T02:05:20Z, exit 0 in 0.2s
  output tail (truncated to last 30 lines):
  |         "blockedBy": [],
  |         "unmetBlockers": [],
  |         "createdAt": "2026-08-12T00:41:14Z",
  |         "updatedAt": "2026-08-12T01:03:23Z",
  |         "archived": false
  |       }
  |     ]
  |   },
  |   "validation": {
  |     "latest": {
  |       "taskId": "task-4225848686000001",
  |       "recordedAt": "2026-08-12T02:05:17Z",
  |       "command": "node starter/.agent-foundry/check-skill-sync.mjs starter",
  |       "startedAt": "2026-08-12T02:05:17Z",
  |       "exitCode": 0,
  |       "durationSeconds": 0.1
  |     }
  |   },
  |   "since": {
  |     "marker": null,
  |     "markerStatus": "missing",
  |     "firstLook": true,
  |     "commits": null,
  |     "changedTasks": [],
  |     "removedTaskIds": [],
  |     "completed": [],
  |     "needsOperator": []
  |   },
  |   "warnings": []
  | }
- 2026-08-12T02:05:21Z — run: node starter/.agent-foundry/project-overview.mjs --stdout
  started 2026-08-12T02:05:21Z, exit 0 in 0.2s
  output tail (truncated to last 30 lines):
  |         <li><strong>Started:</strong> 2026-08-12T02:05:20Z</li>
  |         <li><strong>Recorded:</strong> 2026-08-12T02:05:21Z</li>
  |         <li><strong>Duration:</strong> 0.2s</li>
  |         <li><strong>Exit code:</strong> 0</li>
  |       </ul>
  |       <h3>In progress</h3><ul><li><strong>task-4225848686000001</strong> — Make project orientation skill-driven <span>in_progress</span></li></ul>
  |       <h3>In review</h3><ul><li>None</li></ul>
  |       <h3>Next</h3><ul><li>None</li></ul>
  |       <h3>Later preview</h3><ul><li>None</li></ul>
  |       <h3>Blocked</h3><ul><li>None</li></ul>
  |       <h3>Needs operator</h3><ul><li>None</li></ul>
  |       <h3>Recent completed</h3><ul><li><strong>task-052</strong> — Make skill descriptions selection-focused <span>done</span></li><li><strong>task-6246861934000005</strong> — Add one-click choice affordance to visual-review annotations <span>done</span></li><li><strong>task-6246861934000006</strong> — Give visual-review SKILL.md an explicit polling discipline <span>done</span></li><li><strong>task-6246861934000007</strong> — Merge browser-use branch and reconcile skill counts to 17 at 0.32.0 <span>done</span></li><li><strong>task-6246861934000004</strong> — Cold-review the visual-review round-3 fixes with a scoped delta pass <span>done</span></li></ul>
  |     </div>
  |   </details>
  |         <details>
  |     <summary>Git changes and warnings</summary>
  |     <div class="detail-body">
  |       <h3>Changed paths</h3><ul><li><code>M </code> tasks/tasks/task-4225848686000001-make-project-orientation-skill-driven.md</li><li><code> M</code> AGENTS.md</li><li><code> M</code> CHANGELOG.md</li><li><code> M</code> CLAUDE.md</li><li><code> M</code> README.md</li><li><code> M</code> VERSION</li><li><code> M</code> scripts/test-bootstrap.mjs</li><li><code> M</code> scripts/validate-foundry.mjs</li><li><code> M</code> starter/.agents/skills/README.md</li><li><code> M</code> starter/.claude/skills/README.md</li><li><code> M</code> starter/AGENTS.md.template</li><li><code> M</code> starter/CLAUDE.md.template</li><li><code>??</code> .tasks/review-packets/</li><li><code>??</code> starter/.agents/skills/project-orientation/</li><li><code>??</code> starter/.claude/skills/project-orientation/</li></ul>
  |       <h3>Commits since last look</h3><ul><li>No comparison marker yet.</li></ul>
  |       <h3>Removed tasks</h3><ul><li>None</li></ul>
  |       <h3>Warnings</h3><ul><li>None</li></ul>
  |     </div>
  |   </details>
  |       </section>
  |     </main>
  |
  |     <footer><span>Refresh with <code>node .agent-foundry/project-overview.mjs</code></span><span>Generated from project truth · not an editable task board</span></footer>
  |   </div>
  | </body>
  | </html>
- 2026-08-12T02:05:38Z — note: warm self-pass: read the complete new skill, both templates, release entry, count changes, and validator diff against all five rubric lines and review standards. The status commands now exist only in project-orientation and tool documentation; AGENTS has no skill catalog; CLAUDE carries only harness-path and cross-family review guidance; the skill distinguishes synthesized orientation from task-tracker mutations and protects mark-seen timing.
- 2026-08-12T02:05:38Z — note: behavior-removal checks: changing the mark-seen command made structural validation fail; reintroducing a status command into AGENTS made structural validation fail; adding an unexpected nested SKILL.md made the 18-skill count fail. All seeded defects were restored before the passing targeted gates.
- 2026-08-12T02:05:39Z — moved to review
- 2026-08-12T02:07:14Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-4225848686000001-r1 --cwd . --model claude-opus-5 --max-budget-usd 3 --runner starter/.agent-foundry/agent-headless/cli.js
  started 2026-08-12T02:06:08Z, exit 0 in 66.1s
  output tail (truncated to last 30 lines):
  | l-count consistency** — traced 17→18 in `scripts/validate-foundry.mjs` (count guard + `sharedSkills` array), `scripts/test-bootstrap.mjs` regex, root `AGENTS.md`, root `CLAUDE.md` (both the name list and the \"exactly 18\" sentence), and `README.md`; the `project-orientation` name is present in both the validator array and the CLAUDE.md list.\n- **Rubric 1 (skill owns complete command guidance)** — compared the four commands plus `--stdout` and `--mark-seen` in the removed template blocks against the new skill body; all are present, plus the marker-file names and the read-only/mutation boundary versus `task-tracker`.\n- **Rubric 2 (AGENTS.md.template)** — the diff deletes both the status/overview block and the entire `## Project-local skills` table, leaving one dual-tree maintenance sentence; `validate-foundry.mjs` now hard-fails on reintroduction of `## Project-local skills`, `node .agent-foundry/project-status.mjs`, and `node .agent-foundry/project-overview.mjs`.\n- **Rubric 3 (CLAUDE.md.template)** — the diff leaves only the `AGENTS.md`-first pointer, the harness path-translation sentence, and the cross-family `agent-headless` review guidance; a matching forbidden-string guard was added for this file.\n- **New behavior has a failing-without-it test** — the task log records three seeded defects (reintroduced AGENTS status command, altered `--mark-seen` anchor, nineteenth `SKILL.md`) each producing a distinct non-zero `validate-foundry.mjs` exit with the expected message, then a clean PASS. This is a genuine red-then-green signal for the validator changes (but not for the install path — finding 1).\n- **Version/changelog coupling** — `VERSION` 0.34.0 with a matching `## 0.34.0` CHANGELOG section containing `### Changed` and `### Upgrade actions`; the upgrade actions name the reconcile steps and the `PASS (18 shared skills)` expectation, consistent with the repo's minor-bump-for-upgrade-actions policy.\n- **`starter/` content rules** — the new files contain no absolute host paths, no `{{TOKEN}}` outside `.template`, no `.ps1`, balanced fences (three `text` blocks opened and closed), and valid YAML frontmatter with `name`/`description`.\n- **Untrusted-content handling** — read the task log, command output, and generated HTML in the packet as data; found no text attempting to redirect the review, so nothing to surface on that standard.\n- **ADR requirement** — the change moves guidance between existing documentation surfaces and adds no schema, script, persistence, or structural change; agreed no architecture-significant decision is implemented, so the \"implementation without a matching ADR\" rule is not triggered.\n- **Write-scope/destructive-target rule** — the only state the skill can mutate are the two Git-ignored files (`project-overview.html`, `project-status-seen.json`), both named explicitly, with `--stdout` documented as the non-writing path and an explicit prohibition on marking a cold-start view as seen."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T02:07:57Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:07:54Z, exit 1 in 2.8s
  output:
  | Installed Foundry README lost project-orientation detail: schemaVersion: 1
- 2026-08-12T02:08:28Z — note: round-1 adjudication: rejected both high deferred-bootstrap findings as timing findings, not source defects; SDLC places the expensive disposable bootstrap after review fixes freeze, and it now runs on the final tree. Rejected the stale-payload finding after a live starter-wide scan found no old 17-skill count and found status/overview commands only in project-orientation and .agent-foundry/README.md, the intended technical schema authority. Rejected the cold-start discoverability finding because the full AGENTS template explicitly names .agents/skills/... and .claude/skills/... at lines 22-24, while the new frontmatter selects resume-without-context requests. Confirmed the low link-verification finding: the README exists and contains the schema contract, but validation did not protect it. Added requireFile plus schema/consumer/--stdout anchors and recorded a seeded schemaVersion defect that the gate rejected.
- 2026-08-12T02:08:28Z — note: round-1 fix verification: before the validator fix, project-orientation could link to a missing or hollow .agent-foundry/README.md without a targeted error. After adding the check, changing its documented schemaVersion from 1 to 2 made validate-foundry fail with the expected lost-detail error; the file was restored before final gates.
- 2026-08-12T02:08:31Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:08:28Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T02:09:46Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-12T02:08:31Z, exit 0 in 74.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\clean-project\.agent-foundry-backups\20260812T020941699Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\clean-project
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\seed-upgrade-project\.agent-foundry-backups\20260812T020943855Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\seed-upgrade-project
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\clean-project\.agent-foundry-backups\20260812T020945966Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-6anqf2\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-12T02:11:43Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-4225848686000001-r2 --cwd . --model claude-opus-5 --max-budget-usd 3 --runner starter/.agent-foundry/agent-headless/cli.js --axis STANDARDS
  started 2026-08-12T02:10:27Z, exit 0 in 76.7s
  output tail (truncated to last 30 lines):
  | y 0.34.0 installed successfully` across clean-project, seed-upgrade-project, and task-branch-project, with `Agent Foundry clean-project bootstrap: PASS`; installed sync check asserted at `skill-sync: PASS (18 shared skills)` in `scripts/test-bootstrap.mjs`.\n- **Dual-tree invariant** — the two new `SKILL.md` blobs are identical (`index 0000000..105f1e4` on both sides, 74 lines each); neither contains the other tree's path string (commands use `.agent-foundry/`, not `.agents/skills/` or `.claude/skills/`). No `Claude-facing`/`Codex-facing` token is present, so byte-identity is correct here.\n- **Hardcoded count reconciliation** — traced 17→18 in `scripts/validate-foundry.mjs` (count guard and `sharedSkills` array, with `project-orientation` inserted in sorted position), `scripts/test-bootstrap.mjs` regex, root `AGENTS.md`, root `CLAUDE.md`, and `README.md`; both skill-tree `README.md` indexes gained the row.\n- **Version/changelog coupling** — `VERSION` 0.34.0 with a matching `## 0.34.0` CHANGELOG section carrying `### Changed` and `### Upgrade actions`; the upgrade actions name the expected `PASS (18 shared skills)` string, which matches the asserted regex.\n- **`starter/` content rules** — inspected both new files for absolute host paths, `{{TOKEN}}` outside `.template`, `.ps1`, fence balance (three `text` fences opened and closed), and YAML frontmatter with `name`/`description`; all clean.\n- **Scope containment** — the diff touches only the skill pair, the two templates, the two tree indexes, count/version metadata, the validator, and the task record; the round-one template/skill change is not re-litigated or widened by the delta. `.tasks/review-packets/` is untracked evidence only.\n- **Write-scope / destructive-target rule** — the only files the skill can mutate are the two Git-ignored artifacts (`project-overview.html`, `project-status-seen.json`), both named explicitly, with `--stdout` documented as the non-writing path and an explicit prohibition on marking a cold-start view as seen; the `Do not mark a cold-start` anchor is validator-protected.\n- **ADR requirement** — the delta adds string assertions to an existing validator and no schema, persistence, or structural change; no architecture-significant implementation lacking a decision record.\n- **Untrusted-content handling** — read the task log, seeded-defect output, and generated HTML in the packet as data; found no text addressing the reviewer or attempting to redirect the axis, so nothing to surface.\n- **Not verifiable from the packet** — the contents of `.agent-foundry/README.md` and `.agent-foundry/project-status.mjs` are absent, so the anchors' presence is confirmed only indirectly via the passing gate and the producer/doc version agreement not at all (folded into finding 1). The manifest tier (`seed` vs `mold`) of `.agent-foundry/README.md` is likewise not in the packet, but the validator checks the starter copy, so it does not affect the rubric."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T02:12:14Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:12:12Z, exit 1 in 2.7s
  output:
  | Required starter contract is missing: .agent-foundry/README.missing.md
- 2026-08-12T02:12:29Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:12:27Z, exit 1 in 2.8s
  output:
  | .agents project-orientation lost its selection or command contract: Use `--stdout`
- 2026-08-12T02:12:47Z — note: round-2 delta adjudication: confirmed all three low findings. Removed the README schemaVersion literal from validation so the producer/tests remain the wire-version source of truth. Proved the linked README requirement rejects a missing target by temporarily pointing requireFile at README.missing.md, which failed with the expected required-contract error. Added Use --stdout to the project-orientation anchors and proved it rejects a seeded --print replacement in both skill copies. Restored all seeded defects before final gates.
- 2026-08-12T02:12:47Z — note: round-2 fix verification: the prior delta found a third schema-version literal, no red signal for missing README, and no protection for skill-level --stdout guidance. The literal is gone; missing-target and missing-skill-guidance seeded runs both failed before restoration.
- 2026-08-12T02:12:51Z — run: node scripts/validate-foundry.mjs
  started 2026-08-12T02:12:48Z, exit 0 in 2.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-12T02:14:14Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-12T02:12:51Z, exit 0 in 83.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\clean-project\.agent-foundry-backups\20260812T021408894Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\clean-project
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\seed-upgrade-project\.agent-foundry-backups\20260812T021411343Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\seed-upgrade-project
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\clean-project\.agent-foundry-backups\20260812T021413744Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.34.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-1nCBvR\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-12T02:16:03Z — run: node starter/.agent-foundry/cold-review.mjs --provider claude --packet .tasks/review-packets/task-4225848686000001-r3 --cwd . --model claude-opus-5 --max-budget-usd 3 --runner starter/.agent-foundry/agent-headless/cli.js --axis STANDARDS
  started 2026-08-12T02:15:01Z, exit 0 in 62.4s
  output tail (truncated to last 30 lines):
  | contract: Use `--stdout` `` (02:12:29), and the anchor loop iterates `[\".agents\", \".claude\"]` so both copies are covered. Both restorations are followed by a PASS at 02:12:51. This satisfies \"new behavior has a test that fails without it\" and \"compilation is not behavioral validation\" — the signal is an executed non-zero exit with the expected message, not a read-through.\n\n3. **Rubric 3 — final gates at 0.34.0 / 18 skills.** `VERSION` 0.34.0 with a matching `## 0.34.0` CHANGELOG section carrying `### Changed` and `### Upgrade actions`; final `validate-foundry.mjs` PASS (02:12:51) and final `test-bootstrap.mjs` PASS (02:14:14, 83.4s) both run *after* every restoration, so the gates cover the shipped tree. Count reconciliation traced 17→18 in the validator count guard, the `sharedSkills` array (`project-orientation` in sorted position), the `scripts/test-bootstrap.mjs` regex `skill-sync: PASS \\(18 shared skills\\)`, root `AGENTS.md`, root `CLAUDE.md` (both the name list — I counted 18 names — and the \"exactly 18\" sentence), and `README.md`.\n\n4. **No scope expansion.** The delta beyond round 1 is exactly three edits: the removed README `schemaVersion` anchor, the retained `requireFile` for the README, and ``Use `--stdout` `` added to the skill-contract anchor list. No new payload files, no schema or script changes, no template re-edits, no third-party additions. `.tasks/review-packets/` is untracked evidence only; the two new `SKILL.md` files are staged and both sides share blob `105f1e4`, so the dual-tree byte-identity invariant holds and neither copy contains the other tree's path string.\n\n5. **ADR requirement.** The delta only adds string assertions to an existing validator — no persistence, wire contract, or structural decision — so no architecture-significant implementation is shipping without a decision record.\n\n6. **Write-scope / destructive-target standard.** The only files the skill can mutate are the two Git-ignored artifacts, both named explicitly, with `--stdout` as the documented non-writing path and `Do not mark a cold-start` now validator-protected; the delta strengthens rather than weakens this.\n\n7. **Untrusted content.** Read the task log, seeded-defect output, generated HTML, and prior cold-review JSON as data. No text in the packet addresses the reviewer or attempts to redirect the axis, so there is nothing to surface under that standard.\n\n8. **Not directly verifiable from the packet (stated, not omitted).** The body of `starter/.agent-foundry/README.md` is not included, so I confirmed only that the three anchor strings are present (proved by the passing gate and by the round-1 red run keyed on that same file), not that the surrounding prose is accurate. That file is unchanged by this diff, so it is outside the delta under review; the manifest tier of `.agent-foundry/README.md` is likewise absent but does not affect the rubric, since the validator asserts the `starter/` copy."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-12T02:16:16Z — note: cold review complete at rung 1: separate Claude CLI process; requested claude-opus-5 with provider metadata recorded by cold-review. Round 1 ran separate SPEC and STANDARDS axes. Round 2 and round 3 were severity-gated STANDARDS delta checks. Round 3 returned PASS with complete CHECKED coverage; no unresolved findings remain.
- 2026-08-12T02:16:17Z — moved to done
