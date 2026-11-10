/**
 * Types du contenu pédagogique.
 *
 * Le contenu de référence est versionné dans `src/content/` puis importé
 * dans Supabase (`npm run seed:generate`). En production, l'application lit
 * la base de données, ce qui permet aux enseignants de modifier les cours
 * depuis l'administration.
 */

export type LanguageId = "pseudocode" | "python" | "c" | "javascript" | "java" | "html" | "css" | "php" | "sql";

/** Niveaux de chaque parcours : 1 très débutant, 2 débutant, 3 intermédiaire, 4 professionnel. */
export type LevelNumber = 1 | 2 | 3 | 4;

export const LEVEL_NUMBERS: LevelNumber[] = [1, 2, 3, 4];

export const LEVEL_NAMES: Record<LevelNumber, string> = {
  1: "Très débutant",
  2: "Débutant",
  3: "Intermédiaire",
  4: "Professionnel",
};
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
  /** Niveau évalué par la question (test de positionnement). */
  level?: LevelNumber;
}

export type QuizKind = "verification" | "interrogation" | "evaluation" | "positionnement" | "examen_niveau";

export interface Quiz {
  /** Identifiant en base (absent pour le contenu statique). */
  id?: string;
  slug: string;
  title: string;
  passScore: number;
  isFinal?: boolean;
  /** verification (quiz de leçon), interrogation (minutée), evaluation (validation du chapitre). */
  kind?: QuizKind;
  /** Durée conseillée / limite pour une interrogation, en minutes. */
  durationMinutes?: number;
  questions: QuizQuestion[];
}

export interface Definition {
  term: string;
  definition: string;
}

/** Algorithme commenté ligne par ligne : clé = numéro de ligne (1 = première ligne). */
export interface CommentedAlgorithm {
  title: string;
  /** Langage du code (pseudocode par défaut). */
  language?: LanguageId;
  code: string;
  stdin?: string;
  comments: Record<number, string>;
  /** Afficher le tableau de suivi des variables (trace). */
  showTrace?: boolean;
  /** Afficher l'organigramme généré. */
  showFlowchart?: boolean;
  /** Afficher l'aperçu rendu (HTML / CSS). */
  showPreview?: boolean;
}

export interface CommonError {
  title: string;
  wrong: string;
  right: string;
  explanation: string;
  /** La version fautive est un programme complet : on affiche le résultat réel de l'interpréteur. */
  run?: boolean;
  /** Entrées fournies lors de l'exécution des deux versions. */
  stdin?: string;
}

/** Exercice corrigé : la correction est consultable après réflexion. */
export interface SolvedExercise {
  title: string;
  statement: string;
  solution: string;
  explanation: string;
  stdin?: string;
}

/** Travaux dirigés : série d'exercices notés (correction après réussite). */
export interface TutorialSession {
  title: string;
  instructions: string;
  exerciseSlugs: string[];
}

/**
 * Structure pédagogique complète d'un chapitre de la Formation
 * (objectifs et cours dans Lesson ; le reste ici).
 */
/** Projet pratique d'un chapitre : réalisation guidée, évaluée par un exercice noté. */
export interface PracticalProject {
  title: string;
  context: string;
  steps: string[];
  deliverables: string[];
  /** Exercice noté (type mini_projet) qui vérifie le projet. */
  exerciseSlug?: string;
}

export interface ChapterPedagogy {
  competences: string[];
  definitions: Definition[];
  commentedAlgorithms: CommentedAlgorithm[];
  commonErrors: CommonError[];
  solvedExercises: SolvedExercise[];
  td?: TutorialSession;
  project?: PracticalProject;
  interrogation?: Quiz;
  evaluation?: Quiz;
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
  /** Structure pédagogique détaillée (chapitres de la Formation). */
  pedagogy?: ChapterPedagogy;
}

export interface Module {
  id?: string;
  slug: string;
  /** Niveau auquel appartient le module (déduit des niveaux du parcours). */
  level?: LevelNumber;
  title: string;
  description?: string;
  lessons: Lesson[];
}

/** Critères de passage au niveau suivant. */
export interface LevelCriteria {
  /** Pourcentage minimal de chapitres validés dans le niveau. */
  chaptersValidatedPct: number;
  /** Note minimale à l'examen final du niveau. */
  examPassScore: number;
}

export interface LevelDefinition {
  number: LevelNumber;
  title: string;
  description: string;
  objectives: string[];
  /** Modules (parties) rédigés qui composent ce niveau. */
  moduleSlugs: string[];
  /** Chapitres prévus mais pas encore rédigés (programme détaillé, affiché comme tel). */
  plannedChapters: string[];
  criteria: LevelCriteria;
  exam?: Quiz;
}

export interface Course {
  id?: string;
  slug: string;
  code: string;
  language: LanguageId;
  category: "fondamentaux" | "programmation" | "web" | "donnees";
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
  /** Les quatre niveaux du parcours. */
  /** Quatre niveaux (renseignés par withLevels dans src/content/index.ts). */
  levels?: LevelDefinition[];
  /** Test de positionnement (questions étiquetées par niveau). */
  placementTest?: Quiz;
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

/**
 * Vérification d'un exercice HTML / CSS, évaluée côté serveur sur le
 * document analysé (aucun script n'est exécuté).
 */
export type WebCheck =
  | { type: "element"; selector: string; min?: number; max?: number; message: string }
  | { type: "text"; selector: string; contains?: string; equals?: string; message: string }
  | { type: "attribute"; selector: string; name: string; equals?: string; contains?: string; message: string }
  | { type: "css"; selector: string; property: string; equals?: string; oneOf?: string[]; message: string };

export interface TestCase {
  description?: string;
  /** Exercices HTML / CSS : vérification structurelle au lieu d'une sortie attendue. */
  check?: WebCheck;
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
  /** Projets web : fichiers de départ (index.html, style.css…) ; le premier est principal. */
  starterFiles?: Array<{ name: string; content: string }>;
  /** Fichier ouvert en premier dans l'éditeur (ex. style.css pour un exercice CSS). */
  activeFile?: string;
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
