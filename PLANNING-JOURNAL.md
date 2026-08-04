# Planning journal

## 2026-08-04 — operator-interface

**Goal:** Give the operator a brief, understandable view of both agent
communication and real project direction.

**Done when:** Human-facing agent messages are concise and translate technical
evidence; a short status command and one-screen HTML overview reliably answer
where the project is going, what changed, what is happening next, what needs
the operator, and how current the evidence is.

Approved front:

1. `task-7846468488000001` — make operator communication brief and
   understandable.
2. `task-7846468488000002` — generate a trustworthy project status summary.
3. `task-7846468488000003` — render the operator project overview; depends on
   the status summary.

Assumptions:

- Technical task logs and cold-review records remain detailed; chat is their
  human-facing translation.
- Existing board, planning, ADR, validation, and Git state remain authoritative.
- The status tools label missing or old information instead of inventing it.

Out of scope: replacing the board or handoff, an always-running web service,
LLM-written status prose, and editing project state from the overview.
