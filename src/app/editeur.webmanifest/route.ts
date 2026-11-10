import { BRAND } from "@/lib/brand";

/** Manifeste de l'application installable « UPL Algo » : l'éditeur d'algorithmes, utilisable sans Internet. */
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    id: "/editeur",
    name: `UPL Algo — ${BRAND.name}`,
    short_name: "UPL Algo",
    description: "Interpréteur d'algorithmes de UPL CODE ACADEMY MK : écrire, exécuter et comprendre ses algorithmes, même sans Internet.",
    lang: "fr",
    start_url: "/editeur?langage=pseudocode",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    // Vraie application (WebAPK sur Android, application sur PC) : pas de raccourci marqué du logo du navigateur.
    prefer_related_applications: false,
    orientation: "portrait",
    background_color: "#2b2b2b",
    theme_color: "#3c3f41",
    categories: ["education", "developer"],
    // Captures : fenêtre d'installation complète (« Installer l'application ») sur Android et sur ordinateur.
    screenshots: [
      { src: "/icons/editeur-capture-telephone.webp", sizes: "1080x1920", type: "image/webp", form_factor: "narrow", label: "Écrire et exécuter un algorithme sur téléphone" },
      { src: "/icons/editeur-capture-ordinateur.webp", sizes: "1280x800", type: "image/webp", form_factor: "wide", label: "UPL Algo sur ordinateur" },
    ],
    icons: [
      { src: "/icons/editeur-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/editeur-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/editeur-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/manifest+json; charset=utf-8" } });
}
