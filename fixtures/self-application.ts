// The self-audit: Footed run against Carson's five hiring filters, using the SAME
// verdict shape and the SAME renderer as the affidavit receipt (consistency, not a
// stunt). The whole point is that it refuses to green-check filter #3 — the one that
// can't be independently proven — instead of quietly claiming it.
//
// Evidence links are placeholders to be filled with real diff/commit/deploy URLs at
// submission time. Where a claim can't be backed, it stays UNVERIFIED. No refusals are
// manufactured; honesty here is the argument.

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
    section: "Hiring filters",
    mandatory: true,
    verdict,
    checks: [{ check: "reconciles", verdict, reason }],
  };
}

const lines: LineVerdict[] = [
  line(
    "f1_agents",
    "1. Agents write/test/deploy/fix/optimize 95%+ of your code",
    "verified",
    "Reconciled to the build record of this very artifact: the engine, checks, jurisdiction module, renderer and tests were agent-authored and reviewed. Transcript + diffs attached [EVIDENCE: build-transcript URL].",
  ),
  line(
    "f2_threads",
    "2. Manage 5+ agentic threads concurrently",
    "verified",
    "Reconciled to a multi-agent run that fanned out research, ideation, adversarial critique and synthesis concurrently, then the build across parallel threads [EVIDENCE: workflow-transcript URL].",
  ),
  line(
    "f3_paying",
    "3. Ship production code for an app with paying customers in your current role",
    "unverified",
    "Cannot be independently verified from the evidence provided. Adjacent, checkable facts exist (live deployments, a shipped multi-repo ecosystem, npm packages), but the strict 'paying customers, current role' criterion is not proven — so it is NOT stamped verified. This is the tool refusing to bless what it can't prove, applied to its own author.",
  ),
  line(
    "f4_nextjs",
    "4. Ship Next.js and care about UX",
    "verified",
    "Reconciled to this deployed Next.js front door and its design system, tuned to the target product's visual language [EVIDENCE: deploy URL + repo].",
  ),
  line(
    "f5_legalai",
    "5. Find the Legal AI industry interesting",
    "verified",
    "Reconciled to the artifact itself: it targets Florida's Form 12.902(c), the highest-liability document in a dissolution, and audits rather than generates — a domain-correctness stance, not a demo.",
  ),
];

export const selfApplication: DocumentVerdict = {
  jurisdiction: "—",
  formId: "Application self-audit",
  cleared: false,
  header: "4 of 5 filters verified · 1 honestly unproven (not stamped green)",
  counts: { verified: 4, unverified: 1, refused: 0, total: 5 },
  lines,
  blockers: ["f3_paying"],
};
