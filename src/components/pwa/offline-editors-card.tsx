"use client";

import { useEffect, useState } from "react";
import { autoPrepareOffline, editorsOnDevice, OFFLINE_EDITORS, OFFLINE_EVENT, offlineSupported, type OfflineState } from "@/lib/offline/client";

/**
 * Tableau de bord : éditeurs gardés sur cet appareil pour une utilisation sans Internet,
 * avec un bouton pour les garder tout de suite (téléchargement en arrière-plan).
 */
export function OfflineEditorsCard() {
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<OfflineState>({ status: "inactif", ready: [] });

  useEffect(() => {
    if (!offlineSupported()) {
      // Navigateur sans service worker : la carte est masquée (connu seulement après le montage).
      queueMicrotask(() => setSupported(false));
      return;
    }
    const onEvent = (e: Event) => setState((e as CustomEvent<OfflineState>).detail);
    window.addEventListener(OFFLINE_EVENT, onEvent);
    void editorsOnDevice().then((ready) => setState((s) => (s.status === "inactif" ? { status: ready.length === OFFLINE_EDITORS.length ? "pret" : "inactif", ready } : s)));
    return () => window.removeEventListener(OFFLINE_EVENT, onEvent);
  }, []);

  if (!supported) return null;
  const busy = state.status === "en-cours";
  const all = state.ready.length === OFFLINE_EDITORS.length;
  return (
    <div className="rounded-[var(--radius-carte)] border border-gris-200 bg-white p-5 shadow-[0_1px_2px_rgba(10,26,58,0.04)]" data-testid="carte-hors-ligne">
      <h2 className="font-bold text-nuit-900">Utiliser sans Internet</h2>
      <p className="mt-1 text-sm text-gris-700">
        {all
          ? "Les éditeurs sont gardés sur cet appareil : ils s'ouvrent même sans connexion."
          : busy
            ? `Enregistrement en cours : ${state.current ?? "…"} (gardez cette page ouverte).`
            : "Gardez les éditeurs sur cet appareil pour les ouvrir sans connexion Internet."}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {OFFLINE_EDITORS.map((e) => {
          const ok = state.ready.includes(e.path);
          return (
            <li key={e.path} className="flex items-center gap-2" data-pret={ok ? "oui" : "non"}>
              <span aria-hidden className={ok ? "text-emerald-600" : "text-gris-400"}>{ok ? "✓" : busy && state.current === e.name ? "…" : "○"}</span>
              <span className={ok ? "text-nuit-900" : "text-gris-500"}>{e.name}</span>
            </li>
          );
        })}
      </ul>
      {!all && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void autoPrepareOffline(true, { force: true })}
          className="mt-4 w-full rounded-lg bg-electrique-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-electrique-500 disabled:opacity-60"
        >
          {busy ? "Enregistrement…" : "Garder les éditeurs sur cet appareil"}
        </button>
      )}
      {state.status === "erreur" && !all && <p className="mt-2 text-xs text-amber-700">Une partie n&apos;a pas pu être gardée (connexion coupée ?). Réessayez avec Internet.</p>}
      <p className="mt-3 text-xs text-gris-500">Sur iPhone, l&apos;application ajoutée à l&apos;écran d&apos;accueil garde sa propre copie : ouvrez-la une fois avec Internet en étant connecté.</p>
    </div>
  );
}
