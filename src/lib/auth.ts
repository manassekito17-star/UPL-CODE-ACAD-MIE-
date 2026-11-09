import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { effectiveStatus } from "./admin/suspension";
import { isSupabaseConfigured } from "./env";
import { createClient } from "./supabase/server";

export type AppRole = "etudiant" | "enseignant" | "administrateur";
export type TeacherPermission = "contenus" | "corrections" | "suivi";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  /** Méthodes de connexion liées au compte (« email », « google »). */
  providers: string[];
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

  const [profileRes, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("full_name, status, suspended_until, avatar_url, last_seen_at").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role, permissions").eq("user_id", user.id),
  ]);
  let profile: { full_name: string | null; status: string | null; suspended_until?: string | null; avatar_url: string | null; last_seen_at: string | null } | null = profileRes.data;
  // Base pas encore mise à jour (colonne suspended_until absente) : lecture sans la fin de suspension.
  if (profileRes.error?.code === "42703") {
    profile = (await supabase.from("profiles").select("full_name, status, avatar_url, last_seen_at").eq("id", user.id).maybeSingle()).data;
  }
  const roleList = (roles ?? []).map((r) => r.role as AppRole);
  const permissions = new Set<TeacherPermission>();
  for (const r of roles ?? []) for (const p of (r.permissions as string[]) ?? []) permissions.add(p as TeacherPermission);
  const isAdmin = roleList.includes("administrateur");
  // Dernière visite (au plus une écriture toutes les 5 minutes) : base des indicateurs d'activité.
  if (profile && (!profile.last_seen_at || Date.now() - new Date(profile.last_seen_at).getTime() > 5 * 60_000)) {
    await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);
  }
  const metaAvatar = (user.user_metadata?.avatar_url ?? user.user_metadata?.picture) as string | undefined;
  if (isAdmin) (["contenus", "corrections", "suivi"] as const).forEach((p) => permissions.add(p));

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name || user.email?.split("@")[0] || "Étudiant",
    avatarUrl: profile?.avatar_url || (metaAvatar?.startsWith("https://") ? metaAvatar : null),
    providers: [...new Set([...((user.app_metadata?.providers as string[] | undefined) ?? []), ...(user.identities ?? []).map((i) => i.provider)])],
    // Une suspension temporaire dont la date de fin est passée est levée automatiquement.
    status: effectiveStatus(profile?.status, profile?.suspended_until),
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

/**
 * Second facteur (MFA) : un administrateur qui a activé un code de vérification doit l'avoir saisi
 * pendant cette session (niveau « aal2 ») avant d'accéder à l'administration. La base applique la
 * même règle (is_admin) : une session sans code n'a aucun droit d'administration.
 */
export const mfaStatus = cache(async (): Promise<{ enrolled: boolean; verified: boolean }> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return { enrolled: false, verified: false };
  return { enrolled: data.nextLevel === "aal2", verified: data.currentLevel === "aal2" };
});

async function requireMfaIfEnrolled(user: CurrentUser) {
  if (!user.isAdmin) return;
  const mfa = await mfaStatus();
  if (mfa.enrolled && !mfa.verified) redirect("/verification-mfa");
}

/** Exige le rôle enseignant (avec la permission donnée) ou administrateur. */
export async function requireStaff(permission?: TeacherPermission): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!isStaff(user) || (permission && !canTeach(user, permission))) redirect("/acces-refuse");
  await requireMfaIfEnrolled(user);
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!user.isAdmin) redirect("/acces-refuse");
  await requireMfaIfEnrolled(user);
  return user;
}
