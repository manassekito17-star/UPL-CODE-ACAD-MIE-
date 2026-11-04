import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Retour des liens e-mail (vérification du compte, réinitialisation) au format PKCE. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const suite = url.searchParams.get("suite") ?? "/tableau-de-bord";
  const next = suite.startsWith("/") && !suite.startsWith("//") ? suite : "/tableau-de-bord";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/connexion?erreur=lien", url.origin));
}
