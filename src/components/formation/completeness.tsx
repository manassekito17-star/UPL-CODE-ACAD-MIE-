import type { ComponentCheck } from "@/content/completeness";

export function CompletenessDetails({ checks, score }: { checks: ComponentCheck[]; score: number }) {
  return (
    <details className="rounded-lg border border-gris-200 bg-white p-3 text-sm">
      <summary className="cursor-pointer font-semibold text-nuit-900">Contenu du chapitre : {score} % des composantes prévues</summary>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.id} className={c.ok ? "text-green-800" : "text-gris-500"}>
            {c.ok ? "✓" : "○"} {c.label} <span className="text-xs">({c.detail})</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
