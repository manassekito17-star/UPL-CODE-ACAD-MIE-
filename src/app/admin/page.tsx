import Link from "next/link";
import { Card, Notice } from "@/components/ui";
import { formatDateTime } from "@/components/ui/labels";
import { requireStaff } from "@/lib/auth";
import { DailyBars } from "@/components/admin/daily-bars";
import { DEFINITIONS, getAdminStats } from "@/lib/admin/stats";
import { getConsumption } from "@/lib/consumption";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Administration" };

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

export default async function AdminHome() {
  const user = await requireStaff();
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const since = daysAgoIso(7);
  const [students, courses, exercises, subs, subsWeek, success] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id, status"),
    supabase.from("exercises").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "reussi"),
  ]);
  let aiCost = 0;
  let aiMessages = 0;
  let recentLogs: Array<{ action: string; created_at: string }> = [];
  if (user.isAdmin && hasAdminClient()) {
    const admin = createAdminClient();
    const { data } = await admin.from("ai_messages").select("cost_usd, role").gte("created_at", monthStart.toISOString());
    aiCost = (data ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
    aiMessages = (data ?? []).filter((r) => r.role === "user").length;
    recentLogs = (await admin.from("audit_logs").select("action, created_at").order("created_at", { ascending: false }).limit(8)).data ?? [];
  }
  // Alertes de dépassement des limites gratuites (administrateur).
  const alerts = user.isAdmin ? (await getConsumption()).alerts : [];
  const { overview: ov, series } = user.isAdmin ? await getAdminStats(30) : { overview: null, series: [] };
  const published = (courses.data ?? []).filter((c) => c.status === "publie").length;
  const stats = [
    ["Comptes", students.count ?? 0],
    ["Formations publiées", `${published} / ${courses.data?.length ?? 0}`],
    ["Exercices", exercises.count ?? 0],
    ["Soumissions (7 jours)", subsWeek.count ?? 0],
    ["Taux de réussite", subs.count ? `${Math.round(((success.count ?? 0) / subs.count) * 100)} %` : "—"],
    ...(user.isAdmin ? [["Coût IA (mois)", `${aiCost.toFixed(2)} $`], ["Questions IA (mois)", aiMessages]] : []),
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-nuit-900">Vue d&apos;ensemble</h1>
      {alerts.map((a) => (
        <Notice key={a.text} tone={a.level === "critique" ? "erreur" : "alerte"}>
          {a.text} <Link href="/admin/consommation" className="underline">Voir la consommation</Link>
        </Notice>
      ))}
      {ov && (
        <section aria-label="Inscriptions et activité" className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="mr-auto text-lg font-bold text-nuit-900">Inscriptions et activité</h2>
            <Link href="/admin/export/statistiques" prefetch={false} className="text-sm text-electrique-600 hover:underline">Exporter les statistiques (CSV)</Link>
            <Link href="/admin/export/utilisateurs" prefetch={false} className="text-sm text-electrique-600 hover:underline">Exporter les utilisateurs (CSV)</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="indicateurs-admin">
            {(
              [
                ["Comptes créés", ov.accounts_total, `${ov.google_accounts} avec Google · ${ov.email_accounts} avec e-mail · ${ov.accounts_suspended} suspendu(s)`],
                ["Utilisateurs actifs (30 j)", ov.visitors_30d, DEFINITIONS.actifs30],
                ["En ligne maintenant", ov.visitors_now, DEFINITIONS.maintenant],
                ["Actifs (24 h · 7 j)", `${ov.visitors_24h} · ${ov.visitors_7d}`, "Comptes ayant ouvert une page connectée sur la période."],
                ["Inscrits aujourd'hui", ov.signups_today, DEFINITIONS.jour],
                ["Inscrits (7 derniers jours)", ov.signups_7d, ""],
                ["Inscrits ce mois-ci", ov.signups_month, "Depuis le 1er du mois (UTC)."],
              ] as Array<[string, number | string, string]>
            ).map(([k, v, def]) => (
              <Card key={k} className="p-4" title={def}>
                <p className="text-xs text-gris-500">{k}</p>
                <p className="mt-1 text-2xl font-bold text-nuit-900">{typeof v === "number" ? v.toLocaleString("fr-FR") : v}</p>
                {def && <p className="mt-1 text-[11px] leading-snug text-gris-500">{def}</p>}
              </Card>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <DailyBars title="Inscriptions par jour (30 jours)" unit="inscription(s)" data={series.map((d) => ({ day: d.day, value: d.signups }))} testId="graphique-inscriptions" />
            </Card>
            <Card className="p-4">
              <DailyBars title="Utilisateurs actifs par jour (30 jours)" unit="utilisateur(s) actif(s)" data={series.map((d) => ({ day: d.day, value: d.active }))} testId="graphique-activite" />
              <p className="mt-1 text-[11px] text-gris-500">{DEFINITIONS.actifsJour}</p>
            </Card>
          </div>
        </section>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-xs text-gris-500">{k}</p>
            <p className="mt-1 text-2xl font-bold text-nuit-900">{v}</p>
          </Card>
        ))}
      </div>
      {user.isAdmin && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-nuit-900">Activité récente</h2>
            <Link href="/admin/journaux" className="text-sm text-electrique-600 hover:underline">Tous les journaux</Link>
          </div>
          <ul className="space-y-1 text-sm">
            {recentLogs.map((l, i) => <li key={i} className="flex justify-between gap-2"><span className="font-mono text-xs">{l.action}</span><span className="text-xs text-gris-500">{formatDateTime(l.created_at)}</span></li>)}
            {recentLogs.length === 0 && <li className="text-gris-500">Aucune activité.</li>}
          </ul>
        </Card>
      )}
    </div>
  );
}
