---
id: task-012
title: Add battle-tested per-axis prompt template to cold-review.md
status: done
priority: p2
tags: [area:process]
blockedBy: []
createdAt: "2026-08-01T16:47:49Z"
updatedAt: "2026-08-01T17:00:56Z"
---

<!-- task-tracker:description -->
## Description

Graft the ai4c-proven review prompt shape into starter execute-task cold-review.md (both trees): structured finding format (location | rubric/standard | concrete failure | confidence) and a mandatory CHECKED section so an empty findings list is only a pass when coverage is demonstrated. Adapted to the two-independent-calls contract. Origin: ai4c pre-Foundry execute-task, dozens of reviews.

<!-- task-tracker:log -->
## Log

- 2026-08-01T16:47:49Z — created (status: backlog)
- 2026-08-01T16:47:57Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-01T16:47:57Z — note: rubric: 1) template section present and identical in both starter tree copies 2) template is per-axis (never both axes in one call), consistent with SDLC two-call contract 3) CHECKED-section semantics stated (thin CHECKED = not a pass) 4) VERSION bumped minor + CHANGELOG entry with concrete upgrade actions incl. locally-modified case 5) validate-foundry + test-bootstrap pass 6) cold SPEC+STANDARDS review from other model family logged
- 2026-08-01T16:55:05Z — run: node scripts/validate-foundry.mjs
  started 2026-08-01T16:55:03Z, exit 0 in 2.1s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-01T16:59:01Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-01T16:58:31Z, exit 0 in 30.5s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.11.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\clean-project\.agent-foundry-backups\20260801T165859028Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.11.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\clean-project
  | Agent Foundry 0.11.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\seed-upgrade-project\.agent-foundry-backups\20260801T165900416Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.11.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\clean-project\.agent-foundry-backups\20260801T165901491Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.11.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-FOPM7W\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-01T16:59:02Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-01T16:59:02Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (12 shared skills)
- 2026-08-01T17:00:55Z — note: cold review: 3 rounds via codex exec (highest rung: cross-model CLI). R1 STANDARDS found SDLC contradiction, missing severity, provenance leakage, project naming in CHANGELOG, incomplete packet — all fixed (SDLC now requires CHECKED attestation; template adopts full SDLC schema; neutral wording). R2 SPEC PASS; R2 STANDARDS 2 findings fixed (durable evidence, authority sentence). R3 STANDARDS PASS full CHECKED. R3 SPEC not repeated: delta was one authority sentence + evidence recording, no objective-facing change; SPEC R2 passed on identical template content.
- 2026-08-01T17:00:55Z — moved to review
- 2026-08-01T17:00:56Z — moved to done
