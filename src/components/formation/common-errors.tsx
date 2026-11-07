import type { CommonError } from "@/content/types";
import { Markdown } from "../learning/markdown";

/** Erreurs fréquentes : version fautive, version correcte, explication, et message réel de l'interpréteur. */
export function CommonErrorsView({ errors, messages }: { errors: CommonError[]; messages: Array<string | null> }) {
  return (
    <div className="space-y-4">
      {errors.map((e, i) => (
        <div key={i} className="rounded-xl border border-gris-200 bg-white p-4">
          <h4 className="font-semibold text-nuit-900">⚠️ {e.title}</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-erreur">✗ À éviter</p>
              <pre className="overflow-x-auto rounded-md border border-red-200 bg-red-50 p-3 font-mono text-xs text-red-900">{e.wrong}</pre>
              {messages[i] && <p className="mt-1 text-xs text-red-800">Message de l&apos;interpréteur : <span className="font-mono">{messages[i]}</span></p>}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-succes">✓ Correct</p>
              <pre className="overflow-x-auto rounded-md border border-green-200 bg-green-50 p-3 font-mono text-xs text-green-900">{e.right}</pre>
            </div>
          </div>
          <Markdown className="mt-3 text-sm">{e.explanation}</Markdown>
        </div>
      ))}
    </div>
  );
}
