# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versions selon [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Phase 2 — Interface

- Nom commercial : **ZENTECH DESIGN** (nom affiché, logo, paramètres, autorisation photos). Slug Expo `zentech-design`, schéma de liens `zentechdesign://`.

- Création de document : formats prédéfinis (écran de l'appareil, carré, story, Full HD, 4K, A4 300 dpi), largeur et hauteur libres, orientation (inversion automatique), fond blanc, noir ou transparent, nom, aperçu et mémoire estimée.
- Protection mémoire : 1 à 8192 px par côté, 16,7 Mpx au plus (64 Mo par calque), avertissement au-delà de 8,4 Mpx. Valeurs provisoires, à mesurer en phase 9.
- Modèle de document versionné (`engine/documents`) et store de session (Zustand).
- Accueil : projets récents (vignette, dimensions, fond, date), ouverture, suppression avec confirmation nommant le projet.
- Espace de travail : barre supérieure, zone de travail, barre d'outils, panneaux Calques et Propriétés ; colonne repliable sur grand écran, feuille sur téléphone ; projet introuvable signalé.
- Composants : icônes, bouton-icône, champ de saisie, sélecteur segmenté, puce, boîte de confirmation, panneau repliable, aperçu de fond.
- Accessibilité : nouveau rouge `dangerSolid` pour les boutons destructifs (contrastes testés).
- Ajout de `@expo/vector-icons`, `expo-font`, `expo-asset`.

### Phase 1 — Initialisation

- Projet Expo SDK 58 / React Native 0.88 / TypeScript strict dans `apps/mobile/`.
- Navigation Expo Router : accueil, nouveau projet, éditeur, paramètres, écran introuvable.
- Thème sombre (palette imposée, jetons dérivés conformes WCAG 2.2 AA), composants de base.
- Architecture modulaire (`engine`, `features`, `stores`, `services`…) et frontières contrôlées par ESLint.
- Tests Jest : thème et contrastes, classes de largeur, navigation sur les vraies routes, rendu Skia hors écran et encodage PNG.
- Documentation : architecture, dépendances, tests, compilation Android et iOS.
