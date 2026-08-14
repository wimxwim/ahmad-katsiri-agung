import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/masuk", "/admin/", "/keystatic/"],
    },
    sitemap: "https://akalcenter.my.id/sitemap.xml",
  };
}
