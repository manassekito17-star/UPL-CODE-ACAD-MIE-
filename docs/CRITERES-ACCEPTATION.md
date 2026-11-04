# Critères d'acceptation (cahier des charges §12)

État au moment de la livraison. « Vérifié » indique un contrôle automatisé ou manuel effectué ; « À valider en production » indique une fonctionnalité implémentée qui dépend d'un service externe à configurer (Supabase, Judge0, clé IA).

| # | Critère | Implémentation | Vérification |
|---|---|---|---|
| 1 | Créer un compte et se connecter | Supabase Auth : inscription, vérification e-mail, connexion, déconnexion, mot de passe oublié/réinitialisation, protection des routes (`src/proxy.ts`, `requireUser`) | À valider en production (projet Supabase) |
| 2 | Accéder aux cinq parcours | `/formations`, `/formations/[parcours]` | Vérifié (pages 200, navigateur) |
| 3 | Consulter un cours | Pages de leçon avec objectifs, contenu, exemples, résumé, quiz | Vérifié |
| 4 | Écrire du pseudocode | Éditeur Monaco + langage pseudocode + interpréteur | Vérifié (16 tests interpréteur, exécution navigateur) |
| 5 | Écrire et exécuter du Python | Judge0 (serveur) ou Pyodide (navigateur) | Vérifié dans le navigateur (Pyodide) ; Judge0 : client testé avec réponses simulées |
| 6 | Compiler et exécuter du C | Judge0 | Client testé (simulé) ; exemples et solutions compilés avec gcc ; à valider avec l'instance Judge0 |
| 7 | Exécuter du JavaScript | Judge0 (Node) ou Web Worker isolé | Vérifié dans le navigateur |
| 8 | Compiler et exécuter du Java | Judge0 | Exemples et solutions compilés avec javac ; à valider avec l'instance Judge0 |
| 9 | Enregistrer ses programmes | Table `programs` (RLS propriétaire), `/mes-programmes`, bouton Enregistrer | Politiques RLS vérifiées (PGlite) ; à valider en production |
| 10 | Réaliser un exercice et obtenir une correction | `/api/exercises/[slug]/submit` : tests visibles et cachés, note, correction | Vérifié (navigateur + API) |
| 11 | Le professeur IA explique le code | `/api/ai/tutor`, mode « Expliquer mon code », contexte de l'éditeur | Code typé contre le SDK ; à valider avec une clé API |
| 12 | Progression sauvegardée | `lesson_progress`, `course_progress` (déclencheur), `enrollments` (reprise), soumissions, quiz | Déclencheur vérifié (PGlite) |
| 13 | Un étudiant ne peut pas accéder aux données d'un autre | RLS sur toutes les tables | Vérifié : 23 scénarios (`npm run test:db`) |
| 14 | L'administrateur gère cours et comptes | `/admin` : formations, leçons, quiz, exercices, comptes, rôles, suspension | Pages compilées ; politiques vérifiées ; à valider en production |
| 15 | Fonctionne sur mobile | Mise en page responsive, onglets Consignes / Code / Console | Vérifié (iPhone 13 émulé : pas de défilement horizontal, exécution OK) |

## Contrôle qualité du contenu

`npm test` exécute **chaque exemple de leçon** (69 leçons, 5 langages) et **chaque solution de référence contre tous ses tests** (54 exercices). Le contenu reste à relire et valider par l'équipe pédagogique avant publication officielle (cahier des charges §11).
