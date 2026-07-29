import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SiteProvider } from "./site-context";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  const image = host ? `${protocol}://${host}/og.png` : undefined;

  return {
    title: {
      default: "矩联电气 MATRILINK｜工业连接系统演示",
      template: "%s｜MATRILINK",
    },
    description:
      "一个面向 HR 展示的虚构工业连接系统官网前端项目，包含产品筛选、详情、资料下载与中英文响应式体验。",
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      title: "矩联电气 MATRILINK｜工业连接系统演示",
      description:
        "工业编辑风的中英文响应式官网演示，覆盖首页、产品目录与产品详情。",
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "矩联电气 MATRILINK｜工业连接系统演示",
      description:
        "工业编辑风的中英文响应式官网演示，覆盖首页、产品目录与产品详情。",
      images: image ? [image] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">
          跳至主要内容
        </a>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
