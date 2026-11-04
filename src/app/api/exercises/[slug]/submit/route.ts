import { NextResponse } from "next/server";
import { jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getExerciseForGrading } from "@/lib/content/repository";
import { isSupabaseConfigured } from "@/lib/env";
import { gradeExercise } from "@/lib/execution/grading";
import { LANGUAGES } from "@/lib/execution/languages";
import { ExecutionUnavailableError } from "@/lib/execution/run";
import { countAttempts, hasSolved, recordSubmission } from "@/lib/progress";
import { rateLimit } from "@/lib/rate-limit";
import { submitSchema } from "@/lib/validation";

/** Nombre de tentatives après lequel le corrigé est proposé, même sans réussite. */
const ATTEMPTS_BEFORE_CORRECTION = 5;

export async function POST(request: Request, ctx: RouteContext<"/api/exercises/[slug]/submit">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const { slug } = await ctx.params;
  const body = await parseBody(request, submitSchema);
  if ("response" in body) return body.response;

  const user = await getCurrentUser();
  if (isSupabaseConfigured() && !user) return jsonError(401, "Connectez-vous pour soumettre un exercice.");
  if (user?.status === "suspendu") return jsonError(403, "Compte suspendu.");

  const limit = rateLimit(`submit:${user?.id ?? "demo"}`, 10, 60_000);
  if (!limit.ok) return jsonError(429, `Trop de soumissions. Réessayez dans ${limit.retryAfterSeconds} s.`);

  const exercise = await getExerciseForGrading(slug);
  if (!exercise || exercise.status !== "publie") return jsonError(404, "Exercice introuvable.");

  let grade;
  try {
    grade = await gradeExercise(exercise, body.data.files);
  } catch (e) {
    if (e instanceof ExecutionUnavailableError) {
      return LANGUAGES[exercise.language].browserFallback
        ? jsonError(503, "Correction serveur indisponible.", { fallback: "navigateur" })
        : jsonError(503, `La correction automatique du ${LANGUAGES[exercise.language].shortLabel} nécessite le service d'exécution (Judge0).`);
    }
    console.error("[submit]", e);
    return jsonError(502, "Le service d'exécution n'a pas pu corriger votre programme. Réessayez dans un instant.");
  }

  let attempts = 1;
  let alreadySolved = false;
  if (user) {
    alreadySolved = await hasSolved(user.id, exercise.id);
    const saved = await recordSubmission(user, exercise, body.data.files, grade);
    attempts = saved.attemptNumber ?? (await countAttempts(user.id, exercise.id));
  }

  // Le corrigé n'est révélé qu'après réussite ou après plusieurs tentatives.
  const reveal = grade.status === "reussi" || alreadySolved || attempts >= ATTEMPTS_BEFORE_CORRECTION;
  return NextResponse.json({
    ...grade,
    attempts,
    saved: Boolean(user),
    correction: reveal ? exercise.correction : null,
    solution: reveal ? exercise.solution : null,
    attemptsBeforeCorrection: reveal ? 0 : ATTEMPTS_BEFORE_CORRECTION - attempts,
  });
}
