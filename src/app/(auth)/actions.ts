"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  success?: string;
}

const emailSchema = z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(254);
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(72)
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.");

/** Évite les redirections ouvertes : seuls les chemins internes sont acceptés. */
function safeNext(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/tableau-de-bord";
}

async function limited(kind: string): Promise<string | null> {
  const ip = clientIp(await headers());
  // 8 tentatives / 10 min par adresse IP (ajustable pour les environnements de test).
  const max = Number(process.env.AUTH_RATE_LIMIT_PER_10MIN ?? 8);
  const r = rateLimit(`auth:${kind}:${ip}`, Number.isFinite(max) && max > 0 ? max : 8, 10 * 60_000);
  return r.ok ? null : `Trop de tentatives. Réessayez dans ${Math.ceil(r.retryAfterSeconds / 60)} min.`;
}

function origin(h: Headers): string {
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : publicEnv.siteUrl;
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "L'authentification n'est pas configurée (mode démonstration)." };
  const tooMany = await limited("connexion");
  if (tooMany) return { error: tooMany };
  const email = emailSchema.safeParse(form.get("email"));
  const password = z.string().min(1).max(72).safeParse(form.get("password"));
  if (!email.success || !password.success) return { error: "E-mail ou mot de passe invalide." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
  if (error) {
    if (/confirm/i.test(error.message)) return { error: "Votre adresse e-mail n'est pas encore vérifiée. Consultez votre messagerie." };
    return { error: "E-mail ou mot de passe incorrect." };
  }
  redirect(safeNext(form.get("suite")));
}

/**
 * Connexion / inscription avec Google (OAuth officiel, géré par Supabase Auth).
 * Si une personne possède déjà un compte avec la même adresse vérifiée,
 * Supabase rattache l'identité Google à ce compte (pas de doublon).
 */
export async function signInWithGoogle(form: FormData) {
  if (!isSupabaseConfigured() || !publicEnv.googleAuth) redirect("/connexion?erreur=google");
  const tooMany = await limited("google");
  if (tooMany) redirect("/connexion?erreur=limite");
  const next = safeNext(form.get("suite"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin(await headers())}/auth/callback?suite=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) redirect("/connexion?erreur=google");
  redirect(data.url);
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "L'authentification n'est pas configurée (mode démonstration)." };
  const tooMany = await limited("inscription");
  if (tooMany) return { error: tooMany };
  const parsed = z
    .object({
      fullName: z.string().trim().min(2, "Indiquez votre nom complet.").max(120),
      email: emailSchema,
      password: passwordSchema,
      confirm: z.string(),
      terms: z.literal("on", { message: "Vous devez accepter les conditions d'utilisation." }),
    })
    .refine((d) => d.password === d.confirm, { message: "Les deux mots de passe ne correspondent pas.", path: ["confirm"] })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const settings = await getSettings();
  if (!settings.registration.open) return { error: "Les inscriptions sont actuellement fermées." };
  const domains = settings.registration.allowed_email_domains;
  if (domains.length && !domains.some((d) => parsed.data.email.endsWith(`@${d.toLowerCase()}`))) {
    return { error: `Les inscriptions sont réservées aux adresses : ${domains.map((d) => `@${d}`).join(", ")}.` };
  }

  const supabase = await createClient();
  const h = await headers();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: `${origin(h)}/auth/callback?suite=/tableau-de-bord` },
  });
  if (error) {
    if (/registered|exists/i.test(error.message)) return { error: "Un compte existe déjà avec cette adresse." };
    return { error: "Inscription impossible pour le moment. Réessayez plus tard." };
  }
  await audit(data.user?.id ?? null, "compte.inscription", data.user ? { type: "utilisateur", id: data.user.id } : undefined, {}, clientIp(h));
  if (data.session) redirect("/tableau-de-bord");
  return { success: "Compte créé ! Un e-mail de vérification vous a été envoyé : cliquez sur le lien pour activer votre compte." };
}

export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "L'authentification n'est pas configurée (mode démonstration)." };
  const tooMany = await limited("reinitialisation");
  if (tooMany) return { error: tooMany };
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return { error: "Adresse e-mail invalide." };
  const supabase = await createClient();
  const h = await headers();
  await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${origin(h)}/auth/callback?suite=/reinitialiser-mot-de-passe` });
  // Même réponse que le compte existe ou non (pas de divulgation d'informations).
  return { success: "Si un compte correspond à cette adresse, un lien de réinitialisation vient d'être envoyé." };
}

export async function updatePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const password = passwordSchema.safeParse(form.get("password"));
  if (!password.success) return { error: password.error.issues[0].message };
  if (form.get("password") !== form.get("confirm")) return { error: "Les deux mots de passe ne correspondent pas." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Lien expiré : refaites une demande de réinitialisation." };
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { error: "Impossible de modifier le mot de passe." };
  await audit(user.id, "compte.mot_de_passe_modifie", { type: "utilisateur", id: user.id });
  redirect("/tableau-de-bord?motdepasse=modifie");
}
