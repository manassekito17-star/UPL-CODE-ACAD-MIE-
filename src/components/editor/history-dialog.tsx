"use client";

import { useEffect, useMemo, useState } from "react";
import { diffStats, formatWhen, HISTORY_EVENT, listVersions, type Version } from "@/lib/history";

/**
 * Historique des versions d'un fichier : la liste (heure, raison, lignes changées), l'aperçu
 * de la version choisie, et « Restaurer cette version ». Le code actuel est gardé avant restauration.
 */
export function HistoryDialog({ storageKey, title, current, onRestore, onClose, theme = "sombre" }: { storageKey: string; title: string; current: string; onRestore: (code: string) => void; onClose: () => void; theme?: "sombre" | "clair" }) {
  const [versions, setVersions] = useState<Version[]>(() => listVersions(storageKey));
  const [sel, setSel] = useState(0);
  useEffect(() => {
    const on = () => setVersions(listVersions(storageKey));
    window.addEventListener(HISTORY_EVENT, on);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener(HISTORY_EVENT, on);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [storageKey, onClose]);
  const chosen = versions[Math.min(sel, versions.length - 1)];
  const stats = useMemo(() => (chosen ? diffStats(current, chosen.code) : null), [chosen, current]);
  const dark = theme === "sombre";
  const box = dark ? "border-white/10 bg-[#1f2024] text-gray-100" : "border-gris-200 bg-white text-nuit-900";
  const muted = dark ? "text-gray-400" : "text-gris-500";
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 p-3 pt-[max(1rem,env(safe-area-inset-top))]" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Historique des versions" data-testid="historique-versions" className={`flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border shadow-2xl ${box}`} onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center gap-2 border-b px-4 py-3 ${dark ? "border-white/10" : "border-gris-200"}`}>
          <h2 className="text-base font-semibold">🕘 Historique — {title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className={`ml-auto rounded px-2 py-1 ${muted} hover:bg-black/10`}>
            ✕
          </button>
        </div>
        {versions.length === 0 ? (
          <p className={`p-4 text-sm ${muted}`}>Aucune version pour l&apos;instant. Une version est gardée à chaque exécution, enregistrement ou correction.</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <ol className={`max-h-[30dvh] shrink-0 overflow-y-auto border-b text-sm sm:max-h-none sm:w-60 sm:border-b-0 sm:border-r ${dark ? "border-white/10" : "border-gris-200"}`} aria-label="Versions">
              {versions.map((v, i) => (
                <li key={v.at}>
                  <button type="button" onClick={() => setSel(i)} data-testid="version" aria-current={i === sel} className={`block w-full px-3 py-2 text-left ${i === sel ? "bg-electrique-600 text-white" : dark ? "hover:bg-white/5" : "hover:bg-gris-50"}`}>
                    <span className="block font-medium">{formatWhen(v.at)}</span>
                    <span className={`block text-xs ${i === sel ? "text-white/80" : muted}`}>
                      {v.reason} · {v.code.split("\n").length} lignes
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
              {chosen && stats && (
                <p className={`text-xs ${muted}`} data-testid="version-diff">
                  {chosen.code === current ? "Identique au code actuel." : `Si vous restaurez cette version : ${stats.added} ligne${stats.added > 1 ? "s" : ""} ajoutée${stats.added > 1 ? "s" : ""}, ${stats.removed} retirée${stats.removed > 1 ? "s" : ""}. Votre code actuel est gardé dans l'historique.`}
                </p>
              )}
              <pre className={`min-h-[120px] flex-1 overflow-auto rounded border p-2 font-mono text-[13px] leading-relaxed ${dark ? "border-white/10 bg-[#141518]" : "border-gris-200 bg-gris-50"}`} data-testid="version-apercu">
                {chosen?.code}
              </pre>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className={`rounded-md border px-3 py-2 text-sm ${dark ? "border-white/15 hover:bg-white/5" : "border-gris-200 hover:bg-gris-50"}`}>
                  Fermer
                </button>
                <button type="button" disabled={!chosen || chosen.code === current} data-testid="restaurer-version" onClick={() => chosen && onRestore(chosen.code)} className="rounded-md bg-electrique-600 px-3 py-2 text-sm font-semibold text-white hover:bg-electrique-500 disabled:opacity-50">
                  Restaurer cette version
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
