/**
 * Types du contenu pédagogique.
 *
 * Le contenu de référence est versionné dans `src/content/` puis importé
 * dans Supabase (`npm run seed:generate`). En production, l'application lit
 * la base de données, ce qui permet aux enseignants de modifier les cours
 * depuis l'administration.
 */

export type LanguageId = "pseudocode" | "python" | "c" | "javascript" | "java";
export type Level = "debutant" | "intermediaire" | "avance";
export type ContentStatus = "brouillon" | "en_revision" | "publie" | "archive";

export interface CodeExample {
  title: string;
  language: LanguageId;
  code: string;
  stdin?: string;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  type: "qcm" | "vrai_faux" | "choix_multiples";
  prompt: string;
  code?: string;
  choices: string[];
  /** Index des bonnes réponses (jamais envoyé au navigateur). */
  correct: number[];
  explanation?: string;
}

export interface Quiz {
  /** Identifiant en base (absent pour le contenu statique). */
  id?: string;
  slug: string;
  title: string;
  passScore: number;
  isFinal?: boolean;
  questions: QuizQuestion[];
}

export interface Lesson {
  id?: string;
  slug: string;
  title: string;
  level: Level;
  durationMinutes: number;
  objectives: string[];
  prerequisites?: string[];
  /** Contenu Markdown de la leçon. */
  content: string;
  examples: CodeExample[];
  summary: string[];
  quiz?: Quiz;
  exerciseSlugs?: string[];
  status: ContentStatus;
}

export interface Module {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  id?: string;
  slug: string;
  code: string;
  language: LanguageId;
  category: "fondamentaux" | "programmation" | "web";
  title: string;
  tagline: string;
  description: string;
  level: Level;
  prerequisites: string[];
  objectives: string[];
  durationHours: number;
  status: ContentStatus;
  modules: Module[];
  finalQuiz?: Quiz;
}

export type ExerciseType =
  | "qcm"
  | "vrai_faux"
  | "completer"
  | "corriger"
  | "ecrire_algorithme"
  | "ecrire_programme"
  | "probleme"
  | "mini_projet";

export interface TestCase {
  description?: string;
  input: string;
  expected: string;
  hidden?: boolean;
  weight?: number;
}

export interface Exercise {
  id?: string;
  slug: string;
  courseSlug: string;
  lessonSlug?: string;
  language: LanguageId;
  title: string;
  difficulty: Level;
  type: ExerciseType;
  /** Énoncé en Markdown. */
  statement: string;
  objectives: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  starterCode: string;
  hints: string[];
  tests: TestCase[];
  /** Solution de référence (jamais envoyée au navigateur avant réussite). */
  solution: string;
  /** Correction pédagogique en Markdown. */
  correction: string;
  points?: number;
  isEvaluated?: boolean;
  status: ContentStatus;
}

/** Version d'un exercice sûre pour le navigateur : sans solution ni tests cachés. */
export type PublicExercise = Omit<Exercise, "solution" | "correction" | "tests"> & {
  tests: Array<Omit<TestCase, "hidden">>;
  hiddenTestCount: number;
};

/** Version d'un quiz sûre pour le navigateur : sans les réponses. */
export type PublicQuiz = Omit<Quiz, "questions"> & {
  questions: Array<Omit<QuizQuestion, "correct" | "explanation">>;
};

export const LEVEL_LABELS: Record<Level, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  qcm: "QCM",
  vrai_faux: "Vrai ou faux",
  completer: "Compléter un programme",
  corriger: "Corriger un programme",
  ecrire_algorithme: "Écrire un algorithme",
  ecrire_programme: "Écrire un programme complet",
  probleme: "Résoudre un problème",
  mini_projet: "Mini-projet",
};
