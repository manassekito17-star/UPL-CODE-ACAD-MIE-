const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * « 26/11/2026 à 17:05 », dans le fuseau de l'appareil. Formaté à la main
 * plutôt qu'avec Intl pour un rendu identique sur toutes les plateformes.
 */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
