import type { Metadata } from "next";
import { Card, Container, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { formatDuration } from "@/components/ui/labels";
import { requireUser } from "@/lib/auth";
import { isLanguageId, LANGUAGES } from "@/lib/execution/languages";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ma progression" };

export default async function ProgressPage() {
  const user = await requireUser("/progression");
  const supabase = await createClient();
  const [{ data: courses }, { data: lessons }, { data: subs }, { data: quizzes }] = await Promise.all([
    supabase.from("course_progress").select("percent, completed_lessons, total_lessons, courses(title, language_id)").eq("user_id", user.id),
    supabase.from("lesson_progress").select("status, time_spent_seconds, courses(language_id)").eq("user_id", user.id),
    supabase.from("submissions").select("status, score, exercises(slug, title, language_id, difficulty)").eq("user_id", user.id),
    supabase.from("quiz_attempts").select("score, passed, quizzes(title)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);

  // Statistiques par langage
  const byLang = new Map<string, { started: number; done: number; seconds: number; success: number; fail: number; attempts: number; best: Map<string, number>; titles: Map<string, string> }>();
  const get = (l: string) => {
    if (!byLang.has(l)) byLang.set(l, { started: 0, done: 0, seconds: 0, success: 0, fail: 0, attempts: 0, best: new Map(), titles: new Map() });
    return byLang.get(l)!;
  };
  for (const l of lessons ?? []) {
    const s = get((l.courses as unknown as { language_id: string }).language_id);
    s.started++;
    if (l.status === "termine") s.done++;
    s.seconds += l.time_spent_seconds;
  }
  for (const sub of subs ?? []) {
    const e = sub.exercises as unknown as { slug: string; title: string; language_id: string };
    const s = get(e.language_id);
    s.attempts++;
    s.titles.set(e.slug, e.title);
    s.best.set(e.slug, Math.max(s.best.get(e.slug) ?? 0, Number(sub.score)));
  }
  for (const s of byLang.values()) {
    for (const v of s.best.values()) {
      if (v >= 100) s.success++;
      else s.fail++;
    }
  }
  const mastered = [...byLang.values()].flatMap((s) => [...s.best.entries()].filter(([, v]) => v >= 100).map(([k]) => s.titles.get(k)!));
  const toImprove = [...byLang.values()].flatMap((s) => [...s.best.entries()].filter(([, v]) => v < 100).map(([k, v]) => `${s.titles.get(k)} (${v} %)`));

  return (
    <>
      <PageHeader title="Ma progression" subtitle="Cours commencés et terminés, exercices réussis et échoués, temps d'apprentissage et compétences par langage." />
      <Container className="space-y-8 py-8">
        <section>
          <h2 className="mb-3 text-lg font-bold text-nuit-900">Par parcours</h2>
          {!courses?.length ? (
            <EmptyState title="Aucun parcours commencé." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c, i) => {
                const co = c.courses as unknown as { title: string };
                return (
                  <Card key={i} className="p-5">
                    <p className="font-semibold text-nuit-900">{co.title}</p>
                    <ProgressBar className="mt-3" value={Number(c.percent)} />
                    <p className="mt-1 text-xs text-gris-500">{c.completed_lessons}/{c.total_lessons} leçons · {Math.round(Number(c.percent))} %</p>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold text-nuit-900">Par langage</h2>
          <div className="overflow-x-auto rounded-xl border border-gris-200 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gris-50 text-left text-xs uppercase text-gris-500">
                <tr><th className="px-4 py-2">Langage</th><th className="px-4 py-2">Leçons commencées</th><th className="px-4 py-2">Terminées</th><th className="px-4 py-2">Exercices réussis</th><th className="px-4 py-2">Non réussis</th><th className="px-4 py-2">Tentatives</th><th className="px-4 py-2">Temps</th></tr>
              </thead>
              <tbody>
                {[...byLang.entries()].map(([l, s]) => (
                  <tr key={l} className="border-t border-gris-100">
                    <td className="px-4 py-2 font-medium">{isLanguageId(l) ? LANGUAGES[l].shortLabel : l}</td>
                    <td className="px-4 py-2">{s.started}</td><td className="px-4 py-2">{s.done}</td>
                    <td className="px-4 py-2 text-succes">{s.success}</td><td className="px-4 py-2 text-erreur">{s.fail}</td>
                    <td className="px-4 py-2">{s.attempts}</td><td className="px-4 py-2">{formatDuration(Math.round(s.seconds / 60))}</td>
                  </tr>
                ))}
                {byLang.size === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-gris-500">Pas encore de données.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">✅ Compétences maîtrisées</h2>
            {mastered.length ? <ul className="list-disc space-y-1 pl-5 text-sm">{mastered.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="text-sm text-gris-500">Réussissez des exercices pour les voir ici.</p>}
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">🎯 À améliorer</h2>
            {toImprove.length ? <ul className="list-disc space-y-1 pl-5 text-sm">{toImprove.map((m) => <li key={m}>{m}</li>)}</ul> : <p className="text-sm text-gris-500">Rien à signaler.</p>}
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">📝 Derniers quiz</h2>
            {quizzes?.length ? (
              <ul className="space-y-1 text-sm">
                {quizzes.map((q, i) => <li key={i} className="flex justify-between gap-2"><span className="truncate">{(q.quizzes as unknown as { title: string }).title}</span><span className={q.passed ? "text-succes" : "text-erreur"}>{Number(q.score)} %</span></li>)}
              </ul>
            ) : <p className="text-sm text-gris-500">Aucun quiz passé.</p>}
          </Card>
        </div>
      </Container>
    </>
  );
}
