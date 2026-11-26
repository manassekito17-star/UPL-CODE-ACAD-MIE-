"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Ligne de fin affichée sous la sortie d'un programme terminé, dans tous les éditeurs. */
export const END_OF_PROGRAM = "--------------\n[Fin de programme]";

/** Fin de programme (séparateur + « [Fin de programme] »), à placer sous la sortie. */
export function EndOfProgram({ className = "" }: { className?: string }) {
  return (
    <div className={`mt-6 whitespace-pre font-mono ${className}`} data-testid="fin-programme">
      {END_OF_PROGRAM}
    </div>
  );
}

/** Téléphone (portrait ou paysage) : la console s'ouvre alors en plein écran pendant l'exécution. */
export function isNarrowScreen() {
  // Portrait (étroit) ou paysage (écran tactile peu haut).
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px), (pointer: coarse) and (max-height: 520px)").matches;
}

/**
 * Écran « Console » plein écran (comme les applications d'algorithmique sur téléphone) :
 * barre « ← Console », sortie du programme en police à chasse fixe, puis
 * « -------------- [Fin de programme] » quand il est terminé. La flèche revient au code.
 */
export function ConsoleScreen({ onBack, running = false, finished, children, footer, title = "Console" }: { onBack: () => void; running?: boolean; finished: boolean; children: ReactNode; footer?: ReactNode; title?: string }) {
  const body = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Rendu dans <body> (hors des fenêtres agrandies ou réduites des éditeurs) après le montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);
  // La sortie la plus récente reste visible.
  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  });
  if (!mounted) return null;
  return createPortal(
    <div className="visible fixed inset-0 z-[200] flex flex-col bg-[#262626] text-[#f2f2f2]" role="dialog" aria-modal="true" aria-label={title} data-testid="ecran-console">
      <header className="flex shrink-0 items-center gap-5 bg-[#3d3d3d] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-md">
        <button type="button" onClick={onBack} aria-label="Retour au code" className="grid h-10 w-10 place-items-center rounded-full text-2xl hover:bg-white/10" data-testid="console-retour">
          ←
        </button>
        <h2 className="text-xl font-semibold">{title}</h2>
      </header>
      <div ref={body} className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words px-3 py-3 font-mono text-[15px] leading-relaxed" aria-live="polite" data-testid="ecran-console-sortie">
        {children}
        {running && <div className="text-[#f28c28]">Exécution…</div>}
        {finished && !running && <EndOfProgram className="text-[#e6e6e6]" />}
      </div>
      {footer && <div className="shrink-0 border-t border-white/10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">{footer}</div>}
    </div>,
    document.body,
  );
}
