// Synthetic Florida 12.902(c) Long Form Financial Affidavit — NO real client data.
//
// Seeded with three planted defects so the demo is honest and repeatable:
//   DEFECT 1 (foots)      : "Total Monthly Expenses" is stated $4,100 but its
//                           components sum to $3,700 — the columns don't add up.
//   DEFECT 2 (reconciles) : the retirement account asserts $185,000 with NO statement
//                           uploaded. It is material (requireSource) -> REFUSED, not
//                           quietly carried. THIS is the hero beat.
//   DEFECT 3 (authority)  : cites "C.G.S. § 46b-84" — a Connecticut statute pasted into
//                           a Florida filing. The classic drafting-tool citation error.
//
// It also carries honest middles: a plausible ch.61 statute we don't seed (amber /
// needs-human) and a blank mandatory field (an omission a human must resolve).

import type { Affidavit, SourceDoc } from "../engine/types.ts";

export const sources: SourceDoc[] = [
  {
    id: "paystub-2026-06",
    kind: "paystub",
    hash: "sha256:9f2a…paystub",
    lines: [{ id: "gross_monthly", label: "Gross monthly wages", value: 6500, frequency: "monthly" }],
  },
  {
    id: "bank-checking-2026-06",
    kind: "bank-statement",
    hash: "sha256:1c7b…checking",
    lines: [{ id: "ending_balance", label: "Ending balance", value: 12340 }],
  },
  // NOTE: no retirement-account statement is provided — that is the point of DEFECT 2.
];

export const affidavit: Affidavit = {
  jurisdiction: "us-fl",
  formId: "Fla. Fam. L. R. P. 12.902(c) (Long Form Financial Affidavit)",
  lines: [
    // --- Income (monthly) ---
    {
      id: "inc_wages",
      section: "Income",
      label: "Monthly gross wages / salary",
      kind: "input",
      value: 6500,
      frequency: "monthly",
      mandatory: true,
      sourceRef: { docId: "paystub-2026-06", docLineId: "gross_monthly" },
    },
    {
      id: "inc_wages_annual",
      section: "Income",
      label: "Annualized wages (consistency check)",
      kind: "declared",
      value: 78000,
      frequency: "annual",
      equivalentTo: "inc_wages",
    },
    {
      id: "inc_side",
      section: "Income",
      label: "Self-employment / side income",
      kind: "input",
      value: 800,
      frequency: "monthly",
    },
    {
      id: "inc_total",
      section: "Income",
      label: "Total monthly gross income",
      kind: "total",
      value: 7300,
      components: ["inc_wages", "inc_side"],
      mandatory: true,
    },

    // --- Expenses (monthly) ---
    { id: "exp_housing", section: "Expenses", label: "Housing", kind: "input", value: 2200 },
    { id: "exp_food", section: "Expenses", label: "Food & groceries", kind: "input", value: 900 },
    { id: "exp_transport", section: "Expenses", label: "Transportation", kind: "input", value: 600 },
    {
      // DEFECT 1: stated 4100, components sum to 3700.
      id: "exp_total",
      section: "Expenses",
      label: "Total monthly expenses",
      kind: "subtotal",
      value: 4100,
      components: ["exp_housing", "exp_food", "exp_transport"],
      mandatory: true,
    },
    {
      // Blank mandatory field — an omission, not "n/a".
      id: "exp_health",
      section: "Expenses",
      label: "Health insurance premium",
      kind: "input",
      value: null,
      mandatory: true,
    },

    // --- Assets ---
    {
      id: "ast_checking",
      section: "Assets",
      label: "Checking account",
      kind: "input",
      value: 12340,
      sourceRef: { docId: "bank-checking-2026-06", docLineId: "ending_balance" },
    },
    {
      // DEFECT 2 (HERO): material value asserted with no supporting statement.
      id: "ast_retirement",
      section: "Assets",
      label: "Retirement account (401k/IRA)",
      kind: "input",
      value: 185000,
      mandatory: true,
      requireSource: true,
    },
    {
      id: "ast_total",
      section: "Assets",
      label: "Total assets",
      kind: "total",
      value: 197340,
      components: ["ast_checking", "ast_retirement"],
    },

    // --- Cited authorities ---
    {
      id: "auth_support",
      section: "Authorities",
      label: "Child support basis",
      kind: "authority",
      citation: "Fla. Stat. § 61.30",
    },
    {
      // DEFECT 3: a Connecticut statute in a Florida filing.
      id: "auth_alimony",
      section: "Authorities",
      label: "Alimony basis",
      kind: "authority",
      citation: "C.G.S. § 46b-84",
    },
    {
      // Real-looking ch.61 section we don't seed -> honest amber, needs human.
      id: "auth_relocation",
      section: "Authorities",
      label: "Relocation basis",
      kind: "authority",
      citation: "Fla. Stat. § 61.13001",
    },
  ],
};
