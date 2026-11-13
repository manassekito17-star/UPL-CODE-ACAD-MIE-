import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, inputClass } from "@/components/ui";
import { GoogleButton, OrSeparator } from "@/components/auth/google-button";
import { publicEnv } from "@/lib/env";
import { QuickAccessForm } from "@/components/auth/quick-access-form";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const sp = await searchParams;
  const suite = typeof sp.suite === "string" ? sp.suite : "";
  return (
    <>
      <h1 className="text-2xl font-bold text-nuit-900">Accéder à la plateforme</h1>
      <p className="mb-6 mt-1 text-sm text-gris-700">Heureux de vous revoir sur {BRAND.name} ! Reprenez votre apprentissage.</p>
      {typeof sp.suite === "string" && sp.suite && !sp.erreur && (
        <p className="mb-4 rounded-md bg-electrique-100 px-3 py-2 text-sm text-nuit-900" role="status" data-testid="connexion-requise">
          Pour accéder à la plateforme : continuez avec Google (votre compte Gmail), ou remplissez l&apos;accès rapide ci-dessous (sans mot de passe).
        </p>
      )}
      {sp.erreur === "lien" && <p className="mb-4 text-sm text-erreur">Le lien est invalide ou a expiré.</p>}
      {sp.erreur === "google" && <p className="mb-4 text-sm text-erreur">La connexion avec Google n&apos;est pas disponible pour le moment. Utilisez votre adresse e-mail.</p>}
      {sp.erreur === "google-annule" && <p className="mb-4 text-sm text-erreur">Connexion Google annulée ou refusée.</p>}
      {sp.erreur === "limite" && <p className="mb-4 text-sm text-erreur">Trop de tentatives. Réessayez dans quelques minutes.</p>}
      <section aria-labelledby="option-google" className="space-y-2">
        <h2 id="option-google" className="text-sm font-semibold uppercase tracking-wide text-gris-500">Option A — Continuer avec Google</h2>
        {publicEnv.googleAuth ? (
          <GoogleButton suite={suite} />
        ) : (
          <p className="text-sm text-gris-700">La connexion Google n&apos;est pas configurée sur cette installation.</p>
        )}
        <p className="text-xs text-gris-500">Recommandé : vous retrouvez votre compte et vos projets sur tous vos appareils.</p>
      </section>
      <OrSeparator label="ou" />
      <section aria-labelledby="option-rapide" className="space-y-3">
        <h2 id="option-rapide" className="text-sm font-semibold uppercase tracking-wide text-gris-500">Option B — Accès rapide avec un profil</h2>
        <QuickAccessForm suite={suite} />
      </section>
      <section aria-labelledby="option-email" className="mt-8 rounded-lg border border-gris-200 p-4">
        <h2 id="option-email" className="mb-3 text-sm font-semibold text-nuit-900">Vous avez déjà un compte avec e-mail et mot de passe ?</h2>
        <div>
          <AuthForm action={signIn} submitLabel="Se connecter">
            <input type="hidden" name="suite" value={suite} />
            <Field label="Adresse e-mail" htmlFor="email">
              <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
            </Field>
            <Field label="Mot de passe" htmlFor="password">
              <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
            </Field>
            <p className="text-right text-sm">
              <Link href="/mot-de-passe-oublie" className="text-electrique-600 hover:underline">Mot de passe oublié ?</Link>
            </p>
          </AuthForm>
        </div>
      </section>
      <p className="mt-6 text-center text-sm text-gris-700">
        Pas encore de compte ? <Link href="/inscription" className="font-semibold text-electrique-600 hover:underline">Créer un compte</Link>
      </p>
    </>
  );
}
