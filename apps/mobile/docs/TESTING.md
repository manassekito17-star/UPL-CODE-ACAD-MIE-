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
    simulée en remplaçant `useBreakpoint`).

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
- Les stores Zustand sont globaux : les réinitialiser dans `beforeEach`
  (`resetDocumentStore`, `resetEditorUiStore`).

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
