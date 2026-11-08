import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.siteUrl.replace(/\/+$/, "");
  // Seules les pages publiques sont indexées : le reste de la plateforme demande une connexion.
  const pages = ["", "/connexion", "/inscription", "/confidentialite", "/conditions"];
  return pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const }));
}
