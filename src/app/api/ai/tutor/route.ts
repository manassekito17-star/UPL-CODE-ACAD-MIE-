import { getAiProvider } from "@/lib/ai";
import { buildUserMessage, TUTOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { checkAiQuota } from "@/lib/ai/quota";
import { estimateCostUsd, type AiMessage, type AiUsage } from "@/lib/ai/types";
import { jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { buildCurriculumContext, vocabularyForLevel } from "@/lib/ai/curriculum";
import { getCourse, getPublicExercise } from "@/lib/content/repository";
import { currentLevel } from "@/lib/levels/rules";
import { getLevelStates } from "@/lib/levels/server";
import { isSupabaseConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { serverEnv } from "@/lib/server-env";
import { getSettings } from "@/lib/settings";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { tutorSchema } from "@/lib/validation";

export const maxDuration = 120;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const body = await parseBody(request, tutorSchema);
  if ("response" in body) return body.response;
  const req = body.data;

  const user = await getCurrentUser();
  // Le professeur IA a un coût : il est réservé aux comptes connectés
  // (sauf installation de développement explicitement autorisée).
  if (!user && (isSupabaseConfigured() || !serverEnv.aiAllowAnonymous)) {
    return jsonError(401, "Connectez-vous pour discuter avec le professeur IA.");
  }
  if (user?.status === "suspendu") return jsonError(403, "Compte suspendu.");

  const burst = rateLimit(`ai:${user?.id ?? clientIp(request.headers)}`, 8, 60_000);
  if (!burst.ok) return jsonError(429, `Doucement ! Réessayez dans ${burst.retryAfterSeconds} s.`);

  const provider = getAiProvider();
  if (!provider) return jsonError(503, "Le professeur IA n'est pas encore configuré sur cette installation (clé API manquante).");

  const settings = await getSettings();
  const quota = await checkAiQuota(user?.id ?? null, settings.ai);
  if (!quota.ok) return jsonError(429, quota.reason ?? "Quota atteint.");

  const exercise = req.context.exerciseSlug ? await getPublicExercise(req.context.exerciseSlug) : null;
  // Spécialisation : programme du parcours et niveau réel de l'étudiant, relus côté serveur.
  const courseSlug = exercise?.courseSlug || req.context.courseSlug;
  const course = courseSlug ? await getCourse(courseSlug) : null;
  let curriculum: { text: string; vocabulary?: "debutant" | "intermediaire" | "avance" } | undefined;
  if (course && (course.status === "publie" || user?.isAdmin || user?.isTeacher)) {
    const states = await getLevelStates(user, course);
    const placedOrValidated = states.some((s) => s.status === "valide" || s.status === "dispense");
    const current = currentLevel(states);
    curriculum = {
      text: buildCurriculumContext(course, { lessonSlug: req.context.lessonSlug ?? exercise?.lessonSlug, states: user ? states : undefined, current: user ? current : undefined }),
      // Le niveau mesuré (positionnement ou niveau validé) prime sur la préférence de l'interface.
      vocabulary: placedOrValidated ? vocabularyForLevel(current) : undefined,
    };
  }
  const userContent = buildUserMessage(req, exercise, curriculum);

  // Historique : lu en base si la conversation existe (on ne fait pas confiance au client).
  const db = user && hasAdminClient() ? createAdminClient() : null;
  let conversationId = req.conversationId ?? null;
  let history: AiMessage[] = req.history;
  if (db && user) {
    if (conversationId) {
      const { data: conv } = await db.from("ai_conversations").select("id").eq("id", conversationId).eq("user_id", user.id).maybeSingle();
      if (!conv) conversationId = null;
    }
    if (conversationId) {
      const { data: rows } = await db
        .from("ai_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(20);
      history = (rows ?? []).reverse().map((r) => ({ role: r.role as AiMessage["role"], content: r.content }));
    } else {
      const { data: conv } = await db
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: req.message.slice(0, 80),
          context: { exerciseSlug: req.context.exerciseSlug ?? null, language: req.context.language ?? null, courseSlug: course?.slug ?? null, lessonSlug: req.context.lessonSlug ?? null },
        })
        .select("id")
        .single();
      conversationId = conv?.id ?? null;
      history = [];
    }
    if (conversationId) {
      await db.from("ai_messages").insert({ conversation_id: conversationId, user_id: user.id, role: "user", content: req.message, mode: req.mode });
    }
  }

  // L'API exige une alternance user/assistant commençant par user.
  const messages: AiMessage[] = [];
  for (const m of history) {
    if (messages.length === 0 && m.role !== "user") continue;
    if (messages.length && messages[messages.length - 1].role === m.role) messages[messages.length - 1].content += `\n\n${m.content}`;
    else messages.push({ ...m });
  }
  if (messages.length && messages[messages.length - 1].role === "user") messages.pop();
  messages.push({ role: "user", content: userContent });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = "";
      let usage: AiUsage | null = null;
      try {
        const gen = provider.stream({
          system: TUTOR_SYSTEM_PROMPT,
          messages,
          maxOutputTokens: settings.ai.max_output_tokens,
          effort: settings.ai.effort,
          signal: request.signal,
        });
        for (;;) {
          const { value, done } = await gen.next();
          if (done) {
            usage = value;
            break;
          }
          answer += value;
          controller.enqueue(encoder.encode(value));
        }
      } catch (e) {
        console.error("[ai/tutor]", e);
        const msg = "\n\n_Le professeur IA a rencontré un problème. Réessayez dans un instant._";
        answer += msg;
        controller.enqueue(encoder.encode(msg));
      } finally {
        if (db && user && conversationId && answer) {
          await db.from("ai_messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: answer,
            mode: req.mode,
            model: usage?.model ?? provider.model,
            input_tokens: usage?.inputTokens ?? 0,
            output_tokens: usage?.outputTokens ?? 0,
            cost_usd: usage ? estimateCostUsd(usage) : 0,
          });
          await db.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...(conversationId ? { "X-Conversation-Id": conversationId } : {}),
      ...(quota.remainingToday !== undefined ? { "X-Remaining-Today": String(quota.remainingToday - 1) } : {}),
    },
  });
}
