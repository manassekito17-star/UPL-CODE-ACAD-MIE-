import { EditorDemo } from "@/components/home/editor-demo";
import { CourseCard } from "@/components/learning/course-card";
import { ButtonLink, Card, Container } from "@/components/ui";
import { GoogleButton } from "@/components/auth/google-button";
import { QuickAccessForm } from "@/components/auth/quick-access-form";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { listCourses } from "@/lib/content/repository";

const FEATURES = [
  { icon: "📚", title: "Des cours structurés", text: "Neuf parcours en quatre niveaux (très débutant à professionnel) : algorithmique, HTML, CSS, Python, C, JavaScript, Java, PHP et SQL, avec objectifs, exemples, projets et résumés." },
  { icon: "⌨️", title: "Un éditeur intégré", text: "Écrivez et exécutez du pseudocode, du Python, du C, du JavaScript ou du Java directement dans le navigateur, même sur téléphone." },
  { icon: "✅", title: "Des exercices corrigés", text: "Des tests automatiques vérifient votre programme et une correction pédagogique vous explique la solution." },
  { icon: "🤖", title: "Un professeur IA", text: "Il explique les notions, analyse vos erreurs et vous guide par des indices progressifs, sans faire le travail à votre place." },
  { icon: "📈", title: "Un suivi de progression", text: "Leçons terminées, exercices réussis, temps d'apprentissage, badges : visualisez vos progrès." },
  { icon: "🎓", title: "Préparer les évaluations", text: "Quiz, évaluations finales et entraînement ciblé pour réussir vos TD, interrogations et examens." },
];

export default async function HomePage() {
  const [courses, user] = await Promise.all([listCourses(), getCurrentUser()]);
  return (
    <>
      <section className="relative overflow-hidden bg-nuit-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(47,116,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.18),transparent_50%)]" />
        <Container className="relative grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-block rounded-full border border-cyan-accent/40 bg-cyan-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-accent">
              LEARN. CODE. PRACTICE. MASTER.
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Apprendre à programmer, <span className="bg-gradient-to-r from-electrique-400 to-cyan-accent bg-clip-text text-transparent">de la théorie à la pratique.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-gray-300">
              UPL CODE ACADEMY MK réunit cours, éditeur de code, exercices corrigés automatiquement et professeur IA pour développer votre logique et maîtriser l&apos;algorithmique, HTML, CSS, Python, le C, JavaScript et Java, du niveau très débutant au niveau professionnel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={user ? "/tableau-de-bord" : "/formation"} size="lg">
                {user ? "Reprendre ma formation" : "Commencer la formation"}
              </ButtonLink>
              <ButtonLink href="/editeur" size="lg" variant="clair">
                Ouvrir l&apos;éditeur
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              <div><dt className="text-xs text-gray-400">Parcours</dt><dd className="text-2xl font-bold">{courses.length}</dd></div>
              <div><dt className="text-xs text-gray-400">Leçons</dt><dd className="text-2xl font-bold">{courses.reduce((n, c) => n + c.lessonCount, 0)}</dd></div>
              <div><dt className="text-xs text-gray-400">Exercices</dt><dd className="text-2xl font-bold">{courses.reduce((n, c) => n + c.exerciseCount, 0)}</dd></div>
            </dl>
          </div>
          <div className="min-w-0">
            <EditorDemo />
            <p className="mt-2 text-center text-xs text-gray-400">Essayez : cliquez sur « Exécuter ». Le pseudocode est interprété directement dans votre navigateur.</p>
          </div>
        </Container>
      </section>

      {!user && isSupabaseConfigured() && (
        <section className="border-b border-gris-200 bg-gris-50 py-12" aria-labelledby="acces-plateforme" id="acces">
          <Container>
            <h2 id="acces-plateforme" className="text-2xl font-bold text-nuit-900 sm:text-3xl">Accéder à la plateforme</h2>
            <p className="mt-2 max-w-2xl text-gris-700">Deux possibilités, sans mot de passe à retenir.</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-1 text-lg font-bold text-nuit-900">Option A — Continuer avec Google</h3>
                <p className="mb-4 text-sm text-gris-700">Choisissez votre compte Gmail : votre profil est créé automatiquement et vous le retrouvez sur tous vos appareils.</p>
                {publicEnv.googleAuth ? <GoogleButton /> : <p className="text-sm text-gris-500">Connexion Google non configurée sur cette installation.</p>}
              </Card>
              <Card className="p-6">
                <h3 className="mb-1 text-lg font-bold text-nuit-900">Option B — Accès rapide avec un profil</h3>
                <p className="mb-4 text-sm text-gris-700">Remplissez votre profil et entrez directement dans votre espace.</p>
                <QuickAccessForm />
              </Card>
            </div>
          </Container>
        </section>
      )}

      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold text-nuit-900 sm:text-3xl">Les formations</h2>
          <p className="mt-2 max-w-2xl text-gris-700">Le parcours Algorithmique est la base commune. Poursuivez ensuite avec le langage de votre choix.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => <CourseCard key={c.slug} course={c} />)}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <h2 className="text-2xl font-bold text-nuit-900 sm:text-3xl">Tout pour apprendre au même endroit</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-5">
                <p className="text-2xl" aria-hidden>{f.icon}</p>
                <h3 className="mt-3 font-bold text-nuit-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gris-700">{f.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-electrique-600">Professeur IA</p>
            <h2 className="mt-2 text-2xl font-bold text-nuit-900 sm:text-3xl">Un tuteur disponible à toute heure</h2>
            <ul className="mt-5 space-y-3 text-gris-700">
              <li>✔ Explique un programme ligne par ligne.</li>
              <li>✔ Analyse vos erreurs de compilation et d&apos;exécution.</li>
              <li>✔ Donne des indices progressifs plutôt que la réponse.</li>
              <li>✔ Génère des exercices adaptés à votre niveau.</li>
              <li>✔ Fait le lien entre pseudocode et langages de programmation.</li>
              <li>✔ Vous prépare aux évaluations, en français simple.</li>
            </ul>
            <ButtonLink href="/professeur-ia" className="mt-6">
              Discuter avec le professeur
            </ButtonLink>
          </div>
          <Card className="space-y-3 p-5 text-sm">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-electrique-600 px-4 py-2 text-white">Pourquoi j&apos;ai « indice hors limites » à la ligne 9 ?</div>
            <div className="rounded-2xl rounded-bl-sm bg-gris-50 px-4 py-3 text-gris-700">
              Votre tableau T est déclaré de 1 à 5, mais votre boucle va jusqu&apos;à 6 : au dernier tour, T[6] n&apos;existe pas. Regardez la borne de votre POUR : quelle valeur devrait-elle avoir pour parcourir exactement les 5 cases ?
            </div>
          </Card>
        </Container>
      </section>

      {!user && (
        <section className="pb-4">
          <Container>
            <div className="rounded-2xl bg-gradient-to-r from-nuit-900 to-electrique-600 px-6 py-10 text-center text-white sm:px-12">
              <h2 className="text-2xl font-bold">Prêt à écrire votre premier algorithme ?</h2>
              <p className="mt-2 text-gray-200">Créez votre compte gratuit pour suivre votre progression et accéder au professeur IA.</p>
              <ButtonLink href="/inscription" variant="clair" size="lg" className="mt-6">
                Créer mon compte
              </ButtonLink>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
