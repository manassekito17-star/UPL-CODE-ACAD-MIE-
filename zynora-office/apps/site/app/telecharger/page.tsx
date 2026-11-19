import type { Metadata } from "next";

import { RELEASE_URL } from "../content";
import { Downloads } from "./downloads";

export const metadata: Metadata = {
  title: "Télécharger",
  description: "Installateurs ZYNORA Office pour Windows, macOS, Linux et Android.",
};

export default function DownloadPage() {
  return (
    <section className="section">
      <p className="eyebrow">Version d&apos;aperçu</p>
      <h1>Télécharger ZYNORA Office</h1>
      <p className="lead">Choisissez votre système. Votre appareil est proposé en premier.</p>
      <Downloads />
      <p className="note">
        Tous les fichiers, leurs empreintes de vérification (SHA256SUMS.txt) et les notes de version sont sur la{" "}
        <a href={RELEASE_URL} rel="noopener">
          page de la version GitHub
        </a>
        .
      </p>
      <div className="warning" role="note">
        <strong>Version d&apos;aperçu.</strong> Les installateurs ne sont pas encore signés numériquement : Windows et macOS afficheront un avertissement au premier lancement. Gardez une copie de vos fichiers importants.
      </div>
    </section>
  );
}
