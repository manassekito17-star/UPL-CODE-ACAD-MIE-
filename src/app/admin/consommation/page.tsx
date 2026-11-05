import type { Metadata } from "next";
import { Card, Notice, ProgressBar } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getConsumption, type Gauge } from "@/lib/consumption";

export const metadata: Metadata = { title: "Consommation et coûts" };

const fmt = (g: Gauge, v: number) =>
  g.unit === "octets" ? `${(v / 1024 / 1024).toFixed(v < 10 * 1024 * 1024 ? 1 : 0)} Mo` : g.unit === "dollars" ? `${v.toFixed(2)} $` : v.toLocaleString("fr-FR");

export default async function ConsumptionPage() {
  await requireAdmin();
  const c = await getConsumption();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-nuit-900">Consommation et coûts</h1>
      <p className="text-sm text-gris-700">
        Suivi des ressources limitées de l&apos;offre gratuite. Alerte à 80 % et à 100 % des limites. Aucun service payant n&apos;est activé sans votre autorisation explicite dans les paramètres.
      </p>
      {c.alerts.length > 0 ? (
        <div className="space-y-2" data-testid="alertes-consommation">
          {c.alerts.map((a) => (
            <Notice key={a.text} tone={a.level === "critique" ? "erreur" : "alerte"}>{a.text}</Notice>
          ))}
        </div>
      ) : (
        <Notice tone="succes">Aucune limite n&apos;approche de son plafond.</Notice>
      )}
      <div className="grid gap-3 md:grid-cols-2" data-testid="jauges-consommation">
        {c.gauges.map((g) => (
          <Card key={g.id} className="p-4">
            <p className="text-sm font-semibold text-nuit-900">{g.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {fmt(g, g.used)}
              {g.limit > 0 && <span className="text-sm font-normal text-gris-500"> / {fmt(g, g.limit)}</span>}
            </p>
            {g.limit > 0 && <ProgressBar value={Math.min(100, (g.used / g.limit) * 100)} />}
            {g.detail && <p className="mt-1 text-xs text-gris-500">{g.detail}</p>}
          </Card>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-4 text-sm">
          <h2 className="font-semibold text-nuit-900">Professeur IA</h2>
          <p className="mt-1">{c.ai.available ? `Disponible — ${c.ai.provider} (${c.ai.billing === "gratuit" ? "offre gratuite déclarée" : c.ai.billing === "test" ? "fournisseur de test" : "facturé à l'usage"})` : c.ai.reason}</p>
        </Card>
        <Card className="p-4 text-sm">
          <h2 className="font-semibold text-nuit-900">Service d&apos;exécution isolé</h2>
          <p className="mt-1">{c.judge0Configured ? "Judge0 connecté : C, Java et correction automatique sur serveur, dans la limite des quotas." : "Non configuré : pseudocode, Python, JavaScript et HTML/CSS fonctionnent dans le navigateur ; C et Java sont indisponibles."}</p>
          {c.judge0TopUsers.length > 0 && (
            <ul className="mt-2 text-xs text-gris-700">
              {c.judge0TopUsers.map((u, i) => <li key={i}>{u.name} : {u.units} exécution(s) aujourd&apos;hui</li>)}
            </ul>
          )}
        </Card>
      </div>
      <p className="text-xs text-gris-500">Limites Supabase Free utilisées pour les jauges : 500 Mo de base, 1 Go de fichiers, 50 000 utilisateurs actifs par mois (valeurs indicatives, à vérifier sur la page officielle). Consommation Vercel : tableau de bord Vercel, rubrique Usage.</p>
    </div>
  );
}
