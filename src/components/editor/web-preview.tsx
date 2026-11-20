"use client";

import { useEffect, useRef } from "react";
import { applyPreviewStorage } from "@/lib/execution/web-document";

export interface PreviewConsoleLine {
  level: "log" | "info" | "warn" | "error";
  text: string;
}

/**
 * Aperçu d'un projet web dans une iframe isolée :
 *  - sandbox="allow-scripts allow-forms" sans allow-same-origin → origine opaque, aucun
 *    accès aux cookies, au stockage ni à la page de la plateforme ;
 *  - pas de navigation de la page parente ni de fenêtres ; les formulaires déclenchent bien leur
 *    événement « submit » (script de la page), mais aucun envoi vers un serveur (CSP form-action none) ;
 *  - la politique CSP injectée dans le document interdit toute requête réseau.
 * La console de l'aperçu est relayée par postMessage (messages filtrés par
 * leur provenance exacte : la fenêtre de cette iframe).
 */
export function WebPreview({ doc, onConsole, title = "Aperçu de la page", className }: { doc: string; onConsole?: (l: PreviewConsoleLine) => void; title?: string; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      const d = e.data as { source?: string; level?: string; text?: unknown; storage?: unknown };
      if (d?.source !== "upl-apercu") return;
      // localStorage de la page : gardé dans l'onglet pour les rechargements de l'aperçu.
      if (d.storage) return applyPreviewStorage(d.storage);
      if (!onConsole) return;
      const level = (["log", "info", "warn", "error"] as const).find((l) => l === d.level) ?? "log";
      onConsole({ level, text: String(d.text ?? "").slice(0, 2000) });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onConsole]);
  return <iframe ref={ref} title={title} sandbox="allow-scripts allow-forms" srcDoc={doc} referrerPolicy="no-referrer" className={className ?? "h-64 w-full rounded-md border border-gris-200 bg-white"} />;
}
