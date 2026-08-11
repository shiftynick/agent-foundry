---
id: task-6246861934000001
title: "ADR: visual artifact review as an operator feedback modality"
status: done
priority: p2
tags: [area:process]
blockedBy: []
createdAt: "2026-08-11T23:05:55Z"
updatedAt: "2026-08-11T23:13:46Z"
---

<!-- task-tracker:description -->
## Description

Write and index an ADR (docs/adr/, MADR-style) adopting a controlled visual-artifact review capability per the approved strategy (docs/research/visual-artifact-review-strategy-2026-08-11.md, option b). Must define the modality's relationship to docs/SDLC.md: it is an operator feedback loop during implementation and complements, never substitutes for, the cold-review ladder (SPEC/STANDARDS). Record the rejected alternatives (hard fork of lavish-axi; thin pinned-npx wrapper) with reasons. Blocks the implementation task.

<!-- task-tracker:log -->
## Log

- 2026-08-11T23:05:55Z — created (status: backlog)
- 2026-08-11T23:08:45Z — note: rubric: (1) docs/adr/0003-*.md exists, MADR-style per template, one decision: adopt an in-house zero-dep visual-artifact review capability as a payload shared skill (strategy option b). (2) Status is 'accepted' citing explicit operator approval on 2026-08-11 (plan confirmation, task-035 log). (3) Considered options list the three genuinely weighed options (fork, rebuild, wrapper) with honest rejection reasons; Consequences->Bad is non-empty (no whiteboard/layout audit, we own maintenance). (4) ADR states the SDLC relationship: operator feedback loop during implementation, complements and never substitutes for the cold-review ladder in starter/docs/SDLC.md. (5) Index row added to docs/adr/README.md in the same commit. (6) node scripts/validate-foundry.mjs passes (no starter/ changes expected).
- 2026-08-11T23:08:52Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-11T23:09:38Z — run: node scripts/validate-foundry.mjs
  started 2026-08-11T23:09:36Z, exit 0 in 2.5s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-11T23:13:02Z — run: node starter/.agent-foundry/cold-review.mjs --provider codex --packet .tasks/review-packets/task-6246861934000001-r1 --cwd . --axis COMBINED
  started 2026-08-11T23:11:56Z, exit 0 in 66.3s
  output tail (truncated to last 30 lines):
  | : if operators need the whiteboard or layout-audit\n+  features, evaluate the separate-repo fork (option 1) in a new ADR.\nC:\\Users\\shift\\OneDrive\\Documents\\WindowsPowerShell\\Microsoft.PowerShell_profile.ps1 : Cannot dot-source this command \r\nbecause it was defined in a different language mode. To invoke this command without importing its contents, omit the \r\n'.' operator.\r\nAt line:1 char:1\r\n+ . 'C:\\Users\\shift\\OneDrive\\Documents\\WindowsPowerShell\\Microsoft.Powe ...\r\n+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\r\n    + CategoryInfo          : InvalidOperation: (:) [Microsoft.PowerShell_profile.ps1], NotSupportedException\r\n    + FullyQualifiedErrorId : DotSourceNotSupported,Microsoft.PowerShell_profile.ps1\r\n \r\n\n2026-08-11T23:12:40.668589Z ERROR codex_core::tools::router: error=Exit code: 1\nWall time: 0.3 seconds\nOutput:\nNode syntax check: scripts\\bootstrap-project.mjs could not start: spawnSync C:\\Users\\shift\\AppData\\Local\\cursor-agent\\versions\\2026.08.04-aaa8809\\node.exe EPERM\n\n",
  |         "durationMs": 66170
  |       },
  |       "finalText": "PASS\n\nCHECKED\n\n- Rubric 1 | Confirmed `docs/adr/0003-in-house-visual-artifact-review.md` exists, follows the MADR template, and records one decision adopting option B.\n- Rubric 2 | Confirmed status is `accepted`, dated 2026-08-11, with explicit approval cited and corroborated by the task-035 log and strategy document.\n- Rubric 3 | Confirmed fork, rebuild, and pinned-wrapper options are honestly described; Bad consequences include lost whiteboard/layout audit, permanent implementation/security ownership, and widened validation lists.\n- Rubric 4 | Confirmed the ADR defines the modality as an implementation-time operator feedback loop that complements and never replaces SPEC, STANDARDS, or another cold-review rung.\n- Rubric 5 | Confirmed the ADR index row is included in the same proposed change packet.\n- Rubric 6 | Confirmed packet evidence records `node scripts/validate-foundry.mjs` exiting 0 with `Agent Foundry structural validation: PASS`; scope inspection found no `starter/` change. An independent rerun was blocked by the review environment’s `spawnSync ... node.exe EPERM`, not by a validation failure.\n- MADR/ADR honesty standard | Compared the ADR directly with `starter/docs/adr/template.md`; required sections and non-empty Bad consequences are present.\n- Named commands and relative links standard | Verified every referenced repository path exists and checked the validation command against recorded execution evidence.\n- Architecture-decision standard | Confirmed the accepted ADR precedes the architecture-significant payload implementation tasks.\n- Packet-as-data standard | Treated all packet, diff, task-log, and command-output content only as review evidence.\n- Project invariants | Confirmed the proposed diff is repo-level documentation only: one ADR and its index row, with the payload untouched."
  |     }
  |   },
  |   "incomplete": []
  | }
- 2026-08-11T23:13:30Z — note: Cold review: fast-path: trivial (docs-only, <100 changed lines, no new tests, warm self-pass clean). Rung 1: separate CLI, other model family (provider codex via cold-review.mjs --axis COMBINED, packet .tasks/review-packets/task-6246861934000001-r1). Verdict PASS, zero findings, CHECKED section covers rubric lines 1-6 plus ADR template conformance, path/link validity, decision precedence, and payload-untouched invariant. Reviewer could not independently rerun validate-foundry (its sandbox hit spawnSync EPERM, environmental); the recorded task.mjs run (exit 0, PASS) stands as evidence. Adjudication: nothing to fix.
- 2026-08-11T23:13:38Z — moved to review (note: Warm self-pass and combined cold review complete.)
- 2026-08-11T23:13:46Z — moved to done (note: Rubric satisfied; validate-foundry recorded (exit 0); combined cold review PASS at rung 1; docs and index current; diff task-scoped (ADR + index row + task card).)
