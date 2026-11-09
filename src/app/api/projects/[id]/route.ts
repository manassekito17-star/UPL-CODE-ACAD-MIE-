import { NextResponse } from "next/server";
import { z } from "zod";
import { serverError, jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { validateSnapshot } from "@/lib/ide/fs";
import { addVersion, MAX_PROJECTS } from "@/lib/ide/server";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { projectPatchSchema, projectSaveSchema } from "@/lib/validation";

const FIELDS = "id, name, template, revision, files, folders, updated_at";
const uuid = z.string().uuid();

async function context(ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return { error: jsonError(401, "Connexion requise.") };
  if (!uuid.safeParse(id).success) return { error: jsonError(404, "Projet introuvable.") };
  return { id, user, supabase: await createClient() };
}

export async function GET(_request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  const c = await context(ctx);
  if ("error" in c) return c.error;
  // RLS : un projet d'un autre étudiant est invisible (même réponse qu'un projet inexistant).
  const { data } = await c.supabase.from("projects").select(FIELDS).eq("id", c.id).maybeSingle();
  if (!data) return jsonError(404, "Projet introuvable.");
  return NextResponse.json({ project: data });
}

/** Enregistrement avec détection de conflit : la révision de base doit être la révision actuelle. */
export async function PUT(request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const c = await context(ctx);
  if ("error" in c) return c.error;
  if (c.user.status === "suspendu") return jsonError(403, "Compte suspendu.");
  if (!rateLimit(`projets:enregistrer:${c.user.id}`, 60, 60_000).ok) return jsonError(429, "Trop d'enregistrements. Réessayez dans un instant.");
  const body = await parseBody(request, projectSaveSchema);
  if ("response" in body) return body.response;
  const snap = validateSnapshot(body.data);
  if (!snap.ok) return jsonError(400, snap.error);

  const { data: current } = await c.supabase.from("projects").select(FIELDS).eq("id", c.id).maybeSingle();
  if (!current) return jsonError(404, "Projet introuvable.");
  if (current.revision !== body.data.baseRevision && !body.data.force) {
    return NextResponse.json({ error: "Le projet a été modifié sur un autre appareil.", conflict: true, server: current }, { status: 409 });
  }
  // Mise à jour conditionnelle (atomique) : échoue si une autre sauvegarde est passée entre-temps.
  const { data: saved } = await c.supabase
    .from("projects")
    .update({ files: snap.project.files, folders: snap.project.folders, revision: current.revision + 1 })
    .eq("id", c.id)
    .eq("revision", current.revision)
    .select(FIELDS)
    .maybeSingle();
  if (!saved) {
    const { data: latest } = await c.supabase.from("projects").select(FIELDS).eq("id", c.id).maybeSingle();
    return NextResponse.json({ error: "Le projet a été modifié sur un autre appareil.", conflict: true, server: latest }, { status: 409 });
  }
  await addVersion(c.supabase, c.user.id, c.id, saved.revision, snap.project, body.data.checkpoint ?? (body.data.force ? "Conflit résolu : version de cet appareil" : null));
  return NextResponse.json({ project: saved });
}

/** Renommer ou dupliquer. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const c = await context(ctx);
  if ("error" in c) return c.error;
  const body = await parseBody(request, projectPatchSchema);
  if ("response" in body) return body.response;
  const { data: current } = await c.supabase.from("projects").select(FIELDS).eq("id", c.id).maybeSingle();
  if (!current) return jsonError(404, "Projet introuvable.");
  if (body.data.duplicate) {
    const { count } = await c.supabase.from("projects").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= MAX_PROJECTS) return jsonError(400, `Limite de ${MAX_PROJECTS} projets atteinte.`);
    const name = (body.data.name ?? `${current.name} (copie)`).slice(0, 120);
    const { data, error } = await c.supabase
      .from("projects")
      .insert({ user_id: c.user.id, name, template: current.template, files: current.files, folders: current.folders })
      .select(FIELDS)
      .single();
    if (error) return serverError(error);
    await addVersion(c.supabase, c.user.id, data.id, data.revision, { files: data.files, folders: data.folders }, `Copie de « ${current.name} »`, true);
    return NextResponse.json({ project: data });
  }
  if (body.data.name) {
    const { data, error } = await c.supabase.from("projects").update({ name: body.data.name }).eq("id", c.id).select(FIELDS).single();
    if (error) return serverError(error);
    return NextResponse.json({ project: data });
  }
  return jsonError(400, "Aucune modification demandée.");
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/projects/[id]">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const c = await context(ctx);
  if ("error" in c) return c.error;
  const { data } = await c.supabase.from("projects").delete().eq("id", c.id).select("id");
  if (!data?.length) return jsonError(404, "Projet introuvable.");
  return NextResponse.json({ ok: true });
}
