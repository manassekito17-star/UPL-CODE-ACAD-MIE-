"use client";

import { useActionState, type ReactNode } from "react";
import type { AuthState } from "@/app/(auth)/actions";
import { Button, Notice } from "../ui";
import { OpenInbox } from "./open-inbox";

export function AuthForm({ action, submitLabel, children }: { action: (prev: AuthState, form: FormData) => Promise<AuthState>; submitLabel: string; children: ReactNode }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      {state.error && state.inbox && <OpenInbox email={state.inbox} mail={state.mail} />}
      {state.success ? (
        <>
          <Notice tone="succes">{state.success}</Notice>
          {state.inbox && <OpenInbox email={state.inbox} mail={state.mail} />}
        </>
      ) : (
        <>
          {children}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Veuillez patienter…" : submitLabel}
          </Button>
        </>
      )}
    </form>
  );
}
