// Track record: the SAME receipt run on real shipped work. Same rule as everywhere else —
// a line is VERIFIED only when there's a public artifact you can open and check it against
// (a repo you can read, a deploy you can hit). Work that's real but has no public artifact
// to confirm the specifics stays UNVERIFIED, honestly. No refusals are manufactured.
//
// Every URL here was link-checked live (200). This is not a resume; it's proof-of-work
// with each claim carrying its receipt.

import type { DocumentVerdict, LineVerdict } from "../engine/types.ts";

function line(
  id: string,
  label: string,
  verdict: LineVerdict["verdict"],
  reason: string,
): LineVerdict {
  return {
    lineId: id,
    label,
    section: "Shipped work",
    mandatory: false,
    verdict,
    checks: [{ check: "reconciles", verdict, reason }],
  };
}

const lines: LineVerdict[] = [
  line(
    "footed",
    "Footed — this tool",
    "verified",
    "Open-source, agent-built, live. Reconstructs and verifies a Florida financial affidavit; you're reading its track record right now. footed.flcason.com · github.com/axiom-orion/footed.",
  ),
  line(
    "agent-memory",
    "agent-memory-service — typed memory layer for LLM agents",
    "verified",
    "Open-source, live on Cloud Run. The repo carries the 4-config ablation harness and its results — 100% current-fact accuracy, 0% stale retrieval, ~35% grounding-token savings; also evaluated on LoCoMo-10. Inspectable, not just asserted: github.com/axiom-orion/agent-memory-service.",
  ),
  line(
    "genealogy-graphrag",
    "genealogy-graphrag — hybrid retrieval + reranking",
    "verified",
    "Open-source (BM25 + dense + knowledge-graph, cross-encoder rerank). The per-category ablation in the repo shows relational recall@5 0.000 → 1.000 and MRR@10 0.77 → 1.00. github.com/axiom-orion/genealogy-graphrag.",
  ),
  line(
    "governed-agents",
    "governed-agents — named-rule policy gate",
    "verified",
    "Open-source + live. A Next.js runtime that wraps LLM calls in a named-rule gate, evaluating every tool-call before execution and emitting an NDJSON audit trail; multi-model consensus + adversarial 'Red Cell' mode. This is the fail-closed gate Footed's verifier reuses. governed-agents.vercel.app · github.com/axiom-orion/governed-agents.",
  ),
  line(
    "cason-heritage",
    "cason-heritage — provenance-graded knowledge base",
    "verified",
    "Open-source + live at flcason.com. Four centuries of conflicting records under 7 evidence tiers; candidates eliminated with disqualifying evidence preserved — the same supersession/quarantine pattern as agent-memory-service. github.com/axiom-orion/cason-heritage.",
  ),
  line(
    "banquetai",
    "BanquetAI — production hospitality-ops platform",
    "unverified",
    "Real, shipped on Firebase + Next.js (AI-assisted BEOs, layout calculator, stewarding engine; 1,000+ tests in one module) and taken to market with real operators — but it's not open-source and has no public artifact to confirm the specifics, so it is NOT stamped green here. Kept as adjacent evidence, on the same honesty rule as everything else.",
  ),
];

export const trackRecord: DocumentVerdict = {
  jurisdiction: "—",
  formId: "Track record",
  cleared: false,
  header: "5 of 6 publicly inspectable · 1 honestly unverified (no public artifact)",
  counts: { verified: 5, unverified: 1, refused: 0, total: 6 },
  lines,
  blockers: [],
};
