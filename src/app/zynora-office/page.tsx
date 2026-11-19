import type { Metadata } from "next";
import { Card, Container, Notice, PageHeader } from "@/components/ui";
import { Downloads, RELEASE_URL } from "./downloads";

export const metadata: Metadata = {
  title: "ZYNORA Office — suite bureautique",
  description:
    "Téléchargez ZYNORA Office pour Windows, macOS, Linux et Android : tableur ZYNORA Sheets (formules, XLSX, CSV) utilisable hors connexion. Traitement de texte et présentations en préparation.",
};

const AVAILABLE = [
  "Tableur ZYNORA Sheets : ruban, barre de formule, plusieurs feuilles, barre d'état (somme, moyenne)",
  "Formules en français (SOMME, MOYENNE, SI, NB.SI, RECHERCHEV…) calculées par le moteur IronCalc",
  "Mise en forme : gras, italique, couleurs, alignements, formats de nombre, fusion",
  "Ouverture et enregistrement XLSX (compatibles Excel et LibreOffice) et CSV",
  "Sauvegarde automatique et récupération après une coupure",
  "Bibliothèque de documents : import vérifié, dossiers, favoris, corbeille avec restauration",
  "Fonctionne sans Internet ; thèmes clair et sombre ; français et anglais",
];

const COMING = [
  "Tableur : onglets complets (Insertion, Formules, Données, Révision, Affichage), bordures, tri, filtres, graphiques, impression et PDF",
  "ZYNORA Word : traitement de texte (DOCX, ODT, PDF)",
  "ZYNORA Slides : présentations (PPTX, PDF)",
  "Version iPhone et iPad",
];

export default function ZynoraOfficePage() {
  return (
    <>
      <PageHeader
        eyebrow="Suite bureautique"
        title="ZYNORA Office"
        subtitle="Une suite bureautique indépendante pour Windows, macOS, Linux et Android, utilisable hors connexion. Le tableur ZYNORA Sheets est disponible dès maintenant."
      />
      <Container className="space-y-10 py-8">
        <div className="flex flex-wrap items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/zynora-office.png" alt="Icône ZYNORA Office" width={96} height={96} className="h-24 w-24 rounded-3xl shadow-md" />
          <p className="max-w-2xl text-gris-700">
            Version <b>d&apos;aperçu</b>, compilée et testée automatiquement sur les trois systèmes d&apos;exploitation à chaque modification. Les calculs du tableur sont réalisés par un vrai moteur de calcul : rien n&apos;est simulé.
          </p>
        </div>

        <section aria-labelledby="telecharger">
          <h2 id="telecharger" className="mb-4 text-2xl font-bold text-nuit-900">
            Télécharger
          </h2>
          <Downloads />
          <p className="mt-4 text-sm text-gris-600">
            Tous les fichiers, leurs empreintes de vérification (SHA256SUMS.txt) et les notes de version sont sur la{" "}
            <a href={RELEASE_URL} className="font-semibold text-electrique-600 underline" rel="noopener">
              page de la version GitHub
            </a>
            .
          </p>
        </section>

        <Notice tone="alerte" title="Version d'aperçu">
          Les installateurs ne sont pas encore signés numériquement : Windows et macOS afficheront un avertissement au premier lancement. Gardez une copie de vos fichiers importants.
        </Notice>

        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-5" data-testid="disponible">
            <h2 className="mb-3 text-lg font-bold text-nuit-900">Disponible aujourd&apos;hui</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gris-700">
              {AVAILABLE.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-5" data-testid="a-venir">
            <h2 className="mb-3 text-lg font-bold text-nuit-900">En préparation</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gris-700">
              {COMING.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Container>
    </>
  );
}
