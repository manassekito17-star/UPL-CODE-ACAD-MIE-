import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

/** Manifeste d'application web (nom affiché à l'installation sur téléphone ou ordinateur). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "UPL CODE MK",
    description: BRAND.description,
    lang: "fr",
    id: "/",
    // Installée sur le téléphone, l'application s'ouvre sur l'espace de l'étudiant (connexion d'abord si besoin).
    start_url: "/tableau-de-bord",
    scope: "/",
    display: "standalone",
    background_color: "#0a1a3a",
    theme_color: "#0a1a3a",
    categories: ["education"],
    icons: [
      { src: "/icons/site-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/site-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/site-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
