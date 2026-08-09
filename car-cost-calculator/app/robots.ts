import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/signin", "/signup", "/dashboard", "/api/"],
    },
    sitemap: "https://car-cost-calculator.site/sitemap.xml",
  };
}
