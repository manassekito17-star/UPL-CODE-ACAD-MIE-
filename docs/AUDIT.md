# Audit du dépôt — UPL Code Academy

Date : 5 novembre 2026 · Branche : `claude/upl-code-academy-specs-vl0z7e` · Référentiel : *Master prompt UPL Code Academy* (parties I à XVIII).

## 1. État constaté

### 1.1 Technologies et structure

| Élément | Constat |
|---|---|
| Framework | Next.js 16.4.5 (App Router, `src/proxy.ts`), React 19.3, TypeScript `strict` |
| Interface | Tailwind CSS 4, composants maison (`src/components/ui`), Monaco via `@monaco-editor/react` (chargé depuis le CDN jsDelivr) |
| Données | Supabase : 4 migrations versionnées (`supabase/migrations`), seed généré (`supabase/seed.sql`), RLS sur toutes les tables |
| Exécution | Interpréteur de pseudocode maison ; client Judge0 ; repli navigateur (Web Worker JavaScript, Pyodide pour Python) |
| IA | SDK Anthropic derrière une interface `AiProvider` interchangeable, appels serveur uniquement |
| Taille | 139 fichiers, ≈ 16 600 lignes TypeScript, 69 leçons, 54 exercices |

### 1.2 Configuration (sans afficher de secrets)

| Variable | État dans cet environnement |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **absentes** → application en mode démonstration |
| `SUPABASE_SERVICE_ROLE_KEY` | **absente** |
| `JUDGE0_URL` | **absente** → C et Java non exécutables ; Python et JS en repli navigateur |
| `ANTHROPIC_API_KEY` | **absente** → professeur IA indisponible |

Aucun fichier `.env*` contenant des secrets n'est versionné (seul `.env.example`).

### 1.3 Qualité (base de référence mesurée)

| Contrôle | Résultat |
|---|---|
| `npm test` (Vitest) | 160 tests réussis : interpréteur, formats, Judge0 simulé, et exécution réelle de chaque exemple et de chaque solution de référence en pseudocode, Python, C, JavaScript et Java |
| `npm run test:db` | migrations + seed + 23 scénarios RLS réussis sur PostgreSQL (PGlite) |
| `npm run test:e2e` (ajouté pendant cet audit) | 20 scénarios navigateur réussis (ordinateur + iPhone émulé) |
| Lint / types / build | réussis |
| `npm audit --omit=dev` | **1 vulnérabilité critique** (DOMPurify ≤ 3.4.16, via `monaco-editor`) → **corrigée** pendant l'audit (surcharge `dompurify@3.4.17`, 0 vulnérabilité) |

### 1.4 Infrastructure de test disponible

Docker fonctionne dans l'environnement de développement (conteneurs privilégiés, cgroups v1) et la CLI Supabase est accessible : il est possible de tester **réellement** Supabase local (authentification, RLS, Storage) et une instance Judge0 au lieu de les simuler. Ce sera fait aux étapes 3 et 7.

## 2. Écarts avec le master prompt

Légende : ✅ conforme · 🟡 partiel · ❌ absent

| Partie | Exigence | État | Écart précis |
|---|---|---|---|
| I | Slogan « LEARN. CODE. PRACTICE. MASTER. » | ❌ | absent de l'interface |
| III | Services métier séparés | 🟡 | logique dans `src/lib`, mais les *server actions* d'administration mêlent validation, accès aux données et journalisation (386 lignes) |
| III | Surveillance des erreurs | ❌ | aucune remontée centralisée |
| IV | Navigation latérale sur ordinateur | ❌ | navigation horizontale uniquement |
| IV | Zones redimensionnables | ❌ | proportions fixes |
| V | Auth complète | 🟡 | implémentée mais **jamais exécutée contre un vrai Supabase** |
| V | Gestion des sessions | 🟡 | pas de liste ni de révocation des sessions par l'utilisateur |
| V | Enseignant : « étudiants autorisés » | ❌ | un enseignant avec la permission `suivi` voit tous les étudiants ; pas d'affectation enseignant ↔ parcours/groupe |
| VI | Modules → **chapitres** → leçons | ❌ | deux niveaux seulement (modules → leçons) |
| VI | Structure par notion (définition, explication, exemple, **explication ligne par ligne**, **erreur fréquente**, exercice, correction, vérification) | 🟡 | explication ligne par ligne et erreur fréquente absentes des 69 leçons |
| VI | CMS : prévisualisation | ❌ | édition et publication présentes, pas d'aperçu |
| VII | Annuler/rétablir, rechercher, copier : boutons | 🟡 | disponibles au clavier (Monaco), pas dans l'interface |
| VII | Ouvrir / renommer un projet, nouveau fichier pour tous les langages | 🟡 | multi-fichiers limité à Python ; ouverture via une page séparée ; pas de renommage |
| VII | Trois zones (éditeur, consignes, console) sur l'éditeur libre | 🟡 | trois zones seulement dans les exercices |
| VIII | Interpréteur réel avec numéro de ligne et messages simples | ✅ | — |
| VIII | « Demander les entrées utilisateur » | 🟡 | entrées saisies à l'avance ; pas de saisie interactive pendant l'exécution |
| IX | Judge0 isolé, limites, statut vérifié | 🟡 | code présent et testé avec des réponses simulées ; **jamais exécuté contre une vraie instance** |
| IX | Identifiants et versions de langages configurables | 🟡 | via variables d'environnement ; la table `languages` modifiable dans l'administration **n'est pas utilisée** à l'exécution (incohérence) |
| X | Type « Détecter une erreur » | ❌ | absent de l'énumération |
| X | QCM / vrai-faux comme exercices de la bibliothèque | 🟡 | existent comme quiz de leçon, pas dans la bibliothèque d'exercices |
| X | Filtre par chapitre | ❌ | filtres par parcours et niveau seulement |
| XI | Cinq modes (professeur, assistant, révision, examen, débogage) | 🟡 | sept « actions » existent mais ne correspondent pas aux cinq modes |
| XI | Analyse du code **avec autorisation de l'étudiant** | ❌ | **le code de l'éditeur est envoyé automatiquement** sur les pages d'exercice — écart de confidentialité prioritaire |
| XI | Historique des conversations consultable | 🟡 | enregistré en base, non affiché |
| XI | Ne pas inventer de résultats d'exécution ; distinguer hypothèse et certitude | 🟡 | à inscrire explicitement dans la consigne |
| XI | Fonctionnement vérifié | ❌ | aucune clé : jamais appelé |
| XII | Badges « Maître des conditions / des boucles », « Premier projet terminé », « Premier cours terminé » | 🟡 | 6 badges existent, pas ceux-ci |
| XII | Pas de badge sur simple clic | ❌ | **« Curieux » (première leçon) est attribué sur le bouton « Marquer comme terminée »** |
| XIII | Tableau de bord : enseignants, erreurs d'exécution, état des services | 🟡 | partiel |
| XIV | `student_projects`, `project_files` | ❌ | une table `programs` avec les fichiers en JSON |
| XIV | Suppression logique | ❌ | suppressions physiques uniquement |
| XV | Politique de sécurité du contenu (CSP) | ❌ | autres en-têtes présents |
| XV | Limitation des requêtes multi-instances | 🟡 | en mémoire (inefficace sur plusieurs instances Vercel) ; quotas IA persistés |
| XV | Sauvegarde et **procédure de restauration** | 🟡 | sauvegardes mentionnées, restauration non documentée ni testée |
| XVI | Tests inscription, connexion, réinitialisation, accès enseignant/admin, IA, sauvegarde de projets | ❌ | nécessitent Supabase local (disponible) et un fournisseur IA de test |
| XVII | Guide de déploiement pour débutant, déploiement vérifié | 🟡 | guide condensé dans le README ; rien n'est déployé |

## 3. Risques techniques

| # | Risque | Impact | Mesure proposée |
|---|---|---|---|
| R1 | Judge0 CE exige des cgroups v1 ; la plupart des serveurs récents utilisent cgroups v2 | C et Java inutilisables en production | documenter l'hébergement (VM avec `systemd.unified_cgroup_hierarchy=0`), tester ici en Docker ; garder l'interface d'exécution indépendante du fournisseur (Piston possible en alternative) |
| R2 | Connexions lentes et données mobiles coûteuses (contexte Lubumbashi) : Pyodide ≈ 10 Mo, Monaco depuis un CDN | lenteur, coût pour l'étudiant | préférer l'exécution serveur pour Python dès que Judge0 est en place ; auto-héberger Monaco ; budget de performance mobile |
| R3 | Limitation des requêtes en mémoire sur Vercel | contournable | compteurs en base (table dédiée) ou Redis managé |
| R4 | Coût du professeur IA | dépassement budgétaire | quotas et budget déjà persistés ; modèle configurable ; tests avec un fournisseur simulé, puis un test réel limité |
| R5 | Contenu généré à valider pédagogiquement | erreurs dans les cours | contrôle automatique d'exécution déjà en place ; circuit de validation enseignant (statut « en révision ») |
| R6 | Évolution du schéma (chapitres, projets) sur une base déjà peuplée | perte de données | migrations additives avec reprise des données (`programs` → `student_projects` / `project_files`) |
| R7 | Envoi du code à l'IA sans consentement | non-conformité, confidentialité | consentement explicite par conversation (étape 9, traité en priorité) |

## 4. Conclusion

La base est saine et vérifiée sur ce qui ne dépend pas de services externes. Les écarts principaux sont : l'absence de vérification réelle avec Supabase, Judge0 et l'IA ; le consentement avant analyse du code ; la navigation latérale et l'éditeur à zones redimensionnables ; le niveau « chapitres » et la structure pédagogique par notion ; les projets étudiants en tables dédiées ; des badges non fondés sur des clics ; la sécurité (CSP, limitation multi-instances, restauration). Le plan d'exécution est détaillé dans [PLAN.md](PLAN.md) et l'architecture cible dans [ARCHITECTURE.md](ARCHITECTURE.md).
