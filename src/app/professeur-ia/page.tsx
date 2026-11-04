import type { Metadata } from "next";
import { TutorChat } from "@/components/tutor/tutor-chat";
import { Container, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Professeur IA" };

export default async function TutorPage() {
  await requireUser("/professeur-ia");
  return (
    <>
      <PageHeader
        eyebrow="Assistance pédagogique"
        title="Professeur IA"
        subtitle="Posez vos questions, collez un programme à expliquer ou une erreur à analyser, demandez un exercice d'entraînement ou une préparation d'évaluation. Le professeur vous guide sans faire le travail à votre place."
      />
      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <TutorChat className="h-[70dvh]" />
        <aside className="space-y-3 text-sm text-gris-700">
          <p className="font-semibold text-nuit-900">Conseils</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Choisissez votre niveau : le vocabulaire s&apos;adapte.</li>
            <li>Pour une explication de code, collez votre programme dans le message.</li>
            <li>Sur une page d&apos;exercice, le professeur voit votre code et l&apos;énoncé.</li>
            <li>Les exercices évalués ne reçoivent que des indices, jamais la solution complète.</li>
            <li>Vérifiez toujours les réponses : l&apos;IA peut se tromper.</li>
          </ul>
        </aside>
      </Container>
    </>
  );
}
