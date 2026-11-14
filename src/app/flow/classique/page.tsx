import type { Metadata, Viewport } from "next";
import { LarpStudioLoader } from "./loader";

export const metadata: Metadata = {
  title: "UPL Algo Classique (compatible LARP)",
  description: "Interface d'algorithmique classique compatible LARP : pseudo-code et organigrammes, console et exécution pas-à-pas, à la même place que sur l'ordinateur du professeur.",
};

// Pas de zoom automatique du navigateur quand on touche un champ (l'interface gère son propre zoom).
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export default function LarpPage() {
  return <LarpStudioLoader />;
}
