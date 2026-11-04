import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "./env";
import { createClient } from "./supabase/server";

export type AppRole = "etudiant" | "enseignant" | "administrateur";
export type TeacherPermission = "contenus" | "corrections" | "suivi";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  status: "actif" | "suspendu";
  roles: AppRole[];
  permissions: TeacherPermission[];
  isAdmin: boolean;
  isTeacher: boolean;
}

/** Utilisateur connecté (vérifié auprès de Supabase Auth), ou null. Mis en cache par requête. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("full_name, status").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role, permissions").eq("user_id", user.id),
  ]);
  const roleList = (roles ?? []).map((r) => r.role as AppRole);
  const permissions = new Set<TeacherPermission>();
  for (const r of roles ?? []) for (const p of (r.permissions as string[]) ?? []) permissions.add(p as TeacherPermission);
  const isAdmin = roleList.includes("administrateur");
  if (isAdmin) (["contenus", "corrections", "suivi"] as const).forEach((p) => permissions.add(p));

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name || user.email?.split("@")[0] || "Étudiant",
    status: (profile?.status as CurrentUser["status"]) ?? "actif",
    roles: roleList.length ? roleList : ["etudiant"],
    permissions: [...permissions],
    isAdmin,
    isTeacher: roleList.includes("enseignant"),
  };
});

/** Exige une session active ; redirige vers la connexion sinon. */
export async function requireUser(nextPath?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion${nextPath ? `?suite=${encodeURIComponent(nextPath)}` : ""}`);
  if (user.status === "suspendu") redirect("/compte-suspendu");
  return user;
}

export function canTeach(user: CurrentUser | null, permission: TeacherPermission): boolean {
  if (!user || user.status !== "actif") return false;
  return user.isAdmin || (user.isTeacher && user.permissions.includes(permission));
}

export function isStaff(user: CurrentUser | null): boolean {
  return Boolean(user && user.status === "actif" && (user.isAdmin || user.isTeacher));
}

/** Exige le rôle enseignant (avec la permission donnée) ou administrateur. */
export async function requireStaff(permission?: TeacherPermission): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!isStaff(user) || (permission && !canTeach(user, permission))) redirect("/acces-refuse");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!user.isAdmin) redirect("/acces-refuse");
  return user;
}
