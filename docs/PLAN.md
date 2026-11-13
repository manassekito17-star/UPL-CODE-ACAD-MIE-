# Plan d'exécution — UPL CODE ACADEMY MK

La plateforme réunit trois produits : **UPL ACADEMY** (formation), **UPL IDE** (environnement de développement) et **UPL STUDIO** (création de sites et d'applications). L'addendum au master prompt fixe sept phases ; les treize étapes techniques du master prompt s'y répartissent.

Chaque phase suit le même cycle : annoncer, identifier les fichiers, modifier, tester, corriger, vérifier dans le navigateur, documenter, lister le reste à faire. Une phase n'est close que si `lint`, `typecheck`, `test`, `test:db`, `build` et `test:e2e` passent, y compris contre Supabase réel.

Légende : 🟢 terminé et vérifié · 🔵 en cours · ⚪ à faire · 🔌 dépend d'une configuration externe

| Phase | Contenu | État |
|---|---|---|
| 0 | Audit, architecture, base de tests, CI (étape 1 du master prompt) | 🟢 |
| 1 | Formation complète en algorithmique et pseudocode | 🔵 Partie 1 (7 chapitres) terminée et vérifiée ; Parties 2 à 6 à enrichir |
| 2 | Laboratoire d'exécution et visualisation des algorithmes | 🟢 `/laboratoire` |
| 3 | Formation Python et éditeur de programmation (UPL IDE, 1re version) | ⚪ |
| 4 | Intégration des autres langages (C, JavaScript, Java) | ⚪ 🔌 Judge0 |
| 5 | UPL Studio et création de sites web | ⚪ |
| 6 | Environnements cloud, projets complets et déploiement | ⚪ 🔌 |
| 7 | Tests globaux, sécurité, optimisation et mise en production | ⚪ 🔌 |

## Phase 0 — Audit et architecture 🟢

Voir [AUDIT.md](AUDIT.md) et [ARCHITECTURE.md](ARCHITECTURE.md). Vulnérabilité critique corrigée, suite e2e Playwright, intégration continue.

## Phase 1 — Formation en algorithmique 🔵

### Livré et vérifié

- **Rubrique FORMATION** (`/formation`) : programme par parties, état de chaque chapitre, progression de l'étudiant.
- **Modèle de chapitre à 12 composantes** (`ChapterPedagogy`) : objectifs, cours, définitions, explications progressives, exemples exécutables, algorithmes commentés ligne par ligne, schémas, exercices corrigés, exercices notés, TD et interrogation, évaluation finale, résumé PDF.
- **Contrôle de complétude** (`src/content/completeness.ts`) : affiché aux étudiants (« Chapitre complet » ou « Enrichissement en cours · n % ») et **exigé à 100 % par les tests** pour les chapitres déclarés complets.
- **Partie 1 complète** : Introduction à l'algorithmique, Logique mathématique et raisonnement, Analyse et résolution des problèmes, Variables et constantes, Types de données, Opérateurs et expressions, Entrées et sorties.
  - 36 définitions, 7 algorithmes commentés, 15 erreurs fréquentes, 14 exercices corrigés, 17 nouveaux exercices notés (TD et application), 7 interrogations minutées, 7 évaluations de chapitre (56 questions).
- **Organigrammes générés** automatiquement depuis le pseudocode (symboles normalisés, SVG).
- **Tableau de suivi des variables** produit par l'interpréteur (trace réelle avant chaque instruction, pile d'appels).
- **Erreurs fréquentes vérifiées** : le message affiché est celui, réel, de l'interpréteur.
- **Résumé PDF** téléchargeable par chapitre (police embarquée : accents et symboles ← ≤ ≥).
- **Validation par activité vérifiée** : un chapitre n'est validé que par la réussite de son évaluation (côté serveur) ; la validation par simple clic est refusée ; le badge « Premier chapitre validé » repose sur cette validation.
- **Progression** : chapitres validés, meilleurs scores d'interrogation et d'évaluation, exercices réussis, points à retravailler (évaluations échouées, exercices non réussis après plusieurs tentatives), compétences acquises.
- **CMS** : la structure pédagogique d'un chapitre est éditable dans l'administration (JSON validé).
- **Vérification réelle** : migrations et seed appliqués sur Supabase local ; parcours e2e avec un vrai compte (inscription → chapitre → évaluation → validation → progression → badge).

### Reste à faire dans la phase 1

- Enrichir au même niveau les Parties 2 à 6 (12 chapitres actuellement à 33–42 % des composantes) et ajouter les chapitres prévus par l'addendum : **Structures de données**, **Optimisation**, **Exercices et projets de synthèse**.
- Éditeur visuel (sans JSON) pour la structure pédagogique (les interrogations et évaluations sont désormais éditables dans le CMS).
- Durée des interrogations contrôlée côté serveur (aujourd'hui : chronomètre et envoi automatique côté navigateur).
- Relecture et validation par l'équipe pédagogique avant publication officielle.

## Module supplémentaire — UPL ACADEMY multiniveaux 🔵

Livré et vérifié (unitaires, PGlite, E2E contre Supabase local) : huit parcours en quatre niveaux (dont K+), positionnement, examens de niveau, passage de niveau côté serveur, bulletin et certificats internes, parcours HTML (niveau 1) et CSS (niveau 1) complets avec correction structurelle, aperçu web isolé dans UPL IDE, liaison cours ↔ IDE, projets pratiques, professeur IA spécialisé, administration des niveaux et ressources. Détail et reste à faire : [MULTINIVEAUX.md](MULTINIVEAUX.md).

## Phase 2 — Laboratoire d'algorithmique 🟢

Page `/laboratoire` (lien « Laboratoire » dans le menu, et « Pas à pas dans le laboratoire » sur chaque algorithme commenté de la formation, avec retour au cours) :

- **Exécution pas à pas réelle** par l'interpréteur de la plateforme : la trace détaillée est calculée dans un Web Worker (page jamais bloquée, arrêt forcé à 8 s, 3 000 étapes au plus).
- **Commandes** : première étape, reculer, lecture automatique (lent / normal / rapide), pause, avancer, dernière étape, curseur de position, réinitialiser ; raccourcis ← → et Espace.
- **Ligne courante** surlignée dans l'éditeur Monaco ; **organigramme synchronisé** (le bloc de l'étape courante est encadré, défilement limité à l'organigramme).
- **Variables** avec type et valeur, valeurs modifiées mises en évidence ; **pile d'appels** ; **sortie** au fil de l'exécution.
- **Conditions, boucles et appels expliqués** (mode détaillé de l'interpréteur, testé) : branche prise d'un SI / SINON SI / SINON avec VRAI ou FAUX, une étape par tour de POUR avec la valeur du compteur et la sortie de boucle, chaque réévaluation de TANT QUE et de JUSQU'A, cas choisi d'un SELON, appel de procédure, valeur retournée par une fonction.
- **Saisie interactive de LIRE** : sans entrées préparées, le laboratoire annonce l'étape du LIRE et demande la valeur au moment voulu ; l'exécution (déterministe) est recalculée et reprend à la même étape.
- **Erreurs** : syntaxe signalée avant la trace ; erreur d'exécution affichée à la ligne concernée ; boucle infinie limitée.
- **Professeur IA** : explication de l'algorithme du laboratoire (mode « expliquer mon code », contexte du parcours d'algorithmique).
- Algorithmes proposés : un exemple de démarrage et tous les algorithmes commentés et exemples en pseudocode publiés dans la formation.

Vérifié par 7 tests unitaires de la trace détaillée et 3 scénarios E2E (saisie interactive, retour arrière, organigramme, lecture/pause, ouverture depuis un chapitre, erreurs).

Reste possible : points d'arrêt sur une ligne, visualisation graphique des tableaux (cases), exécution pas à pas pour Python.

## Phase 3 — Python et UPL IDE ⚪

Explorateur de fichiers et dossiers, onglets multiples, projets (`student_projects`, `project_files`), sauvegarde automatique, recherche dans les fichiers, import/export, thèmes clair et sombre, terminal et débogueur (Python), formation Python au niveau de la Formation algorithmique.

## Phase 4 — Autres langages ⚪ 🔌

Judge0 réel (testable en Docker dans l'environnement de développement), langages pilotés par la table `languages`, C, JavaScript, Java.

## Phase 5 — UPL Studio ⚪

Assistant de création de projet, modèles (HTML/CSS/JS, React, Next.js, API), prévisualisation en direct, variables d'environnement, historique des versions, intégration Git/GitHub, export.

## Phase 6 — Cloud et déploiement des projets ⚪ 🔌

Environnements isolés par projet (conteneurs éphémères), quotas par utilisateur, nettoyage, surveillance ; séparation stricte avec l'exécution des petits exercices ; architecture progressive et économique.

## Phase 7 — Tests globaux et mise en production ⚪ 🔌

Audit de sécurité complet (CSP, limitation persistée, surveillance des erreurs), tests des 20 scénarios obligatoires, sauvegarde et **restauration testée**, déploiement vérifié en production, guides d'utilisation.

## Décisions à confirmer

| # | Question | Proposition par défaut |
|---|---|---|
| Q1 | Niveau « chapitres » | La Formation utilise **Partie → Chapitre** (modules → leçons en base) ; pas de niveau supplémentaire |
| Q2 | Périmètre d'un enseignant | Affectation à des parcours **et** à des groupes d'étudiants |
| Q3 | Validation d'un chapitre | Réussite de l'évaluation finale (70 %) — **appliqué** |
| Q4 | Modèle IA par défaut | Configurable ; défaut `claude-opus-5-5` |
| Q5 | Hébergement de Judge0 / des environnements Studio | VM dédiée, puis conteneurs éphémères |
