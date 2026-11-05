import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterSections } from "@/components/formation/chapter";
import { ExampleRunner } from "@/components/learning/example-runner";
import { LessonTracker } from "@/components/learning/lesson-tracker";
import { Markdown } from "@/components/learning/markdown";
import { QuizBlock } from "@/components/learning/quiz-block";
import { Badge, ButtonLink, Card, Container } from "@/components/ui";
import { formatDuration, LEVEL_TONES } from "@/components/ui/labels";
import { LEVEL_LABELS } from "@/content/types";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getLessonContext, listExercises, toPublicQuiz } from "@/lib/content/repository";
import { getCompletedLessons, getSolvedExercises } from "@/lib/student";

export async function generateMetadata({ params }: PageProps<"/formations/[course]/[lesson]">): Promise<Metadata> {
  const p = await params;
  const ctx = await getLessonContext(p.course, p.lesson);
  return { title: ctx ? `${ctx.lesson.title} — ${ctx.course.title}` : "Leçon" };
}

export default async function LessonPage({ params }: PageProps<"/formations/[course]/[lesson]">) {
  const p = await params;
  const [ctx, user] = await Promise.all([getLessonContext(p.course, p.lesson), getCurrentUser()]);
  if (!ctx) notFound();
  const { course, module, lesson, previous, next, position, total } = ctx;
  if ((course.status !== "publie" || lesson.status !== "publie") && !isStaff(user)) notFound();

  const [done, exercises, solved] = await Promise.all([getCompletedLessons(user, course.id), listExercises(), getSolvedExercises(user)]);
  const linked = exercises.filter((e) => lesson.exerciseSlugs?.includes(e.slug));

  return (
    <Container className="grid gap-8 py-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="Sommaire du parcours" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] space-y-4 overflow-y-auto pr-2 text-sm">
          <Link href={`/formations/${course.slug}`} className="font-bold text-nuit-900 hover:text-electrique-600">
            {course.title}
          </Link>
          {course.modules.map((m) => (
            <div key={m.slug}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gris-500">{m.title}</p>
              <ul className="space-y-0.5">
                {m.lessons
                  .filter((l) => l.status === "publie" || isStaff(user))
                  .map((l) => (
                    <li key={l.slug}>
                      <Link
                        href={`/formations/${course.slug}/${l.slug}`}
                        aria-current={l.slug === lesson.slug ? "page" : undefined}
                        className={`block rounded px-2 py-1 ${l.slug === lesson.slug ? "bg-electrique-100 font-semibold text-electrique-600" : "text-gris-700 hover:bg-gris-100"}`}
                      >
                        {done.has(l.slug) ? "✓ " : ""}
                        {l.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <article className="min-w-0 space-y-8">
        <header>
          <p className="text-sm text-gris-500">
            <Link href={`/formations/${course.slug}`} className="hover:text-electrique-600">
              {course.title}
            </Link>{" "}
            · {module.title} · Leçon {position}/{total}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-nuit-900 sm:text-3xl">{lesson.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={LEVEL_TONES[lesson.level]}>{LEVEL_LABELS[lesson.level]}</Badge>
            <Badge>⏱ {formatDuration(lesson.durationMinutes)}</Badge>
            {lesson.status !== "publie" && <Badge tone="orange">Non publiée ({lesson.status})</Badge>}
          </div>
        </header>

        {lesson.pedagogy ? (
          <ChapterSections course={course} lesson={lesson} exercises={exercises} solved={solved} validated={done.has(lesson.slug)} />
        ) : (
          <>
        <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-electrique-600">Objectifs pédagogiques</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gris-700">{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
            </Card>
            <Card className="p-4">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-electrique-600">Prérequis</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gris-700">
                {(lesson.prerequisites?.length ? lesson.prerequisites : [previous ? `Leçon précédente : ${previous.title}` : "Aucun"]).map((o) => <li key={o}>{o}</li>)}
              </ul>
            </Card>
          </div>
  
          <Markdown>{lesson.content}</Markdown>
  
          {lesson.examples.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-nuit-900">Exemples à exécuter</h2>
              {lesson.examples.map((ex, i) => (
                <ExampleRunner key={i} example={ex} editorHref={`/editeur?exemple=${course.slug}/${lesson.slug}/${i}`} />
              ))}
            </section>
          )}
  
          {lesson.summary.length > 0 && (
            <Card className="border-cyan-accent/40 bg-cyan-soft/30 p-5">
              <h2 className="mb-2 font-bold text-nuit-900">📝 À retenir</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-nuit-800">{lesson.summary.map((s) => <li key={s}>{s}</li>)}</ul>
            </Card>
          )}
  
          {lesson.quiz && (
            <section>
              <h2 className="mb-3 text-xl font-bold text-nuit-900">Évaluation de la leçon</h2>
              <QuizBlock quiz={toPublicQuiz(lesson.quiz)} />
            </section>
          )}
  
          {linked.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold text-nuit-900">Exercices associés</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {linked.map((e) => (
                  <Link key={e.slug} href={`/exercices/${e.slug}`} className="rounded-xl border border-gris-200 bg-white p-4 hover:border-electrique-400">
                    <p className="font-semibold text-nuit-900">{e.title}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge tone={LEVEL_TONES[e.difficulty]}>{LEVEL_LABELS[e.difficulty]}</Badge>
                      <Badge>{e.points} pts</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          </>
        )}

        <footer className="flex flex-col gap-4 border-t border-gris-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <LessonTracker
            courseSlug={course.slug}
            lessonSlug={lesson.slug}
            initiallyDone={done.has(lesson.slug)}
            loggedIn={Boolean(user)}
            validationBy={lesson.pedagogy?.evaluation ? "evaluation" : lesson.quiz ? "quiz" : null}
          />
          <div className="flex gap-2">
            {previous && (
              <ButtonLink href={`/formations/${course.slug}/${previous.slug}`} variant="secondaire">
                ← Précédente
              </ButtonLink>
            )}
            {next ? (
              <ButtonLink href={`/formations/${course.slug}/${next.slug}`}>Suivante →</ButtonLink>
            ) : (
              <ButtonLink href={`/formations/${course.slug}#evaluation-finale`}>Évaluation finale →</ButtonLink>
            )}
          </div>
        </footer>
      </article>
    </Container>
  );
}
