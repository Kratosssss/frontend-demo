import type { Metadata } from "next";
import { ProductDetailPage } from "./product-detail-page";

export const metadata: Metadata = {
  title: "MX-C120 模块化工业连接器",
  description:
    "MATRILINK MX-C120 虚构产品详情演示，包含规格、品质验证、应用场景和工程资料下载。",
};

export default function Page() {
  return <ProductDetailPage />;
}
