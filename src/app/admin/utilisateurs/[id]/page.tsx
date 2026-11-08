import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteUser, reactivateUser, setUserRole, suspendUser } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Badge, Button, Card, Notice, inputClass } from "@/components/ui";
import { formatDate, formatDateTime } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { ACTIVITY_KINDS, type ActivityRow } from "@/lib/admin/activity";
import { DURATIONS, effectiveStatus, statusLabel } from "@/lib/admin/suspension";
import { loginMethods } from "@/lib/admin/stats";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Fiche utilisateur" };

export default async function UserPage({ params, searchParams }: PageProps<"/admin/utilisateurs/[id]">) {
  const me = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const sp = await searchParams;
  const message = typeof sp.message === "string" ? sp.message.slice(0, 300) : "";
  const supabase = await createClient();

  const first = await supabase.from("profiles").select("id, full_name, status, suspended_until, suspended_reason, avatar_url, student_number, faculty, level, created_at, last_seen_at").eq("id", id).maybeSingle();
  let profile = first.data;
  if (first.error?.code === "42703") {
    ({ data: profile } = (await supabase.from("profiles").select("id, full_name, status, suspended_reason, avatar_url, student_number, faculty, level, created_at, last_seen_at").eq("id", id).maybeSingle()) as unknown as { data: typeof profile });
  }
  if (!profile) notFound();
  const authUser = hasAdminClient() ? (await createAdminClient().auth.admin.getUserById(id)).data.user : null;
  const email = authUser?.email ?? "";
  const methods = authUser ? loginMethods(authUser) : [];
  const { data: roleRows } = await supabase.from("user_roles").select("role, permissions").eq("user_id", id);
  const roles = (roleRows ?? []) as Array<{ role: string; permissions: string[] }>;
  const main = roles.find((r) => r.role === "administrateur") ?? roles.find((r) => r.role === "enseignant") ?? { role: "etudiant", permissions: [] };
  const isAdminAccount = main.role === "administrateur";
  const self = id === me.id;

  const [summaryRes, activityRes] = await Promise.all([supabase.rpc("admin_user_summary", { p_user: id }), supabase.rpc("admin_user_activity", { p_user: id, p_limit: 150 })]);
  const sum = (summaryRes.data as Array<Record<string, number>> | null)?.[0];
  const activity = (activityRes.data ?? []) as ActivityRow[];
  const st = statusLabel(profile.status, profile.suspended_until);
  const suspended = effectiveStatus(profile.status, profile.suspended_until) === "suspendu";
  const name = profile.full_name || "(sans nom)";
  const tiles: Array<[string, number | string]> = sum
    ? [
        ["Chapitres terminés", `${sum.chapters_done} / ${sum.chapters_seen} ouverts`],
        ["Quiz réussis", `${sum.quizzes_passed} / ${sum.quizzes}`],
        ["Exercices réussis", `${sum.exercises_passed} (${sum.submissions} soumissions)`],
        ["Programmes exécutés", sum.executions],
        ["Questions au professeur IA", sum.ai_questions],
        ["Projets UPL IDE", sum.projects],
      ]
    : [];

  return (
    <div className="space-y-5">
      <Link href="/admin/utilisateurs" className="text-sm text-electrique-600 hover:underline">← Tous les utilisateurs</Link>
      {message && <Notice tone={/impossible|ne correspond|Retirez|ne pouvez/.test(message) ? "erreur" : "succes"}>{message}</Notice>}
      {!sum && <Notice tone="alerte">Le résumé et l&apos;activité ne sont pas encore disponibles : exécutez la mise à jour de la base (fichier <code>20261111000001_admin_utilisateurs.sql</code>) dans le SQL Editor de Supabase.</Notice>}

      <Card className="flex flex-wrap items-center gap-4 p-5" data-testid="fiche-utilisateur">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-electrique-100 text-lg font-bold text-electrique-600">{name.slice(0, 2).toUpperCase()}</span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-nuit-900">{name} {self && <Badge tone="cyan">vous</Badge>}</h1>
          <p className="text-sm text-gris-700">{email}</p>
          <p className="mt-1 text-xs text-gris-500">
            Connexion : {methods.map((m) => (m === "google" ? "Google" : m === "email" ? "e-mail" : m)).join(" + ") || "—"} · inscrit le {formatDate(profile.created_at)} · dernière visite : {profile.last_seen_at ? formatDateTime(profile.last_seen_at) : "jamais"}
            {profile.student_number ? ` · matricule ${profile.student_number}` : ""}
          </p>
        </div>
        <div className="text-right">
          <Badge tone={st.tone}>{st.text}</Badge>
          {suspended && profile.suspended_reason && <p className="mt-1 max-w-56 text-xs text-gris-500">Motif : {profile.suspended_reason}</p>}
        </div>
      </Card>

      {tiles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="resume-utilisateur">
          {tiles.map(([l, v]) => (
            <Card key={l} className="p-4">
              <p className="text-xs text-gris-500">{l}</p>
              <p className="mt-1 text-lg font-bold text-nuit-900">{v}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-nuit-900">Activité</h2>
          <ol className="space-y-2" data-testid="activite-utilisateur">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-32 shrink-0 text-xs text-gris-500">{formatDateTime(a.at)}</span>
                <span className="shrink-0">{ACTIVITY_KINDS[a.kind]?.icon ?? "•"}</span>
                <span className="min-w-0">
                  <span className="text-xs font-semibold text-gris-500">{ACTIVITY_KINDS[a.kind]?.label ?? a.kind}</span> — {a.label}
                </span>
              </li>
            ))}
            {!activity.length && <li className="text-sm text-gris-500">Aucune activité enregistrée pour le moment.</li>}
          </ol>
          <p className="mt-4 text-xs text-gris-500">
            <Link href={`/admin/suivi?q=${encodeURIComponent(profile.full_name ?? "")}`} className="text-electrique-600 hover:underline">Voir la progression détaillée par parcours</Link>
          </p>
        </Card>

        <div className="space-y-4">
          {!self && !isAdminAccount && (
            <Card className="space-y-3 p-4">
              {suspended ? (
                <form action={reactivateUser} className="space-y-2">
                  <h2 className="font-semibold text-nuit-900">Compte suspendu</h2>
                  <input type="hidden" name="userId" value={id} />
                  <ConfirmSubmit message={`Réactiver le compte de ${name} ?`}>Réactiver maintenant</ConfirmSubmit>
                </form>
              ) : (
                <form action={suspendUser} className="space-y-2" data-testid="form-suspension">
                  <h2 className="font-semibold text-nuit-900">Bloquer temporairement</h2>
                  <input type="hidden" name="userId" value={id} />
                  <label className="block text-xs text-gris-700">
                    Durée
                    <select name="duration" defaultValue="24h" className={`${inputClass} mt-1`}>
                      {Object.entries(DURATIONS).map(([k, d]) => (
                        <option key={k} value={k}>{d.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs text-gris-700">
                    Motif (visible par la personne)
                    <input name="reason" maxLength={500} placeholder="ex. comportement inapproprié" className={`${inputClass} mt-1`} />
                  </label>
                  <ConfirmSubmit variant="danger" message={`Suspendre le compte de ${name} ? La personne sera déconnectée et ne pourra plus utiliser la plateforme pendant la durée choisie.`}>Suspendre</ConfirmSubmit>
                </form>
              )}
            </Card>
          )}

          <Card className="p-4">
            <h2 className="mb-2 font-semibold text-nuit-900">Rôle</h2>
            <form action={setUserRole} className="space-y-2 text-sm">
              <input type="hidden" name="userId" value={id} />
              <select name="role" defaultValue={main.role} className={inputClass} aria-label="Rôle">
                <option value="etudiant">Étudiant</option>
                <option value="enseignant">Enseignant</option>
                <option value="administrateur">Administrateur</option>
              </select>
              <div className="flex flex-wrap gap-3">
                {(["contenus", "corrections", "suivi"] as const).map((p) => (
                  <label key={p} className="flex items-center gap-1 text-xs">
                    <input type="checkbox" name="permissions" value={p} defaultChecked={main.permissions?.includes(p)} /> {p}
                  </label>
                ))}
              </div>
              <Button size="sm" variant="secondaire">Appliquer</Button>
              <p className="text-xs text-gris-500">Les permissions ne concernent que le rôle enseignant.</p>
            </form>
          </Card>

          {!self && !isAdminAccount && (
            <Card className="border-red-200 p-4">
              <h2 className="font-semibold text-red-700">Supprimer le compte</h2>
              <p className="mt-1 text-xs text-gris-700">Suppression définitive du compte et de toutes ses données (progression, exercices, programmes, projets, messages). Irréversible.</p>
              <form action={deleteUser} className="mt-2 space-y-2" data-testid="form-suppression">
                <input type="hidden" name="userId" value={id} />
                <label className="block text-xs text-gris-700">
                  Recopiez l&apos;adresse e-mail pour confirmer
                  <input name="confirmEmail" required autoComplete="off" placeholder={email} className={`${inputClass} mt-1`} />
                </label>
                <ConfirmSubmit variant="danger" message={`Supprimer DÉFINITIVEMENT le compte de ${name} et toutes ses données ?`}>Supprimer définitivement</ConfirmSubmit>
              </form>
            </Card>
          )}
          {(self || isAdminAccount) && <p className="text-xs text-gris-500">{self ? "C'est votre compte : il ne peut être ni suspendu ni supprimé ici." : "Compte administrateur : retirez d'abord ce rôle pour pouvoir le suspendre ou le supprimer."}</p>}
        </div>
      </div>
    </div>
  );
}
