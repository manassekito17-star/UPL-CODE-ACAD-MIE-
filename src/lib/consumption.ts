import "server-only";

import { aiAvailability } from "./ai";
import { isJudge0Configured } from "./server-env";
import { getSettings } from "./settings";
import { createAdminClient, hasAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

/**
 * Limites indicatives des offres gratuites (novembre 2026, sources : pages
 * des fournisseurs et guides récents). Elles changent régulièrement :
 * vérifier les pages officielles et ajuster ici si besoin.
 */
export const FREE_TIER = {
  supabaseDatabaseBytes: 500 * 1024 * 1024,
  supabaseStorageBytes: 1024 * 1024 * 1024,
  supabaseMonthlyActiveUsers: 50_000,
} as const;

export interface Gauge {
  id: string;
  label: string;
  used: number;
  limit: number;
  unit: "nombre" | "octets" | "dollars";
  detail?: string;
}

export interface Consumption {
  gauges: Gauge[];
  alerts: Array<{ level: "attention" | "critique"; text: string }>;
  ai: ReturnType<typeof aiAvailability>;
  judge0Configured: boolean;
  judge0TopUsers: Array<{ name: string; units: number }>;
  refusedToday: number;
}

const startOfDay = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
const startOfMonth = () => {
  const d = startOfDay();
  d.setUTCDate(1);
  return d;
};

/** Seuils d'alerte : 80 % (attention) et 100 % (critique). */
export function alertsFor(gauges: Gauge[]): Consumption["alerts"] {
  const out: Consumption["alerts"] = [];
  for (const g of gauges) {
    if (g.limit <= 0) continue;
    const r = g.used / g.limit;
    if (r >= 1) out.push({ level: "critique", text: `${g.label} : limite atteinte (${Math.round(r * 100)} %).` });
    else if (r >= 0.8) out.push({ level: "attention", text: `${g.label} : ${Math.round(r * 100)} % de la limite utilisés.` });
  }
  return out;
}

/** Tableau de bord de consommation (administrateur). */
export async function getConsumption(): Promise<Consumption> {
  const settings = await getSettings();
  const ai = aiAvailability(settings.ai);
  const gauges: Gauge[] = [];
  let top: Consumption["judge0TopUsers"] = [];
  let refusedToday = 0;
  if (hasAdminClient()) {
    const admin = createAdminClient();
    const day = startOfDay().toISOString();
    const today = day.slice(0, 10);
    const [{ count: aiToday }, { data: aiMonth }, { data: usageToday }, { data: usageMonth }] = await Promise.all([
      admin.from("ai_messages").select("id", { count: "exact", head: true }).eq("role", "user").gte("created_at", day),
      admin.from("ai_messages").select("cost_usd").eq("role", "assistant").gte("created_at", startOfMonth().toISOString()),
      admin.from("service_usage").select("user_id, units, refused").eq("service", "judge0").eq("day", today),
      admin.from("service_usage").select("units").eq("service", "judge0").gte("day", startOfMonth().toISOString().slice(0, 10)),
    ]);
    const cost = (aiMonth ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
    gauges.push({ id: "ia-jour", label: "Questions au professeur IA aujourd'hui", used: aiToday ?? 0, limit: settings.ai.global_daily_messages, unit: "nombre" });
    gauges.push({ id: "ia-mois", label: "Réponses IA ce mois", used: (aiMonth ?? []).length, limit: 0, unit: "nombre", detail: `coût estimé ${cost.toFixed(2)} $` });
    if (settings.ai.allow_paid_providers) gauges.push({ id: "ia-budget", label: "Budget IA du mois", used: cost, limit: settings.ai.monthly_budget_usd, unit: "dollars" });
    const j0 = (usageToday ?? []).reduce((s, r) => s + r.units, 0);
    refusedToday = (usageToday ?? []).reduce((s, r) => s + r.refused, 0);
    gauges.push({ id: "judge0-jour", label: "Exécutions serveur (Judge0) aujourd'hui", used: j0, limit: settings.execution.server_runs_global_per_day, unit: "nombre", detail: refusedToday ? `${refusedToday} refus pour quota` : undefined });
    gauges.push({ id: "judge0-mois", label: "Exécutions serveur ce mois", used: (usageMonth ?? []).reduce((s, r) => s + r.units, 0), limit: 0, unit: "nombre" });
    const byUser = [...(usageToday ?? [])].filter((r) => r.units > 0).sort((a, b) => b.units - a.units).slice(0, 5);
    if (byUser.length) {
      const { data: names } = await admin.from("profiles").select("id, full_name").in("id", byUser.map((r) => r.user_id));
      top = byUser.map((r) => ({ name: names?.find((n) => n.id === r.user_id)?.full_name || (r.user_id.startsWith("00000000") ? "Sans compte" : "Étudiant"), units: r.units }));
    }
    // Espace utilisé (fonction réservée à l'administration, appelée avec la session de l'administrateur).
    const { data: space } = await (await createClient()).rpc("platform_usage");
    const s = (space as Array<{ database_bytes: number; storage_bytes: number; users_total: number; users_active_30d: number }> | null)?.[0];
    if (s) {
      gauges.push({ id: "base", label: "Base de données (Supabase Free)", used: Number(s.database_bytes), limit: FREE_TIER.supabaseDatabaseBytes, unit: "octets" });
      gauges.push({ id: "stockage", label: "Fichiers stockés (Supabase Free)", used: Number(s.storage_bytes), limit: FREE_TIER.supabaseStorageBytes, unit: "octets" });
      gauges.push({ id: "utilisateurs", label: "Utilisateurs actifs sur 30 jours", used: Number(s.users_active_30d), limit: FREE_TIER.supabaseMonthlyActiveUsers, unit: "nombre", detail: `${s.users_total} comptes au total` });
    }
  }
  return { gauges, alerts: alertsFor(gauges), ai, judge0Configured: isJudge0Configured(), judge0TopUsers: top, refusedToday };
}
