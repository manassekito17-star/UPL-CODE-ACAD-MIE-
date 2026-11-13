"use client";

import Link from "next/link";
import { useState } from "react";
import type { CodeExample } from "@/content/types";
import { runProgram } from "@/lib/execution/browser";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import { KPlusPage } from "../editor/kplus-page";
import { ResultExtras, sqlConsoleText } from "../editor/result-extras";
import { WebPreview } from "../editor/web-preview";
import { LANGUAGES } from "@/lib/execution/languages";
import type { ExecutionResult } from "@/lib/execution/types";
import { Button } from "../ui";

/** Exemple de code exécutable directement dans la leçon. */
export function ExampleRunner({ example, editorHref }: { example: CodeExample; editorHref: string }) {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isWeb = Boolean(LANGUAGES[example.language].preview);

  const run = async () => {
    if (isWeb) {
      setPreview(preview ? null : buildPreviewDocument([{ name: "index.html", content: example.code }]));
      return;
    }
    setRunning(true);
    setError(null);
    const lang = LANGUAGES[example.language];
    const r = await runProgram(example.language, [{ name: lang.mainFile, content: example.code }], example.stdin ?? "", { onStatus: setStatus });
    setRunning(false);
    setStatus(null);
    setResult(r.result);
    setError(r.error ?? null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-nuit-800 bg-nuit-950">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
        <span className="mr-auto text-sm font-semibold text-white">{example.title}</span>
        <span className="text-xs text-gray-400">{LANGUAGES[example.language].shortLabel}</span>
        <Button size="sm" onClick={run} disabled={running}>
          {running ? (status ?? "…") : isWeb ? (preview ? "Masquer l'aperçu" : "👁 Aperçu") : "▶ Exécuter"}
        </Button>
        <Link href={editorHref} className="text-xs font-medium text-cyan-accent hover:underline">
          Ouvrir dans l&apos;éditeur
        </Link>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-gray-100">{example.code}</pre>
      {example.stdin &&
        (example.language === "sql" ? (
          <details className="border-t border-white/10 px-4 py-2 text-xs text-gray-400">
            <summary className="cursor-pointer">Données de départ (exécutées avant la requête)</summary>
            <pre className="mt-2 overflow-x-auto font-mono text-gray-200">{example.stdin}</pre>
          </details>
        ) : (
          <div className="border-t border-white/10 px-4 py-2 text-xs text-gray-400">
            Entrée : <span className="font-mono text-gray-200">{example.stdin.replace(/\n/g, " ⏎ ")}</span>
          </div>
        ))}
      {preview && <WebPreview doc={preview} className="h-64 w-full border-t border-white/10 bg-white" title={`Aperçu — ${example.title}`} />}
      {(result || error) && (
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-white/10 bg-black/60 p-4 font-mono text-[13px] text-gray-100" aria-live="polite">
          {error && <span className="text-red-300">{error}</span>}
          {result?.compileOutput && <span className="text-red-300">{result.compileOutput}</span>}
          {result && sqlConsoleText(result)}
          {result?.stderr && <span className="text-red-300">{result.stderr}</span>}
          {result?.hint && <span className="mt-2 block text-amber-300">💡 {result.hint}</span>}
          {result?.engineLabel && <span className="mt-2 block text-[11px] text-gray-500">Exécuté par {result.engineLabel} dans votre navigateur.</span>}
        </pre>
      )}
      {result?.kplusPage && (
        <KPlusPage
          commands={result.kplusPage}
          onOutput={(t) => setResult((r) => (r ? { ...r, stdout: r.stdout + t } : r))}
          className="border-t border-white/10"
        />
      )}
      {result && (result.tables || result.engineLabel?.startsWith("PHP")) && (
        <div className="border-t border-white/10 bg-black/40 p-4 empty:hidden">
          <ResultExtras result={result} files={[{ name: LANGUAGES[example.language].mainFile, content: example.code }]} />
        </div>
      )}
      {example.explanation && <p className="border-t border-white/10 bg-nuit-900 px-4 py-3 text-sm text-gray-300">💬 {example.explanation}</p>}
    </div>
  );
}
