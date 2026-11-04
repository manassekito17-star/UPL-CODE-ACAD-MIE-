import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, inputClass } from "@/components/ui";
import { requestPasswordReset } from "../actions";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-nuit-900">Mot de passe oublié</h1>
      <p className="mb-6 mt-1 text-sm text-gris-700">Saisissez votre adresse : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      <AuthForm action={requestPasswordReset} submitLabel="Envoyer le lien">
        <Field label="Adresse e-mail" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
      </AuthForm>
      <p className="mt-6 text-center text-sm"><Link href="/connexion" className="text-electrique-600 hover:underline">Retour à la connexion</Link></p>
    </>
  );
}
