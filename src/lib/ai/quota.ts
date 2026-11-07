import "server-only";

import type { AiSettings } from "../settings";
import { createAdminClient, hasAdminClient } from "../supabase/admin";

export interface QuotaCheck {
  ok: boolean;
  reason?: string;
  remainingToday?: number;
  dailyLimit?: number;
}

const dayStart = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

/**
 * Contrôle de la consommation du professeur IA :
 *  - plafond global quotidien (quotas gratuits du fournisseur) ;
 *  - budget mensuel, pour un fournisseur payant uniquement ;
 *  - quota quotidien par étudiant (selon son offre).
 */
export async function checkAiQuota(userId: string | null, settings: AiSettings, billing: "gratuit" | "payant" | "test", dailyLimit: number): Promise<QuotaCheck> {
  if (!settings.enabled) return { ok: false, reason: "Le professeur IA est temporairement désactivé par l'administration." };
  if (!hasAdminClient()) return { ok: true };
  const admin = createAdminClient();

  if (settings.global_daily_messages > 0) {
    const { count } = await admin.from("ai_messages").select("id", { count: "exact", head: true }).eq("role", "user").gte("created_at", dayStart());
    if ((count ?? 0) >= settings.global_daily_messages) {
      return { ok: false, reason: "Le quota quotidien du professeur IA pour toute la plateforme est atteint. Il se réinitialise à minuit (UTC) ; les cours restent accessibles." };
    }
  }

  if (billing === "payant") {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { data: monthRows } = await admin.from("ai_messages").select("cost_usd").eq("role", "assistant").gte("created_at", monthStart.toISOString());
    const spent = (monthRows ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
    if (spent >= settings.monthly_budget_usd) {
      return { ok: false, reason: "Le budget mensuel du professeur IA est atteint. Le service reprendra le mois prochain." };
    }
  }

  if (!userId) return { ok: true, dailyLimit };
  const { count } = await admin.from("ai_messages").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("role", "user").gte("created_at", dayStart());
  const used = count ?? 0;
  if (dailyLimit > 0 && used >= dailyLimit) {
    return { ok: false, dailyLimit, remainingToday: 0, reason: `Vous avez atteint la limite de ${dailyLimit} questions par jour. Revenez demain ! Les cours et exercices restent accessibles.` };
  }
  return { ok: true, dailyLimit, remainingToday: dailyLimit > 0 ? dailyLimit - used : undefined };
}
