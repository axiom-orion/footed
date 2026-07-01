// FOOTS — does the arithmetic actually add up?
//
// Recomputes every subtotal/total from its components, from scratch, and checks any
// declared cross-frequency equivalence (e.g. "weekly $X" vs "annual $Y" of one stream).
// The stated figure is never trusted; it is compared against what we reconstruct.

import type { AffidavitLine, CheckResult } from "../types.ts";
import type { Jurisdiction } from "../jurisdiction.ts";
import { round2 } from "../jurisdiction.ts";

const EPSILON = 0.01; // a penny of float tolerance

export function foots(
  line: AffidavitLine,
  byId: Map<string, AffidavitLine>,
  jx: Jurisdiction,
): CheckResult | null {
  if (line.kind === "subtotal" || line.kind === "total") {
    if (!line.components || line.components.length === 0) return null;
    let sum = 0;
    const missing: string[] = [];
    for (const cid of line.components) {
      const c = byId.get(cid);
      if (!c || c.value == null) {
        missing.push(cid);
        continue;
      }
      sum += c.value;
    }
    const recomputed = round2(sum);
    const stated = line.value ?? null;

    // A subtotal over blanks can't be trusted to foot — surface, don't guess.
    if (missing.length > 0) {
      return {
        check: "foots",
        verdict: "unverified",
        reason: `Cannot foot "${line.label}": ${missing.length} component line(s) are blank, so the subtotal can't be independently reconstructed.`,
        recomputed,
      };
    }
    if (stated == null) {
      return {
        check: "foots",
        verdict: "unverified",
        reason: `"${line.label}" is blank but its components sum to ${money(recomputed)}.`,
        recomputed,
      };
    }
    if (Math.abs(recomputed - stated) <= EPSILON) {
      return {
        check: "foots",
        verdict: "verified",
        reason: `"${line.label}" foots: components sum to ${money(recomputed)}.`,
        recomputed,
      };
    }
    return {
      check: "foots",
      verdict: "refused",
      reason: `"${line.label}" does NOT foot: stated ${money(stated)} but components sum to ${money(recomputed)} (off by ${money(round2(stated - recomputed))}).`,
      recomputed,
    };
  }

  if (line.kind === "declared") {
    if (!line.equivalentTo || line.value == null || !line.frequency) return null;
    const other = byId.get(line.equivalentTo);
    if (!other || other.value == null || !other.frequency) return null;
    const a = jx.toAnnual(line.value, line.frequency);
    const b = jx.toAnnual(other.value, other.frequency);
    if (Math.abs(a - b) <= EPSILON) {
      return {
        check: "foots",
        verdict: "verified",
        reason: `"${line.label}" (${line.frequency}) ties out to "${other.label}" (${other.frequency}) on an annual basis (${money(a)}).`,
        recomputed: a,
      };
    }
    return {
      check: "foots",
      verdict: "refused",
      reason: `Frequency mismatch: "${line.label}" annualizes to ${money(a)} but "${other.label}" annualizes to ${money(b)}.`,
      recomputed: a,
    };
  }

  return null;
}

function money(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
