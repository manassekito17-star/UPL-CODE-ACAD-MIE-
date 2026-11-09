"use client";

import { useState, useSyncExternalStore } from "react";
import { chromeIntentUrl, detectInApp } from "@/lib/browser/in-app";

const noop = () => () => {};

/**
 * Affiché seulement dans le navigateur intégré d'une application (WhatsApp, Telegram…),
 * où Google refuse la connexion. Rien n'est bloqué : la connexion par e-mail reste possible.
 */
export function InAppNotice() {
  // L'identifiant du navigateur (texte stable) est lu côté client ; rien n'est affiché côté serveur.
  const ua = useSyncExternalStore(noop, () => navigator.userAgent, () => "");
  const info = detectInApp(ua);
  const [copied, setCopied] = useState(false);
  if (!info.inApp) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    } catch {
      window.prompt("Copiez ce lien puis collez-le dans Chrome ou Safari :", location.href);
    }
  };
  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-nuit-900" role="note" data-testid="navigateur-integre">
      <p className="font-semibold">Vous êtes dans le navigateur de {info.app}.</p>
      <p className="mt-1">Google n&apos;autorise pas la connexion ici. Ouvrez la page dans votre navigateur habituel, ou utilisez votre adresse e-mail ci-dessous.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {info.os === "android" && (
          <a href={chromeIntentUrl(location.href)} className="rounded-md bg-electrique-600 px-3 py-1.5 font-semibold text-white">
            Ouvrir dans Chrome
          </a>
        )}
        <button type="button" onClick={copy} className="rounded-md border border-gris-200 bg-white px-3 py-1.5 font-semibold">
          {copied ? "Lien copié ✓" : "Copier le lien"}
        </button>
      </div>
      {info.os === "ios" && <p className="mt-2 text-xs text-gris-600">Sur iPhone : touchez « ⋯ » ou l&apos;icône de partage, puis « Ouvrir dans Safari ».</p>}
    </div>
  );
}
