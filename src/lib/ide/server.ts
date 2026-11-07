import "server-only";

import { createClient } from "../supabase/server";
import type { ProjectSnapshot } from "./fs";

export const MAX_PROJECTS = 50;
export const MAX_VERSIONS = 30;
/** Une version automatique au plus toutes les 10 minutes (les points nommés sont toujours gardés). */
export const VERSION_INTERVAL_MS = 10 * 60_000;

type Db = Awaited<ReturnType<typeof createClient>>;

/** Ajoute une version à l'historique puis ne garde que les plus récentes. */
export async function addVersion(db: Db, userId: string, projectId: string, revision: number, snap: ProjectSnapshot, label?: string | null, force = false) {
  if (!force && !label) {
    const { data: last } = await db.from("project_versions").select("created_at").eq("project_id", projectId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (last && Date.now() - new Date(last.created_at).getTime() < VERSION_INTERVAL_MS) return;
  }
  await db.from("project_versions").insert({ project_id: projectId, user_id: userId, revision, label: label ?? null, files: snap.files, folders: snap.folders });
  const { data: old } = await db.from("project_versions").select("id").eq("project_id", projectId).order("created_at", { ascending: false }).range(MAX_VERSIONS, MAX_VERSIONS + 50);
  if (old?.length) await db.from("project_versions").delete().in("id", old.map((v) => v.id));
}
