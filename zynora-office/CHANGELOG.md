# Journal des modifications

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) ; versions : SemVer.

## [Non publié]

### Ajouté — Phase 0 : fondations
- Espace de travail pnpm + Cargo, isolé dans `zynora-office/`.
- Application de bureau Tauri 2.12 + React 19 + TypeScript strict ; fenêtre sans permission système,
  CSP stricte.
- `packages/design-system` : jetons clair/sombre, composants accessibles (bouton, carte, badge,
  sélecteur segmenté au clavier, élément de navigation), emblème ZYNORA, thème suivant le système.
- `packages/database` : SQLite, migrations transactionnelles, paramètres typés, journal borné, refus
  d'une base plus récente.
- `packages/security` : noms de fichiers portables, chemins confinés (y compris liens symboliques),
  détection du format réel, inspection des archives (bombes, traversée, chemins absolus, DTD,
  doublons, macros).
- Interface : accueil, paramètres (thème, langue FR/EN), journal des opérations, raccourci `Ctrl+,`.
- Tests : 19 Rust, 16 JavaScript, 6 vérifications de bout en bout sur l'application compilée.
- Contrôle automatique des licences (446 dépendances).
- CI GitHub Actions : Linux (qualité, paquets DEB/RPM/AppImage, e2e), Windows (MSI, EXE), macOS (DMG).
- Documentation : architecture, feuille de route, sécurité, licences, compatibilité, tests, état.

### Corrigé
- Les entrées d'archive à chemin absolu (`/etc/…`, `C:/…`) étaient acceptées car la bibliothèque
  `zip` retire silencieusement le `/` initial ; elles sont désormais refusées (test ajouté).
