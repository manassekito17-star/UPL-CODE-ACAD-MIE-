# UPL CODE ACADEMY MK

**LEARN. CODE. PRACTICE. MASTER.**

Plateforme universitaire d'apprentissage de l'informatique et de la programmation assistée par intelligence artificielle : cours structurés, éditeur de code intégré, exécution sécurisée, exercices corrigés automatiquement, professeur IA et suivi de progression.

> Destinée aux étudiants de l'UPL et aux étudiants en informatique. Les contenus ne constituent pas le programme officiel de l'université sans validation de celle-ci.

## Fonctionnalités

| Domaine | Ce qui est livré |
|---|---|
| **Formation** | Rubrique `/formation` : programme d'algorithmique par parties. Chaque chapitre complet comporte 12 composantes (cours détaillé, définitions, algorithmes commentés ligne par ligne avec organigramme et tableau de suivi générés par l'interpréteur, erreurs fréquentes vérifiées, exercices corrigés, exercices notés, TD, interrogation minutée, évaluation finale, résumé PDF). Partie 1 complète (7 chapitres) ; état de chaque chapitre affiché. Voir [docs/FORMATION.md](docs/FORMATION.md). |
| **Parcours multiniveaux** | 7 parcours (Algorithmique, HTML, CSS, Python, C, JavaScript, Java), chacun en **4 niveaux** (très débutant → professionnel) avec critères de passage, examens de fin de niveau, test de positionnement, dispense des niveaux acquis, bulletin de progression (PDF) et certificats internes vérifiables. Les chapitres non rédigés sont affichés « au programme ». Voir [docs/MULTINIVEAUX.md](docs/MULTINIVEAUX.md). |
| **Exercices** | 106 exercices (dont 28 HTML/CSS corrigés par analyse structurelle, et des projets pratiques notés rattachés aux chapitres) (débutant → avancé, 8 types : QCM, compléter, corriger, écrire un algorithme/programme, problème, mini-projet…) avec tests visibles et cachés, indices progressifs, correction pédagogique et solution révélées après réussite ou 5 tentatives. |
| **Éditeur** | Monaco : coloration (y compris pseudocode), numéros de ligne, indentation, suggestions et extraits, erreurs soulignées en direct, Exécuter / Réinitialiser / Enregistrer, multi-fichiers (Python, projets web), **aperçu en direct HTML/CSS/JS** dans une iframe isolée avec console de la page, démonstrations ouvertes depuis un chapitre avec retour au cours, console, zone d'entrée, historique, brouillon automatique, onglets Consignes / Code / Console sur mobile. |
| **UPL IDE** | `/ide` : projets à dossiers enregistrés dans le compte (révisions, conflits entre appareils, brouillon hors ligne, historique et points de sauvegarde), explorateur (créer, renommer, déplacer, dupliquer, supprimer, import fichiers/dossier/ZIP, export ZIP), onglets et vue fractionnée Monaco, problèmes, console, sortie, journal, aperçu web ordinateur/tablette/téléphone, exécution réelle, thème clair/sombre. Voir [docs/IDE.md](docs/IDE.md). |
| **Laboratoire** | `/laboratoire` : exécution pas à pas (avancer, reculer, lecture, pause), ligne courante dans l'éditeur, organigramme synchronisé, variables et valeurs modifiées, pile d'appels, sortie, explication des conditions, tours de boucle et appels, saisie interactive de LIRE, explication par le professeur IA. |
| **Exécution** | Pseudocode : interpréteur maison (sans accès système, limites d'instructions, de récursivité et de sortie). Python, C, JavaScript, Java : Judge0 (bac à sable isolé, sans réseau, limites CPU/mémoire/taille). Repli dans un Web Worker du navigateur pour pseudocode, Python (Pyodide) et JavaScript. |
| **Professeur IA** | Spécialisé par parcours (programme, chapitre en cours et niveau mesuré relus côté serveur) ; modes enseigner, interroger, accompagner un projet, questions, explication ligne par ligne, analyse d'erreurs, indices progressifs (niveaux 1 à 5), génération d'exercices, pseudocode ↔ code, préparation aux évaluations ; français simple adapté au niveau ; jamais de solution complète pour un exercice évalué. Fournisseur interchangeable (`src/lib/ai`). |
| **Progression** | Leçons commencées/terminées, temps passé, reprise à la dernière position, soumissions, notes, tentatives, progression par langage, compétences maîtrisées / à améliorer, badges, certificats. |
| **Administration** | Comptes et rôles (étudiant, enseignant avec permissions `contenus` / `corrections` / `suivi`, administrateur), suspension, formations / modules / leçons / quiz, **niveaux (critères, examens, positionnement, statistiques)**, interrogations et évaluations de chapitre, ressources (liens, fichiers), exercices et tests, publication avec validation pédagogique, corrections enseignant, suivi, annonces, langages et catégories, paramètres et **contrôle des coûts IA**, journaux d'activité. |

## Architecture

```
src/
  app/                 Pages (App Router Next.js 16) et API
    api/execute        Exécution d'un programme
    api/exercises/…    Correction automatique (tests cachés côté serveur)
    api/quiz/…         Correction des quiz (réponses jamais envoyées au navigateur)
    api/ai/tutor       Professeur IA (flux de texte, quotas, coûts)
    admin/             Espace administrateur / enseignant (server actions)
  content/             Contenu pédagogique de référence (cours, exercices) + tests de qualité
  lib/
    pseudocode/        Lexer, parseur et interpréteur du pseudocode français
    execution/         Judge0, correction, exécution navigateur, comparaison des sorties
    ai/                Fournisseurs IA, consigne pédagogique, quotas
    content/           Accès au contenu (base Supabase ou contenu statique)
    supabase/          Clients navigateur, serveur, service_role, proxy de session
  workers/             Web Workers (pseudocode, JavaScript)
public/workers/        Worker Python (Pyodide)
supabase/
  migrations/          Schéma, RLS, données de référence
  seed.sql             Contenu généré (npm run seed:generate)
scripts/               Générateur de seed, vérification de la base (PGlite)
```

Technologies : Next.js 16 + React 19, TypeScript, Tailwind CSS 4, Monaco Editor, Supabase (PostgreSQL, Auth, Storage), Judge0 CE, SDK Anthropic, Vercel.

## Installation

```bash
npm install
cp .env.example .env.local     # puis renseigner les valeurs
npm run dev                    # http://localhost:3000
```

Sans aucune variable, l'application démarre en **mode démonstration** : cours, éditeur et exercices fonctionnent (pseudocode, Python et JavaScript dans le navigateur) ; les comptes, la sauvegarde et le professeur IA sont désactivés.

### Développement local avec Supabase (Docker)

```bash
npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,realtime,supavisor   # migrations + seed
npx supabase status -o env    # copier API_URL, ANON_KEY et SERVICE_ROLE_KEY dans .env.local
```

### 1. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Appliquer les migrations puis le contenu :
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push               # supabase/migrations/*
   npm run seed:generate              # régénère supabase/seed.sql depuis src/content
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
   (ou copier les fichiers dans l'éditeur SQL du tableau de bord, dans l'ordre).
3. *Authentication → URL Configuration* : ajouter `https://<votre-domaine>/auth/callback` aux URL de redirection.
4. Renseigner `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Créer le premier administrateur : s'inscrire sur le site, puis dans l'éditeur SQL :
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'administrateur' from auth.users where email = 'vous@exemple.cd';
   ```

### 2. Exécution du code (Judge0)

Auto-hébergement recommandé ([judge0/judge0](https://github.com/judge0/judge0), Docker) sur une machine **distincte** du serveur web, avec `AUTHN_HEADER=X-Auth-Token` et `AUTHN_TOKEN` définis, puis `JUDGE0_URL` et `JUDGE0_AUTH_TOKEN`. L'offre RapidAPI est aussi prise en charge (`JUDGE0_RAPIDAPI_KEY`). Vérifiez les identifiants de langages de votre instance (`GET /languages`) et ajustez `JUDGE0_LANG_*`.

### 3. Professeur IA (facultatif)

Lancement à budget zéro : utilisez un fournisseur à offre gratuite via l'API compatible OpenAI (`AI_PROVIDER=openai_compatible`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`, `AI_BILLING=gratuit` — exemples Gemini, Groq, OpenRouter, Mistral dans `.env.example`). Un fournisseur payant (Anthropic, ou offre non déclarée gratuite) reste **bloqué** tant que l'administrateur ne l'autorise pas avec un budget mensuel. Sans modèle connecté, l'interface l'indique et les cours restent accessibles. Les limites (questions par jour par étudiant et pour la plateforme, budget, jetons) se règlent dans **Administration → Paramètres** ; la consommation se suit dans **Administration → Consommation et coûts**. Détails : [docs/COUTS.md](docs/COUTS.md).

### 4. Déploiement (Vercel)

Importer le dépôt GitHub dans Vercel, définir les variables d'environnement de `.env.example`, déployer. Sauvegardes : activer les sauvegardes quotidiennes (et le PITR si possible) dans Supabase.

## Sécurité

- **RLS sur toutes les tables** : un étudiant ne lit et n'écrit que ses propres données ; contenus publiés lisibles par tous ; brouillons réservés à l'équipe.
- **Résultats officiels écrits uniquement par le serveur** (soumissions, notes, quiz, badges, certificats, messages IA) : un étudiant ne peut pas s'attribuer une note.
- **Secrets pédagogiques isolés** : solutions, corrigés, tests cachés et réponses des quiz sont dans des tables réservées ; la correction se fait côté serveur.
- Vérification des rôles côté serveur (`requireStaff`, `requireAdmin`) **et** en base (`can_teach`, `is_admin`) ; un étudiant ne peut ni modifier son statut ni s'attribuer un rôle.
- Validation de toutes les entrées (Zod), requêtes paramétrées (pas d'injection SQL), Markdown rendu sans HTML (pas de XSS), contrôle d'origine sur les API (CSRF), redirections internes uniquement, en-têtes de sécurité.
- Limitation des requêtes (exécutions, soumissions, IA, connexion/inscription) ; quotas et budget IA persistés en base.
- Code étudiant **jamais exécuté par le serveur web** : Judge0 isolé (sans réseau, limites), ou Web Worker du navigateur (sans accès à la page, réseau coupé, arrêt au délai). Le pseudocode est interprété sans aucun appel système.
- Journalisation des actions sensibles (rôles, suspensions, publications, paramètres, corrections).
- Clés secrètes uniquement côté serveur (`src/lib/server-env.ts` est marqué `server-only`).

## Tests

```bash
npm test          # interpréteur, formats d'édition, Judge0 (simulé), comparaison,
                  # et contrôle qualité du contenu : chaque exemple de leçon et chaque
                  # solution de référence sont exécutés (pseudocode, Python, C, JS, Java)
npm run test:db   # migrations + seed + 63 contrôles (RLS, niveaux, certificats, projets, quotas) sur PostgreSQL (PGlite)
npm run build && npm run test:e2e   # 59 scénarios navigateur (ordinateur + mobile, Playwright) ;
                                    # avec Supabase configuré : parcours réels avec comptes
npm run lint
npm run build
```

L'intégration continue (`.github/workflows/ci.yml`) rejoue l'ensemble à chaque push, en mode démonstration **et** contre un Supabase réel démarré dans la CI.

Documentation : [budget zéro et coûts](docs/COUTS.md) · [UPL IDE](docs/IDE.md) · [multiniveaux](docs/MULTINIVEAUX.md) · [formation](docs/FORMATION.md) · [audit](docs/AUDIT.md) · [architecture](docs/ARCHITECTURE.md) · [plan d'exécution](docs/PLAN.md) · [critères d'acceptation](docs/CRITERES-ACCEPTATION.md) · [pseudocode](docs/PSEUDOCODE.md).

## Contribuer au contenu

Le contenu de référence est dans `src/content/` (`courses/*.ts`, `exercises/*.ts`). Après modification : `npm test` (vérifie que tout s'exécute), puis `npm run seed:generate` et réimport du seed. Une fois la base en service, les enseignants peuvent aussi éditer les cours depuis l'administration ; un contenu n'est visible des étudiants qu'après publication (validation pédagogique enregistrée).
