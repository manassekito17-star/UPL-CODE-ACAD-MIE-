import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "../env";
import { serverEnv } from "../server-env";

/**
 * Client « service_role » : contourne RLS. À n'utiliser QUE côté serveur,
 * après avoir vérifié l'identité et les droits de l'utilisateur, pour écrire
 * les résultats officiels (soumissions, notes, journaux, coûts IA…).
 */
export function createAdminClient() {
  if (!serverEnv.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante : opération serveur impossible.");
  }
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasAdminClient(): boolean {
  return Boolean(serverEnv.supabaseServiceRoleKey && publicEnv.supabaseUrl);
}
