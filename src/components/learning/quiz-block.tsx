"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicQuiz } from "@/content/types";
import { Button, Card, cn, Notice } from "../ui";

interface Correction {
  id: string;
  correct: boolean;
  expected: number[];
  explanation: string | null;
}

export function QuizBlock({ quiz }: { quiz: PublicQuiz }) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<null | { score: number; passed: boolean; passScore: number; good: number; total: number; corrections: Correction[]; saved: boolean; lessonCompleted?: boolean }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const timed = quiz.kind === "interrogation" && Boolean(quiz.durationMinutes);
  const [started, setStarted] = useState(!timed);
  const [remaining, setRemaining] = useState((quiz.durationMinutes ?? 0) * 60);
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const toggle = (qid: string, idx: number, multiple: boolean) => {
    if (result) return;
    setAnswers((a) => {
      const cur = a[qid] ?? [];
      if (!multiple) return { ...a, [qid]: [idx] };
      return { ...a, [qid]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx] };
    });
  };

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/quiz/${quiz.slug}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answersRef.current }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Correction impossible.");
    else {
      setResult(data);
      if (quiz.kind === "evaluation" || data.lessonCompleted) router.refresh();
    }
  }, [quiz.slug, quiz.kind, router]);

  // Compte à rebours de l'interrogation : envoi automatique à la fin du temps.
  useEffect(() => {
    if (!timed || !started || result || loading) return;
    const t = setTimeout(() => {
      if (remaining <= 1) {
        setRemaining(0);
        submit();
      } else setRemaining((r) => r - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [timed, started, remaining, result, loading, submit]);

  const byId = new Map(result?.corrections.map((c) => [c.id, c]));
  const answered = quiz.questions.every((q) => (answers[q.id] ?? []).length > 0);

  if (!started) {
    return (
      <Card className="p-5">
        <h3 className="text-lg font-bold text-nuit-900">{quiz.title}</h3>
        <p className="mt-2 text-sm text-gris-700">
          {quiz.questions.length} questions · {quiz.durationMinutes} minutes · réussite à {quiz.passScore} %. Le chronomètre démarre quand vous cliquez ; vos réponses sont envoyées automatiquement à la fin du temps.
        </p>
        <Button className="mt-4" onClick={() => setStarted(true)}>Commencer l&apos;interrogation</Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-nuit-900">{quiz.title}</h3>
        <span className="text-sm text-gris-500">
          {quiz.questions.length} question(s) · réussite à {quiz.passScore} %
          {timed && !result && (
            <span className={cn("ml-2 rounded-full px-2 py-0.5 font-mono font-semibold", remaining < 60 ? "bg-red-100 text-red-800" : "bg-electrique-100 text-electrique-600")} aria-live="polite">
              ⏱ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </span>
          )}
        </span>
      </div>
      <ol className="space-y-5">
        {quiz.questions.map((q, i) => {
          const c = byId.get(q.id);
          const multiple = q.type === "choix_multiples";
          return (
            <li key={q.id}>
              <p className="font-medium text-nuit-900">
                {i + 1}. {q.prompt} {multiple && <span className="text-xs text-gris-500">(plusieurs réponses)</span>}
              </p>
              {q.code && <pre className="mt-2 overflow-x-auto rounded-md bg-nuit-950 p-3 font-mono text-xs text-gray-100">{q.code}</pre>}
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.choices.map((choice, k) => {
                  const selected = (answers[q.id] ?? []).includes(k);
                  const isExpected = c?.expected.includes(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggle(q.id, k, multiple)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        !c && (selected ? "border-electrique-500 bg-electrique-100 text-nuit-900" : "border-gris-200 hover:border-electrique-400"),
                        c && isExpected && "border-green-500 bg-green-50 text-green-900",
                        c && selected && !isExpected && "border-red-400 bg-red-50 text-red-900",
                        c && !selected && !isExpected && "border-gris-200 opacity-70",
                      )}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              {c && (
                <p className={cn("mt-2 text-sm", c.correct ? "text-green-700" : "text-red-700")}>
                  {c.correct ? "✓ Bonne réponse." : "✗ Réponse incorrecte."} {c.explanation && <span className="text-gris-700">{c.explanation}</span>}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!result ? (
          <Button onClick={submit} disabled={!answered || loading}>
            {loading ? "Correction…" : "Valider mes réponses"}
          </Button>
        ) : (
          <>
            <Notice tone={result.passed ? "succes" : "alerte"}>
              Score : <strong>{result.score} %</strong> ({result.good}/{result.total}) — {result.passed ? "quiz réussi, bravo !" : `il faut ${result.passScore} % pour valider. Relisez la leçon et réessayez.`}
              {!result.saved && " (résultat non enregistré : connectez-vous pour suivre votre progression)"}
              {result.lessonCompleted && " · Chapitre validé ✓"}
            </Notice>
            <Button variant="secondaire" onClick={() => { setResult(null); setAnswers({}); setRemaining((quiz.durationMinutes ?? 0) * 60); setStarted(!timed); }}>
              Recommencer
            </Button>
          </>
        )}
        {error && <p className="text-sm text-erreur">{error}</p>}
      </div>
    </Card>
  );
}
