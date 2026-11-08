import type { MetadataRoute } from "next";
import { staticCourses } from "@/content";
import { publicEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.siteUrl.replace(/\/+$/, "");
  const pages = ["", "/formation", "/formations", "/exercices", "/editeur", "/ide", "/laboratoire", "/connexion", "/inscription", "/confidentialite", "/conditions"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const })),
    ...staticCourses.filter((c) => c.status === "publie").map((c) => ({ url: `${base}/formations/${c.slug}`, changeFrequency: "monthly" as const })),
  ];
}
