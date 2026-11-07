/**
 * Contrôle qualité de la Formation : chaque composante d'un chapitre est
 * vérifiée automatiquement (exécution réelle par l'interpréteur).
 */
import { describe, expect, it } from "vitest";
import { outputsMatch } from "@/lib/execution/compare";
import { generateFlowcharts } from "@/lib/pseudocode/flowchart";
import { runPseudocode, traceExecution } from "@/lib/pseudocode";
import { chapterCompleteness } from "./completeness";
import { staticCourses, staticExercises } from "./index";

const algo = staticCourses.find((c) => c.slug === "algorithmique")!;
const chapters = algo.modules.flatMap((m) => m.lessons.map((l) => ({ module: m.slug, lesson: l })));
const published = chapters.filter((c) => c.lesson.status === "publie");
const exercises = new Map(staticExercises.map((e) => [e.slug, e]));

describe("Formation — Partie 1 complète", () => {
  const partie1 = published.filter((c) => c.module === "fondements");
  it("contient les sept chapitres de la Partie 1", () => {
    expect(partie1.map((c) => c.lesson.slug)).toEqual([
      "introduction-algorithmique",
      "logique-raisonnement",
      "analyse-problemes",
      "variables-constantes",
      "types-donnees",
      "operateurs",
      "entrees-sorties",
    ]);
  });
  for (const { lesson } of partie1) {
    it(`${lesson.slug} : les 12 composantes sont présentes`, () => {
      const r = chapterCompleteness(lesson);
      expect(r.checks.filter((c) => !c.ok).map((c) => `${c.label} (${c.detail})`)).toEqual([]);
    });
  }
});

describe("Formation — chapitres structurés", () => {
  for (const { lesson } of published.filter((c) => c.lesson.pedagogy)) {
    const p = lesson.pedagogy!;
    describe(lesson.slug, () => {
      it("les algorithmes commentés s'exécutent, avec organigramme et trace", () => {
        for (const a of p.commentedAlgorithms) {
          const lines = a.code.split("\n").length;
          for (const k of Object.keys(a.comments)) expect(Number(k)).toBeLessThanOrEqual(lines);
          const r = runPseudocode(a.code, a.stdin ?? "");
          expect(r.error, `${a.title} : ${r.error?.message}`).toBeNull();
          if (a.showFlowchart) expect(generateFlowcharts(a.code).ok).toBe(true);
          if (a.showTrace) expect(traceExecution(a.code, a.stdin ?? "").trace.length).toBeGreaterThan(2);
        }
      });

      it("les erreurs fréquentes exécutables échouent réellement, et la version correcte est juste", () => {
        for (const e of p.commonErrors.filter((x) => x.run)) {
          const wrong = runPseudocode(e.wrong, e.stdin ?? "");
          const right = runPseudocode(e.right, e.stdin ?? "");
          expect(right.error, `${e.title} (version correcte) : ${right.error?.message}`).toBeNull();
          const differs = !wrong.ok || !outputsMatch(wrong.stdout, right.stdout);
          expect(differs, `${e.title} : la version fautive se comporte comme la correcte`).toBe(true);
        }
      });

      it("les corrections des exercices corrigés en pseudocode s'exécutent", () => {
        for (const s of p.solvedExercises.filter((x) => /^\s*ALGORITHME/.test(x.solution))) {
          const r = runPseudocode(s.solution, s.stdin ?? "12\n2006\n5\n3");
          expect(r.error?.kind, `${s.title} : ${r.error?.message}`).not.toBe("syntaxe");
        }
      });

      it("le TD et les exercices référencent des exercices notés de ce chapitre", () => {
        for (const slug of [...(p.td?.exerciseSlugs ?? []), ...(lesson.exerciseSlugs ?? [])]) {
          const e = exercises.get(slug);
          expect(e, `exercice inconnu : ${slug}`).toBeDefined();
          expect(e!.lessonSlug).toBe(lesson.slug);
        }
      });

      it("interrogation et évaluation sont bien formées", () => {
        for (const q of [p.interrogation, p.evaluation].filter(Boolean)) {
          for (const qq of q!.questions) {
            expect(qq.correct.length).toBeGreaterThan(0);
            for (const k of qq.correct) expect(k).toBeLessThan(qq.choices.length);
          }
        }
        expect(p.interrogation?.kind).toBe("interrogation");
        expect(p.interrogation?.durationMinutes).toBeGreaterThan(0);
        expect(p.evaluation?.kind).toBe("evaluation");
      });
    });
  }
});

describe("unicité des quiz", () => {
  it("chaque quiz a un identifiant unique sur toute la plateforme", () => {
    const slugs: string[] = [];
    for (const c of staticCourses) {
      if (c.finalQuiz) slugs.push(c.finalQuiz.slug);
      for (const m of c.modules) for (const l of m.lessons) for (const q of [l.quiz, l.pedagogy?.interrogation, l.pedagogy?.evaluation]) if (q) slugs.push(q.slug);
    }
    expect(slugs.length).toBe(new Set(slugs).size);
  });
});
