import { describe, expect, it } from "vitest";
import { fixHint } from "./hints";
import { compileProject, runProject } from "./interpreter";

const hintOf = (code: string, inputs: string[] = []) => {
  const c = compileProject([{ name: "PRINCIPAL", main: true, code }]);
  const err = c.ok ? runProject([{ name: "PRINCIPAL", main: true, code }], inputs).error : c.error;
  expect(err, "une erreur est attendue").toBeTruthy();
  return { message: err!.message, hint: fixHint(err!.message, code.split("\n")[err!.line - 1] ?? "") };
};

describe("« Comment corriger » : chaque erreur propose quoi écrire", () => {
  it.each([
    ["fonction mal écrite", 'DÉBUT\n T = [1, 2]\n ÉCRIRE LONGEUR(T)\nFIN', /LONGUEUR/],
    ["tableau avec parenthèses", 'DÉBUT\n NOTE = [1, 2]\n ÉCRIRE NOTES(1)\nFIN', /NOTES\[i\]|NOTE/],
    ["instruction mal écrite", 'DÉBUT\n ECRIR "a"\nFIN', /ÉCRIRE/],
    ["ALORS oublié", 'DÉBUT\n SI 1 < 2\n  ÉCRIRE "a"\n FINSI\nFIN', /ALORS/],
    ["FAIRE oublié", "DÉBUT\n POUR i = 1 JUSQU'À 3\n  ÉCRIRE i\n FINPOUR\nFIN", /FAIRE/],
    ["FAIRE mal écrit", "DÉBUT\n POUR i = 1 JUSQU'À 3 FAIR\n  ÉCRIRE i\n FINPOUR\nFIN", /FAIRE au lieu de FAIR/],
    ["FINSI oublié (FIN trouvé)", 'DÉBUT\n SI 1 > 0 ALORS\n  ÉCRIRE "x"\nFIN', /Il manque FINSI/],
    ["FINPOUR oublié", "DÉBUT\n POUR i = 1 JUSQU'À 3 FAIRE\n  ÉCRIRE i\nFIN", /FINPOUR/],
    ["virgule oubliée dans ÉCRIRE", 'DÉBUT\n s = 3\n ÉCRIRE "Somme" s\nFIN', /virgule/],
    ["guillemet non fermé", 'DÉBUT\n ÉCRIRE "Bonjour\nFIN', /guillemet/],
    ["point-virgule", 'DÉBUT\n x = 1;\nFIN', /point-virgule/],
    ["valeur manquante", "DÉBUT\n x = \nFIN", /x = 0|valeur/],
    ["division par zéro", "DÉBUT\n b = 0\n ÉCRIRE 5 / b\nFIN", /diviseur/],
    ["texte + nombre", 'DÉBUT\n x = "a"\n ÉCRIRE x * 2\nFIN', /ENTIER|CHAÎNE/],
    ["position 0", "DÉBUT\n T = [1]\n ÉCRIRE T[0]\nFIN", /à partir de 1/],
  ])("%s", (_name, code, expected) => {
    const { message, hint } = hintOf(code);
    expect(hint, message).toMatch(expected);
  });

  it("TAILLE ne bloque plus : TAILLE(5), TAILLE(tableau), tableau jamais rempli", () => {
    const r = runProject([{ name: "PRINCIPAL", main: true, code: "DÉBUT\n ÉCRIRE TAILLE(5), TAILLE([4, 5, 6]), TAILLE(2.9)\n POUR i = 1 JUSQU'À TAILLE(VIDE) FAIRE\n  ÉCRIRE i\n FINPOUR\nFIN" }]);
    expect(r.error).toBeUndefined();
    expect(r.output).toBe("5 3 2\n");
  });
});
