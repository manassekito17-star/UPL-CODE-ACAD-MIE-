/**
 * Suspension d'un compte par l'administration : durées proposées, date de fin et statut effectif.
 * Les mêmes règles sont appliquées par la base (fonction is_active_user) : une suspension
 * dont la date de fin est passée est levée automatiquement.
 */
export const DURATIONS = {
  "1h": { label: "1 heure", ms: 3_600_000 },
  "24h": { label: "24 heures", ms: 86_400_000 },
  "7j": { label: "7 jours", ms: 7 * 86_400_000 },
  "30j": { label: "30 jours", ms: 30 * 86_400_000 },
  indefini: { label: "Jusqu'à réactivation", ms: null },
} as const;

export type SuspensionDuration = keyof typeof DURATIONS;

/** Date de fin de suspension (ISO), ou null pour une suspension sans limite. */
export function suspensionEnd(duration: SuspensionDuration, now = Date.now()): string | null {
  const ms = DURATIONS[duration].ms;
  return ms === null ? null : new Date(now + ms).toISOString();
}

/** Statut réel d'un compte : une suspension expirée équivaut à un compte actif. */
export function effectiveStatus(status: string | null | undefined, until: string | null | undefined, now = Date.now()): "actif" | "suspendu" {
  if (status !== "suspendu") return "actif";
  if (until && new Date(until).getTime() <= now) return "actif";
  return "suspendu";
}

/** Libellé du statut pour l'administration. */
export function statusLabel(status: string | null | undefined, until: string | null | undefined, now = Date.now()): { text: string; tone: "vert" | "rouge" | "orange" } {
  if (status !== "suspendu") return { text: "Actif", tone: "vert" };
  if (!until) return { text: "Suspendu", tone: "rouge" };
  const d = new Date(until);
  if (d.getTime() <= now) return { text: "Actif (suspension terminée)", tone: "vert" };
  return { text: `Suspendu jusqu'au ${d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Kinshasa" })}`, tone: "orange" };
}
