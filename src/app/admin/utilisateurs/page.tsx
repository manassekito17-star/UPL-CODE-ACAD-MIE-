import { setUserRole, setUserStatus } from "@/app/admin/actions";
import { Badge, Button, Card, inputClass } from "@/components/ui";
import { formatDate } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Comptes et rôles" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/utilisateurs">) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id, full_name, student_number, status, created_at, user_roles(role, permissions)").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.ilike("full_name", `%${q.replace(/[%_]/g, "")}%`);
  const { data: users } = await query;
  // Les e-mails sont dans auth.users : lecture via l'API d'administration.
  const emails = new Map<string, string>();
  if (hasAdminClient()) {
    const { data } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 });
    for (const u of data?.users ?? []) emails.set(u.id, u.email ?? "");
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-nuit-900">Comptes et rôles</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Rechercher un nom…" className={`${inputClass} max-w-xs`} />
        <Button variant="secondaire">Rechercher</Button>
      </form>
      <div className="space-y-3">
        {(users ?? []).map((u) => {
          const roles = (u.user_roles as Array<{ role: string; permissions: string[] }>) ?? [];
          const main = roles.find((r) => r.role === "administrateur") ?? roles.find((r) => r.role === "enseignant") ?? { role: "etudiant", permissions: [] };
          return (
            <Card key={u.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-nuit-900">{u.full_name || "(sans nom)"} {u.id === me.id && <Badge tone="cyan">vous</Badge>}</p>
                  <p className="text-xs text-gris-500">{emails.get(u.id)} · inscrit le {formatDate(u.created_at)}{u.student_number ? ` · matricule ${u.student_number}` : ""}</p>
                </div>
                <Badge tone={u.status === "actif" ? "vert" : "rouge"}>{u.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-4">
                <form action={setUserRole} className="flex flex-wrap items-center gap-2 text-sm">
                  <input type="hidden" name="userId" value={u.id} />
                  <select name="role" defaultValue={main.role} className={`${inputClass} w-auto`} aria-label="Rôle">
                    <option value="etudiant">Étudiant</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="administrateur">Administrateur</option>
                  </select>
                  {(["contenus", "corrections", "suivi"] as const).map((p) => (
                    <label key={p} className="flex items-center gap-1 text-xs">
                      <input type="checkbox" name="permissions" value={p} defaultChecked={main.permissions?.includes(p)} /> {p}
                    </label>
                  ))}
                  <Button size="sm" variant="secondaire">Appliquer</Button>
                </form>
                {u.id !== me.id && (
                  <form action={setUserStatus} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="status" value={u.status === "actif" ? "suspendu" : "actif"} />
                    {u.status === "actif" && <input name="reason" placeholder="Motif (facultatif)" className={`${inputClass} w-44`} />}
                    <Button size="sm" variant={u.status === "actif" ? "danger" : "secondaire"}>{u.status === "actif" ? "Suspendre" : "Réactiver"}</Button>
                  </form>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-gris-500">Permissions enseignant : « contenus » (cours, leçons, exercices, annonces), « corrections » (annoter les soumissions), « suivi » (progression des étudiants). Les enseignants n&apos;ont jamais accès aux comptes, rôles, journaux ni paramètres.</p>
    </div>
  );
}
