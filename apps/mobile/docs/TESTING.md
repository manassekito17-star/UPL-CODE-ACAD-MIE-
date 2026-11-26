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

- `tests/unit/` : fonctions pures (thème, contrastes, classes de largeur).
- `tests/integration/` :
  - `navigation.test.tsx` rend les **vraies routes** de `src/app` avec
    `expo-router/testing-library` et vérifie les parcours.
  - `skia-headless.test.ts` dessine avec le vrai moteur Skia (CanvasKit, le
    code C++ de Skia compilé en WebAssembly), relit les pixels et encode un
    PNG. Ce test sert de socle aux tests du rendu (phase 3) et de l'export
    (phase 8).

## Pièges connus

- React Native Testing Library 14 : `render` et `fireEvent.*` sont
  **asynchrones**. Un `fireEvent.press` sans `await` provoque des `act()` qui
  se chevauchent, et le rendu du test suivant est vide.
- Les modules publiés en ESM non compilé (`standard-navigation`, utilisé par
  Expo Router) doivent figurer dans `transformIgnorePatterns`.
- `renderRouter('src/app')` résout le chemin depuis le dossier courant : lancer
  Jest depuis `apps/mobile/` (c'est le cas avec `npm test`).

## Ce que ces tests ne couvrent pas

Les tests Jest s'exécutent dans Node, avec des modules natifs simulés. Ils ne
remplacent pas l'essai sur appareil : rendu GPU réel, performances, gestes,
permissions. Ces points se vérifient sur un build de développement Android et
iOS (voir `BUILD_ANDROID.md` et `BUILD_IOS.md`), sur plusieurs gammes de
téléphones à partir de la phase 3.
