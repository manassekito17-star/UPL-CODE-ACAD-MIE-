import "server-only";

import { cache } from "react";
import { staticCourses, staticExercises } from "@/content";
import type { Course, Exercise, Lesson, Module, PublicExercise, PublicQuiz, Quiz } from "@/content/types";
import { isSupabaseConfigured } from "../env";
import { createAdminClient, hasAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";

/**
 * Accès au contenu pédagogique.
 *
 * - Mode « database » (Supabase configuré) : les cours sont lus en base, ce
 *   qui permet aux enseignants de les modifier depuis l'administration.
 * - Mode « static » : le contenu versionné dans src/content est utilisé
 *   (démonstration, développement, base pas encore initialisée).
 */
export function contentSource(): "database" | "static" {
  if (process.env.CONTENT_SOURCE === "static") return "static";
  return isSupabaseConfigured() ? "database" : "static";
}

export interface CourseSummary {
  slug: string;
  code: string;
  language: Course["language"];
  category: Course["category"];
  title: string;
  tagline: string;
  description: string;
  level: Course["level"];
  durationHours: number;
  status: Course["status"];
  moduleCount: number;
  lessonCount: number;
  exerciseCount: number;
  id?: string;
}

const isVisible = (status: string) => status === "publie";

// ---------- Lecture en base ----------

type Row = Record<string, unknown>;

function mapQuiz(q: Row, questions: Row[], keys: Map<string, Row> | null): Quiz {
  return {
    id: q.id as string,
    slug: q.slug as string,
    title: q.title as string,
    passScore: q.pass_score as number,
    isFinal: q.is_final as boolean,
    questions: questions
      .filter((x) => x.quiz_id === q.id)
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map((x) => ({
        id: x.id as string,
        type: x.type as Quiz["questions"][number]["type"],
        prompt: x.prompt as string,
        code: (x.code as string) ?? undefined,
        choices: x.choices as string[],
        correct: ((keys?.get(x.id as string)?.correct as number[]) ?? []) as number[],
        explanation: (keys?.get(x.id as string)?.explanation as string) ?? undefined,
      })),
  };
}

async function dbCourse(slug: string, withAnswers = false): Promise<Course | null> {
  const supabase = await createClient();
  const { data: c } = await supabase.from("courses").select("*, course_categories(slug)").eq("slug", slug).maybeSingle();
  if (!c) return null;
  const [{ data: modules }, { data: lessons }, { data: quizzes }, { data: exercises }] = await Promise.all([
    supabase.from("modules").select("*").eq("course_id", c.id).order("position"),
    supabase.from("lessons").select("*").eq("course_id", c.id).order("position"),
    supabase.from("quizzes").select("*").eq("course_id", c.id),
    supabase.from("exercises").select("slug, lesson_id, status").eq("course_id", c.id).order("position"),
  ]);
  const quizIds = (quizzes ?? []).map((q) => q.id);
  const { data: questions } = quizIds.length
    ? await supabase.from("quiz_questions").select("*").in("quiz_id", quizIds)
    : { data: [] as Row[] };
  let keys: Map<string, Row> | null = null;
  if (withAnswers && hasAdminClient() && questions?.length) {
    const { data: k } = await createAdminClient()
      .from("quiz_answer_keys")
      .select("*")
      .in("question_id", questions.map((q) => q.id));
    keys = new Map((k ?? []).map((r) => [r.question_id as string, r]));
  }

  const mods: Module[] = (modules ?? []).map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description ?? undefined,
    lessons: (lessons ?? [])
      .filter((l) => l.module_id === m.id)
      .map((l): Lesson => {
        const quizRow = (quizzes ?? []).find((q) => q.lesson_id === l.id && !q.is_final);
        return {
          id: l.id,
          slug: l.slug,
          title: l.title,
          level: l.level,
          durationMinutes: l.duration_minutes,
          objectives: l.objectives ?? [],
          prerequisites: l.prerequisites ?? [],
          content: l.content ?? "",
          examples: l.examples ?? [],
          summary: l.summary ?? [],
          status: l.status,
          quiz: quizRow ? mapQuiz(quizRow, questions ?? [], keys) : undefined,
          exerciseSlugs: (exercises ?? []).filter((e) => e.lesson_id === l.id && isVisible(e.status)).map((e) => e.slug),
        };
      }),
  }));
  const finalRow = (quizzes ?? []).find((q) => q.is_final);
  return {
    id: c.id,
    slug: c.slug,
    code: c.code ?? "",
    language: c.language_id,
    category: (c.course_categories as { slug: string } | null)?.slug as Course["category"],
    title: c.title,
    tagline: c.tagline ?? "",
    description: c.description ?? "",
    level: c.level,
    prerequisites: c.prerequisites ?? [],
    objectives: c.objectives ?? [],
    durationHours: Number(c.duration_hours ?? 0),
    status: c.status,
    modules: mods,
    finalQuiz: finalRow ? mapQuiz(finalRow, questions ?? [], keys) : undefined,
  };
}

function mapExercise(e: Row, tests: Row[], solution: Row | null, courseSlug: string, lessonSlug?: string): Exercise {
  return {
    id: e.id as string,
    slug: e.slug as string,
    courseSlug,
    lessonSlug,
    language: e.language_id as Exercise["language"],
    title: e.title as string,
    difficulty: e.difficulty as Exercise["difficulty"],
    type: e.type as Exercise["type"],
    statement: e.statement as string,
    objectives: (e.objectives as string[]) ?? [],
    examples: (e.examples as Exercise["examples"]) ?? [],
    constraints: (e.constraints as string[]) ?? [],
    starterCode: (e.starter_code as string) ?? "",
    hints: (e.hints as string[]) ?? [],
    tests: tests
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map((t) => ({
        description: (t.description as string) ?? undefined,
        input: t.input as string,
        expected: t.expected_output as string,
        hidden: t.is_hidden as boolean,
        weight: t.weight as number,
      })),
    solution: (solution?.solution_code as string) ?? "",
    correction: (solution?.correction as string) ?? "",
    points: e.points as number,
    isEvaluated: e.is_evaluated as boolean,
    status: e.status as Exercise["status"],
  };
}

// ---------- API publique du dépôt ----------

function summarize(c: Course, exerciseCount: number): CourseSummary {
  return {
    id: c.id,
    slug: c.slug,
    code: c.code,
    language: c.language,
    category: c.category,
    title: c.title,
    tagline: c.tagline,
    description: c.description,
    level: c.level,
    durationHours: c.durationHours,
    status: c.status,
    moduleCount: c.modules.length,
    lessonCount: c.modules.reduce((n, m) => n + m.lessons.filter((l) => isVisible(l.status)).length, 0),
    exerciseCount,
  };
}

export const listCourses = cache(async (): Promise<CourseSummary[]> => {
  if (contentSource() === "static") {
    return staticCourses
      .filter((c) => isVisible(c.status))
      .map((c) => summarize(c, staticExercises.filter((e) => e.courseSlug === c.slug && isVisible(e.status)).length));
  }
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, code, language_id, title, tagline, description, level, duration_hours, status, sort_order, course_categories(slug), modules(id), lessons(id, status), exercises(id, status)")
    .order("sort_order");
  return (courses ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    code: c.code ?? "",
    language: c.language_id,
    category: (c.course_categories as unknown as { slug: string } | null)?.slug as Course["category"],
    title: c.title,
    tagline: c.tagline ?? "",
    description: c.description ?? "",
    level: c.level,
    durationHours: Number(c.duration_hours ?? 0),
    status: c.status,
    moduleCount: (c.modules as unknown[]).length,
    lessonCount: (c.lessons as Array<{ status: string }>).filter((l) => isVisible(l.status)).length,
    exerciseCount: (c.exercises as Array<{ status: string }>).filter((e) => isVisible(e.status)).length,
  }));
});

/** Cours complet. Les réponses des quiz ne sont incluses que si withAnswers (usage serveur). */
export const getCourse = cache(async (slug: string, withAnswers = false): Promise<Course | null> => {
  if (contentSource() === "static") return staticCourses.find((c) => c.slug === slug) ?? null;
  return dbCourse(slug, withAnswers);
});

export interface LessonContext {
  course: Course;
  module: Module;
  lesson: Lesson;
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  position: number;
  total: number;
}

export async function getLessonContext(courseSlug: string, lessonSlug: string): Promise<LessonContext | null> {
  const course = await getCourse(courseSlug);
  if (!course) return null;
  const flat = course.modules.flatMap((m) => m.lessons.filter((l) => isVisible(l.status) || l.slug === lessonSlug).map((l) => ({ m, l })));
  const idx = flat.findIndex((x) => x.l.slug === lessonSlug);
  if (idx < 0) return null;
  const { m, l } = flat[idx];
  return {
    course,
    module: m,
    lesson: l,
    previous: idx > 0 ? { slug: flat[idx - 1].l.slug, title: flat[idx - 1].l.title } : null,
    next: idx < flat.length - 1 ? { slug: flat[idx + 1].l.slug, title: flat[idx + 1].l.title } : null,
    position: idx + 1,
    total: flat.length,
  };
}

export interface ExerciseSummary {
  slug: string;
  title: string;
  language: Exercise["language"];
  difficulty: Exercise["difficulty"];
  type: Exercise["type"];
  courseSlug: string;
  points: number;
  isEvaluated: boolean;
}

export const listExercises = cache(async (): Promise<ExerciseSummary[]> => {
  if (contentSource() === "static") {
    return staticExercises
      .filter((e) => isVisible(e.status))
      .map((e) => ({
        slug: e.slug,
        title: e.title,
        language: e.language,
        difficulty: e.difficulty,
        type: e.type,
        courseSlug: e.courseSlug,
        points: e.points ?? 10,
        isEvaluated: Boolean(e.isEvaluated),
      }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("slug, title, language_id, difficulty, type, points, is_evaluated, status, courses(slug)")
    .eq("status", "publie")
    .order("position");
  return (data ?? []).map((e) => ({
    slug: e.slug,
    title: e.title,
    language: e.language_id,
    difficulty: e.difficulty,
    type: e.type,
    courseSlug: (e.courses as unknown as { slug: string } | null)?.slug ?? "",
    points: e.points,
    isEvaluated: e.is_evaluated,
  }));
});

/**
 * Exercice complet (solution, corrigé, tests cachés) : RÉSERVÉ AU SERVEUR.
 * En mode base, lu avec le client service_role car ces données sont
 * inaccessibles aux étudiants par RLS.
 */
export async function getExerciseForGrading(slug: string): Promise<Exercise | null> {
  if (contentSource() === "static") return staticExercises.find((e) => e.slug === slug) ?? null;
  if (!hasAdminClient()) return null;
  const admin = createAdminClient();
  const { data: e } = await admin.from("exercises").select("*, courses(slug), lessons(slug)").eq("slug", slug).maybeSingle();
  if (!e) return null;
  const [{ data: tests }, { data: sol }] = await Promise.all([
    admin.from("exercise_test_cases").select("*").eq("exercise_id", e.id),
    admin.from("exercise_solutions").select("*").eq("exercise_id", e.id).maybeSingle(),
  ]);
  return mapExercise(
    e,
    tests ?? [],
    sol,
    (e.courses as { slug: string } | null)?.slug ?? "",
    (e.lessons as { slug: string } | null)?.slug,
  );
}

export function toPublicExercise(e: Exercise): PublicExercise {
  const { solution: _s, correction: _c, tests, ...rest } = e;
  void _s;
  void _c;
  return {
    ...rest,
    tests: tests.filter((t) => !t.hidden).map(({ hidden: _h, ...t }) => (void _h, t)),
    hiddenTestCount: tests.filter((t) => t.hidden).length,
  };
}

/** Exercice sans solution ni tests cachés, pour l'affichage. */
export async function getPublicExercise(slug: string): Promise<PublicExercise | null> {
  if (contentSource() === "static") {
    const e = staticExercises.find((x) => x.slug === slug);
    return e && isVisible(e.status) ? toPublicExercise(e) : null;
  }
  const supabase = await createClient();
  const { data: e } = await supabase.from("exercises").select("*, courses(slug), lessons(slug)").eq("slug", slug).maybeSingle();
  if (!e) return null;
  const { data: tests } = await supabase.from("exercise_test_cases").select("*").eq("exercise_id", e.id);
  const { count } = hasAdminClient()
    ? await createAdminClient().from("exercise_test_cases").select("id", { count: "exact", head: true }).eq("exercise_id", e.id).eq("is_hidden", true)
    : { count: 0 };
  const full = mapExercise(e, (tests ?? []).filter((t) => !t.is_hidden), null, (e.courses as { slug: string } | null)?.slug ?? "", (e.lessons as { slug: string } | null)?.slug);
  return { ...toPublicExercise(full), hiddenTestCount: count ?? 0 };
}

export function toPublicQuiz(q: Quiz): PublicQuiz {
  return {
    ...q,
    questions: q.questions.map(({ correct: _c, explanation: _e, ...rest }) => (void _c, void _e, rest)),
  };
}

/** Quiz avec réponses, pour la correction côté serveur. */
export async function getQuizForGrading(slug: string): Promise<{ quiz: Quiz; course: Course; lesson?: Lesson } | null> {
  if (contentSource() === "static") {
    for (const course of staticCourses) {
      if (course.finalQuiz?.slug === slug) return { quiz: course.finalQuiz, course };
      for (const m of course.modules) for (const l of m.lessons) if (l.quiz?.slug === slug) return { quiz: l.quiz, course, lesson: l };
    }
    return null;
  }
  if (!hasAdminClient()) return null;
  const admin = createAdminClient();
  const { data: q } = await admin.from("quizzes").select("*, courses(slug)").eq("slug", slug).maybeSingle();
  if (!q) return null;
  const course = await dbCourse((q.courses as { slug: string }).slug, true);
  if (!course) return null;
  if (q.is_final && course.finalQuiz) return { quiz: course.finalQuiz, course };
  for (const m of course.modules) for (const l of m.lessons) if (l.quiz?.slug === slug) return { quiz: l.quiz, course, lesson: l };
  return null;
}
