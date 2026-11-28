import type { Metadata } from "next";
import { Resume } from "./resume";

export const metadata: Metadata = { title: "Ouverture", robots: { index: false } };

/** Page d'ouverture de l'application installée : renvoie à la dernière page de travail. */
export default function ReprendrePage() {
  return <Resume />;
}
