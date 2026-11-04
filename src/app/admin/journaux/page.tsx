import { Card } from "@/components/ui";
import { formatDateTime } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Journaux d'activité" };

export default async function LogsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("audit_logs").select("id, action, entity_type, entity_id, details, ip, created_at, profiles:actor_id(full_name)").order("created_at", { ascending: false }).limit(200);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-nuit-900">Journaux d&apos;activité</h1>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gris-50 text-left text-xs uppercase text-gris-500"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Auteur</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Cible</th><th className="px-3 py-2">IP</th></tr></thead>
          <tbody>
            {(data ?? []).map((l) => (
              <tr key={l.id} className="border-t border-gris-100">
                <td className="px-3 py-2 text-xs">{formatDateTime(l.created_at)}</td>
                <td className="px-3 py-2">{(l.profiles as unknown as { full_name: string } | null)?.full_name ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-xs">{l.action}</td>
                <td className="px-3 py-2 text-xs">{l.entity_type} {l.entity_id}</td>
                <td className="px-3 py-2 text-xs text-gris-500">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
