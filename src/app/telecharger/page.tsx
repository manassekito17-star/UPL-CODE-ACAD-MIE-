import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { InstallApps } from "./install-apps";

export const metadata: Metadata = {
  title: "Télécharger l'application",
  description: "Installez UPL CODE ACADEMY MK, UPL IDE et UPL Algo sur votre téléphone (Android, iPhone) ou votre ordinateur, avec leur propre icône.",
};

export default function DownloadPage() {
  return (
    <>
      <PageHeader title="Télécharger l'application" subtitle="Installez les applications UPL sur votre téléphone ou votre ordinateur : une icône sur l'écran d'accueil, ouverture en plein écran, comme une vraie application." />
      <Container className="py-8">
        <InstallApps />
      </Container>
    </>
  );
}
