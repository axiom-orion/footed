---
name: prd
description: Draft a PRD in tasks/ from a one-line feature ask — goal, non-goals, acceptance criteria mapped to selftest assertions, exact files, numbered task list. Use before any feature work starts; nothing gets built without one.
---

Turn the user's one-line ask into `tasks/NNNN-prd-<slug>.md` (next free number in the
catalog). Read `tasks/README.md` and the engine files the feature will touch first, so
the PRD names real files and real assertion ids.

Template — every section is mandatory:

```markdown
# NNNN — <title>

**Status:** DRAFT

## Goal
One paragraph: the user-visible behavior and why it matters for a filing.

## Non-goals
What this deliberately does not do.

## Acceptance criteria
Each criterion names the selftest assertion that will prove it. At least one MUST be a
negative case — the defect the check must catch (fail-closed proof).

## Files
The exact files to touch. Anything outside this list is scope creep.

## Tasks
Numbered. Each one completable by the builder agent in a single pass.
```

Then add the PRD to the index in `tasks/README.md` (status DRAFT) and STOP. A human
approves the PRD — flips Status to APPROVED — before any build task is delegated.
