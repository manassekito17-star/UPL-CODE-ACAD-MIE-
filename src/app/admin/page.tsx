import Link from "next/link";
import { Card } from "@/components/ui";
import { formatDateTime } from "@/components/ui/labels";
import { requireStaff } from "@/lib/auth";
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
