# ZENTECH DESIGN

Studio graphique mobile professionnel pour **Android** et **iOS** : documents
multicalques, images, textes, formes, transformations tactiles, historique,
sauvegarde locale et export PNG. Gratuit, hors ligne, sans compte.

> Nom commercial : **ZENTECH DESIGN**. Nom technique du paquet : `studio-graphic`.
> L'identifiant d'application `app.studiographic.dev` reste provisoire (à fixer
> avant toute publication sur les stores).

**État : phases 1 à 5 terminées ; modules M1 et M2 livrés.** Documents,
canvas Skia (zoom, déplacement), calques (rectangle, cercle, ligne, texte
éditable, image importée), poignées tactiles (déplacer, redimensionner,
tourner), propriétés et couleurs. Sur tablette et grand écran : espace studio
(menus, barre d'options, outils par familles, règles, dock de panneaux, barre
d'état). Historique Annuler / Rétablir (50 états). Les projets ne sont pas
encore enregistrés sur l'appareil (M3).
Voir [docs/ROADMAP.md](docs/ROADMAP.md).

## Pile technique

Expo SDK 58 (Development Build) · React Native 0.88 · TypeScript strict ·
React Native Skia · Gesture Handler · Reanimated · Expo Router · Zustand ·
expo-sqlite · expo-file-system · expo-image-picker · Jest + Testing Library.
Détail des versions et licences : [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md).

## Démarrage rapide

Prérequis : Node.js ≥ 22.13 et npm.

```sh
cd apps/mobile
npm ci
npm run verify          # types + lint + tests
```

Lancer l'application : Skia, Reanimated et Gesture Handler sont des modules
natifs, il faut donc un **build de développement** (Expo Go ne convient pas
pour la validation).

```sh
npm run android         # = expo run:android (Android Studio / SDK requis)
npm run ios             # = expo run:ios (macOS + Xcode requis)
```

Une fois le build de développement installé sur l'appareil, il suffit ensuite de :

```sh
npx expo start --dev-client
```

Guides détaillés : [Android](docs/BUILD_ANDROID.md) · [iOS](docs/BUILD_IOS.md).

## Scripts

| Script | Rôle |
|---|---|
| `npm start` | Serveur Metro |
| `npm run android` / `npm run ios` | Compile et lance le build de développement |
| `npm run typecheck` | TypeScript strict |
| `npm run lint` | ESLint (frontières d'architecture incluses) |
| `npm test` | Tests Jest |
| `npm run verify` | typecheck + lint + tests |
| `npm run doctor` | `expo-doctor` |
| `npm run bundle:check` | Bundles de production Android et iOS |

## Documentation

- [Architecture et décisions techniques](docs/ARCHITECTURE.md)
- [Dépendances, licences, permissions](docs/DEPENDENCIES.md)
- [Tests](docs/TESTING.md)
- [Compilation Android](docs/BUILD_ANDROID.md) · [Compilation iOS](docs/BUILD_IOS.md)
- [Feuille de route](docs/ROADMAP.md) · [Journal des versions](CHANGELOG.md)

## Confidentialité

Aucun compte, aucune télémétrie, aucun envoi de photos. Les projets restent
sur l'appareil. Permissions minimales (photos uniquement ; caméra et micro
retirés).
