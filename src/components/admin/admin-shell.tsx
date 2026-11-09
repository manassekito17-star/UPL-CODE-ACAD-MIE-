"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "../ui";

/**
 * Panneau d'administration plein écran : menu latéral (sections, compteurs, profil),
 * barre supérieure (recherche d'un utilisateur, retour au site). Sur téléphone, le menu
 * s'ouvre en tiroir.
 */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  group: string;
  count?: number;
}

const ICONS = {
  tableau: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  activite: "M3 12h4l3-8 4 16 3-8h4",
  utilisateurs: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5M17 11a3 3 0 1 0 0-6M22 20c0-3-2-5-5-5.5",
  suivi: "M4 19V5M4 19h16M8 15l4-4 3 3 5-6",
  formations: "M3 7l9-4 9 4-9 4zM7 9v5c0 1.5 2.5 3 5 3s5-1.5 5-3V9",
  exercices: "M8 6l-5 6 5 6M16 6l5 6-5 6",
  corrections: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  annonces: "M4 10v4h3l6 4V6L7 10zM17 9a4 4 0 0 1 0 6",
  journal: "M6 3h9l4 4v14H6zM9 9h6M9 13h6M9 17h4",
  consommation: "M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6",
  parametres: "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  securite: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  menu: "M4 6h16M4 12h16M4 18h16",
  recherche: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm5 12 4 4",
  site: "M3 12l9-8 9 8M5 10v10h14V10",
} as const;

export function AdminIcon({ name, className = "h-[18px] w-[18px]" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

export function AdminShell({
  items,
  me,
  title,
  canSearchUsers,
  children,
}: {
  items: AdminNavItem[];
  me: { name: string; role: string; avatarUrl: string | null };
  title: string;
  canSearchUsers: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Le tiroir se referme après un changement de page (téléphone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [path]);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));
  const groups = [...new Set(items.map((i) => i.group))];
  const initials = me.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-40 flex bg-gris-50" data-testid="panneau-admin">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-nuit-950 text-gray-300 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Menu de l'administration"
      >
        <Link href="/admin" className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-electrique-600 to-cyan-accent font-mono text-xs font-bold text-white">{"</>"}</span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-white">UPL CODE ACADEMY MK</span>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-cyan-accent">{title}</span>
          </span>
        </Link>
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {groups.map((g) => (
            <div key={g} className="mb-3">
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{g}</p>
              {items
                .filter((i) => i.group === g)
                .map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    aria-current={active(i.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                      active(i.href) ? "bg-electrique-600 text-white" : "hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <AdminIcon name={i.icon} />
                    <span className="flex-1">{i.label}</span>
                    {i.count ? <span className={cn("rounded-full px-2 text-xs font-bold", active(i.href) ? "bg-white/25" : "bg-amber-500 text-nuit-950")}>{i.count}</span> : null}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
          {me.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-electrique-600 text-sm font-bold text-white">{initials}</span>
          )}
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-white">{me.name}</span>
            <span className="block text-xs text-gray-400">{me.role}</span>
          </span>
        </div>
      </aside>
      {open && <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gris-200 bg-white px-3 sm:px-5">
          <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className="grid h-9 w-9 place-items-center rounded-lg border border-gris-200 lg:hidden">
            <AdminIcon name="menu" />
          </button>
          {canSearchUsers ? (
            <form action="/admin/utilisateurs" className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gris-200 bg-gris-50 px-3 sm:max-w-md">
              <AdminIcon name="recherche" className="h-4 w-4 shrink-0 text-gris-500" />
              <input name="q" placeholder="Rechercher un utilisateur (nom ou e-mail)…" aria-label="Rechercher un utilisateur" className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </form>
          ) : (
            <span className="flex-1" />
          )}
          <Link href="/" className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-nuit-800 hover:bg-gris-100">
            <AdminIcon name="site" className="h-4 w-4" />
            <span className="hidden sm:inline">Voir le site</span>
          </Link>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6" id="contenu-admin">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
