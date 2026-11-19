# État du projet — ZYNORA OFFICE

_Mise à jour : 19/11/2026 — phase 1 (ZYNORA Core) terminée et validée sur Linux, Windows et macOS._

## Terminé (et testé)

### Phase 0 — Fondations
- Monorepo pnpm + Cargo isolé dans `zynora-office/`, exclu du lint et du typage de ZENTECH.
- Application Tauri 2 + React + TypeScript strict, fenêtre sans aucune permission système.
- Design system ZYNORA (thèmes clair/sombre/système, contrastes AA calculés), FR/EN.
- Base SQLite à migrations, journal des opérations sensibles, briques de sécurité des imports.
- CI Linux / Windows / macOS **au vert sur les trois systèmes** (exécution n° 2, après la correction
  d'un test de chemins qui échouait sous Windows : voir « Erreurs corrigées »). Installateurs
  produits : DEB, RPM, AppImage, MSI, EXE, DMG (non signés).

### Phase 1 — ZYNORA Core
- **Bibliothèque de documents** (`packages/file-manager`) : dossier par défaut `Documents/ZYNORA`,
  modifiable par le dialogue natif ; parcours des dossiers, fil d'Ariane.
- **Import validé** : dialogue natif ouvert par le cœur Rust ; copie dans un fichier temporaire,
  contrôles de sécurité **sur la copie**, apparition atomique sous un nom libre (« nom (2) ») ;
  refus détaillé (macros, contenu déguisé, DTD XML, archive piégée, type non pris en charge).
- **Dossiers** : création ; **renommage** sans écrasement ni changement d'extension.
- **Corbeille interne** : rien n'est supprimé directement ; annulation immédiate depuis la
  notification ; restauration (dossier d'origine recréé si besoin, nom libre en cas de conflit) ;
  suppression définitive et « Vider la corbeille » uniquement après confirmation.
- **Favoris** et **documents récents** (base locale, migration v1 → v2 testée sans perte).
- **Recherche** dans toute la bibliothèque, insensible à la casse et aux accents, bornée.
- **Écriture atomique** (`write_atomic`) prête pour l'enregistrement des documents.
- **Détection d'arrêt brutal** (verrou de session) et avertissement au démarrage.
- **Démarrage dégradé** : si la base locale est inutilisable, l'application s'ouvre et affiche
  l'erreur au lieu de se fermer (limite connue de la phase 0, résolue).
- **Notifications** et **fenêtres modales** accessibles dans le design system.

## En cours
- Rien : la phase 1 est validée sur les trois systèmes. En attente du feu vert pour la phase 2.

## Restant
Voir [ROADMAP.md](ROADMAP.md). Prochaine phase : **Sheets (phase 2)**.

Reporté explicitement de la phase 1 à la phase 2 : **sauvegarde automatique et points de
récupération du contenu des documents**. Ils dépendent d'un éditeur qui produit ce contenu ;
l'infrastructure nécessaire (écriture atomique, détection d'incident, base locale) est en place.

## Erreurs corrigées pendant ces phases
- Entrées d'archive à chemin absolu acceptées (bibliothèque `zip`) → refusées (phase 0).
- `resolve_within` : le confinement n'était vérifié qu'après l'existence. Sous Windows, un chemin
  relatif au lecteur était refusé « par hasard » ; partout, l'écriture à travers un **lien
  symbolique cassé** pointant hors du dossier autorisé était possible → corrigé, testé.
- Interface : le champ de renommage prenait le focus avant d'être rempli (présélection perdue) → corrigé, testé.
- CI phase 1 (exécution n° 4) : Windows et macOS au vert, Linux en échec au lint : la CI utilisait
  une version de Rust plus récente que le poste local, qui signale un import de test inutilisé.
  Import corrigé, et **version de Rust figée** (`rust-toolchain.toml`, 1.97.0) en local comme en CI.

## Erreurs et limites connues
- Aucun éditeur disponible : les documents sont gérés (classer, renommer, importer…) mais pas
  encore ouverts. L'interface l'indique (« l'édition arrive en phase N »).
- Si l'application est arrêtée entre le déplacement d'un élément vers la corbeille et son
  inscription en base, l'élément reste dans `.zynora/corbeille` sans apparaître dans la liste
  (aucune perte, mais restauration manuelle). Réconciliation prévue en phase 2.
- Les dialogues natifs ne sont pas pilotables par WebDriver : l'import par dialogue est couvert
  par les tests Rust (logique d'import) et les tests d'interface, pas par l'e2e.
- Installateurs non signés (SmartScreen / Gatekeeper). Pas d'e2e sur macOS (pas de WebDriver WKWebView).
- Emplacement provisoire dans le dépôt ZENTECH ; licence de ZYNORA non choisie.

## Tests

| Suite | Résultat (Linux, 19/11/2026) |
|---|---|
| Rust `zynora-security` | ✅ 13 / 13 |
| Rust `zynora-database` | ✅ 12 / 12 |
| Rust `zynora-file-manager` | ✅ 12 / 12 |
| Rust `zynora-desktop` | ✅ 1 / 1 |
| Vitest design system | ✅ 11 / 11 |
| Vitest application | ✅ 19 / 19 |
| node:test scripts | ✅ 2 / 2 |
| TypeScript strict, `cargo fmt`, `clippy -D warnings` | ✅ |
| Licences | ✅ 450 / 450 |
| `pnpm audit` (production) | ✅ aucune vulnérabilité connue |
| Bout en bout (binaire compilé, vrai disque) | ✅ 15 / 15 vérifications |
| CI phase 0 (exécution n° 2) | ✅ Linux · ✅ Windows · ✅ macOS |
| CI phase 1 (exécution n° 5) | ✅ Linux (dont bout en bout) · ✅ Windows · ✅ macOS — installateurs DEB, RPM, AppImage, MSI, EXE, DMG produits |

**Tests échoués actuellement : aucun en local.**

## Décisions prises par défaut (modifiables)
1. Emplacement : dossier isolé du dépôt actuel (dépôt dédié recommandé).
2. ONLYOFFICE écarté (AGPL + logo obligatoire) ; IronCalc retenu pour Sheets.
3. Ordre : Sheets (phase 2) avant Word (phase 3).
4. Corbeille **interne à la bibliothèque** (et non celle du système) : identique sur les trois
   systèmes, consultable et restaurable depuis ZYNORA, testable.
5. Licence de ZYNORA OFFICE : non choisie.

## Prochaine tâche
**Phase 2 — ZYNORA Sheets**, en commençant par le prototype de validation d'IronCalc
(ARCHITECTURE.md, D3) : fidélité XLSX sur un corpus réel, couverture des fonctions usuelles
(SOMME, MOYENNE, SI, RECHERCHEV…), recalcul de 100 000 cellules, licences des dépendances.
Si le prototype échoue, une architecture alternative sera proposée avant toute intégration.
