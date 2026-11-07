"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/app/admin/actions";
import { Button, Notice } from "../ui";

export function ActionForm({ action, submitLabel = "Enregistrer", children, className }: { action: (prev: ActionState, form: FormData) => Promise<ActionState>; submitLabel?: string; children: ReactNode; className?: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className ?? "space-y-4"}>
      {children}
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      {state.success && <Notice tone="succes">{state.success}</Notice>}
      <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : submitLabel}</Button>
    </form>
  );
}
