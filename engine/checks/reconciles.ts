// RECONCILES — does every figure trace back to an independent source document?
//
// This is where "self-claimed = zero until proven" becomes behavior. A figure earns
// VERIFIED only when a provided source line matches it (and we can point at the exact
// document + hash). Missing evidence renders as UNVERIFIED. For material lines flagged
// requireSource, an asserted value with no valid backing is a REFUSAL, not a soft gap.

import type { AffidavitLine, CheckResult, SourceDoc } from "../types.ts";
import type { Jurisdiction } from "../jurisdiction.ts";
import { round2 } from "../jurisdiction.ts";

const EPSILON = 0.01;

export function reconciles(
  line: AffidavitLine,
  docs: Map<string, SourceDoc>,
  jx: Jurisdiction,
): CheckResult | null {
  if (line.kind !== "input") return null;

  // No claimed source.
  if (!line.sourceRef) {
    if (line.requireSource && line.value != null) {
      return {
        check: "reconciles",
        verdict: "refused",
        reason: `"${line.label}" asserts ${money(line.value)} but no supporting statement was provided. A sworn value with no substantiation is refused, not assumed.`,
      };
    }
    if (line.value != null) {
      return {
        check: "reconciles",
        verdict: "unverified",
        reason: `"${line.label}" (${money(line.value)}) has no source document on file, so it can't be independently confirmed.`,
      };
    }
    return null; // blank & not material: completeness handles it
  }

  // A source is claimed — go find it.
  const doc = docs.get(line.sourceRef.docId);
  const docLine = doc?.lines.find((l) => l.id === line.sourceRef!.docLineId);
  if (!doc || !docLine) {
    const verdict = line.requireSource ? "refused" : "unverified";
    return {
      check: "reconciles",
      verdict,
      reason: `"${line.label}" cites source ${line.sourceRef.docId}/${line.sourceRef.docLineId}, but that ${!doc ? "document" : "line"} was not provided.`,
    };
  }

  // Compare on an annual basis if both carry a frequency; otherwise compare raw.
  const lineVal =
    line.frequency && docLine.frequency ? jx.toAnnual(line.value ?? NaN, line.frequency) : line.value ?? NaN;
  const srcVal =
    line.frequency && docLine.frequency ? jx.toAnnual(docLine.value, docLine.frequency) : docLine.value;

  const source = { docId: doc.id, docLineId: docLine.id, hash: doc.hash };

  if (Number.isNaN(lineVal)) {
    return {
      check: "reconciles",
      verdict: "unverified",
      reason: `"${line.label}" is blank but source ${doc.kind} reports ${money(round2(srcVal))}.`,
      source,
    };
  }
  if (Math.abs(round2(lineVal) - round2(srcVal)) <= EPSILON) {
    return {
      check: "reconciles",
      verdict: "verified",
      reason: `"${line.label}" reconciles to ${doc.kind} (${docLine.label}): ${money(round2(srcVal))}.`,
      recomputed: round2(srcVal),
      source,
    };
  }
  return {
    check: "reconciles",
    verdict: "refused",
    reason: `"${line.label}" states ${money(round2(lineVal))} but ${doc.kind} (${docLine.label}) shows ${money(round2(srcVal))} — a ${money(Math.abs(round2(lineVal - srcVal)))} discrepancy.`,
    recomputed: round2(srcVal),
    source,
  };
}

function money(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
