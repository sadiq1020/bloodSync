import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/compatibility", "/login", "/register"],
      disallow: [
        "/admin",
        "/admin/*",
        "/donor",
        "/donor/*",
        "/my",
        "/my/*",
        "/requests/new",
        "/api/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
