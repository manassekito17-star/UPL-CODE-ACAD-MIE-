import { NextResponse, type NextRequest } from "next/server";
/** Retour des connexions Google (OAuth) et des liens e-mail. */
import { createClient } from "@/lib/supabase/server";

/** Retour des liens e-mail (vérification du compte, réinitialisation) au format PKCE. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const suite = url.searchParams.get("suite") ?? "/tableau-de-bord";
  const next = suite.startsWith("/") && !suite.startsWith("//") ? suite : "/tableau-de-bord";
  // Refus ou erreur renvoyés par le fournisseur (ex. l'utilisateur annule la connexion Google).
  if (url.searchParams.get("error")) return NextResponse.redirect(new URL("/connexion?erreur=google-annule", url.origin));
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Compte existant auquel Google vient d'être rattaché : on complète le nom et la photo s'ils manquent.
      const u = data.user;
      const meta = u?.user_metadata ?? {};
      const avatar = (meta.avatar_url ?? meta.picture) as string | undefined;
      const name = (meta.full_name ?? meta.name) as string | undefined;
      if (u && (avatar || name)) {
        const { data: p } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", u.id).maybeSingle();
        const patch: Record<string, string> = {};
        if (p && !p.avatar_url && avatar?.startsWith("https://")) patch.avatar_url = avatar.slice(0, 500);
        if (p && !p.full_name && name) patch.full_name = name.slice(0, 120);
        if (Object.keys(patch).length) await supabase.from("profiles").update(patch).eq("id", u.id);
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/connexion?erreur=lien", url.origin));
}
