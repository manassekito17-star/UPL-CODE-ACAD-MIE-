# Tests et vérifications

Toutes les commandes se lancent depuis `apps/mobile/`.

| Commande | Vérifie |
|---|---|
| `npm run typecheck` | TypeScript strict (`strict`, `noUncheckedIndexedAccess`…) et routes typées |
| `npm run lint` | ESLint (préréglage Expo + frontières de l'architecture) |
| `npm test` | Tests Jest |
| `npm run verify` | Les trois précédentes |
| `npm run doctor` | `expo-doctor` : cohérence des versions et de la configuration |
| `npm run bundle:check` | Construction des bundles Hermes de production Android et iOS |

## Organisation

- `tests/unit/` : fonctions pures (thème, contrastes, classes de largeur),
  modèle de document (validation, limites mémoire, formats, orientation),
  stores Zustand, dates et identifiants.
- `tests/integration/` :
  - `navigation.test.tsx` rend les **vraies routes** de `src/app` avec
    `expo-router/testing-library` et vérifie les parcours.
  - `skia-headless.test.ts` dessine avec le vrai moteur Skia (CanvasKit, le
    code C++ de Skia compilé en WebAssembly), relit les pixels et encode un
    PNG. Ce test sert de socle aux tests du rendu (phase 3) et de l'export
    (phase 8).
  - `new-document.test.tsx` : formulaire (format par défaut, formats,
    orientation, erreurs, refus d'un document trop lourd, création).
  - `home-projects.test.tsx` : liste, ouverture, confirmation et suppression
    du seul projet visé.
  - `editor.test.tsx` : espace de travail sur petit et grand écran (largeur
    simulée en remplaçant `useBreakpoint`), outils, commandes de zoom et
    bornes du zoom (taille de la zone simulée par un événement `layout`).
  - `renderer.test.ts` : rendu du document avec le vrai Skia (pixels exacts
    par fond, damier absent de l'image, échelle, refus au-delà du budget
    mémoire, Picture identique au rendu direct, motif du damier).
- `tests/unit/layers.test.ts` : opérations sur les calques, erreurs,
  verrouillage, normalisation, matrice, test d'atteinte.
- `tests/integration/layers-panel.test.tsx` : panneaux Calques et
  Propriétés de bout en bout, suppression confirmée du seul calque visé
  (même si la sélection change pendant la confirmation), double validation
  évitée, sélection et déplacement appelés par le canvas.
- `tests/unit/phase5-engine.test.ts` : fabriques (texte, cercle, ligne,
  image), styles validés, poignées (coin opposé fixe même tourné,
  proportions, taille minimale, rotation aimantée, tolérance tactile).
- `tests/unit/imageImport.test.ts` : plan d'import (réduction, format) et
  import avec accès natifs simulés (original copié tel quel, nettoyage en
  cas d'échec).
- `tests/integration/insert-and-style.test.tsx` : insertions (menu, barre
  d'outils, image de la galerie simulée), couleurs, propriétés du texte.
- `tests/integration/renderer.test.ts` couvre aussi cercle, ligne, image
  (PNG généré pour le test) et texte avec la police Inter chargée depuis le
  fichier TTF.
- `tests/unit/viewport.test.ts` : géométrie de la vue (conversions,
  ajustement, zones recouvertes, zoom à point fixe, bornes, pan borné) et
  arbitrage des gestes.
- `tests/mocks/` : doublures de Skia et de Reanimated pour les tests
  d'interface (voir les commentaires en tête de fichier).

## Pièges connus

- React Native Testing Library 14 : `render` et `fireEvent.*` sont
  **asynchrones**. Un `fireEvent.press` sans `await` provoque des `act()` qui
  se chevauchent, et le rendu du test suivant est vide.
- Les modules publiés en ESM non compilé (`standard-navigation`, utilisé par
  Expo Router) doivent figurer dans `transformIgnorePatterns`.
- `renderRouter('src/app')` résout le chemin depuis le dossier courant : lancer
  Jest depuis `apps/mobile/` (c'est le cas avec `npm test`).
- Testing Library 14 a retiré `toHaveAccessibilityState` : utiliser
  `toBeExpanded`, `toBeChecked`, `toBeDisabled`, `toBeSelected`.
- `act()` est asynchrone lui aussi : toujours `await act(async () => …)`,
  sinon le rendu des tests suivants est vide.
- Ne pas espionner une méthode d'un store Zustand avec `jest.spyOn` : l'espion
  est recopié dans tous les états suivants et `mockRestore` ne le retire que
  du premier. S'abonner au store (`subscribe`) pour compter les modifications.
- Les stores Zustand sont globaux : les réinitialiser dans `beforeEach`
  (`resetDocumentStore`, `resetEditorUiStore`).
- Enregistrement (M3) : `tests/setup.ts` remplace le stockage par un
  stockage en mémoire vide à chaque test, coupe la sauvegarde automatique et
  démarre l'enregistrement avant le test (l'écran de chargement est donc
  déjà passé). `tests/integration/persistence.test.tsx` la réactive.
- `renderRouter` active les minuteurs simulés de Jest : un test qui attend
  la sauvegarde automatique doit repasser aux vrais (`jest.useRealTimers()`).
- La couche SQL est testée sur une vraie base SQLite avec sql.js
  (`tests/helpers/sqljs.ts`), derrière la même interface qu'expo-sqlite.

## Gestes

Les gestes tactiles réels (pincement à deux doigts, inertie, conflits avec le
système) ne sont pas simulables dans Jest. Leur logique est testée par les
fonctions pures ; leur câblage a été vérifié sur l'export web à la souris
(glisser : le document se déplace de la distance attendue ; double clic :
ajustement puis 100 %). Le pincement doit être essayé sur appareil.

## Vérification visuelle

Les captures se font sur l'export web (`npx expo export --platform web`)
avec Playwright, en 360 dp (petit téléphone), 412 dp et 1180 dp (tablette).
Elles ont révélé en phase 2 trois défauts que les tests ne voyaient pas
(unité « px » masquée, libellé tronqué, bouton de suppression peu visible).

## Ce que ces tests ne couvrent pas

Les tests Jest s'exécutent dans Node, avec des modules natifs simulés. Ils ne
remplacent pas l'essai sur appareil : rendu GPU réel, performances, gestes,
permissions. Ces points se vérifient sur un build de développement Android et
iOS (voir `BUILD_ANDROID.md` et `BUILD_IOS.md`), sur plusieurs gammes de
téléphones à partir de la phase 3.
