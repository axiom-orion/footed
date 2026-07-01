// Footed — core types.
//
// Design rule (load-bearing): a value is only ever VERIFIED when it has been
// mechanically reconstructed from an independent source. Absence of evidence is
// rendered as distrust ("UNVERIFIED"), never silently passed. A contradiction is
// "REFUSED". One unbacked mandatory line fails the whole document. The language
// here is plain on purpose — the epistemology lives in the behavior, not in labels.

/** The only three states a claim can hold. Severity order: refused > unverified > verified. */
export type Verdict = "verified" | "unverified" | "refused";

/** How often a money figure recurs. Used to normalize weekly/monthly/annual tie-outs. */
export type Frequency = "weekly" | "biweekly" | "semimonthly" | "monthly" | "annual" | "once";

/** What a given affidavit line IS, which decides which checks apply to it. */
export type LineKind =
  | "input" //        a raw figure the filer entered (income/expense/asset/liability)
  | "subtotal" //     a section sum that must foot from its components
  | "total" //        a grand total that must foot from its components
  | "declared" //     a stated equivalence across frequencies (e.g. weekly vs annual of the same stream)
  | "authority"; //   a cited statute / rule / court-form number

/** A single line on the affidavit. */
export interface AffidavitLine {
  id: string;
  section: string;
  label: string;
  kind: LineKind;
  /** Money value in dollars (2dp). null = left blank. Not applicable to `authority`. */
  value?: number | null;
  /** For income/expense figures, the recurrence — enables cross-frequency tie-outs. */
  frequency?: Frequency;
  /** True if the jurisdiction requires this line; a blank mandatory line is fail-closed. */
  mandatory?: boolean;
  /** For subtotal/total: the ids of the lines this figure should sum. */
  components?: string[];
  /** For a line that should tie to evidence: the claimed backing document + line. */
  sourceRef?: { docId: string; docLineId: string };
  /**
   * Materiality flag. When true, asserting a value with NO valid backing document is
   * treated as a contradiction (refused), not a soft gap — asserting a specific dollar
   * figure under oath with zero substantiation is worse than leaving it blank. This is
   * what makes the hero retirement-account line REFUSE instead of quietly averaging out.
   */
  requireSource?: boolean;
  /** For `declared`: the id of the other line this one must be frequency-equivalent to. */
  equivalentTo?: string;
  /** For `authority`: the citation exactly as written on the form. */
  citation?: string;
}

/** A financial affidavit under audit (jurisdiction-shaped, but the engine is generic). */
export interface Affidavit {
  jurisdiction: string; // e.g. "us-xx"
  formId: string; //      the official form number, per the jurisdiction module
  lines: AffidavitLine[];
}

/** One line of independent evidence (a paystub row, a statement balance, a tax figure). */
export interface SourceDocLine {
  id: string;
  label: string;
  value: number;
  frequency?: Frequency;
}

/** An uploaded source document. `hash` is what a VERIFIED line points back to. */
export interface SourceDoc {
  id: string;
  kind: string; // "paystub" | "bank-statement" | "tax-return" | ...
  hash: string;
  lines: SourceDocLine[];
}

/** The four deterministic passes. */
export type CheckName = "foots" | "reconciles" | "complete" | "authority";

/** The result of one check against one line. */
export interface CheckResult {
  check: CheckName;
  verdict: Verdict;
  /** Plain-language reason (this is the ONLY text an LLM may later rephrase). */
  reason: string;
  /** The recomputed value, when the check produced one — proof, not assertion. */
  recomputed?: number;
  /** The exact source the line was (or was not) reconciled against. */
  source?: { docId: string; docLineId: string; hash: string };
}

/** The rolled-up verdict for a single line: the worst of its applicable checks. */
export interface LineVerdict {
  lineId: string;
  label: string;
  section: string;
  mandatory: boolean;
  verdict: Verdict;
  checks: CheckResult[];
}

/** The whole-document disposition. Fail-closed: defaults to NOT cleared. */
export interface DocumentVerdict {
  jurisdiction: string;
  formId: string;
  cleared: boolean;
  header: string; //   the one-line human disposition, e.g. "NOT CLEARED FOR FILING"
  counts: { verified: number; unverified: number; refused: number; total: number };
  lines: LineVerdict[];
  /** Ids of the specific lines that blocked clearance (drives the hero REFUSAL beat). */
  blockers: string[];
}
