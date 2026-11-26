# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versions selon [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Phase 1 — Initialisation

- Projet Expo SDK 58 / React Native 0.88 / TypeScript strict dans `apps/mobile/`.
- Navigation Expo Router : accueil, nouveau projet, éditeur, paramètres, écran introuvable.
- Thème sombre (palette imposée, jetons dérivés conformes WCAG 2.2 AA), composants de base.
- Architecture modulaire (`engine`, `features`, `stores`, `services`…) et frontières contrôlées par ESLint.
- Tests Jest : thème et contrastes, classes de largeur, navigation sur les vraies routes, rendu Skia hors écran et encodage PNG.
- Documentation : architecture, dépendances, tests, compilation Android et iOS.
