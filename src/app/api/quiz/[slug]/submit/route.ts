import { NextResponse } from "next/server";
import { jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getQuizForGrading } from "@/lib/content/repository";
import { awardAchievement } from "@/lib/progress";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { quizSubmitSchema } from "@/lib/validation";

export async function POST(request: Request, ctx: RouteContext<"/api/quiz/[slug]/submit">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const { slug } = await ctx.params;
  const body = await parseBody(request, quizSubmitSchema);
  if ("response" in body) return body.response;

  const found = await getQuizForGrading(slug);
  if (!found) return jsonError(404, "Quiz introuvable.");
  const { quiz } = found;
  const user = await getCurrentUser();
  if (user?.status === "suspendu") return jsonError(403, "Compte suspendu.");

  const corrections = quiz.questions.map((q) => {
    const given = [...new Set(body.data.answers[q.id] ?? [])].sort();
    const expected = [...q.correct].sort();
    const correct = given.length === expected.length && given.every((v, i) => v === expected[i]);
    return { id: q.id, correct, expected, explanation: q.explanation ?? null };
  });
  const good = corrections.filter((c) => c.correct).length;
  const score = quiz.questions.length ? Math.round((good / quiz.questions.length) * 10000) / 100 : 0;
  const passed = score >= quiz.passScore;

  if (user && hasAdminClient() && quiz.id) {
    await createAdminClient().from("quiz_attempts").insert({ user_id: user.id, quiz_id: quiz.id, answers: body.data.answers, score, passed });
    if (score === 100) await awardAchievement(user.id, "quiz-parfait");
  }
  return NextResponse.json({ score, passed, passScore: quiz.passScore, good, total: quiz.questions.length, corrections, saved: Boolean(user) });
}
