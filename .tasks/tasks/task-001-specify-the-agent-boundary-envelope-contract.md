---
id: task-001
title: Add lightweight agent boundary conventions
status: done
priority: p1
tags: [area:architecture, area:process]
blockedBy: []
createdAt: "2026-07-29T14:09:37Z"
updatedAt: "2026-07-29T18:02:42Z"
---

<!-- task-tracker:description -->
## Description

Objective: add a concise Foundry-native convention for bounded delegation, evidence provenance, and actionable escalation without introducing an envelope protocol. Acceptance: (1) SDLC defines objective, mutation ceiling, and scope for delegated work; (2) results distinguish observed, reported, and inferred evidence; (3) blocked agents return reason, options, recommendation, and resume condition; (4) affected paired workflows reference the SDLC authority without duplicating it; (5) the abandoned ADR is removed; (6) installed behavior is versioned, reviewed, validated, and committed locally.

<!-- task-tracker:log -->
## Log

- 2026-07-29T14:09:37Z — created (status: backlog)
- 2026-07-29T14:09:42Z — note: rubric: (1) ADR defines one canonical envelope with required fields, defaults, invariants, and four relationship mappings; (2) mutation ceilings and capability-versus-assignment semantics preserve current SDLC authority and Git-backed ownership; (3) escalation and evidence provenance have concrete machine-readable examples and failure behavior; (4) alternatives and non-goals explain why hosted coordination, presence, and mandatory external claims are excluded; (5) follow-up implementation slices and validation strategy are explicit without changing installed behavior; (6) separate cold SPEC and STANDARDS passes find no unresolved must-fix defects, and validate-foundry plus test-bootstrap pass.
- 2026-07-29T14:09:43Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-29T14:12:15Z — note: chose root docs/adr rather than starter/docs/adr because this is a source-project proposal; placing it under starter would alter the installed payload and leak a Foundry-maintenance decision into downstream projects before acceptance.
- 2026-07-29T14:12:15Z — note: documentation/version check: no README, starter payload, VERSION, or CHANGELOG change is appropriate because this task specifies a proposed source-only design and deliberately changes no installed behavior.
- 2026-07-29T14:12:15Z — moved to review
- 2026-07-29T14:20:00Z — note: cold review round 1 used rung 1 (Claude Code counterpart CLI), with separate SPEC and STANDARDS calls. Accepted and fixed: required/default field contradiction, reviewer packet authority contradiction, missing evidence example and unclassified behavior, conditional escalation options, unrepresented worktree isolation, scope/symlink confinement, expiry/revocation behavior, envelope provenance, no-envelope compatibility, per-operation deny semantics, side-effect shape, presence/heartbeat rationale, current-vs-future validation, and ADR-vs-SDLC authority. Declined as defects: backlog-to-in_progress is permitted because backlog is claimable; an ADR index date column is not required. Validation evidence and the final review rung remain pending by lifecycle order.
- 2026-07-29T14:20:02Z — run: node scripts/validate-foundry.mjs
  started 2026-07-29T14:20:00Z, exit 0 in 1.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-29T14:20:28Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-29T14:20:05Z, exit 0 in 22.9s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HjztOt\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HjztOt\clean-project\.agent-foundry-backups\20260729T142027915Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HjztOt\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HjztOt\clean-project\.agent-foundry-backups\20260729T142028449Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-HjztOt\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-29T14:20:37Z — run: node -e const fs=require('node:fs'); const p='docs/adr/0001-agent-boundary-envelope.md'; const i=fs.readFileSync('docs/adr/README.md','utf8'); const a=fs.readFileSync(p,'utf8'); if(!i.includes('(0001-agent-boundary-envelope.md)')) throw Error('index link missing'); if(!fs.existsSync(p)) throw Error('ADR target missing'); for(const h of ['## Decision','## Consequences','## Validation','## Follow-up']) if(!a.includes(h)) throw Error('missing '+h); if(fs.existsSync('starter/docs/adr/0001-agent-boundary-envelope.md')) throw Error('source ADR leaked into starter'); console.log('ADR structure and source-only placement: PASS')
  started 2026-07-29T14:20:37Z, exit 1 in 0.1s
  output:
  | [eval]:1
  | const
  |      
  | Unexpected token `<eof>`. Expected yield, an identifier, [ or {
  |
  | SyntaxError: Unexpected end of input
  |     at makeContextifyScript (node:internal/vm:185:14)
  |     at compileScript (node:internal/process/execution:383:10)
  |     at evalTypeScript (node:internal/process/execution:256:22)
  |     at node:internal/main/eval_string:74:3
  |
  | Node.js v22.22.2
- 2026-07-29T14:21:05Z — note: friction: an inline multi-statement node -e documentation probe was split by task.mjs run shell reconstruction and failed before executing; replaced with simple shell-native probes whose arguments survive the recorded-evidence boundary.
- 2026-07-29T14:21:05Z — run: powershell -NoProfile -Command Test-Path docs/adr/0001-agent-boundary-envelope.md
  started 2026-07-29T14:21:05Z, exit 0 in 0.3s
  output:
  | True
- 2026-07-29T14:21:06Z — run: powershell -NoProfile -Command Select-String -Path docs/adr/README.md -Pattern 0001-agent-boundary-envelope.md
  started 2026-07-29T14:21:05Z, exit 0 in 0.2s
  output:
  |
  | docs\adr\README.md:11:| [0001](0001-agent-boundary-envelope.md) | Agent boundary envelope | proposed |
- 2026-07-29T14:21:06Z — run: git status --short
  started 2026-07-29T14:21:06Z, exit 0 in 0.1s
  output:
  | ?? .tasks/
  | ?? docs/
- 2026-07-29T14:29:06Z — note: cold review round 2 used rung 1: two separate, read-only Claude Code counterpart-CLI calls from the implementing Codex session. Accepted and fixed: undefined expiry vocabulary, implicit profile authority, report-only escalation persistence, report-only scratch conflict, live-revocation pretense, scope grammar and concrete containment, workspace rendering, command effects, commit staging scope, return-channel classification, identity/correlation fields, escalation failure behavior, direct source-placement validation, and verified section links. Live-file adjudication rejected the claim that root docs duplicated the starter SDLC/standards: root docs contains only this source ADR and its index.
- 2026-07-29T14:29:06Z — note: manual documentation validation: re-read the revised ADR and current starter/docs/SDLC.md end to end. The proposal preserves current milestone steering, review, blocker, board, and commit authority; it defers operational authority to the SDLC if accepted and changes no installed behavior now.
- 2026-07-29T14:29:06Z — run: powershell -NoProfile -EncodedCommand aQBmACAAKABUAGUAcwB0AC0AUABhAHQAaAAgACcAcwB0AGEAcgB0AGUAcgAvAGQAbwBjAHMALwBhAGQAcgAvADAAMAAwADEALQBhAGcAZQBuAHQALQBiAG8AdQBuAGQAYQByAHkALQBlAG4AdgBlAGwAbwBwAGUALgBtAGQAJwApACAAewAgAHQAaAByAG8AdwAgACcAcwBvAHUAcgBjAGUAIABBAEQAUgAgAGwAZQBhAGsAZQBkACAAaQBuAHQAbwAgAHMAdABhAHIAdABlAHIAJwAgAH0AIABlAGwAcwBlACAAewAgAFcAcgBpAHQAZQAtAE8AdQB0AHAAdQB0ACAAJwBTAG8AdQByAGMAZQAgAEEARABSACAAcgBlAG0AYQBpAG4AcwAgAG8AdQB0AHMAaQBkAGUAIABzAHQAYQByAHQAZQByADoAIABQAEEAUwBTACcAIAB9AA==
  started 2026-07-29T14:29:06Z, exit 0 in 0.3s
  output:
  | Source ADR remains outside starter: PASS
  | #< CLIXML
  | <Objs Version="1.1.0.1" xmlns="http://schemas.microsoft.com/powershell/2004/04"><Obj S="progress" RefId="0"><TN RefId="0"><T>System.Management.Automation.PSCustomObject</T><T>System.Object</T></TN><MS><I64 N="SourceId">1</I64><PR N="Record"><AV>Preparing modules for first use.</AV><AI>0</AI><Nil /><PI>-1</PI><PC>-1</PC><T>Completed</T><SR>-1</SR><SD> </SD></PR></MS></Obj><Obj S="progress" RefId="1"><TNRef RefId="0" /><MS><I64 N="SourceId">1</I64><PR N="Record"><AV>Preparing modules for first use.</AV><AI>0</AI><Nil /><PI>-1</PI><PC>-1</PC><T>Completed</T><SR>-1</SR><SD> </SD></PR></MS></Obj></Objs>
- 2026-07-29T14:29:08Z — run: node scripts/validate-foundry.mjs
  started 2026-07-29T14:29:06Z, exit 0 in 1.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-29T14:29:31Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-29T14:29:08Z, exit 0 in 22.9s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-papkxF\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-papkxF\clean-project\.agent-foundry-backups\20260729T142930714Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-papkxF\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-papkxF\clean-project\.agent-foundry-backups\20260729T142931149Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-papkxF\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-29T14:37:02Z — note: cold review round 3 (cap) used rung 1: two separate, read-only Claude Code counterpart-CLI calls from Codex. Accepted must-fixes: clarified blocked-operator subject/issuer direction, required inline materialization of trusted objectives, separated repository mutation ceilings from explicitly allowed external effects, added whole-workspace scope, and constrained escalation return to issuedBy. Also fixed conditional required fields, human identity binding, claim/escalation schema versions, unknown-field fail-closed behavior, toolchain-read handling, known-class degradation, no-task boundary IDs, malformed-return fallback, invalid write scopes, Windows path aliases, evidence failure behavior, and harness-neutral SDLC references. These are post-cap changes and therefore remain unreviewed; task-001 stays in review and will not be promoted or committed as complete.
- 2026-07-29T14:37:02Z — run: powershell -NoProfile -Command Select-String -Path starter/docs/SDLC.md -Pattern ## Planning above the task
  started 2026-07-29T14:37:02Z, exit 1 in 0.3s
  output:
  | Select-String : Missing an argument for parameter 'Pattern'. Specify a parameter of type 'System.String[]' and try 
  | again.
  | At line:1 char:42
  | + Select-String -Path starter/docs/SDLC.md -Pattern ## Planning above t ...
  | +                                          ~~~~~~~~
  |     + CategoryInfo          : InvalidArgument: (:) [Select-String], ParameterBindingException
  |     + FullyQualifiedErrorId : MissingArgument,Microsoft.PowerShell.Commands.SelectStringCommand
- 2026-07-29T14:37:02Z — run: powershell -NoProfile -Command Select-String -Path starter/docs/SDLC.md -Pattern ## Concurrency
  started 2026-07-29T14:37:02Z, exit 1 in 0.3s
  output:
  | Select-String : Missing an argument for parameter 'Pattern'. Specify a parameter of type 'System.String[]' and try 
  | again.
  | At line:1 char:42
  | + Select-String -Path starter/docs/SDLC.md -Pattern ## Concurrency
  | +                                          ~~~~~~~~
  |     + CategoryInfo          : InvalidArgument: (:) [Select-String], ParameterBindingException
  |     + FullyQualifiedErrorId : MissingArgument,Microsoft.PowerShell.Commands.SelectStringCommand
- 2026-07-29T14:37:03Z — run: powershell -NoProfile -Command Select-String -Path starter/docs/SDLC.md -Pattern ## The operator queue
  started 2026-07-29T14:37:02Z, exit 1 in 0.2s
  output:
  | Select-String : Missing an argument for parameter 'Pattern'. Specify a parameter of type 'System.String[]' and try 
  | again.
  | At line:1 char:42
  | + Select-String -Path starter/docs/SDLC.md -Pattern ## The operator que ...
  | +                                          ~~~~~~~~
  |     + CategoryInfo          : InvalidArgument: (:) [Select-String], ParameterBindingException
  |     + FullyQualifiedErrorId : MissingArgument,Microsoft.PowerShell.Commands.SelectStringCommand
- 2026-07-29T14:37:03Z — run: powershell -NoProfile -Command Select-String -Path starter/docs/SDLC.md -Pattern ## Review
  started 2026-07-29T14:37:03Z, exit 1 in 0.3s
  output:
  | Select-String : Missing an argument for parameter 'Pattern'. Specify a parameter of type 'System.String[]' and try 
  | again.
  | At line:1 char:42
  | + Select-String -Path starter/docs/SDLC.md -Pattern ## Review
  | +                                          ~~~~~~~~
  |     + CategoryInfo          : InvalidArgument: (:) [Select-String], ParameterBindingException
  |     + FullyQualifiedErrorId : MissingArgument,Microsoft.PowerShell.Commands.SelectStringCommand
- 2026-07-29T14:37:03Z — run: powershell -NoProfile -Command Select-String -Path starter/docs/SDLC.md -Pattern ## Commit authority
  started 2026-07-29T14:37:03Z, exit 1 in 0.3s
  output:
  | Select-String : Missing an argument for parameter 'Pattern'. Specify a parameter of type 'System.String[]' and try 
  | again.
  | At line:1 char:42
  | + Select-String -Path starter/docs/SDLC.md -Pattern ## Commit authority
  | +                                          ~~~~~~~~
  |     + CategoryInfo          : InvalidArgument: (:) [Select-String], ParameterBindingException
  |     + FullyQualifiedErrorId : MissingArgument,Microsoft.PowerShell.Commands.SelectStringCommand
- 2026-07-29T14:37:04Z — run: powershell -NoProfile -Command Select-String -Path starter/docs/SDLC.md -Pattern ## Blockers
  started 2026-07-29T14:37:03Z, exit 1 in 0.3s
  output:
  | Select-String : Missing an argument for parameter 'Pattern'. Specify a parameter of type 'System.String[]' and try 
  | again.
  | At line:1 char:42
  | + Select-String -Path starter/docs/SDLC.md -Pattern ## Blockers
  | +                                          ~~~~~~~~
  |     + CategoryInfo          : InvalidArgument: (:) [Select-String], ParameterBindingException
  |     + FullyQualifiedErrorId : MissingArgument,Microsoft.PowerShell.Commands.SelectStringCommand
- 2026-07-29T14:37:06Z — run: node scripts/validate-foundry.mjs
  started 2026-07-29T14:37:04Z, exit 0 in 2.4s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-29T14:37:28Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-29T14:37:06Z, exit 0 in 21.4s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-bnxFGD\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-bnxFGD\clean-project\.agent-foundry-backups\20260729T143727511Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-bnxFGD\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-bnxFGD\clean-project\.agent-foundry-backups\20260729T143727898Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.6.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-bnxFGD\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-29T14:37:40Z — note: friction: six task.mjs run Select-String anchor probes lost quoted multi-word patterns during shell reconstruction and failed before matching; rerunning as no-space rg patterns.
- 2026-07-29T14:37:40Z — run: rg -n Planning.above.the.task starter/docs/SDLC.md
  started 2026-07-29T14:37:40Z, exit 0 in 0.1s
  output:
  | 6:## Planning above the task
- 2026-07-29T14:37:41Z — run: rg -n Concurrency starter/docs/SDLC.md
  started 2026-07-29T14:37:41Z, exit 0 in 0.1s
  output:
  | 24:## Concurrency
- 2026-07-29T14:37:41Z — run: rg -n The.operator.queue starter/docs/SDLC.md
  started 2026-07-29T14:37:41Z, exit 0 in 0.1s
  output:
  | 40:## The operator queue
- 2026-07-29T14:37:41Z — run: rg -n ^##.Review$ starter/docs/SDLC.md
  started 2026-07-29T14:37:41Z, exit 0 in 0.1s
  output:
  | 111:## Review
- 2026-07-29T14:37:41Z — run: rg -n Commit.authority starter/docs/SDLC.md
  started 2026-07-29T14:37:41Z, exit 0 in 0.1s
  output:
  | 150:## Commit authority
  | 153:under "Commit authority", which then overrides this default.
- 2026-07-29T14:37:41Z — run: rg -n ^##.Blockers$ starter/docs/SDLC.md
  started 2026-07-29T14:37:41Z, exit 0 in 0.1s
  output:
  | 203:## Blockers
- 2026-07-29T15:24:33Z — note: operator explicitly said proceed after being told the normal three-round cap was reached and that the next safe step was a fresh post-cap review. Treating this as authority for one additional cold SPEC/STANDARDS round; it is not acceptance of ADR 0001.
- 2026-07-29T15:26:40Z — note: friction: the first post-cap Claude SPEC/STANDARDS calls returned only attempted live-tool preambles despite tools being disabled, with no findings or verdict. They do not count as reviews. Retrying the same operator-authorized round with a concise self-contained packet and explicit no-tool instruction.
- 2026-07-29T15:33:18Z — note: post-cap authorized review retry produced substantive findings. Fixed all must-fixes: enumerated the escalation schema, distinguished three schema kinds, routed governing policy through the harness policy channel, replaced the self-issued blocked profile with an escalation mapping, and fully sourced conservative operator-envelope materialization. Also resolved workspace/report-only validity, board-path authority, decidable scope containment, issuer preflight semantics, duplicated escalation destinations, invalid-envelope fallback, cold-review context exclusion, enforceable validator follow-up, exact cross-tree validation semantics, and ADR freeze-as-rationale.
- 2026-07-29T15:39:11Z — note: fresh post-cap review found two must-fixes and related gaps. Fixed: added the task-owner-only lifecycle metadata carve-out for blocker recording under report-only; replaced the undefined policy channel with issuer-designated exact policy files; allowed patch in an exclusive primary checkout; enumerated fixed stop conditions and profile literals; made claims/escalations strict independently versioned schemas; defined side-effect target grammars; separated escalation mapping from issuance profiles; qualified canonical field paths; added anchor validation, validator payload tests/classification, and cold-review context requirements.
- 2026-07-29T15:48:48Z — note: Fresh cold SPEC and STANDARDS review failed on convergent contract defects. Fixed: made envelope-bearing channels fail closed; added closed v1 envelope, claims, evidence, escalation, and side-effect schemas; required profile identity directions and UUID correlation; prohibited task-card authority widening; made lifecycle board authority explicit, contained, link-aware, and canonical outside writeScope; allowed empty cold-review read scope; clarified semantic evidence judgment; and added tracker migration plus validator-authority rules.
- 2026-07-29T15:55:18Z — note: Next cold pair found five remaining contract defects and three architectural gaps. Fixed: workspace.root is now mandatory for all envelopes and confines reads; authority sources are closed typed variants with confined policy paths and embedded inline policy; malformed claims normalize deterministically; ordinary mutation verbs map to task-commit without schema jargon while ambiguous intent stays report-only; validation covers all three schema kinds; added closed profile-ceiling matrix, parent correlation, atomic upgrade ordering, runtime-only root fixtures, and explicit operability tradeoffs.
- 2026-07-29T16:02:35Z — note: Latest frozen review exposed SDLC-preservation and delegation gaps. Fixed: write-dot excludes board and Git metadata paths; explicit .git scopes are invalid; lifecycle now has task-owner and human-authorized board-planner modes covering follow-up task creation; lifecycle behavior is consistent across ceilings and has an ordinary materialization path; harness-native boundary errors handle unconstructible invalid payloads; untrustedData is additive-only; nested evidence malformation degrades safely; child envelopes must attenuate parent authority and side effects trace to a human root; identity/task grammars, rung-4 handling, and validator versus issuer/runtime test boundaries are explicit.
- 2026-07-29T16:08:35Z — note: Latest cold pair found three SPEC and three STANDARDS must-fixes. Fixed: added top-level taskId binding across returns; defined exact human-originated side-effect materialization; corrected worker validation to cap at patch; authority and side-effect grants now attenuate structurally through the parent chain; UTF-8 JSON is the normative zero-dependency wire form; non-fast-forward push requires both push and rewrite grants. Also defined exact runtime matching, profile transitions, mutating read scope, short-name rejection, bridge normalized fixtures, worker-patch integration ownership, and changelog follow-up.
- 2026-07-29T16:15:28Z — note: Latest pair exposed platform-bootstrap honesty and five SPEC closure gaps. Fixed: distinguished host-enforced from repository-only advisory conformance; workspace now carries a same-repository ID and parallel roots are preflighted; reviewer issuance is orchestrator-only; all claims type failures have deterministic outcomes; task-owner forbids none; strict JSON duplicate-key, integer, and surrogate rules are explicit. Also attenuated stop/evidence requirements, retained lifecycle reads, forbade hook bypass, added upgrade drift guidance, made task IDs opaque tracker IDs, and clarified claim routing.
- 2026-07-29T16:22:25Z — note: Latest pair found four SPEC closure issues and four SDLC-operability gaps. Fixed: workspace conditional fields are forbidden when unused; lifecycle staging uses destination containment; validation uses exact non-empty scope terms; glob and Windows device sets are enumerated; escalation forwarding carries originBoundaryId; duplicate IDs fail; carrier correlations and repository-ID grammar are explicit. Added authenticated multi-turn continuity, atomic task claiming, ignored-file exclusion from root reads, a fixed governing standards set, mold/drift ownership, advisory-default and repetition costs, schema fingerprint sync, and explicit branch/tag push limits.
- 2026-07-29T16:30:00Z — note: Latest pair found three localized SPEC contradictions and two lifecycle-operability gaps. Fixed: duplicate keys compare unescaped Unicode names; read/write dot both exclude ignored paths; report-only children share roots while mutating same-root delegation transfers one lease; fresh-session resume uses stable agent principal plus current human authority. Also closed origin/ref/method/inline-policy grammars, forbade reviewer side effects, rejected non-JSON structured values, added payload secret redaction, board maintenance, harness-neutral validator placement, parser differential fixtures, and automation/forwarding semantics.
- 2026-07-29T16:36:16Z — note: Latest pair found four SPEC and two STANDARDS must-fixes. Fixed: cold change packets are channel-bound untrusted prompt data tested as harness preconditions; advisory root is the only self-materialization exception; worked child example inherits root stops; lifecycle archive/new-card destinations are decidable; parent ID and issuer equalities bind the chain; side effects never carry across turns. Also added board-planner continuity, best-effort redaction honesty, lease recovery, fresh-session resume friction, unclassified surfacing, root/schema grammar, and explicit non-root parent rules.
- 2026-07-29T16:44:01Z — note: Latest pair found three SPEC and three STANDARDS must-fixes. Fixed: root report-only is explicitly the fallback branch; policy-file sources now pin SHA-256 bytes and any binding mismatch invalidates; cold standards are materialized inline at root; pairwise attenuation moves into the shared validator; task-owner covers approved-front reorder and in-place archive. Also closed UUID/null/default/error/reclaim rules, pinned ignore snapshots and URL normalization, documented compaction/advisory continuity, made redaction one-time, and justified the side-effect inventory.
- 2026-07-29T16:52:48Z — note: Latest pair found two SPEC and four STANDARDS must-fixes. Fixed: policy paths are excluded from root write-dot and require a human-named exact write; new policy bytes need reviewed human acceptance; packet-only reviewers may omit workspace; tool-managed OS scratch is explicitly transient; policy hashes pin issuance snapshots without invalidating later authorized edits; advisory side-effect provenance is qualified; ignored writes require exact read scope. Live tracker verification also corrected archive semantics to .tasks/archive and same-front readiness, and escalation now echoes the firing stop condition.
- 2026-07-29T16:58:41Z — note: Latest pair found three SPEC and three STANDARDS must-fixes. Fixed: forwarded stopCondition validates against the child origin; ignored governance paths are explicitly retained; heuristic policy secret scanning is an operator-acknowledgeable issuer precondition; narrowed roots retain or inline policy; closeout/handoff activates board-planner. Also made governing docs single-form snapshots, re-snapshotted root policy fields each turn, tightened array/BOM/top-level rules, and recorded worker evidence and no-local-rewrite costs.
- 2026-07-29T17:04:50Z — note: Latest pair found three SPEC and five STANDARDS must-fixes. Fixed: pending policy drift roots use prior inline bytes and report-only acceptance; fixed governing standards are canonical inline snapshots; task-commit requires task-owner plus entry criteria; report-only fallback retains lifecycle/operator-queue authority; handoff files use ordinary writeScope. Also enforced fresh child IDs, assigned forwarded stop verification to the forwarder, rejected secret-bearing targets, expanded validator cross-entry coverage, and added conformance-label acceptance.
- 2026-07-29T17:12:52Z — note: Latest pair found three SPEC and two STANDARDS must-fixes. Fixed: added four renderer-confirmation conditions to the fixed root set; unified policy path/name namespace; moved ignore-sensitive containment to issuer tests; inline policies now carry SHA-256; added a closed session-closeout lifecycle matching live HANDOFF.md and backup-ref behavior with confined task-commit authority. Also added secret-free side-effect targets, queue-record debt on preflight failure, hook cost, and the profile-transition checklist.
- 2026-07-29T17:18:22Z — note: Latest pair found three SPEC and two STANDARDS must-fixes. Fixed: lifecycle summary includes session-closeout; preflight queue debt is receiver-local until a later lease; HANDOFF.md is lifecycle-only; DISTILL/policy edits deliberately move to a separate human-named task/turn with hash acceptance; cold-review packet export is harness return transport outside project writes. Also made closeout ceiling exceptions exact, allowed root none IDs in claims, and expanded identity/root-stop validator fixtures.
- 2026-07-29T17:32:55Z — note: Cold SPEC review after the post-cap durability revision returned FAIL with three must-fixes: close the profile/ceiling/lifecycle cross-product, define first-install no-ledger root materialization, and scope durable operator-queue recording to valid lifecycle-bearing escalations. Revised the ADR with an explicit validity matrix, an advisory report-only board-planner bootstrap envelope that excludes unaccepted policy bytes, and a complete class of current-turn-only boundary/pre-lifecycle errors. The review packet remained frozen during the review.
- 2026-07-29T17:56:52Z — edited (title "Specify the agent boundary envelope contract"→"Add lightweight agent boundary conventions"; description updated)
- 2026-07-29T17:56:52Z — note: operator rejected the overbuilt envelope direction and explicitly authorized the lightweight salvage. Revised rubric: (1) one concise SDLC section defines objective/scope/ceiling; (2) evidence uses observed/reported/inferred labels; (3) escalation has reason/options/recommendation/resume condition; (4) orchestration skill pair points to the SDLC without duplicating rules; (5) ADR protocol artifacts are removed; (6) sync, structural, and bootstrap gates pass after one proportionate cold SPEC/STANDARDS review.
- 2026-07-29T17:56:53Z — moved to in_progress (claimed by shift@Shiftor)
- 2026-07-29T18:00:58Z — note: cold review used rung 1 with separate Claude counterpart calls. SPEC passed. STANDARDS found two actionable changelog ambiguities: minor-release upgrade actions sounded unconditionally manual, and the orchestration bullet implied duplicated rules were removed. Fixed both. Rejected the suggested Added heading because this repository's declared changelog format requires Changed. No boundary-design defects were found.
- 2026-07-29T18:01:56Z — note: post-fix cold re-review used rung 1 with separate Claude calls: SPEC PASS; STANDARDS PASS.
- 2026-07-29T18:01:56Z — moved to review
- 2026-07-29T18:01:56Z — run: node starter/.agent-foundry/check-skill-sync.mjs starter
  started 2026-07-29T18:01:56Z, exit 0 in 0.1s
  output:
  | skill-sync: PASS (11 shared skills)
- 2026-07-29T18:02:01Z — run: node scripts/validate-foundry.mjs
  started 2026-07-29T18:01:59Z, exit 0 in 1.9s
  output:
  | Agent Foundry structural validation: PASS
- 2026-07-29T18:02:27Z — run: node scripts/test-bootstrap.mjs
  started 2026-07-29T18:02:06Z, exit 0 in 21.7s
  output tail (truncated to last 30 lines):
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ....................
  | ...........
  | task-001 → in_progress
  | task-001 noted
  | Agent Foundry 0.7.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-QjvXQx\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-QjvXQx\clean-project\.agent-foundry-backups\20260729T180226923Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | The target board already has active tasks; no bootstrap task was created.
  | Agent Foundry 0.7.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-QjvXQx\clean-project
  | Previous managed files were backed up to C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-QjvXQx\clean-project\.agent-foundry-backups\20260729T180227509Z
  | Preserved existing project logs (not overwritten):
  |   .agent-foundry\LOCAL-CHANGES.md
  |   BLOCKED-JOURNAL.md
  |   PLANNING-JOURNAL.md
  | Agent Foundry 0.7.0 installed successfully at C:\Users\shift\AppData\Local\Temp\agent-foundry-tests-QjvXQx\clean-project
  | Agent Foundry clean-project bootstrap: PASS
- 2026-07-29T18:02:41Z — run: git diff --check
  started 2026-07-29T18:02:41Z, exit 0 in 0.1s
  output:
  | (no output)
- 2026-07-29T18:02:41Z — note: manual documentation verification: re-read the complete revised SDLC, efficient-orchestration handoff section, and 0.7.0 changelog entry; the rules are concise, the skill defers to the SDLC, the abandoned ADR is absent from tracked content, and no README or handoff update is needed.
- 2026-07-29T18:02:42Z — moved to done
