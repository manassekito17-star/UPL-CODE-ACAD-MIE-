import { LEVEL_NAMES, type Course, type LevelNumber } from "@/content/types";
import type { LevelState } from "../levels/rules";

/**
 * Programme d'un parcours résumé pour le professeur IA : niveaux, chapitres
 * publiés et chapitres au programme, chapitre en cours et niveau réel de
 * l'étudiant (calculé côté serveur à partir de sa progression).
 */
export function buildCurriculumContext(course: Course, opts: { lessonSlug?: string; states?: LevelState[]; current?: LevelNumber } = {}): string {
  const lines: string[] = [];
  lines.push(`Parcours : ${course.title} (langage : ${course.language})`);
  for (const lv of course.levels ?? []) {
    const lessons = course.modules.filter((m) => m.level === lv.number).flatMap((m) => m.lessons.filter((l) => l.status === "publie"));
    const st = opts.states?.find((s) => s.number === lv.number);
    lines.push(`Niveau ${lv.number} — ${LEVEL_NAMES[lv.number]}${st ? ` [${st.status}]` : ""} : ${lv.description}`);
    if (lessons.length) lines.push(`  Chapitres publiés : ${lessons.map((l) => (opts.states ? `${l.title}` : l.title)).join(" ; ")}`);
    if (lv.plannedChapters.length) lines.push(`  Au programme (pas encore publiés) : ${lv.plannedChapters.join(" ; ")}`);
  }
  if (opts.current) lines.push(`Niveau actuel de l'étudiant dans ce parcours : ${opts.current} — ${LEVEL_NAMES[opts.current]}.`);
  const lesson = opts.lessonSlug ? course.modules.flatMap((m) => m.lessons).find((l) => l.slug === opts.lessonSlug) : undefined;
  if (lesson) {
    const mod = course.modules.find((m) => m.lessons.includes(lesson));
    lines.push(`Chapitre en cours : « ${lesson.title} » (niveau ${mod?.level ?? "?"}).`);
    lines.push(`  Objectifs : ${lesson.objectives.join(" ; ")}`);
    if (lesson.prerequisites?.length) lines.push(`  Prérequis : ${lesson.prerequisites.join(" ; ")}`);
    if (lesson.pedagogy?.competences.length) lines.push(`  Compétences visées : ${lesson.pedagogy.competences.join(" ; ")}`);
    if (lesson.pedagogy?.project) lines.push(`  Projet pratique : ${lesson.pedagogy.project.title} — étapes : ${lesson.pedagogy.project.steps.join(" / ")}`);
  }
  return lines.join("\n");
}

/** Niveau de langage adapté au niveau du parcours. */
export function vocabularyForLevel(n: LevelNumber): "debutant" | "intermediaire" | "avance" {
  return n <= 2 ? "debutant" : n === 3 ? "intermediaire" : "avance";
}
