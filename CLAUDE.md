# Footed — agent operating contract

Footed is a fail-closed pre-filing check for financial affidavits: the engine refuses to
clear what it cannot prove. The build process holds itself to the same standard —
nothing ships unless the gates pass.

## The loop

Every feature moves through the same pipeline, in order:

1. **PRD** — `/prd <one-line ask>` drafts `tasks/NNNN-prd-<slug>.md`: goal, non-goals,
   acceptance criteria (with the exact selftest assertions that will prove them), files touched.
2. **Approve** — a human reads the PRD and flips its status to APPROVED. No code before this.
3. **Build** — the orchestrator delegates each numbered task to the `builder` agent.
   One task, smallest diff that satisfies it.
4. **Verify** — the `verifier` agent runs the gates and reviews the diff against the PRD.
   Its default verdict is REFUSED; approval is earned, never assumed.
5. **Ship** — `/ship` re-runs the gates, closes out the PRD in the catalog, commits.

## The team

| Role              | Agent          | Job                                                                 |
| ----------------- | -------------- | ------------------------------------------------------------------- |
| Orchestrator      | this session   | owns the plan, delegates, integrates — does not write feature code   |
| Task agent        | `builder`      | implements exactly one task from the active PRD                      |
| Operations agent  | `verifier`     | fail-closed gate: typecheck + selftest + adversarial diff review     |
| Librarian         | `librarian`    | keeps `tasks/` catalog, comments, and README truthful to the code    |

## Gates (fail-closed)

- `pnpm typecheck` — zero errors.
- `pnpm selftest` — every assertion PASS; the planted defects must still be caught.
- No commit while either gate is red. A red gate is a finding, not an obstacle.

## Rules

- The engine stays dependency-free and deterministic. Nothing probabilistic decides a
  verdict; the LLM boundary is documented in README.
- New checks must fail closed: unknown degrades to "unverified" or "refused" — never
  silently to "verified".
- Scope discipline: build what the PRD says. New ideas become future PRDs in `tasks/`,
  not drive-by commits.
- Mobile-friendly is a standard, not a feature: every page and receipt must render
  unbroken at 360px — no horizontal scroll, flex rows wrap, long unbroken strings
  (hashes, URLs, citations) get `overflow-wrap:anywhere`. Most readers open this link
  from a phone; a receipt that breaks on mobile is a failed receipt.
