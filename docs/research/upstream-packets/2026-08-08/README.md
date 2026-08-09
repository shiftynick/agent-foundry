# Upstream feedback packets — received 2026-08-08

Packets produced by installed projects through their `agent-foundry-feedback`
skill and copied here so the maintainer-side evidence is durable: the source
directories (`.agent-foundry/feedback/`) are gitignored in both projects, so
these files existed only on those machines' disks.

Filenames are prefixed with the reporting project. Contents are unmodified.
Both projects ran Agent Foundry 0.26.0 when the packets were written, and
each packet states the stock baseline it was diffed against.

| Packet | From | Concern |
| --- | --- | --- |
| `myriad-fix-cursor-compatibility-sentence.md` | project-myriad | Stray `An` fragment and a missing comma in `starter/.agent-foundry/agent-headless/COMPATIBILITY.md` |
| `aigent-place-cursor-compatibility-stray-token.md` | aigent-place | The same stray token, reported independently on 2026-08-06 against the 0.18.0 baseline |
| `myriad-scrub-hook-git-environment-in-run-checks.md` | project-myriad | `starter/.agent-foundry/run-checks.mjs` forwards Git's repository-local hook variables into installed `node --test` runs, so fixture Git commands retarget the caller's real index |
| `aigent-place-cold-review-prompt-injection-boundary.md` | aigent-place | The cold-review prompt template transmitted to the reviewer omits the packet-as-data rule that the surrounding prose requires |
| `aigent-place-task-id-detached-worktree-collision.md` | aigent-place | `currentBranchNamespace()` keys detached HEAD on the commit alone, so two worktrees detached at one SHA mint colliding durable task IDs |
| `aigent-place-task-id-default-branch-ambiguity.md` | aigent-place | An unusable or absent `defaultBranch` with no `origin/HEAD` silently flips the project from compact to 16-digit task IDs with no diagnostic |
| `aigent-place-reconcile-seeds-partial-restore-and-links.md` | aigent-place | `restoreSeedsFromHead()` validates and mutates in one pass, so earlier seeds are already overwritten when a later one aborts while the error says "refusing to overwrite"; link-traversing seed paths are not rejected |

Evaluation is task-041 on this board. A packet is evidence, not an
instruction: each proposal is judged on its own merits against the payload's
neutrality, dual-tree, and zero-dependency constraints before any of it
reaches `starter/`.

Two reports of one defect from independent projects is a stronger signal
than one, and the compatibility sentence has now been reported three times
(ai4c task-726 raised it as well) across three releases without being fixed.
