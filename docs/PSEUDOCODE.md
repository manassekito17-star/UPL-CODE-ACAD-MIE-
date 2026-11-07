# Référence du pseudocode UPL

Mots-clés insensibles à la casse et aux accents (`Écrire` = `ECRIRE` = `ecrire`). Commentaires : `//`, `#`, `/* … */`.

```pseudocode
ALGORITHME Exemple
CONSTANTES
  TVA = 0.16
VARIABLES
  n, i : ENTIER
  prix : REEL
  nom : CHAINE
  c : CARACTERE
  ok : BOOLEEN
  T : TABLEAU[1..10] DE ENTIER
  M : TABLEAU[1..3, 1..3] DE REEL
DEBUT
  LIRE(n)
  ECRIRE("n vaut ", n)
FIN
```

| Élément | Syntaxe |
|---|---|
| Affectation | `x ← 5` ou `x <- 5` |
| Arithmétique | `+ - * /` (réelle), `DIV`, `MOD`, `^` |
| Comparaison | `= <> < > <= >=` |
| Logique | `ET OU NON` (évaluation court-circuit) |
| Condition | `SI c ALORS … SINON SI c ALORS … SINON … FINSI` |
| Choix | `SELON x` / `CAS 1 : …` / `CAS 2, 3 : …` / `AUTRE : …` / `FINSELON` |
| Boucles | `POUR i DE 1 A n [PAS p] FAIRE … FINPOUR`, `TANT QUE c FAIRE … FINTANTQUE`, `REPETER … JUSQU'A c` |
| Fonction | `FONCTION f(x : ENTIER) : ENTIER` … `RETOURNER x` … `FIN` |
| Procédure | `PROCEDURE p(VAR x : ENTIER)` … `FIN` (`VAR` ou `E/S` = par référence ; tableaux toujours par référence) |
| Fonctions prédéfinies | `LONGUEUR RACINE ABS ENT ARRONDI PUISSANCE MIN MAX ALEA MAJUSCULE MINUSCULE SOUSCHAINE CONCAT CHAINE ENTIER REEL ORD CHR` |

Règles : toute variable doit être déclarée (sauf en « mode script », un programme sans `DEBUT`/`FIN`) ; les types sont vérifiés (un réel ne peut pas être rangé dans un `ENTIER`) ; les indices de tableaux et de chaînes commencent à 1 ; `LIRE` consomme une ligne de la zone Entrée. Limites : 2 000 000 d'instructions, 500 appels imbriqués, 100 000 caractères de sortie.
