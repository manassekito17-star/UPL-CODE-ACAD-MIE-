import Link from "next/link";
import { Card, Notice } from "@/components/ui";
import { formatDateTime } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { ACTIVITY_KINDS, type ActivityRow } from "@/lib/admin/activity";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Activité" };

/** Nombre d'utilisateurs distincts actifs sur la période (en millisecondes). */
function activeSince(rows: ActivityRow[], ms: number) {
  const since = Date.now() - ms;
  return new Set(rows.filter((r) => new Date(r.at).getTime() >= since).map((r) => r.user_id)).size;
}

/** Activité récente de toute la plateforme : qui fait quoi, et quand (administrateur). */
export default async function ActivityPage({ searchParams }: PageProps<"/admin/activite">) {
  await requireAdmin();
  const sp = await searchParams;
  const type = typeof sp.type === "string" && sp.type in ACTIVITY_KINDS ? sp.type : "";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_user_activity", { p_user: null, p_limit: 300 });
  let rows = (data ?? []) as ActivityRow[];
  if (type) rows = rows.filter((r) => r.kind === type);
  const active24h = activeSince((data ?? []) as ActivityRow[], 86_400_000);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-nuit-900">Activité</h1>
        <p className="text-sm text-gris-700">Ce que font les utilisateurs, du plus récent au plus ancien : chapitres, quiz, exercices, programmes exécutés, questions au professeur IA, projets et actions du compte.</p>
      </div>
      {error && <Notice tone="alerte">Activité indisponible : exécutez la mise à jour de la base (fichier <code>20261111000001_admin_utilisateurs.sql</code>) dans le SQL Editor de Supabase.</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/activite" className={`rounded-full px-3 py-1 text-sm ${!type ? "bg-electrique-600 text-white" : "bg-white text-nuit-800 border border-gris-200"}`}>Tout</Link>
        {Object.entries(ACTIVITY_KINDS).map(([k, v]) => (
          <Link key={k} href={`/admin/activite?type=${k}`} className={`rounded-full px-3 py-1 text-sm ${type === k ? "bg-electrique-600 text-white" : "bg-white text-nuit-800 border border-gris-200"}`}>
            {v.icon} {v.label}
          </Link>
        ))}
        <span className="ml-auto text-xs text-gris-500">{active24h} utilisateur(s) actif(s) sur les dernières 24 h</span>
      </div>
      <Card className="divide-y divide-gris-100 p-0" data-testid="activite-globale">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm">
            <span className="w-32 shrink-0 text-xs text-gris-500">{formatDateTime(r.at)}</span>
            <span>{ACTIVITY_KINDS[r.kind]?.icon ?? "•"}</span>
            <Link href={`/admin/utilisateurs/${r.user_id}`} className="font-semibold text-electrique-600 hover:underline">{r.user_name || "(sans nom)"}</Link>
            <span className="min-w-0 flex-1 text-gris-700">{r.label}</span>
          </div>
        ))}
        {!rows.length && !error && <p className="px-4 py-8 text-center text-sm text-gris-500">Aucune activité enregistrée.</p>}
      </Card>
    </div>
  );
}
