---
name: verify-filing
description: >-
  Pre-filing trust check for a completed financial affidavit. On demand, reconstructs
  every number from its source documents, checks that subtotals foot, that mandatory
  fields are present, and that every cited authority is real for the jurisdiction — then
  emits a single disposable HTML "Trust Receipt" stamping each item VERIFIED / UNVERIFIED
  / REFUSED and defaulting to NOT CLEARED FOR FILING until proven. Flags for a human to
  resolve; never rewrites, never gives legal advice. Use before anyone signs a financial
  affidavit under penalty of perjury.
---

# verify-filing

A reusable, on-demand check — **not** a dashboard and not a standing service. You point
it at a completed financial affidavit plus its underlying source documents; it runs four
deterministic passes and produces one throwaway HTML answer to a single question:
**"is this safe to sign?"**

## When to use
- A financial affidavit (e.g. Florida Form 12.902(c)) is filled in and about to be sworn.
- You have the underlying source docs (paystubs, bank/retirement statements, tax returns).
- You want the specific list of lines a human must resolve *before* filing.

## What it does (and deliberately does not do)
1. **FOOTS** — recomputes every subtotal/total and cross-frequency equivalence from scratch.
2. **RECONCILES** — ties every figure to a source document line; unbacked figures are not blessed.
3. **COMPLETE** — flags blank mandatory fields (blank ≠ "n/a").
4. **AUTHORITY** — checks every cited statute/rule/form against a curated jurisdiction registry
   (three-state: recognized → verified; plausible-but-unknown → needs human; wrong-jurisdiction
   or impossible → refused). It never red-flags a real citation just because the registry is partial.

An LLM is used **only** to phrase a flag in plain English — never to compute a number or assert law.
The tool **flags for review; it never rewrites the document, reaches legal conclusions, or gives
advice.** An attorney or the filer decides what to do with each flag.

## How to run
```bash
# self-test the engine against the seeded Florida sample (no install needed)
node --experimental-strip-types engine/selftest.ts

# render the throwaway receipts to receipt/out/
node --experimental-strip-types receipt/emit.ts
```

## Extending to another state
Implement one `Jurisdiction` module (`jurisdictions/us-xx.ts`): the official form id, the
mandatory-field list, the authority registry, and any frequency rules. The engine is
jurisdiction-agnostic — swap the module, retarget the state. Florida (`us-fl`) ships as the
reference implementation.

## Honest scope
- Runs on **structured input** (a JSON export of the affidavit + structured source lines).
  Messy-PDF/OCR extraction is out of scope for now and is the harder next step — by design a
  failed extraction yields **UNVERIFIED**, never a false green.
- The authority registry is a **curated seed**, explicitly not complete.
- Fail-closed: absence of evidence renders as distrust; one unresolved required item blocks clearance.
