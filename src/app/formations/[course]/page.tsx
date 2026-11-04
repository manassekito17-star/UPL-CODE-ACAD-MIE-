import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizBlock } from "@/components/learning/quiz-block";
import { Badge, ButtonLink, Card, Container, ProgressBar } from "@/components/ui";
import { formatDuration, LEVEL_TONES } from "@/components/ui/labels";
import { LEVEL_LABELS } from "@/content/types";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getCourse, listExercises, toPublicQuiz } from "@/lib/content/repository";
import { getCompletedLessons, getCourseProgressMap, getLastLesson } from "@/lib/student";

export async function generateMetadata({ params }: PageProps<"/formations/[course]">): Promise<Metadata> {
  const course = await getCourse((await params).course);
  return { title: course?.title ?? "Formation", description: course?.tagline };
}

export default async function CoursePage({ params }: PageProps<"/formations/[course]">) {
  const { course: slug } = await params;
  const [course, user] = await Promise.all([getCourse(slug), getCurrentUser()]);
  if (!course || (course.status !== "publie" && !isStaff(user))) notFound();

  const [done, last, progress, exercises] = await Promise.all([getCompletedLessons(user, course.id), getLastLesson(user, course.id), getCourseProgressMap(user), listExercises()]);
  const lessons = course.modules.flatMap((m) => m.lessons.filter((l) => l.status === "publie" || isStaff(user)));
  const first = lessons[0];
  const resume = last ?? lessons.find((l) => !done.has(l.slug))?.slug ?? first?.slug;
  const courseExercises = exercises.filter((e) => e.courseSlug === course.slug);

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
        <div className="space-y-6">
          {course.modules.map((m, mi) => (
            <Card key={m.slug} className="overflow-hidden">
              <div className="border-b border-gris-100 bg-gris-50 px-5 py-4">
                <h2 className="font-bold text-nuit-900">{m.title}</h2>
                {m.description && <p className="mt-1 text-sm text-gris-700">{m.description}</p>}
              </div>
              <ol>
                {m.lessons
                  .filter((l) => l.status === "publie" || isStaff(user))
                  .map((l, li) => (
                    <li key={l.slug} className="border-b border-gris-100 last:border-0">
                      <Link href={`/formations/${course.slug}/${l.slug}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gris-50">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${done.has(l.slug) ? "bg-green-100 text-green-800" : "bg-electrique-100 text-electrique-600"}`}>
                          {done.has(l.slug) ? "✓" : `${mi + 1}.${li + 1}`}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-nuit-900">{l.title}</span>
                          <span className="text-xs text-gris-500">
                            {formatDuration(l.durationMinutes)} · {LEVEL_LABELS[l.level]}
                            {l.quiz && " · quiz"}
                            {l.exerciseSlugs?.length ? ` · ${l.exerciseSlugs.length} exercice(s)` : ""}
                            {l.status !== "publie" && ` · ${l.status}`}
                          </span>
                        </span>
                        {last === l.slug && <Badge tone="cyan">Dernière position</Badge>}
                      </Link>
                    </li>
                  ))}
              </ol>
            </Card>
          ))}
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
