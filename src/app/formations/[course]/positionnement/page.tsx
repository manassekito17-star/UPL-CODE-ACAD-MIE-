import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizBlock } from "@/components/learning/quiz-block";
import { Container, Notice } from "@/components/ui";
import { LEVEL_NAMES } from "@/content/types";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getCourse, toPublicQuiz } from "@/lib/content/repository";
import { getLatestPlacement } from "@/lib/levels/server";

export async function generateMetadata({ params }: PageProps<"/formations/[course]/positionnement">): Promise<Metadata> {
  const course = await getCourse((await params).course);
  return { title: course ? `Positionnement — ${course.title}` : "Positionnement" };
}

export default async function PlacementPage({ params }: PageProps<"/formations/[course]/positionnement">) {
  const { course: slug } = await params;
  const [course, user] = await Promise.all([getCourse(slug), getCurrentUser()]);
  if (!course || (course.status !== "publie" && !isStaff(user)) || !course.placementTest) notFound();
  const last = await getLatestPlacement(user, course.id);

  return (
    <Container className="max-w-3xl space-y-5 py-10">
      <Link href={`/formations/${course.slug}`} className="text-sm text-electrique-600 hover:underline">
        ← {course.title}
      </Link>
      <h1 className="text-3xl font-extrabold text-nuit-900">Test de positionnement — {course.title}</h1>
      <p className="text-gris-700">
        Ce test comporte des questions des quatre niveaux. Un niveau est considéré acquis quand vous réussissez au moins 70 % de ses questions ; le test recommande le premier niveau non acquis. Les
        niveaux précédents sont alors « dispensés » : vous pouvez passer directement à l&apos;examen du niveau recommandé, et tous les chapitres restent accessibles pour réviser.
      </p>
      <Notice tone="info">
        Répondez sans aide : le but est de vous placer au bon niveau, pas d&apos;obtenir un bon score. Les bonnes réponses ne sont pas affichées.
      </Notice>
      {!user && (
        <Notice tone="alerte">
          Vous n&apos;êtes pas connecté : le niveau recommandé s&apos;affichera, mais ne sera pas enregistré.{" "}
          <Link href={`/connexion?suite=/formations/${course.slug}/positionnement`} className="underline">Se connecter</Link>
        </Notice>
      )}
      {last && (
        <p className="text-sm text-gris-700">
          Dernier résultat ({new Date(last.at).toLocaleDateString("fr-FR")}) : niveau {last.recommended} — {LEVEL_NAMES[last.recommended]}.
        </p>
      )}
      <QuizBlock quiz={toPublicQuiz(course.placementTest)} />
    </Container>
  );
}
