import type { Metadata, Viewport } from "next";
import { TexteStudio } from "@/components/texte/texte-studio";

export const metadata: Metadata = {
  title: "ZENTECH Texte",
  description: "Éditeur de texte pour développeurs : aller à n'importe quoi (Ctrl+P), palette de commandes, curseurs multiples, recherche, exécution Ctrl+B, vues fractionnées, préférences en JSON.",
};

export const viewport: Viewport = { themeColor: "#262c33", width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover" };

export default function TextePage() {
  return <TexteStudio />;
}
