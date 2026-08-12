import type { MetadataRoute } from "next";
export const dynamic = "force-static";
const base = "https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/export-car-demo";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: `${base}/`, changeFrequency: "monthly", priority: 1 }, { url: `${base}/car/`, changeFrequency: "monthly", priority: 0.7 }]; }
