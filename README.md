# Footed

*Footed* (accounting: do the columns actually add up?) is an on-demand, fail-closed
pre-filing check for a **financial affidavit** — the sworn, penalty-of-perjury document
at the center of a divorce. You point it at a completed affidavit plus its source
documents; it reconstructs every number, checks the math foots, confirms mandatory fields
are present, and verifies every cited authority is real for the jurisdiction. It emits one
**disposable HTML "Trust Receipt"** and stops.

It is not a dashboard, not a monitor, nothing persistent. It answers one question —
**"is this safe to sign?"** — and throws the answer away.

## The one rule
A figure is **VERIFIED** only when it was independently reconstructed from a source you
provided. Everything else is surfaced honestly:

| State | Meaning |
| --- | --- |
| 🟢 **VERIFIED** | reconstructed from a source (the receipt shows the value + the exact line it tied to) |
| 🟡 **UNVERIFIED** | could not be confirmed, or a required field is blank — *needs a human*, not "wrong" |
| 🔴 **REFUSED** | contradicts its source, is impossible, or is a value asserted with no substantiation |

Fail-closed by construction: the document defaults to **NOT CLEARED FOR FILING**, and one
unresolved required item blocks clearance. 589 good lines can't outvote one bad one.

## Run it
```bash
node --experimental-strip-types engine/selftest.ts   # engine + assertions (no install)
node --experimental-strip-types receipt/emit.ts       # writes receipt/out/*.html
```

The seeded Florida sample (`fixtures/fl-sample.ts`) carries three planted defects — a
subtotal that doesn't foot, a retirement account asserted with no statement, and a
Connecticut statute pasted into a Florida filing — and the receipt catches all three.

## Jurisdiction
Ships with **Florida** — Form 12.902(c) (Long Form Financial Affidavit); child-support
math derives from Fla. Stat. ch. 61. Every state-specific detail lives behind one
`Jurisdiction` interface (`engine/jurisdiction.ts`), so adding another state is a single
drop-in module.

## Boundaries (on purpose)
- **Not legal advice.** It flags items for a person to resolve; it never rewrites the
  document or reaches a conclusion. Stays clear of unauthorized practice of law.
- **Structured input** for now (affidavit JSON + structured source lines). Messy-PDF/OCR
  extraction is the harder next step; a failed extraction yields UNVERIFIED, never a false green.
- The authority registry is a **curated seed**, explicitly not complete — which is exactly
  why unrecognized-but-plausible citations resolve to "needs human", never "fabricated".

## Provenance
Built by orchestrated agents (~95%) with a human reviewing/steering. The engine is pure,
dependency-free TypeScript; the receipt is a self-contained HTML string.
