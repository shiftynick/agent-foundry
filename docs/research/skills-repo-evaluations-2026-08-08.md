# External skills-repo evaluations (task-034, task-035)

Date: 2026-08-08. Both evaluations were performed by read-only research
subagents; full item-by-item tables are in the task logs.

## davidondrej/skills (task-034)

MIT-licensed; 44 skills in 5 categories plus 3 hook files. The bulk is one
person's machine- and product-specific toolbox (macOS utilities, personal
DeepAPI/Supabase/Herdr integrations) or duplicates ground the Foundry already
covers with more rigor (handoff, cold review, autonomous loops, decision
interviews). Nothing warrants wholesale adoption. Four concepts are worth
adapting, in priority order:

1. **`decisions` pattern → `execute-task`** (strongest find): a pre-review
   self-disclosure step where the implementer lists the decisions it is NOT
   confident about, with unconsidered alternatives. Cheap, harness-neutral,
   and sharpens the cold reviewer's aim. Filed as a follow-up task.
2. **`before-building` → `the-fool`**: a fast no-tools entry mode — surface
   the 1–3 consequential choices hidden in a build proposal, instantly, then
   stop. Filed (grouped follow-up).
3. **`launch-subagent` + `git-worktree` → `efficient-orchestration`**:
   cross-check the delegation-brief checklist ("subagents start blind — write
   the full brief") and add a worktree-isolation-per-parallel-worker note.
   Filed (grouped follow-up).
4. **`global-agent-guardrails`** (denylist safety hook): genuinely
   harness-neutral concept, but bash+jq (fails Windows, violates zero-dep
   Node) and presumes Foundry wants to ship hooks at all — an operator
   decision. Filed as a needs:operator task.

License posture: MIT permits text reuse with notice, but everything adoptable
needs an ASD-STE100 rewrite anyway — treat as concepts-only.

## kunchenguid/lavish-axi (task-035)

Real, active repo (~2.6k stars, MIT): "Lavish Editor", a local-first HTML
artifact review editor. It is an npm CLI **product** with a companion skill,
not a skill repo. Verdict: **UNSUITABLE** for the starter payload:

- The skill is inert without the `lavish-axi` npm package and instructs
  `npx -y lavish-axi` — unpinned, network-installed latest-version execution
  on every use, incompatible with the zero-dependency, self-contained mold.
- Two default-on network surfaces baked into every installed project:
  telemetry to the author's domain (undisclosed in the SKILL.md) and
  public-by-default publishing to ht-ml.app; plus runtime-fetched
  "playbooks" — an instruction channel outside the reviewed skill text (a
  prompt-injection surface even if today's content is benign).
- Its trigger collides with Claude Code's native artifact system, and its
  human-visual review loop is not the review model `docs/SDLC.md` defines.
- Upstream keeps no dual-tree discipline; incorporation would be a fork, not
  an adoption — the unpinned-npx and runtime-playbook design cannot be fixed
  from the Foundry side.

Recommended alternative: projects that want Lavish install it directly from
upstream (it ships its own plugin/skill for exactly that), keeping the
dependency outside the mold. At most, a short optional pointer in installed
docs — not a sixteenth (now seventeenth) shared skill. Surfaced to the
operator for decision.
