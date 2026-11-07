import "server-only";

import { createClient } from "../supabase/server";

export interface Overview {
  accounts_total: number;
  accounts_suspended: number;
  signups_today: number;
  signups_7d: number;
  signups_month: number;
  visitors_now: number;
  visitors_24h: number;
  visitors_7d: number;
  visitors_30d: number;
  google_accounts: number;
  email_accounts: number;
}

export interface DayPoint {
  day: string;
  signups: number;
  active: number;
}

/** Définitions affichées à côté de chaque indicateur. */
export const DEFINITIONS = {
  actifs30: "Comptes ayant ouvert au moins une page connectée dans les 30 derniers jours.",
  maintenant: "Comptes ayant ouvert une page dans les 5 dernières minutes (mesure approximative : la visite est enregistrée au plus toutes les 5 minutes).",
  actifsJour: "Utilisateurs ayant eu au moins une activité d'apprentissage ce jour-là : chapitre ouvert, quiz, soumission, exécution, question au professeur IA ou projet enregistré.",
  jour: "Les journées sont comptées en temps universel (UTC).",
} as const;

/** Indicateurs du tableau de bord : fonctions SQL réservées aux administrateurs (contrôle en base). */
export async function getAdminStats(days = 30): Promise<{ overview: Overview | null; series: DayPoint[] }> {
  const supabase = await createClient();
  const [{ data: ov }, { data: sr }] = await Promise.all([supabase.rpc("admin_overview"), supabase.rpc("admin_daily_series", { p_days: days })]);
  const o = (ov as Overview[] | null)?.[0] ?? null;
  return {
    overview: o ? (Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Number(v)])) as unknown as Overview) : null,
    series: ((sr as Array<{ day: string; signups: number; active_users: number }> | null) ?? []).map((r) => ({ day: r.day, signups: Number(r.signups), active: Number(r.active_users) })),
  };
}

/** Champ CSV sûr : guillemets échappés et protection contre l'injection de formules (tableurs). */
export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Array<Record<string, unknown>>, columns: Array<[string, string]>): string {
  const head = columns.map(([, label]) => csvCell(label)).join(";");
  const body = rows.map((r) => columns.map(([k]) => csvCell(r[k])).join(";"));
  // BOM UTF-8 : accents corrects à l'ouverture dans Excel.
  return `﻿${[head, ...body].join("\r\n")}\r\n`;
}

/** Méthodes de connexion d'un compte (« email », « google »), telles qu'enregistrées par Supabase Auth. */
export function loginMethods(u: { app_metadata?: { provider?: string; providers?: string[] }; identities?: Array<{ provider: string }> | null }): string[] {
  return [...new Set([...(u.app_metadata?.providers ?? []), ...(u.app_metadata?.provider ? [u.app_metadata.provider] : []), ...(u.identities ?? []).map((i) => i.provider)])];
}
