import { describe, expect, it } from "vitest";
import { runPseudocode } from "@/lib/pseudocode";
import { autoFixCode } from "./index";
import { jsSyntaxError } from "./javascript";

const algo = (body: string, vars = "") => `ALGORITHME T\n${vars ? `VARIABLES\n${vars}\n` : ""}DEBUT\n${body}\nFIN`;

describe("Corriger le code — pseudo-code de ZENTECH Algo", () => {
  it.each([
    ["ALORS oublié", algo('  SI x > 1\n    ECRIRE("a")\n  FINSI', "  x : ENTIER"), 'SI x > 1 ALORS'],
    ["FINPOUR oublié", algo("  POUR i DE 1 A 3 FAIRE\n    ECRIRE(i)", "  i : ENTIER"), "  FINPOUR"],
    ["FINSI oublié", algo('  SI x > 1 ALORS\n    ECRIRE("a")', "  x : ENTIER"), "  FINSI"],
    ["virgule", algo('  ECRIRE("a" s)', "  s : ENTIER"), 'ECRIRE("a", s)'],
    ["guillemet", algo('  ECRIRE("a)'), 'ECRIRE("a")'],
    ["parenthèse", algo('  ECRIRE("a"'), 'ECRIRE("a")'],
    ["ECRIR(", algo('  ECRIR("a")'), 'ECRIRE("a")'],
  ])("%s", async (_n, code, expected) => {
    const r = autoFixCode("pseudocode", code);
    expect(r?.code).toContain(expected);
    expect(r?.compiles).toBe(true);
    const run = await runPseudocode(r!.code, "");
    expect(run.error?.kind).not.toBe("syntaxe");
  });

  it("fonction inconnue signalée à l'exécution", () => {
    const code = algo('  s ← LONGEUR("ab")', "  s : ENTIER");
    expect(autoFixCode("pseudocode", code, { message: "Fonction « LONGEUR » inconnue.", line: 5 })?.code).toContain('LONGUEUR("ab")');
  });
});

describe("Corriger le code — Python", () => {
  it.each([
    ["deux-points", "x = 3\nif x > 2\n    print(x)", "if x > 2:"],
    ["for sans deux-points", "for i in range(3)\n    print(i)", "for i in range(3):"],
    ["else if", "x = 1\nif x > 2:\n    pass\nelse if x < 0:\n    pass", "elif x < 0:"],
    ["print sans parenthèses", 'print "Bonjour"', 'print("Bonjour")'],
    ["faute de frappe", 'pritn("a")', 'print("a")'],
    ["input(int(...)) inversé", 'age = input(int("Âge : "))', 'age = int(input("Âge : "))'],
    ["= dans la condition", "x = 3\nif x = 3:\n    print(x)", "if x == 3:"],
    ["true/false", "ok = true", "ok = True"],
    ["guillemet non fermé", 'print("Bonjour)', 'print("Bonjour")'],
    ["parenthèse non fermée", "print(len([1, 2])", "print(len([1, 2]))"],
    ["// commentaire", "// calcul\nx = 1", "# calcul"],
    ["&&", "x = 1\nif x > 0 && x < 5:\n    pass", "if x > 0 and x < 5:"],
  ])("%s", (_n, code, expected) => {
    expect(autoFixCode("python", code)?.code).toContain(expected);
  });

  it("nom inconnu à l'exécution : variable mal écrite remplacée", () => {
    const code = "somme = 0\nfor n in [1, 2]:\n    some = somme + n\nprint(somm)";
    expect(autoFixCode("python", code, { message: "NameError: name 'somm' is not defined", line: 4 })?.code).toContain("print(somme)");
  });

  it("ne touche pas aux chaînes ni au code correct", () => {
    expect(autoFixCode("python", 'print("if x = 3 pritn")\nfor i in range(2):\n    print(i)')).toBeNull();
  });
});

describe("Corriger le code — JavaScript", () => {
  it.each([
    ["consol.lgo", 'consol.lgo("a");', 'console.log("a");'],
    ["fucntion / retrun", "fucntion double(x) {\n  retrun x * 2;\n}", "function double(x) {\n  return x * 2;\n}"],
    ["= dans if", "let x = 1;\nif (x = 2) {\n  console.log(x);\n}", "if (x === 2) {"],
    ["guillemet", 'console.log("a);', 'console.log("a");'],
    ["parenthèse", 'console.log("a";', 'console.log("a");'],
    ["accolade finale", "function f() {\n  if (true) {\n    console.log(1);\n", "  }\n}"],
    ["print", 'print("a");', 'console.log("a");'],
    [".lenght", "const t = [1];\nconsole.log(t.lenght);", "t.length"],
  ])("%s", (_n, code, expected) => {
    const r = autoFixCode("javascript", code);
    expect(r?.code).toContain(expected);
    expect(r?.compiles).toBe(true);
    expect(jsSyntaxError(r!.code)).toBeNull();
  });

  it("variable mal écrite signalée à l'exécution", () => {
    const code = "const total = 5;\nconsole.log(totl);";
    expect(autoFixCode("javascript", code, { message: "ReferenceError: totl is not defined", line: 2 })?.code).toContain("console.log(total)");
  });
});
