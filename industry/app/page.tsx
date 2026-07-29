import type { Metadata } from "next";
import { HomePage } from "./home-page";

export const metadata: Metadata = {
  title: "工业连接系统演示",
  description:
    "面向智能制造、新能源与轨道交通的虚构工业连接系统前端演示项目。",
};

export default function Home() {
  return <HomePage />;
}
