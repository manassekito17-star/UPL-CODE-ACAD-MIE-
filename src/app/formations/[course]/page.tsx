import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizBlock } from "@/components/learning/quiz-block";
import { Badge, ButtonLink, Card, Container, Notice, ProgressBar } from "@/components/ui";
import { formatDuration, LEVEL_TONES } from "@/components/ui/labels";
import { LEVEL_LABELS, LEVEL_NAMES } from "@/content/types";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getCourse, listExercises, toPublicQuiz } from "@/lib/content/repository";
import { LEVEL_STATUS_LABELS, type LevelStatus } from "@/lib/levels/rules";
import { getLatestPlacement, getLevelStates } from "@/lib/levels/server";
import { getCompletedLessons, getCourseProgressMap, getLastLesson } from "@/lib/student";

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const STATUS_TONES: Record<LevelStatus, "vert" | "cyan" | "bleu" | "gris"> = {
  valide: "vert",
  dispense: "cyan",
  en_cours: "bleu",
  verrouille: "gris",
  au_programme: "gris",
};

export async function generateMetadata({ params }: PageProps<"/formations/[course]">): Promise<Metadata> {
  const course = await getCourse((await params).course);
  return { title: course?.title ?? "Formation", description: course?.tagline };
}

export default async function CoursePage({ params }: PageProps<"/formations/[course]">) {
  const { course: slug } = await params;
  const [course, user] = await Promise.all([getCourse(slug), getCurrentUser()]);
  if (!course || (course.status !== "publie" && !isStaff(user))) notFound();

  const [done, last, progress, exercises, states, placement] = await Promise.all([
    getCompletedLessons(user, course.id),
    getLastLesson(user, course.id),
    getCourseProgressMap(user),
    listExercises(),
    getLevelStates(user, course),
    getLatestPlacement(user, course.id),
  ]);
  const lessons = course.modules.flatMap((m) => m.lessons.filter((l) => l.status === "publie" || isStaff(user)));
  const first = lessons[0];
  const resume = last ?? lessons.find((l) => !done.has(l.slug))?.slug ?? first?.slug;
  const courseExercises = exercises.filter((e) => e.courseSlug === course.slug);
  // Numérotation continue « niveau.rang » des chapitres.
  const numbering = new Map<string, string>();
  for (const lv of course.levels?.length ? course.levels : [{ number: 0 }]) {
    const ls = course.modules.filter((m) => !lv.number || m.level === lv.number).flatMap((m) => m.lessons.filter((l) => l.status === "publie" || isStaff(user)));
    ls.forEach((l, i) => numbering.set(l.slug, lv.number ? `${lv.number}.${i + 1}` : String(i + 1)));
  }

  return (
    <>
      <section className="bg-nuit-950 text-white">
        <Container className="py-10 sm:py-14">
          <Link href="/formations" className="text-sm text-cyan-accent hover:underline">
            ← Toutes les formations
          </Link>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-cyan-accent">{course.code}</p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-3xl text-gray-300">{course.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={LEVEL_TONES[course.level]}>{LEVEL_LABELS[course.level]}</Badge>
            <Badge tone="nuit">{lessons.length} leçons</Badge>
            <Badge tone="nuit">{courseExercises.length} exercices</Badge>
            <Badge tone="nuit">Durée indicative : {course.durationHours} h</Badge>
          </div>
          {resume && (
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <ButtonLink href={`/formations/${course.slug}/${resume}`} size="lg">
                {last ? "Reprendre où je me suis arrêté" : "Commencer le parcours"}
              </ButtonLink>
              {user && (
                <div className="w-56">
                  <ProgressBar value={progress[course.slug] ?? 0} />
                  <p className="mt-1 text-xs text-gray-400">{Math.round(progress[course.slug] ?? 0)} % terminé</p>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-10">
          {placement || !course.placementTest ? null : (
            <Card className="flex flex-wrap items-center gap-4 border-cyan-accent/40 p-5">
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-nuit-900">Vous avez déjà des bases ?</h2>
                <p className="mt-1 text-sm text-gris-700">
                  Le test de positionnement ({course.placementTest.questions.length} questions) recommande le niveau par lequel commencer. Les niveaux reconnus acquis sont marqués « dispensés » ; leurs chapitres restent accessibles.
                </p>
              </div>
              <ButtonLink href={`/formations/${course.slug}/positionnement`} variant="secondaire">
                Passer le test de positionnement
              </ButtonLink>
            </Card>
          )}
          {placement && (
            <Notice tone="info">
              Test de positionnement du {new Date(placement.at).toLocaleDateString("fr-FR")} : niveau recommandé <strong>{placement.recommended} — {LEVEL_NAMES[placement.recommended]}</strong>.{" "}
              <Link href={`/formations/${course.slug}/positionnement`} className="underline">Repasser le test</Link>
            </Notice>
          )}
          {(course.levels?.length ? course.levels : [null]).map((level) => {
            const state = level ? states.find((s) => s.number === level.number) : undefined;
            const mods = level ? course.modules.filter((m) => m.level === level.number) : course.modules;
            return (
              <section key={level?.number ?? 0} id={level ? `niveau-${level.number}` : undefined} className="space-y-4" data-testid={level ? `niveau-${level.number}` : undefined}>
                {level && state && (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-electrique-600">Niveau {level.number} · {LEVEL_NAMES[level.number]}</p>
                      <h2 className="text-xl font-bold text-nuit-900">{capitalize(level.title.replace(/^Niveau \d — [^:]+: ?/, ""))}</h2>
                      <p className="mt-1 text-sm text-gris-700">{level.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge tone={STATUS_TONES[state.status]}>{LEVEL_STATUS_LABELS[state.status]}</Badge>
                      {state.lessons.length > 0 && (
                        <span className="text-xs text-gris-500">
                          {state.validatedCount}/{state.lessons.length} chapitre(s) validé(s)
                        </span>
                      )}
                      <Link href={`/formations/${course.slug}/niveaux/${level.number}`} className="text-sm font-medium text-electrique-600 hover:underline">
                        Objectifs, critères et examen →
                      </Link>
                    </div>
                  </div>
                )}
                {mods.map((m) => (
                  <Card key={m.slug} className="overflow-hidden">
                    <div className="border-b border-gris-100 bg-gris-50 px-5 py-4">
                      <h3 className="font-bold text-nuit-900">{m.title}</h3>
                      {m.description && <p className="mt-1 text-sm text-gris-700">{m.description}</p>}
                    </div>
                    <ol>
                      {m.lessons
                        .filter((l) => l.status === "publie" || isStaff(user))
                        .map((l) => {
                          const n = numbering.get(l.slug) ?? "";
                          return (
                            <li key={l.slug} className="border-b border-gris-100 last:border-0">
                              <Link href={`/formations/${course.slug}/${l.slug}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gris-50">
                                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${done.has(l.slug) ? "bg-green-100 text-green-800" : "bg-electrique-100 text-electrique-600"}`}>
                                  {done.has(l.slug) ? "✓" : n}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block font-medium text-nuit-900">{l.title}</span>
                                  <span className="text-xs text-gris-500">
                                    {formatDuration(l.durationMinutes)} · {LEVEL_LABELS[l.level]}
                                    {l.pedagogy?.evaluation ? " · évaluation" : l.quiz ? " · quiz" : ""}
                                    {l.pedagogy?.project ? " · projet" : ""}
                                    {l.exerciseSlugs?.length ? ` · ${l.exerciseSlugs.length} exercice(s)` : ""}
                                    {l.status !== "publie" && ` · ${l.status}`}
                                  </span>
                                </span>
                                {last === l.slug && <Badge tone="cyan">Dernière position</Badge>}
                              </Link>
                            </li>
                          );
                        })}
                    </ol>
                  </Card>
                ))}
                {level && level.plannedChapters.length > 0 && (
                  <Card className="border-dashed p-5">
                    <h3 className="text-sm font-bold text-nuit-900">Au programme de ce niveau (chapitres en préparation, pas encore publiés)</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gris-500">
                      {level.plannedChapters.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </section>
            );
          })}
          {course.finalQuiz && (
            <section id="evaluation-finale">
              <h2 className="mb-3 text-xl font-bold text-nuit-900">Évaluation finale</h2>
              <QuizBlock quiz={toPublicQuiz(course.finalQuiz)} />
            </section>
          )}
        </div>
        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">Objectifs</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gris-700">{course.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">Prérequis</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-gris-700">{course.prerequisites.map((o) => <li key={o}>{o}</li>)}</ul>
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">S&apos;entraîner</h2>
            <p className="text-sm text-gris-700">{courseExercises.length} exercices corrigés automatiquement accompagnent ce parcours.</p>
            <ButtonLink href={`/exercices?parcours=${course.slug}`} variant="secondaire" size="sm" className="mt-3">
              Voir les exercices
            </ButtonLink>
          </Card>
        </aside>
      </Container>
    </>
  );
}
