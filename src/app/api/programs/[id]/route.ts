import { NextResponse } from "next/server";
import { z } from "zod";
import { serverError, jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { programSchema } from "@/lib/validation";

const idSchema = z.string().uuid();

export async function GET(_request: Request, ctx: RouteContext<"/api/programs/[id]">) {
  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) return jsonError(400, "Identifiant invalide.");
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (!data) return jsonError(404, "Programme introuvable.");
  return NextResponse.json({ program: data });
}

export async function PUT(request: Request, ctx: RouteContext<"/api/programs/[id]">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) return jsonError(400, "Identifiant invalide.");
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  const body = await parseBody(request, programSchema);
  if ("response" in body) return body.response;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .update({ title: body.data.title, language_id: body.data.language, files: body.data.files, stdin: body.data.stdin })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return serverError(error);
  if (!data) return jsonError(404, "Programme introuvable.");
  return NextResponse.json({ id });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/programs/[id]">) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) return jsonError(400, "Identifiant invalide.");
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  const supabase = await createClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) return serverError(error);
  return NextResponse.json({ deleted: true });
}
