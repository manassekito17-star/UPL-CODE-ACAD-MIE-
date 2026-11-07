import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

/** Les espaces privés (administration, API, espace personnel) ne sont pas indexés. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/tableau-de-bord", "/profil", "/bulletin", "/mes-programmes", "/certificats"] }],
    sitemap: `${publicEnv.siteUrl.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
