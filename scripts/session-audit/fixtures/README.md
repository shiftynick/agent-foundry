# session-audit fixtures

Everything under this directory is **hand-authored synthetic data**. It mimics
the Claude Code transcript schema closely enough to exercise the adapter and the
detectors, and nothing more.

No real transcript content, real repository paths, real prompts, secrets, or
personal data may be added here. The audit tooling reads real transcripts from
outside the repository and writes all derived output to an operator-named run
directory; none of that ever lands in Git.

Layout mirrors the real one so `discover.mjs --projects-root` can point here:

```text
projects/
  T--synthetic-repo/
    <parent session id>.jsonl
    <parent session id>/subagents/agent-<id>.jsonl
    <parent session id>/subagents/agent-<id>.meta.json
```

Three synthetic projects, each isolating a different shape of real transcript:

- `T--synthetic-repo` — the ordinary case: an operator turn, tool calls with
  matched results, a repeated read, a repeated command, a failure and its retry,
  an edit across two turns, a compaction followed by a re-read, a delegated
  subagent, and a large unreferenced tool output. It deliberately contains one
  malformed line, one unknown record type, and one obviously fake secret
  (`sk-synthetic...`) so the malformed-line counter, the unknown-type
  tolerance, and the redactor are all exercised.
- `T--synthetic-quirks` — the awkward case: one API response written as several
  assistant records sharing a `requestId`, a replayed record carrying a uuid
  that already appeared, a record whose timestamp runs backwards, and an
  operator-blocking `AskUserQuestion` call.
- `T--synthetic-resumed` — a transcript whose earliest timestamp is *not* its
  first record, which is what a resumed session that replays a prefix looks
  like. It exists to hold the "time buckets sum to the session span" invariant
  honest at the leading edge.
