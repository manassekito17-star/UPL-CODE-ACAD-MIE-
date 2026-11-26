# Architecture

ZENTECH DESIGN, studio graphique mobile (nom technique `studio-graphic`).
Ce document décrit l'organisation du code et les règles qui la protègent.

## Vue d'ensemble

```
apps/mobile/
├── src/
│   ├── app/            Routes Expo Router (fichiers minces : une route = un écran)
│   ├── screens/        Écrans (composition de l'interface)
│   ├── components/     Composants réutilisables (ui/, brand/)
│   ├── engine/         Moteur graphique, indépendant de l'interface
│   │   ├── documents/  Modèle de document versionné, validation
│   │   ├── layers/     Calques et opérations pures
│   │   ├── transformations/  Matrices, coordonnées document ↔ écran
│   │   ├── renderer/   Rendu Skia (écran et hors écran), cache
│   │   ├── canvas/     Vue : zoom, déplacement, arbitrage des gestes
│   │   └── history/    Commandes réversibles (Undo/Redo)
│   ├── features/       Cas d'usage : projects, image-import, typography, shapes, export
│   ├── stores/         États partagés (Zustand)
│   ├── services/       Accès au système : SQLite, fichiers, galerie
│   ├── hooks/          Hooks React partagés
│   ├── theme/          Couleurs, espacements, typographie
│   ├── types/          Types transverses
│   └── utils/          Fonctions pures
├── tests/              unit/ et integration/ (Jest)
├── docs/               Documentation technique
└── assets/             Icônes et écran de démarrage
```

## Dépendances autorisées entre couches

```
app ──► screens ──► components ──► theme, utils, types
          │   └────► features ──► engine, services, stores
          └────────► stores ────► engine, services
engine ──► theme, utils, types, @shopify/react-native-skia
```

Règles appliquées par ESLint (`eslint.config.js`, règle `no-restricted-imports`) :

| Couche | Ne doit pas importer |
|---|---|
| `src/engine` | `app`, `screens`, `components`, `stores`, `features`, `expo-router` |
| `src/theme`, `src/utils`, `src/types` | toute couche applicative (y compris `engine`, `services`) |
| `src/services`, `src/stores` | `app`, `screens`, `components` |
| `src/components` | `app`, `screens` |
| `src/screens` | `app` |

Une violation fait échouer `npm run lint` (vérifié lors de la phase 1 avec un
fichier volontairement fautif).

## Navigation

Expo Router (routage par fichiers, solution recommandée par Expo SDK 58), pile
native (`Stack`) et thème sombre (`src/theme/navigationTheme.ts`).

| Route | Fichier | Écran |
|---|---|---|
| `/` | `src/app/index.tsx` | `HomeScreen` (en-tête masqué) |
| `/new-document` | `src/app/new-document.tsx` | `NewDocumentScreen` |
| `/editor/[projectId]` | `src/app/editor/[projectId].tsx` | `EditorScreen` |
| `/settings` | `src/app/settings.tsx` | `SettingsScreen` |
| toute autre adresse | `src/app/+not-found.tsx` | `NotFoundScreen` |

Les routes sont typées (`experiments.typedRoutes`) : un `router.push` vers une
route inexistante est une erreur TypeScript. Les types sont générés dans
`.expo/types/` par `expo start` ou `expo export`.

`GestureHandlerRootView` enveloppe toute l'application : il est requis par les
gestes du canvas (phase 3).

## Thème

- Palette imposée (fond `#101114`, secondaire `#191B20`, panneaux `#22252C`,
  accent `#3685FF`, textes `#FFFFFF` / `#A5AAB5`) dans `src/theme/colors.ts`.
- Jetons dérivés, choisis pour respecter WCAG 2.2 AA (contrôlé par
  `tests/unit/theme.test.ts`) :
  - `accentText` `#5C9DFF` : l'accent imposé n'atteint que 4,35:1 comme texte
    sur un panneau ; `#3685FF` reste utilisé pour la sélection, le focus et les
    remplissages (≥ 3:1 partout).
  - `accentSolid` `#1F68E0` : fond des boutons principaux. Le blanc sur
    `#3685FF` n'atteint que 3,5:1.
- Cibles tactiles d'au moins 48 dp (`touchTarget`).
- Classes de largeur (`useBreakpoint`) : `compact` < 600 ≤ `medium` < 900 ≤
  `expanded`, pour replier les panneaux sur petit écran.

## Documents (phase 2)

- `engine/documents` : modèle `GraphicDocument` versionné (`formatVersion`),
  validation de la saisie (`validateDocumentInput`), formats prédéfinis,
  orientation, estimation mémoire. Fonctions pures, testées sans rendu.
- Limites (`DOCUMENT_LIMITS`, **provisoires**, à mesurer en phase 9) :
  1 à 8192 px par côté, 16 777 216 px au plus (4096², 64 Mo par calque RGBA),
  avertissement au-delà de 8 388 608 px.
- Format « Écran » : fenêtre en pixels physiques (points × densité), en
  portrait, réduit proportionnellement s'il dépasse les limites.
- `stores/documentStore` : documents de la session, **en mémoire seulement**
  jusqu'à la phase 7. L'accueil et l'écran « Projet introuvable » le disent.
- Suppression : la boîte de confirmation mémorise le document complet et le
  nomme ; seule cette entrée est supprimée (testé avec trois projets).

## Espace de travail (phase 2)

| Largeur | Disposition |
|---|---|
| `compact` (< 600 dp) | Barre supérieure, zone de travail, barre inférieure (outils + boutons Calques / Propriétés). Un panneau à la fois, en feuille refermable. |
| `medium` / `expanded` | Outils à gauche, zone de travail, colonne de panneaux à droite (272 / 320 dp), chaque panneau repliable, colonne masquable depuis la barre supérieure. |

État d'affichage dans `stores/editorUiStore`, séparé du document.
Annuler, Rétablir, Exporter et les outils sont visibles mais désactivés, avec
la phase qui les livrera annoncée aux lecteurs d'écran.

## Moteur graphique (phase 3)

```
DocumentCanvas (engine/canvas)
 ├─ gestes : pincement, pan 2 doigts, pan 1 doigt (outil Vue), double tap
 │    └─ worklets sur le thread UI → valeurs partagées scale, x, y
 ├─ Skia <Canvas>
 │    └─ <Group transform = [x, y, scale]>     ← matrice lue sur le thread UI
 │         ├─ Picture « damier » (fond transparent seulement)
 │         ├─ Picture « document »              ← engine/renderer/drawDocument
 │         └─ bordure (épaisseur 1 / scale)
 └─ contrôleur (ajuster, zoomer, 100 %) appelé par les boutons de l'interface
```

- **Coordonnées** : `écran = document × scale + (x, y)` ; fonctions pures dans
  `engine/transformations/viewport.ts`, marquées `'worklet'` pour servir à la
  fois aux tests et aux gestes.
- **Cache** : le document est enregistré une fois dans une `SkPicture`,
  recalculée seulement quand son contenu change. Zoomer ou déplacer ne
  modifie que la matrice : aucun rendu React, aucun nouvel enregistrement.
- **Écran = export** : `drawDocument` est l'unique code de dessin, rejoué à
  l'écran (Picture) et sur une surface hors écran (`renderDocumentToImage`,
  futur export PNG). Le damier n'en fait pas partie.
- **Mémoire** : le rendu hors écran refuse toute surface au-delà de
  `DOCUMENT_LIMITS.maxPixels` et libère la surface aussitôt (`dispose`).
- **Arbitrage des gestes** (`engine/canvas/gestures.ts`) : deux doigts = vue,
  toujours ; un doigt = vue avec l'outil Vue, calque touché avec l'outil
  Sélection (phase 4), rien sinon. Un calque ne peut donc pas bouger pendant
  un zoom.
- **Web** : uniquement pour les captures de vérification ; Skia y passe par
  CanvasKit (`DocumentCanvasHost.web.tsx`, `npm run web:setup`).
- **Performances** : architecture prévue pour la fluidité (thread UI,
  Picture en cache), mais **non mesurée sur appareil**. Mesures prévues en
  phase 9.

## Fonctionnalités non encore développées

Elles sont affichées avec le composant `PlannedFeature` et le numéro de la
phase qui les livrera. `grep -rn PlannedFeature src/screens` liste ce qui
reste à faire. Aucun bouton ne prétend faire ce qu'il ne fait pas : par
exemple « Importer une image » est désactivé jusqu'à la phase 5 (vérifié par
un test).

## Décisions techniques

| Décision | Raison |
|---|---|
| Application dans `apps/mobile/`, paquet npm indépendant | Le dépôt héberge déjà le site Next.js ZENTECH ; les deux projets ne partagent ni dépendances ni configuration. La racine exclut `apps/` de son ESLint et de son TypeScript. |
| Expo SDK 58 avec Development Build | SDK stable (sortie le 29/09/2026). Skia, Reanimated et Gesture Handler sont natifs : la validation se fait sur un build de développement, pas dans Expo Go. |
| Expo Router | Recommandé par Expo, liens profonds et routes typées. React Navigation est intégré à `expo-router` 58 (aucune dépendance séparée). |
| Génération native continue (CNG) | `android/` et `ios/` sont générés par `expo prebuild` et ignorés par Git ; toute configuration native passe par `app.json` et les plugins. |
| `react-native-web` installé | Requis par Expo Router, et utile pour des captures d'écran automatisées de l'interface. Le web n'est pas une plateforme cible de la V0.1. |
| Thème indépendant d'Expo Router | `src/theme/index.ts` n'exporte que des valeurs pures ; le thème de navigation est importé séparément par la racine. Le moteur peut ainsi utiliser les couleurs sans tirer la navigation. |
