import "server-only";

import type { Course } from "@/content/types";
import type { CurrentUser } from "../auth";
import { createClient } from "../supabase/server";

export interface ChapterProgress {
  slug: string;
  status: "non_commence" | "commence" | "valide";
  interrogationBest: number | null;
  evaluationBest: number | null;
  evaluationAttempts: number;
  exercisesSolved: number;
  exercisesTotal: number;
  /** Exercices tentés au moins deux fois sans réussite. */
  struggling: string[];
}

/**
 * Progression d'un étudiant dans la Formation, lue avec sa propre session
 * (RLS : uniquement ses données).
 */
export async function getFormationProgress(user: CurrentUser | null, course: Course): Promise<Map<string, ChapterProgress>> {
  const out = new Map<string, ChapterProgress>();
  const lessons = course.modules.flatMap((m) => m.lessons).filter((l) => l.status === "publie");
  for (const l of lessons) {
    const total = [...(l.exerciseSlugs ?? []), ...(l.pedagogy?.td?.exerciseSlugs ?? [])];
    out.set(l.slug, { slug: l.slug, status: "non_commence", interrogationBest: null, evaluationBest: null, evaluationAttempts: 0, exercisesSolved: 0, exercisesTotal: total.length, struggling: [] });
  }
  if (!user || !course.id) return out;

  const supabase = await createClient();
  const [{ data: progress }, { data: attempts }, { data: subs }] = await Promise.all([
    supabase.from("lesson_progress").select("status, lessons(slug)").eq("user_id", user.id).eq("course_id", course.id),
    supabase.from("quiz_attempts").select("score, quizzes!inner(slug, course_id)").eq("user_id", user.id).eq("quizzes.course_id", course.id),
    supabase.from("submissions").select("status, exercises!inner(slug, course_id)").eq("user_id", user.id).eq("exercises.course_id", course.id),
  ]);

  for (const r of progress ?? []) {
    const slug = (r.lessons as unknown as { slug: string }).slug;
    const p = out.get(slug);
    if (p) p.status = r.status === "termine" ? "valide" : "commence";
  }
  const quizOwner = new Map<string, { slug: string; kind: "interrogation" | "evaluation" }>();
  for (const l of lessons) {
    if (l.pedagogy?.interrogation) quizOwner.set(l.pedagogy.interrogation.slug, { slug: l.slug, kind: "interrogation" });
    if (l.pedagogy?.evaluation) quizOwner.set(l.pedagogy.evaluation.slug, { slug: l.slug, kind: "evaluation" });
  }
  for (const a of attempts ?? []) {
    const owner = quizOwner.get((a.quizzes as unknown as { slug: string }).slug);
    const p = owner && out.get(owner.slug);
    if (!p) continue;
    const score = Number(a.score);
    if (owner.kind === "interrogation") p.interrogationBest = Math.max(p.interrogationBest ?? 0, score);
    else {
      p.evaluationBest = Math.max(p.evaluationBest ?? 0, score);
      p.evaluationAttempts++;
    }
    if (p.status === "non_commence") p.status = "commence";
  }
  const exerciseOwner = new Map<string, string>();
  for (const l of lessons) for (const s of [...(l.exerciseSlugs ?? []), ...(l.pedagogy?.td?.exerciseSlugs ?? [])]) exerciseOwner.set(s, l.slug);
  const stats = new Map<string, { ok: boolean; tries: number }>();
  for (const s of subs ?? []) {
    const slug = (s.exercises as unknown as { slug: string }).slug;
    const st = stats.get(slug) ?? { ok: false, tries: 0 };
    st.tries++;
    if (s.status === "reussi") st.ok = true;
    stats.set(slug, st);
  }
  for (const [slug, st] of stats) {
    const p = out.get(exerciseOwner.get(slug) ?? "");
    if (!p) continue;
    if (st.ok) p.exercisesSolved++;
    else if (st.tries >= 2) p.struggling.push(slug);
    if (p.status === "non_commence") p.status = "commence";
  }
  return out;
}
