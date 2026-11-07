import type { Metadata } from "next";
import Link from "next/link";
import { IdeShell } from "@/components/ide/ide-shell";
import type { IdeProject } from "@/components/ide/use-project";
import { Container, Notice } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { templateById } from "@/lib/ide/templates";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "UPL IDE",
  description: "Environnement de développement : projets à dossiers, onglets, vue fractionnée, exécution, aperçu web et historique des versions.",
};

export default async function IdePage({ searchParams }: PageProps<"/ide">) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const id = typeof sp.projet === "string" && /^[0-9a-f-]{36}$/.test(sp.projet) ? sp.projet : null;

  let initial: IdeProject | null = null;
  if (id && user) {
    const supabase = await createClient();
    // RLS : seuls les projets de l'étudiant connecté sont lisibles.
    const { data } = await supabase.from("projects").select("id, name, revision, files, folders, updated_at").eq("id", id).maybeSingle();
    if (data) initial = { id: data.id, name: data.name, revision: data.revision, files: data.files, folders: data.folders, updatedAt: data.updated_at };
    else
      return (
        <Container className="py-12">
          <Notice tone="erreur">Projet introuvable. <Link href="/ide" className="underline">Ouvrir UPL IDE</Link></Notice>
        </Container>
      );
  }
  if (id && !user) {
    return (
      <Container className="py-12">
        <Notice tone="info">
          <Link href={`/connexion?suite=/ide?projet=${id}`} className="underline">Connectez-vous</Link> pour ouvrir ce projet.
        </Notice>
      </Container>
    );
  }
  if (!initial) {
    // Projet local (navigateur) : modèle web de départ ; le brouillon local éventuel est restauré côté client.
    const tpl = templateById("web")!;
    initial = { id: null, name: "Projet local", revision: 0, files: tpl.files, folders: tpl.folders ?? [] };
  }
  return <IdeShell key={initial.id ?? "local"} initial={initial} loggedIn={Boolean(user)} userName={user?.fullName ?? null} />;
}
