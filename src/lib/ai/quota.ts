import "server-only";

import type { AiSettings } from "../settings";
import { createAdminClient, hasAdminClient } from "../supabase/admin";

export interface QuotaCheck {
  ok: boolean;
  reason?: string;
  remainingToday?: number;
}

/** Contrôle des coûts : quota quotidien par étudiant et budget mensuel global. */
export async function checkAiQuota(userId: string | null, settings: AiSettings): Promise<QuotaCheck> {
  if (!settings.enabled) return { ok: false, reason: "Le professeur IA est temporairement désactivé par l'administration." };
  if (!hasAdminClient()) return { ok: true };
  const admin = createAdminClient();

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { data: monthRows } = await admin.from("ai_messages").select("cost_usd").eq("role", "assistant").gte("created_at", monthStart.toISOString());
  const spent = (monthRows ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
  if (spent >= settings.monthly_budget_usd) {
    return { ok: false, reason: "Le budget mensuel du professeur IA est atteint. Le service reprendra le mois prochain." };
  }

  if (!userId) return { ok: true };
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count } = await admin
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", dayStart.toISOString());
  const used = count ?? 0;
  if (used >= settings.daily_messages_per_user) {
    return { ok: false, reason: `Vous avez atteint la limite de ${settings.daily_messages_per_user} questions par jour. Revenez demain !` };
  }
  return { ok: true, remainingToday: settings.daily_messages_per_user - used };
}
