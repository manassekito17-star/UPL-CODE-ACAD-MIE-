import "server-only";

import type { CurrentUser } from "./auth";
import { entitlements } from "./plans";
import { getSettings } from "./settings";
import { createAdminClient, hasAdminClient } from "./supabase/admin";

export interface QuotaResult {
  ok: boolean;
  reason?: string;
  used?: number;
  limit?: number;
}

/** Offre de l'utilisateur (gratuite par défaut). */
export async function userPlan(userId: string | null): Promise<"gratuit" | "premium"> {
  if (!userId || !hasAdminClient()) return "gratuit";
  const { data } = await createAdminClient().from("profiles").select("plan").eq("id", userId).maybeSingle();
  return data?.plan === "premium" ? "premium" : "gratuit";
}

/**
 * Réserve des exécutions sur le service isolé (Judge0) avant l'appel : plafond
 * par étudiant et plafond global du jour, vérifiés et décomptés de façon
 * atomique en base. Sans base (mode démonstration), aucun compteur n'existe.
 */
export async function consumeServerRuns(user: CurrentUser | null, units: number): Promise<QuotaResult> {
  if (!hasAdminClient() || units <= 0) return { ok: true };
  const settings = await getSettings();
  const ent = entitlements(await userPlan(user?.id ?? null), settings);
  const { data, error } = await createAdminClient().rpc("consume_quota", {
    p_service: "judge0",
    p_user: user?.id ?? null,
    p_units: units,
    p_user_limit: ent.serverRunsPerDay,
    p_global_limit: settings.execution.server_runs_global_per_day,
  });
  if (error) {
    // En cas de doute, on refuse plutôt que de risquer un dépassement facturé.
    console.error("[quota] réservation impossible", error.message);
    return { ok: false, reason: "Contrôle de consommation indisponible : exécution serveur suspendue par précaution." };
  }
  const row = (data as Array<{ ok: boolean; user_used: number; global_used: number }>)[0];
  if (row?.ok) return { ok: true, used: row.user_used, limit: ent.serverRunsPerDay };
  const globalHit = settings.execution.server_runs_global_per_day > 0 && row.global_used + units > settings.execution.server_runs_global_per_day;
  return {
    ok: false,
    used: row?.user_used,
    limit: ent.serverRunsPerDay,
    reason: globalHit
      ? "Le quota quotidien du service d'exécution de la plateforme est atteint. Il se réinitialise à minuit (UTC)."
      : `Vous avez utilisé vos ${ent.serverRunsPerDay} exécutions serveur du jour (un test corrigé compte pour une exécution). Elles se réinitialisent à minuit (UTC).`,
  };
}
