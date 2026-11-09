import { NextResponse } from "next/server";
import { serverError, jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { validateSnapshot } from "@/lib/ide/fs";
import { addVersion, MAX_PROJECTS } from "@/lib/ide/server";
import { templateById } from "@/lib/ide/templates";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { projectCreateSchema } from "@/lib/validation";

/** Projets de l'étudiant connecté (RLS : uniquement les siens). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("id, name, template, revision, updated_at").order("updated_at", { ascending: false }).limit(MAX_PROJECTS);
  if (error) return serverError(error);
  return NextResponse.json({ projects: data });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connectez-vous pour enregistrer vos projets.");
  if (user.status === "suspendu") return jsonError(403, "Compte suspendu.");
  if (!rateLimit(`projets:creer:${user.id}`, 20, 60_000).ok) return jsonError(429, "Trop de créations de projets. Réessayez dans une minute.");
  const body = await parseBody(request, projectCreateSchema);
  if ("response" in body) return body.response;
  const tpl = templateById(body.data.template);
  const source = body.data.snapshot ?? (tpl ? { files: tpl.files, folders: tpl.folders ?? [] } : null);
  if (!source) return jsonError(400, "Modèle de projet inconnu.");
  const snap = validateSnapshot(source);
  if (!snap.ok) return jsonError(400, snap.error);

  const supabase = await createClient();
  const { count } = await supabase.from("projects").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_PROJECTS) return jsonError(400, `Limite de ${MAX_PROJECTS} projets atteinte : supprimez-en un.`);
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: body.data.name, template: body.data.snapshot ? "import" : body.data.template, files: snap.project.files, folders: snap.project.folders })
    .select("id, name, template, revision, files, folders, updated_at")
    .single();
  if (error) return serverError(error);
  await addVersion(supabase, user.id, data.id, data.revision, snap.project, body.data.snapshot ? "Importation" : "Création", true);
  return NextResponse.json({ project: data });
}
