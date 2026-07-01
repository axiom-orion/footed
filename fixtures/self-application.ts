// The self-audit: Footed run against Carson's five hiring filters, using the SAME
// verdict shape and the SAME renderer as the affidavit receipt (consistency, not a
// stunt). The whole point is that it refuses to green-check filter #3 — the one that
// can't be independently proven — instead of quietly claiming it.
//
// Every VERIFIED line points at a real, publicly checkable artifact (all verified live).
// Filter #3 stays UNVERIFIED because there is no paying-customer product in current role
// to reconcile against — the tool refuses to bless what it can't prove, on its own author.

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
    "Reconciled to this artifact's build: the engine, checks, jurisdiction module, renderer and tests were agent-authored and human-reviewed. The commit history (agent co-authored) is public and inspectable at github.com/axiom-orion/footed.",
  ),
  line(
    "f2_threads",
    "2. Manage 5+ agentic threads concurrently",
    "verified",
    "Reconciled to a 14-agent concept workflow (research → ideation → adversarial critique → synthesis) plus a parallel build across threads. A related public runtime that orchestrates multi-model consensus (Claude/Gemini/Grok): github.com/axiom-orion/governed-agents.",
  ),
  line(
    "f3_paying",
    "3. Ship production code for an app with paying customers in your current role",
    "unverified",
    "Not stamped green: there is no paying-customer product in current role to independently verify. Checkable adjacent facts exist — live deployments (governed-agents.vercel.app, footed-eight.vercel.app, flcason.com) and open-source repos (github.com/axiom-orion: agent-memory-service, genealogy-graphrag, governed-agents) — but the strict 'paying customers, current role' criterion is unmet. This is the tool refusing to bless what it can't prove, applied to its own author.",
  ),
  line(
    "f4_nextjs",
    "4. Ship Next.js and care about UX",
    "verified",
    "Reconciled to live, deployed Next.js apps: footed-eight.vercel.app (this tool), governed-agents.vercel.app (a Next.js policy-gate runtime), and flcason.com. UX here is tuned to the target product's calm, warm visual language.",
  ),
  line(
    "f5_legalai",
    "5. Find the Legal AI industry interesting",
    "verified",
    "Reconciled to this artifact — it targets Florida Form 12.902(c), the highest-liability document in a dissolution, and AUDITS rather than generates — plus a body of governance work (e.g. github.com/axiom-orion/governed-agents, a named-rule gate that evaluates tool-calls before execution).",
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
