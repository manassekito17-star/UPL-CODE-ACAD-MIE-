const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * « 26/11/2026 à 17:05 », dans le fuseau de l'appareil. Formaté à la main
 * plutôt qu'avec Intl pour un rendu identique sur toutes les plateformes.
 */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** « 17:05 », dans le fuseau de l'appareil. */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * « à l'instant », « il y a 5 min », « il y a 2 h », « hier », « il y a 3 jours »,
 * puis la date complète au-delà d'une semaine.
 */
export function formatRelative(timestamp: number, now: number = Date.now()): string {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  return formatDateTime(timestamp);
}
