import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, inputClass } from "@/components/ui";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-nuit-900">Créer un compte étudiant</h1>
      <p className="mb-6 mt-1 text-sm text-gris-700">Rejoignez {BRAND.name} gratuitement. Suivez votre progression, enregistrez vos programmes et accédez au professeur IA.</p>
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
      <p className="mt-6 text-center text-sm text-gris-700">
        Déjà inscrit ? <Link href="/connexion" className="font-semibold text-electrique-600 hover:underline">Se connecter</Link>
      </p>
    </>
  );
}
