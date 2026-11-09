import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/server-env";
import { inputIssues, keyKind, keyRef, urlIssues, urlRef } from "@/lib/sante/diagnostic";

export const dynamic = "force-dynamic";

/**
 * État de la configuration (public, sans secret) : aide à diagnostiquer un
 * déploiement. Ne renvoie jamais la valeur d'une clé, seulement sa nature et
 * le résultat d'une lecture publique du catalogue.
 */
export async function GET() {
  // Public : seulement « le service répond-il ? ». Le détail de configuration est réservé à l'administrateur.
  const viewer = await getCurrentUser();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKind = keyKind((anon ?? "").trim());
  const serviceKind = keyKind((service ?? "").trim());

  /** Lecture réelle d'une ligne de `courses` : statut HTTP, code et message d'erreur éventuels. */
  async function probe(key: string) {
    if (!publicEnv.supabaseUrl || !key) return { ok: false, erreur: "non configuré" };
    try {
      const res = await fetch(`${publicEnv.supabaseUrl}/rest/v1/courses?select=slug&limit=50`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
      const body = await res.text();
      if (!res.ok) {
        let detail = body.slice(0, 300);
        try {
          const j = JSON.parse(body) as { code?: string; message?: string; hint?: string };
          detail = [j.code, j.message, j.hint].filter(Boolean).join(" — ").slice(0, 300);
        } catch {
          /* corps non JSON */
        }
        return { ok: false, statut: res.status, erreur: detail || res.statusText };
      }
      const rows = JSON.parse(body) as unknown[];
      return { ok: rows.length > 0, statut: res.status, cours: rows.length };
    } catch (e) {
      return { ok: false, erreur: (e instanceof Error ? e.message : "erreur inconnue").slice(0, 200) };
    }
  }
  const catalogue = await probe(publicEnv.supabaseAnonKey);
  const catalogueServeur = await probe(serverEnv.supabaseServiceRoleKey);
  const projet = urlRef(publicEnv.supabaseUrl);
  const refPublique = keyRef(publicEnv.supabaseAnonKey);
  const refSecrete = keyRef(serverEnv.supabaseServiceRoleKey);

  const alertes: string[] = [];
  if (anonKind === "jwt-service_role" || anonKind === "secret") alertes.push("DANGER : la clé secrète est placée dans NEXT_PUBLIC_SUPABASE_ANON_KEY (visible par tous). Remplacez-la par la clé anon / publishable et régénérez la clé secrète dans Supabase.");
  if (projet && refPublique && refPublique !== projet) alertes.push("La clé publique appartient à un autre projet Supabase que l'URL.");
  if (projet && refSecrete && refSecrete !== projet) alertes.push("La clé secrète appartient à un autre projet Supabase que l'URL.");
  if (service && serviceKind !== "jwt-service_role" && serviceKind !== "secret") alertes.push("SUPABASE_SERVICE_ROLE_KEY ne ressemble pas à une clé secrète (service_role / sb_secret_).");

  if (!viewer?.isAdmin) {
    return NextResponse.json({ ok: catalogue.ok }, { status: catalogue.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(
    {
      site: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      supabase: {
        url: { presente: Boolean(url), problemes: urlIssues(url) },
        cle_publique: { nature: anonKind, problemes: inputIssues(anon) },
        cle_secrete: { presente: Boolean(service), nature: serviceKind, problemes: inputIssues(service) },
        meme_projet: { cle_publique: refPublique ? refPublique === projet : null, cle_secrete: refSecrete ? refSecrete === projet : null },
        catalogue,
        catalogue_serveur: catalogueServeur,
      },
      google: process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true",
      alertes,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
