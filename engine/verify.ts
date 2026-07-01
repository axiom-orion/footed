// Footed — the aggregator.
//
// Runs the four deterministic passes over every line, rolls each line up to its WORST
// applicable verdict, then dispositions the whole document fail-closed: it defaults to
// NOT CLEARED and only clears when nothing is refused and nothing mandatory is left
// unproven. One blocker fails the packet — 589 good lines cannot outvote one bad one.

import type {
  Affidavit,
  CheckResult,
  DocumentVerdict,
  LineVerdict,
  SourceDoc,
  Verdict,
} from "./types.ts";
import type { Jurisdiction } from "./jurisdiction.ts";
import { foots } from "./checks/foots.ts";
import { reconciles } from "./checks/reconciles.ts";
import { complete } from "./checks/complete.ts";
import { authority } from "./checks/authority.ts";

const SEVERITY: Record<Verdict, number> = { verified: 0, unverified: 1, refused: 2 };

/** Worst (highest-severity) verdict among the checks that ran. Absent checks => verified-by-default is NOT assumed: a line with no applicable checks is treated as unverified (we didn't prove anything about it). */
function rollup(results: CheckResult[]): Verdict {
  if (results.length === 0) return "unverified";
  return results.reduce<Verdict>(
    (worst, r) => (SEVERITY[r.verdict] > SEVERITY[worst] ? r.verdict : worst),
    "verified",
  );
}

export function verify(affidavit: Affidavit, sources: SourceDoc[], jx: Jurisdiction): DocumentVerdict {
  const byId = new Map(affidavit.lines.map((l) => [l.id, l]));
  const docs = new Map(sources.map((d) => [d.id, d]));

  const lineVerdicts: LineVerdict[] = affidavit.lines.map((line) => {
    const checks: CheckResult[] = [];
    const f = foots(line, byId, jx);
    if (f) checks.push(f);
    const r = reconciles(line, docs, jx);
    if (r) checks.push(r);
    const c = complete(line);
    if (c) checks.push(c);
    const a = authority(line, jx);
    if (a) checks.push(a);

    return {
      lineId: line.id,
      label: line.label,
      section: line.section,
      mandatory: !!line.mandatory,
      verdict: rollup(checks),
      checks,
    };
  });

  const counts = { verified: 0, unverified: 0, refused: 0, total: lineVerdicts.length };
  const blockers: string[] = [];
  for (const lv of lineVerdicts) {
    counts[lv.verdict]++;
    // What blocks clearance: any refusal, or any mandatory line not fully verified.
    if (lv.verdict === "refused" || (lv.mandatory && lv.verdict !== "verified")) {
      blockers.push(lv.lineId);
    }
  }

  const cleared = blockers.length === 0 && counts.unverified === 0;
  const header = disposition(counts, blockers.length, cleared);

  return {
    jurisdiction: jx.name,
    formId: affidavit.formId,
    cleared,
    header,
    counts,
    lines: lineVerdicts,
    blockers,
  };
}

function disposition(
  counts: { verified: number; unverified: number; refused: number; total: number },
  blockerCount: number,
  cleared: boolean,
): string {
  if (counts.refused > 0) return "NOT CLEARED FOR FILING";
  if (blockerCount > 0) return "NOT CLEARED FOR FILING"; // mandatory line unproven
  if (counts.unverified > 0) return `NOT CLEARED — ${counts.unverified} item(s) need human review`;
  if (cleared) return "CLEARED — every line independently verified";
  return "NOT CLEARED FOR FILING";
}
