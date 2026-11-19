# Tests — ZYNORA OFFICE

## Commandes

| Commande | Ce qui est testé |
|---|---|
| `pnpm typecheck` | TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| `pnpm test` | Vitest (design system, interface) + `node:test` (scripts) |
| `pnpm test:rust` | `cargo test --workspace` |
| `pnpm lint:rust` | `cargo fmt --check` + `clippy -D warnings` |
| `pnpm check:licenses` | Licences de toutes les dépendances |
| `pnpm test:e2e` | Application **compilée** pilotée par WebDriver (Linux) |
| `pnpm check` | Tout sauf e2e |

## Niveaux

1. **Unitaires Rust** — bibliothèque (liste, recherche sans accents, dossiers, renommage sans
   écrasement, import validé et refus sans trace, corbeille et restauration avec conflits, purge
   confinée, écriture atomique, liens symboliques ignorés), import par lot, migration v1 → v2,
   sécurité (noms, chemins, liens symboliques, formats, archives : traversée,
   DTD, bombes, doublons, macros) et base (migrations, persistance, refus d'une base plus récente,
   valeur corrompue signalée, journal borné, rejet des modifications non typées).
2. **Interface (Vitest + jsdom)** — composants accessibles (rôles ARIA, clavier), application avec un
   faux backend en mémoire qui **reproduit le contrat** des commandes Rust : chargement, erreurs et
   nouvelle tentative, échec d'enregistrement (l'ancien paramètre est conservé), langues, raccourci.
   Le faux backend sert uniquement à isoler l'interface ; le comportement réel est couvert par l'e2e.
3. **Bout en bout** (`tests/e2e/smoke.mjs`) — vrai binaire, vraie WebView, vraie base SQLite et
   vrai disque, dans un dossier temporaire (dossier « Documents » de test via XDG user-dirs) :
   parcours de la bibliothèque, création de dossier, renommage, favori, corbeille, restauration,
   suppression définitive après confirmation (vérifiées **sur le disque**), thème, journal ; puis
   relance après un **arrêt brutal simulé** : avertissement affiché, données intactes.
   Captures facultatives : `ZYNORA_E2E_SCREENSHOTS=dossier`. Les dialogues natifs (import, choix
   du dossier) ne sont pas pilotables par WebDriver : leur logique est testée en Rust.

## Prérequis e2e (Linux)
```bash
sudo apt-get install -y xvfb webkit2gtk-driver
cargo install tauri-driver --locked
pnpm build && pnpm test:e2e
```
macOS n'a pas de pilote WebDriver pour WKWebView : l'e2e y sera remplacé par des tests Rust
d'intégration et des vérifications manuelles documentées.

## À venir
- Phase 2 : processus réellement tué pendant une écriture de document (récupération du contenu).
- Phase 2+ : corpus de fichiers réels (voir COMPATIBILITY.md), cycles d'aller-retour, valeurs de
  référence des formules, tests de performance (temps d'ouverture, recalcul de 100 000 cellules),
  fuzzing des analyseurs (`cargo fuzz`).
- Publication : tests d'installation/désinstallation et de mise à jour sur machines propres.

## Règle
Une fonctionnalité n'est déclarée terminée qu'avec ses tests. Un test n'est jamais désactivé pour
obtenir une CI verte.
