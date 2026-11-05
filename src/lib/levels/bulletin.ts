import "server-only";

import type { Course, LevelNumber } from "@/content/types";
import type { CurrentUser } from "../auth";
import { getCourse, listCourses } from "../content/repository";
import { getFormationProgress } from "../formation/progress";
import { createClient } from "../supabase/server";
import { currentLevel, type LevelState } from "./rules";
import { getLatestPlacement, getLevelStates, type PlacementSummary } from "./server";

export interface BulletinCertificate {
  code: string;
  level: LevelNumber | null;
  score: number | null;
  issuedAt: string;
}

export interface BulletinCourse {
  course: Course;
  levels: LevelState[];
  current: LevelNumber;
  placement: PlacementSummary | null;
  chapters: Array<{ slug: string; title: string; level: LevelNumber | null; status: "non_commence" | "commence" | "valide"; evaluationBest: number | null; evaluationAttempts: number }>;
  /** Chapitres à revoir : évaluation tentée sans réussite, ou exercices échoués à répétition. */
  toReview: Array<{ slug: string; title: string; reason: string }>;
  certificates: BulletinCertificate[];
}

/** Bulletin de progression de l'étudiant connecté (lecture avec sa session, RLS). */
export async function getBulletin(user: CurrentUser): Promise<BulletinCourse[]> {
  const supabase = await createClient();
  const [{ data: enr }, { data: lp }, { data: pl }, { data: certs }] = await Promise.all([
    supabase.from("enrollments").select("course_id").eq("user_id", user.id),
    supabase.from("lesson_progress").select("course_id").eq("user_id", user.id),
    supabase.from("placement_results").select("course_id").eq("user_id", user.id),
    supabase.from("certificates").select("course_id, verification_code, level_number, score, issued_at").eq("user_id", user.id).order("issued_at"),
  ]);
  const active = new Set([...(enr ?? []), ...(lp ?? []), ...(pl ?? [])].map((r) => r.course_id as string));
  const summaries = (await listCourses()).filter((c) => c.id && active.has(c.id));
  const out: BulletinCourse[] = [];
  for (const s of summaries) {
    const course = await getCourse(s.slug);
    if (!course?.id) continue;
    const [levels, placement, progress] = await Promise.all([getLevelStates(user, course), getLatestPlacement(user, course.id), getFormationProgress(user, course)]);
    const levelOf = new Map(course.modules.flatMap((m) => m.lessons.map((l) => [l.slug, m.level ?? null] as const)));
    const lessons = course.modules.flatMap((m) => m.lessons).filter((l) => l.status === "publie");
    const chapters = lessons.map((l) => {
      const p = progress.get(l.slug);
      return { slug: l.slug, title: l.title, level: levelOf.get(l.slug) ?? null, status: p?.status ?? "non_commence", evaluationBest: p?.evaluationBest ?? null, evaluationAttempts: p?.evaluationAttempts ?? 0 };
    });
    const toReview: BulletinCourse["toReview"] = [];
    for (const l of lessons) {
      const p = progress.get(l.slug);
      if (!p || p.status === "valide") continue;
      if (p.evaluationAttempts > 0) toReview.push({ slug: l.slug, title: l.title, reason: `évaluation non réussie (meilleur score : ${p.evaluationBest ?? 0} %)` });
      else if (p.struggling.length) toReview.push({ slug: l.slug, title: l.title, reason: `${p.struggling.length} exercice(s) échoué(s) plusieurs fois` });
    }
    out.push({
      course,
      levels,
      current: currentLevel(levels),
      placement,
      chapters,
      toReview,
      certificates: (certs ?? [])
        .filter((c) => c.course_id === course.id)
        .map((c) => ({ code: c.verification_code, level: (c.level_number as LevelNumber | null) ?? null, score: c.score === null ? null : Number(c.score), issuedAt: c.issued_at })),
    });
  }
  return out;
}
