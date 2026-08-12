import type { NextConfig } from "next";

const nextConfig: NextConfig = { output: "export", basePath: "/export-car-demo", trailingSlash: true, images: { unoptimized: true }, allowedDevOrigins: ["127.0.0.1", "localhost"] };
export default nextConfig;
