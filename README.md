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

## How it works

The engine is small, pure, and dependency-free — readable end to end in a few minutes.

**Data flow** (`engine/verify.ts`):

```
affidavit + source docs
      │
      ▼  for each line, run the checks that apply to it:
  ┌─ FOOTS ─────── recompute subtotals/totals + frequency tie-outs from scratch
  ├─ RECONCILES ─ trace each figure to a source-doc line (+ hash)
  ├─ COMPLETE ─── mandatory field present? (blank ≠ n/a)
  └─ AUTHORITY ── is every cited statute / rule / form real for this state?
      │
      ▼  roll each line up to its WORST check  (refused > unverified > verified)
      ▼  disposition the document fail-closed
  Trust Receipt  (throwaway HTML)
```

**The four checks** (`engine/checks/`) — deterministic, no LLM in the scoring path:

- **`foots`** — recomputes every subtotal/total from its components and checks declared
  cross-frequency equivalences (weekly ↔ annual). The stated figure is compared against
  what we reconstruct; it is never trusted.
- **`reconciles`** — a figure earns green only when a provided source line matches it, and
  the receipt points at the exact document + hash. No source → `unverified`. A *material*
  line (`requireSource`) asserted with no backing → `refused` — a sworn value with zero
  substantiation is worse than a blank.
- **`complete`** — a blank mandatory field is an unresolved gap for a human to fill, never
  silently "n/a".
- **`authority`** — three-state by design: recognized → `verified`; citation-shaped but not
  in the (honestly partial) registry → `unverified` / needs-human; structurally impossible
  or wrong-jurisdiction → `refused`. It will **not** call real law fabricated just because
  the seed list is incomplete.

**Fail-closed aggregation** (`engine/verify.ts`):

- A line's verdict is the *worst* of the checks that applied to it. A line with **no**
  applicable check is `unverified`, not verified — absence of proof is never proof.
- The document defaults to **NOT CLEARED FOR FILING** and clears only when nothing is
  refused and nothing mandatory is left unproven. One blocker fails the whole packet.

**Where the LLM is — and isn't.** Every number and every legal check is deterministic code.
A language model is used *only* to phrase a flag in plain English — never to compute a
figure or assert what the law says. That boundary is what keeps the tool honest and clear
of unauthorized-practice-of-law territory.

**The jurisdiction seam** (`engine/jurisdiction.ts`). Everything state-specific — the form
id, mandatory fields, the authority registry, frequency rules — lives behind one interface.
`jurisdictions/us-fl.ts` is the Florida reference; a new state is one drop-in module.

**File map**

| Path | What |
| --- | --- |
| `engine/types.ts` | the domain model — lines, sources, verdicts |
| `engine/checks/*.ts` | the four deterministic passes |
| `engine/verify.ts` | per-line rollup + fail-closed document disposition |
| `engine/jurisdiction.ts` | the state seam (interface + shared helpers) |
| `jurisdictions/us-fl.ts` | Florida — Form 12.902(c) + ch. 61 authority registry |
| `receipt/render.ts` | the disposable three-state Trust Receipt (one HTML string) |
| `fixtures/fl-sample.ts` | synthetic affidavit seeded with three planted defects |
| `app/page.tsx` | the single-route front door (runs on load) |

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
