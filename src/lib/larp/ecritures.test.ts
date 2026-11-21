import { describe, expect, it } from "vitest";
import { runProject } from "./interpreter";

/**
 * Écritures courantes des cours d'algorithmique et des étudiants (accents, synonymes, sections
 * d'en-tête, opérateurs alternatifs…) : toutes doivent s'exécuter sans erreur, comme dans LARP.
 */
const cases: Array<[string, string, string[]]> = [
  ["accents/minuscules", 'debut\n ecrire "ok"\nfin', []],
  ["Ecrire(...) parenthèses", 'DEBUT\n Ecrire("a", 1+2)\nFIN', []],
  ["LIRE nombre puis calcul", 'DEBUT\n Lire n\n Ecrire n*2\nFIN', ["21"]],
  ["LIRE virgule décimale", 'DEBUT\n Lire n\n Ecrire n*2\nFIN', ["2,5"]],
  ["LIRE 2 valeurs une ligne", 'DEBUT\n Lire a, b\n Ecrire a+b\nFIN', ["3 4"]],
  ["LIRE 2 valeurs 2 lignes", 'DEBUT\n Lire a, b\n Ecrire a+b\nFIN', ["3", "4"]],
  ["<- et ←", 'DEBUT\n a <- 2\n b ← 3\n Ecrire a+b\nFIN', []],
  ["== != <> ≠", 'DEBUT\n SI 1 == 1 ET 2 != 3 ET 2 <> 4 ET 5 ≠ 6 ALORS\n  Ecrire "oui"\n FINSI\nFIN', []],
  ["<= >= ≤ ≥", 'DEBUT\n SI 1 <= 2 ET 3 ≥ 2 ET 1 ≤ 1 ALORS\n  Ecrire "oui"\n FINSI\nFIN', []],
  ["NON", 'DEBUT\n x = FAUX\n SI NON x ALORS\n  Ecrire "oui"\n FINSI\nFIN', []],
  ["MOD / DIV", 'DEBUT\n Ecrire 7 MOD 3, 7 DIV 2\nFIN', []],
  ["% et //", 'DEBUT\n Ecrire 7 % 3, 7 // 2\nFIN', []],
  ["FIN SI / FIN TANT QUE", 'DEBUT\n i = 0\n TANT QUE i < 2 FAIRE\n  SI i = 1 ALORS\n   Ecrire i\n  FIN SI\n  i = i + 1\n FIN TANT QUE\nFIN', []],
  ["TANTQUE/FINTANTQUE", 'DEBUT\n i = 0\n TANTQUE i < 2 FAIRE\n  i = i + 1\n FINTANTQUE\n Ecrire i\nFIN', []],
  ["POUR de 1 à n", 'DEBUT\n POUR i = 1 JUSQU\'À 3 FAIRE\n  Ecrire i\n FINPOUR\nFIN', []],
  ["POUR JUSQU'A sans accent", 'DEBUT\n POUR i = 1 JUSQU\'A 3 FAIRE\n  Ecrire i\n FINPOUR\nFIN', []],
  ["POUR i DE 1 A 3", 'DEBUT\n POUR i DE 1 A 3 FAIRE\n  Ecrire i\n FIN POUR\nFIN', []],
  ["POUR ... PAS -1 / INCREMENT", 'DEBUT\n POUR i = 3 JUSQU\'À 1 INCREMENT -1 FAIRE\n  Ecrire i\n FINPOUR\nFIN', []],
  ["POUR PAS", 'DEBUT\n POUR i = 1 JUSQU\'À 5 PAS 2 FAIRE\n  Ecrire i\n FINPOUR\nFIN', []],
  ["REPETER JUSQU'A", 'DEBUT\n i = 0\n REPETER\n  i = i + 1\n JUSQU\'A i = 3\n Ecrire i\nFIN', []],
  ["RÉPÉTER TANTQUE", 'DEBUT\n i = 0\n RÉPÉTER\n  i = i + 1\n TANTQUE i < 3\n Ecrire i\nFIN', []],
  ["SINON SI", 'DEBUT\n x = 5\n SI x < 3 ALORS\n  Ecrire "a"\n SINON SI x < 10 ALORS\n  Ecrire "b"\n SINON\n  Ecrire "c"\n FINSI\nFIN', []],
  ["SINONSI collé", 'DEBUT\n x = 5\n SI x < 3 ALORS\n  Ecrire "a"\n SINONSI x < 10 ALORS\n  Ecrire "b"\n FINSI\nFIN', []],
  ["chaîne + nombre", 'DEBUT\n Ecrire "Total : " + 5\nFIN', []],
  ["chaîne & concat", 'DEBUT\n Ecrire "a" & "b"\nFIN', []],
  ["apostrophes", "DEBUT\n Ecrire 'bonjour'\nFIN", []],
  ["comparaison LIRE texte", 'DEBUT\n Lire r\n SI r = "oui" ALORS\n  Ecrire "ok"\n FINSI\nFIN', ["oui"]],
  ["comparaison LIRE nombre vs nombre", 'DEBUT\n Lire r\n SI r > 10 ALORS\n  Ecrire "grand"\n FINSI\nFIN', ["15"]],
  ["comparaison texte avec nombre", 'DEBUT\n x = "abc"\n SI x = 5 ALORS\n  Ecrire "?"\n SINON\n  Ecrire "non"\n FINSI\nFIN', []],
  ["booléen vs nombre", 'DEBUT\n x = VRAI\n SI x = 1 ALORS\n  Ecrire "?"\n SINON\n  Ecrire "non"\n FINSI\nFIN', []],
  ["tableau", 'DEBUT\n T = [3, 1, 2]\n Ecrire T[1], LONGUEUR(T)\nFIN', []],
  ["tableau rempli par boucle", 'DEBUT\n POUR i = 1 JUSQU\'À 3 FAIRE\n  T[i] = i * i\n FINPOUR\n Ecrire T\nFIN', []],
  ["tableau déclaré TABLEAU", 'DEBUT\n TABLEAU T[3]\n T[1] = 5\n Ecrire T[1]\nFIN', []],
  ["VARIABLES section", 'VARIABLES\n a : ENTIER\nDEBUT\n a = 1\n Ecrire a\nFIN', []],
  ["ALGORITHME en tête", 'ALGORITHME Test\nDEBUT\n Ecrire 1\nFIN', []],
  ["commentaire //", 'DEBUT\n // commentaire\n Ecrire 1\nFIN', []],
  ["commentaire \\\\", 'DEBUT\n \\\\ commentaire\n Ecrire 1\nFIN', []],
  ["commentaire #", 'DEBUT\n # commentaire\n Ecrire 1\nFIN', []],
  ["AFFICHER", 'DEBUT\n AFFICHER "x"\nFIN', []],
  ["SAISIR", 'DEBUT\n SAISIR a\n Ecrire a\nFIN', ["4"]],
  ["fonctions maths", 'DEBUT\n Ecrire RACINE(16), ABS(-2), ARRONDIR(2.6), MAX(1,5), MIN(1,5)\nFIN', []],
  ["MAJUSCULES/POSITION", 'DEBUT\n Ecrire MAJUSCULES("abc"), POSITION("b","abc")\nFIN', []],
  ["ENTIER()", 'DEBUT\n Ecrire ENTIER(3.7)\nFIN', []],
  ["SOUS-CHAINE / SOUSENSEMBLE", 'DEBUT\n Ecrire SOUSENSEMBLE("bonjour", 1, 3)\nFIN', []],
  ["modulo nombre négatif", 'DEBUT\n Ecrire -7 % 3\nFIN', []],
  ["puissance ^ et **", 'DEBUT\n Ecrire 2 ^ 3, 2 ** 3\nFIN', []],
  ["ET OU minuscules", 'DEBUT\n SI 1 < 2 et 2 < 3 ou faux ALORS\n  ecrire "ok"\n finsi\nFIN', []],
  ["vrai/faux minuscules", 'DEBUT\n x = vrai\n SI x ALORS\n  ecrire "ok"\n FINSI\nFIN', []],
  ["TAILLE(5) et TAILLE(tableau)", 'DÉBUT\n  POUR i=1 jusqu\'a TAILLE(5)FAIRE\n    Lire NOTE[i]\n    FINPOUR\n    POUR i=1 jusqu\'a TAILLE (NOTE) FAIRE\n      ECRIRE NOTE[i],"I"\n      FINPOUR\nFIN', ["12", "8", "15", "9", "10"]],
  ["module EXECUTER", 'DEBUT\n EXECUTER Bonjour\nFIN', []],
];
const EXPECTED: Record<string, string> = {
  "LIRE virgule décimale": "2,5\n5\n",
  "<- et ←": "5\n",
  "POUR i DE 1 A 3": "1\n2\n3\n",
  "POUR PAS": "1\n3\n5\n",
  "RÉPÉTER TANTQUE": "3\n",
  "chaîne & concat": "ab\n",
  "booléen vs nombre": "non\n",
  "tableau déclaré TABLEAU": "5\n",
  "VARIABLES section": "1\n",
  "ALGORITHME en tête": "1\n",
  "commentaire //": "1\n",
  "commentaire #": "1\n",
  "AFFICHER": "x\n",
  "SAISIR": "4\n4\n",
  "ENTIER()": "3\n",
  "puissance ^ et **": "8 8\n",
  "MAJUSCULES/POSITION": "ABC 2\n",
  "TAILLE(5) et TAILLE(tableau)": "12\n8\n15\n9\n10\n12 I\n8 I\n15 I\n9 I\n10 I\n",
};

describe("écritures des cours acceptées (compatibilité LARP élargie)", () => {
  for (const [name, code, inputs] of cases) {
    it(name, () => {
      const mods = [{ name: "PRINCIPAL", main: true, code }];
      if (name.includes("EXECUTER")) mods.push({ name: "Bonjour", main: false, code: 'ENTRER\n ECRIRE "salut"\nRETOURNER' });
      const r = runProject(mods, inputs);
      expect(r.error?.message).toBeUndefined();
      if (EXPECTED[name] !== undefined) expect(r.output).toBe(EXPECTED[name]);
    });
  }
});
