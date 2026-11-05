import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Contenu d'une version (pour comparer ou restaurer). */
export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]/versions/[versionId]">) {
  const { id, versionId } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  if (!z.string().uuid().safeParse(id).success || !z.string().uuid().safeParse(versionId).success) return jsonError(404, "Version introuvable.");
  const supabase = await createClient();
  const { data } = await supabase.from("project_versions").select("id, revision, label, created_at, files, folders").eq("id", versionId).eq("project_id", id).maybeSingle();
  if (!data) return jsonError(404, "Version introuvable.");
  return NextResponse.json({ version: data });
}
