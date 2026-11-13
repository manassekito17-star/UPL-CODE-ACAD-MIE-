/** Modèles prêts à l'emploi de UPL Flow Studio (pseudocode converti en organigramme à l'ouverture). */
export const FLOW_TEMPLATES = [
  {
    id: "somme",
    title: "Somme de 1 à n",
    code: `ALGORITHME Somme
VARIABLES
  n, i, s : ENTIER
DEBUT
  ECRIRE("Entrez n :")
  LIRE(n)
  s ← 0
  POUR i DE 1 A n FAIRE
    s ← s + i
  FINPOUR
  ECRIRE("Somme = ", s)
FIN`,
  },
  {
    id: "maximum",
    title: "Plus grand de deux nombres",
    code: `ALGORITHME Maximum
VARIABLES
  a, b : ENTIER
DEBUT
  LIRE(a)
  LIRE(b)
  SI a > b ALORS
    ECRIRE("Le plus grand est ", a)
  SINON
    ECRIRE("Le plus grand est ", b)
  FINSI
FIN`,
  },
  {
    id: "moyenne",
    title: "Moyenne de notes (TANT QUE)",
    code: `ALGORITHME Moyenne
VARIABLES
  note, somme, nb : REEL
DEBUT
  somme ← 0
  nb ← 0
  LIRE(note)
  TANT QUE note >= 0 FAIRE
    somme ← somme + note
    nb ← nb + 1
    LIRE(note)
  FINTANTQUE
  SI nb > 0 ALORS
    ECRIRE("Moyenne = ", somme / nb)
  SINON
    ECRIRE("Aucune note")
  FINSI
FIN`,
  },
  {
    id: "factorielle",
    title: "Factorielle (RÉPÉTER)",
    code: `ALGORITHME Factorielle
VARIABLES
  n, f : ENTIER
DEBUT
  REPETER
    LIRE(n)
  JUSQU'A n >= 0
  f ← 1
  TANT QUE n > 1 FAIRE
    f ← f * n
    n ← n - 1
  FINTANTQUE
  ECRIRE("Factorielle = ", f)
FIN`,
  },
  {
    id: "tableau",
    title: "Remplir et afficher un tableau",
    code: `ALGORITHME Tableau
VARIABLES
  T : TABLEAU[1..5] DE ENTIER
  i : ENTIER
DEBUT
  POUR i DE 1 A 5 FAIRE
    T[i] ← i * i
  FINPOUR
  POUR i DE 1 A 5 FAIRE
    ECRIRE("T[", i, "] = ", T[i])
  FINPOUR
FIN`,
  },
] as const;
