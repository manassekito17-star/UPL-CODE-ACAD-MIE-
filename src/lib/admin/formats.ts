/**
 * Formats texte simples pour que les enseignants saisissent quiz et tests
 * sans écrire de JSON.
 *
 * Quiz :
 *   ? Énoncé de la question
 *   - mauvaise réponse
 *   + bonne réponse
 *   > explication (facultative)
 *   @ niveau 2        (test de positionnement : niveau évalué, 1 à 4)
 *
 * Tests :
 *   ### Test 1        (ajouter « [caché] » pour un test caché)
 *   <<<
 *   données d'entrée
 *   >>>
 *   sortie attendue
 */

export interface ParsedQuestion {
  prompt: string;
  choices: string[];
  correct: number[];
  explanation?: string;
  level?: 1 | 2 | 3 | 4;
}

export function parseQuizText(text: string): { questions: ParsedQuestion[]; errors: string[] } {
  const questions: ParsedQuestion[] = [];
  const errors: string[] = [];
  let cur: ParsedQuestion | null = null;
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("?")) {
      cur = { prompt: line.slice(1).trim(), choices: [], correct: [] };
      questions.push(cur);
    } else if (!cur) {
      errors.push(`Ligne ${i + 1} : une question doit commencer par « ? ».`);
    } else if (line.startsWith("+") || line.startsWith("-")) {
      if (line.startsWith("+")) cur.correct.push(cur.choices.length);
      cur.choices.push(line.slice(1).trim());
    } else if (line.startsWith("@")) {
      const m = line.match(/^@\s*niveau\s*([1-4])$/i);
      if (m) cur.level = Number(m[1]) as 1 | 2 | 3 | 4;
      else errors.push(`Ligne ${i + 1} : écrivez « @ niveau 1 » à « @ niveau 4 ».`);
    } else if (line.startsWith(">")) {
      cur.explanation = `${cur.explanation ? `${cur.explanation} ` : ""}${line.slice(1).trim()}`;
    } else {
      errors.push(`Ligne ${i + 1} : préfixe attendu (?, +, - ou >).`);
    }
  });
  questions.forEach((q, i) => {
    if (q.choices.length < 2) errors.push(`Question ${i + 1} : au moins deux choix sont nécessaires.`);
    if (q.correct.length === 0) errors.push(`Question ${i + 1} : indiquez au moins une bonne réponse avec « + ».`);
  });
  return { questions, errors };
}

export function serializeQuiz(questions: ParsedQuestion[]): string {
  return questions
    .map((q) =>
      [`? ${q.prompt}`, ...(q.level ? [`@ niveau ${q.level}`] : []), ...q.choices.map((c, k) => `${q.correct.includes(k) ? "+" : "-"} ${c}`), ...(q.explanation ? [`> ${q.explanation}`] : [])].join("\n"),
    )
    .join("\n\n");
}

export interface ParsedTest {
  input: string;
  expected: string;
  hidden: boolean;
}

export function parseTestsText(text: string): { tests: ParsedTest[]; errors: string[] } {
  const tests: ParsedTest[] = [];
  const errors: string[] = [];
  const blocks = text.replace(/\r\n?/g, "\n").split(/^###.*$/m);
  const headers = text.replace(/\r\n?/g, "\n").match(/^###.*$/gm) ?? [];
  headers.forEach((h, i) => {
    const body = blocks[i + 1] ?? "";
    const m = /^<<<\n?([\s\S]*?)\n?>>>\n?([\s\S]*)$/m.exec(body.replace(/^\n+/, ""));
    if (!m) {
      errors.push(`Test ${i + 1} : format attendu « <<< entrée >>> sortie ».`);
      return;
    }
    tests.push({ input: m[1], expected: m[2].replace(/\n+$/, ""), hidden: /\[cach[ée]\]/i.test(h) });
  });
  if (!headers.length && text.trim()) errors.push("Chaque test doit commencer par une ligne « ### Test ».");
  return { tests, errors };
}

export function serializeTests(tests: ParsedTest[]): string {
  return tests.map((t, i) => `### Test ${i + 1}${t.hidden ? " [caché]" : ""}\n<<<\n${t.input}\n>>>\n${t.expected}`).join("\n\n");
}

export function linesToArray(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}
