"use client";

import Link from "next/link";
import { useState } from "react";
import type { CommentedAlgorithm } from "@/content/types";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import type { TraceStep } from "@/lib/pseudocode";
import { WebPreview } from "../editor/web-preview";
import { Button, cn } from "../ui";

/**
 * Algorithme commenté ligne par ligne, avec (au choix) son organigramme et
 * son tableau de suivi des variables. Organigramme et trace sont calculés
 * côté serveur par l'interpréteur de la plateforme : ils sont exacts.
 */
export function CommentedAlgorithmView({
  algo,
  flowcharts,
  trace,
  traceTruncated,
  traceOutput,
  editorHref,
}: {
  algo: CommentedAlgorithm;
  flowcharts: Array<{ title: string; svg: string }>;
  trace: TraceStep[];
  traceTruncated: boolean;
  traceOutput: string;
  /** Ouvrir ce code dans UPL IDE (démonstration modifiable). */
  editorHref?: string;
}) {
  const [view, setView] = useState<"commentaires" | "organigramme" | "trace" | "apercu">("commentaires");
  const lines = algo.code.split("\n");
  const varNames = [...new Set(trace.flatMap((s) => s.variables.map((v) => v.name)))];

  return (
    <div className="overflow-hidden rounded-xl border border-gris-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-gris-100 bg-gris-50 px-4 py-2">
        <p className="mr-auto font-semibold text-nuit-900">{algo.title}</p>
        {editorHref && (
          <Link href={editorHref} className="text-xs font-medium text-electrique-600 hover:underline">
            Ouvrir dans UPL IDE
          </Link>
        )}
        <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 [&>button]:whitespace-nowrap" role="tablist" aria-label="Affichage">
          <Button size="sm" variant={view === "commentaires" ? "primaire" : "secondaire"} role="tab" aria-selected={view === "commentaires"} onClick={() => setView("commentaires")}>Ligne par ligne</Button>
          {algo.showFlowchart && flowcharts.length > 0 && (
            <Button size="sm" variant={view === "organigramme" ? "primaire" : "secondaire"} role="tab" aria-selected={view === "organigramme"} onClick={() => setView("organigramme")}>Organigramme</Button>
          )}
          {algo.showPreview && (
            <Button size="sm" variant={view === "apercu" ? "primaire" : "secondaire"} role="tab" aria-selected={view === "apercu"} onClick={() => setView("apercu")}>Aperçu</Button>
          )}
          {algo.showTrace && trace.length > 0 && (
            <Button size="sm" variant={view === "trace" ? "primaire" : "secondaire"} role="tab" aria-selected={view === "trace"} onClick={() => setView("trace")}>Tableau de suivi</Button>
          )}
        </div>
      </div>

      {view === "commentaires" && (
        <ol className="divide-y divide-gris-100 font-mono text-[13px]">
          {lines.map((l, i) => {
            const c = algo.comments[i + 1];
            return (
              <li key={i} className={cn("grid gap-x-4 px-4 py-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]", c && "bg-electrique-100/30")}>
                <span className="flex gap-3 whitespace-pre-wrap break-words text-nuit-900">
                  <span className="w-6 shrink-0 select-none text-right text-gris-500">{i + 1}</span>
                  <span>{l || " "}</span>
                </span>
                {c && <span className="pl-9 font-sans text-sm text-electrique-600 md:pl-0">↳ {c}</span>}
              </li>
            );
          })}
        </ol>
      )}

      {view === "apercu" && (
        <div className="p-4">
          <WebPreview doc={buildPreviewDocument([{ name: "index.html", content: algo.code }])} title={`Aperçu — ${algo.title}`} className="h-72 w-full rounded-md border border-gris-200 bg-white" />
          <p className="mt-1 text-xs text-gris-500">Rendu réel du code ci-dessus, dans un cadre isolé.</p>
        </div>
      )}

      {view === "organigramme" && (
        <div className="space-y-4 overflow-x-auto p-4">
          {flowcharts.map((f) => (
            // SVG généré par la plateforme : tout le texte y est échappé.
            <figure key={f.title} className="min-w-fit">
              <div dangerouslySetInnerHTML={{ __html: f.svg }} />
              <figcaption className="mt-1 text-xs text-gris-500">{f.title} — organigramme généré automatiquement à partir du pseudocode.</figcaption>
            </figure>
          ))}
        </div>
      )}

      {view === "trace" && (
        <div className="space-y-2 p-4">
          {algo.stdin && <p className="text-xs text-gris-500">Entrées utilisées : <span className="font-mono">{algo.stdin.replace(/\n/g, " ⏎ ")}</span></p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-xs">
              <caption className="mb-2 text-left text-sm text-gris-700">État des variables <strong>avant</strong> l&apos;exécution de chaque ligne (« ? » : pas encore de valeur).</caption>
              <thead>
                <tr className="bg-gris-100 text-left">
                  <th className="border border-gris-200 px-2 py-1">Étape</th>
                  <th className="border border-gris-200 px-2 py-1">Ligne</th>
                  {varNames.map((v) => <th key={v} className="border border-gris-200 px-2 py-1 font-mono">{v}</th>)}
                  <th className="border border-gris-200 px-2 py-1">Instruction</th>
                </tr>
              </thead>
              <tbody>
                {trace.map((s) => (
                  <tr key={s.index} className="odd:bg-white even:bg-gris-50">
                    <td className="border border-gris-200 px-2 py-1">{s.index + 1}</td>
                    <td className="border border-gris-200 px-2 py-1">{s.kind === "fin" ? "fin" : s.line}</td>
                    {varNames.map((v) => <td key={v} className="border border-gris-200 px-2 py-1 font-mono">{s.variables.find((x) => x.name === v)?.value ?? ""}</td>)}
                    <td className="max-w-64 truncate border border-gris-200 px-2 py-1 font-mono">{s.kind === "fin" ? "— fin —" : (lines[s.line - 1] ?? "").trim()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {traceTruncated && <p className="text-xs text-alerte">Tableau limité aux premières étapes.</p>}
          {traceOutput && (
            <div>
              <p className="text-xs font-semibold text-gris-500">Sortie à l&apos;écran</p>
              <pre className="rounded-md bg-nuit-950 p-3 font-mono text-xs text-gray-100">{traceOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
