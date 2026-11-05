import Link from "next/link";
import { chapterCompleteness } from "@/content/completeness";
import type { Course, Lesson } from "@/content/types";
import { LEVEL_LABELS } from "@/content/types";
import type { ExerciseSummary } from "@/lib/content/repository";
import { toPublicQuiz } from "@/lib/content/repository";
import { runPseudocode, traceExecution } from "@/lib/pseudocode";
import { generateFlowcharts } from "@/lib/pseudocode/flowchart";
import { ExampleRunner } from "../learning/example-runner";
import { Markdown } from "../learning/markdown";
import { QuizBlock } from "../learning/quiz-block";
import { Badge, ButtonLink, Card } from "../ui";
import { LEVEL_TONES } from "../ui/labels";
import { CommentedAlgorithmView } from "./commented-algorithm";
import { CommonErrorsView } from "./common-errors";
import { CompletenessDetails } from "./completeness";
import { DefinitionsView } from "./definitions";
import { SolvedExerciseView } from "./solved-exercise";

const SECTIONS = [
  ["objectifs", "Objectifs"],
  ["cours", "Cours"],
  ["definitions", "Définitions"],
  ["exemples", "Exemples"],
  ["algorithmes", "Algorithmes commentés"],
  ["erreurs", "Erreurs fréquentes"],
  ["corriges", "Exercices corrigés"],
  ["exercices", "Exercices"],
  ["td", "TD"],
  ["projet", "Projet"],
  ["interrogation", "Interrogation"],
  ["evaluation", "Évaluation"],
  ["resume", "Résumé"],
] as const;

/** Sommaire du chapitre (ancres). */
export function ChapterToc() {
  return (
    <nav aria-label="Sommaire du chapitre" className="-mx-1 flex gap-1 overflow-x-auto pb-1 text-sm">
      {SECTIONS.map(([id, label]) => (
        <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-gris-200 bg-white px-3 py-1 text-gris-700 hover:border-electrique-400 hover:text-electrique-600">
          {label}
        </a>
      ))}
    </nav>
  );
}

function Section({ id, title, children, subtitle }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <div>
        <h2 className="text-xl font-bold text-nuit-900">{title}</h2>
        {subtitle && <p className="text-sm text-gris-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Chapitre complet de la Formation. Organigrammes, traces et messages
 * d'erreur sont produits ici, côté serveur, par l'interpréteur lui-même.
 */
export function ChapterSections({
  course,
  lesson,
  exercises,
  solved,
  validated,
}: {
  course: Course;
  lesson: Lesson;
  exercises: ExerciseSummary[];
  solved: Set<string>;
  validated: boolean;
}) {
  const p = lesson.pedagogy!;
  const web = course.language === "html" || course.language === "css";
  const pseudo = course.language === "pseudocode";
  const completeness = chapterCompleteness(lesson);
  const bySlug = new Map(exercises.map((e) => [e.slug, e]));

  const algos = p.commentedAlgorithms.map((a) => {
    const fc = a.showFlowchart ? generateFlowcharts(a.code) : null;
    const tr = a.showTrace ? traceExecution(a.code, a.stdin ?? "", 120) : null;
    return { algo: a, flowcharts: fc?.ok ? fc.charts : [], trace: tr?.trace ?? [], truncated: tr?.truncated ?? false, output: tr?.stdout ?? "" };
  });
  const errorMessages = p.commonErrors.map((e) => {
    if (!e.run) return null;
    const r = runPseudocode(e.wrong, e.stdin ?? "");
    if (r.error) return `${r.error.line ? `ligne ${r.error.line} : ` : ""}${r.error.message}`;
    return `aucune erreur signalée, mais la sortie est « ${r.stdout.trim()} »`;
  });

  const exerciseCard = (slug: string) => {
    const e = bySlug.get(slug);
    if (!e) return null;
    return (
      <Link key={slug} href={`/exercices/${slug}`} className="flex items-start justify-between gap-3 rounded-xl border border-gris-200 bg-white p-4 hover:border-electrique-400">
        <span>
          <span className="block font-semibold text-nuit-900">{e.title}</span>
          <span className="mt-2 flex flex-wrap gap-2">
            <Badge tone={LEVEL_TONES[e.difficulty]}>{LEVEL_LABELS[e.difficulty]}</Badge>
            <Badge>{e.points} pts</Badge>
            {e.isEvaluated && <Badge tone="nuit">Évalué</Badge>}
          </span>
        </span>
        {solved.has(slug) ? <span className="text-sm font-semibold text-succes">✓ Réussi</span> : <span className="text-sm text-electrique-600">Faire →</span>}
      </Link>
    );
  };

  return (
    <div className="space-y-10">
      <ChapterToc />
      {!completeness.complete && (
        <CompletenessDetails checks={completeness.checks} score={completeness.score} />
      )}

      <Section id="objectifs" title="Objectifs et compétences">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-electrique-600">À la fin du chapitre, vous saurez</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gris-700">{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-electrique-600">Compétences validées par l&apos;évaluation</h3>
            <ul className="space-y-1 text-sm text-gris-700">
              {p.competences.map((c) => <li key={c}>{validated ? "✅" : "○"} {c}</li>)}
            </ul>
            {lesson.prerequisites?.length ? <p className="mt-3 text-xs text-gris-500">Prérequis : {lesson.prerequisites.join(" ; ")}</p> : null}
          </Card>
        </div>
      </Section>

      <Section id="cours" title="Cours">
        <Markdown>{lesson.content}</Markdown>
      </Section>

      <Section id="definitions" title="Définitions" subtitle="À connaître par cœur : elles sont la base des évaluations.">
        <DefinitionsView definitions={p.definitions} />
      </Section>

      <Section id="exemples" title={web ? "Exemples et démonstrations" : "Exemples à exécuter"} subtitle={web ? "Affichez l'aperçu ici, ou ouvrez l'exemple dans UPL IDE pour le modifier." : "Exécutez ici, ou ouvrez l'exemple dans UPL IDE pour le modifier."}>
        <div className="space-y-4">
          {lesson.examples.map((ex, i) => <ExampleRunner key={i} example={ex} editorHref={`/editeur?exemple=${course.slug}/${lesson.slug}/${i}`} />)}
        </div>
      </Section>

      <Section
        id="algorithmes"
        title={pseudo ? "Algorithmes commentés ligne par ligne" : "Code commenté ligne par ligne"}
        subtitle={
          pseudo
            ? "Changez d'onglet pour voir l'organigramme et le tableau de suivi des variables, calculés par l'interpréteur."
            : web
              ? "Changez d'onglet pour voir le rendu réel de la page."
              : "Chaque ligne importante est expliquée."
        }
      >
        <div className="space-y-4">
          {algos.map((a, i) => (
            <CommentedAlgorithmView
              key={a.algo.title}
              algo={a.algo}
              flowcharts={a.flowcharts}
              trace={a.trace}
              traceTruncated={a.truncated}
              traceOutput={a.output}
              editorHref={`/editeur?algorithme=${course.slug}/${lesson.slug}/${i}`}
            />
          ))}
        </div>
      </Section>

      <Section id="erreurs" title="Erreurs fréquentes">
        <CommonErrorsView errors={p.commonErrors} messages={errorMessages} />
      </Section>

      <Section id="corriges" title="Exercices corrigés" subtitle="Cherchez d'abord par vous-même : la correction ne s'affiche qu'à votre demande.">
        <div className="grid gap-4 lg:grid-cols-2">
          {p.solvedExercises.map((s, i) => <SolvedExerciseView key={s.title} exercise={s} index={i + 1} />)}
        </div>
      </Section>

      <Section id="exercices" title="Exercices d'application" subtitle="Correction automatique ; le corrigé n'apparaît qu'après réussite (ou après plusieurs tentatives).">
        <div className="grid gap-3 sm:grid-cols-2">{(lesson.exerciseSlugs ?? []).map(exerciseCard)}</div>
      </Section>

      {p.td && (
        <Section id="td" title={p.td.title}>
          <Markdown className="text-sm">{p.td.instructions}</Markdown>
          <div className="grid gap-3 sm:grid-cols-2">{p.td.exerciseSlugs.map(exerciseCard)}</div>
        </Section>
      )}

      {p.project && (
        <Section id="projet" title={`Projet pratique — ${p.project.title}`} subtitle="Mettez en œuvre le chapitre dans une situation réaliste, étape par étape.">
          <Card className="space-y-4 p-5">
            <Markdown className="text-sm">{p.project.context}</Markdown>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-electrique-600">Étapes</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gris-700">
                {p.project.steps.map((st) => (
                  <li key={st}>{st}</li>
                ))}
              </ol>
            </div>
            {p.project.deliverables.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-electrique-600">À rendre</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gris-700">
                  {p.project.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
            {p.project.exerciseSlug && (
              <div>
                <p className="mb-2 text-sm text-gris-700">Le rendu final est vérifié automatiquement :</p>
                <div className="grid gap-3 sm:grid-cols-2">{exerciseCard(p.project.exerciseSlug)}</div>
              </div>
            )}
          </Card>
        </Section>
      )}

      {p.interrogation && (
        <Section id="interrogation" title="Interrogation" subtitle="Épreuve courte et minutée pour vérifier les acquis.">
          <QuizBlock quiz={toPublicQuiz(p.interrogation)} />
        </Section>
      )}

      {p.evaluation && (
        <Section id="evaluation" title="Évaluation finale du chapitre" subtitle={`Réussite à ${p.evaluation.passScore} % : elle valide le chapitre et ses compétences.`}>
          {validated && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">✓ Chapitre validé. Vous pouvez repasser l&apos;évaluation pour vous entraîner.</p>}
          <QuizBlock quiz={toPublicQuiz(p.evaluation)} />
        </Section>
      )}

      <Section id="resume" title="Résumé">
        <Card className="border-cyan-accent/40 bg-cyan-soft/30 p-5">
          <ul className="list-disc space-y-1 pl-5 text-sm text-nuit-800">{lesson.summary.map((s) => <li key={s}>{s}</li>)}</ul>
          <ButtonLink href={`/formations/${course.slug}/${lesson.slug}/resume`} variant="secondaire" size="sm" className="mt-4" prefetch={false}>
            ⬇ Télécharger le résumé (PDF)
          </ButtonLink>
        </Card>
      </Section>
    </div>
  );
}
