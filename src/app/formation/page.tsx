import type { Metadata } from "next";
import Link from "next/link";
import { Badge, ButtonLink, Card, Container, ProgressBar } from "@/components/ui";
import { formatDuration } from "@/components/ui/labels";
import { chapterCompleteness } from "@/content/completeness";
import { getCurrentUser } from "@/lib/auth";
import { getCourse, listExercises } from "@/lib/content/repository";
import { getFormationProgress } from "@/lib/formation/progress";

export const metadata: Metadata = {
  title: "Formation — Algorithmique",
  description: "Programme progressif d'algorithmique et de pseudocode, du débutant au niveau avancé.",
};

const STATUS = {
  valide: { label: "Validé", tone: "vert" },
  commence: { label: "En cours", tone: "orange" },
  non_commence: { label: "À faire", tone: "gris" },
} as const;

export default async function FormationPage() {
  const [course, user, exercises] = await Promise.all([getCourse("algorithmique"), getCurrentUser(), listExercises()]);
  if (!course) return null;
  const progress = await getFormationProgress(user, course);
  const titles = new Map(exercises.map((e) => [e.slug, e.title]));
  const chapters = course.modules.flatMap((m) => m.lessons.filter((l) => l.status === "publie"));
  const validated = chapters.filter((l) => progress.get(l.slug)?.status === "valide");
  const competences = validated.flatMap((l) => l.pedagogy?.competences ?? []);
  const difficulties = chapters.flatMap((l) => {
    const p = progress.get(l.slug)!;
    const items: string[] = [];
    if (p.evaluationAttempts > 0 && p.status !== "valide") items.push(`${l.title} : évaluation non réussie (meilleur score ${p.evaluationBest} %)`);
    for (const s of p.struggling) items.push(`${l.title} : exercice « ${titles.get(s) ?? s} » non réussi après plusieurs tentatives`);
    return items;
  });
  const next = chapters.find((l) => progress.get(l.slug)?.status !== "valide");
  const totalMinutes = chapters.reduce((s, l) => s + l.durationMinutes, 0);
  let n = 0;

  return (
    <>
      <section className="bg-nuit-950 text-white">
        <Container className="py-10 sm:py-14">
          <p className="text-xs font-bold tracking-[0.3em] text-cyan-accent">FORMATION · LEARN. CODE. PRACTICE. MASTER.</p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Algorithmique et pseudocode</h1>
          <p className="mt-3 max-w-3xl text-gray-300">
            Un programme progressif, du premier algorithme jusqu&apos;aux structures de données et à l&apos;optimisation, conçu pour le niveau Bac 1. Chaque chapitre comporte un cours détaillé, des définitions, des algorithmes commentés ligne par ligne avec organigramme et tableau de suivi, des erreurs fréquentes, des exercices corrigés, des exercices notés, un TD, une interrogation, une évaluation finale et un résumé en PDF.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            {next && <ButtonLink href={`/formations/algorithmique/${next.slug}`} size="lg">{validated.length ? "Continuer la formation" : "Commencer la formation"}</ButtonLink>}
            {user ? (
              <div className="w-64">
                <ProgressBar value={(validated.length / Math.max(1, chapters.length)) * 100} />
                <p className="mt-1 text-xs text-gray-400">{validated.length} chapitre(s) validé(s) sur {chapters.length}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Connectez-vous pour enregistrer votre progression.</p>
            )}
            <p className="text-sm text-gray-400">{chapters.length} chapitres · environ {formatDuration(totalMinutes)} de cours</p>
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {course.modules.map((m) => {
            const list = m.lessons.filter((l) => l.status === "publie");
            if (!list.length) return null;
            return (
              <Card key={m.slug} className="overflow-hidden">
                <div className="border-b border-gris-100 bg-gris-50 px-5 py-4">
                  <h2 className="font-bold text-nuit-900">{m.title}</h2>
                  {m.description && <p className="mt-1 text-sm text-gris-700">{m.description}</p>}
                </div>
                <ol>
                  {list.map((l) => {
                    n++;
                    const p = progress.get(l.slug)!;
                    const comp = chapterCompleteness(l);
                    return (
                      <li key={l.slug} className="border-b border-gris-100 last:border-0">
                        <Link href={`/formations/algorithmique/${l.slug}`} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-gris-50">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-electrique-100 text-sm font-bold text-electrique-600">{n}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-nuit-900">{l.title}</span>
                            <span className="text-xs text-gris-500">
                              {formatDuration(l.durationMinutes)}
                              {p.exercisesTotal > 0 && ` · exercices ${p.exercisesSolved}/${p.exercisesTotal}`}
                              {p.interrogationBest !== null && ` · interrogation ${p.interrogationBest} %`}
                              {p.evaluationBest !== null && ` · évaluation ${p.evaluationBest} %`}
                            </span>
                          </span>
                          {comp.complete ? <Badge tone="cyan">Chapitre complet</Badge> : <Badge tone="gris" className="whitespace-nowrap">Enrichissement en cours · {comp.score} %</Badge>}
                          {user && <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            );
          })}
        </div>
        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">Compétences acquises</h2>
            {!user ? (
              <p className="text-sm text-gris-500">Connectez-vous pour suivre vos compétences.</p>
            ) : competences.length ? (
              <ul className="space-y-1 text-sm text-gris-700">{competences.map((c) => <li key={c}>✅ {c}</li>)}</ul>
            ) : (
              <p className="text-sm text-gris-500">Validez l&apos;évaluation d&apos;un chapitre pour acquérir ses compétences.</p>
            )}
          </Card>
          {user && (
            <Card className="p-5">
              <h2 className="mb-2 font-bold text-nuit-900">Points à retravailler</h2>
              {difficulties.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-gris-700">{difficulties.map((d) => <li key={d}>{d}</li>)}</ul>
              ) : (
                <p className="text-sm text-gris-500">Aucune difficulté détectée pour l&apos;instant.</p>
              )}
              <p className="mt-3 text-xs text-gris-500">Calculé à partir de vos évaluations et de vos tentatives d&apos;exercices.</p>
            </Card>
          )}
          <Card className="p-5 text-sm text-gris-700">
            <h2 className="mb-2 font-bold text-nuit-900">Comment valider un chapitre ?</h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Lire le cours et exécuter les exemples.</li>
              <li>Étudier les algorithmes commentés et les erreurs fréquentes.</li>
              <li>Faire les exercices corrigés, puis les exercices notés et le TD.</li>
              <li>Passer l&apos;interrogation.</li>
              <li>Réussir l&apos;évaluation finale (70 %) : le chapitre est validé.</li>
            </ol>
          </Card>
        </aside>
      </Container>
    </>
  );
}
