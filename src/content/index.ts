import { algorithmique } from "./courses/algorithmique";
import { langageC } from "./courses/c";
import { css } from "./courses/css";
import { projetsPartie1, projetsPartie1Exercises } from "./courses/formation/projets-partie1";
import { html } from "./courses/html";
import { java } from "./courses/java";
import { javascript } from "./courses/javascript";
import { kplus } from "./courses/kplus";
import { php } from "./courses/php";
import { python } from "./courses/python";
import { sql } from "./courses/sql";
import { algorithmiqueExercises } from "./exercises/algorithmique";
import { cExercises, javaExercises, javascriptExercises } from "./exercises/autres";
import { formationPartie1Exercises } from "./exercises/formation-partie1";
import { kplusExercises } from "./exercises/kplus";
import { phpExercises } from "./exercises/php";
import { pythonExercises } from "./exercises/python";
import { cssExercises, htmlExercises, webProjects } from "./exercises/web";
import { webMarkdown } from "./helpers";
import { withLevels } from "./levels/build";
import { kplusLevels, kplusPlacement } from "./levels/kplus";
import {
  algorithmiqueLevels,
  algorithmiquePlacement,
  cLevels,
  cPlacement,
  javaLevels,
  javaPlacement,
  javascriptLevels,
  javascriptPlacement,
  pythonLevels,
  pythonPlacement,
} from "./levels/programmes";
import { phpLevels, phpPlacement, sqlLevels, sqlPlacement } from "./levels/php-sql";
import { cssLevels, cssPlacement, htmlLevels, htmlPlacement } from "./levels/web";
import type { Course, Exercise, PracticalProject } from "./types";

/** Projets pratiques rattachés aux chapitres (clé = slug de la leçon). */
const PROJECTS: Record<string, PracticalProject> = { ...projetsPartie1, ...webProjects };

function attachProjects(course: Course): Course {
  return {
    ...course,
    modules: course.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => {
        const project = PROJECTS[l.slug];
        if (!project || !l.pedagogy || l.pedagogy.project) return l;
        return { ...l, pedagogy: { ...l.pedagogy, project } };
      }),
    })),
  };
}

const finalize = (c: Course): Course => (c.finalQuiz ? { ...c, finalQuiz: { ...c.finalQuiz, isFinal: true } } : c);

/** Contenu de référence versionné (source du seed Supabase) : dix parcours, quatre niveaux chacun. */
export const staticCourses: Course[] = [
  withLevels(algorithmique, algorithmiqueLevels, algorithmiquePlacement),
  withLevels(webMarkdown(html), htmlLevels, htmlPlacement),
  withLevels(webMarkdown(css), cssLevels, cssPlacement),
  withLevels(python, pythonLevels, pythonPlacement),
  withLevels(langageC, cLevels, cPlacement),
  withLevels(javascript, javascriptLevels, javascriptPlacement),
  withLevels(java, javaLevels, javaPlacement),
  withLevels(kplus, kplusLevels, kplusPlacement),
  withLevels(php, phpLevels, phpPlacement),
  withLevels(sql, sqlLevels, sqlPlacement),
]
  .map(attachProjects)
  .map(finalize);

export const staticExercises: Exercise[] = [
  ...algorithmiqueExercises,
  ...formationPartie1Exercises,
  ...projetsPartie1Exercises,
  ...htmlExercises,
  ...cssExercises,
  ...pythonExercises,
  ...cExercises,
  ...javascriptExercises,
  ...javaExercises,
  ...kplusExercises,
  ...phpExercises,
];
