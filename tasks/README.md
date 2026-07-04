# Task catalog

One PRD per feature, numbered, filename never reused. This index is what agents read
before starting work and what the librarian updates when a PRD ships.

| #    | PRD | Status |
| ---- | --- | ------ |
| —    | *(next: 0001)* | — |

## Convention

- `NNNN-prd-<slug>.md` — the spec: goal, non-goals, acceptance criteria, exact files,
  numbered task list.
- Status flow: **DRAFT** → **APPROVED** (human flips it) → **SHIPPED**.
- PRDs are drafted by `/prd`, approved by a human, executed task-by-task by `builder`,
  gated by `verifier`, closed out via `/ship`.
- Every acceptance criterion must map to an assertion in `engine/selftest.ts` —
  including at least one negative case (the defect the change must catch).
