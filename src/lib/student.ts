import "server-only";

import type { CurrentUser } from "./auth";
import { createClient } from "./supabase/server";

/** Données de progression de l'étudiant connecté (lecture via RLS : uniquement les siennes). */

export async function getCourseProgressMap(user: CurrentUser | null): Promise<Record<string, number>> {
  if (!user) return {};
  const supabase = await createClient();
  const { data } = await supabase.from("course_progress").select("percent, courses(slug)").eq("user_id", user.id);
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[(r.courses as unknown as { slug: string }).slug] = Number(r.percent);
  return out;
}

export async function getCompletedLessons(user: CurrentUser | null, courseId?: string): Promise<Set<string>> {
  if (!user || !courseId) return new Set();
  const supabase = await createClient();
  const { data } = await supabase.from("lesson_progress").select("status, lessons(slug)").eq("user_id", user.id).eq("course_id", courseId);
  return new Set((data ?? []).filter((r) => r.status === "termine").map((r) => (r.lessons as unknown as { slug: string }).slug));
}

export async function getLastLesson(user: CurrentUser | null, courseId?: string): Promise<string | null> {
  if (!user || !courseId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("enrollments").select("lessons(slug)").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
  return (data?.lessons as unknown as { slug: string } | null)?.slug ?? null;
}

export async function getSolvedExercises(user: CurrentUser | null): Promise<Set<string>> {
  if (!user) return new Set();
  const supabase = await createClient();
  const { data } = await supabase.from("submissions").select("status, exercises(slug)").eq("user_id", user.id).eq("status", "reussi");
  return new Set((data ?? []).map((r) => (r.exercises as unknown as { slug: string }).slug));
}

export async function getDashboard(user: CurrentUser) {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const [progress, enrollments, lessonRows, submissions, badges, certificates, profile, announcements] = await Promise.all([
    supabase.from("course_progress").select("percent, completed_lessons, total_lessons, courses(slug, title, language_id)").eq("user_id", user.id),
    supabase
      .from("enrollments")
      .select("last_activity_at, courses(slug, title, language_id), lessons(slug, title)")
      .eq("user_id", user.id)
      .order("last_activity_at", { ascending: false })
      .limit(5),
    supabase.from("lesson_progress").select("time_spent_seconds, updated_at, status").eq("user_id", user.id),
    supabase
      .from("submissions")
      .select("status, score, created_at, exercises(slug, title, language_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("user_achievements").select("earned_at, achievements(code, title, description, icon)").eq("user_id", user.id),
    supabase.from("certificates").select("verification_code, issued_at, score, level_number, courses(title)").eq("user_id", user.id),
    supabase.from("profiles").select("learning_goal, weekly_goal_minutes, level").eq("id", user.id).maybeSingle(),
    supabase.from("announcements").select("id, title, body, created_at, audience").order("created_at", { ascending: false }).limit(3),
  ]);

  const totalSeconds = (lessonRows.data ?? []).reduce((s, r) => s + r.time_spent_seconds, 0);
  const weekSeconds = (lessonRows.data ?? []).filter((r) => r.updated_at >= weekAgo).reduce((s, r) => s + r.time_spent_seconds, 0);
  const subs = submissions.data ?? [];
  const solved = new Set(subs.filter((s) => s.status === "reussi").map((s) => (s.exercises as unknown as { slug: string }).slug));
  const attempted = new Map<string, { slug: string; title: string; language: string }>();
  for (const s of subs) {
    const e = s.exercises as unknown as { slug: string; title: string; language_id: string };
    if (!solved.has(e.slug) && !attempted.has(e.slug)) attempted.set(e.slug, { slug: e.slug, title: e.title, language: e.language_id });
  }
  return {
    progress: (progress.data ?? []).map((p) => ({ ...(p.courses as unknown as { slug: string; title: string; language_id: string }), percent: Number(p.percent), done: p.completed_lessons, total: p.total_lessons })),
    recent: (enrollments.data ?? []).map((e) => ({ course: e.courses as unknown as { slug: string; title: string }, lesson: e.lessons as unknown as { slug: string; title: string } | null, at: e.last_activity_at })),
    totalMinutes: Math.round(totalSeconds / 60),
    weekMinutes: Math.round(weekSeconds / 60),
    lessonsDone: (lessonRows.data ?? []).filter((r) => r.status === "termine").length,
    recentResults: subs.slice(0, 6).map((s) => ({ ...(s.exercises as unknown as { slug: string; title: string }), status: s.status, score: Number(s.score), at: s.created_at })),
    toFinish: [...attempted.values()].slice(0, 5),
    solvedCount: solved.size,
    attemptsCount: subs.length,
    badges: (badges.data ?? []).map((b) => ({ ...(b.achievements as unknown as { code: string; title: string; description: string; icon: string }), at: b.earned_at })),
    certificates: (certificates.data ?? []).map((c) => ({ code: c.verification_code, at: c.issued_at, score: c.score, level: c.level_number as number | null, course: (c.courses as unknown as { title: string }).title })),
    profile: profile.data,
    announcements: (announcements.data ?? []).filter((a) => a.audience !== "enseignants" || user.isTeacher || user.isAdmin),
  };
}
