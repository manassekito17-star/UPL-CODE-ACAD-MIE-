import { NextResponse } from "next/server";
import { jsonError, parseBody, sameOrigin, serverError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { ratingSchema } from "@/lib/validation";

/** Avis de l'utilisateur connecté (pour pré-remplir les étoiles). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connexion requise.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_ratings").select("stars, comment, updated_at").eq("user_id", user.id).maybeSingle();
  if (error) return jsonError(503, "Les avis ne sont pas encore activés sur cette installation.");
  return NextResponse.json({ rating: data });
}

/** Dépôt ou modification de l'avis (un seul par utilisateur). */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const user = await getCurrentUser();
  if (!user) return jsonError(401, "Connectez-vous pour donner votre avis.");
  if (user.status === "suspendu") return jsonError(403, "Compte suspendu.");
  if (!rateLimit(`avis:${user.id}`, 10, 60 * 60_000).ok) return jsonError(429, "Trop d'envois. Réessayez plus tard.");
  const body = await parseBody(request, ratingSchema);
  if ("response" in body) return body.response;
  const supabase = await createClient();
  const { error } = await supabase.from("app_ratings").upsert({ user_id: user.id, stars: body.data.stars, comment: body.data.comment }, { onConflict: "user_id" });
  if (error) {
    if (error.code === "42P01" || /app_ratings/.test(error.message)) return jsonError(503, "Les avis ne sont pas encore activés sur cette installation.");
    return serverError(error);
  }
  return NextResponse.json({ saved: true });
}
