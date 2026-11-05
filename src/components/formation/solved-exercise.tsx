"use client";

import { useState } from "react";
import type { SolvedExercise } from "@/content/types";
import { Markdown } from "../learning/markdown";
import { Button } from "../ui";

/** Exercice corrigé : l'étudiant est invité à chercher avant de consulter la correction. */
export function SolvedExerciseView({ exercise, index }: { exercise: SolvedExercise; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gris-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-electrique-600">Exercice corrigé {index}</p>
      <h4 className="mt-1 font-semibold text-nuit-900">{exercise.title}</h4>
      <Markdown className="mt-2 text-sm">{exercise.statement}</Markdown>
      {!open ? (
        <Button size="sm" variant="secondaire" className="mt-3" onClick={() => setOpen(true)}>
          J&apos;ai cherché — voir la correction
        </Button>
      ) : (
        <div className="mt-3 space-y-2">
          <pre className="overflow-x-auto rounded-md bg-nuit-950 p-3 font-mono text-xs text-gray-100">{exercise.solution}</pre>
          <Markdown className="text-sm">{exercise.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}
