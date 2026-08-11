import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/industry-mainpage",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
