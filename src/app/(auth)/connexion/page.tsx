import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, inputClass } from "@/components/ui";
import { GoogleButton, OrSeparator } from "@/components/auth/google-button";
import { publicEnv } from "@/lib/env";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const sp = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-bold text-nuit-900">Connexion</h1>
      <p className="mb-6 mt-1 text-sm text-gris-700">Heureux de vous revoir sur {BRAND.name} ! Reprenez votre apprentissage.</p>
      {typeof sp.suite === "string" && sp.suite && !sp.erreur && (
        <p className="mb-4 rounded-md bg-electrique-100 px-3 py-2 text-sm text-nuit-900" role="status" data-testid="connexion-requise">
          Connectez-vous avec votre compte Gmail (ou votre adresse e-mail) pour accéder à la plateforme.
        </p>
      )}
      {sp.erreur === "lien" && <p className="mb-4 text-sm text-erreur">Le lien est invalide ou a expiré.</p>}
      {sp.erreur === "google" && <p className="mb-4 text-sm text-erreur">La connexion avec Google n&apos;est pas disponible pour le moment. Utilisez votre adresse e-mail.</p>}
      {sp.erreur === "google-annule" && <p className="mb-4 text-sm text-erreur">Connexion Google annulée ou refusée.</p>}
      {sp.erreur === "limite" && <p className="mb-4 text-sm text-erreur">Trop de tentatives. Réessayez dans quelques minutes.</p>}
      {publicEnv.googleAuth && (
        <>
          <GoogleButton suite={typeof sp.suite === "string" ? sp.suite : ""} />
          <OrSeparator />
        </>
      )}
      <AuthForm action={signIn} submitLabel="Se connecter">
        <input type="hidden" name="suite" value={typeof sp.suite === "string" ? sp.suite : ""} />
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
      <p className="mt-6 text-center text-sm text-gris-700">
        Pas encore de compte ? <Link href="/inscription" className="font-semibold text-electrique-600 hover:underline">Créer un compte</Link>
      </p>
    </>
  );
}
