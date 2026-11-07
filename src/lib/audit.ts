import "server-only";

import { createAdminClient, hasAdminClient } from "./supabase/admin";

/** Journalise une action sensible (administration, notes, suspensions…). */
export async function audit(
  actorId: string | null,
  action: string,
  entity?: { type: string; id: string },
  details: Record<string, unknown> = {},
  ip?: string,
) {
  if (!hasAdminClient()) return;
  try {
    await createAdminClient()
      .from("audit_logs")
      .insert({ actor_id: actorId, action, entity_type: entity?.type ?? null, entity_id: entity?.id ?? null, details, ip: ip ?? null });
  } catch (e) {
    console.error("[audit] échec de journalisation", e);
  }
}
