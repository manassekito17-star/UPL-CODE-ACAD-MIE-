import { saveCategory, saveLanguage, saveSettings } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { aiAvailability } from "@/lib/ai";
import { serverEnv, isJudge0Configured } from "@/lib/server-env";
import { getSettings } from "@/lib/settings";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [s, { data: languages }, { data: categories }] = await Promise.all([
    getSettings(),
    supabase.from("languages").select("*").order("sort_order"),
    supabase.from("course_categories").select("*").order("sort_order"),
  ]);
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const costs = hasAdminClient() ? ((await createAdminClient().from("ai_messages").select("cost_usd, input_tokens, output_tokens, model").eq("role", "assistant").gte("created_at", monthStart.toISOString())).data ?? []) : [];
  const spent = costs.reduce((t, r) => t + Number(r.cost_usd), 0);
  const ai = aiAvailability(s.ai);
  const tokens = costs.reduce((t, r) => t + r.input_tokens + r.output_tokens, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-nuit-900">Paramètres et coûts</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-gris-500">Dépense IA ce mois</p><p className="text-2xl font-bold">{spent.toFixed(2)} $</p><p className="text-xs text-gris-500">sur {s.ai.monthly_budget_usd} $</p></Card>
        <Card className="p-4"><p className="text-xs text-gris-500">Réponses IA ce mois</p><p className="text-2xl font-bold">{costs.length}</p><p className="text-xs text-gris-500">{tokens.toLocaleString("fr-FR")} jetons</p></Card>
        <Card className="p-4"><p className="text-xs text-gris-500">Fournisseur IA</p><p className="text-lg font-bold">{ai.provider ?? serverEnv.aiProvider}</p><p className="text-xs text-gris-500">{serverEnv.aiModel || "modèle non défini"} · {ai.billing === "gratuit" ? "offre gratuite déclarée" : ai.billing === "payant" ? "facturé à l'usage" : ai.billing ?? "non connecté"}</p><p className={`mt-1 text-xs ${ai.available ? "text-green-700" : "text-amber-700"}`}>{ai.available ? "Disponible" : ai.reason}</p></Card>
        <Card className="p-4"><p className="text-xs text-gris-500">Exécution isolée</p><p className="text-lg font-bold">{isJudge0Configured() ? "Judge0 connecté" : "Non configurée"}</p><p className="text-xs text-gris-500">{isJudge0Configured() ? "C, Java, Python, JS sur serveur" : "repli navigateur (pseudocode, Python, JS)"}</p></Card>
      </div>
      <Card className="p-5">
        <ActionForm action={saveSettings} submitLabel="Enregistrer les paramètres">
          <h2 className="font-bold text-nuit-900">Professeur IA</h2>
          <div className="grid gap-4 sm:grid-cols-5">
            <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="ai_enabled" defaultChecked={s.ai.enabled} /> Activé</label>
            <Field label="Questions / jour / étudiant" htmlFor="ai_daily"><input id="ai_daily" name="ai_daily" type="number" min={0} defaultValue={s.ai.daily_messages_per_user} className={inputClass} /></Field>
            <Field label="Budget mensuel ($)" htmlFor="ai_budget"><input id="ai_budget" name="ai_budget" type="number" min={0} step="0.5" defaultValue={s.ai.monthly_budget_usd} className={inputClass} /></Field>
            <Field label="Jetons max par réponse" htmlFor="ai_max_tokens"><input id="ai_max_tokens" name="ai_max_tokens" type="number" min={200} defaultValue={s.ai.max_output_tokens} className={inputClass} /></Field>
            <Field label="Effort" htmlFor="ai_effort"><select id="ai_effort" name="ai_effort" defaultValue={s.ai.effort} className={inputClass}><option value="low">Faible (économique)</option><option value="medium">Moyen</option><option value="high">Élevé</option></select></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
            <Field label="Questions / jour (toute la plateforme)" htmlFor="ai_global_daily" hint="Restez sous le quota gratuit du fournisseur. 0 = sans plafond."><input id="ai_global_daily" name="ai_global_daily" type="number" min={0} defaultValue={s.ai.global_daily_messages} className={inputClass} /></Field>
            <label className="flex items-start gap-2 pt-7 text-sm">
              <input type="checkbox" name="ai_allow_paid" defaultChecked={s.ai.allow_paid_providers} />
              <span>Autoriser un fournisseur d&apos;IA <strong>payant</strong> (facturé à l&apos;usage), dans la limite du budget mensuel ci-dessus. Désactivé : budget 0 garanti.</span>
            </label>
          </div>
          <h2 className="pt-2 font-bold text-nuit-900">Exécution du code</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="exec_enabled" defaultChecked={s.execution.enabled} /> Activée</label>
            <Field label="Exécutions / minute" htmlFor="exec_rpm"><input id="exec_rpm" name="exec_rpm" type="number" min={1} defaultValue={s.execution.max_runs_per_minute} className={inputClass} /></Field>
            <Field label="Temps CPU max (s)" htmlFor="exec_cpu"><input id="exec_cpu" name="exec_cpu" type="number" min={1} max={15} defaultValue={s.execution.cpu_time_limit_s} className={inputClass} /></Field>
            <Field label="Mémoire max (Ko)" htmlFor="exec_memory"><input id="exec_memory" name="exec_memory" type="number" min={16000} defaultValue={s.execution.memory_limit_kb} className={inputClass} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Exécutions serveur / jour / étudiant" htmlFor="exec_user_daily" hint="Un test corrigé = une exécution. 0 = sans limite."><input id="exec_user_daily" name="exec_user_daily" type="number" min={0} defaultValue={s.execution.server_runs_per_user_per_day} className={inputClass} /></Field>
            <Field label="Exécutions serveur / jour (plateforme)" htmlFor="exec_global_daily" hint="Quota de votre offre Judge0 (ex. offre gratuite RapidAPI)."><input id="exec_global_daily" name="exec_global_daily" type="number" min={0} defaultValue={s.execution.server_runs_global_per_day} className={inputClass} /></Field>
            <label className="flex items-start gap-2 pt-7 text-sm"><input type="checkbox" name="exec_browser_first" defaultChecked={s.execution.browser_first} /> <span>Python et JavaScript dans le navigateur (gratuit) ; serveur réservé à C, Java et à la correction</span></label>
          </div>
          <h2 className="pt-2 font-bold text-nuit-900">Inscriptions</h2>
          <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="reg_open" defaultChecked={s.registration.open} /> Ouvertes</label>
            <Field label="Domaines e-mail autorisés (vide = tous)" htmlFor="reg_domains" hint="ex. upl-univ.ac, etudiant.upl-univ.ac"><input id="reg_domains" name="reg_domains" defaultValue={s.registration.allowed_email_domains.join(", ")} className={inputClass} /></Field>
          </div>
        </ActionForm>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 font-bold text-nuit-900">Langages</h2>
        <div className="space-y-2">
          {(languages ?? []).map((l) => (
            <form key={l.id} action={saveLanguage} className="grid items-center gap-2 sm:grid-cols-[8rem_1fr_10rem_6rem_auto]">
              <input type="hidden" name="id" value={l.id} />
              <span className="font-mono text-sm">{l.id}</span>
              <input name="name" defaultValue={l.name} className={inputClass} aria-label="Nom" />
              <input name="judge0_language_id" defaultValue={l.judge0_language_id ?? ""} placeholder="ID Judge0" className={inputClass} aria-label="Identifiant Judge0" />
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="enabled" defaultChecked={l.enabled} /> actif</label>
              <Button size="sm" variant="secondaire">OK</Button>
            </form>
          ))}
        </div>
        <p className="mt-2 text-xs text-gris-500">Les identifiants Judge0 effectivement utilisés sont définis par les variables JUDGE0_LANG_* du serveur ; ce tableau sert de référence.</p>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 font-bold text-nuit-900">Catégories</h2>
        <ul className="mb-3 space-y-1 text-sm">{(categories ?? []).map((c) => <li key={c.id}><span className="font-mono">{c.slug}</span> — {c.name}</li>)}</ul>
        <form action={saveCategory} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
          <input name="slug" required placeholder="slug" className={inputClass} /><input name="name" required placeholder="Nom de la catégorie" className={inputClass} /><Button size="sm">Ajouter / modifier</Button>
        </form>
      </Card>
    </div>
  );
}
