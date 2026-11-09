"use client";

import { useActionState, useState, useTransition } from "react";
import { Button, Notice, inputClass } from "@/components/ui";
import { confirmTotp, enrollTotp, verifyMfa, type MfaState } from "./actions";

function CodeInput() {
  return <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required placeholder="123456" aria-label="Code à 6 chiffres" className={`${inputClass} mt-1 text-center font-mono text-xl tracking-[0.4em]`} />;
}

/** Saisie du code à la connexion. */
export function MfaCodeForm() {
  const [state, action, pending] = useActionState<MfaState, FormData>(verifyMfa, {});
  return (
    <form action={action} className="mt-4 space-y-3" data-testid="form-verification-mfa">
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      <CodeInput />
      <Button className="w-full" disabled={pending}>{pending ? "Vérification…" : "Valider"}</Button>
    </form>
  );
}

/** Activation : QR code puis premier code. */
export function MfaEnroll() {
  const [enrolled, setEnrolled] = useState<MfaState | null>(null);
  const [pending, start] = useTransition();
  const [state, action, confirming] = useActionState<MfaState, FormData>(confirmTotp, {});
  if (state.success) return <Notice tone="succes">{state.success}</Notice>;
  if (!enrolled?.factorId) {
    return (
      <div className="space-y-2" data-testid="mfa-activation">
        {enrolled?.error && <Notice tone="erreur">{enrolled.error}</Notice>}
        <Button disabled={pending} onClick={() => start(async () => setEnrolled(await enrollTotp()))}>{pending ? "Préparation…" : "Activer le second facteur"}</Button>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-3" data-testid="mfa-activation">
      <p className="text-sm text-gris-700">1. Scannez ce QR code avec votre application d&apos;authentification (Google Authenticator, Microsoft Authenticator…).</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={enrolled.qr} alt="QR code à scanner" className="h-48 w-48 rounded border border-gris-200 bg-white p-2" />
      <p className="text-xs text-gris-500">
        Impossible de scanner ? Saisissez cette clé dans l&apos;application : <code className="break-all font-mono" data-testid="mfa-secret">{enrolled.secret}</code>
      </p>
      <p className="text-sm text-gris-700">2. Saisissez le code à 6 chiffres affiché par l&apos;application :</p>
      <input type="hidden" name="factorId" value={enrolled.factorId} />
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      <CodeInput />
      <Button disabled={confirming}>{confirming ? "Vérification…" : "Confirmer l'activation"}</Button>
    </form>
  );
}
