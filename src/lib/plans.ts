import type { AiSettings, ExecutionSettings, PlanSettings } from "./settings";

/**
 * Offres. Au lancement, tout est gratuit : formation complète, éditeur,
 * UPL IDE, laboratoire, exécution dans le navigateur. Les ressources qui ont
 * un coût pour la plateforme (professeur IA, service d'exécution isolé)
 * sont plafonnées par jour. L'offre « premium » est prévue (colonne
 * profiles.plan, limites séparées) mais n'est pas commercialisée : tant que
 * `premium_enabled` est faux, tout le monde reçoit les limites gratuites.
 */
export type PlanId = "gratuit" | "premium";

export interface Entitlements {
  plan: PlanId;
  aiMessagesPerDay: number;
  serverRunsPerDay: number;
}

/** Fonctionnalités incluses dans l'offre gratuite (affichées aux étudiants). */
export const FREE_FEATURES = [
  "Les neuf parcours (algorithmique, HTML, CSS, Python, C, JavaScript, Java, PHP, SQL) en quatre niveaux",
  "Exercices corrigés automatiquement, quiz, TD, évaluations, projets et certificats internes",
  "Éditeur, UPL IDE (projets, dossiers, historique) et laboratoire d'algorithmique",
  "Exécution dans le navigateur : pseudocode, Python, JavaScript, HTML/CSS",
] as const;

export function entitlements(plan: PlanId | null | undefined, s: { ai: AiSettings; execution: ExecutionSettings; plans: PlanSettings }): Entitlements {
  const premium = plan === "premium" && s.plans.premium_enabled;
  return {
    plan: premium ? "premium" : "gratuit",
    aiMessagesPerDay: premium ? s.plans.premium_ai_daily : s.ai.daily_messages_per_user,
    serverRunsPerDay: premium ? s.plans.premium_server_runs_daily : s.execution.server_runs_per_user_per_day,
  };
}
