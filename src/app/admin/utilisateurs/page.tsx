import { setUserRole, setUserStatus } from "@/app/admin/actions";
import Link from "next/link";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Badge, Button, Card, inputClass } from "@/components/ui";
import { formatDate } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { loginMethods } from "@/lib/admin/stats";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Comptes et rôles" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/utilisateurs">) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const supabase = await createClient();
  // Les e-mails et méthodes de connexion sont dans auth.users : lecture via l'API d'administration (serveur).
  const emails = new Map<string, string>();
  const providers = new Map<string, string[]>();
  if (hasAdminClient()) {
    const { data } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 });
    for (const u of data?.users ?? []) {
      emails.set(u.id, u.email ?? "");
      providers.set(u.id, loginMethods(u));
    }
  }
  const term = q.replace(/[%_,()]/g, "").toLowerCase();
  // Recherche par nom ou par adresse e-mail.
  const emailIds = term ? [...emails].filter(([, e]) => e.toLowerCase().includes(term)).map(([id]) => id).slice(0, 200) : [];
  // user_roles référence auth.users (pas profiles) : les rôles sont lus séparément.
  const fields = "id, full_name, student_number, status, created_at, last_seen_at";
  const base = () => supabase.from("profiles").select(fields).order("created_at", { ascending: false }).limit(100);
  const [byName, byEmail] = await Promise.all([term ? base().ilike("full_name", `%${term}%`) : base(), emailIds.length ? base().in("id", emailIds) : Promise.resolve({ data: [] })]);
  const seen = new Set<string>();
  const users = [...(byName.data ?? []), ...(byEmail.data ?? [])]
    .filter((u) => (seen.has(u.id) ? false : (seen.add(u.id), true)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data: roleRows } = users.length ? await supabase.from("user_roles").select("user_id, role, permissions").in("user_id", users.map((u) => u.id)) : { data: [] };
  const rolesOf = (id: string) => (roleRows ?? []).filter((r) => r.user_id === id) as Array<{ role: string; permissions: string[] }>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-nuit-900">Comptes et rôles</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Nom ou adresse e-mail…" aria-label="Rechercher un utilisateur" className={`${inputClass} max-w-xs`} />
        <Button variant="secondaire">Rechercher</Button>
      </form>
      <div className="space-y-3">
        {(users ?? []).map((u) => {
          const roles = rolesOf(u.id);
          const main = roles.find((r) => r.role === "administrateur") ?? roles.find((r) => r.role === "enseignant") ?? { role: "etudiant", permissions: [] };
          return (
            <Card key={u.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-nuit-900">{u.full_name || "(sans nom)"} {u.id === me.id && <Badge tone="cyan">vous</Badge>}</p>
                  <p className="text-xs text-gris-500">{emails.get(u.id)} · inscrit le {formatDate(u.created_at)}{u.student_number ? ` · matricule ${u.student_number}` : ""}</p>
                  <p className="text-xs text-gris-500">
                    Connexion : {(providers.get(u.id) ?? []).map((p) => (p === "google" ? "Google" : p === "email" ? "e-mail" : p)).join(" + ") || "—"} · dernière visite : {u.last_seen_at ? formatDate(u.last_seen_at) : "jamais"} ·{" "}
                    <Link href={`/admin/suivi?q=${encodeURIComponent(u.full_name ?? "")}`} className="text-electrique-600 hover:underline">progression</Link>
                  </p>
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
                    <ConfirmSubmit
                      variant={u.status === "actif" ? "danger" : "secondaire"}
                      message={u.status === "actif" ? `Suspendre le compte de ${u.full_name || emails.get(u.id)} ? La personne sera déconnectée et ne pourra plus utiliser la plateforme.` : `Réactiver le compte de ${u.full_name || emails.get(u.id)} ?`}
                    >
                      {u.status === "actif" ? "Suspendre" : "Réactiver"}
                    </ConfirmSubmit>
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
