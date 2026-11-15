import { describe, expect, it } from "vitest";
import { BUILTIN_NAMES, runPseudocode } from "./index";
import { FUNCTION_DOCS } from "./functions";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const out = (body: string, decl = "") => {
  const r = runPseudocode(`ALGORITHME T\nVARIABLES\n  t : TABLEAU[1..4] DE ENTIER\n${decl}\nDEBUT\n${body}\nFIN`);
  if (r.error) throw new Error(`${r.error.line}: ${r.error.message}`);
  return r.stdout.trim().split("\n");
};

describe("fonctions prédéfinies : documentation complète", () => {
  it("chaque fonction documentée (et ses autres noms) existe dans l'interpréteur", () => {
    const names = new Set(BUILTIN_NAMES.map(norm));
    for (const f of FUNCTION_DOCS) for (const n of [f.name, ...(f.aliases ?? [])]) expect(names.has(norm(n)), n).toBe(true);
  });
});

describe("fonctions prédéfinies : résultats", () => {
  it("nombres", () => {
    expect(
      out(
        [
          'ECRIRE(RACINE(16), " ", ABS(-3), " ", ENT(3.7), " ", PLAFOND(3.2), " ", TRONQUER(-3.7))',
          'ECRIRE(ARRONDI(2.5), " ", ARRONDI(-2.5), " ", ARRONDI(3.14159, 2), " ", PUISSANCE(2, 10), " ", CARRE(5), " ", CUBE(2))',
          'ECRIRE(MIN(4, 2, 9), " ", MAX(4, 2, 9), " ", RESTE(17, 5), " ", QUOTIENT(17, 5), " ", PGCD(12, 18), " ", PPCM(4, 6), " ", FACTORIELLE(5))',
          'ECRIRE(EST_PAIR(4), " ", EST_IMPAIR(4), " ", EST_PREMIER(13), " ", EST_PREMIER(12), " ", SIGNE(-8))',
          'ECRIRE(ARRONDI(PI, 4), " ", ARRONDI(EXP(1), 3), " ", LN(1), " ", LOG10(1000), " ", LOG2(8))',
        ].join("\n"),
      ),
    ).toEqual(["4 3 3 4 -3", "3 -3 3.14 1024 25 8", "2 9 2 3 6 12 120", "VRAI FAUX VRAI FAUX -1", "3.1416 2.718 0 3 3"]);
  });

  it("trigonométrie (accents acceptés)", () => {
    expect(out('ECRIRE(SIN(0), " ", COS(0), " ", ARRONDI(TAN(PI / 4), 6), " ", DEGRÉS(PI), " ", ARRONDI(RADIANS(180), 4), " ", ARRONDI(ARCTAN(1) * 4, 4))')).toEqual(["0 1 1 180 3.1416 3.1416"]);
  });

  it("chaînes", () => {
    expect(
      out(
        [
          'ECRIRE(LONGUEUR("Bonjour"), " ", MAJUSCULE("abc"), " ", MINUSCULE("DeF"), " ", CAPITALISER("kINSHASA"))',
          'ECRIRE(SOUSCHAINE("Bonjour", 4, 4), " ", GAUCHE("Bonjour", 3), " ", DROITE("Bonjour", 4))',
          'ECRIRE(POSITION("jour", "Bonjour"), " ", TROUVE("Bonjour", "x"), " ", CONTIENT("Lubumbashi", "bash"), " ", COMMENCE_PAR("UPL", "U"), " ", FINIT_PAR("UPL", "X"))',
          'ECRIRE(REMPLACER("a-b-c", "-", "+"), " ", INVERSER("radar2"), " [", SUPPRIMER_ESPACES("  x  "), "] ", DUPLIQUER("ab", 3), " ", CONCAT("a", 1, VRAI))',
          'ECRIRE(ORD("A"), " ", CHR(66), " ", NOMBRE("3,5") + 1, " ", EST_NUMERIQUE("12"), " ", EST_NUMÉRIQUE("douze"), " ", CHAINE(42) + "!")',
        ].join("\n"),
      ),
    ).toEqual(["7 ABC def Kinshasa", "jour Bon jour", "4 0 VRAI VRAI FAUX", "a+b+c 2radar [x] ababab a1VRAI", "65 B 4.5 VRAI FAUX 42!"]);
  });

  it("tableaux : SOMME, MOYENNE, MIN, MAX, INVERSER", () => {
    expect(out('t[1] ← 4\nt[2] ← 8\nt[3] ← 1\nt[4] ← 7\nECRIRE(SOMME(t), " ", MOYENNE(t), " ", MIN(t), " ", MAX(t), " ", INVERSER(t))')).toEqual(["20 5 1 8 [7, 1, 8, 4]"]);
  });

  it("date et heure : valeurs plausibles", () => {
    const [l] = out('ECRIRE(ANNEE() >= 2024, " ", MOIS() >= 1 ET MOIS() <= 12, " ", HEURE() < 24, " ", LONGUEUR(DATE()))');
    expect(l).toBe("VRAI VRAI VRAI 10");
  });

  it("PI sans parenthèses, mais une variable PI déclarée reste prioritaire", () => {
    expect(out("ECRIRE(ARRONDI(PI, 2))")).toEqual(["3.14"]);
    expect(out("pi ← 3\nECRIRE(pi)", "  pi : ENTIER")).toEqual(["3"]);
  });

  it("erreurs claires", () => {
    const r = runPseudocode('ALGORITHME E\nDEBUT\n  ECRIRE(RACINE(-1))\nFIN');
    expect(r.error?.message).toMatch(/négatif/);
    const r2 = runPseudocode('ALGORITHME E\nDEBUT\n  ECRIRE(LN(0))\nFIN');
    expect(r2.error?.message).toMatch(/LN/);
  });
});
