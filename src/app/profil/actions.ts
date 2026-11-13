"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const nameField = z
  .string()
  .trim()
  .max(60)
  .regex(/^([\p{L}][\p{L}' .-]*)?$/u, "Nom et prénom : lettres, espaces, apostrophes et tirets uniquement.")
  .optional();

export async function updateProfile(_prev: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  const user = await requireUser("/profil");
  const parsed = z
    .object({
      first_name: nameField,
      last_name: nameField,
      full_name: z.string().trim().max(120).optional(),
      position: z.enum(["etudiant", "enseignant", "autre"]).optional().or(z.literal("")),
      sex: z.enum(["masculin", "feminin"]).optional().or(z.literal("")),
      student_number: z.string().trim().max(40).optional(),
      faculty: z.string().trim().max(120).optional(),
      level: z.enum(["debutant", "intermediaire", "avance"]),
      learning_goal: z.string().trim().max(500).optional(),
      weekly_goal_minutes: z.coerce.number().int().min(0).max(10080),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Vérifiez les champs du formulaire." };
  const d = parsed.data;
  // Nom affiché : « Prénom Nom » quand ils sont renseignés.
  const composed = `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim();
  const fullName = composed || d.full_name || "";
  if (fullName.length < 2) return { error: "Indiquez votre nom et votre prénom." };
  const supabase = await createClient();
  // RLS : la mise à jour n'est possible que sur son propre profil (identifiant interne non modifiable) ;
  // le statut et l'offre sont protégés par un déclencheur ; les rôles sont dans une autre table.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      first_name: d.first_name || null,
      last_name: d.last_name || null,
      position: d.position || null,
      sex: d.sex || null,
      student_number: d.student_number ?? null,
      faculty: d.faculty?.replace(/[<>]/g, "") ?? null,
      level: d.level,
      learning_goal: d.learning_goal ?? null,
      weekly_goal_minutes: d.weekly_goal_minutes,
    })
    .eq("id", user.id);
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/", "layout");
  return { success: "Profil enregistré." };
}

function origin(h: Headers): string {
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : publicEnv.siteUrl;
}

/** Lie le profil (accès rapide ou compte e-mail) à un compte Google : même identifiant, mêmes projets. */
export async function linkGoogle() {
  const user = await requireUser("/profil");
  if (!publicEnv.googleAuth) redirect("/profil?liaison=indisponible");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: { redirectTo: `${origin(await headers())}/auth/callback?suite=${encodeURIComponent("/profil?liaison=google")}`, queryParams: { prompt: "select_account" } },
  });
  if (error || !data?.url) redirect(`/profil?liaison=${/manual linking/i.test(error?.message ?? "") ? "desactivee" : "erreur"}`);
  await audit(user.id, "compte.liaison_google_demandee", { type: "utilisateur", id: user.id });
  redirect(data.url);
}

/** Ajoute une adresse e-mail à un accès rapide (confirmation par e-mail, puis mot de passe). */
export async function addEmail(_prev: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  const user = await requireUser("/profil");
  if (!user.isAnonymous) return { error: "Votre compte a déjà une méthode de connexion." };
  const email = z.string().trim().toLowerCase().email().max(254).safeParse(form.get("email"));
  if (!email.success) return { error: "Adresse e-mail invalide." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: email.data }, { emailRedirectTo: `${origin(await headers())}/auth/callback?suite=/reinitialiser-mot-de-passe` });
  if (error) {
    if (/registered|exists|already/i.test(error.message)) return { error: "Cette adresse est déjà utilisée par un autre compte." };
    return { error: "Impossible d'ajouter cette adresse pour le moment." };
  }
  await audit(user.id, "compte.email_ajoute", { type: "utilisateur", id: user.id });
  return { success: `Un e-mail de confirmation a été envoyé à ${email.data}. Cliquez sur le lien : vous choisirez ensuite votre mot de passe.` };
}
