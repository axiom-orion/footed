// Footed — the Trust Receipt renderer.
//
// Produces ONE self-contained HTML string (no external assets) meant to be viewed once
// and thrown away. UX direction: a calm, warm, generous-whitespace SHELL (so it feels
// native to a family-law product) wrapped around a precise, clinical VERDICT layer
// (green / amber / red chips, monospace numbers) that a stressed reader can parse in
// seconds. Nothing here names any internal machinery — the verdict IS the argument.

import type { DocumentVerdict, LineVerdict, Verdict } from "../engine/types.ts";

interface ReceiptMeta {
  title: string; //     e.g. "Financial Affidavit — Trust Receipt"
  subtitle: string; //  e.g. the form id, or "Application self-audit"
  registryNote?: string;
  /** Word used for the unit under audit in the summary line, e.g. "line" or "filter". */
  unit?: string;
  /** Show the "mechanical pre-filing check / not legal advice" footnote (affidavit only). */
  legalBoundary?: boolean;
  /** Optional "built by" line — used on the applicant-facing tabs, never the demo. */
  contact?: { name: string; email: string; linkedin: string };
}

const PALETTE = {
  // Warm, calm shell (mimics an empathetic family-law brand).
  bg: "#f7f4ef",
  card: "#fffdfa",
  ink: "#2b2a27",
  muted: "#6f6a61",
  line: "#e7e1d6",
  // Clinical, contrasting verdict layer.
  green: "#1f7a4d",
  greenBg: "#e6f4ec",
  amber: "#9a6a00",
  amberBg: "#fbf1d9",
  red: "#b3261e",
  redBg: "#fbe9e7",
};

const VERDICT_LABEL: Record<Verdict, string> = {
  verified: "VERIFIED",
  unverified: "UNVERIFIED",
  refused: "REFUSED",
};

function chip(v: Verdict): string {
  const map = {
    verified: [PALETTE.green, PALETTE.greenBg],
    unverified: [PALETTE.amber, PALETTE.amberBg],
    refused: [PALETTE.red, PALETTE.redBg],
  } as const;
  const [fg, bg] = map[v];
  return `<span style="display:inline-block;font:600 11px/1.6 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;color:${fg};background:${bg};border:1px solid ${fg}33;border-radius:999px;padding:1px 9px;white-space:nowrap">${VERDICT_LABEL[v]}</span>`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function sourceTag(lv: LineVerdict): string {
  const withSource = lv.checks.find((c) => c.source);
  if (!withSource?.source) return "";
  return `<span style="font:500 11px/1.6 ui-monospace,monospace;color:${PALETTE.muted}"> · tied to ${esc(withSource.source.docId)} <span style="opacity:.7">(${esc(withSource.source.hash)})</span></span>`;
}

function lineRow(lv: LineVerdict): string {
  const reasons = lv.checks
    .map(
      (c) =>
        `<div style="font:400 13px/1.5 system-ui,sans-serif;color:${PALETTE.muted};margin-top:2px">${esc(c.reason)}</div>`,
    )
    .join("");
  const mand = lv.mandatory
    ? `<span style="font:600 10px/1.6 system-ui;color:${PALETTE.muted};text-transform:uppercase;letter-spacing:.05em"> · required</span>`
    : "";
  return `<div style="padding:12px 0;border-top:1px solid ${PALETTE.line}">
    <div style="display:flex;gap:12px;align-items:baseline;justify-content:space-between">
      <div style="font:600 14px/1.4 system-ui,sans-serif;color:${PALETTE.ink}">${esc(lv.label)}${mand}${sourceTag(lv)}</div>
      <div>${chip(lv.verdict)}</div>
    </div>
    ${reasons}
  </div>`;
}

/** Returns just the receipt block (a self-contained div) for embedding in a page. */
export function renderReceiptBody(result: DocumentVerdict, meta: ReceiptMeta): string {
  const unit = meta.unit ?? "line";
  const cleared = result.cleared;
  const bannerFg = result.counts.refused > 0 || result.blockers.length > 0 ? PALETTE.red : cleared ? PALETTE.green : PALETTE.amber;
  const bannerBg = result.counts.refused > 0 || result.blockers.length > 0 ? PALETTE.redBg : cleared ? PALETTE.greenBg : PALETTE.amberBg;

  // Group lines by section, preserving order.
  const sections: { name: string; lines: LineVerdict[] }[] = [];
  for (const lv of result.lines) {
    let s = sections.find((x) => x.name === lv.section);
    if (!s) {
      s = { name: lv.section, lines: [] };
      sections.push(s);
    }
    s.lines.push(lv);
  }

  const body = sections
    .map(
      (s) => `<section style="margin-top:22px">
        <h2 style="font:600 12px/1.4 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:${PALETTE.muted};margin:0 0 2px">${esc(s.name)}</h2>
        ${s.lines.map(lineRow).join("")}
      </section>`,
    )
    .join("");

  return `<div style="min-height:100vh;background:${PALETTE.bg};color:${PALETTE.ink};font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
  <main style="max-width:760px;margin:0 auto;padding:40px 24px 64px">
    <div style="font:600 12px/1.4 ui-monospace,monospace;letter-spacing:.14em;color:${PALETTE.muted};text-transform:uppercase">Footed</div>
    <h1 style="font:700 26px/1.25 system-ui,sans-serif;margin:6px 0 2px">${esc(meta.title)}</h1>
    <div style="font:400 14px/1.5 system-ui;color:${PALETTE.muted}">${esc(meta.subtitle)}</div>

    <div style="margin:22px 0 6px;padding:16px 18px;border-radius:12px;background:${bannerBg};border:1px solid ${bannerFg}33">
      <div style="font:700 18px/1.3 system-ui,sans-serif;color:${bannerFg}">${esc(result.header)}</div>
      <div style="font:500 13px/1.6 ui-monospace,monospace;color:${PALETTE.ink};margin-top:6px">
        ${result.counts.verified} verified · ${result.counts.unverified} unverified · ${result.counts.refused} refused
        <span style="color:${PALETTE.muted}">(of ${result.counts.total} ${esc(unit)}s)</span>
      </div>
    </div>

    ${body}

    <footer style="margin-top:32px;padding-top:16px;border-top:1px solid ${PALETTE.line};font:400 12px/1.6 system-ui;color:${PALETTE.muted}">
      <p style="margin:0 0 8px"><strong>How to read this:</strong> a figure is <em>verified</em> only when it was independently reconstructed from a source you provided (shown above). <em>Unverified</em> means we could not confirm it — not that it is wrong. <em>Refused</em> means it contradicts its source, is impossible, or is a value asserted with no substantiation. One unresolved required item blocks clearance by design.</p>
      ${meta.legalBoundary ? `<p style="margin:0 0 8px">This is a mechanical pre-filing check that flags items for a person to resolve. It does not give legal advice, reach conclusions, or rewrite the document — an attorney or the filer decides what to do with each flag.</p>` : ""}
      ${meta.registryNote ? `<p style="margin:0 0 8px"><strong>Registry:</strong> ${esc(meta.registryNote)}</p>` : ""}
      ${meta.contact ? `<p style="margin:0 0 8px">Built by ${esc(meta.contact.name)} · <a href="mailto:${esc(meta.contact.email)}" style="color:${PALETTE.ink}">${esc(meta.contact.email)}</a> · <a href="${esc(meta.contact.linkedin)}" style="color:${PALETTE.ink}">LinkedIn</a></p>` : ""}
      <p style="margin:0;opacity:.8">Generated on demand · disposable · not stored.</p>
    </footer>
  </main>
</div>`;
}

/** Wraps the receipt block in a full, standalone HTML document (for the CLI / skill). */
export function renderReceipt(result: DocumentVerdict, meta: ReceiptMeta): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(meta.title)}</title></head><body style="margin:0">${renderReceiptBody(result, meta)}</body></html>`;
}
