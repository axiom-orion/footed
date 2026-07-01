// Emits both throwaway receipts to receipt/out/ so they can be eyeballed / deployed.
//   node --experimental-strip-types receipt/emit.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { verify } from "../engine/verify.ts";
import { florida } from "../jurisdictions/us-fl.ts";
import { affidavit, sources } from "../fixtures/fl-sample.ts";
import { selfApplication } from "../fixtures/self-application.ts";
import { renderReceipt } from "./render.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "out");
mkdirSync(outDir, { recursive: true });

const affidavitResult = verify(affidavit, sources, florida);
const affidavitHtml = renderReceipt(affidavitResult, {
  title: "Financial Affidavit — Trust Receipt",
  subtitle: florida.formId,
  registryNote: florida.registryNote,
  unit: "line",
});
writeFileSync(join(outDir, "affidavit.html"), affidavitHtml);

const selfHtml = renderReceipt(selfApplication, {
  title: "Application self-audit",
  subtitle: "The same check, turned on the applicant",
  unit: "filter",
});
writeFileSync(join(outDir, "self-audit.html"), selfHtml);

console.log(`affidavit.html  → ${affidavitResult.header} (${affidavitHtml.length} bytes)`);
console.log(`self-audit.html → ${selfApplication.header} (${selfHtml.length} bytes)`);
console.log(`out: ${outDir}`);
