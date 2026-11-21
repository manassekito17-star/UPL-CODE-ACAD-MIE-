import { describe, expect, it } from "vitest";
import { autoFix } from "./autofix";
import { runProject } from "./interpreter";

const fix = (code: string) => autoFix([{ name: "PRINCIPAL", main: true, code }], "PRINCIPAL");

describe("Corriger le code : l'éditeur réécrit le module corrigé", () => {
  it.each([
    ["fonction mal écrite", "DÉBUT\n  T = [1, 2]\n  ÉCRIRE LONGEUR(T)\nFIN", "DÉBUT\n  T = [1, 2]\n  ÉCRIRE LONGUEUR(T)\nFIN"],
    ["instruction mal écrite", 'DÉBUT\n  ECRIR "a"\nFIN', 'DÉBUT\n  ÉCRIRE "a"\nFIN'],
    ["ALORS oublié", 'DÉBUT\n  SI 1 < 2\n    ÉCRIRE "a"\n  FINSI\nFIN', 'DÉBUT\n  SI 1 < 2 ALORS\n    ÉCRIRE "a"\n  FINSI\nFIN'],
    ["FAIRE oublié", "DÉBUT\n  POUR i = 1 JUSQU'À 3\n    ÉCRIRE i\n  FINPOUR\nFIN", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\n  FINPOUR\nFIN"],
    ["FAIRE mal écrit", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIR\n    ÉCRIRE i\n  FINPOUR\nFIN", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\n  FINPOUR\nFIN"],
    ["FINSI oublié", 'DÉBUT\n  SI 1 < 2 ALORS\n    ÉCRIRE "a"\nFIN', 'DÉBUT\n  SI 1 < 2 ALORS\n    ÉCRIRE "a"\n  FINSI\nFIN'],
    ["FINPOUR oublié", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\nFIN", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\n  FINPOUR\nFIN"],
    ["virgule dans ÉCRIRE", 'DÉBUT\n  s = 3\n  ÉCRIRE "Somme = " s\nFIN', 'DÉBUT\n  s = 3\n  ÉCRIRE "Somme = ", s\nFIN'],
    ["guillemet non fermé", 'DÉBUT\n  ÉCRIRE "Bonjour\nFIN', 'DÉBUT\n  ÉCRIRE "Bonjour"\nFIN'],
    ["point-virgule", "DÉBUT\n  x = 1;\n  ÉCRIRE x\nFIN", "DÉBUT\n  x = 1\n  ÉCRIRE x\nFIN"],
  ])("%s", (_n, code, expected) => {
    const r = fix(code);
    expect(r?.code).toBe(expected);
    expect(r?.compiles).toBe(true);
  });

  it("plusieurs erreurs corrigées d'un coup, le programme s'exécute", () => {
    const code = "DÉBUT\n  somme = 0\n  POUR i = 1 JUSQU'À TAILE(3)\n    LIR n\n    somme = somme + n\n  SI somme > 10\n    ECRIR \"Grand : \" somme\n  FINSI\nFIN";
    const r = fix(code)!;
    expect(r.compiles).toBe(true);
    expect(r.changes.length).toBeGreaterThanOrEqual(5);
    const out = runProject([{ name: "PRINCIPAL", main: true, code: r.code }], ["4", "5", "6"]);
    expect(out.error).toBeUndefined();
    expect(out.output).toMatch(/Grand :\s+15/);
    // FINPOUR ferme la boucle avant le SI (d'après le décalage des lignes).
    expect(r.code.split("\n")[5]).toBe("  FINPOUR");
    expect(r.changes.filter((c) => c.line === 8)).toHaveLength(1);
    expect(r.changes.find((c) => c.line === 8)?.after).toBe('    ÉCRIRE "Grand : ", somme');
  });

  it("rien à corriger : null", () => {
    expect(fix('DÉBUT\n  ÉCRIRE "ok"\nFIN')).toBeNull();
  });
});

describe("Corriger le code : erreurs de logique (menu Correction)", () => {
  const prog = (inner: string, body = "som=som+T[i][j]") => `DEBUT\nsom=0\nT=[[8,16,12,9.8,10],[20,14,5.6,10.8,12],[8.9,11.5,12,9.8,14],[6,18,12.5,13,11]]\nPOUR i= 1 JUSQU'A 4 FAIRE\n  POUR ${inner}= 1 JUSQU'A 5 FAIRE\n    ${body}\n  FINPOUR\n    ECRIRE "somme ligne",i,"=",som\n    som=0\nFINPOUR\nFIN`;

  it("boucle intérieure qui réutilise i alors que j est utilisé : i → j, puis le programme donne les bonnes sommes", () => {
    const r = autoFix([{ name: "PRINCIPAL", main: true, code: prog("i") }], "PRINCIPAL")!;
    expect(r.code).toBe(prog("j"));
    expect(r.changes[0].line).toBe(5);
    expect(r.changes[0].why).toMatch(/réutilisait i/);
    const out = runProject([{ name: "PRINCIPAL", main: true, code: r.code }]);
    expect(out.error).toBeUndefined();
    expect(out.output.replace(/\s+/g, " ")).toContain("somme ligne 4 = 60.5");
  });

  it("variable mal écrite jamais initialisée : somme → som", () => {
    const r = autoFix([{ name: "PRINCIPAL", main: true, code: prog("j", "som=somm+T[i][j]") }], "PRINCIPAL")!;
    expect(r.code).toContain("som=som+T[i][j]");
  });

  it("programme correct : rien à corriger (ni A de JUSQU'A, ni j, ni fonctions)", () => {
    expect(autoFix([{ name: "PRINCIPAL", main: true, code: prog("j") }], "PRINCIPAL")).toBeNull();
    expect(autoFix([{ name: "PRINCIPAL", main: true, code: 'DÉBUT\n LIRE nom\n ÉCRIRE "Bonjour ", nom, LONGUEUR(nom)\n POUR k DE 1 A 3 FAIRE\n  ÉCRIRE k\n FINPOUR\nFIN' }], "PRINCIPAL")).toBeNull();
  });
});

describe("Corriger le code : T[i][j] sans boucle POUR j", () => {
  it("ajoute la boucle POUR j qui parcourt la ligne, le programme affiche les mois", () => {
    const code = `DÉBUT\n  T=[["JANVIER","FEVRIER","MARS"],["AVRIL","MAI","JUIN"],["JUILLET","AOUT","SEPTEMBRE"],["OCTOBRE","NOVEMBRE","DECEMBRE"]]\n  POUR i=1 jusqu'a 3 FAIRE\n    ECRIRE T[i][j]\n    FINPOUR\n  N=3\n  POUR i=1 jusqu'a N FAIRE\n    ECRIRE T[i][N]\n    N=n-1\n    FINPOUR\nFIN`;
    const r = autoFix([{ name: "PRINCIPAL", main: true, code }], "PRINCIPAL")!;
    expect(r.code.split("\n").slice(3, 6)).toEqual(["    POUR j=1 JUSQU'A TAILLE(T[i]) FAIRE", "      ECRIRE T[i][j]", "    FINPOUR"]);
    expect(r.changes).toHaveLength(1);
    const out = runProject([{ name: "PRINCIPAL", main: true, code: r.code }]);
    expect(out.error).toBeUndefined();
    expect(out.output.split("\n").slice(0, 4)).toEqual(["JANVIER", "FEVRIER", "MARS", "AVRIL"]);
  });
});
