"use client";

import { useState, useTransition } from "react";
import { resendConfirmation } from "@/app/(auth)/actions";
import { inboxFor } from "@/lib/auth-mail/inbox";

/**
 * Après l'envoi d'un e-mail (confirmation, réinitialisation) : bouton qui ouvre
 * la boîte de réception du fournisseur de l'utilisateur et, pour l'inscription,
 * renvoi de l'e-mail de confirmation.
 */
export function OpenInbox({ email, mail }: { email: string; mail?: "inscription" | "reinitialisation" }) {
  const inbox = inboxFor(email);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="space-y-3" data-testid="ouvrir-boite">
      <p className="text-sm text-gris-700">
        E-mail envoyé à <strong className="text-nuit-900">{email}</strong>. Pensez à regarder dans « Spam » ou « Promotions ».
      </p>
      {inbox ? (
        <a href={inbox.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg bg-electrique-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-electrique-500">
          ✉ Ouvrir ma boîte {inbox.provider}
        </a>
      ) : (
        <p className="text-sm text-gris-700">Ouvrez votre messagerie habituelle pour cliquer sur le lien reçu.</p>
      )}
      {mail === "inscription" && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await resendConfirmation(email);
              setMessage(r.message);
            })
          }
          className="w-full rounded-lg border border-gris-200 px-4 py-2 text-sm font-semibold text-nuit-900 hover:bg-gris-50 disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Je n'ai rien reçu : renvoyer l'e-mail"}
        </button>
      )}
      {message && <p className="text-sm text-gris-700" role="status">{message}</p>}
    </div>
  );
}
