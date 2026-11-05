import { algorithmique } from "./courses/algorithmique";
import { langageC } from "./courses/c";
import { java } from "./courses/java";
import { javascript } from "./courses/javascript";
import { python } from "./courses/python";
import { algorithmiqueExercises } from "./exercises/algorithmique";
import { cExercises, javaExercises, javascriptExercises } from "./exercises/autres";
import { formationPartie1Exercises } from "./exercises/formation-partie1";
import { pythonExercises } from "./exercises/python";
import type { Course, Exercise } from "./types";

/** Contenu de référence versionné (source du seed Supabase). */
export const staticCourses: Course[] = [algorithmique, python, langageC, javascript, java].map((c) =>
  c.finalQuiz ? { ...c, finalQuiz: { ...c.finalQuiz, isFinal: true } } : c,
);

export const staticExercises: Exercise[] = [
  ...algorithmiqueExercises,
  ...formationPartie1Exercises,
  ...pythonExercises,
  ...cExercises,
  ...javascriptExercises,
  ...javaExercises,
];
