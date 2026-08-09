# Adversarial review findings audit — run 001 (task-031)

Window: 2026-08-05 → 2026-08-08 (post-upgrade cohort). Repos: ai4c,
interra-api-proxy, project-myriad — three repos of one operator. Corpus: the
same discovery manifest as session-audit run planning (16 parent sessions, 35
subagent transcripts, ~53 MB) plus the three repos' `.tasks/` logs, which carry
every adjudication verbatim. Extraction was performed by three parallel
read-only subagents (one per repo), each finding cited to a task-log line or a
transcript line offset; no transcript content is reproduced here. The
extraction detail (per-finding JSON with citations) is written to the run
directory as `findings-ai4c.json`, `findings-interra.json`, and
`findings-myriad.json`; it stays outside Git because rubric line 4 excludes
corpus material from this repository. Independent verification does not
require that dataset: every citation in it and in this report resolves to a
line in a task-log file committed in the cited repository's own Git history,
so each finding is checkable at its source. This report carries counts,
exemplar citations with full file names, and proposals.

## Corpus size

The extraction datasets hold exactly **291 entries**: 100 (ai4c) + 99
(project-myriad) + 92 (interra-api-proxy). Of these, 10 record clean rounds
(no findings) and 281 record findings. An entry is one row in a repo's
per-finding JSON file; a few entries aggregate several findings that one
task-log line reports as a batch (e.g. "SPEC 4 + STANDARDS 8 findings"), so
the count of individually-described defects is higher than 281. Counts
elsewhere in this report are entry counts unless stated otherwise.

| Repo | Review rounds in window | Reviewed tasks | Finding entries | Clean-round entries | Additional clean rounds/axes noted outside entries |
| --- | --- | --- | --- | --- | --- |
| ai4c | 37 (+1 aborted, +1 malformed axis) | 17 | 94 | 6 | 5 |
| project-myriad | ~73 dispatch cycles (+1 aborted, +1 interrupted axis) | 38 | 95 | 4 | 3 |
| interra-api-proxy | 63 | ~25 | 92 | 0 | 15+ |
| **Total** | **~173** | **~80** | **281** | **10** | **~23** |

**Stated granularity limitation.** Where a task log reports a review round's
findings as one batch (e.g. "SPEC 4 + STANDARDS 8 findings" on ai4c task-718
round 1), the dataset carries one entry citing that batch line, with the
batch's members summarized in the entry's gist. Those members do not have
individual axis/class/adjudication rows; re-extracting them one-by-one from
the cited log lines is possible (every batch entry cites the exact line where
its members are enumerated) but was not done in this run. Class totals are
therefore a floor for the batched classes. This is recorded as a residual, not
silently absorbed; a follow-on run that needs per-member resolution should
explode batch entries first.

The three-round cap was reached on 11 project-myriad tasks and several tasks in
each other repo. Roughly 12% of findings were rejected in adjudication; the
rejections cluster in four classes (packet-gap, factually-wrong-finding /
reviewer-error, pre-existing-not-regression, spec-interpretation-dispute).

## Merged taxonomy, ranked by cross-repo recurrence

Classes were assigned independently per repo and merged; a class is listed only
if it appeared in at least two repos, except where noted. Rows are ordered by
approximate total, descending. The **Disposition** column gives every class an
explicit route: a prevention proposal (P1–P4), existing guidance (P6), or an
explicit statement that review is the right net (P7).

| # | Class | ai4c | myriad | interra | Total (approx) | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Vacuous oracle / non-red-capable verification | 7 | 12 | 12 | ~31 | P2 |
| 2 | Security / concurrency / boundary (real product bugs) | 5 | 13 | 10 | ~28 | P7 — review is the net |
| 3 | Weak validation / silent failure / fail-open | 3 | 8 | 15 | ~26 | P7 — review is the net (product-domain defects, no repeating preventable shape) |
| 4 | Evidence gap / stale evidence / evidence-ordering | 10 | 8 | 7 | ~25 | P3 |
| 5 | Missing test (executed coverage absent for a changed path) | 10 | 6 | 8 | ~24 | existing behavior-test rule + P2; no new mechanism |
| 6 | Missing rubric / lifecycle / undefined semantics | 6 | 11 | 4 | ~21 | existing rubric-observability rule (0.24.0); no new mechanism |
| 7 | Doc contradiction / staleness | 3 | 13 | 3 | ~19 | P6 — existing pointer-not-restatement guidance |
| 8 | Packet gap / reviewer-information gap (false findings) | 5 | 3 | 5 | ~13 | P1 |
| 9 | Verbatim-fidelity / overclaimed-guarantee / unsupported-claim | 7 | 4 | 1 | ~12 | P3 (claims must trace to recorded evidence); residual is P7 |
| 10 | Fix-introduced defect / claimed-but-unapplied fix | 1 | 1 | 6 | ~8 | P4 |
| 11 | Relitigating recorded decisions / repeat findings | 3 | 3 | 1 | ~7 | P1 (decisions ledger in packet) |

**Crosswalk from dataset class labels to merged classes.** The per-repo
datasets keep the extraction agents' original labels; this table is the merge
map (labels not listed fold into the merged class shown or were singletons
left out of the cross-repo table):

| Merged class | Source labels in the datasets |
| --- | --- |
| Vacuous oracle | `vacuous-oracle` |
| Security / concurrency / boundary | `security-gap`, `toctou`, `concurrency-race`, `boundary-bug`, `injection`, `secret-handling`, `credential-confinement`, `replay/unsafe-retry`, `auth-lifecycle-gap`, `untrusted-input-trust`, `input-canonicalization-bypass`, `integer-overflow`, `security-scanner-finding` |
| Weak validation / silent failure / fail-open | `weak-validation`, `silent-failure`, `fail-open-validation`, `missing-validation`, `unclassified-failure-collapse`, `silent-data-loss`, `error-conflation`, `semantic-conflation`, `unbounded-query`, `lifecycle-edge-case`, `edge-case-gap` |
| Evidence gap / stale / ordering | `evidence-gap`, `stale-evidence`, `evidence-ordering`, `stale-cache`, `stale-review-baseline`, `provenance-drift`, `provenance-ambiguity`, `measurement-gap`, `measurement-validity` |
| Missing test | `missing-test`, `redundant-coverage-claim` |
| Missing rubric / lifecycle | `missing-rubric/lifecycle`, `metric-semantics`, `versioning-contract`, `version-without-bump`, `executable-governance-gap`, `process-authority`, `authority-overreach` |
| Doc contradiction / staleness | `doc-contradiction`, `wording/clarity`, `wrong-file/path`, `citation-padding` |
| Packet gap / reviewer-information gap | `packet-gap`, `reviewer-information-gap`, `reviewer-error`, `factually-wrong-finding`, `evidence-gap-false-positive`, `review-dispatch-failure`, `review-harness-failure`, `pre-existing-gate-failure`, `pre-existing-not-regression` |
| Verbatim-fidelity / overclaim / unsupported | `verbatim-fidelity`, `overclaimed-guarantee`, `unsupported-claim`, `incomplete-disclosure`, `fabricated-record`, `harness-fidelity` |
| Fix-introduced / claimed-but-unapplied | `fix-introduced-defect`, `claimed-but-unapplied-fix`, `fix-incomplete/prefix-match`, `regression-in-refactor`, `accepted-then-ignored-input`, `error-path-state-loss` |
| Relitigation / repeat | `relitigating-recorded-decision`, `spec-interpretation-dispute`, `tradeoff-dispute` |
| (not in cross-repo table) | `clean-round`, `scope-drift`, `scope-split/spawned-task`, `duplication/third-copy`, `migration-blindspot`, `wrong-rubric-crosswiring`, `standards-waiver`, `upstream-defect`, `env-dependent-behavior`, `degrade-dont-fail`, `dead-code/unreachable-branch`, `harness-neutrality violation` |

Totals in the cross-repo table remain approximate ("~") because batch entries
under-count members (see the granularity limitation above) and one entry maps
to exactly one class even when its gist spans several member findings.

Exemplar citations (one per headline class):

- Vacuous oracle: interra task-6940244437000003 rounds 1–3 — a
  pattern-matching infra gate defeated by successively subtler decoys until the
  round-3 verdict that pattern-matching serialized ARM "cannot be made sound"
  (`N:\interra-api-proxy\.tasks\archive\task-6940244437000003-set-a-deployment-default-inbound-rate-limit-or-rec.md:155,193,231`).
  ai4c task-711 round 3: per-vertical tests asserted only one of four doors
  (`N:\ai4c\.tasks\archive\task-711-encode-each-vertical-s-four-editorial-doors-into-t.md:575`).
- Evidence gap / stale evidence: ai4c task-718 round 3 — last recorded
  `tsc --noEmit` predated the round-2/3 fixes
  (`N:\ai4c\.tasks\archive\task-718-evaluate-deepseek-v4-flash-for-harvest-analysis-25.md:278`).
  myriad task-033 round 2 logged the friction lesson verbatim: "evidence notes
  must follow the edit, not the intention"
  (`N:\project-myriad\.tasks\tasks\task-033-factory-verify-suite-union-runner-manifest-structu.md:276`).
- Packet gap: ai4c task-711 round 2 — the round-2 packet reused the round-1
  file list, producing a rejected finding
  (`N:\ai4c\.tasks\archive\task-711-encode-each-vertical-s-four-editorial-doors-into-t.md:465`);
  interra task-082 — reviewer's own UTF-16 packet export adjudicated as the
  "mojibake" it reported
  (`N:\interra-api-proxy\.tasks\archive\task-082-upgrade-agent-foundry-0-14-1-0-16-0.md:171`).
- Fix-introduced defect: interra task-096 round 2, `fixesReal=FALSE` — the
  round-1 limiter fix exempted exactly the traffic ADR 0006 exists to bound
  (`N:\interra-api-proxy\.tasks\tasks\task-096-adr0006-slice-1-recent-authentication-control-and-.md:25`).
  myriad task-033 round 2 — a round-1 fix was claimed but never applied; the
  reviewer caught it
  (`N:\project-myriad\.tasks\tasks\task-033-factory-verify-suite-union-runner-manifest-structu.md:276`).
- Relitigation: myriad task-041 — the bare-orgId finding was raised in all
  three rounds against an operator-accepted ADR 0012 posture
  (`N:\project-myriad\.tasks\archive\task-041-session-bound-active-organization-explicit-tenancy.md:31,93,94`).

## Prevention proposals, ranked by preventability

Preventability is explicit and two-factor: (a) **mechanical checkability** —
can a rule or gate detect the class before review, without judgment; and (b)
**cross-repo recurrence** — entry counts from the taxonomy table. The
preventability ranking those factors produce is:

1. **P1** — fully mechanical, ~13 entries, and each prevented instance buys
   back a whole adjudication cycle;
2. **P3** — fully mechanical ordering rule ("re-record after the last edit"),
   ~25 entries;
3. **P4** — fully mechanical diff check, ~8 entries;
4. **P2** — partially mechanical: the *demonstration* can be required and
   checked, but oracle soundness itself still needs judgment; ranked below
   P1/P3/P4 on checkability despite the largest class (~31 entries);
5. unpreventable classes — security, concurrency, product-domain validation —
   where neither factor holds; explicitly left to review (P7).

The P-numbers themselves are presentation order from the draft and are kept
stable because the implementation task, changelog, and task logs reference
them; the list above, not the numbering, is the preventability ranking. Each
proposal names the exact artifact it would change and carries an explicit
adopt / revise / stop recommendation.

### P1 — Mechanical review-packet discipline (ADOPT)

~13 entries (≈4.5% of finding entries, but a much larger share of *rejected*
findings and re-dispatch churn) were caused not by the work but by the packet:
stale file lists reused across rounds, omitted changelog sections, truncated
commands, evidence that existed but was not shown, encoding corruption
introduced by the export itself. Every one consumed a full adjudication cycle
to refute.

Change: add a packet checklist to the review-dispatch step of the
`execute-task` skill (both trees): (1) regenerate the in-scope file list from
the diff for *every* round, never reuse a prior round's list; (2) include the
recorded gate evidence (`task.mjs` log excerpts) for the claims the rubric
makes; (3) include recorded decisions the diff relies on (accepted ADRs, rubric
amendments, operator rulings) — this also targets P5's relitigation churn;
(4) export UTF-8. This is a bounded instruction-level change; no new script
required.

### P2 — Red-capable-oracle gate before dispatch (ADOPT, extends task-020)

The largest class (~31) is verification that could not fail: tests asserting
one of four required items, presence-only checks, gates matching decoys,
probes that exit 0 unconditionally, goldens run against an already-running
process. Agent Foundry already ships the task-020 oracle-vacuity self-check;
the corpus shows the class is still the #1 thing cold review catches — and it
routinely costs 2–3 rounds because each fix is only as strong as the next
decoy.

Change: strengthen the self-check in `execute-task` from "ask whether the
oracle can fail" to "demonstrate it": before requesting review, record one
mutation or rejection fixture per new oracle (the interra reviews converged on
exactly this — seeded decoys, `fixesReal` mutation checks). Where a check is
structurally unsound (pattern-matching a serialized artifact), say so in the
packet instead of hardening it another round.

### P3 — Evidence-follows-the-edit rule (ADOPT)

~25 entries were about the durable record, not the code: gates recorded
before the final edit, counts that no longer matched the tree, commands
promised rather than recorded. This class appears in every repo and in nearly
every upgrade task.

Change: one sentence in `execute-task` at the point of use: after the last
edit of a round, re-record the gate through `task.mjs run` before dispatching
review; evidence recorded before the final edit does not count. (The myriad
log already coined the rule; it belongs in the mold, not in one repo's
friction notes.)

### P4 — Fix-applied verification between rounds (ADOPT)

~8 entries were defects introduced by review-round fixes, including one
claimed-but-never-applied fix. Cheap prevention: before dispatching round
N+1, diff-verify each round-N fix against the tree (the fix list is already
in the task log). Change: one instruction in the re-review step of
`execute-task`.

### P5 — Decisions ledger in the packet (ADOPT, via P1)

Repeat findings against operator-accepted decisions (bare-orgId three times;
ADR-status re-raises) burn reviewer credibility and adjudication time.
Disposition: ADOPT — implemented as P1 item (3) rather than as a separate
mechanism; adopting P1 adopts P5.

### P6 — Doc-contradiction class (REVISE, no new mechanism)

~19 entries, but 13 are from one repo (project-myriad) whose early tasks were
precisely *about* reconciling a large doc set; the reconciliation tasks
themselves then created new divergence sites until docs were shrunk to
pointers. The mold already prescribes pointer-not-restatement (SDLC single
authority). Recommendation: no new rule; when a target project shows this
class recurring, the existing guidance is the fix — point, don't restate.

### P7 — Security / concurrency / boundary findings (STOP — review is working)

~28 entries (lock-order inversion, TOCTOU, MFA bypass, credential
confinement, integer-overflow paging, injection) are exactly what adversarial
review exists to catch. They show no repeating preventable shape — each is
specific to its design. No shift-left proposal; this is the review's value,
and any attempt to checklist it would be vacuous.

## Review economics observed

- Clean rounds are common (~33 axes/rounds) — the process converges, typically
  by round 2–3; the cap was the stop on ~15 tasks.
- Rejected finding entries (~12%) are not noise: in every audited case the rejection
  was backed by recorded counter-evidence, and about half of the rejections
  trace to packet defects (P1) rather than reviewer error.
- Two review-harness failures (budget-cap abort; malformed axis output) and
  two dispatch failures (reviewer explored the repo instead of the packet;
  session interruption) cost whole rounds — worth tracking in session-audit
  run 002's per-provider outcome table (task-023).

## Recommendation

Per proposal: **P1 ADOPT. P2 ADOPT. P3 ADOPT. P4 ADOPT. P5 ADOPT (delivered
inside P1). P6 REVISE — no new mechanism, existing guidance is the fix. P7
STOP — no prevention mechanism; review is the net.** P1–P4 land as one
bounded change to `execute-task` (both trees) plus a CHANGELOG entry. Each
changes text at the point of use, restates no SDLC rule, and is
harness-neutral.
