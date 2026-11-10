import { describe, expect, it } from "vitest";
import { chapterCompleteness } from "./completeness";
import { staticCourses, staticExercises } from "./index";
import { recommendedLevel } from "./levels/build";

const exercises = new Map(staticExercises.map((e) => [e.slug, e]));

describe("UPL ACADEMY multiniveaux", () => {
  it("propose les sept parcours du catalogue", () => {
    expect(staticCourses.map((c) => c.slug).sort()).toEqual(["algorithmique", "css", "html", "java", "javascript", "langage-c", "php", "python", "sql"]);
  });

  for (const c of staticCourses) {
    describe(c.slug, () => {
      it("comporte exactement les niveaux 1 à 4", () => {
        expect((c.levels ?? []).map((l) => l.number)).toEqual([1, 2, 3, 4]);
      });
      it("chaque module appartient à un niveau déclaré et chaque niveau a du contenu rédigé ou programmé", () => {
        for (const m of c.modules) expect(m.level, `${m.slug} sans niveau`).toBeDefined();
        for (const lv of c.levels ?? []) {
          for (const s of lv.moduleSlugs) expect(c.modules.find((m) => m.slug === s)?.level).toBe(lv.number);
          const lessons = c.modules.filter((m) => m.level === lv.number).flatMap((m) => m.lessons).length;
          expect(lessons + lv.plannedChapters.length, `niveau ${lv.number} vide`).toBeGreaterThan(0);
          expect(lv.objectives.length).toBeGreaterThan(0);
          expect(lv.criteria.examPassScore).toBeGreaterThan(0);
        }
      });
      it("le niveau 1 est rédigé et possède un examen de fin de niveau", () => {
        const n1 = c.levels!.find((l) => l.number === 1)!;
        expect(c.modules.filter((m) => m.level === 1).flatMap((m) => m.lessons).length).toBeGreaterThan(0);
        expect(n1.exam?.kind).toBe("examen_niveau");
        expect(n1.exam!.questions.length).toBeGreaterThanOrEqual(6);
      });
      it("les examens de niveau ont des réponses valides", () => {
        for (const lv of c.levels!) {
          for (const q of lv.exam?.questions ?? []) {
            expect(q.correct.length).toBeGreaterThan(0);
            for (const k of q.correct) expect(k).toBeLessThan(q.choices.length);
          }
        }
      });
      it("possède un test de positionnement couvrant les quatre niveaux", () => {
        const p = c.placementTest!;
        expect(p.kind).toBe("positionnement");
        for (const n of [1, 2, 3, 4]) expect(p.questions.filter((q) => q.level === n).length, `niveau ${n}`).toBeGreaterThanOrEqual(2);
        for (const q of p.questions) for (const k of q.correct) expect(k).toBeLessThan(q.choices.length);
      });
      it("les projets pratiques renvoient vers des exercices existants du parcours", () => {
        for (const l of c.modules.flatMap((m) => m.lessons)) {
          const slug = l.pedagogy?.project?.exerciseSlug;
          if (!slug) continue;
          const ex = exercises.get(slug);
          expect(ex, `${l.slug} → ${slug}`).toBeDefined();
          expect(ex!.courseSlug).toBe(c.slug);
        }
      });
    });
  }

  for (const slug of ["html", "css"]) {
    const course = staticCourses.find((c) => c.slug === slug)!;
    for (const l of course.modules.flatMap((m) => m.lessons)) {
      it(`${slug}/${l.slug} : chapitre complet (toutes les composantes)`, () => {
        const r = chapterCompleteness(l);
        expect(r.checks.filter((x) => !x.ok).map((x) => `${x.label} (${x.detail})`)).toEqual([]);
      });
    }
  }

  it("chaque exercice rattaché à un chapitre y est affiché (application, TD ou projet) : mêmes listes en base et en statique", () => {
    for (const c of staticCourses) {
      for (const l of c.modules.flatMap((m) => m.lessons)) {
        const shown = new Set([...(l.exerciseSlugs ?? []), ...(l.pedagogy?.td?.exerciseSlugs ?? []), ...(l.pedagogy?.project?.exerciseSlug ? [l.pedagogy.project.exerciseSlug] : [])]);
        for (const e of staticExercises.filter((x) => x.courseSlug === c.slug && x.lessonSlug === l.slug && x.status === "publie")) {
          expect(shown.has(e.slug), `${c.slug}/${l.slug} : ${e.slug} rattaché mais non affiché`).toBe(true);
        }
      }
    }
  });

  it("le niveau recommandé est le premier niveau non acquis", () => {
    expect(recommendedLevel({ 1: { good: 1, total: 3 } })).toBe(1);
    expect(recommendedLevel({ 1: { good: 3, total: 3 }, 2: { good: 1, total: 3 } })).toBe(2);
    expect(recommendedLevel({ 1: { good: 3, total: 3 }, 2: { good: 3, total: 3 }, 3: { good: 3, total: 3 }, 4: { good: 3, total: 3 } })).toBe(4);
  });
});
