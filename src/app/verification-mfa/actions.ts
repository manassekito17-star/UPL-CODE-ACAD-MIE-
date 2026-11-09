"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";
import { IP_RULES, attemptKey, hitAttempt, waitMessage } from "@/lib/security/attempts";
import { createClient } from "@/lib/supabase/server";

export interface MfaState {
  error?: string;
  success?: string;
  factorId?: string;
  qr?: string;
  secret?: string;
}

const code = z.string().trim().regex(/^\d{6}$/, "Le code comporte 6 chiffres.");

async function tooMany(userId: string): Promise<string | null> {
  const r = await hitAttempt(attemptKey("mfa", userId + "|" + clientIp(await headers())), IP_RULES.mfa);
  return r.ok ? null : `Trop d'essais. Réessayez dans ${waitMessage(r.retryAfterSeconds)}.`;
}

/** Étape 1 : création du facteur (QR code à scanner avec l'application d'authentification). */
export async function enrollTotp(): Promise<MfaState> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "Réservé aux administrateurs." };
  const supabase = await createClient();
  // Un facteur commencé mais jamais confirmé est remplacé.
  const { data: list } = await supabase.auth.mfa.listFactors();
  for (const f of list?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `UPL ${new Date().toISOString().slice(0, 10)}` });
  if (error || !data) return { error: "Activation impossible pour le moment. Vérifiez que l'authentification multifacteur (TOTP) est activée dans Supabase." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

/** Étape 2 : confirmation avec un premier code ; la session passe au niveau « aal2 ». */
export async function confirmTotp(prev: MfaState, form: FormData): Promise<MfaState> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { error: "Réservé aux administrateurs." };
  const parsed = code.safeParse(form.get("code"));
  const factorId = z.string().uuid().safeParse(form.get("factorId"));
  if (!parsed.success || !factorId.success) return { ...prev, error: parsed.success ? "Recommencez l'activation." : parsed.error.issues[0].message };
  const limit = await tooMany(user.id);
  if (limit) return { ...prev, error: limit };
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factorId.data, code: parsed.data });
  if (error) return { ...prev, error: "Code incorrect ou expiré. Saisissez le code affiché maintenant dans l'application." };
  await audit(user.id, "securite.mfa_active", { type: "utilisateur", id: user.id }, {}, clientIp(await headers()));
  return { success: "Second facteur activé. Il sera demandé à chaque connexion à l'administration." };
}

/** À la connexion : saisie du code pour accéder à l'administration. */
export async function verifyMfa(_prev: MfaState, form: FormData): Promise<MfaState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suite=/admin");
  const parsed = code.safeParse(form.get("code"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const limit = await tooMany(user.id);
  if (limit) return { error: limit };
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp?.find((f) => f.status === "verified");
  if (!factor) redirect("/admin");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: parsed.data });
  if (error) {
    await audit(user.id, "securite.mfa_echec", { type: "utilisateur", id: user.id }, {}, clientIp(await headers()));
    return { error: "Code incorrect ou expiré." };
  }
  redirect("/admin");
}

/** Désactivation (session déjà validée par le code). */
export async function unenrollTotp(form: FormData) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return;
  const factorId = z.string().uuid().safeParse(form.get("factorId"));
  if (!factorId.success) return;
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId: factorId.data });
  if (!error) await audit(user.id, "securite.mfa_desactive", { type: "utilisateur", id: user.id }, {}, clientIp(await headers()));
  // Nouvelle session sans le facteur.
  await supabase.auth.refreshSession();
  redirect("/admin/securite?message=" + encodeURIComponent(error ? "Désactivation impossible : validez d'abord votre code." : "Second facteur désactivé."));
}
