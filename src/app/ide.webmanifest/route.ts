import { BRAND } from "@/lib/brand";

/** Manifeste de l'application installable « UPL IDE » (écran d'accueil du téléphone, ordinateur). */
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    id: "/ide",
    name: `UPL IDE — ${BRAND.name}`,
    short_name: "UPL IDE",
    description: "Éditeur de code de UPL CODE ACADEMY MK : HTML, CSS, JavaScript, Python, pseudocode, utilisable sans Internet.",
    lang: "fr",
    start_url: "/ide",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#181818",
    theme_color: "#181818",
    categories: ["education", "developer"],
    icons: [
      { src: "/icons/ide-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/ide-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/ide-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/manifest+json; charset=utf-8" } });
}
