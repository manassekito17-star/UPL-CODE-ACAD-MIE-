"use client";

import { Button } from "../ui";

/** Bouton d'envoi qui demande une confirmation explicite (suspension, réactivation…). */
export function ConfirmSubmit({ message, children, variant = "secondaire" }: { message: string; children: React.ReactNode; variant?: "secondaire" | "danger" }) {
  return (
    <Button
      size="sm"
      variant={variant}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
