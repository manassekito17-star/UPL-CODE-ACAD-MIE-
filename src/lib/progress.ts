import "server-only";

import type { Exercise } from "@/content/types";
import type { CurrentUser } from "./auth";
import type { GradeResult } from "./execution/grading";
import type { SourceFile } from "./execution/types";
import { createAdminClient, hasAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

/**
 * Enregistrement de la progression.
 *  - Les données « déclaratives » (leçon ouverte/terminée, temps passé) sont
 *    écrites avec la session de l'étudiant (RLS : uniquement ses lignes).
 *  - Les résultats officiels (soumissions, quiz, badges, certificats) sont
 *    écrits par le serveur avec le client service_role, après correction.
 */

export async function recordLessonActivity(
  user: CurrentUser,
  courseSlug: string,
  lessonSlug: string,
  action: "ouvrir" | "terminer",
  secondsSpent: number,
) {
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("id").eq("slug", courseSlug).maybeSingle();
  if (!course) return { ok: false as const, error: "Cours introuvable" };
  const { data: lesson } = await supabase.from("lessons").select("id").eq("course_id", course.id).eq("slug", lessonSlug).maybeSingle();
  if (!lesson) return { ok: false as const, error: "Leçon introuvable" };

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("status, time_spent_seconds")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  // Un chapitre doté d'un quiz ou d'une évaluation se valide en réussissant
  // celle-ci (côté serveur) ; le bouton « terminer » ne suffit pas.
  if (action === "terminer") {
    const { count } = await supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("lesson_id", lesson.id);
    if ((count ?? 0) > 0) return { ok: false as const, error: "Ce chapitre se valide en réussissant son évaluation." };
  }
  const status = action === "terminer" || existing?.status === "termine" ? "termine" : "commence";
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lesson.id,
      course_id: course.id,
      status,
      time_spent_seconds: (existing?.time_spent_seconds ?? 0) + secondsSpent,
      completed_at: status === "termine" ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) return { ok: false as const, error: error.message };

  // Dernière position pour la reprise de la formation
  await supabase.from("enrollments").upsert(
    { user_id: user.id, course_id: course.id, last_lesson_id: lesson.id, last_activity_at: new Date().toISOString() },
    { onConflict: "user_id,course_id" },
  );

  if (action === "terminer") {
    const { data: cp } = await supabase.from("course_progress").select("percent").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
    if (cp && Number(cp.percent) >= 100) {
      await awardAchievement(user.id, "parcours-termine");
      await issueCertificate(user.id, course.id);
    }
  }
  return { ok: true as const, status };
}

/**
 * Valide un chapitre après la réussite de son évaluation (appelé par le
 * serveur uniquement, après correction).
 */
export async function markLessonValidated(userId: string, courseId: string, lessonId: string) {
  if (!hasAdminClient()) return false;
  const admin = createAdminClient();
  const { data: existing } = await admin.from("lesson_progress").select("status").eq("user_id", userId).eq("lesson_id", lessonId).maybeSingle();
  if (existing?.status === "termine") return true;
  const { error } = await admin.from("lesson_progress").upsert(
    { user_id: userId, lesson_id: lessonId, course_id: courseId, status: "termine", completed_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) {
    console.error("[progress] validation du chapitre", error.message);
    return false;
  }
  await admin.from("enrollments").upsert({ user_id: userId, course_id: courseId, last_lesson_id: lessonId, last_activity_at: new Date().toISOString() }, { onConflict: "user_id,course_id" });
  await awardAchievement(userId, "premiere-lecon");
  const { data: cp } = await admin.from("course_progress").select("percent").eq("user_id", userId).eq("course_id", courseId).maybeSingle();
  if (cp && Number(cp.percent) >= 100) {
    await awardAchievement(userId, "parcours-termine");
    await issueCertificate(userId, courseId);
  }
  return true;
}

export async function awardAchievement(userId: string, code: string) {
  if (!hasAdminClient()) return;
  const admin = createAdminClient();
  const { data: a } = await admin.from("achievements").select("id").eq("code", code).maybeSingle();
  if (!a) return;
  await admin.from("user_achievements").upsert({ user_id: userId, achievement_id: a.id }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
}

async function issueCertificate(userId: string, courseId: string) {
  if (!hasAdminClient()) return;
  const admin = createAdminClient();
  // Certificat délivré si le parcours est terminé ET l'évaluation finale réussie (si elle existe).
  const { data: finalQuiz } = await admin.from("quizzes").select("id").eq("course_id", courseId).eq("is_final", true).maybeSingle();
  let score: number | null = null;
  if (finalQuiz) {
    const { data: best } = await admin
      .from("quiz_attempts")
      .select("score, passed")
      .eq("user_id", userId)
      .eq("quiz_id", finalQuiz.id)
      .eq("passed", true)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!best) return;
    score = Number(best.score);
  }
  await admin.from("certificates").upsert({ user_id: userId, course_id: courseId, score }, { onConflict: "user_id,course_id,level_number", ignoreDuplicates: true });
}

export async function recordSubmission(user: CurrentUser, exercise: Exercise, files: SourceFile[], grade: GradeResult) {
  if (!hasAdminClient() || !exercise.id) return { attemptNumber: null as number | null };
  const admin = createAdminClient();
  const { count } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("exercise_id", exercise.id);
  const attemptNumber = (count ?? 0) + 1;
  const code = files.length === 1 ? files[0].content : files.map((f) => `// ===== ${f.name} =====\n${f.content}`).join("\n\n");
  const { data: sub, error } = await admin
    .from("submissions")
    .insert({
      user_id: user.id,
      exercise_id: exercise.id,
      language_id: exercise.language,
      code,
      status: grade.status,
      score: grade.score,
      passed_count: grade.passed,
      total_count: grade.total,
      attempt_number: attemptNumber,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[progress] soumission non enregistrée", error.message);
    return { attemptNumber };
  }
  await admin.from("execution_results").insert({
    user_id: user.id,
    submission_id: sub.id,
    language_id: exercise.language,
    source_excerpt: code.slice(0, 2000),
    status: grade.status,
    stdout: grade.compileError ? "" : `${grade.passed}/${grade.total} tests réussis`,
    compile_output: grade.compileError ?? null,
  });

  if (grade.status === "reussi") {
    await awardAchievement(user.id, "premier-exercice");
    const { data: solved } = await admin.from("submissions").select("exercise_id").eq("user_id", user.id).eq("status", "reussi");
    if (new Set((solved ?? []).map((s) => s.exercise_id)).size >= 10) await awardAchievement(user.id, "dix-exercices");
  }
  return { attemptNumber };
}

export async function countAttempts(userId: string, exerciseId?: string): Promise<number> {
  if (!hasAdminClient() || !exerciseId) return 0;
  const { count } = await createAdminClient()
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId);
  return count ?? 0;
}

export async function hasSolved(userId: string, exerciseId?: string): Promise<boolean> {
  if (!hasAdminClient() || !exerciseId) return false;
  const { count } = await createAdminClient()
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .eq("status", "reussi");
  return (count ?? 0) > 0;
}

export async function recordExecution(
  userId: string,
  entry: { language: string; source: string; stdin: string; stdout: string; stderr: string; compileOutput: string; status: string; timeMs: number | null; memoryKb: number | null; programId?: string },
) {
  if (!hasAdminClient()) return;
  const admin = createAdminClient();
  await admin.from("execution_results").insert({
    user_id: userId,
    program_id: entry.programId ?? null,
    language_id: entry.language,
    source_excerpt: entry.source.slice(0, 2000),
    stdin: entry.stdin.slice(0, 2000),
    stdout: entry.stdout.slice(0, 5000),
    stderr: entry.stderr.slice(0, 5000),
    compile_output: entry.compileOutput.slice(0, 5000),
    status: entry.status,
    time_ms: entry.timeMs,
    memory_kb: entry.memoryKb,
  });
  await awardAchievement(userId, "premier-programme");
}
