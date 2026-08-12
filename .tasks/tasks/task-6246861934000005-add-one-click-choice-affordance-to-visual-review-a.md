---
id: task-6246861934000005
title: Add one-click choice affordance to visual-review annotations
status: in_progress
priority: p3
tags: [area:tooling]
blockedBy: []
createdAt: "2026-08-12T00:41:14Z"
updatedAt: "2026-08-12T01:08:50Z"
claimedBy: "shift@Shiftor"
claimedAt: "2026-08-12T01:08:50Z"
---

<!-- task-tracker:description -->
## Description

Operator feedback from the first real visual-review session (2026-08-11): when an artifact presents a plan with multiple-choice questions, selecting an option requires clicking the option and typing a comment such as 'this one'. The operator asked for choice elements that send the selected choice to the agent in one click. Sketch: the artifact author marks an element with a data attribute the injected SDK recognises, and a click on it posts an annotation whose comment is that choice's label, with no typing and no Send press. Open question to settle first: ADR-0003 fixed the scope at 'element and text-selection annotation UI', so decide whether this is a refinement of that UI or a scope extension needing an ADR amendment. Do not implement before that is answered.

<!-- task-tracker:log -->
## Log

- 2026-08-12T00:41:14Z — created (status: backlog)
- 2026-08-12T00:48:47Z — note: ADR-0004 written and accepted (operator directed the scope-extension route on 2026-08-11 and had already requested the feature; adr skill permits accepted with citation). Decision: opt-in data attribute on artifact elements; a click posts an annotation carrying that element's label with no typing and no Send press. Existing transport, content-type/Origin gating, and length caps unchanged; artifact markup stays untrusted data. Index row added to docs/adr/README.md in the same change.
- 2026-08-12T01:08:50Z — note: rubric: (1) An element carrying the opt-in marker posts exactly one annotation on click, with that element's label as the comment and no typing or Send press. (2) An artifact without the marker behaves exactly as before - element and text selection unchanged. (3) The posted comment respects the existing length cap and the annotation travels the existing endpoint with its existing content-type and Origin gating. (4) The marker is documented in both trees' SKILL.md with a copyable example, and the docs state that a click sends immediately and cannot be retracted through the UI. (5) Tests cover marked-click, unmarked-artifact regression, and label truncation; check-skill-sync and validate-foundry pass.
- 2026-08-12T01:08:50Z — moved to in_progress (claimed by shift@Shiftor)
