---
id: task-048
title: Put P4 fix-verification on the cold-review session checklist
status: backlog
priority: p1
tags: [area:process, phase:audit, source:nightly-audit]
blockedBy: []
createdAt: "2026-08-11T16:51:34Z"
updatedAt: "2026-08-11T16:51:34Z"
---

<!-- task-tracker:description -->
## Description

Nightly audits 2026-08-08, 08-09, and 08-10 all show the preventable trio (packet-defect / evidence-gap / fix-defect) still firing after 0.25.0 shipped P1-P4 (task-032). Aug 10 is the third report; extra review rounds were almost all fix-defect (ai4c 744/752 = 8; interra 052/099 = 9). P4 already lives in execute-task/references/cold-review.md (verify each prior-round fix against the tree; treat fixes as new code and give each the failing-test check). execute-task then lets later reviews in the same session follow the session checklist, whose item 5 says only 'Adjudicate; severity-gate re-review; cap at 3' and does not restate the failing-test check. Both 2026-08-10 product days were attack-the-board sessions on that path. Change: put P4 on the session checklist (both trees) so re-rounds actually run it. Do not add a parallel reminder in SKILL.md. Prefer a checkable gate (packet or note that names the failing-test/mutation check for each fix) over more prose. VERSION+CHANGELOG if installed behavior changes. Citations: docs/research/run-audits/2026-08-08.md, 2026-08-09.md, 2026-08-10.md.

<!-- task-tracker:log -->
## Log

- 2026-08-11T16:51:34Z — created (status: backlog)
