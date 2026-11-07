"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../ui";

export type MenuItemDef = { label: string; shortcut?: string; onClick: () => void; disabled?: boolean; checked?: boolean } | "separateur";

export interface MenuDef {
  label: string;
  items: MenuItemDef[];
}

/**
 * Barre de menus de UPL IDE (Fichier, Édition, Sélection, Affichage…).
 * Chaque entrée déclenche une action réelle de l'IDE ou de l'éditeur.
 * Sur petit écran, les menus sont regroupés derrière un seul bouton.
 */
export function MenuBar({ menus }: { menus: MenuDef[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open === null && !mobileOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, mobileOpen]);

  const run = (item: Exclude<MenuItemDef, "separateur">) => {
    setOpen(null);
    setMobileOpen(false);
    item.onClick();
  };

  const list = (items: MenuItemDef[]) =>
    items.map((item, i) =>
      item === "separateur" ? (
        <div key={i} role="separator" className="my-1 h-px bg-[var(--ide-border)]" />
      ) : (
        <button
          key={i}
          type="button"
          role={item.checked === undefined ? "menuitem" : "menuitemcheckbox"}
          aria-checked={item.checked}
          disabled={item.disabled}
          onClick={() => run(item)}
          className="flex w-full items-center gap-3 rounded-sm px-2 py-1 text-left text-[13px] text-[var(--ide-text)] hover:bg-[var(--ide-accent)] hover:text-white disabled:pointer-events-none disabled:opacity-40"
        >
          <span className="w-3 shrink-0 text-center">{item.checked ? "✓" : ""}</span>
          <span className="flex-1 whitespace-nowrap">{item.label}</span>
          {item.shortcut && <span className="whitespace-nowrap text-xs opacity-70">{item.shortcut}</span>}
        </button>
      ),
    );

  const panel = "absolute left-0 top-full z-[60] mt-px min-w-60 rounded-md border border-[var(--ide-border)] bg-[var(--ide-menu)] p-1 shadow-2xl";

  return (
    <div ref={root} className="relative flex items-center" role="menubar" aria-label="Menus de l'IDE">
      <div className="hidden items-center md:flex">
        {menus.map((m, i) => (
          <div key={m.label} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
              onMouseEnter={() => open !== null && setOpen(i)}
              className={cn("rounded-sm px-2 py-1 text-[13px] text-[var(--ide-text)] hover:bg-[var(--ide-hover)]", open === i && "bg-[var(--ide-hover)]")}
            >
              {m.label}
            </button>
            {open === i && (
              <div role="menu" aria-label={m.label} className={panel}>
                {list(m.items)}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="relative md:hidden">
        <button type="button" aria-haspopup="menu" aria-expanded={mobileOpen} aria-label="Menu" onClick={() => setMobileOpen((o) => !o)} className="rounded-sm px-2 py-1 text-lg leading-none text-[var(--ide-text)] hover:bg-[var(--ide-hover)]">
          ☰
        </button>
        {mobileOpen && (
          <div role="menu" aria-label="Menu" className={cn(panel, "max-h-[75vh] w-[min(18rem,calc(100vw-1rem))] overflow-auto")}>
            {menus.map((m) => (
              <div key={m.label}>
                <p className="px-2 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--ide-muted)]">{m.label}</p>
                {list(m.items.filter((it) => it !== "separateur"))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
