import "server-only";

import type { Exercise } from "@/content/types";
import { firstDifference, outputsMatch } from "./compare";
import { executeOnServer } from "./run";
import { checkWebProject } from "./web";
import type { ExecutionResult, SourceFile } from "./types";

export interface TestOutcome {
  index: number;
  hidden: boolean;
  passed: boolean;
  description?: string;
  /** Détails affichés uniquement pour les tests visibles. */
  input?: string;
  expected?: string;
  got?: string;
  difference?: { line: number; got: string; want: string } | null;
  error?: string;
  timeMs: number | null;
}

export interface GradeResult {
  status: "reussi" | "partiel" | "echoue" | "erreur";
  score: number; // 0 à 100
  passed: number;
  total: number;
  tests: TestOutcome[];
  compileError?: string;
  errorLine?: number;
  hint?: string;
}

function errorText(r: ExecutionResult): string {
  return [r.compileOutput, r.stderr].filter(Boolean).join("\n").trim();
}

/** Exécute le code sur chaque test (y compris les tests cachés) et calcule la note pondérée. */
export async function gradeExercise(exercise: Exercise, files: SourceFile[]): Promise<GradeResult> {
  if (exercise.language === "html" || exercise.language === "css") return gradeWebExercise(exercise, files);
  const outcomes: TestOutcome[] = [];
  let weightTotal = 0;
  let weightPassed = 0;

  for (let i = 0; i < exercise.tests.length; i++) {
    const t = exercise.tests[i];
    const weight = t.weight ?? 1;
    weightTotal += weight;
    const r = await executeOnServer({ language: exercise.language, files, stdin: t.input });

    if (r.status === "erreur_compilation") {
      // Inutile d'exécuter les autres tests : le programme ne compile pas.
      return {
        status: "erreur",
        score: 0,
        passed: 0,
        total: exercise.tests.length,
        tests: [],
        compileError: errorText(r),
        errorLine: r.errorLine,
        hint: r.hint,
      };
    }
    if (r.status === "erreur_interne") {
      throw new Error(r.stderr || "Service d'exécution indisponible.");
    }
    const passed = r.status === "ok" && outputsMatch(r.stdout, t.expected);
    if (passed) weightPassed += weight;
    const hidden = Boolean(t.hidden);
    outcomes.push({
      index: i + 1,
      hidden,
      passed,
      description: t.description,
      input: hidden ? undefined : t.input,
      expected: hidden ? undefined : t.expected,
      got: hidden ? undefined : r.stdout,
      difference: hidden || passed ? null : firstDifference(r.stdout, t.expected),
      error:
        r.status === "ok"
          ? undefined
          : r.status === "temps_depasse"
            ? "Temps limite dépassé (boucle infinie ?)"
            : hidden
              ? "Erreur à l'exécution"
              : errorText(r) || "Erreur à l'exécution",
      timeMs: r.timeMs,
    });
  }

  const passedCount = outcomes.filter((o) => o.passed).length;
  const score = weightTotal ? Math.round((weightPassed / weightTotal) * 10000) / 100 : 0;
  return {
    status: passedCount === outcomes.length ? "reussi" : passedCount > 0 ? "partiel" : "echoue",
    score,
    passed: passedCount,
    total: outcomes.length,
    tests: outcomes,
  };
}

/**
 * Exercices HTML / CSS : chaque test est une vérification structurelle du
 * document (éléments, textes, attributs, règles CSS). Aucun script n'est exécuté.
 */
export async function gradeWebExercise(exercise: Exercise, files: SourceFile[]): Promise<GradeResult> {
  // Chaque test web porte une vérification structurelle ; un test sans vérification est compté comme échoué.
  const checked = await checkWebProject(files, exercise.tests.flatMap((t) => (t.check ? [t.check] : [])));
  let k = 0;
  const results = exercise.tests.map((t) => (t.check ? checked[k++] : undefined));
  let weightTotal = 0;
  let weightPassed = 0;
  const outcomes: TestOutcome[] = exercise.tests.map((t, i) => {
    const r = results[i];
    const weight = t.weight ?? 1;
    weightTotal += weight;
    if (r?.passed) weightPassed += weight;
    const hidden = Boolean(t.hidden);
    return {
      index: i + 1,
      hidden,
      passed: Boolean(r?.passed),
      description: hidden ? undefined : r?.message ?? t.description,
      error: r?.passed || hidden ? undefined : r?.detail,
      timeMs: null,
    };
  });
  const passed = outcomes.filter((o) => o.passed).length;
  return {
    status: passed === outcomes.length ? "reussi" : passed > 0 ? "partiel" : "echoue",
    score: weightTotal ? Math.round((weightPassed / weightTotal) * 10000) / 100 : 0,
    passed,
    total: outcomes.length,
    tests: outcomes,
  };
}
