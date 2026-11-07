import type { Course, LevelCriteria, LevelDefinition, LevelNumber, Module, Quiz, QuizQuestion } from "../types";
import { quiz } from "../helpers";

export const DEFAULT_CRITERIA: LevelCriteria = { chaptersValidatedPct: 100, examPassScore: 70 };

export interface ModulePlan {
  slug: string;
  title: string;
  description?: string;
  lessons: string[];
}

export interface LevelPlan {
  number: LevelNumber;
  title: string;
  description: string;
  objectives: string[];
  modules: ModulePlan[];
  plannedChapters?: string[];
  exam?: Quiz;
  criteria?: LevelCriteria;
}

/**
 * Réorganise un parcours en quatre niveaux à partir de ses leçons existantes.
 * Chaque leçon doit être placée exactement une fois (vérifié ici et par les tests).
 */
export function withLevels(course: Course, plans: LevelPlan[], placementTest?: Quiz): Course {
  const lessons = new Map(course.modules.flatMap((m) => m.lessons).map((l) => [l.slug, l]));
  const used = new Set<string>();
  const modules: Module[] = [];
  const levels: LevelDefinition[] = [];
  for (const plan of plans) {
    for (const mp of plan.modules) {
      const original = course.modules.find((m) => m.slug === mp.slug);
      modules.push({
        slug: mp.slug,
        title: mp.title,
        description: mp.description ?? original?.description,
        level: plan.number,
        lessons: mp.lessons.map((s) => {
          const l = lessons.get(s);
          if (!l) throw new Error(`${course.slug} : leçon inconnue ${s}`);
          if (used.has(s)) throw new Error(`${course.slug} : leçon placée deux fois ${s}`);
          used.add(s);
          return l;
        }),
      });
    }
    levels.push({
      number: plan.number,
      title: plan.title,
      description: plan.description,
      objectives: plan.objectives,
      moduleSlugs: plan.modules.map((m) => m.slug),
      plannedChapters: plan.plannedChapters ?? [],
      criteria: plan.criteria ?? DEFAULT_CRITERIA,
      exam: plan.exam ? { ...plan.exam, kind: "examen_niveau" } : undefined,
    });
  }
  const missing = [...lessons.keys()].filter((s) => !used.has(s));
  if (missing.length) throw new Error(`${course.slug} : leçons non placées ${missing.join(", ")}`);
  return { ...course, modules, levels, placementTest: placementTest ? { ...placementTest, kind: "positionnement" } : undefined };
}

/** Examen de fin de niveau (réussite à 70 % par défaut). */
export function levelExam(slug: string, title: string, questions: QuizQuestion[], passScore = 70): Quiz {
  return { ...quiz(slug, title, questions, passScore), kind: "examen_niveau" };
}

/** Test de positionnement : chaque question est étiquetée par le niveau qu'elle évalue. */
export function placement(slug: string, title: string, byLevel: Record<LevelNumber, QuizQuestion[]>): Quiz {
  const questions = ([1, 2, 3, 4] as LevelNumber[]).flatMap((n) => byLevel[n].map((q) => ({ ...q, level: n })));
  return { ...quiz(slug, title, questions, 0), kind: "positionnement" };
}

/**
 * Niveau recommandé après un test de positionnement : un niveau est
 * considéré acquis si au moins 70 % de ses questions sont réussies ; on
 * recommande le premier niveau non acquis (les niveaux précédents doivent
 * tous être acquis).
 */
export function recommendedLevel(scores: Partial<Record<LevelNumber, { good: number; total: number }>>, threshold = 70): LevelNumber {
  for (const n of [1, 2, 3, 4] as LevelNumber[]) {
    const s = scores[n];
    if (!s || s.total === 0) return n;
    if ((s.good / s.total) * 100 < threshold) return n;
  }
  return 4;
}
