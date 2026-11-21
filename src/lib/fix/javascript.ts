import { closest, mapOutsideStrings, mergeChanges, replaceWord, unclosedBrackets, unclosedQuote, type Change, type FixResult } from "./common";

/**
 * Correction automatique de JavaScript : fautes de frappe (consol.log, fucntion, retrun…), = au lieu
 * de === dans une condition, guillemets / parenthèses / accolades non fermés. Vérifiée par l'analyse
 * syntaxique du navigateur (sans exécuter le code).
 */

const TYPOS: Record<string, string> = {
  consol: "console", cosnole: "console", conosle: "console", cnosole: "console", consloe: "console", Console: "console", consle: "console",
  fucntion: "function", funtion: "function", fonction: "function", functon: "function", funciton: "function",
  retrun: "return", reutrn: "return", retunr: "return", Return: "return",
  cosnt: "const", conts: "const", Const: "const", Let: "let", Var: "var",
  documnet: "document", docuemnt: "document", Document: "document",
  True: "true", False: "false", None: "null", TRUE: "true", FALSE: "false", Null: "null", NULL: "null",
  esle: "else", Else: "else", If: "if", fi: "if", whiel: "while", For: "for",
};
const PROPS: Record<string, string> = { lgo: "log", lg: "log", Log: "log", lenght: "length", lengh: "length", Length: "length", getElementByID: "getElementById", innerHtml: "innerHTML", addEventListner: "addEventListener", querySelecter: "querySelector", tostring: "toString", touppercase: "toUpperCase", tolowercase: "toLowerCase", pusch: "push" };
const GLOBALS = ["console", "document", "window", "Math", "Number", "String", "Array", "Object", "JSON", "parseInt", "parseFloat", "prompt", "alert", "setTimeout", "setInterval", "localStorage", "Date", "isNaN"];

/** Erreur de syntaxe (sans exécuter) ou null ; undefined si l'analyse n'est pas possible (modules import/export). */
export function jsSyntaxError(code: string): string | null | undefined {
  if (/^\s*(import|export)\b/m.test(code)) return undefined;
  try {
    // Analyse seulement : la fonction créée n'est jamais appelée.
    new Function(code);
    return null;
  } catch (e) {
    return e instanceof SyntaxError ? e.message : null;
  }
}

const declared = (code: string) => [...code.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);

export function autoFixJavaScript(code: string, error?: { message: string; line: number }): FixResult | null {
  let lines = code.split("\n");
  const changes: Change[] = [];
  const note = (i: number, why: string) => changes.push({ line: i + 1, why });
  const names = declared(code);

  const unknown = error && /(\w+) is not defined/.exec(error.message)?.[1];
  if (unknown) {
    const guess = TYPOS[unknown] ?? closest(unknown, [...GLOBALS, ...names.filter((n) => n !== unknown)]);
    if (guess && guess !== unknown)
      lines = lines.map((l, i) => {
        let cur = l;
        for (let r = replaceWord(cur, unknown, guess, "//"); r !== null && r !== cur; r = replaceWord(cur, unknown, guess, "//")) cur = r;
        if (cur !== l) note(i, `${unknown} → ${guess}`);
        return cur;
      });
  }

  lines = lines.map((line, i) => {
    if (!line.trim() || /^\s*(\/\/|\/\*|\*)/.test(line)) return line;
    let l = mapOutsideStrings(
      line,
      (part) =>
        part
          .replace(/(^|[^\w$.])([A-Za-z_$][\w$]*)/g, (m, pre: string, word: string) => {
            const to = TYPOS[word];
            if (!to || names.includes(word)) return m;
            note(i, `${word} → ${to}`);
            return pre + to;
          })
          .replace(/\.([A-Za-z_$][\w$]*)/g, (m, prop: string) => {
            const to = PROPS[prop];
            if (!to) return m;
            note(i, `.${prop} → .${to}`);
            return `.${to}`;
          }),
      "//",
    );
    // print(…) → console.log(…) si print n'est pas une fonction du programme.
    if (!names.includes("print") && /(^|[^\w.$])print\s*\(/.test(l)) {
      l = mapOutsideStrings(l, (p) => p.replace(/(^|[^\w.$])print\s*\(/g, "$1console.log("), "//");
      note(i, "print → console.log");
    }
    // = au lieu de === dans if / while.
    const cond = /^(\s*(?:}\s*else\s+)?(?:if|while)\s*\()(.*)(\)\s*\{?\s*)$/.exec(l);
    if (cond) {
      const fixed = mapOutsideStrings(cond[2], (p) => p.replace(/([^=!<>+\-*/%&|])=(?!=)/g, "$1==="), "//");
      if (fixed !== cond[2]) {
        l = cond[1] + fixed + cond[3];
        note(i, "= remplacé par === dans la condition");
      }
    }
    const q = unclosedQuote(l, "//");
    if (q) {
      const t = l.replace(/\s+$/, "");
      const m = /(\)?\s*;?\s*)$/.exec(t)![1];
      l = m.trim() ? t.slice(0, t.length - m.length) + q + m : t + q;
      note(i, "guillemet fermé");
    }
    const missing = unclosedBrackets(l, "//");
    if (missing && !/[,(\[]\s*$/.test(l) && !/=>\s*$/.test(l)) {
      const t = l.replace(/\s+$/, "");
      const tail = /(\s*\{|\s*;)$/.exec(t)?.[1] ?? "";
      l = t.slice(0, t.length - tail.length) + missing + tail;
      note(i, `${missing} ajouté`);
    }
    return l;
  });

  // Accolades non fermées : ajoutées à la fin.
  let depth = 0;
  for (const l of lines) mapOutsideStrings(l, (p) => {
    for (const c of p) depth += c === "{" ? 1 : c === "}" ? -1 : 0;
    return p;
  }, "//");
  if (depth > 0 && jsSyntaxError(lines.join("\n"))) {
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    for (let d = depth - 1; d >= 0; d--) {
      lines.push(`${"  ".repeat(d)}}`);
      note(lines.length - 1, "} ajoutée pour fermer le bloc");
    }
  }

  if (!changes.length) return null;
  const err = jsSyntaxError(lines.join("\n"));
  return { code: lines.join("\n"), changes: mergeChanges(changes), compiles: err === undefined ? null : err === null };
}
