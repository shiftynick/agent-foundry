# Upstream notices

Outbound counterpart to `docs/research/upstream-packets/`. A packet arrives
from an installed project; a notice goes back when that packet is resolved.

A notice exists because the reporting project cannot see this side of the
exchange. It carries a real cost until it is told: an installed project holds
its fix as a `LOCAL-CHANGES.md` divergence, and every upgrade has to reconcile
that divergence by hand. A notice is what lets the project drop it.

Each notice names:

- which packet it answers and which release carries the fix,
- **what the Foundry changed from the proposal, and why** — this is the
  load-bearing part. A project whose local copy differs from stock must know
  that before it merges its version forward,
- the concrete files to replace and the condition for retiring each
  `LOCAL-CHANGES.md` entry,
- what an upgrade does *not* do, so the project does not assume a repair that
  never ran,
- the evidence behind the claim, so the project can judge it rather than trust
  it.

Delivery is an operator step. These files are drafts for a human to send or to
drop into the target project; nothing here contacts anyone.

Naming: `YYYY-MM-DD-<project>.md`, dated by the notice, not by the packet.
**One file per project per send**, covering every release that project still
needs to hear about — not one file per release. A project that gets two files
on one day reads neither carefully.

| Notice | Project | Releases | Packets resolved |
| --- | --- | --- | --- |
| `2026-08-09-project-myriad.md` | project-myriad | 0.28.0, 0.27.0 | `myriad-scrub-hook-git-environment-in-run-checks`, `myriad-fix-cursor-compatibility-sentence` |
| `2026-08-09-aigent-place.md` | aigent-place | 0.28.0, 0.27.0 | `aigent-place-task-id-detached-worktree-collision`, `aigent-place-task-id-default-branch-ambiguity`, `aigent-place-reconcile-seeds-partial-restore-and-links`, `aigent-place-cold-review-prompt-injection-boundary`, `aigent-place-cursor-compatibility-stray-token` |
| `2026-08-09-ai4c.md` | ai4c | 0.27.0 | none on file — reported as ai4c task-726, cited in another project's evidence |

## A notice is not only for unacknowledged work

The 0.27.0 landings **were** delivered, as cards on the reporting projects'
boards (`task-061` in each), recorded in task-041's log. They are covered again
here because delivery answered *whether* a fix landed and this convention also
answers *in what wording*. The cold-review boundary shipped with materially
different text from the proposed diff; a project that merges its own version
forward on the strength of "adopted" keeps drifting. Say what changed, every
time, even when the answer is "nothing".

The ai4c row is the other failure mode: a correct report that arrived as a
citation inside someone else's packet rather than as its own, and so was never
tracked or answered. Reporters are tracked by packet; anything reported another
way has to be caught by hand.
