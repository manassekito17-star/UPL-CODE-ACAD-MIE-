import { describe, expect, it } from "vitest";
import { compileProject, runProject, type SourceModule } from "./interpreter";

const main = (code: string): SourceModule[] => [{ name: "PRINCIPAL", main: true, code }];
const run = (code: string, inputs: string[] = [], extra: SourceModule[] = []) => runProject([...main(code), ...extra], inputs);
const out = (code: string, inputs: string[] = [], extra: SourceModule[] = []) => {
  const r = run(code, inputs, extra);
  if (r.error) throw new Error(`${r.error.module}:${r.error.line} ${r.error.message}`);
  return r.output;
};

describe("langage classique (compatible LARP) — exemples du guide", () => {
  it("Bonjour le monde, commentaires, accents facultatifs et casse ignorée", () => {
    expect(out('\\\\ Pseudo-code tout bête!\nDÉBUT\n  ÉCRIRE "Bonjour le monde!"   \\\\ fin de ligne\nFIN')).toBe("Bonjour le monde!\n");
    expect(out('debut\n  ecrire "ok"\nfin')).toBe("ok\n");
  });

  it("ÉCRIRE plusieurs valeurs, ligne vide, MAXIMUM, prolongation $", () => {
    expect(out('DÉBUT\n a = 100\n ÉCRIRE "ALLO"\n ÉCRIRE\n ÉCRIRE 1, 10+2, a * 2\nFIN')).toBe("ALLO\n\n1 12 200\n");
    expect(out('DÉBUT\n ÉCRIRE "Maximum = ", MAXIMUM(12, 2, 9)\nFIN')).toBe("Maximum =  12\n");
    expect(out('DÉBUT\n LIRE a, b, c\n ÉCRIRE "Max ", a, ", ", $\n   c, " est ", MAXIMUM(a, b, c)\nFIN', ["3 9 4"])).toBe("3 9 4\nMax  3 ,  4  est  9\n");
  });

  it("opérateurs arithmétiques et priorités", () => {
    expect(out("DÉBUT\n ÉCRIRE 7/5\n ÉCRIRE 7//5\n ÉCRIRE 7%5\n ÉCRIRE 2^5\n ÉCRIRE 4+8/2+1\n ÉCRIRE (4+8)/(2+1)\n ÉCRIRE 14.8%5\nFIN")).toBe("1.4\n1\n2\n32\n9\n4\n4\n");
  });

  it("conversions de types avec + (règles documentées)", () => {
    const code = 'DÉBUT\n a = "12" + 10\n b = 10 + "12"\n c = "12z" + 10\n d = "12" + "10"\n e = d + 2000\n f = "12" + "10" + 5\n g = "x" + 2\n ÉCRIRE a, b, c, d, e, f, g\nFIN';
    expect(out(code)).toBe("22 22 12z10 1210 3210 1215 x2\n");
  });

  it("conteneurs : accès, ajout, DÉTRUIRE (#IND), COMPRESSER, concaténation, différence", () => {
    expect(out("DÉBUT\n a = [10, 20, 30, 40]\n DÉTRUIRE a[3]\n ÉCRIRE a\n a[3] = 30\n ÉCRIRE a\n a[6] = 60\n ÉCRIRE CAPACITÉ(a), COMPTER(a)\n COMPRESSER a\n ÉCRIRE a\nFIN")).toBe(
      "[10 20 #IND 40]\n[10 20 30 40]\n6 5\n[10 20 30 40 60]\n",
    );
    expect(out("DÉBUT\n a = [20, 30] + [30, 40]\n b = 10 + a + 50\n ÉCRIRE b\n c = [1, 2, 3, 2, 4] - [2, 5]\n ÉCRIRE c, c - 3\n ÉCRIRE CAPACITÉ([1, , 3, ]), COMPTER([1, , 3, ])\nFIN")).toBe(
      "[10 20 30 30 40 50]\n[1 3 4] [1 4]\n4 2\n",
    );
    expect(out('DÉBUT\n a = [10, 2.3E-12, "Lundi", -17, 0.234]\n b = a[1] - 3\n ÉCRIRE b, a[3]\nFIN')).toBe("7 Lundi\n");
  });

  it("REQUÊTE et LIRE : types lus, valeurs superflues ignorées, attente si insuffisant", () => {
    const r = run('DÉBUT\n REQUÊTE "Entrez un nombre: ", Nombre\n ÉCRIRE Nombre * 2\n LIRE a, b, c\n ÉCRIRE a, b, c\n SI a EST CHAÎNE ET b EST ENTIER ET c EST FLOTTANT ALORS\n  ÉCRIRE "types ok"\n FINSI\nFIN', ["17", "Allo 234", "-14.78 superflu"]);
    expect(r.error).toBeUndefined();
    expect(r.output).toBe("Entrez un nombre: 17\n34\nAllo 234\n-14.78 superflu\nAllo 234 -14.78\ntypes ok\n");
    const w = run("DÉBUT\n LIRE x\nFIN");
    expect(w.waitingInput).toBe(true);
  });

  it("SÉPARATEUR : écriture et lecture d'une chaîne avec espaces", () => {
    const r = out('DÉBUT\n ÉCRIRE 10, 20\n SÉPARATEUR ","\n ÉCRIRE 10, 20\n LIRE Nom\n ÉCRIRE "Nom relu = " + Nom\nFIN', ["Gustave Labrie"]);
    expect(r).toBe("10 20\n10,20\nGustave Labrie\nNom relu = Gustave Labrie\n");
  });

  it("SI / SINON SI / SINON et opérateurs logiques", () => {
    const code = "DÉBUT\n LIRE x\n SI x < 0 ALORS\n  ÉCRIRE -1\n SINON SI x > 0 ALORS\n  ÉCRIRE 1\n SINON\n  ÉCRIRE 0\n FINSI\n SI x > 0 ET x < 100 OU x = -5 ALORS\n  ÉCRIRE \"dans\"\n FINSI\n SI !(x EST ENTIER) ALORS\n  ÉCRIRE \"pas entier\"\n FINSI\nFIN";
    expect(out(code, ["-5"])).toBe("-5\n-1\ndans\n");
    expect(out(code, ["7"])).toBe("7\n1\ndans\n");
    expect(out(code, ["0"])).toBe("0\n0\n");
    expect(out(code, ["2.5"])).toBe("2.5\n1\ndans\npas entier\n");
  });

  it("SÉLECTIONNER avec plusieurs constantes et SINON", () => {
    const code = "DÉBUT\n LIRE V1, V2, Op\n SÉLECTIONNER Op\n  '+' : R = V1 + V2\n  '-' : R = V1 - V2\n  '*', 'x' : R = V1 * V2\n  SINON\n   R = \"Opérateur erroné\"\n FINSÉLECTIONNER\n ÉCRIRE R\nFIN";
    expect(out(code, ["6 7 x"]).split("\n")[1]).toBe("42");
    expect(out(code, ["6 7 -"]).split("\n")[1]).toBe("-1");
    expect(out(code, ["6 7 ?"]).split("\n")[1]).toBe("Opérateur erroné");
  });

  it("Syracuse (TANTQUE, modulo, !=) — exemple publié", () => {
    const code = 'DÉBUT\n ÉCRIRE "Algorithme de Syracuse"\n REQUÊTE "Entrez un nombre entier ", a\n TANTQUE a!=1 FAIRE\n  SI a%2=0 ALORS\n   a=a/2\n   ÉCRIRE a\n  SINON\n   a=3*a+1\n   ÉCRIRE a\n  FINSI\n FINTANTQUE\nFIN';
    expect(out(code, ["6"])).toBe("Algorithme de Syracuse\nEntrez un nombre entier 6\n3\n10\n5\n16\n8\n4\n2\n1\n");
  });

  it("POUR (incrément par défaut, négatif) et RÉPÉTER-JUSQU'À", () => {
    expect(out("DÉBUT\n POUR Celsius = 0 JUSQU'À 2 FAIRE\n  F = Celsius * 9/5 + 32\n  ÉCRIRE Celsius, ' = ', F\n FINPOUR\n ÉCRIRE Celsius\nFIN")).toBe("0  =  32\n1  =  33.8\n2  =  35.6\n3\n");
    expect(out("DÉBUT\n POUR i = 10 JUSQU'A 1 INCREMENT -3 FAIRE\n  ÉCRIRE i\n FINPOUR\nFIN")).toBe("10\n7\n4\n1\n");
    expect(out("DÉBUT\n n = 1\n RÉPÉTER\n  n = n * 2\n JUSQU'À n > 20\n ÉCRIRE n\nFIN")).toBe("32\n");
  });

  it("modules : paramètres valeurs, références, valeur de retour, invocation alternative, récursivité", () => {
    const aux: SourceModule[] = [
      { name: "Interchanger", main: false, code: "ENTRER RÉFÉRENCE V1, RÉFÉRENCE V2\n Temp = V1\n V1 = V2\n V2 = Temp\nRETOURNER" },
      { name: "SansChangement", main: false, code: "ENTRER Lettre, Nombre\n Lettre = 'A'\n Nombre = 32\nRETOURNER" },
      { name: "Factorielle", main: false, code: "ENTRER n\n SI n <= 1 ALORS\n  R = 1\n SINON\n  R = n * Factorielle(n - 1)\n FINSI\nRETOURNER R" },
    ];
    const code = "DÉBUT\n N1 = 1\n N2 = 2\n EXÉCUTER Interchanger(N1, N2)\n ÉCRIRE N1, N2\n Lettre = 'B'\n Nombre = 12\n EXÉCUTER SansChangement(Lettre, Nombre)\n ÉCRIRE Lettre, Nombre\n ÉCRIRE EXÉCUTER Factorielle(12)\n x = Factorielle(5)\n ÉCRIRE x\nFIN";
    expect(out(code, [], aux)).toBe("2 1\nB 12\n479001600\n120\n");
  });

  it("variables locales distinctes entre modules", () => {
    const aux: SourceModule[] = [{ name: "Module_A", main: false, code: "ENTRER\n Valeur = 2\nRETOURNER" }];
    expect(out("DÉBUT\n Valeur = 1\n EXÉCUTER Module_A\n ÉCRIRE Valeur\nFIN", [], aux)).toBe("1\n");
  });

  it("fonctions prédéfinies (valeurs du guide)", () => {
    const code = [
      "DÉBUT",
      ' ÉCRIRE ABSOLU(-3.2), ABS(17+4), ABSOLU("-4.1")',
      ' ÉCRIRE ARRONDIR(11.32), ARR("-1.5"), PLANCHER(11.32), PLAN("-1.5"), PLAFOND(12.1)',
      ' ÉCRIRE RACINE(100), RACINE("5.5"), LOG10(100), LOGE(EXP)',
      ' ÉCRIRE POSITION("le", "Bonjour le monde!"), POSITION(3, [1, 2, [3, 4], 3, 5]), POSITION(4, [1, 2, [3, 4], 3, 5]), POS([3, 4], [1, 2, [3, 4], 3, 5])',
      ' ÉCRIRE SOUSENSEMBLE("Bonjour le monde!", 12, 5)',
      ' ÉCRIRE SOUSENSEMBLE([10, 20, 30, 40, 50], 2, "3")',
      ' ÉCRIRE LONGUEUR("Bonjour le monde!"), ENCHAÎNE([1, ["Bye", 3], 4]), MAJUSCULES("abc"), MINUSCULES("DeF")',
      ' SÉPARATEUR ","',
      ' ÉCRIRE ENCARACTÈRES("Bravo!")',
      ' ÉCRIRE ENCARAC([1, ["Bye", 3], 4])',
      " ÉCRIRE COSINUS(1 + 0.2), SINUS(1.2), EXP",
      "FIN",
    ].join("\n");
    expect(out(code).split("\n")).toEqual([
      "3.2 21 4.1",
      "11 -2 11 -2 13",
      "10 2.34520787991171 2 1",
      "9 4 0 3",
      "monde",
      "[20 30 40]",
      "17 1Bye34 ABC def",
      "[B,r,a,v,o,!]",
      "[1,B,y,e,3,4]",
      "0.362357754476674,0.932039085967226,2.71828182845905",
      "",
    ]);
  });

  it("FORMATER (exemples du guide)", () => {
    const code = [
      "DÉBUT",
      " ÉCRIRE FORMATER(' 1. ***%8d***', 999)",
      " ÉCRIRE FORMATER(' 2. ***%8.7d***', 999)",
      " ÉCRIRE FORMATER(' 3. ***%-8d***', 999)",
      " ÉCRIRE FORMATER(' 4. ***%e***', -999.99)",
      " ÉCRIRE FORMATER(' 5. ***%14.5e***', -999.99)",
      " ÉCRIRE FORMATER(' 8. ***%14.5f***', -999.99)",
      " ÉCRIRE FORMATER('10. ***%g***', -999.99)",
      " ÉCRIRE FORMATER('12. ***%8n***', 99999.99)",
      ' ÉCRIRE FORMATER(\'15. ***%10s***\', "Allo")',
      " ÉCRIRE FORMATER('17. ***%x***', 123)",
      "FIN",
    ].join("\n");
    expect(out(code).split("\n").slice(0, -1)).toEqual([
      " 1. ***     999***",
      " 2. *** 0000999***",
      " 3. ***999     ***",
      " 4. ***-9.99990000000000E+002***",
      " 5. ***  -9.9999E+002***",
      " 8. ***    -999.99000***",
      "10. ***-999.99***",
      "12. ***99,999.99***",
      "15. ***      Allo***",
      "17. ***7B***",
    ]);
  });

  it("tampons d'entrées/sorties : lecture jusqu'à FINDECONTENU, écriture", () => {
    const r = runProject(
      main('DÉBUT\n OUVRIR TAMPON "DONNEES" SUR 3 EN LECTURE\n OUVRIR "SORTIE" SUR 4 EN ÉCRITURE\n s = 0\n TANTQUE !FINDECONTENU(3) FAIRE\n  LIRE v DE 3\n  s = s + v\n  ÉCRIRE v * 10 DANS 4\n FINTANTQUE\n FERMER 3, 4\n ÉCRIRE "Somme", s\nFIN'),
      [],
      { buffers: [{ name: "DONNEES", content: "4\n5\n\n6\n" }, { name: "SORTIE", content: "ancien" }] },
    );
    expect(r.error).toBeUndefined();
    expect(r.output).toBe("Somme 15\n");
    expect(r.buffers.find((b) => b.name === "SORTIE")?.content).toBe("40\n50\n60\n");
  });

  it("variable indéfinie : #IND et avertissement", () => {
    const r = run("DÉBUT\n ÉCRIRE z\nFIN");
    expect(r.output).toBe("#IND\n");
    expect(r.warnings[0]).toMatch(/z est indéfinie/);
  });

  it("tolérances : TANT QUE, FIN SI, ← et ==", () => {
    expect(out("DÉBUT\n i ← 0\n TANT QUE i < 2 FAIRE\n  SI i == 1 ALORS\n   ÉCRIRE \"un\"\n  FIN SI\n  i = i + 1\n FIN TANTQUE\nFIN")).toBe("un\n");
  });
});

describe("messages d'erreur (compilation et exécution)", () => {
  const compileErr = (code: string, extra: SourceModule[] = []) => {
    const r = compileProject([...main(code), ...extra]);
    if (r.ok) throw new Error("devrait échouer");
    return `${r.error.line}: ${r.error.message}`;
  };

  it("structure du module principal", () => {
    expect(compileErr('ÉCRIRE "x"\nFIN')).toMatch(/^1: .*DÉBUT/);
    expect(compileErr('DÉBUT\n ÉCRIRE "x"')).toMatch(/FIN manquante/);
    expect(compileErr("DÉBUT\n SI x > 1 ALORS\n  ÉCRIRE x\nFIN")).toMatch(/^4: FINSI attendu/);
    expect(compileErr("DÉBUT\n TANTQUE x > 1\n FINTANTQUE\nFIN")).toMatch(/^2: FAIRE attendu/);
  });

  it("chaîne non terminée, comparaisons enchaînées, mot réservé comme variable", () => {
    expect(compileErr('DÉBUT\n ÉCRIRE "abc\nFIN')).toMatch(/^2: Chaîne/);
    expect(compileErr("DÉBUT\n SI 5 < a < 10 ALORS\n FINSI\nFIN")).toMatch(/enchaînés/);
    expect(compileErr("DÉBUT\n max = 3\nFIN")).toMatch(/fonction prédéfinie/);
  });

  it("liage : module inexistant, nombre d'arguments, référence", () => {
    expect(compileErr("DÉBUT\n EXÉCUTER Inconnu\nFIN")).toMatch(/inexistant/);
    expect(compileErr("DÉBUT\nFIN", [{ name: "Ajout", main: false, code: "ENTRER\nRETOURNER" }])).toMatch(/mot réservé/);
    const aux = [{ name: "Additionner", main: false, code: "ENTRER a, RÉFÉRENCE b\n b = a + b\nRETOURNER" }];
    expect(compileErr("DÉBUT\n EXÉCUTER Additionner(1)\nFIN", aux)).toMatch(/attend 2 arguments/);
    expect(compileErr("DÉBUT\n EXÉCUTER Additionner(1, 2)\nFIN", aux)).toMatch(/référence/);
  });

  it("erreurs d'exécution localisées (module et ligne)", () => {
    const r = run("DÉBUT\n a = 0\n b = 5 / a\nFIN");
    expect(r.error?.message).toMatch(/Division par zéro/);
    expect(r.error?.line).toBe(3);
    const o = run("DÉBUT\n a = 2147483647\n a = a + 1\nFIN");
    expect(o.error?.message).toMatch(/Débordement/);
    const c = run("DÉBUT\n a = 5\n b = a + z\nFIN");
    expect(c.error?.message).toMatch(/indéfinie/);
    const l = run("DÉBUT\n TANTQUE 1 = 1 FAIRE\n  x = 1\n FINTANTQUE\nFIN");
    expect(l.error?.message).toMatch(/boucle infinie/);
  });
});
