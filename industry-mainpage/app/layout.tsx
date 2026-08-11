import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "./components";
import { SiteProvider } from "./site-context";

export const metadata: Metadata = {
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
    },
    twitter: {
      card: "summary_large_image",
      title: "矩联电气 MATRILINK｜工业连接系统演示",
      description:
        "工业编辑风的中英文响应式官网演示，覆盖首页、产品目录与产品详情。",
    },
  };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteProvider>
          <SkipLink />
          {children}
        </SiteProvider>
      </body>
    </html>
  );
}
