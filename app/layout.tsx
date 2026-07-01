import type { ReactNode } from "react";

export const metadata = {
  title: "Footed — pre-filing Trust Receipt",
  description:
    "On-demand, fail-closed check for a financial affidavit. Flags items for a human to resolve; never rewrites, never advises.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
