# Formation — guide de rédaction et fonctionnement

## Structure d'un chapitre

Un chapitre de la Formation est une leçon (`Lesson`) dotée d'une structure pédagogique (`ChapterPedagogy`, `src/content/types.ts`). Les 12 composantes exigées et leur contrôle :

| # | Composante | Où | Critère vérifié automatiquement |
|---|---|---|---|
| 1 | Objectifs pédagogiques | `objectives` | au moins 2 |
| 2 | Cours complet et détaillé | `content` (Markdown) | ≥ 3 000 caractères et ≥ 4 sections `##` |
| 3 | Définitions | `pedagogy.definitions` | au moins 3 |
| 4 | Explications progressives | sections du cours | ≥ 4 sections |
| 5 | Exemples pratiques | `examples` | au moins 1, tous exécutés par les tests |
| 6 | Algorithmes commentés ligne par ligne | `pedagogy.commentedAlgorithms` | au moins 1 commenté à ≥ 50 %, exécuté par les tests |
| 7 | Schémas et illustrations | `showFlowchart` / `showTrace` | organigramme et/ou tableau de suivi générés |
| 8 | Exercices corrigés | `pedagogy.solvedExercises` | au moins 2 |
| 9 | Exercices sans correction immédiate | `exerciseSlugs` | au moins 1 exercice noté |
| 10 | TD et interrogation | `pedagogy.td`, `pedagogy.interrogation` | TD ≥ 2 exercices notés, interrogation ≥ 4 questions |
| 11 | Évaluation finale | `pedagogy.evaluation` | ≥ 6 questions ; sa réussite valide le chapitre |
| 12 | Résumé PDF | `summary` | ≥ 3 points ; PDF généré à la demande |

`npm test` refuse tout chapitre de la Partie 1 incomplet, exécute chaque algorithme commenté, vérifie que chaque erreur fréquente marquée `run` échoue réellement (et que sa correction fonctionne), et résout chaque exercice noté avec sa solution de référence.

## Rédiger un algorithme commenté

Utiliser `annotated()` (`src/content/helpers.ts`) : chaque ligne est fournie avec son commentaire, ce qui garantit des numéros de ligne exacts.

```ts
annotated("Titre", [
  ["ALGORITHME Exemple", "Explication de la ligne 1"],
  ["VARIABLES"],
  ["  n : ENTIER", "Explication de la ligne 3"],
], { stdin: "5", showTrace: true, showFlowchart: true });
```

## Validation d'un chapitre et progression

- Un chapitre est **validé** quand l'étudiant réussit son évaluation (70 % par défaut). La validation est faite par le serveur après correction ; un appel direct à `/api/progress` avec « terminer » est refusé pour tout chapitre doté d'un quiz.
- Les compétences du chapitre sont alors considérées comme acquises.
- Les « points à retravailler » sont calculés à partir des évaluations échouées et des exercices non réussis après au moins deux tentatives.

## Limites actuelles

- La durée des interrogations est contrôlée dans le navigateur (chronomètre, envoi automatique), pas encore côté serveur.
- La structure pédagogique s'édite en JSON (validé) dans l'administration ; un éditeur visuel est prévu.
- Les Parties 2 à 6 n'ont pas encore toutes les composantes : la rubrique Formation l'indique pour chaque chapitre.
