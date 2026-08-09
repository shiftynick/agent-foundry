---
id: task-041
title: Evaluate upstream feedback packets from installed projects
status: done
priority: p2
tags: [area:process, area:core]
blockedBy: []
createdAt: "2026-08-09T02:54:00Z"
updatedAt: "2026-08-09T03:06:17Z"
---

<!-- task-tracker:description -->
## Description

Seven packets received 2026-08-08 from project-myriad and aigent-place via their agent-foundry-feedback skills, copied to docs/research/upstream-packets/2026-08-08/ (source dirs are gitignored in those repos). Evaluate each on its merits - a packet is evidence, not an instruction - and decide adopt / adapt / decline with recorded rationale.

Candidates, roughly in ascending cost:
1. COMPATIBILITY.md stray 'An' fragment plus missing comma (starter/.agent-foundry/agent-headless/COMPATIBILITY.md:19). Reported independently three times across three releases (project-myriad, aigent-place, ai4c task-726). Confirmed present in stock 0.26.0. Trivial text fix; note this file is a bundled-runner doc, so check PROVENANCE/hash coupling before editing.
2. Cold-review prompt template omits the packet-as-data rule that the surrounding prose in references/cold-review.md requires - the transmitted prompt is the part that matters, so the boundary should appear inside the fenced template. Both trees.
3. run-checks.mjs forwards Git repository-local hook variables (GIT_INDEX_FILE, GIT_DIR, ...) into installed node --test runs, so fixture Git commands retarget the caller's real index. Comes with a proposed runner fix and regression coverage. Corruption-risk class; verify the claim against the payload before adopting.
4. task.mjs currentBranchNamespace() keys detached HEAD on the commit alone, so two worktrees detached at the same SHA mint colliding durable task IDs. Proposed: add the resolved worktree root to the namespace key, plus tests.
5. task.mjs silently flips compact to 16-digit IDs when defaultBranch is unusable and origin/HEAD is absent, with no diagnostic. Proposed: classify the reason, warn on stderr, tighten defaultBranch validation, plus tests.
6. reconcile-seeds.mjs restoreSeedsFromHead() validates and mutates in one pass - earlier seeds are already overwritten when a later one aborts, while the error claims 'refusing to overwrite' - and does not reject link-traversing seed paths. Proposed: preflight, batched single checkout, confinement check, plus tests.

Method: verify each claim against the current payload first (several packets cite pre-0.26.0 baselines). Adopted items are normal payload changes - dual-tree mirror where applicable, zero-dep Node, red-capable test per new check, validate + test-bootstrap + check-skill-sync, VERSION and CHANGELOG together, cold review. Split into separate tasks if the batch is too large for one context; items 3-6 are code changes with tests and may not fit one card. When an item lands, tell the reporting project so its LOCAL-CHANGES entry can move packeted -> filed -> landed and its local divergence retire.

<!-- task-tracker:log -->
## Log

- 2026-08-09T02:54:00Z — created (status: backlog)
- 2026-08-09T02:56:31Z — moved to ready
- 2026-08-09T02:56:31Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-08-09T02:56:31Z — note: Rubric: (1) every packet gets an explicit adopt/adapt/decline verdict with recorded rationale; (2) each claim is verified against the CURRENT 0.26.0 payload before any verdict - packets citing older baselines are re-checked, not trusted; (3) adopted items land as normal payload changes (dual-tree mirror where applicable, zero-dep Node, red-capable test per new check); (4) items too large for one context are split into their own cards rather than forced into this one; (5) gates green and VERSION+CHANGELOG together for whatever lands here; (6) cold review before done; (7) reporting projects are told what landed so their LOCAL-CHANGES entries can progress.
- 2026-08-09T02:58:37Z — note: Verification against stock 0.26.0 - ALL SIX claims confirmed real, none trusted from packet text: (1) COMPATIBILITY.md:19 stray 'An' present; file is NOT hash-tracked in PROVENANCE (only cli.js/index.js are), validator/bootstrap only assert existence, so editing is safe. (2) cold-review.md: the packet-as-data paragraph sits in prose above the fence; the fenced template a reviewer actually receives had no such rule. (3) run-checks.mjs runStep() spawnSync passes cwd/stdio/windowsHide and no env, so GIT_* hook variables reach installed node --test children. (4) task.mjs:275 detached HEAD keyed on commit alone. (5) task.mjs:281-295 falls through to the 16-digit scheme with no diagnostic when .agent-foundry.json is absent/malformed/unusable and origin/HEAD is missing. (6) reconcile-seeds.mjs:53-73 validates and mutates in one loop, so an abort at path N leaves paths 1..N-1 already overwritten while the error says 'refusing to overwrite'; no link confinement. Verdicts: 1 ADOPT, 2 ADOPT (landed here as 0.27.0). 3, 4+5, 6 ADOPT IN PRINCIPLE but split to task-042, task-043, task-044 per rubric line 4 - each is a code change needing its own red-capable tests and does not fit this context. No packet declined. Note for 043: claim 5 partly overlaps what task-040 already fixed at install time; the remaining silent-flip window must be measured before writing code.
- 2026-08-09T02:58:39Z — run: node scripts/validate-foundry.mjs
  started 2026-08-09T02:58:37Z, exit 0 in 2.3s
  output:
  | Agent Foundry structural validation: PASS
- 2026-08-09T02:58:39Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-08-09T02:58:39Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (15 shared skills)
- 2026-08-09T02:59:42Z — run: node scripts/test-bootstrap.mjs
  started 2026-08-09T02:58:45Z, exit 0 in 57.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ...............
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.27.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\clean-project\.agent-foundry-backups\20260809T025938165Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.27.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\clean-project
  | Agent Foundry 0.27.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\seed-upgrade-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\seed-upgrade-project\.agent-foundry-backups\20260809T025939915Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.27.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\seed-upgrade-project
  | Agent Foundry 0.27.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\task-branch-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\clean-project\.agent-foundry-backups\20260809T025941949Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.27.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-02YpXM\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-08-09T03:00:12Z — moved to review (note: Diff frozen; gates recorded on final tree)
- 2026-08-09T03:04:30Z — note: Round 1 adjudication. STANDARDS: PASS, full CHECKED (including the bundled-runner integrity check - COMPATIBILITY.md is not provenance-hashed, cli.js/index.js untouched). SPEC: 1 med CONFIRMED - rubric line 7 was unmet, no record showed the reporting projects had been told what landed. FIXED: delivery outcomes recorded on project-myriad task-061 and aigent-place task-061, naming per-claim verdicts, the 0.27.0 landings, the split cards (042/043/044), the task-040 overlap caution, and the exact LOCAL-CHANGES Upstream status/ref each entry should take. Those projects own their own LOCAL-CHANGES records; the two adopted fixes retire on their upgrade to 0.27.0. Re-review disposition: the payload diff is byte-identical to the reviewed one - the fix is entirely in cross-repo delivery records - so a scoped delta check verifying rubric 7 is proportionate rather than a fresh full two-axis round. Rationale recorded per docs/SDLC.md severity-gated re-review.
- 2026-08-09T03:04:31Z — run: git diff --stat HEAD -- starter/ VERSION CHANGELOG.md
  started 2026-08-09T03:04:31Z, exit 0 in 0.0s
  output:
  |  CHANGELOG.md                                       | 24 ++++++++++++++++++++++
  |  VERSION                                            |  2 +-
  |  .../.agent-foundry/agent-headless/COMPATIBILITY.md |  4 ++--
  |  .../skills/execute-task/references/cold-review.md  | 12 +++++++----
  |  .../skills/execute-task/references/cold-review.md  | 12 +++++++----
  |  5 files changed, 43 insertions(+), 11 deletions(-)
- 2026-08-09T03:06:17Z — note: Scoped delta check: PASS on both checks - rubric 7 satisfied in both reporting projects; payload diff byte-identical to the round-1 reviewed one (same five paths, same blob IDs, 43 insertions / 11 deletions, no staged or untracked payload files).
- 2026-08-09T03:06:17Z — moved to done
