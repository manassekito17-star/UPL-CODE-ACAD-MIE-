import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

/** Manifeste d'application web (nom affiché à l'installation sur téléphone ou ordinateur). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "ZENTECH",
    description: BRAND.description,
    lang: "fr",
    id: "/",
    // Installée sur le téléphone, l'application rouvre la dernière page de travail (sinon l'espace de l'étudiant).
    start_url: "/reprendre",
    scope: "/",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#020817",
    categories: ["education"],
    icons: [
      { src: "/icons/site-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/site-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/site-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
