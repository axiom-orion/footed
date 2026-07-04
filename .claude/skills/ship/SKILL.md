---
name: ship
description: Fail-closed release step — re-run the gates, close out the PRD in the catalog, commit. Refuses to commit if any gate is red, the verifier has not approved, or the diff contains unauthorized changes.
---

Preconditions — refuse (report what's red, do not commit) unless ALL hold:

1. `pnpm typecheck` — clean.
2. `pnpm selftest` — every assertion PASS.
3. The working tree contains only changes authorized by the active APPROVED PRD.
4. The verifier's verdict on this exact diff was `VERDICT: APPROVED`.

Then, in order:

1. Mark the PRD **SHIPPED** in `tasks/README.md` and in the PRD file itself.
2. Commit everything in one commit: `feat: <prd title> (PRD NNNN)`, body listing each
   acceptance criterion and the selftest assertion that proves it.
3. Report the commit hash plus the final gate output — that is the shipping receipt.

Never `--no-verify`, never partial-stage around a red gate, never commit "to save
progress". A red gate means the work is not done.
