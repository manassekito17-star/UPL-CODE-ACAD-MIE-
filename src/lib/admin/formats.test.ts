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
