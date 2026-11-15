// Footed — self-test. Runs the engine over the seeded Florida sample and asserts the
// fail-closed behavior actually holds. Run with:
//   node --experimental-strip-types engine/selftest.ts

import { verify } from "./verify.ts";
import { florida } from "../jurisdictions/us-fl.ts";
import { affidavit, sources } from "../fixtures/fl-sample.ts";
import { selfApplication } from "../fixtures/self-application.ts";
import { trackRecord } from "../fixtures/track-record.ts";

const result = verify(affidavit, sources, florida);

console.log(`\nForm:   ${result.formId}`);
console.log(`State:  ${result.jurisdiction}`);
console.log(`Header: ${result.header}`);
console.log(
  `Counts: ${result.counts.verified} verified · ${result.counts.unverified} unverified · ${result.counts.refused} refused (of ${result.counts.total})\n`,
);

for (const lv of result.lines) {
  const mark = lv.verdict === "verified" ? "OK " : lv.verdict === "unverified" ? "?? " : "XX ";
  console.log(`${mark}[${lv.verdict.toUpperCase()}] ${lv.label}`);
  for (const c of lv.checks) console.log(`        ${c.check}: ${c.reason}`);
}

// --- assertions: the three planted defects must be caught, honest middles preserved ---
const byId = new Map(result.lines.map((l) => [l.lineId, l]));
const expect = (name: string, cond: boolean) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) process.exitCode = 1;
};

console.log("\n--- assertions ---");
expect("DEFECT 1: expense subtotal REFUSED (doesn't foot)", byId.get("exp_total")?.verdict === "refused");
expect("DEFECT 2: retirement account REFUSED (no statement)", byId.get("ast_retirement")?.verdict === "refused");
expect("DEFECT 3: Connecticut citation REFUSED (wrong state)", byId.get("auth_alimony")?.verdict === "refused");
expect("HONEST AMBER: unseeded FL statute UNVERIFIED", byId.get("auth_relocation")?.verdict === "unverified");
expect("HONEST AMBER: blank mandatory field UNVERIFIED", byId.get("exp_health")?.verdict === "unverified");
expect("GREEN: wages reconcile to paystub", byId.get("inc_wages")?.verdict === "verified");
expect("GREEN: known FL statute verified", byId.get("auth_support")?.verdict === "verified");
expect("GREEN: subtotal that foots is verified", byId.get("inc_total")?.verdict === "verified");
expect("DOCUMENT: not cleared for filing", result.cleared === false);
expect("DOCUMENT: exactly 3 refusals", result.counts.refused === 3);

// --- evidence: receipts must not cite a retired host (the whole Vercel account is retired) ---
const RETIRED_HOST = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app\b/i;
const citesRetiredHost = (text: string) => RETIRED_HOST.test(text);

// Every string anywhere in a value, with a label saying where it came from.
const stringsIn = (value: unknown, where: string): Array<[string, string]> => {
  if (typeof value === "string") return [[where, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => stringsIn(v, `${where}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => stringsIn(v, `${where}.${k}`));
  return [];
};

// Offending lineIds per receipt fixture (non-line strings are reported by their path).
const retiredCitations = (name: string, value: unknown): string[] => {
  const hits = new Set<string>();
  for (const [where, text] of stringsIn(value, name)) {
    if (!citesRetiredHost(text)) continue;
    const lineId = /\.lines\[(\d+)\]/.exec(where);
    const doc = value as { lines?: Array<{ lineId: string }> };
    hits.add(lineId && doc.lines ? `${name}:${doc.lines[Number(lineId[1])].lineId}` : where);
  }
  return [...hits];
};

const retired = [
  ...retiredCitations("fl-sample", result),
  ...retiredCitations("fl-sample.affidavit", affidavit),
  ...retiredCitations("fl-sample.sources", sources),
  ...retiredCitations("self-application", selfApplication),
  ...retiredCitations("track-record", trackRecord),
];

expect(
  "EVIDENCE: planted retired-host citation is caught",
  citesRetiredHost("Reconciled to live, deployed Next.js apps: footed-eight.vercel.app (this tool).") &&
    !citesRetiredHost("Reconciled to live, deployed Next.js apps: flcason.com and github.com/axiom-orion/footed."),
);
expect("EVIDENCE: no receipt cites a retired host", retired.length === 0);
if (retired.length > 0) console.log(`        retired-host citations: ${retired.join(", ")}`);

console.log(
  process.exitCode === 1 ? "\n❌ self-test FAILED\n" : "\n✅ self-test passed — fail-closed behavior holds\n",
);
