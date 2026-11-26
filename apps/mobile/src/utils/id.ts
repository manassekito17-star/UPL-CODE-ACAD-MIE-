let counter = 0;

/**
 * Identifiant local unique : horodatage, compteur et partie aléatoire, en
 * base 36. Suffisant pour des objets créés sur un seul appareil ; ne sert pas
 * de secret.
 */
export function createLocalId(prefix: string, now: number = Date.now()): string {
  counter = (counter + 1) % 1_679_616; // 36^4
  const random = Math.floor(Math.random() * 1_679_616)
    .toString(36)
    .padStart(4, '0');
  return `${prefix}_${now.toString(36)}${counter.toString(36).padStart(4, '0')}${random}`;
}
