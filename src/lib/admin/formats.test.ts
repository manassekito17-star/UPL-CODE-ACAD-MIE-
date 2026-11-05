import { describe, expect, it } from "vitest";
import { parseQuizText, parseTestsText, serializeQuiz, serializeTests } from "./formats";

describe("formats d'édition", () => {
  it("analyse et resérialise un quiz", () => {
    const text = "? Que vaut 2 + 2 ?\n- 3\n+ 4\n> Addition simple.\n\n? Choisir les pairs\n+ 2\n- 3\n+ 4";
    const { questions, errors } = parseQuizText(text);
    expect(errors).toEqual([]);
    expect(questions).toHaveLength(2);
    expect(questions[0].correct).toEqual([1]);
    expect(questions[1].correct).toEqual([0, 2]);
    expect(parseQuizText(serializeQuiz(questions)).questions).toEqual(questions);
  });

  it("signale un quiz incomplet", () => {
    expect(parseQuizText("? Question\n- seul choix").errors.length).toBeGreaterThan(0);
  });

  it("analyse et resérialise des tests", () => {
    const text = "### Test 1\n<<<\n3\n4\n>>>\n7\n\n### Test 2 [caché]\n<<<\n\n>>>\nBonjour";
    const { tests, errors } = parseTestsText(text);
    expect(errors).toEqual([]);
    expect(tests).toEqual([
      { input: "3\n4", expected: "7", hidden: false },
      { input: "", expected: "Bonjour", hidden: true },
    ]);
    expect(parseTestsText(serializeTests(tests)).tests).toEqual(tests);
  });
});

describe("quiz étiqueté par niveau (test de positionnement)", () => {
  it("lit et réécrit l'étiquette « @ niveau n »", () => {
    const text = "? Que vaut 7 MOD 3 ?\n@ niveau 1\n- 2\n+ 1\n\n? Que contient un pointeur ?\n@ Niveau 3\n+ une adresse\n- une valeur";
    const r = parseQuizText(text);
    expect(r.errors).toEqual([]);
    expect(r.questions.map((q) => q.level)).toEqual([1, 3]);
    expect(parseQuizText(serializeQuiz(r.questions)).questions).toEqual(r.questions);
  });
  it("refuse un niveau invalide", () => {
    expect(parseQuizText("? Q\n@ niveau 7\n+ a\n- b").errors.join(" ")).toContain("@ niveau 1");
  });
});
