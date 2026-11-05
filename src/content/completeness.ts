import type { Lesson } from "./types";

/**
 * Vérifie les 12 composantes exigées pour un chapitre de la Formation.
 * Utilisé par les tests (un chapitre déclaré complet doit l'être réellement)
 * et affiché aux étudiants et aux enseignants (état d'avancement honnête).
 */
export interface ComponentCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

const nonEmptyLines = (code: string) => code.split("\n").filter((l) => l.trim() && !/^\s*(\/\/|#)/.test(l)).length;

export function chapterCompleteness(lesson: Lesson): { checks: ComponentCheck[]; score: number; complete: boolean } {
  const p = lesson.pedagogy;
  const sections = (lesson.content.match(/^## /gm) ?? []).length;
  const commented = p?.commentedAlgorithms ?? [];
  const wellCommented = commented.filter((a) => Object.keys(a.comments).length >= Math.ceil(nonEmptyLines(a.code) * 0.5));
  const checks: ComponentCheck[] = [
    { id: "objectifs", label: "Objectifs pédagogiques", ok: lesson.objectives.length >= 2, detail: `${lesson.objectives.length} objectif(s)` },
    { id: "cours", label: "Cours complet et détaillé", ok: lesson.content.length >= 3000 && sections >= 4, detail: `${lesson.content.length} caractères, ${sections} sections` },
    { id: "definitions", label: "Définitions simples et rigoureuses", ok: (p?.definitions.length ?? 0) >= 3, detail: `${p?.definitions.length ?? 0} définition(s)` },
    { id: "progression", label: "Explications progressives", ok: sections >= 4, detail: `${sections} sections` },
    { id: "exemples", label: "Exemples pratiques exécutables", ok: lesson.examples.length >= 1, detail: `${lesson.examples.length} exemple(s)` },
    { id: "commentes", label: "Algorithmes commentés ligne par ligne", ok: wellCommented.length >= 1, detail: `${wellCommented.length}/${commented.length} commenté(s) à au moins 50 %` },
    {
      id: "schemas",
      label: "Schémas et illustrations",
      ok: commented.some((a) => a.showFlowchart || a.showTrace),
      detail: commented.some((a) => a.showFlowchart) ? "organigramme et/ou tableau de suivi" : "aucun",
    },
    { id: "corriges", label: "Exercices corrigés", ok: (p?.solvedExercises.length ?? 0) >= 2, detail: `${p?.solvedExercises.length ?? 0} exercice(s)` },
    { id: "sans-correction", label: "Exercices sans correction immédiate", ok: (lesson.exerciseSlugs?.length ?? 0) >= 1, detail: `${lesson.exerciseSlugs?.length ?? 0} exercice(s) noté(s)` },
    {
      id: "td",
      label: "TD et interrogation",
      ok: (p?.td?.exerciseSlugs.length ?? 0) >= 2 && (p?.interrogation?.questions.length ?? 0) >= 4,
      detail: `TD : ${p?.td?.exerciseSlugs.length ?? 0} exercice(s) · interrogation : ${p?.interrogation?.questions.length ?? 0} question(s)`,
    },
    { id: "evaluation", label: "Évaluation finale du chapitre", ok: (p?.evaluation?.questions.length ?? 0) >= 6, detail: `${p?.evaluation?.questions.length ?? 0} question(s)` },
    { id: "resume", label: "Résumé téléchargeable en PDF", ok: lesson.summary.length >= 3, detail: `${lesson.summary.length} point(s) à retenir` },
  ];
  const ok = checks.filter((c) => c.ok).length;
  return { checks, score: Math.round((ok / checks.length) * 100), complete: ok === checks.length };
}
