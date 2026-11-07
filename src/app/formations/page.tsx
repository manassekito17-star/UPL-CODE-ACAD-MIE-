import type { Metadata } from "next";
import { CourseCard } from "@/components/learning/course-card";
import { Container, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { listCourses } from "@/lib/content/repository";
import { getCourseProgressMap } from "@/lib/student";

export const metadata: Metadata = { title: "Formations" };

const CATEGORIES = [
  { id: "fondamentaux", title: "Fondamentaux" },
  { id: "programmation", title: "Langages de programmation" },
  { id: "web", title: "Développement web" },
] as const;

export default async function FormationsPage() {
  const user = await getCurrentUser();
  const [courses, progress] = await Promise.all([listCourses(), getCourseProgressMap(user)]);
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Les formations"
        subtitle="Chaque parcours précise son niveau, ses prérequis, ses objectifs et sa durée indicative. Commencez par l'algorithmique : c'est la base de tous les langages."
      />
      <Container className="space-y-12 py-10">
        {CATEGORIES.map((cat) => {
          const list = courses.filter((c) => c.category === cat.id);
          if (!list.length) return null;
          return (
            <section key={cat.id}>
              <h2 className="mb-4 text-xl font-bold text-nuit-900">{cat.title}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((c) => (
                  <CourseCard key={c.slug} course={c} progress={user ? (progress[c.slug] ?? 0) : undefined} />
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </>
  );
}
