import "server-only";

import type { Course, LevelNumber } from "@/content/types";
import type { CurrentUser } from "../auth";
import { getCourse } from "../content/repository";
import { createAdminClient, hasAdminClient } from "../supabase/admin";
import { createClient } from "../supabase/server";
import { levelStates, type LevelFacts, type LevelState } from "./rules";

export interface PlacementSummary {
  recommended: LevelNumber;
  scores: Partial<Record<LevelNumber, { good: number; total: number }>>;
  at: string;
}

type Reader = Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient>;

async function readFacts(db: Reader, userId: string, course: Course): Promise<LevelFacts> {
  const facts: LevelFacts = { validatedLessons: new Set(), examBest: {}, recorded: {} };
  if (!course.id) return facts;
  const examSlugs = new Map((course.levels ?? []).filter((l) => l.exam).map((l) => [l.exam!.slug, l.number]));
  const [{ data: lp }, { data: lv }, { data: attempts }] = await Promise.all([
    db.from("lesson_progress").select("status, lessons(slug)").eq("user_id", userId).eq("course_id", course.id),
    db.from("level_progress").select("level_number, status").eq("user_id", userId).eq("course_id", course.id),
    examSlugs.size
      ? db.from("quiz_attempts").select("score, quizzes!inner(slug)").eq("user_id", userId).in("quizzes.slug", [...examSlugs.keys()])
      : Promise.resolve({ data: [] as Array<{ score: number; quizzes: unknown }> }),
  ]);
  for (const r of lp ?? []) if (r.status === "termine") facts.validatedLessons.add((r.lessons as unknown as { slug: string }).slug);
  for (const r of lv ?? []) facts.recorded[r.level_number as LevelNumber] = r.status as "valide" | "dispense" | "en_cours";
  for (const a of attempts ?? []) {
    const n = examSlugs.get((a.quizzes as unknown as { slug: string }).slug);
    if (n) facts.examBest[n] = Math.max(facts.examBest[n] ?? 0, Number(a.score));
  }
  return facts;
}

/** États des niveaux pour l'étudiant connecté (lecture avec sa session, RLS). */
export async function getLevelStates(user: CurrentUser | null, course: Course): Promise<LevelState[]> {
  if (!user || !course.id) return levelStates(course, { validatedLessons: new Set(), examBest: {}, recorded: {} });
  return levelStates(course, await readFacts(await createClient(), user.id, course));
}

export async function getLatestPlacement(user: CurrentUser | null, courseId?: string): Promise<PlacementSummary | null> {
  if (!user || !courseId) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("placement_results")
    .select("recommended_level, scores, created_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? { recommended: data.recommended_level as LevelNumber, scores: data.scores, at: data.created_at } : null;
}

/**
 * Enregistre un test de positionnement (serveur uniquement). Les niveaux
 * inférieurs au niveau recommandé sont dispensés ; un niveau déjà validé
 * n'est jamais rétrogradé.
 */
export async function recordPlacement(userId: string, course: Course, quizId: string | undefined, scores: PlacementSummary["scores"], recommended: LevelNumber) {
  if (!hasAdminClient() || !course.id) return false;
  const admin = createAdminClient();
  const { error } = await admin.from("placement_results").insert({ user_id: userId, course_id: course.id, quiz_id: quizId ?? null, scores, recommended_level: recommended });
  if (error) {
    console.error("[niveaux] positionnement non enregistré", error.message);
    return false;
  }
  const { data: existing } = await admin.from("level_progress").select("level_number, status").eq("user_id", userId).eq("course_id", course.id);
  const validated = new Set((existing ?? []).filter((r) => r.status === "valide").map((r) => r.level_number));
  const rows = ([1, 2, 3] as LevelNumber[])
    .filter((n) => n < recommended && !validated.has(n))
    .map((n) => ({ user_id: userId, course_id: course.id!, level_number: n, status: "dispense" }));
  if (rows.length) await admin.from("level_progress").upsert(rows, { onConflict: "user_id,course_id,level_number" });
  await admin.from("enrollments").upsert({ user_id: userId, course_id: course.id, last_activity_at: new Date().toISOString() }, { onConflict: "user_id,course_id" });
  return true;
}

/** L'examen du niveau n est-il accessible (niveau précédent validé ou dispensé) ? */
export async function isLevelExamUnlocked(userId: string, course: Course, n: LevelNumber): Promise<boolean> {
  if (n === 1) return true;
  if (!hasAdminClient()) return false;
  const states = levelStates(course, await readFacts(createAdminClient(), userId, course));
  return states.find((s) => s.number === n)?.examUnlocked ?? false;
}

/**
 * Recalcule les niveaux après un événement (chapitre validé, examen passé)
 * et enregistre les validations nouvellement acquises, avec certificat
 * interne et badge. Retourne les niveaux validés lors de cet appel.
 */
export async function refreshLevels(userId: string, courseOrId: Course | string): Promise<LevelNumber[]> {
  if (!hasAdminClient()) return [];
  const admin = createAdminClient();
  let course: Course | null = typeof courseOrId === "string" ? null : courseOrId;
  if (!course) {
    const { data } = await admin.from("courses").select("slug").eq("id", courseOrId).maybeSingle();
    course = data ? await getCourse(data.slug, true) : null;
  }
  if (!course?.id || !course.levels?.length) return [];
  const newly: LevelNumber[] = [];
  // Valider un niveau peut rendre le suivant validable : on réévalue jusqu'à stabilité.
  for (let pass = 0; pass < 4; pass++) {
    const states = levelStates(course, await readFacts(admin, userId, course));
    const s = states.find((x) => x.status === "en_cours" && x.criteriaMet);
    if (!s) break;
    const { error } = await admin.from("level_progress").upsert(
      { user_id: userId, course_id: course.id, level_number: s.number, status: "valide", exam_score: s.examBest, validated_at: new Date().toISOString() },
      { onConflict: "user_id,course_id,level_number" },
    );
    if (error) {
      console.error("[niveaux] validation non enregistrée", error.message);
      break;
    }
    await admin.from("certificates").upsert({ user_id: userId, course_id: course.id, level_number: s.number, score: s.examBest }, { onConflict: "user_id,course_id,level_number", ignoreDuplicates: true });
    newly.push(s.number);
  }
  if (newly.length) {
    const { data: a } = await admin.from("achievements").select("id").eq("code", "niveau-valide").maybeSingle();
    if (a) await admin.from("user_achievements").upsert({ user_id: userId, achievement_id: a.id }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
  }
  return newly;
}
