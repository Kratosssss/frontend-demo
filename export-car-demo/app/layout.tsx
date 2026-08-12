import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com"),
  title: "EXPORTCAR | International Vehicle Export Concept Demo",
  description: "A multilingual concept demo for transparent vehicle export inventory and preparation.",
  alternates: { canonical: "/export-car-demo/" },
  openGraph: { type: "website", title: "EXPORTCAR | Vehicle Export Concept Demo", description: "Fictional export inventory and local inquiry experience.", images: ["/export-car-demo/images/hero.jpg"] },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
