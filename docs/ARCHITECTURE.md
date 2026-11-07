# Architecture — UPL CODE ACADEMY MK

## 1. Vue d'ensemble

```text
                         Navigateur (ordinateur, tablette, téléphone)
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ Pages React (Next.js)  ·  Monaco  ·  Web Workers (pseudocode, JS, Python)  │
   └───────────────┬───────────────────────────────────┬──────────────────────┘
                   │ HTTPS (cookies de session)        │ CDN (Monaco, Pyodide)
   ┌───────────────▼──────────────────────────────┐
   │ Next.js sur Vercel                            │
   │  proxy.ts : rafraîchit la session, filtre     │
   │  app/        pages, API, server actions       │
   │  server/     services métier (cible)          │
   │  lib/        exécution, IA, contenu, auth     │
   └──────┬──────────────┬──────────────┬─────────┘
          │              │              │
   ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼───────────────┐
   │ Supabase    │ │ Judge0 CE  │ │ Fournisseur IA       │
   │ Postgres+RLS│ │ VM isolée  │ │ (Anthropic par défaut│
   │ Auth Storage│ │ sans réseau│ │  interchangeable)    │
   └─────────────┘ └────────────┘ └──────────────────────┘
```

Principes :

1. **Le navigateur n'est jamais cru sur parole** : identité lue dans la session Supabase côté serveur, rôles relus en base, entrées validées (Zod), résultats officiels écrits uniquement par le serveur.
2. **Défense en profondeur** : contrôle applicatif (`requireStaff`, `requireAdmin`) **et** politiques RLS dans Postgres.
3. **Aucun code étudiant dans le processus web** : Judge0 (VM séparée) ou Web Worker du navigateur ; le pseudocode est interprété sans aucun appel système.
4. **Fournisseurs remplaçables** : exécution (`ExecutionProvider`, cible) et IA (`AiProvider`) derrière des interfaces.
5. **Aucune fonctionnalité simulée** : si un service manque, l'interface le dit clairement.

## 2. Couches et dossiers (cible)

| Couche | Dossier | Rôle | Règle |
|---|---|---|---|
| Interface | `src/app` (pages), `src/components` | affichage, interactions | n'accède pas directement à la base pour écrire ; appelle des actions ou des API |
| Points d'entrée serveur | `src/app/api/*`, `src/app/**/actions.ts` | authentifier, valider, appeler un service | fins : pas de logique métier |
| Services métier | `src/server/services/*` (à créer, étape 3) | règles : correction, progression, badges, publication, quotas | testables sans HTTP |
| Accès aux données | `src/server/repositories/*` (à extraire de `src/lib/content`, `src/lib/progress`) | requêtes Supabase typées | seul endroit qui connaît les tables |
| Authentification | `src/lib/auth.ts`, `src/lib/supabase/*`, `src/proxy.ts` | session, rôles, permissions | `server-only` |
| Exécution | `src/lib/execution/*`, `src/lib/pseudocode/*`, `src/workers`, `public/workers` | interpréteur, Judge0, repli navigateur | limites centralisées dans `languages.ts` |
| IA | `src/lib/ai/*` | fournisseurs, consigne, quotas, coûts | clés uniquement côté serveur |
| Administration | `src/app/admin/*` | CMS et gestion | permissions vérifiées dans chaque action |
| Contenu de référence | `src/content/*` | cours et exercices versionnés, contrôlés par les tests | importé en base par le seed |

## 3. Modèle de données (cible)

```text
profiles ─┬─ user_roles (rôle, permissions)
          ├─ teacher_assignments ── courses          (étape 3 : « étudiants autorisés »)
          ├─ cohorts / cohort_members                 (groupes / promotions)
          ├─ enrollments ── courses
          ├─ lesson_progress ── lessons ; course_progress (déclencheur)
          ├─ student_projects ── project_files        (remplace programs, étape 5)
          ├─ submissions ── execution_results
          ├─ quiz_attempts ── quizzes
          ├─ ai_conversations ── ai_messages
          ├─ user_achievements ── achievements ; certificates
languages ── courses ── modules ── chapters ── lessons ── lesson_resources   (chapters : étape 4)
exercises ── exercise_test_cases ; exercise_solutions (réservé équipe)
quizzes ── quiz_questions ; quiz_answer_keys (réservé équipe)
announcements · audit_logs · platform_settings · rate_limit_events (étape 12)
```

Conventions : `id uuid`, `created_at` / `updated_at`, `deleted_at` pour la suppression logique des objets utilisateur (projets, conversations) et des contenus archivés, contraintes `check` sur les formats, index sur les clés de recherche, RLS sur toutes les tables.

## 4. Correspondance des rôles

| Master prompt | Base (`app_role`) | Interface |
|---|---|---|
| STUDENT | `etudiant` | Étudiant |
| TEACHER | `enseignant` + permissions `contenus`, `corrections`, `suivi` | Enseignant |
| ADMIN | `administrateur` | Administrateur |

## 5. Exécution du code

| Langage | Avec Judge0 configuré | Sans Judge0 |
|---|---|---|
| Pseudocode | interpréteur (navigateur pour l'éditeur, serveur pour la correction) | idem |
| Python | Judge0 | Pyodide dans un Web Worker (tests visibles seulement, non enregistrés) |
| JavaScript | Judge0 (Node.js) | Web Worker sans DOM ni réseau |
| C, Java | Judge0 | **indisponible, message explicite** |

Limites appliquées : temps CPU, temps réel, mémoire, taille du code, de l'entrée et de la sortie, pas de réseau, nombre d'exécutions par minute ; statut Judge0 systématiquement vérifié.

## 6. Décisions d'architecture

| # | Décision | Justification |
|---|---|---|
| D1 | Conserver Next.js 16 + Supabase + Judge0 | conformes au cahier des charges et déjà fonctionnels |
| D2 | Contenu de référence versionné + CMS en base | relecture par Git et par les tests ; édition par les enseignants sans développeur |
| D3 | Interpréteur de pseudocode maison, sans `eval` | sécurité et messages d'erreur pédagogiques en français |
| D4 | Résultats officiels écrits via `service_role` uniquement | un étudiant ne peut pas falsifier une note |
| D5 | Migrations additives avec reprise de données | aucune perte lors des évolutions du schéma |
| D6 | Tests réels avec Supabase local et Judge0 en Docker | « une fonctionnalité n'est terminée que lorsque son fonctionnement a été vérifié » |
