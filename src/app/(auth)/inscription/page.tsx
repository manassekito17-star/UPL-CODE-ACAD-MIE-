import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, inputClass } from "@/components/ui";
import { GoogleButton, OrSeparator } from "@/components/auth/google-button";
import { publicEnv } from "@/lib/env";
import { QuickAccessForm } from "@/components/auth/quick-access-form";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-nuit-900">Créer un compte étudiant</h1>
      <p className="mb-6 mt-1 text-sm text-gris-700">Rejoignez {BRAND.name} gratuitement. Suivez votre progression, enregistrez vos programmes et accédez au professeur IA.</p>
      <section aria-labelledby="option-google" className="space-y-2">
        <h2 id="option-google" className="text-sm font-semibold uppercase tracking-wide text-gris-500">Option A — Continuer avec Google</h2>
        {publicEnv.googleAuth ? <GoogleButton /> : <p className="text-sm text-gris-700">La connexion Google n&apos;est pas configurée sur cette installation.</p>}
        <p className="text-xs text-gris-500">Recommandé : vous retrouvez votre compte et vos projets sur tous vos appareils.</p>
      </section>
      <OrSeparator label="ou" />
      <section aria-labelledby="option-rapide" className="space-y-3" data-testid="inscription-acces-rapide">
        <h2 id="option-rapide" className="text-sm font-semibold uppercase tracking-wide text-gris-500">Option B — Accès rapide avec un profil</h2>
        <p className="text-sm text-gris-700">Sans adresse e-mail ni mot de passe : nom, prénom, photo, poste, sexe et filière.</p>
        <QuickAccessForm />
      </section>
      <section aria-labelledby="option-email" className="mt-8 rounded-lg border border-gris-200 p-4">
        <h2 id="option-email" className="mb-3 text-sm font-semibold text-nuit-900">Option C — Créer un compte avec e-mail et mot de passe</h2>
      <AuthForm action={signUp} submitLabel="Créer mon compte">
        <Field label="Nom complet" htmlFor="fullName">
          <input id="fullName" name="fullName" autoComplete="name" required maxLength={120} className={inputClass} />
        </Field>
        <Field label="Adresse e-mail" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field label="Mot de passe" htmlFor="password" hint="8 caractères minimum, avec au moins une lettre et un chiffre.">
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
        </Field>
        <Field label="Confirmer le mot de passe" htmlFor="confirm">
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
        </Field>
        <label className="flex items-start gap-2 text-sm text-gris-700">
          <input type="checkbox" name="terms" required className="mt-1" />
          <span>J&apos;accepte que mes données (nom, e-mail, progression) soient utilisées uniquement pour mon suivi pédagogique sur la plateforme.</span>
        </label>
      </AuthForm>
      </section>
      <p className="mt-6 text-center text-sm text-gris-700">
        Déjà inscrit ? <Link href="/connexion" className="font-semibold text-electrique-600 hover:underline">Se connecter</Link>
      </p>
    </>
  );
}
