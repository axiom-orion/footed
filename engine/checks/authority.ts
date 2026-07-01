// AUTHORITY — is every cited statute / rule / form a real one for THIS jurisdiction?
//
// Three-state on purpose. We refuse to red-flag a citation just because our seed
// registry is incomplete: a real-looking citation we don't recognize is UNVERIFIED
// (a human should confirm it), never REFUSED. Only a structurally impossible or
// wrong-jurisdiction citation — the classic AI copy-paste hallucination — is REFUSED.

import type { AffidavitLine, CheckResult } from "../types.ts";
import type { Jurisdiction } from "../jurisdiction.ts";

export function authority(line: AffidavitLine, jx: Jurisdiction): CheckResult | null {
  if (line.kind !== "authority" || !line.citation) return null;

  const outcome = jx.classifyAuthority(line.citation);
  if (outcome === "known") {
    return {
      check: "authority",
      verdict: "verified",
      reason: `"${line.citation}" is a recognized ${jx.name} family-law authority.`,
    };
  }
  if (outcome === "unknown") {
    return {
      check: "authority",
      verdict: "unverified",
      reason: `"${line.citation}" is citation-shaped but not in the (intentionally partial) ${jx.name} registry — a human should confirm it exists and is on point.`,
    };
  }
  return {
    check: "authority",
    verdict: "refused",
    reason: `"${line.citation}" cannot be a valid ${jx.name} authority (malformed, non-existent, or from another jurisdiction). This is the classic drafting-tool citation error.`,
  };
}
