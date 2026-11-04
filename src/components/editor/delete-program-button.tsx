"use client";

import { useRouter } from "next/navigation";

export function DeleteProgramButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      className="text-sm text-gris-500 hover:text-erreur"
      onClick={async () => {
        if (!confirm("Supprimer définitivement ce programme ?")) return;
        await fetch(`/api/programs/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Supprimer
    </button>
  );
}
