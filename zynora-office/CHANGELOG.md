# Journal des modifications

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) ; versions : SemVer.

## [Non publié]

### Ajouté — Phase 1 : ZYNORA Core
- `packages/file-manager` : bibliothèque de documents (liste, recherche sans accents, dossiers,
  renommage sans écrasement, import validé sur copie avec apparition atomique, corbeille interne
  avec restauration et suppression définitive, écriture atomique).
- Base locale, migration v2 : bibliothèque choisie, documents récents, favoris, corbeille.
- Dialogues natifs (choix de dossier, import) ouverts par le cœur Rust (`tauri-plugin-dialog`) ;
  l'interface ne reçoit toujours aucune permission.
- Interface : tableau de bord (récents, favoris, import), vue Documents (fil d'Ariane, recherche,
  favoris, renommage, corbeille avec annulation), vue Corbeille (restauration, suppression
  définitive confirmée), choix de la bibliothèque dans les paramètres.
- Design system : `Dialog` (focus confiné, Échap), `TextField`, `IconButton`, notifications,
  bouton `danger`, jetons `--z-on-danger` et `--z-favorite`.
- Détection d'un arrêt brutal de la session précédente ; démarrage dégradé si la base est
  inutilisable (l'erreur s'affiche au lieu de fermer l'application).
- Tests : 38 Rust, 32 JavaScript, 15 vérifications de bout en bout sur le vrai disque.

### Corrigé — Phase 1
- Confinement des chemins vérifié avant leur existence : correction de l'échec de la CI Windows
  et de l'écriture possible à travers un lien symbolique cassé.
- Fenêtre de renommage : le nom est présélectionné (sans l'extension) dès l'ouverture.
- Version de Rust figée (`rust-toolchain.toml`, CI alignée) : le lint ne dépend plus de la
  version installée sur la machine.

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

### Corrigé — Phase 0
- Les entrées d'archive à chemin absolu (`/etc/…`, `C:/…`) étaient acceptées car la bibliothèque
  `zip` retire silencieusement le `/` initial ; elles sont désormais refusées (test ajouté).
