# ZYNORA OFFICE

Suite bureautique indépendante et multiplateforme (Windows 10/11, macOS, Linux), utilisable hors connexion :
**ZYNORA Sheets** (tableur), **ZYNORA Word** (traitement de texte), **ZYNORA Slides** (présentations).

> **État : phase 2 — ZYNORA Sheets disponible.** Tableur complet pour l'usage courant (formules
> calculées par le moteur IronCalc, mise en forme, plusieurs feuilles, XLSX et CSV, sauvegarde
> automatique et récupération), bibliothèque de documents, interface adaptée au téléphone.
> Word et Slides ne sont pas encore disponibles et l'interface l'indique.
> Détail à jour : [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Démarrage rapide

Prérequis : Node.js ≥ 22, pnpm 10, Rust stable (≥ 1.85) et les dépendances système de Tauri.

```bash
# Linux (Debian/Ubuntu) : dépendances système
./scripts/setup-linux.sh

pnpm install
pnpm dev          # application de bureau en développement (rechargement à chaud)
pnpm check        # types + tests JS + tests Rust + fmt/clippy + licences
pnpm build        # application compilée et installateurs de la plateforme courante
pnpm test:e2e     # bout en bout sur le binaire compilé (Linux, nécessite xvfb et tauri-driver)

# Android (SDK + NDK installés, ANDROID_HOME et NDK_HOME définis)
cd apps/desktop && pnpm tauri android build --debug --apk --target aarch64
```

iOS : `pnpm tauri ios init` puis `pnpm tauri ios build` sur un Mac avec Xcode et un compte
Apple Developer (non réalisable depuis Linux).

Windows : installer [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
et WebView2 (présent par défaut sur Windows 10/11 récents). macOS : `xcode-select --install`.

## Organisation

```
zynora-office/
  apps/desktop/            Application Tauri 2 : interface React (src/) et cœur Rust (src-tauri/)
  packages/design-system/  Jetons, composants et thèmes ZYNORA (TypeScript/CSS)
  packages/security/       Noms et chemins sûrs, détection de format, inspection des archives (Rust)
  packages/database/       Base locale SQLite : migrations, paramètres, journal, récents, favoris, corbeille (Rust)
  packages/file-manager/   Bibliothèque de documents : import validé, dossiers, corbeille, écriture atomique (Rust)
  packages/spreadsheet-engine/  Tableur adossé à IronCalc : formules, XLSX, CSV, styles, feuilles (Rust)
  tests/e2e/               Tests de bout en bout sur l'application compilée (WebDriver)
  scripts/                 Installation, contrôle des licences
```

Les paquets `document-engine`, `presentation-engine`, `export-engine`
et `ai-assistant` seront créés **au moment où ils auront du code réel** (voir
[ROADMAP.md](ROADMAP.md)). Aucun dossier vide n'est créé pour faire illusion.

## Documentation

| Document | Contenu |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture, choix des moteurs, décisions |
| [ROADMAP.md](ROADMAP.md) | Phases et critères de validation |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Fait, en cours, restant, erreurs connues, tests |
| [COMPATIBILITY.md](COMPATIBILITY.md) | Matrice de compatibilité des formats (mesurée, jamais supposée) |
| [SECURITY.md](SECURITY.md) | Modèle de menace et protections |
| [LICENSES.md](LICENSES.md) | Politique de licences et moteurs évalués |
| [TESTING.md](TESTING.md) | Stratégie et commandes de test |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Conventions de contribution |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |
| [docs/DESIGN.md](docs/DESIGN.md) | Identité visuelle, jetons, contrastes |

## Emplacement dans le dépôt

Ce dossier est hébergé provisoirement dans le dépôt de la plateforme ZENTECH, **totalement isolé** :
ses propres outils, sa propre CI (`.github/workflows/zynora-office.yml`, déclenchée uniquement par
les changements de `zynora-office/`), et il est exclu du lint et du typage de ZENTECH. Il peut être
déplacé tel quel dans un dépôt dédié (recommandé) sans modification.
