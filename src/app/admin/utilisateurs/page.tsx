import Link from "next/link";
import { Badge, Card, Notice, inputClass } from "@/components/ui";
import { formatDate, formatDateTime } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { effectiveStatus, statusLabel } from "@/lib/admin/suspension";
import { loginMethods } from "@/lib/admin/stats";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Utilisateurs" };

type Row = { id: string; full_name: string | null; status: string; suspended_until?: string | null; avatar_url: string | null; created_at: string; last_seen_at: string | null };

const METHOD = (p: string) => (p === "google" ? "Google" : p === "email" ? "E-mail" : p);

export default async function UsersPage({ searchParams }: PageProps<"/admin/utilisateurs">) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim().slice(0, 80) : "");
  const q = str("q");
  const statut = str("statut");
  const methode = str("methode");
  const role = str("role");
  const message = str("message");

  const supabase = await createClient();
  // E-mails et méthodes de connexion (auth.users) : lus par l'API d'administration, côté serveur.
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
  const emailIds = term ? [...emails].filter(([, e]) => e.toLowerCase().includes(term)).map(([id]) => id).slice(0, 300) : [];
  const select = async (fields: string) => {
    const base = () => supabase.from("profiles").select(fields).order("created_at", { ascending: false }).limit(300);
    const [a, b] = await Promise.all([term ? base().ilike("full_name", `%${term}%`) : base(), emailIds.length ? base().in("id", emailIds) : Promise.resolve({ data: [], error: null })]);
    return { rows: [...((a.data ?? []) as unknown as Row[]), ...((b.data ?? []) as unknown as Row[])], error: a.error };
  };
  const first = await select("id, full_name, status, suspended_until, avatar_url, created_at, last_seen_at");
  // Base pas encore mise à jour (colonne suspended_until absente).
  const rows = first.error?.code === "42703" ? (await select("id, full_name, status, avatar_url, created_at, last_seen_at")).rows : first.rows;
  const seen = new Set<string>();
  let users = rows.filter((u) => (seen.has(u.id) ? false : (seen.add(u.id), true))).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data: roleRows } = users.length ? await supabase.from("user_roles").select("user_id, role").in("user_id", users.map((u) => u.id)) : { data: [] };
  const mainRole = (id: string) => {
    const r = (roleRows ?? []).filter((x) => x.user_id === id).map((x) => x.role as string);
    return r.includes("administrateur") ? "administrateur" : r.includes("enseignant") ? "enseignant" : "etudiant";
  };
  const total = users.length;
  if (statut) users = users.filter((u) => effectiveStatus(u.status, u.suspended_until) === statut);
  if (methode) users = users.filter((u) => (providers.get(u.id) ?? []).includes(methode));
  if (role) users = users.filter((u) => mainRole(u.id) === role);
  const ROLE_LABEL: Record<string, string> = { etudiant: "Étudiant", enseignant: "Enseignant", administrateur: "Administrateur" };
  const sel = `${inputClass} w-auto`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-nuit-900">Utilisateurs</h1>
        <p className="text-sm text-gris-700">Chacun peut créer son compte librement (Google ou e-mail). Ouvrez une fiche pour voir l&apos;activité, suspendre temporairement, réactiver ou supprimer un compte.</p>
      </div>
      {message && <Notice tone="succes">{message}</Notice>}
      <Card className="p-3">
        <form className="flex flex-wrap items-center gap-2">
          <input name="q" defaultValue={q} placeholder="Nom ou adresse e-mail…" aria-label="Rechercher un utilisateur" className={`${inputClass} min-w-48 flex-1`} />
          <select name="statut" defaultValue={statut} aria-label="Statut" className={sel}>
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="suspendu">Suspendus</option>
          </select>
          <select name="methode" defaultValue={methode} aria-label="Méthode de connexion" className={sel}>
            <option value="">Toutes les connexions</option>
            <option value="google">Google</option>
            <option value="email">E-mail</option>
          </select>
          <select name="role" defaultValue={role} aria-label="Rôle" className={sel}>
            <option value="">Tous les rôles</option>
            <option value="etudiant">Étudiants</option>
            <option value="enseignant">Enseignants</option>
            <option value="administrateur">Administrateurs</option>
          </select>
          <button className="h-10 rounded-lg bg-electrique-600 px-4 text-sm font-semibold text-white">Filtrer</button>
          <span className="text-xs text-gris-500">{users.length} sur {total} compte(s)</span>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm" data-testid="table-utilisateurs">
          <thead className="bg-gris-50 text-xs uppercase tracking-wide text-gris-500">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-3 py-3">Connexion</th>
              <th className="px-3 py-3">Rôle</th>
              <th className="px-3 py-3">Inscription</th>
              <th className="px-3 py-3">Dernière visite</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {users.map((u) => {
              const st = statusLabel(u.status, u.suspended_until);
              const name = u.full_name || "(sans nom)";
              return (
                <tr key={u.id} className="hover:bg-gris-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/utilisateurs/${u.id}`} className="flex items-center gap-3">
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar_url} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full" />
                      ) : (
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-electrique-100 text-xs font-bold text-electrique-600">{name.slice(0, 2).toUpperCase()}</span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-semibold text-nuit-900">{name} {u.id === me.id && <Badge tone="cyan">vous</Badge>}</span>
                        <span className="block truncate text-xs text-gris-500">{emails.get(u.id)}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs">{(providers.get(u.id) ?? []).map(METHOD).join(" + ") || "—"}</td>
                  <td className="px-3 py-3 text-xs">{ROLE_LABEL[mainRole(u.id)]}</td>
                  <td className="px-3 py-3 text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-3 py-3 text-xs">{u.last_seen_at ? formatDateTime(u.last_seen_at) : "jamais"}</td>
                  <td className="px-3 py-3"><Badge tone={st.tone}>{st.text}</Badge></td>
                  <td className="px-3 py-3 text-right">
                    <Link href={`/admin/utilisateurs/${u.id}`} className="text-sm font-semibold text-electrique-600 hover:underline">Voir</Link>
                  </td>
                </tr>
              );
            })}
            {!users.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gris-500">Aucun compte ne correspond.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-gris-500">
        <Link href="/admin/export/utilisateurs" prefetch={false} className="text-electrique-600 hover:underline">Exporter la liste (CSV)</Link>
      </p>
    </div>
  );
}
