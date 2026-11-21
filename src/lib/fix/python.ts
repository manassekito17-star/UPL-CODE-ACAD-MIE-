import { closest, mapOutsideStrings, mergeChanges, replaceWord, unclosedBrackets, unclosedQuote, indentOf, type Change, type FixResult } from "./common";

/**
 * Correction automatique de Python (sans l'exécuter) : deux-points oubliés, print sans parenthèses,
 * fautes de frappe courantes, = au lieu de ==, input(int(…)) inversé, guillemets et parenthèses non fermés.
 */

const TYPOS: Record<string, string> = {
  pritn: "print", prnit: "print", pirnt: "print", prnt: "print", prin: "print", Print: "print", PRINT: "print", pint: "print",
  imput: "input", inpt: "input", inptu: "input", Input: "input", INPUT: "input", intput: "input",
  rnage: "range", rang: "range", Range: "range", raneg: "range",
  lenght: "len", lengh: "len", Len: "len", lent: "len", length: "len",
  Int: "int", Float: "float", Str: "str", flaot: "float", flot: "float",
  true: "True", false: "False", null: "None", none: "None", TRUE: "True", FALSE: "False",
  esle: "else", eles: "else", fi: "if", whiel: "while", whlie: "while", retrun: "return", reutrn: "return", improt: "import", fro: "for", deff: "def",
};
/** Mots corrigés seulement devant une parenthèse (len(, int(…). */
const CALL_ONLY = new Set(["lenght", "lengh", "Len", "lent", "length", "Int", "Float", "Str", "Print", "Input", "Range", "prin", "pint", "fi", "fro"]);
const BLOCK = /^(\s*)(if|elif|else|for|while|def|class|try|except|finally|with)\b/;
const BUILTINS = ["print", "input", "int", "float", "str", "len", "range", "list", "dict", "set", "tuple", "abs", "round", "min", "max", "sum", "sorted", "enumerate", "zip", "type", "bool", "open", "isinstance", "map", "filter", "reversed", "chr", "ord", "True", "False", "None"];

/** Noms définis dans le programme (variables, fonctions, boucles, imports). */
function definedNames(code: string): string[] {
  const names = new Set<string>();
  for (const m of code.matchAll(/^\s*([A-Za-z_]\w*)\s*(?:[-+*/]?=)(?!=)/gm)) names.add(m[1]);
  for (const m of code.matchAll(/\b(?:def|class)\s+([A-Za-z_]\w*)/g)) names.add(m[1]);
  for (const m of code.matchAll(/\bfor\s+([A-Za-z_]\w*)(?:\s*,\s*([A-Za-z_]\w*))?\s+in\b/g)) [m[1], m[2]].forEach((n) => n && names.add(n));
  for (const m of code.matchAll(/\bimport\s+([\w, ]+)/g)) m[1].split(",").forEach((n) => names.add(n.trim().split(/\s+as\s+/).pop()!));
  for (const m of code.matchAll(/\bdef\s+\w+\s*\(([^)]*)\)/g)) m[1].split(",").forEach((p) => p.trim() && names.add(p.trim().split(/[=:]/)[0].trim()));
  return [...names];
}

export function autoFixPython(code: string, error?: { message: string; line: number }): FixResult | null {
  let lines = code.split("\n");
  const changes: Change[] = [];
  const note = (i: number, why: string) => changes.push({ line: i + 1, why });

  // Nom inconnu signalé à l'exécution : remplacé partout par le nom le plus proche.
  const unknown = error && /name '(\w+)' is not defined/.exec(error.message)?.[1];
  if (unknown) {
    const guess = TYPOS[unknown] ?? closest(unknown, [...BUILTINS, ...definedNames(code).filter((n) => n !== unknown)]);
    if (guess && guess !== unknown)
      lines = lines.map((l, i) => {
        let cur = l;
        for (let r = replaceWord(cur, unknown, guess, "#"); r !== null && r !== cur; r = replaceWord(cur, unknown, guess, "#")) cur = r;
        if (cur !== l) note(i, `${unknown} → ${guess}`);
        return cur;
      });
  }

  lines = lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    let l = line;
    // Commentaire écrit à la façon du JavaScript.
    if (/^\s*\/\//.test(l)) {
      note(i, "// remplacé par #");
      return l.replace("//", "#");
    }
    if (trimmed.startsWith("#")) return l;
    // Fautes de frappe courantes.
    l = mapOutsideStrings(
      l,
      (part) =>
        part.replace(/(^|[^\w.])([A-Za-z_]\w*)(?=(\s*\()?)/g, (m, pre: string, word: string, paren?: string) => {
          const to = TYPOS[word];
          if (!to || (CALL_ONLY.has(word) && !paren) || definedNames(code).includes(word)) return m;
          note(i, `${word} → ${to}`);
          return pre + to;
        }),
      "#",
    );
    // else if → elif ; && / || → and / or.
    if (/^\s*else\s+if\b/.test(l)) {
      l = l.replace(/else\s+if/, "elif");
      note(i, "else if → elif");
    }
    const ops = mapOutsideStrings(l, (p) => p.replace(/\s*&&\s*/g, " and ").replace(/\s*\|\|\s*/g, " or "), "#");
    if (ops !== l) {
      l = ops;
      note(i, "&& / || → and / or");
    }
    // print "x" → print("x")
    const pr = /^(\s*)print\s+(?!\()(.+?)\s*$/.exec(l);
    if (pr) {
      l = `${pr[1]}print(${pr[2]})`;
      note(i, "parenthèses ajoutées à print");
    }
    // input(int("…")) → int(input("…"))
    const inv = l.replace(/\binput\(\s*(int|float)\(\s*((?:"[^"]*"|'[^']*')?)\s*\)\s*\)/g, "$1(input($2))");
    if (inv !== l) {
      l = inv;
      note(i, "input(int(…)) → int(input(…))");
    }
    // = au lieu de == dans une condition.
    const cond = /^(\s*(?:if|elif|while)\b)(.*?)(:?\s*)$/.exec(l);
    if (cond) {
      const fixed = mapOutsideStrings(cond[2], (p) => p.replace(/([^=!<>+\-*/%])=(?!=)/g, "$1=="), "#");
      if (fixed !== cond[2]) {
        l = cond[1] + fixed + cond[3];
        note(i, "= remplacé par == dans la condition");
      }
    }
    // Guillemet non fermé.
    const q = unclosedQuote(l, "#");
    if (q) {
      const t = l.replace(/\s+$/, "");
      l = /\)\s*:?$/.test(t) ? t.replace(/(\)\s*:?)$/, `${q}$1`) : t + q;
      note(i, "guillemet fermé");
    }
    // Parenthèse non fermée en fin d'instruction (la ligne suivante n'est pas une suite).
    const missing = unclosedBrackets(l, "#");
    const next = lines.slice(i + 1).find((x) => x.trim());
    const continues = next !== undefined && (indentOf(next).length > indentOf(l).length || /^\s*[)\]}]/.test(next)) && !BLOCK.test(l);
    if (missing && !continues && !/[,(\[\\]\s*$/.test(l)) {
      const t = l.replace(/\s+$/, "");
      l = t.endsWith(":") && BLOCK.test(t) ? `${t.slice(0, -1)}${missing}:` : t + missing;
      note(i, `${missing} ajouté`);
    }
    // Deux-points oubliés après if / for / while / def / else…
    if (BLOCK.test(l) && !/:\s*(#.*)?$/.test(l) && !unclosedBrackets(l, "#") && !/[\\,]\s*$/.test(l)) {
      l = `${l.replace(/\s+$/, "")}:`;
      note(i, "deux-points « : » ajoutés");
    }
    return l;
  });

  if (!changes.length) return null;
  return { code: lines.join("\n"), changes: mergeChanges(changes), compiles: null };
}
