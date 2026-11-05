import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

/** Manifeste d'application web (nom affiché à l'installation sur téléphone ou ordinateur). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "UPL CODE MK",
    description: BRAND.description,
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a1a3a",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
