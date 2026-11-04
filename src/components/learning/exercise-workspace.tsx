"use client";

import { useRef, useState } from "react";
import { EXERCISE_TYPE_LABELS, LEVEL_LABELS, type PublicExercise } from "@/content/types";
import { runInBrowser } from "@/lib/execution/browser";
import { firstDifference, outputsMatch } from "@/lib/execution/compare";
import { LANGUAGES } from "@/lib/execution/languages";
import type { SourceFile } from "@/lib/execution/types";
import { CodeWorkspace, type WorkspaceApi } from "../editor/code-workspace";
import { TutorChat } from "../tutor/tutor-chat";
import { Badge, Button, cn, Notice } from "../ui";
import { LEVEL_TONES } from "../ui/labels";
import { Markdown } from "./markdown";

interface TestOutcome {
  index: number;
  hidden: boolean;
  passed: boolean;
  input?: string;
  expected?: string;
  got?: string;
  difference?: { line: number; got: string; want: string } | null;
  error?: string;
}

interface GradeResponse {
  status: "reussi" | "partiel" | "echoue" | "erreur";
  score: number;
  passed: number;
  total: number;
  tests: TestOutcome[];
  compileError?: string;
  errorLine?: number;
  hint?: string;
  attempts?: number;
  saved?: boolean;
  correction?: string | null;
  solution?: string | null;
  attemptsBeforeCorrection?: number;
  local?: boolean;
}

export function ExerciseWorkspace({ exercise, loggedIn, authRequired }: { exercise: PublicExercise; loggedIn: boolean; authRequired: boolean }) {
  const apiRef = useRef<WorkspaceApi | null>(null);
  const [grade, setGrade] = useState<GradeResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const initialFiles: SourceFile[] = [{ name: LANGUAGES[exercise.language].mainFile, content: exercise.starterCode || LANGUAGES[exercise.language].exerciseTemplate }];

  const localCheck = async (files: SourceFile[]): Promise<GradeResponse> => {
    const tests: TestOutcome[] = [];
    for (let i = 0; i < exercise.tests.length; i++) {
      const t = exercise.tests[i];
      const r = await runInBrowser(exercise.language, files, t.input);
      if (r.status === "erreur_compilation") {
        return { status: "erreur", score: 0, passed: 0, total: exercise.tests.length, tests: [], compileError: r.compileOutput, errorLine: r.errorLine, hint: r.hint, local: true };
      }
      const passed = r.status === "ok" && outputsMatch(r.stdout, t.expected);
      tests.push({ index: i + 1, hidden: false, passed, input: t.input, expected: t.expected, got: r.stdout, difference: passed ? null : firstDifference(r.stdout, t.expected), error: r.status === "ok" ? undefined : r.stderr });
    }
    const passed = tests.filter((t) => t.passed).length;
    return { status: passed === tests.length ? "reussi" : passed ? "partiel" : "echoue", score: Math.round((passed / tests.length) * 100), passed, total: tests.length, tests, local: true };
  };

  const submit = async () => {
    const api = apiRef.current;
    if (!api) return;
    setSubmitting(true);
    setError(null);
    setGrade(null);
    try {
      const res = await fetch(`/api/exercises/${exercise.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: api.files }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGrade(data);
        api.setMarkers(data.errorLine ? [{ line: data.errorLine, message: data.compileError ?? "Erreur" }] : []);
      } else if (data.fallback === "navigateur") {
        setGrade(await localCheck(api.files));
      } else {
        setError(data.error ?? "Correction impossible.");
      }
    } catch {
      setError("Connexion au serveur impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  const statement = (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge tone={LEVEL_TONES[exercise.difficulty]}>{LEVEL_LABELS[exercise.difficulty]}</Badge>
          <Badge tone="bleu">{EXERCISE_TYPE_LABELS[exercise.type]}</Badge>
          <Badge tone="gris">{LANGUAGES[exercise.language].shortLabel}</Badge>
          {exercise.isEvaluated && <Badge tone="nuit">Exercice évalué</Badge>}
          <Badge tone="cyan">{exercise.points ?? 10} points</Badge>
        </div>
        <h1 className="text-xl font-bold text-nuit-900">{exercise.title}</h1>
      </div>
      <Markdown>{exercise.statement}</Markdown>
      {exercise.objectives.length > 0 && (
        <div>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-gris-500">Objectifs</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gris-700">{exercise.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
      )}
      {exercise.examples.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gris-500">Exemples</h2>
          <div className="space-y-2">
            {exercise.examples.map((ex, i) => (
              <div key={i} className="grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <p className="mb-1 font-semibold text-gris-500">Entrée</p>
                  <pre className="min-h-10 whitespace-pre-wrap rounded-md bg-gris-100 p-2 font-mono">{ex.input || "(aucune)"}</pre>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-gris-500">Sortie attendue</p>
                  <pre className="min-h-10 whitespace-pre-wrap rounded-md bg-gris-100 p-2 font-mono">{ex.output}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {exercise.constraints.length > 0 && (
        <div>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-gris-500">Contraintes</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gris-700">{exercise.constraints.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      )}
      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gris-500">Indices progressifs</h2>
        <ol className="space-y-2">
          {exercise.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <strong>Indice {i + 1} :</strong> {h}
            </li>
          ))}
        </ol>
        {hintsShown < exercise.hints.length ? (
          <Button variant="secondaire" size="sm" className="mt-2" onClick={() => setHintsShown((n) => n + 1)}>
            💡 Afficher l&apos;indice {hintsShown + 1}/{exercise.hints.length}
          </Button>
        ) : (
          <p className="mt-2 text-xs text-gris-500">Tous les indices sont affichés. Besoin de plus d&apos;aide ? Demandez au professeur IA.</p>
        )}
      </div>
      <p className="text-xs text-gris-500">
        {exercise.tests.length} test(s) visible(s){exercise.hiddenTestCount > 0 && ` et ${exercise.hiddenTestCount} test(s) caché(s)`} vérifient votre programme.
      </p>
    </div>
  );

  const results = (grade || error) && (
    <div className="space-y-3 rounded-xl border border-gris-200 bg-white p-4 text-nuit-900">
      {error && <Notice tone="erreur">{error}</Notice>}
      {grade && (
        <>
          <Notice tone={grade.status === "reussi" ? "succes" : grade.status === "erreur" ? "erreur" : "alerte"} title={grade.status === "reussi" ? "Bravo, exercice réussi !" : grade.status === "erreur" ? "Votre programme contient une erreur" : `${grade.passed}/${grade.total} test(s) réussi(s)`}>
            Note : <strong>{grade.score} / 100</strong>
            {grade.attempts ? ` · tentative n° ${grade.attempts}` : ""}
            {grade.local && " · vérification locale sur les tests visibles (non enregistrée)"}
            {!grade.local && grade.saved === false && " · résultat non enregistré (mode démonstration)"}
          </Notice>
          {grade.compileError && (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-red-50 p-3 font-mono text-xs text-red-900">
              {grade.compileError}
              {grade.hint && `\n💡 ${grade.hint}`}
            </pre>
          )}
          <ul className="space-y-2">
            {grade.tests.map((t) => (
              <li key={t.index} className={cn("rounded-md border p-3 text-sm", t.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                <p className="font-semibold">
                  {t.passed ? "✓" : "✗"} Test {t.index} {t.hidden && "(caché)"}
                </p>
                {!t.passed && !t.hidden && (
                  <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                    <div>
                      <p className="font-semibold text-gris-500">Entrée</p>
                      <pre className="whitespace-pre-wrap font-mono">{t.input || "(aucune)"}</pre>
                    </div>
                    <div>
                      <p className="font-semibold text-gris-500">Attendu</p>
                      <pre className="whitespace-pre-wrap font-mono">{t.expected}</pre>
                    </div>
                    <div>
                      <p className="font-semibold text-gris-500">Obtenu</p>
                      <pre className="whitespace-pre-wrap font-mono">{t.error ?? t.got ?? ""}</pre>
                    </div>
                    {t.difference && (
                      <p className="sm:col-span-3">
                        Première différence à la ligne {t.difference.line} : attendu « {t.difference.want} », obtenu « {t.difference.got} ».
                      </p>
                    )}
                  </div>
                )}
                {!t.passed && t.hidden && t.error && <p className="mt-1 text-xs">{t.error}</p>}
              </li>
            ))}
          </ul>
          {grade.correction ? (
            <div className="rounded-lg border border-electrique-400/40 bg-electrique-100/40 p-4">
              <h3 className="mb-2 font-bold">Correction pédagogique</h3>
              <Markdown>{grade.correction}</Markdown>
              {grade.solution && (
                <>
                  <Button size="sm" variant="secondaire" className="mt-3" onClick={() => setShowSolution((s) => !s)}>
                    {showSolution ? "Masquer" : "Voir"} la solution de référence
                  </Button>
                  {showSolution && <pre className="mt-3 overflow-x-auto rounded-md bg-nuit-950 p-3 font-mono text-xs text-gray-100">{grade.solution}</pre>}
                </>
              )}
            </div>
          ) : (
            !grade.local &&
            grade.status !== "reussi" &&
            grade.attemptsBeforeCorrection !== undefined && (
              <p className="text-xs text-gris-500">La correction sera proposée après réussite ou après {grade.attemptsBeforeCorrection} tentative(s) supplémentaire(s). Utilisez les indices !</p>
            )
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <aside className="hidden max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-xl border border-gris-200 bg-white p-5 xl:block">{statement}</aside>
      <div className="min-w-0 space-y-4">
        <CodeWorkspace
          initialLanguage={exercise.language}
          initialFiles={initialFiles}
          initialStdin={exercise.tests[0]?.input ?? ""}
          languageLocked
          storageKey={`exercice:${exercise.slug}`}
          instructions={<div className="xl:hidden">{statement}</div>}
          height="min(70dvh, 640px)"
          toolbarExtra={(api) => {
            apiRef.current = api;
            return authRequired && !loggedIn ? (
              <a href={`/connexion?suite=/exercices/${exercise.slug}`} className="text-xs text-cyan-accent underline">
                Connectez-vous pour soumettre
              </a>
            ) : (
              <Button size="sm" variant="clair" onClick={submit} disabled={submitting}>
                {submitting ? "Correction…" : "✓ Soumettre"}
              </Button>
            );
          }}
        />
        {results}
        <TutorChat
          compact
          defaultMode="indice"
          modes={["indice", "analyser_erreur", "expliquer_code", "question"]}
          intro={
            exercise.isEvaluated
              ? "Cet exercice est évalué : je vous guiderai avec des explications et des indices, sans donner la solution complète."
              : "Bloqué ? Demandez-moi un indice ou l'analyse de votre erreur."
          }
          getContext={() => {
            const api = apiRef.current;
            const failed = grade?.tests.find((t) => !t.passed && !t.hidden);
            return {
              language: exercise.language,
              exerciseSlug: exercise.slug,
              code: api?.files.map((f) => (api.files.length > 1 ? `# ${f.name}\n${f.content}` : f.content)).join("\n\n"),
              error: grade?.compileError ?? (failed ? `Test échoué. Entrée : ${failed.input}\nAttendu : ${failed.expected}\nObtenu : ${failed.error ?? failed.got}` : undefined),
            };
          }}
        />
      </div>
    </div>
  );
}
