import "server-only";

import { createAdminClient, hasAdminClient } from "./supabase/admin";

export interface AiSettings {
  enabled: boolean;
  daily_messages_per_user: number;
  monthly_budget_usd: number;
  max_output_tokens: number;
  effort: "low" | "medium" | "high";
}
export interface ExecutionSettings {
  enabled: boolean;
  max_runs_per_minute: number;
  cpu_time_limit_s: number;
  memory_limit_kb: number;
}
export interface RegistrationSettings {
  open: boolean;
  allowed_email_domains: string[];
}

export const DEFAULT_SETTINGS = {
  ai: { enabled: true, daily_messages_per_user: 40, monthly_budget_usd: 50, max_output_tokens: 2000, effort: "medium" } as AiSettings,
  execution: { enabled: true, max_runs_per_minute: 20, cpu_time_limit_s: 5, memory_limit_kb: 128000 } as ExecutionSettings,
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
