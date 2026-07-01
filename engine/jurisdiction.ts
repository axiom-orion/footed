// Footed — the jurisdiction seam.
//
// EVERYTHING state-specific lives behind this interface: the official form id, the
// list of mandatory fields, the recognized authorities (statutes / rules / court
// forms), and the frequency-conversion rules. Swap the module, retarget the state.
// The engine itself never hard-codes a jurisdiction.

import type { Frequency } from "./types.ts";

/** Outcome of looking a cited authority up in the registry. Three-state on purpose:
 *  we NEVER red-flag a real citation just because our seed list is incomplete. */
export type AuthorityLookup =
  | "known" //     matched a real, recognized authority -> verified
  | "unknown" //   citation-shaped but not in our (honestly-partial) registry -> unverified/needs-human
  | "malformed"; // structurally cannot be a real form/section -> refused

export interface Jurisdiction {
  /** Machine id, e.g. "us-ct". */
  id: string;
  /** Human name, e.g. "Connecticut". */
  name: string;
  /** The official financial-affidavit form id this module encodes. */
  formId: string;
  /** Honest provenance: this registry is a curated SEED, never claimed complete. */
  registryNote: string;
  /**
   * Classify a citation. Implementations must default to "unknown" (not "malformed")
   * whenever a string is plausibly a real citation we simply do not have — fail-closed
   * means "don't bless it", it does NOT mean "call real law fake".
   */
  classifyAuthority(citation: string): AuthorityLookup;
  /** Convert a figure to an annual basis so cross-frequency tie-outs can be checked. */
  toAnnual(value: number, frequency: Frequency): number;
}

/** How many periods per year each frequency represents. Shared default; a jurisdiction
 *  may override toAnnual if it defines these differently. */
export const PERIODS_PER_YEAR: Record<Frequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  annual: 1,
  once: 0, // one-off; not annualized
};

export function defaultToAnnual(value: number, frequency: Frequency): number {
  const periods = PERIODS_PER_YEAR[frequency];
  return round2(value * periods);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
