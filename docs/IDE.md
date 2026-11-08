# UPL IDE — environnement de développement hybride

Ce document couvre trois choses :

- l'audit réalisé avant la phase 1 du master prompt « Hybrid Professional IDE & AI Development Studio » ;
- la conception retenue ;
- l'état réel de chaque phase.

## 1. Audit de l'existant (avant développement)

| Élément | État constaté | Décision |
|---|---|---|
| Next.js 16, React 19, TypeScript strict, Tailwind 4, Supabase (RLS) | Stack adaptée, testée en CI contre un Supabase réel | **Conservée** (aucune migration) |
| Monaco (`@monaco-editor/react`) | Déjà intégré : coloration, autocomplétion, recherche et remplacement, formatage JS/TS/JSON/HTML/CSS, diagnostics TS/CSS/JSON | **Réutilisé** pour l'IDE (bureau et téléphone en phase 2 ; adaptation tactile en phase 3) |
| Exécution | Pseudocode : interpréteur maison. Python : Pyodide (navigateur). JavaScript : Web Worker isolé. C et Java : Judge0, s'il est configuré | **Réutilisée** telle quelle : aucun langage annoncé comme exécutable sans moteur réel |
| Aperçu web | `iframe sandbox="allow-scripts"`, CSP sans réseau, console relayée | **Réutilisé** (résolution des liens relatifs entre dossiers ajoutée) |
| Professeur IA | API serveur, quotas, coûts, historique, fournisseur interchangeable, contexte du parcours | **Réutilisé** dans le panneau IA ; l'assistant qui génère et modifie des fichiers est prévu en phases 5–6 |
| `/editeur` + table `programs` | Fichiers à plat (10 au plus), sans dossiers ni historique | **Conservé** pour les exercices et les démonstrations des cours ; l'IDE utilise un nouveau modèle `projects` |
| Terminal, débogueur, Git, extensions, déploiement | Absents. Ils demandent des environnements isolés par utilisateur, qui n'existent pas encore | **Non affichés** tant qu'ils ne sont pas réels (pas de faux boutons) |

## 2. Conception

- **Route `/ide`** : plein écran, avec une identité propre (logo `</>`, « UPL IDE — UPL CODE ACADEMY MK », palette nuit et électrique). La disposition reprend des principes d'ergonomie courants (barre d'activité, explorateur, onglets, panneaux, barre d'état) sans aucun élément propriétaire.
- **Modèle de données** (migration `20261107000001_projets_ide.sql`) :
  - `projects` : arborescence = fichiers à chemins relatifs + dossiers vides, et une `revision` qui sert à détecter les conflits.
  - `project_versions` : historique.
  - RLS strictement réservée au propriétaire : l'équipe pédagogique elle-même ne lit pas les projets.
- **Logique de fichiers pure et testée** (`src/lib/ide/fs.ts`) : chemins normalisés, avec refus de `..` et des chemins absolus. Opérations : créer, renommer, déplacer, copier, supprimer. S'y ajoutent les limites (200 fichiers, 2 millions de caractères), la détection du langage, la sélection des fichiers à exécuter, l'aperçu depuis un sous-dossier, la recherche et les symboles.
- **Synchronisation** :
  - Enregistrement sur le serveur avec la révision de base ; une mise à jour conditionnelle et atomique renvoie `409` en cas de conflit.
  - Un brouillon local est écrit à chaque frappe : on peut travailler hors ligne, la resynchronisation se fait au retour de la connexion et un avertissement s'affiche avant de quitter.
  - En cas de conflit, l'utilisateur choisit la version à garder ; l'autre reste dans l'historique.
- **ZIP** (`src/lib/ide/zip.ts`, dépendance `fflate@0.8.3`) :
  - L'export comprend les dossiers vides.
  - L'import ne garde que les fichiers texte : les binaires, `node_modules` et `.git` sont écartés, et les chemins piégés (« zip slip ») refusés.
  - L'archive est bornée à 2 000 fichiers et 50 Mo décompressés.
  - Le dossier racine unique d'une archive est retiré.

## 3. État des phases

| Phase | Contenu | État |
|---|---|---|
| 1 | Audit et conception | 🟢 ce document |
| 2 | Explorateur, onglets, éditeur | 🟢 livré et testé (détail ci-dessous) |
| 3 | Expérience mobile type SPCK (clavier de programmation, raccourcis tactiles, plein écran, navigation éditeur ↔ aperçu ↔ console) | 🔵 **Clavier de programmation livré** (symboles selon le langage, tabulation, flèches, annuler, palette, assistant, symboles mathématiques) ; l'IDE se limite à la partie visible quand le clavier du téléphone est ouvert. Reste : gestes dédiés et navigation par balayage. |
| 4 | Terminal, console, exécution, aperçu | 🔵 Console, sortie, exécution réelle (pseudocode, Python, JavaScript ; C et Java via Judge0) et aperçu web multi-appareils sont livrés. **Terminal et débogueur : pas encore** — ils demandent un conteneur isolé par utilisateur 🔌. |
| 5 | Assistant IA intégré | 🔵 Le professeur IA est disponible dans le panneau, avec le fichier ouvert, la liste des fichiers et la dernière erreur. Les propositions de modifications avec différences avant/après, à accepter ou refuser, restent à faire. |
| 6 | Génération de projets complets par IA | ⚪ |
| 7 | Git et GitHub | ⚪ (historique des versions et points de sauvegarde déjà disponibles) |
| 8 | UPL Studio | ⚪ (modèles exécutables disponibles ; React, Next.js et Node.js demandent l'environnement isolé de la phase 4 🔌) |
| 9 | Synchronisation cloud et déploiement | 🔵 Synchronisation multi-appareils livrée ; déploiement à faire 🔌 |
| 10 | Tests, sécurité, mise en production | continu |

### Phase 2 — fonctionnalités livrées

- **Barre supérieure** :
  - nom du projet (cliquer pour le renommer) et statut d'enregistrement ;
  - boutons Enregistrer, Exécuter, Aperçu, Vue fractionnée, Formater, Panneau, Assistant IA.
- **Barre d'activité** : Explorateur, Recherche, Projets, Historique, Assistant IA, Formation, Laboratoire, Paramètres.
- **Explorateur** :
  - arborescence ; création de fichiers et de dossiers dans l'arbre ;
  - renommer, déplacer (glisser-déposer ou « Déplacer vers… »), dupliquer, supprimer avec confirmation ;
  - import de fichiers, d'un dossier ou d'un ZIP ; export en ZIP ;
  - pastille sur les fichiers non enregistrés.
- **Éditeur Monaco** :
  - onglets (fermeture au clic du milieu), vue fractionnée en deux groupes ;
  - coloration selon l'extension (pseudocode, Python, JS, TS, C, Java, HTML, CSS, JSON, Markdown, SQL, PHP) ;
  - autocomplétion, recherche et remplacement, formatage quand il est disponible, erreurs soulignées ;
  - navigation entre les fonctions (« Aller à… » dans la barre d'état) ;
  - raccourcis : Ctrl+S, Ctrl+Entrée, Ctrl+B, Ctrl+J, Ctrl+\.
- **Panneaux redimensionnables** (souris, doigt ou clavier) :
  - Problèmes : diagnostics réels, un clic mène à la ligne ;
  - Console : entrées du programme, sortie, console de la page web ;
  - Sortie : statut, moteur, durée, mémoire ;
  - Journal : enregistrements, imports, exécutions, conflits.
- **Barre d'état** : erreurs et avertissements, statut et révision, symboles, position du curseur, indentation, encodage, langage, caractère exécutable.
- **Projets** :
  - modèles réellement exécutables : web, Python, pseudocode, JavaScript, C, Java, vierge ;
  - créer, ouvrir, renommer, dupliquer, supprimer, importer un ZIP ;
  - projet local pour les visiteurs, et « Enregistrer dans mon compte » une fois connecté.
- **Historique** : une version automatique toutes les 10 minutes au plus, des points de sauvegarde nommés, 30 versions conservées ; restauration dans l'éditeur.
- **Paramètres** : thème sombre ou clair, taille du texte, indentation, retour à la ligne, minicarte, enregistrement automatique.

### Interface de type studio (novembre 2026)

L'IDE reprend la disposition familière des éditeurs de code de bureau, avec un dessin propre à la plateforme :

- **Thème « studio »** par défaut (gris neutre, barre d'état bleue) ; thèmes « nuit UPL » et « clair » au choix (Affichage ou Paramètres).
- **Barre de titre** : logo, menus **Fichier, Édition, Sélection, Affichage, Exécuter, Aide** (un seul bouton ☰ sur téléphone), titre « fichier — projet — UPL IDE », boutons d'action et de disposition. Chaque entrée de menu déclenche une action réelle (création, import, export, enregistrement, annuler/rétablir, recherche, commentaire, déplacement de lignes, multicurseur, palette de commandes de l'éditeur, panneaux, thème…).
- **Explorateur en sections** : *Éditeurs ouverts* (fermeture d'un clic), arborescence du projet avec icônes par type de fichier, *Plan* (fonctions et classes du fichier ouvert, clic → ligne).
- **Onglets** avec icône du type de fichier, **fil d'Ariane** du chemin sous les onglets, **minicarte** activée (ordinateur), **page d'accueil** quand aucun fichier n'est ouvert (démarrer, fichiers du projet, raccourcis).
- **Aperçu web** en panneau latéral façon navigateur : actualiser, choix de la page HTML affichée, vues ordinateur / tablette / téléphone.
- **Panneau** Problèmes (compteur), Sortie, Console, Journal, agrandissable.
- **Barre d'état** : projet, statut d'enregistrement, erreurs et avertissements, position (clic → aller à la ligne), indentation, encodage, fin de ligne, langage, mode d'exécution.

### Éditeur intelligent (novembre 2026)

- **Modèles de fichiers** (`src/lib/ide/starters.ts`) : un nouveau fichier reçoit un contenu de départ selon son extension, et le curseur est placé au bon endroit.
  - `.html` : page complète, curseur dans `<title>` ;
  - `.java` : classe au nom du fichier ;
  - `.c` : `main` ;
  - `.algo` : algorithme valide, curseur entre `DEBUT` et `FIN` ;
  - `.css`, `.py`, `.js`, `.json`, `.md` : contenu minimal.
- **Balises comme dans Sublime Text** :
  - abréviations **Emmet** (`emmet-monaco-es@5.7.0`) : `div`, `ul>li*3`, `.carte`, `a[href]`… On les développe avec Tab, ou en touchant la suggestion « Emmet abbreviation » ;
  - suggestions de balises après `<` ;
  - **fermeture automatique** : `<p>` tapé ajoute `</p>` (`src/lib/ide/html-close.ts`, sans les balises vides comme `<br>` ou `<img>`).
- **Clavier de programmation** (téléphone et tablette, `src/components/ide/mobile-keys.tsx`) :
  - **HTML** : `<tag>` (liste des balises), `div`, `p`, `class`, `id` (écrits dans la balise qui précède le curseur), `=`, `""`, `<`, `>`, `/` ;
  - **CSS** : `{ }`, `:`, `;`, `.`, `#`, unités ;
  - **pseudocode** : `←`, `=`, `≠`, `<`, `>`, `≤`, `≥`, opérateurs, `..` ;
  - **autres langages** : parenthèses, accolades, crochets, opérateurs ;
  - **symboles mathématiques** : `∈`, `∉`, `∀`, `∃`, `¬`, `∧`, `∨`… pour les énoncés, commentaires et chaînes. L'interpréteur du pseudocode ne les accepte pas comme opérateurs ;
  - **commandes** : tabulation, ↑ ↓ ← →, annuler, rétablir, palette de commandes, assistant IA.

  Les touches ne retirent pas le focus de l'éditeur : le clavier du téléphone reste ouvert.

### Ce qui n'est pas affiché, faute de service réel

- terminal ;
- débogueur pas à pas pour les langages de l'IDE (le pas à pas du pseudocode existe dans le laboratoire) ;
- Git et GitHub ;
- extensions ;
- déploiement ;
- exécution de TypeScript, PHP et SQL : les fichiers s'éditent avec coloration et diagnostics, mais la barre d'état indique « édition seule ».

### Tests

- **Unitaires** (`src/lib/ide/*.test.ts`, 19 tests) : chemins, opérations, limites, validation, langages, aperçu depuis un sous-dossier, recherche, symboles, ZIP (aller-retour, binaires, zip slip, archive illisible).
- **Base de données** (PGlite) : 10 contrôles RLS sur l'isolation des projets et de l'historique, et le blocage d'un compte suspendu.
- **De bout en bout** (`e2e/ide.spec.ts`) :
  - projet local : fichiers, déplacer, renommer, dupliquer, supprimer, nom refusé, exécution JavaScript réelle, recherche, vue fractionnée, brouillon conservé au rechargement ;
  - aperçu web : CSS relié depuis un dossier, console de la page, vue téléphone ;
  - projets du compte : création depuis un modèle, Ctrl+S, révision, conflit 409, point de sauvegarde, export et import ZIP, isolation entre deux étudiants.
- **Mobile** : `/ide` est ajouté aux contrôles sans défilement horizontal.
