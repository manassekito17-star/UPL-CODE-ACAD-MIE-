import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: `Règles d'utilisation de ${BRAND.name}.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Informations légales" title="Conditions d'utilisation" subtitle="Dernière mise à jour : 8 novembre 2026" />
      <Container className="prose-upl max-w-3xl space-y-6 py-10 text-gris-700">
        <section>
          <h2>1. Objet</h2>
          <p>
            {BRAND.name} propose gratuitement des cours, des exercices corrigés automatiquement, des outils de programmation et un professeur IA. Les contenus ne constituent pas le programme officiel de l&apos;université, sauf mention contraire validée par celle-ci.
          </p>
        </section>
        <section>
          <h2>2. Compte</h2>
          <ul>
            <li>Un compte est personnel : ne partagez pas votre mot de passe.</li>
            <li>Les informations fournies (nom, adresse e-mail) doivent être exactes.</li>
            <li>Vous pouvez demander la suppression de votre compte à tout moment.</li>
          </ul>
        </section>
        <section>
          <h2>3. Utilisation acceptable</h2>
          <p>Il est interdit :</p>
          <ul>
            <li>d&apos;utiliser les outils d&apos;exécution de code pour attaquer, surcharger ou contourner la sécurité de la plateforme ou d&apos;autres services ;</li>
            <li>de publier ou de transmettre des contenus illégaux, haineux ou portant atteinte aux droits d&apos;autrui ;</li>
            <li>de tenter d&apos;accéder aux données d&apos;autres utilisateurs.</li>
          </ul>
          <p>En cas de manquement, l&apos;administration peut suspendre le compte concerné.</p>
        </section>
        <section>
          <h2>4. Professeur IA</h2>
          <p>Les réponses du professeur IA sont produites automatiquement et peuvent contenir des erreurs : vérifiez-les, en particulier avant un examen. Des limites d&apos;utilisation quotidiennes s&apos;appliquent.</p>
        </section>
        <section>
          <h2>5. Disponibilité</h2>
          <p>Le service est fourni gratuitement, en l&apos;état. Nous faisons notre possible pour qu&apos;il reste disponible, mais il peut être interrompu pour maintenance ou en raison des limites des services d&apos;hébergement gratuits.</p>
        </section>
        <section>
          <h2>6. Données personnelles</h2>
          <p>
            Le traitement de vos données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.
          </p>
        </section>
      </Container>
    </>
  );
}
