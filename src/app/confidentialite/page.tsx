import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { publicEnv } from "@/lib/env";
import { IMPORTANT_NOTICE } from "@/lib/announcement";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Données personnelles traitées par ${BRAND.name}, finalités, services utilisés et droits des utilisateurs.`,
};

const UPDATED = "15 novembre 2026";

export default function PrivacyPage() {
  const contact = publicEnv.contactEmail;
  return (
    <>
      <PageHeader eyebrow="Informations légales" title="Politique de confidentialité" subtitle={`Dernière mise à jour : ${UPDATED}`} />
      <Container className="prose-upl max-w-3xl space-y-6 py-10 text-gris-700">
        <section className="rounded-xl border-l-4 border-[#f28c28] bg-amber-50 p-5" data-testid="confidentialite-avis-important">
          <h2>{IMPORTANT_NOTICE.eyebrow} — {IMPORTANT_NOTICE.title}</h2>
          {IMPORTANT_NOTICE.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>

        <section>
          <h2>1. Qui sommes-nous ?</h2>
          <p>
            {BRAND.name} est une plateforme gratuite d&apos;apprentissage de la programmation destinée aux étudiants de l&apos;UPL et aux étudiants en informatique. Cette page explique quelles données nous traitons, pourquoi, et quels sont vos droits.
          </p>
        </section>

        <section>
          <h2>2. Données collectées</h2>
          <ul>
            <li><strong>Compte</strong> : nom complet, adresse e-mail et mot de passe (stocké uniquement sous forme chiffrée par notre service d&apos;authentification ; nous ne le voyons jamais).</li>
            <li>
              <strong>Connexion avec Google</strong> : si vous choisissez « Continuer avec Google », nous recevons uniquement votre <strong>nom</strong>, votre <strong>adresse e-mail</strong> et votre <strong>photo de profil</strong>. Nous n&apos;avons accès ni à vos e-mails, ni à vos contacts, ni à vos fichiers Google.
            </li>
            <li><strong>Activité d&apos;apprentissage</strong> : chapitres consultés, réponses aux quiz et examens, exercices soumis et leurs résultats, programmes et projets enregistrés, certificats obtenus.</li>
            <li><strong>Professeur IA</strong> : les questions que vous posez et les réponses obtenues, pour afficher votre historique et respecter les limites d&apos;utilisation.</li>
            <li><strong>Données techniques</strong> : date de dernière visite et journal des actions sensibles (inscription, modifications de compte), qui peut contenir l&apos;adresse IP, pour la sécurité de la plateforme.</li>
          </ul>
        </section>

        <section>
          <h2>3. Pourquoi ces données sont utilisées</h2>
          <ul>
            <li>créer et sécuriser votre compte, et vous permettre de vous connecter ;</li>
            <li>enregistrer votre progression, corriger vos exercices et délivrer vos certificats ;</li>
            <li>permettre à l&apos;équipe pédagogique et à l&apos;administration de la plateforme de suivre la progression des étudiants ;</li>
            <li>produire des statistiques d&apos;utilisation globales (nombre d&apos;inscrits, d&apos;utilisateurs actifs) ;</li>
            <li>prévenir les abus (limites d&apos;essais, suspension de comptes).</li>
          </ul>
          <p>
            Nous ne vendons pas vos données, nous n&apos;affichons pas de publicité et nous n&apos;utilisons pas vos données pour du profilage commercial. Les projets de l&apos;IDE restent privés : seul leur propriétaire peut les lire.
          </p>
        </section>

        <section>
          <h2>4. Données Google</h2>
          <p>
            L&apos;utilisation des informations reçues des API Google respecte la{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">politique relative aux données utilisateur des services API Google</a>, y compris les exigences d&apos;utilisation limitée. Ces informations servent uniquement à créer votre compte, à vous identifier et à afficher votre nom et votre photo sur la plateforme. Elles ne sont ni transférées, ni vendues, ni utilisées à d&apos;autres fins.
          </p>
        </section>

        <section>
          <h2>5. Services utilisés</h2>
          <ul>
            <li><strong>Supabase</strong> : base de données et authentification (serveurs situés dans l&apos;Union européenne).</li>
            <li><strong>Vercel</strong> : hébergement du site.</li>
            <li><strong>Google</strong> : uniquement si vous utilisez « Continuer avec Google ».</li>
            <li><strong>Exécution du code</strong> : le pseudocode, Python et JavaScript s&apos;exécutent dans votre navigateur. Pour le C et le Java, le code est envoyé à un service d&apos;exécution isolé, seulement si ce service est activé.</li>
            <li><strong>Professeur IA</strong> : si un fournisseur d&apos;intelligence artificielle est connecté, votre question et le code concerné lui sont transmis pour produire la réponse.</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies et stockage local</h2>
          <p>
            Nous utilisons uniquement les cookies nécessaires à la connexion (session). Votre navigateur conserve aussi vos préférences d&apos;affichage et vos brouillons de code (stockage local), qui ne quittent pas votre appareil. Aucun cookie publicitaire ni de mesure d&apos;audience externe n&apos;est utilisé.
          </p>
        </section>

        <section>
          <h2>7. Durée de conservation</h2>
          <p>Vos données sont conservées tant que votre compte existe. Lorsque votre compte est supprimé, vos données personnelles et votre activité sont effacées.</p>
        </section>

        <section>
          <h2>8. Vos droits</h2>
          <p>
            Vous pouvez demander l&apos;accès à vos données, leur correction ou la suppression de votre compte. Vous pouvez modifier votre nom depuis votre <Link href="/profil">profil</Link>.
            {contact ? (
              <>
                {" "}Pour toute autre demande, écrivez à <a href={`mailto:${contact}`}>{contact}</a>.
              </>
            ) : (
              <> Pour toute autre demande, contactez l&apos;administration de la plateforme.</>
            )}{" "}
            Si vous vous êtes connecté avec Google, vous pouvez aussi retirer l&apos;accès à tout moment depuis{" "}
            <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">votre compte Google</a>.
          </p>
        </section>

        <p className="text-sm">
          Voir aussi les <Link href="/conditions">conditions d&apos;utilisation</Link>.
        </p>
      </Container>
    </>
  );
}
