import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Container, EmptyState, PageHeader } from "@/components/ui";
import { LEVEL_TONES } from "@/components/ui/labels";
import { EXERCISE_TYPE_LABELS, LEVEL_LABELS, type Level } from "@/content/types";
import { getCurrentUser } from "@/lib/auth";
import { listCourses, listExercises } from "@/lib/content/repository";
import { LANGUAGES } from "@/lib/execution/languages";
import { getSolvedExercises } from "@/lib/student";

export const metadata: Metadata = { title: "Exercices" };

export default async function ExercicesPage({ searchParams }: PageProps<"/exercices">) {
  const sp = await searchParams;
  const parcours = typeof sp.parcours === "string" ? sp.parcours : undefined;
  const niveau = typeof sp.niveau === "string" ? (sp.niveau as Level) : undefined;
  const user = await getCurrentUser();
  const [all, courses, solved] = await Promise.all([listExercises(), listCourses(), getSolvedExercises(user)]);
  const list = all.filter((e) => (!parcours || e.courseSlug === parcours) && (!niveau || e.difficulty === niveau));
  const filterHref = (p?: string, n?: string) => {
    const q = new URLSearchParams();
    if (p) q.set("parcours", p);
    if (n) q.set("niveau", n);
    const s = q.toString();
    return `/exercices${s ? `?${s}` : ""}`;
  };
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? "border-electrique-500 bg-electrique-100 text-electrique-600" : "border-gris-200 bg-white text-gris-700 hover:border-electrique-400"}`;

  return (
    <>
      <PageHeader eyebrow="Pratique" title="Exercices" subtitle="Écrivez votre solution, soumettez-la et obtenez une correction automatique. Les exercices sont classés en débutant, intermédiaire et avancé.">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Link href={filterHref(undefined, niveau)} className={chip(!parcours)}>Tous les parcours</Link>
            {courses.map((c) => (
              <Link key={c.slug} href={filterHref(c.slug, niveau)} className={chip(parcours === c.slug)}>{c.title}</Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={filterHref(parcours)} className={chip(!niveau)}>Tous niveaux</Link>
            {(["debutant", "intermediaire", "avance"] as const).map((n) => (
              <Link key={n} href={filterHref(parcours, n)} className={chip(niveau === n)}>{LEVEL_LABELS[n]}</Link>
            ))}
          </div>
        </div>
      </PageHeader>
      <Container className="py-8">
        {list.length === 0 ? (
          <EmptyState title="Aucun exercice pour ces filtres." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <Link key={e.slug} href={`/exercices/${e.slug}`} className="flex flex-col rounded-xl border border-gris-200 bg-white p-4 hover:border-electrique-400 hover:shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-nuit-900">{e.title}</p>
                  {solved.has(e.slug) && <span className="text-sm text-succes" title="Réussi">✓</span>}
                </div>
                <p className="mt-1 text-xs text-gris-500">{EXERCISE_TYPE_LABELS[e.type]}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={LEVEL_TONES[e.difficulty]}>{LEVEL_LABELS[e.difficulty]}</Badge>
                  <Badge tone="bleu">{LANGUAGES[e.language].shortLabel}</Badge>
                  <Badge>{e.points} pts</Badge>
                  {e.isEvaluated && <Badge tone="nuit">Évalué</Badge>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
