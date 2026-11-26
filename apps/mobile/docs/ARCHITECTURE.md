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

## Espace de travail (phase 2, refondu au module M1)

| Écran | Disposition |
|---|---|
| Téléphone : `compact` (< 600 dp), ou hauteur < 520 dp (téléphone en paysage) | Barre supérieure, zone de travail, barre inférieure (outils + boutons Calques / Propriétés). Un panneau à la fois, en feuille refermable. |
| Tablette et grand écran : `medium` / `expanded` et hauteur ≥ 520 dp | **Espace studio** (`screens/editor/desktop/`), voir ci-dessous. |

La règle est dans `EditorScreen` (`STUDIO_MIN_HEIGHT`). État d'affichage du
téléphone dans `stores/editorUiStore`, séparé du document.

### Espace studio (M1)

```
┌ MenuBar ─ Fichier Édition Image Calque Texte Sélection Filtre Affichage Fenêtre Aide ┐
├ OptionsBar ─ contenu selon l'outil actif ────────────────────────────────────────────┤
│ ToolRail │ DocTabs (nom @ zoom (calque, RVB/8) *)            │ Dock                   │
│ 20       │ RulersFrame ┌───────────────────────────────┐     │  Couleur | Nuancier    │
│ familles │             │ DocumentCanvas (vue partagée) │     │  Propriétés | Ajust.   │
│ 51 outils│             └───────────────────────────────┘     │  Calques | Canaux | …  │
├──────────┴────────────────────────────────────────────────────┴────────────────────────┤
└ StatusBar ─ zoom, dimensions, mémoire, état d'enregistrement ──────────────────────────┘
```

- `theme/workspace.ts` : palette graphite (`ws`) et métriques denses
  (`wsMetrics`) ; contrastes vérifiés par `tests/unit/theme.test.ts`.
- `stores/workspaceStore.ts` : outil choisi par famille, couleurs de premier
  plan et d'arrière-plan, onglets, panneaux masqués, groupes repliés, règles,
  demandes de suppression / renommage venues des menus. Rien de cet état
  n'est dans le document.
- `screens/editor/toolFamilies.ts` : catalogue des 51 outils. Statut `ok`,
  `partial` (avec la limite écrite) ou `todo` (avec son module). Un outil
  `todo` n'a aucun comportement : la barre ouvre sa famille, où il est
  désactivé et affiche « Prévu · Mx ». Vérifié par `tests/unit/studio.test.ts`.
- `useMenus.ts` : chaque entrée de menu est une vraie action, désactivée
  quand elle est sans objet, ou « prévue » (désactivée, module affiché).
- `WorkspaceContext` : document, contrôleur et valeurs partagées de la vue.
  `DocumentCanvas` accepte une vue fournie par le parent (`view`), ce qui
  permet aux règles de suivre zoom et déplacement sur le thread UI sans
  rendu React.
- `measure.ts` : ancrage des menus (`measureInWindow`), isolé pour être
  remplacé dans les tests (la doublure native de Jest ne répond jamais).
- Les panneaux Ajustements, Canaux, Tracés et Historique sont en place mais
  n'affichent aucune donnée inventée : leurs entrées sont désactivées et
  nomment leur module (M9, M15, M12, M2).

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

## Calques (phase 4)

- **Modèle** (`engine/layers/types.ts`) : `(x, y)` coin supérieur gauche de la
  boîte non tournée, rotation en degrés (sens horaire) autour du centre,
  opacité 0–1. L'ordre d'affichage est l'index dans `document.layers`
  (0 = bas) : un champ séparé pourrait se désynchroniser.
- **Opérations pures** (`engine/layers/operations.ts`) : document → nouveau
  document ; les calques non modifiés sont partagés (pas de copie). Base des
  commandes réversibles de la phase 6. Les refus sont des `LayerError`
  typées, transformées en message par `documentStore.mutateDocument`.
- **Une seule géométrie** : `layerMatrix()` (matrice 3 × 3) sert à l'écran
  (prop `matrix` des groupes Skia), à l'export (`canvas.concat`) et, inversée,
  au test d'atteinte. Test « écran = export » pixel par pixel.
- **Rendu écran** : fond en Picture + un groupe par calque (contenu en
  Picture recalculée seulement si le contenu change, opacité par composition
  `saveLayer`). Déplacer ou tourner un calque ne réenregistre rien.
- **Glisser un calque** : décalage tenu dans des valeurs partagées (thread
  UI), appliqué au calque et à son contour ; au relâchement, décalage arrondi
  et enregistré, puis remis à zéro une fois la nouvelle position rendue
  (`useLayoutEffect`) pour éviter un retour visuel en arrière. À confirmer
  sur appareil.
- **Erreurs à l'utilisateur** : une action refusée affiche un message dans le
  panneau Calques ; une saisie refusée (nom, champ numérique) affiche l'erreur
  sous le champ concerné, une seule fois.

## Images, texte, formes et poignées (phase 5)

- **Types de calques** (`engine/layers/types.ts`) : `shape` (rectangle,
  ellipse, ligne), `text` (contenu, taille, couleur, alignement, gras, police
  Inter), `image` (référence à deux fichiers locaux : original intact et copie
  de travail). Une copie de calque image partage les fichiers : aucune donnée
  binaire n'est dupliquée.
- **Ressources de rendu** (`RenderResources`) : la police et les images
  décodées sont passées explicitement à `drawDocument`, jamais lues dans une
  variable globale. L'éditeur les charge une fois
  (`features/rendering/RenderResourcesProvider`, images décodées une seule
  fois, retirées du cache quand elles ne servent plus) ; l'export utilisera
  les mêmes.
- **Texte** : mis en page par Skia Paragraph dans la largeur du calque ; la
  hauteur du calque est recalculée (même opération, donc une seule étape
  d'historique) quand le texte, sa taille ou la largeur changent.
- **Import d'image** (`services/imageImport.ts`) : décision pure
  (`planImageImport`) + accès natifs injectables (`ImportDeps`), testés
  séparément. Fichiers dans `Documents/assets/` (réorganisés par projet en
  phase 7).
- **Poignées** (`engine/layers/geometry.ts`) : `hitHandle`,
  `resizeFromCorner`, `rotateFromPointer`, fonctions pures « worklet ». Le
  canvas tient une seule « manipulation » (mode, géométrie de départ,
  aperçu) sur le thread UI pour déplacer, redimensionner et tourner ; le
  contenu est étiré en aperçu (`layerMatrixForContent`) puis réenregistré au
  relâchement.
- **Tap ou glisser** : un tap échoue au-delà de 10 points de déplacement ;
  sans cette borne, relâcher un calque hors de sa boîte le désélectionnait.
- **Web** : CanvasKit est chargé une fois pour toute l'application
  (`components/SkiaGate.web.tsx`) ; Android et iOS n'attendent rien.
  L'import d'images n'est pas disponible sur le web (pas de système de
  fichiers) : ce n'est pas une plateforme cible.

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
