import { describe, expect, it } from "vitest";
import { runPseudocode } from "./index";

const run = (src: string, stdin = "") => runPseudocode(src, stdin);

describe("interpréteur de pseudocode", () => {
  it("exécute un programme complet avec déclarations", () => {
    const r = run(`
ALGORITHME Somme
VARIABLES
  i, s : ENTIER
DEBUT
  s ← 0
  POUR i DE 1 A 10 FAIRE
    s ← s + i
  FINPOUR
  ECRIRE("Somme = ", s)
FIN`);
    expect(r.error).toBeNull();
    expect(r.stdout).toBe("Somme = 55\n");
  });

  it("accepte le mode script sans structure", () => {
    const r = run(`ECRIRE("Bonjour")\nx <- 2 * 3\nAFFICHER x`);
    expect(r.error).toBeNull();
    expect(r.stdout).toBe("Bonjour\n6\n");
  });

  it("lit les entrées et gère les conditions imbriquées", () => {
    const src = `
VARIABLES
  n : ENTIER
DEBUT
  LIRE(n)
  SI n > 0 ALORS
    ECRIRE("positif")
  SINON SI n < 0 ALORS
    ECRIRE("négatif")
  SINON
    ECRIRE("nul")
  FIN SI
FIN`;
    expect(run(src, "5").stdout).toBe("positif\n");
    expect(run(src, "-3").stdout).toBe("négatif\n");
    expect(run(src, "0").stdout).toBe("nul\n");
  });

  it("gère TANT QUE, REPETER et les mots composés", () => {
    const r = run(`
VAR i : ENTIER
DEBUT
  i ← 3
  TANT QUE i > 0 FAIRE
    ECRIRE(i)
    i ← i - 1
  FIN TANT QUE
  REPETER
    i ← i + 1
  JUSQU'A i >= 2
  ECRIRE(i)
FIN`);
    expect(r.error).toBeNull();
    expect(r.stdout).toBe("3\n2\n1\n2\n");
  });

  it("gère les tableaux et les fonctions", () => {
    const r = run(`
ALGORITHME Max
VARIABLES
  T : TABLEAU[1..5] DE ENTIER
  i : ENTIER
FONCTION maximum(A : TABLEAU DE ENTIER, n : ENTIER) : ENTIER
VARIABLES
  k, m : ENTIER
DEBUT
  m ← A[1]
  POUR k DE 2 A n FAIRE
    SI A[k] > m ALORS
      m ← A[k]
    FINSI
  FINPOUR
  RETOURNER m
FIN
DEBUT
  POUR i DE 1 A 5 FAIRE
    LIRE(T[i])
  FINPOUR
  ECRIRE("Max : ", maximum(T, 5))
FIN`, "4\n9\n2\n7\n1");
    expect(r.error).toBeNull();
    expect(r.stdout).toBe("Max : 9\n");
  });

  it("gère la récursivité et les procédures par référence", () => {
    const r = run(`
FONCTION fact(n : ENTIER) : ENTIER
DEBUT
  SI n <= 1 ALORS
    RETOURNER 1
  FINSI
  RETOURNER n * fact(n - 1)
FINFONCTION

PROCEDURE echanger(VAR a : ENTIER, VAR b : ENTIER)
VARIABLES t : ENTIER
DEBUT
  t ← a
  a ← b
  b ← t
FIN

VARIABLES
  x, y : ENTIER
DEBUT
  x ← 1
  y ← 2
  echanger(x, y)
  ECRIRE(x, " ", y, " ", fact(5))
FIN`);
    expect(r.error).toBeNull();
    expect(r.stdout).toBe("2 1 120\n");
  });

  it("gère SELON, DIV, MOD et les booléens", () => {
    const r = run(`
VARIABLES j : ENTIER
  pair : BOOLEEN
DEBUT
  j ← 17 DIV 5
  pair ← (17 MOD 2 = 0)
  SELON j
    CAS 1 : ECRIRE("un")
    CAS 2, 3 : ECRIRE("deux ou trois")
    AUTRE : ECRIRE("autre")
  FINSELON
  ECRIRE(pair, " ", NON pair ET VRAI)
FIN`);
    expect(r.error).toBeNull();
    expect(r.stdout).toBe("deux ou trois\nFAUX VRAI\n");
  });

  it("signale une variable non déclarée avec la ligne", () => {
    const r = run(`VARIABLES a : ENTIER\nDEBUT\n  b ← 3\nFIN`);
    expect(r.ok).toBe(false);
    expect(r.error?.line).toBe(3);
    expect(r.error?.message).toContain("non déclarée");
  });

  it("refuse un réel dans un ENTIER et suggère DIV", () => {
    const r = run(`VARIABLES a : ENTIER\nDEBUT\n  a ← 7 / 2\nFIN`);
    expect(r.ok).toBe(false);
    expect(r.error?.hint).toContain("DIV");
  });

  it("détecte un indice hors limites", () => {
    const r = run(`VARIABLES T : TABLEAU[1..3] DE ENTIER\nDEBUT\n  T[4] ← 1\nFIN`);
    expect(r.error?.message).toContain("hors limites");
  });

  it("arrête une boucle infinie", () => {
    const r = runPseudocode(`VARIABLES i : ENTIER\nDEBUT\n  i ← 0\n  TANTQUE VRAI FAIRE\n    i ← i + 1\n  FINTANTQUE\nFIN`, "", { maxSteps: 10_000 });
    expect(r.ok).toBe(false);
    expect(r.error?.message).toContain("Limite");
  });

  it("arrête une récursivité infinie", () => {
    const r = run(`FONCTION f(n : ENTIER) : ENTIER\nDEBUT\n  RETOURNER f(n + 1)\nFIN\nDEBUT\n  ECRIRE(f(1))\nFIN`);
    expect(r.ok).toBe(false);
    expect(r.error?.message).toContain("appels imbriqués");
  });

  it("signale les erreurs de syntaxe avec une aide", () => {
    const r = run(`VARIABLES x : ENTIER\nDEBUT\n  x = 3\nFIN`);
    expect(r.error?.kind).toBe("syntaxe");
    expect(r.error?.message).toContain("←");
    const r2 = run(`DEBUT\n  SI 1 < 2 ALORS\n    ECRIRE("ok")\nFIN`);
    expect(r2.error?.kind).toBe("syntaxe");
  });

  it("gère les chaînes, l'indexation et les fonctions prédéfinies", () => {
    const r = run(`
VARIABLES s : CHAINE
  i : ENTIER
DEBUT
  LIRE(s)
  POUR i DE LONGUEUR(s) A 1 PAS -1 FAIRE
    ECRIRE(s[i])
  FINPOUR
  ECRIRE(MAJUSCULE(s), " ", RACINE(16), " ", 2 ^ 10)
FIN`, "abc");
    expect(r.error).toBeNull();
    expect(r.stdout).toBe("c\nb\na\nABC 4 1024\n");
  });

  it("interdit la modification d'une constante", () => {
    const r = run(`CONSTANTES\n  N = 10\nDEBUT\n  N ← 5\nFIN`);
    expect(r.error?.message).toContain("constante");
  });

  it("formate les réels proprement", () => {
    const r = run(`ECRIRE(0.1 + 0.2)\nECRIRE(10 / 4)`);
    expect(r.stdout).toBe("0.3\n2.5\n");
  });
});
