# `src/engine` — moteur graphique

Cœur du logiciel. Code TypeScript **indépendant de l'interface** : aucun import
de `src/app`, `src/screens`, `src/components`, `src/stores`, `src/features` ni
d'`expo-router` (règle ESLint `no-restricted-imports`, voir `eslint.config.js`).

| Sous-module | Responsabilité | Phase |
|---|---|---|
| `documents/` | Modèle de document versionné (dimensions, fond, liste ordonnée de calques), validation des dimensions et des limites mémoire | 2–3 |
| `layers/` | Types de calques (image, texte, forme), propriétés communes, opérations pures (ajout, suppression, ordre, duplication) | 4 |
| `transformations/` | Matrices 2D, conversions coordonnées document ↔ écran, boîtes englobantes, tests d'atteinte | 3 |
| `renderer/` | Traduction du document en commandes Skia, cache des rendus, rendu hors écran pour l'export | 3, 8 |
| `canvas/` | Vue (zoom, déplacement, ajustement à l'écran) et arbitrage des gestes sélection / navigation | 3 |
| `history/` | Commandes réversibles (Undo/Redo) sans copie des données binaires | 6 |

Conçu pour accueillir ensuite masques, modes de fusion, pinceaux, filtres,
sélections, dégradés, réglages non destructifs, objets vectoriels et IA, sans
aplatir les calques.
