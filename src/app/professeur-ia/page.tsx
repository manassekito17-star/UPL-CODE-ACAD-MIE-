import type { Metadata } from "next";
import { TutorChat } from "@/components/tutor/tutor-chat";
import { Container, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listCourses } from "@/lib/content/repository";

export const metadata: Metadata = { title: "Professeur IA" };

export default async function TutorPage({ searchParams }: PageProps<"/professeur-ia">) {
  await requireUser("/professeur-ia");
  const sp = await searchParams;
  const courses = (await listCourses()).filter((c) => c.status === "publie");
  const selected = courses.find((c) => c.slug === sp.parcours);
  return (
    <>
      <PageHeader
        eyebrow="Assistance pédagogique"
        title="Professeur IA"
        subtitle="Posez vos questions, collez un programme à expliquer ou une erreur à analyser, demandez un exercice d'entraînement ou une préparation d'évaluation. Le professeur vous guide sans faire le travail à votre place."
      />
      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-3">
          <form method="get" className="flex flex-wrap items-center gap-2 text-sm">
            <label htmlFor="parcours" className="font-semibold text-nuit-900">Parcours :</label>
            <select id="parcours" name="parcours" defaultValue={selected?.slug ?? ""} className="h-9 rounded-md border border-gris-200 bg-white px-2">
              <option value="">Tous (professeur généraliste)</option>
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
            <button type="submit" className="h-9 rounded-md border border-gris-200 px-3 hover:border-electrique-400">Choisir</button>
          </form>
          <TutorChat
            key={selected?.slug ?? "general"}
            className="h-[70dvh]"
            baseContext={selected ? { courseSlug: selected.slug, language: selected.language } : undefined}
            intro={selected ? `Je suis le professeur du parcours « ${selected.title} » : je connais ses quatre niveaux, ses chapitres et votre progression. Que voulez-vous travailler ?` : undefined}
          />
        </div>
        <aside className="space-y-3 text-sm text-gris-700">
          <p className="font-semibold text-nuit-900">Conseils</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Choisissez un parcours : le professeur s&apos;appuie sur son programme et sur votre niveau mesuré (positionnement, niveaux validés).</li>
            <li>Modes : enseigner une notion, vous interroger, accompagner un projet, expliquer du code, analyser une erreur, donner un indice.</li>
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
