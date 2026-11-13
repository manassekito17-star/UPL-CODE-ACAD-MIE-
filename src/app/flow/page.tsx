import type { Metadata } from "next";
import { FlowStudioLoader } from "./loader";

export const metadata: Metadata = {
  title: "UPL Flow Studio",
  description: "Organigrammes, pseudocode et exécution pas à pas : dessinez votre algorithme, il s'exécute réellement avec l'interpréteur UPL.",
};

export default function FlowPage() {
  return <FlowStudioLoader />;
}
