import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExerciseWorkspace } from "@/components/learning/exercise-workspace";
import { Container } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getPublicExercise } from "@/lib/content/repository";
import { isSupabaseConfigured } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/exercices/[slug]">): Promise<Metadata> {
  const e = await getPublicExercise((await params).slug);
  return { title: e?.title ?? "Exercice" };
}

export default async function ExercisePage({ params }: PageProps<"/exercices/[slug]">) {
  const { slug } = await params;
  const [exercise, user] = await Promise.all([getPublicExercise(slug), getCurrentUser()]);
  if (!exercise) notFound();
  return (
    <Container className="max-w-[96rem] py-6">
      <p className="mb-3 text-sm text-gris-500">
        <Link href="/exercices" className="hover:text-electrique-600">Exercices</Link>
        {exercise.lessonSlug && (
          <>
            {" · "}
            <Link href={`/formations/${exercise.courseSlug}/${exercise.lessonSlug}`} className="hover:text-electrique-600">
              Revoir la leçon
            </Link>
          </>
        )}
      </p>
      <ExerciseWorkspace exercise={exercise} loggedIn={Boolean(user)} authRequired={isSupabaseConfigured()} />
    </Container>
  );
}
