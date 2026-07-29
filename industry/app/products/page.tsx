import type { Metadata } from "next";
import { ProductsPage } from "./products-page";

export const metadata: Metadata = {
  title: "产品目录",
  description:
    "浏览 MATRILINK 虚构工业连接产品，体验关键词、产品系列和应用场景筛选。",
};

export default function Page() {
  return <ProductsPage />;
}
