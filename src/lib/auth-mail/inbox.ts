/**
 * Lien vers la boîte de réception du fournisseur d'e-mail de l'utilisateur,
 * déduit du domaine de son adresse. Sur téléphone, ces adresses ouvrent
 * l'application correspondante quand elle est installée.
 */
export interface Inbox {
  provider: string;
  url: string;
}

const PROVIDERS: Array<{ provider: string; url: string; domains: string[] }> = [
  { provider: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox", domains: ["gmail.com", "googlemail.com"] },
  { provider: "Outlook", url: "https://outlook.live.com/mail/0/inbox", domains: ["outlook.com", "outlook.fr", "hotmail.com", "hotmail.fr", "live.com", "live.fr", "msn.com"] },
  { provider: "Yahoo Mail", url: "https://mail.yahoo.com/", domains: ["yahoo.com", "yahoo.fr", "ymail.com", "rocketmail.com"] },
  { provider: "iCloud Mail", url: "https://www.icloud.com/mail", domains: ["icloud.com", "me.com", "mac.com"] },
  { provider: "Proton Mail", url: "https://mail.proton.me/u/0/inbox", domains: ["proton.me", "protonmail.com", "pm.me"] },
  { provider: "GMX", url: "https://www.gmx.com/", domains: ["gmx.com", "gmx.fr", "gmx.net"] },
  { provider: "Orange Mail", url: "https://messagerie.orange.fr/", domains: ["orange.fr", "wanadoo.fr"] },
];

/** Boîte de réception correspondant à l'adresse, ou null pour un domaine inconnu (adresse universitaire, etc.). */
export function inboxFor(email: string): Inbox | null {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return null;
  const p = PROVIDERS.find((x) => x.domains.includes(domain));
  return p ? { provider: p.provider, url: p.url } : null;
}
