import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, inputClass } from "@/components/ui";
import { updatePassword } from "../actions";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ResetPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-nuit-900">Choisir un nouveau mot de passe</h1>
      <p className="mb-6 mt-1 text-sm text-gris-700">8 caractères minimum, avec au moins une lettre et un chiffre.</p>
      <AuthForm action={updatePassword} submitLabel="Enregistrer le mot de passe">
        <Field label="Nouveau mot de passe" htmlFor="password">
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
        </Field>
        <Field label="Confirmer" htmlFor="confirm">
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
        </Field>
      </AuthForm>
    </>
  );
}
