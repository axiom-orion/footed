// COMPLETE — are the mandatory fields actually present?
//
// Fail-closed rule: a blank mandatory field is NOT "n/a". It is an unresolved gap that
// a human must fill before the document can clear. It never silently passes.

import type { AffidavitLine, CheckResult } from "../types.ts";

export function complete(line: AffidavitLine): CheckResult | null {
  if (!line.mandatory) return null;
  if (line.kind === "authority") return null; // authority handled by its own check

  const blank = line.value == null;
  if (blank) {
    return {
      check: "complete",
      verdict: "unverified",
      reason: `"${line.label}" is a required field but was left blank. Blank is not the same as $0 or "not applicable" — a human must resolve it.`,
    };
  }
  return {
    check: "complete",
    verdict: "verified",
    reason: `Required field "${line.label}" is present.`,
  };
}
