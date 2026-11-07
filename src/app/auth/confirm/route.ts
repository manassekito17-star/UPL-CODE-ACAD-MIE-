import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Vérification par jeton (modèle d'e-mail Supabase « token_hash »). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const suite = url.searchParams.get("suite") ?? (type === "recovery" ? "/reinitialiser-mot-de-passe" : "/tableau-de-bord");
  const next = suite.startsWith("/") && !suite.startsWith("//") ? suite : "/tableau-de-bord";
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/connexion?erreur=lien", url.origin));
}
