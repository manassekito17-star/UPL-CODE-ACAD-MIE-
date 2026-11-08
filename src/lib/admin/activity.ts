/** Journal d'activité (fonction admin_user_activity) : types d'événements et libellés. */
export interface ActivityRow {
  at: string;
  user_id: string;
  user_name: string | null;
  kind: string;
  label: string;
}

export const ACTIVITY_KINDS: Record<string, { label: string; icon: string }> = {
  chapitre: { label: "Chapitre", icon: "📖" },
  quiz: { label: "Quiz", icon: "✅" },
  exercice: { label: "Exercice", icon: "🧩" },
  execution: { label: "Exécution", icon: "▶️" },
  ia: { label: "Professeur IA", icon: "✨" },
  projet: { label: "Projet UPL IDE", icon: "📁" },
  compte: { label: "Compte", icon: "👤" },
};
