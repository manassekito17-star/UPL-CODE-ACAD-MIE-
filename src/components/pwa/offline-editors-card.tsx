"use client";

import { useEffect, useState } from "react";
import { autoPrepareOffline, editorsOnDevice, FILES_EVENT, keepSavedFilesOffline, OFFLINE_EDITORS, OFFLINE_EVENT, offlineSupported, savedFilesCount, type OfflineState, type SavedFilesState } from "@/lib/offline/client";

/**
 * Tableau de bord : éditeurs gardés sur cet appareil pour une utilisation sans Internet,
 * avec un bouton pour les garder tout de suite (téléchargement en arrière-plan).
 */
export function OfflineEditorsCard() {
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<OfflineState>({ status: "inactif", ready: [] });
  const [files, setFiles] = useState<SavedFilesState>({ status: "inactif", count: 0 });

  useEffect(() => {
    if (!offlineSupported()) {
      // Navigateur sans service worker : la carte est masquée (connu seulement après le montage).
      queueMicrotask(() => setSupported(false));
      return;
    }
    const onEvent = (e: Event) => setState((e as CustomEvent<OfflineState>).detail);
    window.addEventListener(OFFLINE_EVENT, onEvent);
    const onFiles = (e: Event) => setFiles((e as CustomEvent<SavedFilesState>).detail);
    window.addEventListener(FILES_EVENT, onFiles);
    queueMicrotask(() => setFiles((f) => (f.status === "inactif" ? { status: "inactif", count: savedFilesCount() } : f)));
    void editorsOnDevice().then((ready) => setState((s) => (s.status === "inactif" ? { status: ready.length === OFFLINE_EDITORS.length ? "pret" : "inactif", ready } : s)));
    return () => {
      window.removeEventListener(OFFLINE_EVENT, onEvent);
      window.removeEventListener(FILES_EVENT, onFiles);
    };
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
            : "Les éditeurs se téléchargent automatiquement sur cet appareil quand vous avez Internet. Vous pouvez aussi lancer le téléchargement maintenant."}
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
          onClick={() => void autoPrepareOffline(true, { force: true }).then(() => keepSavedFilesOffline(true, { force: true }))}
          className="mt-4 w-full rounded-lg bg-electrique-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-electrique-500 disabled:opacity-60"
        >
          {busy ? "Enregistrement…" : "Garder les éditeurs sur cet appareil"}
        </button>
      )}
      {state.status === "erreur" && !all && <p className="mt-2 text-xs text-amber-700">Une partie n&apos;a pas pu être gardée (connexion coupée ?). Réessayez avec Internet.</p>}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gris-200 pt-3 text-sm" data-testid="fichiers-gardes" data-etat={files.status}>
        <span className="text-gris-700">
          {files.status === "en-cours"
            ? "Mes fichiers sauvegardés : enregistrement…"
            : files.status === "erreur"
              ? "Mes fichiers sauvegardés : échec, réessayez avec Internet."
              : `Mes fichiers sauvegardés : ${files.count} gardé${files.count > 1 ? "s" : ""} sur cet appareil.`}
        </span>
        <button
          type="button"
          disabled={files.status === "en-cours"}
          onClick={() => void keepSavedFilesOffline(true, { force: true })}
          className="shrink-0 rounded-md border border-gris-200 px-3 py-1.5 text-xs font-semibold text-electrique-600 hover:bg-gris-50 disabled:opacity-60"
        >
          Mettre à jour
        </button>
      </div>
      <a href="/guide" className="mt-3 inline-block text-xs font-semibold text-electrique-600 hover:underline">
        Guide des éditeurs : comment écrire et exécuter son code →
      </a>
      <p className="mt-3 text-xs text-gris-500">Sur iPhone, l&apos;application ajoutée à l&apos;écran d&apos;accueil garde sa propre copie : ouvrez-la une fois avec Internet en étant connecté.</p>
    </div>
  );
}
