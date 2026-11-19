# Architecture — ZYNORA OFFICE

## 1. Vue d'ensemble

```
┌──────────────────────── Interface : React 19 + TypeScript (WebView) ─────────────────────────┐
│  design-system (jetons, composants, thèmes)  ·  shell Core (navigation, paramètres, journal)  │
│  Phases suivantes : Sheets (grille canvas) · Word (ProseMirror + pagination) · Slides (SVG)    │
└───────────────────────────── IPC Tauri : commandes typées uniquement ────────────────────────┘
┌─────────────────────────────────────── Cœur Rust ─────────────────────────────────────────────┐
│  apps/desktop/src-tauri   commandes, état, cycle de vie                                       │
│  packages/security        noms/chemins sûrs, format réel, inspection ZIP/XML                   │
│  packages/database        SQLite : migrations, paramètres, journal, récents, favoris, corbeille│
│  packages/file-manager    bibliothèque : import validé, dossiers, corbeille, écriture atomique │
│  À venir : spreadsheet-engine (IronCalc) · document-engine · presentation-engine ·            │
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

### D3 — Moteur de tableur : IronCalc (phase 2)
- Rust, **MIT / Apache-2.0**, moteur de formules réel, lecture/écriture XLSX, ~300 fonctions.
- Intégré côté Rust ; l'interface envoie des saisies et reçoit des valeurs calculées. Aucun résultat
  n'est jamais calculé ou « deviné » côté interface.
- HyperFormula écarté (GPL-3.0 ou commercial).
- Avant intégration : prototype mesurant fidélité XLSX, performances (100 000 lignes), couverture
  des fonctions françaises (SOMME, RECHERCHEV…), API de dépendances et de recalcul.

### D4 — Traitement de texte : ProseMirror + moteur de pagination maison (phase 3)
- ProseMirror (MIT) pour l'édition structurée, l'annulation, la collaboration future.
- Pagination, en-têtes/pieds, notes : moteur de mise en page à écrire (risque n°1 du projet).
- DOCX/ODT : analyseurs Rust (`zip`, `quick-xml`) avec **conservation du XML non compris** pour ne
  rien perdre à l'enregistrement.

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

Règles : arguments désérialisés en types Rust fermés (une clé ou valeur inconnue est rejetée par
serde) ; erreurs renvoyées sous forme `{message}` lisible, sans trace interne ; la fenêtre n'a
**aucune permission Tauri** (`capabilities/default.json` vide) ; le plugin de dialogues est
utilisé exclusivement depuis Rust.

## 4. Évolutivité prévue
- Grandes feuilles : moteur côté Rust, grille virtualisée (seules les cellules visibles sont rendues).
- Fichiers lourds : traitement en tâche de fond Rust, jamais dans le fil de l'interface.
- Récupération après incident : journal d'écriture + points de récupération en SQLite (phase 1).
