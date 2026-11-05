import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Container } from "@/components/ui";
import { canTeach, requireStaff } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const links = [
    { href: "/admin", label: "Vue d'ensemble", show: true },
    { href: "/admin/formations", label: "Formations et leçons", show: canTeach(user, "contenus") },
    { href: "/admin/exercices", label: "Exercices et tests", show: canTeach(user, "contenus") },
    { href: "/admin/corrections", label: "Corrections", show: canTeach(user, "corrections") },
    { href: "/admin/suivi", label: "Suivi des étudiants", show: canTeach(user, "suivi") },
    { href: "/admin/annonces", label: "Annonces", show: canTeach(user, "contenus") },
    { href: "/admin/utilisateurs", label: "Comptes et rôles", show: user.isAdmin },
    { href: "/admin/journaux", label: "Journaux d'activité", show: user.isAdmin },
    { href: "/admin/consommation", label: "Consommation et coûts", show: user.isAdmin },
    { href: "/admin/parametres", label: "Paramètres et coûts IA", show: user.isAdmin },
  ].filter((l) => l.show);
  return (
    <Container className="grid gap-6 py-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <nav aria-label="Administration" className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gris-500">{BRAND.name} · {user.isAdmin ? "Administration" : "Espace enseignant"}</p>
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {links.map((l) => (
            <li key={l.href} className="shrink-0">
              <Link href={l.href} className="block rounded-md px-3 py-2 text-sm text-gris-700 hover:bg-white hover:text-electrique-600">{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </Container>
  );
}
