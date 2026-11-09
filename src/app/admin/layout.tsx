import { AdminShell, type AdminNavItem } from "@/components/admin/admin-shell";
import { canTeach, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Panneau d'administration plein écran (menu latéral, compteurs, profil), sur le modèle d'Elenge Management. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  let suspended = 0;
  let signupsToday = 0;
  if (user.isAdmin) {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const [s, n] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "suspendu").or(`suspended_until.is.null,suspended_until.gt.${nowIso}`),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    ]);
    suspended = s.count ?? 0;
    signupsToday = n.count ?? 0;
  }
  const items: Array<AdminNavItem & { show: boolean }> = [
    { href: "/admin", label: "Tableau de bord", icon: "tableau", group: "Pilotage", show: true },
    { href: "/admin/activite", label: "Activité", icon: "activite", group: "Pilotage", show: user.isAdmin },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "utilisateurs", group: "Pilotage", show: user.isAdmin, count: suspended || undefined },
    { href: "/admin/suivi", label: "Suivi des étudiants", icon: "suivi", group: "Pilotage", show: canTeach(user, "suivi") },
    { href: "/admin/formations", label: "Formations et leçons", icon: "formations", group: "Contenus", show: canTeach(user, "contenus") },
    { href: "/admin/exercices", label: "Exercices et tests", icon: "exercices", group: "Contenus", show: canTeach(user, "contenus") },
    { href: "/admin/corrections", label: "Corrections", icon: "corrections", group: "Contenus", show: canTeach(user, "corrections") },
    { href: "/admin/annonces", label: "Annonces", icon: "annonces", group: "Contenus", show: canTeach(user, "contenus") },
    { href: "/admin/journaux", label: "Journal d'audit", icon: "journal", group: "Système", show: user.isAdmin },
    { href: "/admin/consommation", label: "Consommation et coûts", icon: "consommation", group: "Système", show: user.isAdmin },
    { href: "/admin/securite", label: "Sécurité du compte", icon: "securite", group: "Système", show: user.isAdmin },
    { href: "/admin/parametres", label: "Paramètres", icon: "parametres", group: "Système", show: user.isAdmin },
  ];
  return (
    <AdminShell
      items={items
        .filter((i) => i.show)
        .map((i): AdminNavItem => ({ href: i.href, label: i.label, icon: i.icon, group: i.group, count: i.href === "/admin" ? signupsToday || undefined : i.count }))}
      me={{ name: user.fullName, role: user.isAdmin ? "Administrateur" : "Enseignant", avatarUrl: user.avatarUrl }}
      title={user.isAdmin ? "Administration" : "Espace enseignant"}
      canSearchUsers={user.isAdmin}
    >
      {children}
    </AdminShell>
  );
}
