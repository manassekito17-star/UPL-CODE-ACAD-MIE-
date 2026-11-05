import "server-only";

import { createAdminClient, hasAdminClient } from "../supabase/admin";
import type { createClient } from "../supabase/server";
import { serializeQuiz, type ParsedQuestion } from "./formats";

type Db = Awaited<ReturnType<typeof createClient>>;

export interface QuizTarget {
  courseId: string;
  lessonId?: string | null;
  slug: string;
  title: string;
  kind: "verification" | "interrogation" | "evaluation" | "positionnement" | "examen_niveau";
  levelNumber?: number | null;
  passScore?: number;
  durationMinutes?: number | null;
}

/**
 * Crée ou met à jour un quiz et remplace ses questions. Les réponses vont
 * dans quiz_answer_keys (réservée à l'équipe). Écrit avec la session de
 * l'enseignant : les politiques RLS « contenus » s'appliquent.
 */
export async function saveQuizQuestions(db: Db, target: QuizTarget, questions: ParsedQuestion[], existingId?: string | null): Promise<string | null> {
  const row = {
    course_id: target.courseId,
    lesson_id: target.lessonId ?? null,
    slug: target.slug,
    title: target.title,
    kind: target.kind,
    level_number: target.levelNumber ?? null,
    pass_score: target.passScore ?? 60,
    duration_minutes: target.durationMinutes ?? null,
    status: "publie" as const,
  };
  // Un quiz existant garde son identifiant (slug) : les tentatives y restent rattachées.
  const { slug: _slug, ...updateRow } = row;
  void _slug;
  const { data: q, error } = existingId
    ? await db.from("quizzes").update(updateRow).eq("id", existingId).select("id").single()
    : await db.from("quizzes").insert(row).select("id").single();
  if (error || !q) throw new Error(error?.code === "23505" ? "Un quiz de ce type existe déjà (identifiant en double)." : (error?.message ?? "Quiz non enregistré."));
  await db.from("quiz_questions").delete().eq("quiz_id", q.id);
  for (const [i, qq] of questions.entries()) {
    const type = qq.correct.length > 1 ? "choix_multiples" : qq.choices.length === 2 && qq.choices[0] === "Vrai" ? "vrai_faux" : "qcm";
    const { data: ins, error: e2 } = await db
      .from("quiz_questions")
      .insert({ quiz_id: q.id, type, prompt: qq.prompt, choices: qq.choices, position: i, level_number: qq.level ?? null })
      .select("id")
      .single();
    if (e2 || !ins) throw new Error(e2?.message ?? "Question non enregistrée.");
    await db.from("quiz_answer_keys").insert({ question_id: ins.id, correct: qq.correct, explanation: qq.explanation ?? null });
  }
  return q.id;
}

/** Quiz au format texte (avec réponses) pour l'édition. */
export async function quizAsText(db: Db, quizId: string | null | undefined): Promise<string> {
  if (!quizId) return "";
  const { data: qs } = await db.from("quiz_questions").select("id, prompt, choices, level_number").eq("quiz_id", quizId).order("position");
  if (!qs?.length) return "";
  // Les réponses sont lisibles par l'équipe « contenus » (RLS) ; repli service_role sinon.
  let { data: keys } = await db.from("quiz_answer_keys").select("*").in("question_id", qs.map((q) => q.id));
  if (!keys?.length && hasAdminClient()) keys = (await createAdminClient().from("quiz_answer_keys").select("*").in("question_id", qs.map((q) => q.id))).data;
  return serializeQuiz(
    qs.map((q) => {
      const k = (keys ?? []).find((x) => x.question_id === q.id);
      return { prompt: q.prompt, choices: q.choices as string[], correct: (k?.correct as number[]) ?? [], explanation: k?.explanation ?? undefined, level: (q.level_number as 1 | 2 | 3 | 4 | null) ?? undefined };
    }),
  );
}
