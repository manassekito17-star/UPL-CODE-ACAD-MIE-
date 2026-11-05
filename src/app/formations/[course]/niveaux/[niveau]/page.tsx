import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizBlock } from "@/components/learning/quiz-block";
import { Badge, ButtonLink, Card, Container, Notice, ProgressBar } from "@/components/ui";
import { LEVEL_NAMES, type LevelNumber } from "@/content/types";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getCourse, toPublicQuiz } from "@/lib/content/repository";
import { LEVEL_STATUS_LABELS } from "@/lib/levels/rules";
import { getLevelStates } from "@/lib/levels/server";

function parseLevel(v: string): LevelNumber | null {
  return ["1", "2", "3", "4"].includes(v) ? (Number(v) as LevelNumber) : null;
}

export async function generateMetadata({ params }: PageProps<"/formations/[course]/niveaux/[niveau]">): Promise<Metadata> {
  const { course: slug, niveau } = await params;
  const course = await getCourse(slug);
  const n = parseLevel(niveau);
  return { title: course && n ? `${course.title} — Niveau ${n}` : "Niveau" };
}

export default async function LevelPage({ params }: PageProps<"/formations/[course]/niveaux/[niveau]">) {
  const { course: slug, niveau } = await params;
  const n = parseLevel(niveau);
  const [course, user] = await Promise.all([getCourse(slug), getCurrentUser()]);
  if (!n || !course || (course.status !== "publie" && !isStaff(user))) notFound();
  const level = course.levels?.find((l) => l.number === n);
  if (!level) notFound();
  const states = await getLevelStates(user, course);
  const state = states.find((s) => s.number === n)!;
  const acquired = state.status === "valide" || state.status === "dispense";
  const canTakeExam = Boolean(level.exam) && Boolean(user) && (state.examUnlocked || isStaff(user));

  return (
    <Container className="max-w-4xl space-y-6 py-10">
      <Link href={`/formations/${course.slug}#niveau-${n}`} className="text-sm text-electrique-600 hover:underline">
        ← {course.title}
      </Link>
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-electrique-600">
          {course.title} · Niveau {n} · {LEVEL_NAMES[n]}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-nuit-900">{level.title}</h1>
        <p className="mt-2 text-gris-700">{level.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={acquired ? "vert" : state.status === "en_cours" ? "bleu" : "gris"}>{LEVEL_STATUS_LABELS[state.status]}</Badge>
          <Badge>{state.lessons.length} chapitre(s) publié(s)</Badge>
          {level.plannedChapters.length > 0 && <Badge>{level.plannedChapters.length} chapitre(s) au programme</Badge>}
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold text-nuit-900">Objectifs du niveau</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gris-700">
            {level.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5" data-testid="criteres-niveau">
          <h2 className="font-bold text-nuit-900">Critères de passage au niveau suivant</h2>
          <ul className="mt-2 space-y-2 text-sm text-gris-700">
            <li>
              {state.chaptersOk || acquired ? "✓" : "○"} Valider au moins {level.criteria.chaptersValidatedPct} % des chapitres du niveau (chaque chapitre se valide par son évaluation).
              {state.lessons.length > 0 && (
                <span className="mt-1 block">
                  <ProgressBar value={state.chaptersPct} />
                  <span className="text-xs text-gris-500">
                    {state.validatedCount}/{state.lessons.length} validé(s)
                  </span>
                </span>
              )}
            </li>
            <li>
              {state.examOk || acquired ? "✓" : "○"} Réussir l&apos;examen de fin de niveau avec au moins {level.criteria.examPassScore} %
              {state.examBest !== null && ` (meilleur score : ${state.examBest} %)`}.
            </li>
          </ul>
          {state.status === "dispense" && <p className="mt-3 text-sm text-cyan-800">Niveau dispensé par le test de positionnement. Vous pouvez tout de même passer l&apos;examen pour obtenir le certificat de niveau.</p>}
        </Card>
      </div>

      {state.missing.length > 0 && user && (
        <Notice tone="info" title="Ce qu'il reste à faire">
          <ul className="list-disc pl-5">
            {state.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Notice>
      )}

      <Card className="p-5">
        <h2 className="font-bold text-nuit-900">Chapitres</h2>
        {state.lessons.length ? (
          <ol className="mt-2 space-y-1 text-sm">
            {state.lessons.map((l, i) => (
              <li key={l.slug}>
                <Link href={`/formations/${course.slug}/${l.slug}`} className="text-electrique-600 hover:underline">
                  {n}.{i + 1} {l.title}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-gris-500">Aucun chapitre publié pour l&apos;instant.</p>
        )}
        {level.plannedChapters.length > 0 && (
          <>
            <h3 className="mt-4 text-sm font-semibold text-nuit-900">Au programme (en préparation, pas encore publiés)</h3>
            <ul className="mt-1 list-disc pl-5 text-sm text-gris-500">
              {level.plannedChapters.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <section id="examen" className="space-y-3">
        <h2 className="text-xl font-bold text-nuit-900">Examen de fin de niveau</h2>
        {!level.exam ? (
          <Notice tone="alerte">L&apos;examen de ce niveau n&apos;est pas encore publié : le niveau ne peut pas encore être validé.</Notice>
        ) : !user ? (
          <Notice tone="info">
            <Link href={`/connexion?suite=/formations/${course.slug}/niveaux/${n}`} className="underline">Connectez-vous</Link> pour passer l&apos;examen : le résultat est enregistré et compte pour le passage de niveau.
          </Notice>
        ) : !canTakeExam ? (
          <Notice tone="alerte">
            Cet examen s&apos;ouvre après la validation du niveau {n - 1} ou une dispense par le{" "}
            <Link href={`/formations/${course.slug}/positionnement`} className="underline">test de positionnement</Link>. Les chapitres restent consultables dès maintenant.
          </Notice>
        ) : (
          <QuizBlock quiz={toPublicQuiz({ ...level.exam, passScore: level.criteria.examPassScore })} />
        )}
      </section>

      {state.status === "valide" && (
        <Notice tone="succes" title="Niveau validé">
          Votre certificat interne de niveau est disponible dans votre{" "}
          <Link href="/bulletin" className="underline">bulletin de progression</Link>.
        </Notice>
      )}
      <div className="flex flex-wrap gap-3">
        {n > 1 && <ButtonLink href={`/formations/${course.slug}/niveaux/${n - 1}`} variant="secondaire" size="sm">← Niveau {n - 1}</ButtonLink>}
        {n < 4 && <ButtonLink href={`/formations/${course.slug}/niveaux/${n + 1}`} variant="secondaire" size="sm">Niveau {n + 1} →</ButtonLink>}
      </div>
    </Container>
  );
}
