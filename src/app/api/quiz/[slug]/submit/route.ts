import { NextResponse } from "next/server";
import { jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getQuizForGrading, validatingQuizSlug } from "@/lib/content/repository";
import { scorePlacement } from "@/lib/levels/rules";
import { isLevelExamUnlocked, recordPlacement, refreshLevels } from "@/lib/levels/server";
import { awardAchievement, markLessonValidated } from "@/lib/progress";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { quizSubmitSchema } from "@/lib/validation";

export async function POST(request: Request, ctx: RouteContext<"/api/quiz/[slug]/submit">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const { slug } = await ctx.params;
  const body = await parseBody(request, quizSubmitSchema);
  if ("response" in body) return body.response;

  const found = await getQuizForGrading(slug);
  if (!found) return jsonError(404, "Quiz introuvable.");
  const { quiz, course, lesson } = found;
  const user = await getCurrentUser();
  if (user?.status === "suspendu") return jsonError(403, "Compte suspendu.");

  // Examen de niveau : réservé aux étudiants connectés dont le niveau précédent est acquis.
  const examLevel = quiz.kind === "examen_niveau" ? course.levels?.find((l) => l.exam?.slug === quiz.slug) : undefined;
  if (examLevel) {
    if (!user) return jsonError(401, "Connectez-vous pour passer un examen de niveau.");
    if (!isStaff(user) && !(await isLevelExamUnlocked(user.id, course, examLevel.number))) {
      return jsonError(403, `Cet examen s'ouvre après la validation du niveau ${examLevel.number - 1} (ou une dispense par le test de positionnement).`);
    }
  }

  const corrections = quiz.questions.map((q) => {
    const given = [...new Set(body.data.answers[q.id] ?? [])].sort();
    const expected = [...q.correct].sort();
    const correct = given.length === expected.length && given.every((v, i) => v === expected[i]);
    return { id: q.id, correct, expected, explanation: q.explanation ?? null };
  });
  const good = corrections.filter((c) => c.correct).length;
  const score = quiz.questions.length ? Math.round((good / quiz.questions.length) * 10000) / 100 : 0;
  const passScore = examLevel ? examLevel.criteria.examPassScore : quiz.passScore;
  const passed = score >= passScore;
  const placement = quiz.kind === "positionnement" ? scorePlacement(quiz, body.data.answers) : null;

  let lessonCompleted = false;
  let levelsValidated: number[] = [];
  let saved = false;
  if (user && hasAdminClient() && quiz.id) {
    const { error } = await createAdminClient().from("quiz_attempts").insert({ user_id: user.id, quiz_id: quiz.id, answers: body.data.answers, score, passed });
    saved = !error;
    if (score === 100 && !placement) await awardAchievement(user.id, "quiz-parfait");
    // Réussite de l'épreuve qui valide le chapitre → chapitre terminé.
    if (passed && lesson?.id && course.id && validatingQuizSlug(lesson) === quiz.slug) {
      lessonCompleted = await markLessonValidated(user.id, course.id, lesson.id);
    }
    if (placement) saved = await recordPlacement(user.id, course, quiz.id, placement.scores, placement.recommended);
    if (examLevel || lessonCompleted) levelsValidated = await refreshLevels(user.id, course);
  }
  return NextResponse.json({
    score,
    passed: placement ? true : passed,
    passScore,
    good,
    total: quiz.questions.length,
    // Le test de positionnement ne donne pas les réponses : il pourrait être repassé à l'identique.
    corrections: placement ? corrections.map((c) => ({ id: c.id, correct: c.correct, expected: [], explanation: null })) : corrections,
    saved,
    lessonCompleted,
    levelsValidated,
    placement: placement ? { recommended: placement.recommended, scores: placement.scores } : undefined,
  });
}
