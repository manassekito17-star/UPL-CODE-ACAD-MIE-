"use client";

import { useEffect, useRef, useState } from "react";
import type { KPlusCommand } from "@/lib/execution/types";
import { sendKPlusEvent } from "@/lib/kplus";
import rendu from "@/lib/kplus/rendu-web";

/**
 * Page d'un programme K+ Web (« utiliser web »), affichée et utilisable :
 * les clics, saisies et minuteries sont transmis au moteur K+ (Web Worker),
 * qui renvoie les modifications de la page. Les textes sont toujours insérés
 * comme du texte (jamais comme du HTML).
 */
export function KPlusPage({ commands, onOutput, className }: { commands: KPlusCommand[]; onOutput?: (text: string) => void; className?: string }) {
  const container = useRef<HTMLDivElement | null>(null);
  const output = useRef(onOutput);
  const [title, setTitle] = useState("");
  useEffect(() => {
    output.current = onOutput;
  }, [onOutput]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let active = true;
    const page = rendu.creerRendu(el, {
      surTitre: (t) => setTitle(t),
      surEvenement: async (id, genre, valeurs) => {
        if (!active) return;
        const r = await sendKPlusEvent(id, genre, valeurs);
        if (!active) return;
        page.appliquer(r.commandes ?? []);
        if (r.sortie) output.current?.(r.sortie);
      },
    });
    page.appliquer(commands);
    return () => {
      active = false;
      page.vider();
    };
  }, [commands]);

  return (
    <div className={className} data-testid="kplus-page">
      <div className="flex items-center justify-between gap-2 border-b border-black/10 bg-gray-100 px-3 py-1 text-xs text-gray-600">
        <span>Page web K+{title ? ` — ${title}` : ""}</span>
      </div>
      <div ref={container} className="max-h-[480px] min-h-24 overflow-auto bg-white" />
    </div>
  );
}
