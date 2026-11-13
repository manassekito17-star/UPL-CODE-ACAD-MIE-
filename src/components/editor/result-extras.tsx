"use client";

import { useState } from "react";
import type { ExecutionResult, SourceFile, SqlResultSet, SqlTableInfo } from "@/lib/execution/types";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import { cn } from "../ui";
import { WebPreview } from "./web-preview";

/** La sortie d'un programme PHP ressemble-t-elle à une page HTML ? */
export function looksLikeHtml(text: string): boolean {
  return /<(!DOCTYPE|html|body|h[1-6]|p|div|ul|ol|table|form|section|main|header|span|a|strong|em|br|img|nav|footer)\b/i.test(text);
}

/** Document d'aperçu de la page produite par PHP (feuilles de style et scripts du projet intégrés). */
export function phpPreviewDocument(stdout: string, files: SourceFile[]): string {
  return buildPreviewDocument([{ name: "index.html", content: stdout }, ...files.filter((f) => !f.name.endsWith(".php"))]);
}

/** Texte de la console : pour SQL, les messages (les tableaux sont affichés à part). */
export function sqlConsoleText(r: ExecutionResult): string {
  if (!r.log) return r.stdout;
  const lines = r.log.filter((l) => l.message).map((l) => l.message);
  return lines.length ? `${lines.join("\n")}\n` : "";
}

const cell = (v: string | number | null) => (v === null ? "NULL" : String(v));

/** Résultats d'une requête SELECT sous forme de tableau. */
export function SqlTable({ set, light = false }: { set: SqlResultSet; light?: boolean }) {
  return (
    <figure className="min-w-0">
      <figcaption className={cn("mb-1 truncate font-mono text-[11px]", light ? "text-gris-500" : "text-gray-400")} title={set.sql}>
        {set.sql}
      </figcaption>
      <div className={cn("max-h-72 overflow-auto rounded-md border", light ? "border-gris-200" : "border-white/10")}>
        <table className="w-full border-collapse text-left font-mono text-xs" data-testid="tableau-resultat">
          <thead className={cn("sticky top-0", light ? "bg-gris-100 text-nuit-900" : "bg-nuit-900 text-cyan-accent")}>
            <tr>
              {set.columns.map((c, i) => (
                <th key={i} scope="col" className="whitespace-nowrap px-2 py-1 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {set.rows.map((r, i) => (
              <tr key={i} className={cn(light ? "odd:bg-white even:bg-gris-50" : "odd:bg-black/30 even:bg-white/5")}>
                {r.map((v, j) => (
                  <td key={j} className={cn("whitespace-nowrap px-2 py-1", v === null && "italic text-gray-500")}>
                    {cell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={cn("mt-1 text-[11px]", light ? "text-gris-500" : "text-gray-500")}>
        {set.rows.length} ligne{set.rows.length > 1 ? "s" : ""}
        {set.truncated && " (affichage limité à 500 lignes)"}
      </p>
    </figure>
  );
}

/** Structure de la base : tables, colonnes, clés primaires et étrangères. */
export function SqlSchema({ schema, light = false }: { schema: SqlTableInfo[]; light?: boolean }) {
  if (!schema.length) return <p className={cn("text-xs", light ? "text-gris-500" : "text-gray-500")}>La base est vide : créez une table avec CREATE TABLE.</p>;
  return (
    <div className="grid gap-2 sm:grid-cols-2" data-testid="structure-base">
      {schema.map((t) => (
        <div key={t.name} className={cn("rounded-md border p-2 text-xs", light ? "border-gris-200 bg-white" : "border-white/10 bg-black/30")}>
          <p className={cn("mb-1 font-semibold", light ? "text-nuit-900" : "text-gray-100")}>
            {t.type === "view" ? "👁 " : "▦ "}
            {t.name}
            <span className={cn("ml-1 font-normal", light ? "text-gris-500" : "text-gray-500")}>
              {t.type === "view" ? "vue" : "table"}
              {t.rows !== null && ` · ${t.rows} ligne${t.rows > 1 ? "s" : ""}`}
            </span>
          </p>
          <ul className="space-y-0.5 font-mono">
            {t.columns.map((c) => {
              const fk = t.foreignKeys.find((f) => f.from === c.name);
              return (
                <li key={c.name} className={light ? "text-gris-700" : "text-gray-300"}>
                  {c.pk && <span title="Clé primaire">🔑 </span>}
                  {c.name}
                  <span className={light ? "text-gris-400" : "text-gray-500"}>
                    {c.type ? ` ${c.type}` : ""}
                    {c.notNull && !c.pk ? " NOT NULL" : ""}
                  </span>
                  {fk && <span className="text-amber-500" title="Clé étrangère">{` → ${fk.table}(${fk.to ?? "id"})`}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Compléments d'affichage d'un résultat : tableaux et structure (SQL),
 * aperçu de la page générée (PHP).
 */
export function ResultExtras({ result, files, light = false }: { result: ExecutionResult | null; files: SourceFile[]; light?: boolean }) {
  const [tab, setTab] = useState<"resultats" | "structure">("resultats");
  if (!result) return null;
  if (result.tables || result.schema) {
    const tables = result.tables ?? [];
    return (
      <div className="space-y-2" data-testid="resultats-sql">
        <div className="flex gap-1 text-xs">
          {(["resultats", "structure"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded px-2 py-1 font-semibold",
                tab === t ? (light ? "bg-electrique-600 text-white" : "bg-electrique-600 text-white") : light ? "bg-gris-100 text-gris-700" : "bg-white/10 text-gray-300",
              )}
            >
              {t === "resultats" ? `Résultats (${tables.length})` : `Structure (${result.schema?.length ?? 0})`}
            </button>
          ))}
        </div>
        {tab === "resultats" ? (
          tables.length ? (
            tables.map((t, i) => <SqlTable key={i} set={t} light={light} />)
          ) : (
            <p className={cn("text-xs", light ? "text-gris-500" : "text-gray-500")}>Aucune requête SELECT dans ce script.</p>
          )
        ) : (
          <SqlSchema schema={result.schema ?? []} light={light} />
        )}
      </div>
    );
  }
  if (result.engineLabel?.startsWith("PHP") && looksLikeHtml(result.stdout)) {
    return (
      <div className="space-y-1" data-testid="apercu-php">
        <span className={cn("text-xs font-semibold uppercase tracking-wide", light ? "text-gris-500" : "text-gray-400")}>Aperçu de la page générée par PHP</span>
        <WebPreview doc={phpPreviewDocument(result.stdout, files)} title="Aperçu de la page PHP" className="h-72 w-full rounded-md border border-white/10 bg-white" />
      </div>
    );
  }
  return null;
}
