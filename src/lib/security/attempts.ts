import "server-only";

import { createHash } from "node:crypto";
import { rateLimit } from "@/lib/rate-limit";
import { serverEnv } from "@/lib/server-env";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

/**
 * Limitation des tentatives sensibles (connexion, inscription, réinitialisation…), partagée par
 * toutes les instances du serveur grâce à la base (fonction rate_limit_hit). Les clés sont des
 * empreintes : ni l'adresse IP ni l'e-mail ne sont stockés en clair. Blocage progressif et
 * temporaire (jamais définitif). Si la base est indisponible, la limite en mémoire prend le relais.
 */
export interface AttemptRule {
  max: number;
  windowSeconds: number;
  blockSeconds: number;
}

/** Règles par adresse IP (adaptées à un usage normal, y compris un réseau partagé d'université). */
export const IP_RULES: Record<string, AttemptRule> = {
  connexion: { max: 20, windowSeconds: 600, blockSeconds: 900 },
  google: { max: 30, windowSeconds: 600, blockSeconds: 600 },
  inscription: { max: 10, windowSeconds: 3600, blockSeconds: 3600 },
  reinitialisation: { max: 6, windowSeconds: 900, blockSeconds: 900 },
  renvoi: { max: 6, windowSeconds: 900, blockSeconds: 900 },
  mfa: { max: 10, windowSeconds: 600, blockSeconds: 900 },
};

/** Échecs de connexion par compte : 5 échecs en 15 min → 15 min d'attente (doublée en cas de récidive). */
export const ACCOUNT_RULE: AttemptRule = { max: 5, windowSeconds: 900, blockSeconds: 900 };

export function attemptKey(kind: string, value: string): string {
  const salt = serverEnv.supabaseServiceRoleKey.slice(-24) || "upl";
  return `${kind}:${createHash("sha256").update(`${kind}|${value.trim().toLowerCase()}|${salt}`).digest("base64url").slice(0, 43)}`;
}

/** Environnements de test : limites relevées (les tests créent beaucoup de comptes depuis une même adresse). */
function testOverride(rule: AttemptRule): AttemptRule {
  const max = Number(process.env.AUTH_RATE_LIMIT_PER_10MIN);
  return Number.isFinite(max) && max > rule.max ? { ...rule, max } : rule;
}

export async function hitAttempt(key: string, rule: AttemptRule, consume = true): Promise<{ ok: boolean; retryAfterSeconds: number }> {
  const r = testOverride(rule);
  if (hasAdminClient()) {
    const { data, error } = await createAdminClient().rpc("rate_limit_hit", { p_key: key, p_max: r.max, p_window_seconds: r.windowSeconds, p_block_seconds: r.blockSeconds, p_consume: consume });
    const row = (data as Array<{ ok: boolean; retry_after: number }> | null)?.[0];
    if (!error && row) return { ok: row.ok, retryAfterSeconds: row.retry_after };
  }
  // Repli : limite en mémoire (base non mise à jour ou indisponible).
  if (!consume) return { ok: true, retryAfterSeconds: 0 };
  return rateLimit(key, r.max, r.windowSeconds * 1000);
}

export async function resetAttempts(key: string): Promise<void> {
  if (hasAdminClient()) await createAdminClient().rpc("rate_limit_reset", { p_key: key });
}

export function waitMessage(seconds: number): string {
  const min = Math.max(1, Math.ceil(seconds / 60));
  return min >= 60 ? `${Math.ceil(min / 60)} h` : `${min} min`;
}
