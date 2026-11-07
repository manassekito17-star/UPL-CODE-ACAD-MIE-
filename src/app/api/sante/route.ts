import { createClient as createSupabase } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";
import { inputIssues, keyKind, urlIssues } from "@/lib/sante/diagnostic";

export const dynamic = "force-dynamic";

/**
 * État de la configuration (public, sans secret) : aide à diagnostiquer un
 * déploiement. Ne renvoie jamais la valeur d'une clé, seulement sa nature et
 * le résultat d'une lecture publique du catalogue.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKind = keyKind((anon ?? "").trim());
  const serviceKind = keyKind((service ?? "").trim());

  let catalogue: { ok: boolean; cours?: number; erreur?: string } = { ok: false, erreur: "Supabase non configuré" };
  if (publicEnv.supabaseUrl && publicEnv.supabaseAnonKey) {
    try {
      const sb = createSupabase(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, { auth: { persistSession: false } });
      const { count, error } = await sb.from("courses").select("id", { count: "exact", head: true });
      catalogue = error ? { ok: false, erreur: `${error.code ?? ""} ${error.message}`.trim().slice(0, 200) } : { ok: (count ?? 0) > 0, cours: count ?? 0 };
    } catch (e) {
      catalogue = { ok: false, erreur: (e instanceof Error ? e.message : "erreur inconnue").slice(0, 200) };
    }
  }

  const alertes: string[] = [];
  if (anonKind === "jwt-service_role" || anonKind === "secret") alertes.push("DANGER : la clé secrète est placée dans NEXT_PUBLIC_SUPABASE_ANON_KEY (visible par tous). Remplacez-la par la clé anon / publishable et régénérez la clé secrète dans Supabase.");
  if (service && serviceKind !== "jwt-service_role" && serviceKind !== "secret") alertes.push("SUPABASE_SERVICE_ROLE_KEY ne ressemble pas à une clé secrète (service_role / sb_secret_).");

  return NextResponse.json(
    {
      site: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      supabase: {
        url: { presente: Boolean(url), problemes: urlIssues(url) },
        cle_publique: { nature: anonKind, problemes: inputIssues(anon) },
        cle_secrete: { presente: Boolean(service), nature: serviceKind, problemes: inputIssues(service) },
        catalogue,
      },
      google: process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true",
      alertes,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
