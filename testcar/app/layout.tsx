import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com"),
  title: "TestCar | China Auto Export Demo",
  description: "A multilingual automotive export showcase demo with vehicle filtering and local inquiry flow.",
  alternates: { canonical: "/testcar/" },
  openGraph: { type: "website", title: "TestCar | China Auto Export Demo", description: "Fictional automotive export showcase demo.", images: ["/testcar/images/hero-car.jpg"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
