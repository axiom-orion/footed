// Footed — self-test. Runs the engine over the seeded Florida sample and asserts the
// fail-closed behavior actually holds. Run with:
//   node --experimental-strip-types engine/selftest.ts

import { verify } from "./verify.ts";
import { florida } from "../jurisdictions/us-fl.ts";
import { affidavit, sources } from "../fixtures/fl-sample.ts";

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

console.log(
  process.exitCode === 1 ? "\n❌ self-test FAILED\n" : "\n✅ self-test passed — fail-closed behavior holds\n",
);
