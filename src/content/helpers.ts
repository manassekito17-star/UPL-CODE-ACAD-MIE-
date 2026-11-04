import type { CodeExample, Exercise, LanguageId, Lesson, Level, Quiz, QuizQuestion } from "./types";

type LessonInput = Omit<Lesson, "status" | "level" | "examples" | "summary"> & {
  level?: Level;
  status?: Lesson["status"];
  examples?: CodeExample[];
  summary?: string[];
};

export function lesson(input: LessonInput): Lesson {
  return {
    level: "debutant",
    status: "publie",
    examples: [],
    summary: [],
    ...input,
    content: dedent(input.content),
    examples: (input.examples ?? []).map((e) => ({ ...e, code: dedent(e.code) })),
  };
}

export function example(language: LanguageId, title: string, code: string, extra: Partial<CodeExample> = {}): CodeExample {
  return { language, title, code, ...extra };
}

export function quiz(slug: string, title: string, questions: QuizQuestion[], passScore = 60): Quiz {
  // Identifiants stables : « <quiz>-<numéro> »
  return { slug, title, passScore, questions: questions.map((q, i) => ({ ...q, id: `${slug}-${i + 1}` })) };
}

let counter = 0;
export function qcm(prompt: string, choices: string[], correct: number | number[], explanation?: string, code?: string): QuizQuestion {
  const list = Array.isArray(correct) ? correct : [correct];
  return {
    id: `q${++counter}`,
    type: list.length > 1 ? "choix_multiples" : "qcm",
    prompt,
    choices,
    correct: list,
    explanation,
    code: code ? dedent(code) : undefined,
  };
}

export function vraiFaux(prompt: string, answer: boolean, explanation?: string, code?: string): QuizQuestion {
  return {
    id: `q${++counter}`,
    type: "vrai_faux",
    prompt,
    choices: ["Vrai", "Faux"],
    correct: [answer ? 0 : 1],
    explanation,
    code: code ? dedent(code) : undefined,
  };
}

/** Retire l'indentation commune et les lignes vides de début/fin. */
export function dedent(text: string): string {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const indent = Math.min(
    ...lines.filter((l) => l.trim() !== "").map((l) => l.match(/^ */)![0].length),
  );
  return lines.map((l) => l.slice(Number.isFinite(indent) ? indent : 0)).join("\n");
}

export type ExInput = Omit<Exercise, "status" | "language" | "courseSlug" | "starterCode" | "solution" | "correction" | "statement" | "objectives" | "constraints" | "examples"> & {
  statement: string;
  starterCode?: string;
  solution: string;
  correction: string;
  objectives?: string[];
  constraints?: string[];
  examples?: Exercise["examples"];
};

export function makeExercise(base: Pick<Exercise, "language" | "courseSlug">, input: ExInput): Exercise {
  return {
    ...base,
    status: "publie",
    objectives: [],
    constraints: [],
    examples: [],
    ...input,
    statement: dedent(input.statement),
    starterCode: dedent(input.starterCode ?? ""),
    solution: dedent(input.solution),
    correction: dedent(input.correction),
  };
}

