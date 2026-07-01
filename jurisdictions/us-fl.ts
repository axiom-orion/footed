// Florida jurisdiction module.
//
// Target form: Florida Family Law Rules of Procedure Form 12.902(c) — the Long Form
// Financial Affidavit (filers with gross annual income of $50,000 or more), sworn under
// penalty of perjury. Child-support math derives from Fla. Stat. ch. 61.
//
// REGISTRY HONESTY: the lists below are a CURATED SEED of the authorities most commonly
// cited in Florida dissolution filings. They are deliberately NOT claimed to be complete.
// That is why an unrecognized-but-plausible citation resolves to "unknown" (needs human),
// never "malformed". We would rather send a real citation to a human than call it fake.

import type { Jurisdiction, AuthorityLookup } from "../engine/jurisdiction.ts";
import { defaultToAnnual } from "../engine/jurisdiction.ts";
import type { Frequency } from "../engine/types.ts";

// --- Recognized Florida family-law court forms (Fla. Fam. L. R. P.) ---
const KNOWN_FORMS = new Set<string>([
  "12.900(a)", // Disclosure from Nonlawyer
  "12.902(b)", // Family Law Financial Affidavit — Short Form
  "12.902(c)", // Family Law Financial Affidavit — Long Form
  "12.902(e)", // Child Support Guidelines Worksheet
  "12.285", //   Mandatory Disclosure
]);

// --- Recognized Florida statutes (Fla. Stat.), by chapter.section ---
const KNOWN_STATUTES = new Set<string>([
  "61.046", // Definitions
  "61.075", // Equitable distribution of marital assets and liabilities
  "61.08", //  Alimony
  "61.13", //  Support, parental responsibility, and time-sharing
  "61.14", //  Enforcement / modification of support
  "61.29", //  Child support guidelines; principles
  "61.30", //  Child support guidelines; the schedule
]);

// Abbreviations that clearly belong to OTHER jurisdictions — a dead giveaway that a
// drafting tool pasted the wrong state's law into a Florida filing.
const FOREIGN_MARKERS = [
  "c.g.s", //     Connecticut General Statutes
  "jd-fm", //     Connecticut Judicial Branch family form prefix
  "n.y.", //      New York
  "cal.", //      California
  "tex.", //      Texas
  "410 ilcs", //  Illinois
  "domestic relations law",
];

function normalize(citation: string): string {
  return citation.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Pull a "chapter.section" statute token (e.g. 61.30) if present. */
function statuteToken(norm: string): string | null {
  const m = norm.match(/(\d{1,3})\.(\d{1,4})/);
  return m ? `${m[1]}.${m[2]}` : null;
}

/** Pull a family-law rule/form token (e.g. 12.902(c) or 12.285) if present. */
function formToken(norm: string): string | null {
  const withSub = norm.match(/12\.\d{3}\([a-z]\)/); // 12.902(c)
  if (withSub) return withSub[0];
  const bare = norm.match(/12\.\d{3}/); // 12.285
  return bare ? bare[0] : null;
}

function classifyAuthority(citation: string): AuthorityLookup {
  const norm = normalize(citation);

  // 1) Wrong-jurisdiction citation → the classic hallucination/copy-paste error.
  if (FOREIGN_MARKERS.some((m) => norm.includes(m))) return "malformed";

  // 2) Court form / rule.
  const form = formToken(norm);
  if (form) {
    if (KNOWN_FORMS.has(form)) return "known";
    // A 12.9xx form-letter that isn't a real sub-part is malformed; otherwise unknown.
    const sub = form.match(/\(([a-z])\)/);
    if (sub && !"abcdefgh".includes(sub[1])) return "malformed";
    return "unknown";
  }

  // 3) Statute.
  const stat = statuteToken(norm);
  if (stat) {
    if (KNOWN_STATUTES.has(stat)) return "known";
    const chapter = stat.split(".")[0];
    // Florida dissolution law lives in ch. 61. A ch. 61 section we don't have is
    // plausibly real (unknown → human confirms). A citation that claims to be a
    // Florida family-law authority but sits in an implausible chapter is malformed.
    if (chapter === "61") return "unknown";
    // Mentions Florida explicitly but wrong chapter for family law → likely fabricated.
    if (norm.includes("fla") || norm.includes("f.s")) return "malformed";
    return "unknown";
  }

  // 4) Citation-shaped but we recognized no token at all → send to a human.
  return "unknown";
}

export const florida: Jurisdiction = {
  id: "us-fl",
  name: "Florida",
  formId: "Fla. Fam. L. R. P. 12.902(c) (Long Form Financial Affidavit)",
  registryNote:
    "Curated seed registry of commonly-cited Florida family-law authorities (Fla. Fam. L. R. P. forms + Fla. Stat. ch. 61). Intentionally partial: unrecognized-but-plausible citations resolve to 'needs human review', never 'fabricated'.",
  classifyAuthority,
  toAnnual(value: number, frequency: Frequency) {
    return defaultToAnnual(value, frequency);
  },
};
