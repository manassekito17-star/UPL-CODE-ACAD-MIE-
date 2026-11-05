import { describe, expect, it } from "vitest";
import { staticCourses } from "@/content";
import type { LevelNumber } from "@/content/types";
import { currentLevel, levelLessons, levelStates, scorePlacement, type LevelFacts } from "./rules";

const algo = staticCourses.find((c) => c.slug === "algorithmique")!;
const empty = (): LevelFacts => ({ validatedLessons: new Set(), examBest: {}, recorded: {} });
const n1 = levelLessons(algo, 1).map((l) => l.slug);

describe("règles de passage de niveau", () => {
  it("un nouvel étudiant est au niveau 1, les examens suivants sont verrouillés", () => {
    const s = levelStates(algo, empty());
    expect(s.map((x) => x.status)).toEqual(["en_cours", "verrouille", "verrouille", "verrouille"]);
    expect(s[0].examUnlocked).toBe(true);
    expect(s[1].examUnlocked).toBe(false);
    expect(currentLevel(s)).toBe(1);
  });

  it("les critères exigent les chapitres ET l'examen", () => {
    const f = empty();
    f.examBest[1] = 90;
    expect(levelStates(algo, f)[0].criteriaMet).toBe(false);
    n1.forEach((s) => f.validatedLessons.add(s));
    f.examBest[1] = 60;
    const s = levelStates(algo, f)[0];
    expect(s.chaptersOk).toBe(true);
    expect(s.examOk).toBe(false);
    expect(s.missing.join(" ")).toContain("70 %");
    f.examBest[1] = 70;
    expect(levelStates(algo, f)[0].criteriaMet).toBe(true);
  });

  it("un niveau validé débloque l'examen du suivant", () => {
    const f = empty();
    f.recorded[1] = "valide";
    const s = levelStates(algo, f);
    expect(s[0].status).toBe("valide");
    expect(s[1].status).toBe("en_cours");
    expect(s[1].examUnlocked).toBe(true);
    expect(currentLevel(s)).toBe(2);
  });

  it("la dispense par positionnement compte comme acquis", () => {
    const f = empty();
    f.recorded[1] = "dispense";
    f.recorded[2] = "dispense";
    const s = levelStates(algo, f);
    expect(s[2].examUnlocked).toBe(true);
    expect(currentLevel(s)).toBe(3);
  });

  it("un niveau sans examen publié ne peut pas être validé", () => {
    const f = empty();
    for (const n of [1, 2, 3] as LevelNumber[]) f.recorded[n] = "valide";
    levelLessons(algo, 4).forEach((l) => f.validatedLessons.add(l.slug));
    const s = levelStates(algo, f)[3];
    expect(algo.levels![3].exam).toBeUndefined();
    expect(s.criteriaMet).toBe(false);
    expect(s.missing.join(" ")).toContain("pas encore publié");
  });

  it("niveaux HTML 2 à 4 : au programme tant qu'aucun contenu n'est publié", () => {
    const html = staticCourses.find((c) => c.slug === "html")!;
    const f = empty();
    f.recorded[1] = "valide";
    expect(levelStates(html, f).map((x) => x.status)).toEqual(["valide", "au_programme", "au_programme", "au_programme"]);
  });
});

describe("test de positionnement", () => {
  const quiz = algo.placementTest!;
  const answer = (levelsRight: LevelNumber[]) =>
    Object.fromEntries(quiz.questions.map((q) => [q.id!, levelsRight.includes(q.level!) ? q.correct : [(q.correct[0] + 1) % q.choices.length]]));

  it("tout faux → niveau 1", () => {
    expect(scorePlacement(quiz, answer([])).recommended).toBe(1);
  });
  it("niveaux 1 et 2 réussis → niveau 3 recommandé", () => {
    const r = scorePlacement(quiz, answer([1, 2]));
    expect(r.recommended).toBe(3);
    expect(r.scores[1]).toEqual({ good: r.scores[1]!.total, total: r.scores[1]!.total });
  });
  it("niveau 2 réussi mais pas le 1 → niveau 1 (les niveaux s'acquièrent dans l'ordre)", () => {
    expect(scorePlacement(quiz, answer([2, 3, 4])).recommended).toBe(1);
  });
  it("tout juste → niveau 4", () => {
    expect(scorePlacement(quiz, answer([1, 2, 3, 4])).recommended).toBe(4);
  });
});
