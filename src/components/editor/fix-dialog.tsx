"use client";

import { useEffect } from "react";
import type { FixResult } from "@/lib/fix";

/** « Code corrigé » : le code réécrit (lignes modifiées surlignées), la liste des corrections, Remplacer / Annuler. */
export function FixDialog({ fix, title, onApply, onClose }: { fix: FixResult; title: string; onApply: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  const changed = new Set(fix.changes.map((c) => c.line));
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 p-3 pt-[max(1rem,env(safe-area-inset-top))]" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Code corrigé" data-testid="dialogue-correction" className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#1f2024] text-gray-100 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <h2 className="text-base font-semibold">✨ Code corrigé — {title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="ml-auto rounded px-2 py-1 text-gray-400 hover:bg-white/10">
            ✕
          </button>
        </div>
        <div className="flex min-h-0 flex-col gap-2 overflow-auto p-3 text-sm">
          <p className="text-gray-300">
            {fix.compiles === true
              ? "Voici votre code corrigé. Les lignes modifiées sont surlignées en vert."
              : fix.compiles === false
                ? "Voici une partie des corrections. Il restera une erreur à corriger vous-même (lisez le message d'erreur)."
                : "Voici votre code corrigé (lignes en vert). Exécutez-le ensuite pour vérifier qu'il fait bien ce que vous voulez."}
          </p>
          <pre className="max-h-[45dvh] overflow-auto rounded border border-white/10 bg-[#141518] py-1 font-mono text-[13px] leading-relaxed" data-testid="code-corrige">
            {fix.code.split("\n").map((l, i) => (
              <div key={i} className={changed.has(i + 1) ? "bg-emerald-700/50 font-semibold text-white" : ""}>
                <span className="inline-block w-9 select-none pr-2 text-right text-gray-500">{i + 1}</span>
                {l || " "}
              </div>
            ))}
          </pre>
          <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-gray-300" data-testid="liste-corrections">
            {fix.changes.map((c, i) => (
              <li key={i}>
                Ligne {c.line} : {c.why}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500">Votre code actuel est gardé dans l&apos;historique (🕘) : vous pourrez y revenir.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-white/15 px-3 py-2 hover:bg-white/5">
              Annuler
            </button>
            <button type="button" autoFocus onClick={onApply} data-testid="appliquer-correction" className="rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-500">
              Remplacer mon code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
