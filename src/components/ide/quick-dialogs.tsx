"use client";

import { useMemo, useState } from "react";
import { basename } from "@/lib/ide/fs";
import { FileIcon } from "./file-icon";

/** Score de recherche « floue » : toutes les lettres dans l'ordre (comme Ctrl+P de VS Code). */
export function fuzzyScore(query: string, path: string): number {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return 1;
  const p = path.toLowerCase();
  const name = basename(p);
  if (name.startsWith(q)) return 1000 - name.length;
  if (name.includes(q)) return 800 - name.length;
  if (p.includes(q)) return 600 - p.length;
  let i = 0;
  let score = 0;
  for (let j = 0; j < p.length && i < q.length; j++) {
    if (p[j] === q[i]) {
      score += j > 0 && /[/._-]/.test(p[j - 1]) ? 3 : 1;
      i++;
    }
  }
  return i === q.length ? score : -1;
}

/** « Aller au fichier » (Ctrl+P) : taper quelques lettres, Entrée ou toucher pour ouvrir. */
export function QuickOpen({ files, onPick, onClose }: { files: string[]; onPick: (path: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const results = useMemo(
    () =>
      files
        .map((f) => ({ f, s: fuzzyScore(query, f) }))
        .filter((r) => r.s >= 0)
        .sort((a, b) => b.s - a.s || a.f.localeCompare(b.f))
        .slice(0, 50)
        .map((r) => r.f),
    [files, query],
  );
  const current = Math.min(index, Math.max(0, results.length - 1));
  return (
    <div className="fixed inset-0 z-[70] flex justify-center bg-black/40 p-3 pt-12" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Aller au fichier" data-testid="ide-aller-fichier" className="h-fit w-full max-w-xl overflow-hidden rounded-md border border-[var(--ide-border)] bg-[var(--ide-menu)] text-sm text-[var(--ide-text)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowDown") {
              e.preventDefault();
              setIndex((i) => Math.min(results.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIndex((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" && results[current]) onPick(results[current]);
          }}
          placeholder="Rechercher un fichier par son nom…"
          aria-label="Rechercher un fichier"
          className="w-full border-b border-[var(--ide-border)] bg-[var(--ide-input)] px-3 py-2 text-base text-[var(--ide-text)] outline-none md:text-sm"
        />
        <ul role="listbox" aria-label="Fichiers" className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && <li className="px-3 py-2 text-[var(--ide-muted)]">Aucun fichier ne correspond.</li>}
          {results.map((f, i) => (
            <li key={f} role="option" aria-selected={i === current}>
              <button type="button" onClick={() => onPick(f)} onMouseEnter={() => setIndex(i)} className={`flex w-full items-center gap-2 px-3 py-1.5 text-left ${i === current ? "bg-[var(--ide-accent)] text-white" : "hover:bg-[var(--ide-hover)]"}`}>
                <FileIcon path={f} />
                <span className="truncate">{basename(f)}</span>
                <span className={`ml-auto truncate text-xs ${i === current ? "text-white/80" : "text-[var(--ide-muted)]"}`}>{f}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const SHORTCUTS: Array<{ group: string; items: Array<[string, string]> }> = [
  {
    group: "Fichiers et affichage",
    items: [
      ["Ctrl+P", "Aller au fichier"],
      ["Ctrl+Maj+P ou F1", "Palette de commandes"],
      ["Ctrl+S", "Enregistrer"],
      ["Ctrl+Entrée", "Exécuter le fichier"],
      ["Ctrl+B", "Afficher / masquer la barre latérale"],
      ["Ctrl+J", "Afficher / masquer le panneau (console)"],
      ["Ctrl+\\", "Vue fractionnée"],
      ["Ctrl+Tab / Ctrl+Maj+Tab", "Onglet suivant / précédent"],
      ["Ctrl+= / Ctrl+- / Ctrl+0", "Zoom avant / arrière / normal"],
      ["Ctrl+K Ctrl+S", "Cette liste des raccourcis"],
    ],
  },
  {
    group: "Édition",
    items: [
      ["Ctrl+X / Ctrl+C / Ctrl+V", "Couper / copier / coller (la ligne entière sans sélection)"],
      ["Ctrl+Z / Ctrl+Y", "Annuler / rétablir"],
      ["Ctrl+/", "Commenter / décommenter la ligne"],
      ["Maj+Alt+A", "Commentaire de bloc"],
      ["Maj+Alt+F", "Formater le document"],
      ["Ctrl+Maj+K", "Supprimer la ligne"],
      ["Alt+↑ / Alt+↓", "Déplacer la ligne"],
      ["Maj+Alt+↑ / Maj+Alt+↓", "Copier la ligne au-dessus / en dessous"],
      ["Ctrl+] / Ctrl+[", "Indenter / désindenter"],
      ["Ctrl+Maj+Entrée", "Insérer une ligne au-dessus"],
      ["Tab", "Abréviation Emmet (HTML, CSS) ou suggestion"],
      ["Ctrl+Espace", "Afficher les suggestions"],
    ],
  },
  {
    group: "Sélection et curseurs multiples",
    items: [
      ["Double-clic", "Sélectionner le mot (ses autres occurrences sont surlignées)"],
      ["Triple-clic / Ctrl+L", "Sélectionner la ligne"],
      ["Ctrl+D", "Ajouter l'occurrence suivante du mot à la sélection"],
      ["Ctrl+K Ctrl+D", "Passer l'occurrence (aller à la suivante)"],
      ["Ctrl+Maj+L", "Sélectionner toutes les occurrences"],
      ["Ctrl+F2", "Modifier toutes les occurrences du mot"],
      ["Alt+clic", "Ajouter un curseur"],
      ["Ctrl+Alt+↑ / ↓", "Ajouter un curseur au-dessus / en dessous"],
      ["Maj+Alt+I", "Un curseur en fin de chaque ligne sélectionnée"],
      ["Maj+Alt+→ / ←", "Étendre / réduire la sélection"],
      ["Maj+Alt+glisser", "Sélection en colonne (rectangle)"],
    ],
  },
  {
    group: "Navigation et code",
    items: [
      ["Ctrl+G", "Aller à la ligne"],
      ["Ctrl+Maj+O", "Aller au symbole (fonction, classe, titre…)"],
      ["F12 / Ctrl+clic", "Aller à la définition"],
      ["Alt+F12", "Voir la définition sans quitter le fichier"],
      ["Maj+F12", "Afficher les références"],
      ["F2", "Renommer le symbole partout"],
      ["Ctrl+.", "Correction rapide"],
      ["Ctrl+Maj+\\", "Aller au crochet correspondant"],
      ["F8 / Maj+F8", "Problème suivant / précédent"],
      ["Ctrl+F / Ctrl+H", "Rechercher / remplacer"],
      ["Ctrl+Maj+[ / ]", "Replier / déplier le bloc"],
      ["Ctrl+K Ctrl+0 / Ctrl+K Ctrl+J", "Tout replier / tout déplier"],
    ],
  },
  {
    group: "Sur téléphone",
    items: [
      ["Appui long sur le code", "Menu : Coller, Copier, Couper, Tout, Mot, Suivant, Définition, Renommer"],
      ["Double toucher", "Sélectionner le mot"],
      ["Clavier de programmation", "Symboles, flèches, annuler, palette de commandes (⌘)"],
    ],
  },
];

/** Liste des raccourcis clavier (Ctrl+K Ctrl+S), avec recherche. */
export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-3" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="titre-raccourcis" data-testid="ide-raccourcis" className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-[var(--ide-border)] bg-[var(--ide-menu)] text-sm text-[var(--ide-text)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-[var(--ide-border)] p-3">
          <h2 id="titre-raccourcis" className="text-base font-semibold">Raccourcis clavier</h2>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && onClose()} placeholder="Rechercher…" aria-label="Rechercher un raccourci" className="ml-auto w-40 rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-2 py-1 text-base md:text-sm" />
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded px-2 py-1 text-[var(--ide-muted)] hover:bg-[var(--ide-hover)]">✕</button>
        </div>
        <div className="overflow-y-auto p-3">
          {SHORTCUTS.map((g) => {
            const items = g.items.filter(([k, d]) => !query || k.toLowerCase().includes(query) || d.toLowerCase().includes(query));
            if (!items.length) return null;
            return (
              <section key={g.group} className="mb-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ide-muted)]">{g.group}</h3>
                <table className="w-full">
                  <tbody>
                    {items.map(([k, d]) => (
                      <tr key={k + d} className="border-b border-[var(--ide-border)] last:border-0">
                        <td className="py-1.5 pr-3 align-top">{d}</td>
                        <td className="whitespace-nowrap py-1.5 text-right align-top">
                          <kbd className="rounded border border-[var(--ide-border)] bg-[var(--ide-input)] px-1.5 py-0.5 font-mono text-xs">{k}</kbd>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
