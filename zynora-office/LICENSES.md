# Licences — ZYNORA OFFICE

## Licence de ZYNORA OFFICE
**Non encore choisie** : c'est une décision du porteur de projet (propriétaire, MIT/Apache, MPL…).
Les manifestes ne déclarent donc aucune licence pour l'instant. Toutes les dépendances retenues
sont compatibles avec une distribution propriétaire comme libre.

## Politique pour les dépendances
Autorisées : MIT, MIT-0, Apache-2.0 (y compris `WITH LLVM-exception`), BSD-2/3-Clause, ISC, Zlib,
0BSD, BSL-1.0, Unlicense, CC0-1.0, Unicode-3.0, Unicode-DFS-2016, CDLA-Permissive-2.0, et MPL-2.0
(copyleft limité aux fichiers modifiés de la bibliothèque).

Refusées : GPL, LGPL (liaison statique en Rust), AGPL, SSPL, BUSL, « Commons Clause », licences
inconnues ou absentes. Une expression `A OR B` est acceptée si une option est autorisée.

Contrôle automatique : `pnpm check:licenses` (`scripts/check-licenses.mjs`) vérifie **toutes** les crates
Rust (y compris celles propres à Windows et macOS) et les paquets npm de production. Résultat au
19/11/2026 : **472 dépendances, toutes autorisées**.

## Dépendances directes

| Composant | Version | Licence | Rôle |
|---|---|---|---|
| tauri, tauri-build | 2.12.7 / 2.7.6 | MIT OR Apache-2.0 | Application de bureau |
| @tauri-apps/api, @tauri-apps/cli | 2.12.5 / 2.12.6 | MIT OR Apache-2.0 | IPC, outillage |
| ironcalc (moteur de tableur) | 0.9.1 | MIT OR Apache-2.0 | Formules, XLSX |
| tauri-plugin-dialog | 2.8.4 | MIT OR Apache-2.0 | Dialogues natifs (utilisés depuis Rust uniquement) |
| rusqlite (SQLite intégré) | 0.43.0 | MIT (SQLite : domaine public) | Base locale |
| zip | 9.7.0 | MIT | Lecture des conteneurs OOXML/ODF |
| serde, serde_json, thiserror | 1.x / 2.x | MIT OR Apache-2.0 | Sérialisation, erreurs |
| react, react-dom | 19.3.1 | MIT | Interface |
| lucide-react | 1.75.0 | ISC | Icônes |
| vite, @vitejs/plugin-react | 8.3.8 / 6.3.0 | MIT | Compilation (non livré) |
| vitest, jsdom, @testing-library/react, typescript | — | MIT / Apache-2.0 | Tests (non livré) |

## Moteurs évalués

| Moteur | Licence | Décision |
|---|---|---|
| ONLYOFFICE (sdkjs, web-apps, core/x2t, Desktop Editors) | AGPL-3.0 + 7(b) logo obligatoire | **Écarté** (voir ARCHITECTURE.md, D2) |
| IronCalc | MIT OR Apache-2.0 | **Validé et intégré** (phase 2) |
| HyperFormula | GPL-3.0 ou commerciale | Écarté |
| ProseMirror | MIT | **Retenu** pour Word (phase 3) |
| LibreOffice (sans interface) | MPL-2.0 | Option future : convertisseur externe s'il est installé, jamais livré |
| krilla | MIT OR Apache-2.0 | Candidat PDF (prototype) |
| spellbook + dictionnaires Hunspell | MPL-2.0 ; dictionnaires : licences variables | Candidat correcteur ; licence de chaque dictionnaire à vérifier |

## Polices
Phase 0 : polices du système uniquement (aucune police redistribuée). Toute police embarquée devra
être sous licence SIL OFL ou équivalente, documentée ici.
