import { languageOf } from "@/lib/ide/fs";
import { cn } from "../ui";

/**
 * Icône de type de fichier (dessin propre à UPL IDE) : un court sigle coloré
 * selon le langage, lisible dans l'explorateur, les onglets et le fil d'Ariane.
 */
const BADGES: Record<string, { label: string; color: string }> = {
  html: { label: "<>", color: "#e37933" },
  css: { label: "#", color: "#519aba" },
  javascript: { label: "JS", color: "#cbcb41" },
  typescript: { label: "TS", color: "#3b8eea" },
  python: { label: "py", color: "#4f9fd9" },
  c: { label: "C", color: "#8fa8c8" },
  java: { label: "J", color: "#cc3e44" },
  pseudocode: { label: "≡", color: "#22c3d6" },
  json: { label: "{}", color: "#cbcb41" },
  markdown: { label: "M↓", color: "#519aba" },
  sql: { label: "db", color: "#d4a72c" },
  php: { label: "php", color: "#a074c4" },
};

export function FileIcon({ path, className }: { path: string; className?: string }) {
  const b = BADGES[languageOf(path).monaco] ?? { label: "≡", color: "#8b949e" };
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center font-mono text-[9px] font-bold leading-none tracking-tighter", className)}
      style={{ color: b.color }}
    >
      {b.label}
    </span>
  );
}
