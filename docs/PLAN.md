# Plan d'exécution — UPL Code Academy

Chaque étape suit le même cycle : annoncer, identifier les fichiers, modifier, tester, corriger, vérifier dans le navigateur, documenter, lister le reste à faire. Une étape n'est close que si `lint`, `typecheck`, `test`, `test:db`, `build` et `test:e2e` passent.

Légende : 🟢 terminé et vérifié · 🔵 en cours · ⚪ à faire · 🔌 dépend d'une configuration externe

| Étape | Contenu | État |
|---|---|---|
| 1 | Audit, architecture, base de tests | 🟢 |
| 2 | UI/UX et navigation | ⚪ |
| 3 | Authentification, rôles, base de données | ⚪ |
| 4 | Cours et contenus pédagogiques | ⚪ |
| 5 | Éditeur Monaco | ⚪ |
| 6 | Interpréteur de pseudocode | ⚪ |
| 7 | Exécution Python, C, JavaScript, Java | ⚪ 🔌 |
| 8 | Exercices et évaluations | ⚪ |
| 9 | Professeur IA | ⚪ 🔌 |
| 10 | Progression et statistiques | ⚪ |
| 11 | Administration | ⚪ |
| 12 | Sécurité et tests | ⚪ |
| 13 | Déploiement et documentation | ⚪ 🔌 |

## Étape 1 — Audit et architecture 🟢

- Audit du dépôt, de la configuration et des écarts : [AUDIT.md](AUDIT.md).
- Architecture cible et décisions : [ARCHITECTURE.md](ARCHITECTURE.md).
- Correction de la vulnérabilité critique DOMPurify (surcharge `dompurify@3.4.17`).
- Suite de bout en bout Playwright versionnée (`e2e/`, 20 scénarios, ordinateur et mobile).
- Intégration continue GitHub Actions (`.github/workflows/ci.yml`) : audit, lint, types, tests unitaires et de contenu, base de données, build, e2e.

## Étape 2 — UI/UX et navigation ⚪

- Slogan « LEARN. CODE. PRACTICE. MASTER. » dans l'identité.
- Coque applicative : **barre latérale** sur ordinateur (repliable) pour les espaces connectés et l'administration ; barre inférieure ou tiroir sur mobile.
- Bibliothèque de composants : onglets, boîte de dialogue, panneaux redimensionnables, fil d'Ariane, état vide, squelettes de chargement.
- Accessibilité : contrastes, focus, navigation clavier.
- Tests : captures ordinateur et mobile, débordement horizontal, navigation clavier.

## Étape 3 — Authentification, rôles, base de données ⚪

- Lancer **Supabase local** (Docker) dans l'environnement de développement et la CI.
- Migrations : `student_projects` + `project_files` (avec reprise de `programs`), `deleted_at`, `teacher_assignments`, `cohorts`, `cohort_members`, type d'exercice `detecter_erreur`.
- RLS : un enseignant ne voit que les étudiants de ses parcours ou groupes.
- Gestion des sessions : liste et déconnexion des autres appareils.
- Extraction des services métier et des dépôts de données (`src/server`).
- Tests réels : inscription, vérification d'e-mail (Inbucket local), connexion, mot de passe oublié, accès étudiant / enseignant / administrateur, isolation des données.

## Étape 4 — Cours et contenus ⚪

- Niveau **chapitres** : modules → chapitres → leçons (migration et reprise).
- Leçons structurées par notion : définition, explication simple, exemple, **explication ligne par ligne**, **erreur fréquente**, exercice, correction, vérification. Composants dédiés et contrôle automatique de complétude.
- Réécriture progressive du contenu, priorité Algorithmique puis Python.
- CMS : prévisualisation, archivage, historique des modifications.

## Étape 5 — Éditeur Monaco ⚪

- Projets : nouveau, ouvrir, renommer, dupliquer, supprimer (logique), fichiers multiples pour tous les langages, privés par défaut.
- Barre d'outils : annuler, rétablir, rechercher, copier, coller, réinitialiser, enregistrer, exécuter.
- Trois zones redimensionnables (consignes, éditeur, console) ; modèles par langage.
- Auto-hébergement de Monaco (risque R2).

## Étape 6 — Interpréteur de pseudocode ⚪

- **Saisie interactive** : `LIRE` demande la valeur dans la console pendant l'exécution.
- Exécution pas à pas et visualisation des variables (aide pédagogique).
- Documentation de la grammaire, nouveaux messages d'erreur, tests supplémentaires.

## Étape 7 — Exécution des langages ⚪ 🔌

- Instance **Judge0 réelle** en Docker dans l'environnement de test ; vérification de Python, C, JavaScript, Java, des erreurs de compilation, des délais et de la mémoire.
- Langages et versions pilotés par la table `languages` (fin de l'incohérence actuelle).
- Interface `ExecutionProvider` ; guide d'hébergement Judge0 (risque R1).
- 🔌 En production : une VM Judge0 à fournir.

## Étape 8 — Exercices et évaluations ⚪

- Bibliothèque filtrable par langage, chapitre, niveau, type ; QCM et vrai-faux comme exercices.
- Tests de cas limites et d'entrées invalides dans chaque exercice ; explications par test.
- Évaluations notées avec fenêtre de temps (mode examen).

## Étape 9 — Professeur IA ⚪ 🔌

- Cinq modes : professeur, assistant, révision, examen, débogage.
- **Consentement explicite** avant l'envoi du code de l'éditeur.
- Consigne : ne pas inventer de résultats d'exécution, distinguer hypothèse et certitude.
- Historique des conversations consultable et supprimable.
- Fournisseur de test déterministe pour les tests automatisés ; test réel limité avec une clé.
- 🔌 En production : une clé API.

## Étape 10 — Progression et statistiques ⚪

- Achèvement d'une leçon fondé sur une activité vérifiée (quiz réussi ou exercice associé), pas sur un clic.
- Badges vérifiés : premier cours terminé, premier programme exécuté, 10 exercices réussis, maître des conditions, maître des boucles, premier projet terminé.
- Compétences par notion (étiquettes sur les exercices).

## Étape 11 — Administration ⚪

- Tableau de bord : étudiants, enseignants, formations publiées, exercices, activité, apprentissage, IA, erreurs d'exécution, **état des services**.
- Affectations enseignants, groupes, statistiques par groupe.

## Étape 12 — Sécurité et tests ⚪

- Audit de sécurité complet ; CSP ; limitation des requêtes persistée ; surveillance des erreurs ; tests des 20 scénarios obligatoires.

## Étape 13 — Déploiement et documentation ⚪ 🔌

- Guide pas à pas pour débutant (Supabase, Judge0, IA, Vercel, domaine, HTTPS) ; sauvegarde **et restauration testée** ; guide d'utilisation étudiant, enseignant, administrateur.
- 🔌 Le déploiement ne sera déclaré réalisé qu'après vérification en production.

## Décisions à confirmer

| # | Question | Proposition par défaut |
|---|---|---|
| Q1 | Ajouter un niveau « chapitres » entre modules et leçons ? | Oui : modules → chapitres → leçons |
| Q2 | Périmètre d'un enseignant | Affectation à des parcours **et** à des groupes d'étudiants (promotions) |
| Q3 | Quand une leçon est-elle « terminée » ? | Quiz de la leçon réussi, ou exercice associé réussi si la leçon n'a pas de quiz |
| Q4 | Modèle IA par défaut | Configurable dans l'administration ; défaut actuel `claude-opus-5-5`, avec la possibilité d'un modèle plus économique pour les questions simples |
| Q5 | Hébergement de Judge0 | VM dédiée (cgroups v1) chez l'hébergeur de votre choix |
