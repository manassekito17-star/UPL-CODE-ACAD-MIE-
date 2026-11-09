/**
 * Navigateurs intégrés aux applications (WhatsApp, Telegram, Facebook, Instagram, TikTok…).
 * Google refuse la connexion depuis ces « webviews » (erreur 403 disallowed_useragent) :
 * on ne les bloque pas, on propose d'ouvrir la page dans le vrai navigateur du téléphone.
 */
export type InAppInfo = { inApp: false } | { inApp: true; app: string; os: "android" | "ios" | "autre" };

const APPS: Array<[RegExp, string]> = [
  [/WhatsApp/i, "WhatsApp"],
  [/Telegram/i, "Telegram"],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
  [/Instagram/i, "Instagram"],
  [/musical_ly|TikTok|BytedanceWebview/i, "TikTok"],
  [/Snapchat/i, "Snapchat"],
  [/Line\//, "LINE"],
  [/LinkedInApp/i, "LinkedIn"],
  [/Twitter/i, "X (Twitter)"],
];

export function detectInApp(ua: string | null | undefined): InAppInfo {
  if (!ua) return { inApp: false };
  const os = /Android/i.test(ua) ? "android" : /iPhone|iPad|iPod/i.test(ua) ? "ios" : "autre";
  for (const [re, app] of APPS) if (re.test(ua)) return { inApp: true, app, os };
  // Webview Android générique (« ; wv) ») ou iOS sans « Safari » dans l'identifiant.
  if (os === "android" && /; wv\)/.test(ua)) return { inApp: true, app: "une application", os };
  if (os === "ios" && /AppleWebKit/i.test(ua) && !/Safari\//i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)) return { inApp: true, app: "une application", os };
  return { inApp: false };
}

/** Adresse « intent » d'Android : ouvre la même page dans Chrome (ou le navigateur par défaut si Chrome manque). */
export function chromeIntentUrl(href: string): string {
  const u = new URL(href);
  const fallback = encodeURIComponent(u.toString());
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(":", "")};package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}
