import Link from "next/link";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonClass, Container } from "../ui";
import { Logo } from "./logo";

/** Liens présents seulement dans le menu ☰ (la barre des très grands écrans resterait trop chargée). */
const MENU_ONLY_LINKS = [{ href: "/avis-important", label: "⚠ Avis important" }];

const PUBLIC_LINKS = [
  { href: "/formation", label: "Formation" },
  { href: "/formations", label: "Parcours" },
  { href: "/exercices", label: "Exercices" },
  { href: "/editeur", label: "Éditeur" },
  { href: "/ide", label: "UPL IDE" },
  { href: "/laboratoire", label: "Laboratoire" },
  { href: "/flow", label: "Flow Studio" },
  { href: "/flow/classique", label: "Interface LARP" },
  { href: "/professeur-ia", label: "Professeur IA" },
  { href: "/telecharger", label: "📲 Télécharger" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const links = user ? [{ href: "/tableau-de-bord", label: "Tableau de bord" }, ...PUBLIC_LINKS] : PUBLIC_LINKS;
  const staff = isStaff(user);

  return (
    <header className="sticky top-0 z-40 border-b border-gris-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-0.5 2xl:flex" aria-label="Navigation principale">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-gris-700 hover:bg-gris-100 hover:text-nuit-900">
              {l.label}
            </Link>
          ))}
          {staff && (
            <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-electrique-600 hover:bg-electrique-100">
              Administration
            </Link>
          )}
        </nav>
        <div className="hidden items-center gap-2 2xl:flex">
          {user ? (
            <>
              <Link href="/profil" className="max-w-40 truncate text-sm font-medium text-nuit-800 hover:text-electrique-600">
                {user.fullName}
              </Link>
              <form action="/auth/deconnexion" method="post">
                <button className={buttonClass("secondaire", "sm")}>Déconnexion</button>
              </form>
            </>
          ) : (
            isSupabaseConfigured() && (
              <>
                <Link href="/connexion" className={buttonClass("fantome", "sm")}>
                  Connexion
                </Link>
                <Link href="/inscription" className={buttonClass("primaire", "sm")}>
                  Créer un compte
                </Link>
              </>
            )
          )}
        </div>

        {/* Menu mobile sans JavaScript */}
        <details className="group relative 2xl:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-gris-200 [&::-webkit-details-marker]:hidden" aria-label="Ouvrir le menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gris-200 bg-white p-2 shadow-lg">
            {[...links, ...MENU_ONLY_LINKS].map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-md px-3 py-2.5 text-sm font-medium text-nuit-800 hover:bg-gris-100">
                {l.label}
              </Link>
            ))}
            {staff && (
              <Link href="/admin" className="block rounded-md px-3 py-2.5 text-sm font-medium text-electrique-600 hover:bg-electrique-100">
                Administration
              </Link>
            )}
            <div className="mt-2 border-t border-gris-100 pt-2">
              {user ? (
                <>
                  <Link href="/profil" className="block rounded-md px-3 py-2.5 text-sm text-nuit-800 hover:bg-gris-100">
                    Mon profil
                  </Link>
                  <form action="/auth/deconnexion" method="post">
                    <button className="w-full rounded-md px-3 py-2.5 text-left text-sm text-erreur hover:bg-red-50">Déconnexion</button>
                  </form>
                </>
              ) : (
                isSupabaseConfigured() && (
                  <>
                    <Link href="/connexion" className="block rounded-md px-3 py-2.5 text-sm text-nuit-800 hover:bg-gris-100">
                      Connexion
                    </Link>
                    <Link href="/inscription" className="block rounded-md px-3 py-2.5 text-sm font-semibold text-electrique-600 hover:bg-electrique-100">
                      Créer un compte
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </details>
      </Container>
      {!isSupabaseConfigured() && (
        <div className="bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
          Mode démonstration : comptes et sauvegarde désactivés tant que Supabase n&apos;est pas configuré.
        </div>
      )}
    </header>
  );
}
