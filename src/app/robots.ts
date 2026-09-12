import type { MetadataRoute } from "next";

import { siteConfig } from "@/src/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/login",
          "/register",
          "/verify-email",
          "/dashboard",
          "/projects",
          "/settings",
          "/invitations",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}