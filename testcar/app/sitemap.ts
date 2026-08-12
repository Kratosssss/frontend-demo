import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = "https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/testcar/`, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/testcar/car/`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
