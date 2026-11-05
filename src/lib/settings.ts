import "server-only";

import { createAdminClient, hasAdminClient } from "./supabase/admin";

export interface AiSettings {
  enabled: boolean;
  daily_messages_per_user: number;
  monthly_budget_usd: number;
  max_output_tokens: number;
  effort: "low" | "medium" | "high";
  /** Plafond global de questions par jour (respect des quotas gratuits du fournisseur). 0 = sans plafond. */
  global_daily_messages: number;
  /** Autoriser un fournisseur facturé à l'usage. Désactivé par défaut : budget 0. */
  allow_paid_providers: boolean;
}
export interface ExecutionSettings {
  enabled: boolean;
  max_runs_per_minute: number;
  cpu_time_limit_s: number;
  memory_limit_kb: number;
  /** Exécutions sur le service isolé (Judge0) par étudiant et par jour (un test corrigé = une exécution). 0 = sans limite. */
  server_runs_per_user_per_day: number;
  /** Plafond global quotidien du service isolé (ex. offre gratuite RapidAPI). 0 = sans limite. */
  server_runs_global_per_day: number;
  /** Python et JavaScript s'exécutent dans le navigateur (gratuit) ; le service isolé est réservé à C, Java et à la correction. */
  browser_first: boolean;
}
export interface PlanSettings {
  /** L'offre premium n'est pas commercialisée au lancement. */
  premium_enabled: boolean;
  premium_ai_daily: number;
  premium_server_runs_daily: number;
}
export interface RegistrationSettings {
  open: boolean;
  allowed_email_domains: string[];
}

export const DEFAULT_SETTINGS = {
  ai: { enabled: true, daily_messages_per_user: 20, monthly_budget_usd: 0, max_output_tokens: 1500, effort: "low", global_daily_messages: 300, allow_paid_providers: false } as AiSettings,
  execution: { enabled: true, max_runs_per_minute: 20, cpu_time_limit_s: 5, memory_limit_kb: 128000, server_runs_per_user_per_day: 30, server_runs_global_per_day: 45, browser_first: true } as ExecutionSettings,
  plans: { premium_enabled: false, premium_ai_daily: 100, premium_server_runs_daily: 200 } as PlanSettings,
  registration: { open: true, allowed_email_domains: [] } as RegistrationSettings,
};

type SettingsMap = typeof DEFAULT_SETTINGS;

let cache: { at: number; value: SettingsMap } | null = null;

/** Paramètres de la plateforme (table platform_settings), mis en cache 30 s. */
export async function getSettings(): Promise<SettingsMap> {
  if (cache && Date.now() - cache.at < 30_000) return cache.value;
  const value: SettingsMap = structuredClone(DEFAULT_SETTINGS);
  if (hasAdminClient()) {
    const { data } = await createAdminClient().from("platform_settings").select("key, value");
    for (const row of data ?? []) {
      if (row.key in value) Object.assign(value[row.key as keyof SettingsMap], row.value);
    }
  }
  cache = { at: Date.now(), value };
  return value;
}

export function invalidateSettingsCache() {
  cache = null;
}
