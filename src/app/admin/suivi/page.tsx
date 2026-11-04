import { Card } from "@/components/ui";
import { formatDate } from "@/components/ui/labels";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Suivi des étudiants" };

export default async function FollowUpPage() {
  await requireStaff("suivi");
  const supabase = await createClient();
  const [{ data: profiles }, { data: progress }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, student_number, created_at").order("full_name").limit(300),
    supabase.from("course_progress").select("user_id, percent, courses(title)"),
    supabase.from("submissions").select("user_id, status"),
  ]);
  const stats = new Map<string, { courses: string[]; ok: number; total: number }>();
  for (const p of progress ?? []) {
    const s = stats.get(p.user_id) ?? { courses: [], ok: 0, total: 0 };
    s.courses.push(`${(p.courses as unknown as { title: string }).title} ${Math.round(Number(p.percent))} %`);
    stats.set(p.user_id, s);
  }
  for (const sub of subs ?? []) {
    const s = stats.get(sub.user_id) ?? { courses: [], ok: 0, total: 0 };
    s.total++;
    if (sub.status === "reussi") s.ok++;
    stats.set(sub.user_id, s);
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-nuit-900">Suivi des étudiants</h1>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gris-50 text-left text-xs uppercase text-gris-500"><tr><th className="px-4 py-2">Étudiant</th><th className="px-4 py-2">Inscription</th><th className="px-4 py-2">Parcours</th><th className="px-4 py-2">Soumissions réussies</th></tr></thead>
          <tbody>
            {(profiles ?? []).map((p) => {
              const s = stats.get(p.id);
              return (
                <tr key={p.id} className="border-t border-gris-100 align-top">
                  <td className="px-4 py-2 font-medium">{p.full_name}{p.student_number && <span className="block text-xs text-gris-500">{p.student_number}</span>}</td>
                  <td className="px-4 py-2 text-xs">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-2 text-xs">{s?.courses.join(" · ") || "—"}</td>
                  <td className="px-4 py-2">{s ? `${s.ok} / ${s.total}` : "0"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
