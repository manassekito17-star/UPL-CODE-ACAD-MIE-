"use client";

import { useState } from "react";
import { cn } from "../ui";

/**
 * Clavier de programmation pour téléphone et tablette : une rangée de symboles
 * adaptée au langage du fichier ouvert, et une rangée de commandes (tabulation,
 * déplacement du curseur, annuler, assistant IA, palette de commandes).
 * Les touches ne prennent pas le focus : le clavier du téléphone reste ouvert.
 */

/** Action envoyée à l'éditeur. */
export type KeyAction =
  | { kind: "texte"; text: string }
  | { kind: "modele"; snippet: string }
  | { kind: "commande"; id: "tab" | "cursorUp" | "cursorDown" | "cursorLeft" | "cursorRight" | "undo" | "redo" | "palette" | "suggestions" }
  | { kind: "balise" }
  | { kind: "assistant" }
  | { kind: "presse-papiers"; id: "tout" | "copier" | "couper" | "coller" };

interface KeyDef {
  label: string;
  title: string;
  action: KeyAction;
}

const t = (text: string, title = text): KeyDef => ({ label: text, title, action: { kind: "texte", text } });
const s = (label: string, snippet: string, title = label): KeyDef => ({ label, title, action: { kind: "modele", snippet } });

const PAIRS: KeyDef[] = [s("( )", "($0)", "Parenthèses"), s("[ ]", "[$0]", "Crochets"), s("{ }", "{$0}", "Accolades"), s('" "', '"$0"', "Guillemets"), s("' '", "'$0'", "Apostrophes")];

/** Symboles proposés selon le langage (identifiant Monaco). */
export const SYMBOLS: Record<string, KeyDef[]> = {
  html: [
    { label: "<tag>", title: "Balise : choisir dans la liste", action: { kind: "balise" } },
    s("div", "<div>$0</div>", "Bloc <div>"),
    s("p", "<p>$0</p>", "Paragraphe <p>"),
    s("class", ' class="$0"', "Attribut class"),
    s("id", ' id="$0"', "Attribut id"),
    t("="),
    s('""', '"$0"', "Guillemets"),
    t("<"),
    t(">"),
    t("/"),
    t("!"),
    t("-"),
    s("{ }", "{$0}", "Accolades"),
  ],
  css: [s("{ }", "{\n\t$0\n}", "Bloc de règles"), t(":"), t(";"), t("."), t("#"), t("-"), t("px"), t("%"), t("rem"), s("( )", "($0)", "Parenthèses"), t(","), t("*"), t(">")],
  pseudocode: [
    t("←", "Affectation"),
    t("="),
    t("≠", "Différent"),
    t("<"),
    t(">"),
    t("≤", "Inférieur ou égal"),
    t("≥", "Supérieur ou égal"),
    t("+"),
    t("-"),
    t("*"),
    t("/"),
    t("^", "Puissance"),
    t(":"),
    t(","),
    t(".."),
    ...PAIRS.slice(0, 2),
    s('" "', '"$0"', "Chaîne"),
  ],
  default: [
    ...PAIRS.slice(0, 3),
    t(";"),
    t(":"),
    t("="),
    t("<"),
    t(">"),
    t("!"),
    t("+"),
    t("-"),
    t("*"),
    t("/"),
    t("%"),
    t("&"),
    t("|"),
    ...PAIRS.slice(3),
    t("#"),
    t("_"),
    t("."),
    t(","),
    t("\\", "Barre oblique inverse"),
  ],
};

/** Symboles mathématiques (énoncés, commentaires, chaînes) : appartenance, comparaison, logique. */
export const MATH: KeyDef[] = ["∈", "∉", "≤", "≥", "≠", "≈", "←", "→", "∀", "∃", "¬", "∧", "∨", "×", "÷", "√", "π", "∞", "°", "²"].map((c) => t(c));

const COMMANDS: Array<{ label: string; title: string; id: Extract<KeyAction, { kind: "commande" }>["id"] }> = [
  { label: "⇥", title: "Tabulation", id: "tab" },
  { label: "↑", title: "Ligne précédente", id: "cursorUp" },
  { label: "↓", title: "Ligne suivante", id: "cursorDown" },
  { label: "←", title: "Caractère précédent", id: "cursorLeft" },
  { label: "→", title: "Caractère suivant", id: "cursorRight" },
  { label: "↶", title: "Annuler", id: "undo" },
  { label: "↷", title: "Rétablir", id: "redo" },
  { label: "⌘", title: "Palette de commandes", id: "palette" },
];

export function symbolsFor(language: string | null | undefined): KeyDef[] {
  return SYMBOLS[language ?? ""] ?? SYMBOLS.default;
}

export function MobileKeys({ language, onAction }: { language: string | null; onAction: (a: KeyAction) => void }) {
  const [math, setMath] = useState(false);
  const keys = math ? MATH : symbolsFor(language);
  // Empêche la touche de prendre le focus : l'éditeur et le clavier du téléphone restent actifs.
  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault();
  const key = (label: string, title: string, action: () => void, extra?: string) => (
    <button
      key={title + label}
      type="button"
      title={title}
      aria-label={title}
      onPointerDown={keep}
      onMouseDown={keep}
      onClick={action}
      className={cn("h-9 min-w-9 shrink-0 rounded-md px-2 font-mono text-[15px] text-[var(--ide-text)] active:bg-[var(--ide-accent)] active:text-white", extra)}
    >
      {label}
    </button>
  );
  return (
    <div className="shrink-0 border-t border-[var(--ide-border)] bg-[var(--ide-panel)]" role="toolbar" aria-label="Clavier de programmation" data-testid="ide-clavier">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--ide-border)] px-1 py-1" data-testid="ide-clavier-presse-papiers">
        {(
          [
            ["tout", "Tout sélectionner", "Tout"],
            ["copier", "Copier", "Copier"],
            ["couper", "Couper", "Couper"],
            ["coller", "Coller", "Coller"],
          ] as const
        ).map(([id, title, label]) => key(label, title, () => onAction({ kind: "presse-papiers", id }), "border border-[var(--ide-border)] px-3 font-sans text-[13px]"))}
      </div>
      <div className="flex items-center gap-0.5 overflow-x-auto px-1 pt-1" data-testid="ide-clavier-symboles">
        {keys.map((k) => key(k.label, k.title, () => onAction(k.action)))}
      </div>
      <div className="flex items-center justify-between gap-0.5 overflow-x-auto px-1 pb-1">
        {COMMANDS.map((c) => key(c.label, c.title, () => onAction({ kind: "commande", id: c.id }), "text-lg"))}
        {key("✦", "Assistant IA", () => onAction({ kind: "assistant" }), "text-lg text-[#b180d7]")}
        {key(math ? "abc" : "∈", math ? "Symboles du langage" : "Symboles mathématiques (∈, ≤, ≠…)", () => setMath((m) => !m), cn("text-lg", math && "bg-[var(--ide-hover)]"))}
      </div>
    </div>
  );
}
