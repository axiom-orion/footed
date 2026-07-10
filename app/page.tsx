import { verify } from "../engine/verify.ts";
import { florida } from "../jurisdictions/us-fl.ts";
import { affidavit, sources } from "../fixtures/fl-sample.ts";
import { selfApplication } from "../fixtures/self-application.ts";
import { trackRecord } from "../fixtures/track-record.ts";
import { renderReceiptBody } from "../receipt/render.ts";

// The whole point: it runs on load. A busy reader clicks one URL and the check has
// already run on the seeded sample. No upload step, no login, nothing persistent.
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const v = view === "self" ? "self" : view === "track" ? "track" : "affidavit";

  const contact = {
    name: "Ryan Cason",
    email: "ryan@vorion.org",
    linkedin: "https://www.linkedin.com/in/ryan-cason-0b49103b7/",
  };

  const html =
    v === "self"
      ? renderReceiptBody(selfApplication, {
          title: "Application self-audit",
          subtitle: "The same check, turned on the applicant",
          unit: "filter",
          contact,
        })
      : v === "track"
        ? renderReceiptBody(trackRecord, {
            title: "Track record",
            subtitle: "The same check, run on shipped work",
            unit: "project",
            contact,
          })
        : renderReceiptBody(verify(affidavit, sources, florida), {
            title: "Financial Affidavit — Trust Receipt",
            subtitle: florida.formId,
            registryNote: florida.registryNote,
            unit: "line",
            legalBoundary: true,
          });

  const tab = (href: string, label: string, active: boolean) => (
    <a
      href={href}
      style={{
        font: "600 13px/1 system-ui,sans-serif",
        textDecoration: "none",
        padding: "8px 14px",
        borderRadius: 999,
        color: active ? "#2b2a27" : "#6f6a61",
        background: active ? "#fffdfa" : "transparent",
        border: active ? "1px solid #e7e1d6" : "1px solid transparent",
      }}
    >
      {label}
    </a>
  );

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: "center",
          padding: "10px",
          background: "#f7f4efcc",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid #e7e1d6",
        }}
      >
        {tab("/", "Affidavit", v === "affidavit")}
        {tab("/?view=self", "Self-audit", v === "self")}
        {tab("/?view=track", "Track record", v === "track")}
      </nav>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
