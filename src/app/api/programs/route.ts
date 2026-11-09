import { NextResponse } from "next/server";
import { serverError, jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { programSchema } from "@/lib/validation";

/** Programmes sauvegardés : accès via la session de l'étudiant, protégé par RLS (propriétaire uniquement). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("id, title, language_id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) return serverError(error);
  return NextResponse.json({ programs: data });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connectez-vous pour enregistrer vos programmes.");
  const body = await parseBody(request, programSchema);
  if ("response" in body) return body.response;
  const supabase = await createClient();
  const { count } = await supabase.from("programs").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= 200) return jsonError(400, "Limite de 200 programmes atteinte : supprimez-en quelques-uns.");
  const { data, error } = await supabase
    .from("programs")
    .insert({ user_id: user.id, title: body.data.title, language_id: body.data.language, files: body.data.files, stdin: body.data.stdin })
    .select("id")
    .single();
  if (error) return serverError(error);
  return NextResponse.json({ id: data.id });
}
