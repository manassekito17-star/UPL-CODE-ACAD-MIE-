import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Historique des versions d'un projet (RLS : uniquement les siennes). */
export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]/versions">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  if (!z.string().uuid().safeParse(id).success) return jsonError(404, "Projet introuvable.");
  const supabase = await createClient();
  const { data } = await supabase.from("project_versions").select("id, revision, label, created_at, files").eq("project_id", id).order("created_at", { ascending: false }).limit(30);
  return NextResponse.json({
    versions: (data ?? []).map((v) => ({ id: v.id, revision: v.revision, label: v.label, createdAt: v.created_at, fileCount: (v.files as unknown[]).length })),
  });
}
