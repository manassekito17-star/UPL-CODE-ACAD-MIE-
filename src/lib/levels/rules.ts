import { recommendedLevel } from "@/content/levels/build";
import type { Course, Lesson, LevelDefinition, LevelNumber, Quiz } from "@/content/types";

/**
 * Règles de passage de niveau (fonctions pures, partagées par le serveur,
 * l'interface et les tests).
 *
 * Un niveau est validé quand :
 *  - au moins `chaptersValidatedPct` % de ses chapitres publiés sont validés
 *    (chaque chapitre se valide par son évaluation) ;
 *  - l'examen de fin de niveau est réussi avec au moins `examPassScore` %.
 * Un niveau sans examen publié ne peut pas encore être validé.
 * Le contenu reste consultable librement ; seul l'examen du niveau N+1 est
 * verrouillé tant que le niveau N n'est ni validé ni dispensé.
 */

export type LevelStatus = "valide" | "dispense" | "en_cours" | "verrouille" | "au_programme";

export interface LevelFacts {
  /** Chapitres validés (slugs). */
  validatedLessons: Set<string>;
  /** Meilleur score à l'examen de chaque niveau. */
  examBest: Partial<Record<LevelNumber, number>>;
  /** Statut enregistré en base (valide / dispense). */
  recorded: Partial<Record<LevelNumber, "valide" | "dispense" | "en_cours">>;
}

export interface LevelState {
  number: LevelNumber;
  status: LevelStatus;
  lessons: Lesson[];
  validatedCount: number;
  chaptersPct: number;
  chaptersOk: boolean;
  examBest: number | null;
  examOk: boolean;
  /** L'examen de ce niveau peut être passé (niveau précédent acquis). */
  examUnlocked: boolean;
  /** Critères atteints (le serveur peut enregistrer la validation). */
  criteriaMet: boolean;
  /** Ce qui manque encore, en clair. */
  missing: string[];
}

export function levelLessons(course: Course, n: LevelNumber): Lesson[] {
  return course.modules.filter((m) => m.level === n).flatMap((m) => m.lessons.filter((l) => l.status === "publie"));
}

export function evaluateLevel(course: Course, level: LevelDefinition, facts: LevelFacts, previousAcquired: boolean): LevelState {
  const lessons = levelLessons(course, level.number);
  const validatedCount = lessons.filter((l) => facts.validatedLessons.has(l.slug)).length;
  const chaptersPct = lessons.length ? Math.round((validatedCount / lessons.length) * 100) : 0;
  const chaptersOk = lessons.length > 0 && chaptersPct >= level.criteria.chaptersValidatedPct;
  const examBest = facts.examBest[level.number] ?? null;
  const examOk = Boolean(level.exam) && examBest !== null && examBest >= level.criteria.examPassScore;
  const criteriaMet = chaptersOk && examOk;
  const missing: string[] = [];
  if (!lessons.length) missing.push("Les chapitres de ce niveau sont au programme et pas encore publiés.");
  else if (!chaptersOk) {
    const needed = Math.ceil((level.criteria.chaptersValidatedPct / 100) * lessons.length);
    missing.push(`Valider ${needed - validatedCount} chapitre(s) de plus (${validatedCount}/${lessons.length}, objectif ${level.criteria.chaptersValidatedPct} %).`);
  }
  if (!level.exam) missing.push("L'examen de fin de niveau n'est pas encore publié.");
  else if (!examOk) missing.push(`Réussir l'examen de fin de niveau avec au moins ${level.criteria.examPassScore} %${examBest !== null ? ` (meilleur score : ${examBest} %)` : ""}.`);

  const recorded = facts.recorded[level.number];
  let status: LevelStatus;
  if (recorded === "valide") status = "valide";
  else if (recorded === "dispense") status = "dispense";
  else if (!lessons.length && !level.exam) status = "au_programme";
  else if (!previousAcquired) status = "verrouille";
  else status = "en_cours";
  return {
    number: level.number,
    status,
    lessons,
    validatedCount,
    chaptersPct,
    chaptersOk,
    examBest,
    examOk,
    examUnlocked: Boolean(level.exam) && previousAcquired,
    criteriaMet,
    missing: status === "valide" || status === "dispense" ? [] : missing,
  };
}

/** États des quatre niveaux, dans l'ordre. */
export function levelStates(course: Course, facts: LevelFacts): LevelState[] {
  const out: LevelState[] = [];
  let previousAcquired = true;
  for (const level of [...(course.levels ?? [])].sort((a, b) => a.number - b.number)) {
    const s = evaluateLevel(course, level, facts, previousAcquired);
    out.push(s);
    previousAcquired = s.status === "valide" || s.status === "dispense";
  }
  return out;
}

/** Niveau courant : le premier niveau ni validé ni dispensé. */
export function currentLevel(states: LevelState[]): LevelNumber {
  return states.find((s) => s.status !== "valide" && s.status !== "dispense")?.number ?? 4;
}

/** Correction d'un test de positionnement : score par niveau et niveau recommandé. */
export function scorePlacement(quiz: Quiz, answers: Record<string, number[]>) {
  const scores: Partial<Record<LevelNumber, { good: number; total: number }>> = {};
  for (const q of quiz.questions) {
    if (!q.level) continue;
    const given = [...new Set(answers[q.id ?? ""] ?? [])].sort();
    const expected = [...q.correct].sort();
    const ok = given.length === expected.length && given.every((v, i) => v === expected[i]);
    const s = (scores[q.level] ??= { good: 0, total: 0 });
    s.total++;
    if (ok) s.good++;
  }
  return { scores, recommended: recommendedLevel(scores) };
}

export const LEVEL_STATUS_LABELS: Record<LevelStatus, string> = {
  valide: "Niveau validé",
  dispense: "Dispensé (positionnement)",
  en_cours: "En cours",
  verrouille: "Examen verrouillé",
  au_programme: "Au programme",
};
