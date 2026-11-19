# Architecture — ZYNORA OFFICE

## 1. Vue d'ensemble

```
┌──────────────────────── Interface : React 19 + TypeScript (WebView) ─────────────────────────┐
│  design-system (jetons, composants, thèmes)  ·  shell Core (navigation, paramètres, journal)  │
│  Sheets (ruban, barre de formule, grille virtualisée) · Word (ProseMirror, page, ruban)       │
│  · à venir : Slides                                                                           │
└───────────────────────────── IPC Tauri : commandes typées uniquement ────────────────────────┘
┌─────────────────────────────────────── Cœur Rust ─────────────────────────────────────────────┐
│  apps/desktop/src-tauri   commandes, état, cycle de vie                                       │
│  packages/security        noms/chemins sûrs, format réel, inspection ZIP/XML                   │
│  packages/database        SQLite : migrations, paramètres, journal, récents, favoris, corbeille│
│  packages/file-manager    bibliothèque : import validé, dossiers, corbeille, écriture atomique │
│  packages/spreadsheet-engine  IronCalc : formules, XLSX, CSV, styles, feuilles, historique    │
│  packages/document-engine     docx-rs : modèle de texte, DOCX, TXT, détection des pertes      │
│  À venir : presentation-engine ·                                                              │
│            export-engine (PDF) · ai-assistant (optionnel)                                      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Principe directeur : les formats de fichiers sont traités en Rust.** L'analyse, la validation,
la conversion et le calcul ont lieu dans le cœur natif. L'interface édite un modèle de document et
n'a **aucun** accès direct au système de fichiers, au shell ou au réseau.

## 2. Décisions

### D1 — Tauri 2 (et non Electron, ni ONLYOFFICE Desktop)
- Binaire léger (WebView du système), cœur Rust sûr en mémoire, modèle de permissions par capacités.
- Version **2.12 stable** ; Tauri 3 n'existe qu'en alpha (novembre 2026) et n'est pas retenu.
- Conséquence : trois moteurs de rendu (WebView2, WKWebView, WebKitGTK). Toute fonction de rendu
  doit être testée sur les trois (CI matricielle).

### D2 — ONLYOFFICE : évalué et écarté comme moteur embarqué
| Critère | Constat |
|---|---|
| Licence | `sdkjs`, `web-apps`, `core` (x2t) : AGPL-3.0 + clause 7(b) imposant de **conserver le logo ONLYOFFICE**. Incompatible avec une identité ZYNORA propre ; l'AGPL s'étendrait à tout le produit. |
| Architecture | Les éditeurs JS ne lisent pas le DOCX : il faut le convertisseur C++ `x2t` et un format binaire interne. Desktop Editors repose sur CEF (Chromium), pas sur une WebView Tauri. |
| Hors ligne | Possible (Desktop Editors le fait), mais au prix d'embarquer CEF + x2t (centaines de Mo). |
| Alternative | Licence commerciale « Developer Edition » sur devis (non chiffrée ici). |

**Décision** : ne pas intégrer ONLYOFFICE. Réévaluable si une licence commerciale est achetée.

### D3 — Moteur de tableur : IronCalc — **validé et intégré** (phase 2)
Prototype du 19/11/2026 : fonctions en français justes (SOMME, MOYENNE, SI, NB.SI, SOMME.SI,
RECHERCHEV, ET, OU, NBVAL…), séparateurs « ; » et virgule décimale, erreurs (#DIV/0!, #NOM?),
100 000 lignes de formules calculées en 0,6 s et recalcul en 38 ms, 3 cycles XLSX sans perte,
fichiers relus par LibreOffice et fichiers produits par LibreOffice ouverts. Formats de nombre
stockés en syntaxe Excel canonique (« 0.00 ») et affichés selon la langue. ODS non pris en charge
par IronCalc. Intégration : `packages/spreadsheet-engine` (classeurs ouverts côté Rust ; l'interface
ne reçoit que la fenêtre visible de la grille).

Notes d'origine :
- Rust, **MIT / Apache-2.0**, moteur de formules réel, lecture/écriture XLSX, ~300 fonctions.
- Intégré côté Rust ; l'interface envoie des saisies et reçoit des valeurs calculées. Aucun résultat
  n'est jamais calculé ou « deviné » côté interface.
- HyperFormula écarté (GPL-3.0 ou commercial).
- Avant intégration : prototype mesurant fidélité XLSX, performances (100 000 lignes), couverture
  des fonctions françaises (SOMME, RECHERCHEV…), API de dépendances et de recalcul.

### D4 — Traitement de texte : ProseMirror + docx-rs — **première version intégrée** (phase 3)
- **Édition** : ProseMirror (MIT) dans l'interface. Le schéma (`apps/desktop/src/word/schema.ts`)
  reflète exactement le modèle du moteur Rust : paragraphes « à plat » (style, alignement, liste
  et niveau, retraits, espacements, interligne), marques (gras, italique, souligné, barré,
  exposant/indice, couleur, surlignage, taille, police, lien), tableaux simples, sauts de page.
  Les listes sont à plat comme dans le format DOCX : la numérotation est rendue par des compteurs CSS.
- **Fichiers** : `packages/document-engine` lit et écrit le DOCX avec docx-rs 0.4.22 (MIT ; ses
  champs étant privés, la lecture parcourt sa représentation JSON). Le texte brut est géré à part.
- **Aucune perte silencieuse** : la conservation du XML non compris (prévue à l'origine) n'est pas
  réalisable avec docx-rs. À la place, la lecture **relève** tout ce qui ne sera pas réécrit
  (images, notes, champs, commentaires, modifications suivies, en-têtes et pieds de page,
  cellules fusionnées, styles personnalisés…). Si la liste n'est pas vide, l'interface l'affiche et
  **l'original n'est jamais remplacé** : seule « Enregistrer une copie » est possible. La règle est
  appliquée **dans le cœur Rust** (`word_save` relit le fichier présent sur le disque et refuse),
  pas seulement par l'interface.
- **Pagination** : affichage en page continue aux dimensions et marges du document ; les sauts de
  page sont respectés à l'écran et à l'impression. La pagination automatique avec en-têtes, pieds
  et notes reste un moteur de mise en page à écrire (risque n° 1 du projet).
- ODT : non pris en charge par docx-rs ; refus explicite à l'ouverture.

### D15 — Paniques des bibliothèques de lecture rattrapées
Les lecteurs tiers (docx-rs, IronCalc) peuvent paniquer sur un fichier inattendu ou piégé. Le profil
de compilation release utilise `panic = "unwind"` (au lieu de `abort`) et les appels de lecture sont
enveloppés dans `catch_unwind` : un fichier défectueux produit un message d'erreur au lieu de fermer
l'application (et de faire perdre le travail ouvert dans d'autres fenêtres). Coût : binaire un peu
plus gros.

### D5 — Présentations : modèle maison, rendu SVG/DOM, PPTX/ODP en Rust (phase 4)

### D6 — PDF : choix reporté à un prototype comparatif
`krilla` (Rust, MIT/Apache-2.0) contre impression WebView. Critère : polices intégrées, texte
sélectionnable, rendu identique sur les trois systèmes.

### D7 — Stockage : SQLite intégré (`rusqlite`, `bundled`)
- Une base par utilisateur dans le dossier de données de l'application (`app_data_dir`).
- Migrations numérotées (`PRAGMA user_version`), chacune dans une transaction ; tables `STRICT`.
- Une base créée par une version plus récente n'est **pas ouverte** (protection contre la corruption
  lors d'un retour à une version antérieure).
- Les documents restent des fichiers ordinaires (DOCX, XLSX…) ; SQLite ne contient que les
  métadonnées (récents, favoris, corbeille, historique, points de récupération).

### D8 — IA optionnelle et désactivée par défaut (phase 6)
Fournisseur local (Ollama) ou clé de l'utilisateur stockée dans le trousseau du système
(`keyring`). Aucune fonction bureautique n'en dépend.

### D9 — Ordre des modules : Sheets avant Word
IronCalc fournit déjà un moteur réel ; Sheets peut devenir réellement utilisable bien avant Word,
dont la mise en page est à construire. Ordre modifiable sur décision du porteur de projet.

### D10 — Emplacement provisoire
Dossier isolé `zynora-office/` du dépôt existant, faute de dépôt dédié dans cette session. Exclu
du lint et du typage de ZENTECH ; CI séparée filtrée par chemin. Déplaçable sans modification.

### D13 — Interface « familière » sans copie de Microsoft Office
Disposition reprise des conventions des tableurs (ruban à onglets, zone de nom, barre de formule,
onglets de feuilles, barre d'état), **avec l'identité ZYNORA** (icônes Lucide, couleurs, typographie).
Une reproduction à l'identique de l'interface, des icônes ou des marques de Microsoft n'est pas
faite (droits de propriété intellectuelle ; exigence du cahier des charges).

### D14 — Version smartphone : Tauri 2 mobile
Même application (interface React adaptative + cœur Rust) compilée pour Android et iOS. Sur
téléphone : bibliothèque dans l'espace privé de l'application (aucune permission de stockage),
navigation en bas d'écran, choix du dossier de bibliothèque désactivé. Limites actuelles : import
depuis le stockage du téléphone (adresses `content://`) à implémenter ; iOS à compiler sur Mac.

### D11 — Bibliothèque de documents et corbeille interne (phase 1)
- Les documents vivent dans un dossier ordinaire (`Documents/ZYNORA` par défaut), lisible par
  n'importe quel autre logiciel. Tous les chemins échangés avec l'interface sont **relatifs** à ce
  dossier et revalidés à chaque appel.
- Le dossier est choisi **uniquement par dialogue natif** ouvert par Rust : l'interface ne peut pas
  désigner un chemin arbitraire.
- Corbeille **interne** (`.zynora/corbeille/<id>/`) plutôt que celle du système : comportement
  identique sur les trois systèmes, restauration depuis ZYNORA, tests automatisés possibles.
- Import en trois temps : copie bornée vers un fichier temporaire caché → validation de la copie
  (aucune fenêtre entre contrôle et utilisation) → renommage atomique vers un nom libre.

### D12 — Démarrage dégradé
Si la base locale ne s'ouvre pas, l'application démarre quand même et chaque commande renvoie le
message d'erreur, affiché par l'interface. Un verrou de session (`session.lock`) détecte un arrêt
brutal de la session précédente.

## 3. Échanges entre composants (contrat IPC)

| Commande | Entrée | Sortie | Effet |
|---|---|---|---|
| `app_info` | — | `{name, version, schema_version, os, arch}` | lecture |
| `get_settings` | — | `{theme, language}` | lecture SQLite |
| `update_setting` | `{change: {key, value}}` (énumération fermée) | paramètres à jour | écriture + journal (une transaction) |
| `recent_events` | `{limit}` (borné à 1..200) | événements du journal | lecture |
| `library_info` | — | `{path, is_default}` | lecture |
| `choose_library` | — (dialogue natif) | `{path, is_default}` ou `null` | écriture + journal |
| `dashboard` | — | `{recent, favorites}` (documents encore présents) | lecture |
| `list_folder` | `{path}` relatif | éléments + état favori | lecture disque |
| `search_documents` | `{query}` (≤ 200 caractères) | ≤ 200 éléments | lecture disque bornée |
| `create_folder` | `{parent, name}` | élément | disque + journal |
| `rename_entry` | `{path, newName}` | élément | disque + base + journal |
| `import_documents` | `{folder}` (dialogue natif) | `{cancelled, imported, rejected}` | disque + base + journal |
| `set_favorite` | `{path, favorite}` | booléen | base |
| `trash_entry` | `{path}` | élément de corbeille | disque + base + journal |
| `list_trash` | — | éléments de corbeille | lecture |
| `restore_trash` | `{id}` | élément restauré | disque + base + journal |
| `purge_trash` / `empty_trash` | `{id}` / — | — / nombre | **suppression définitive** + journal |
| `sheets_open` / `sheets_create` | `{path}` / `{folder}` | classeur ouvert (id, feuilles, état) | lecture revalidée / création atomique |
| `sheets_range` | `{id, range}` (≤ 20 000 cellules) | valeurs **calculées par le moteur** et styles | lecture |
| `sheets_cell`, `sheets_stats` | cellule / plage | contenu saisi ; somme, moyenne, nombre | lecture |
| `sheets_set_input`, `sheets_clear`, `sheets_style`, `sheets_structure`, `sheets_sheet`, `sheets_history` | modifications typées (énumérations fermées) | nouvel état (non enregistré, annuler/rétablir) | mémoire |
| `sheets_copy`, `sheets_paste` | plage, texte | texte tabulé | mémoire |
| `sheets_save` | `{id}` | état | **écriture atomique** du document + journal |
| `sheets_autosave` | `{id}` | copie écrite ? | copie de récupération (dossier de l'application) |
| `sheets_close` | `{id, discard}` | fermé ? (refusé si non enregistré sans `discard`) | — |
| `list_recoveries`, `sheets_open_recovery`, `discard_recovery_command` | chemin | copies de récupération | lecture / suppression de la copie |
| `word_open` / `word_create` | `{path}` / `{folder}` | document (modèle JSON, format, **éléments non conservés**) | lecture revalidée / création atomique |
| `word_save` | `{path, document}` (modèle revalidé : dimensions, couleurs, liens http/https/mailto) | — | **écriture atomique** ; refusée si le fichier sur le disque contient des éléments non conservés |
| `word_save_copy` | `{path, name, document}` (.docx ou .txt) | nouveau document | création sans écrasement (nom libre choisi) |
| `word_autosave`, `word_open_recovery` | `{path, document}` / `{path}` | — / document | copie de récupération JSON (dossier de l'application) |
| `print_webview` | — | dialogue natif ouvert ? | impression (macOS) ; ailleurs `window.print()` |

Règles : arguments désérialisés en types Rust fermés (une clé ou valeur inconnue est rejetée par
serde) ; erreurs renvoyées sous forme `{message}` lisible, sans trace interne ; la fenêtre n'a
**aucune permission Tauri** (`capabilities/default.json` vide) ; le plugin de dialogues est
utilisé exclusivement depuis Rust.

## 4. Évolutivité prévue
- Grandes feuilles : moteur côté Rust, grille virtualisée (seules les cellules visibles sont rendues).
- Fichiers lourds : traitement en tâche de fond Rust, jamais dans le fil de l'interface.
- Récupération après incident : journal d'écriture + points de récupération en SQLite (phase 1).
