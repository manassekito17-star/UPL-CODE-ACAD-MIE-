# Dépendances

Toutes les versions ont été choisies par `npx expo install`, qui retient les
versions validées pour le SDK installé. Relevé du 26/11/2026.

## Environnement

| Outil | Version |
|---|---|
| Node.js | 22.23.5 (minimum requis par Expo 58 : 22.13) |
| npm | 10.9.9 |
| Expo SDK | 58 (`expo` 58.1.0) |
| React Native | 0.88.1 (Nouvelle architecture, Hermes) |
| React | 19.3.0 |
| TypeScript | 6.0.3, mode strict |

## Exécution

| Paquet | Version | Licence | Rôle |
|---|---|---|---|
| `expo` | ~58.1.0 | MIT | SDK, CLI, modules natifs |
| `react` / `react-native` | 19.3.0 / 0.88.1 | MIT | Interface |
| `expo-router` | ~58.0.33 | MIT | Navigation par fichiers (intègre React Navigation) |
| `react-native-screens` | ~4.30.1 | MIT | Écrans natifs de la pile |
| `react-native-safe-area-context` | ~5.11.1 | MIT | Zones sûres (encoches, barres système) |
| `expo-linking`, `expo-constants` | ~58.0.17, ~58.0.16 | MIT | Liens profonds, informations de l'application |
| `expo-status-bar`, `expo-system-ui` | ~58.0.5, ~58.0.7 | MIT | Barre d'état claire, fond système sombre (évite l'éclair blanc au lancement Android) |
| `@shopify/react-native-skia` | 2.14.0 | MIT | Moteur de rendu 2D GPU |
| `react-native-gesture-handler` | ~3.3.0 | MIT | Gestes tactiles natifs |
| `react-native-reanimated` + `react-native-worklets` | 4.7.1 + 0.13.0 | MIT | Animations et gestes sur le thread UI |
| `zustand` | ^5.1.0 | MIT | États partagés |
| `@expo/vector-icons` + `expo-font` + `expo-asset` | ^15.0.2 + ~58.0.12 + ~58.0.21 | MIT (glyphes Material Design Icons : Apache-2.0) | Icônes de l'interface (phase 2). `expo-asset` est requis par `expo-font` : sans lui, le bundle échoue. Seule la police MaterialCommunityIcons est incluse. |
| `expo-sqlite` | ~58.0.18 | MIT | Base locale des projets (module M3) |
| `expo-file-system` | ~58.0.15 | MIT | Fichiers des images importées (phase 5, M3) |
| `expo-image-picker` | ~58.0.10 | MIT | Import depuis la galerie (phase 5) |
| `expo-sharing` | ~58.0.24 | MIT | Feuille de partage du système pour les images exportées (M4). Partage sortant seulement : le plugin de réception n'est pas activé. |
| `expo-image-manipulator` | ~58.0.16 | MIT | Copie de travail des images importées (décodage natif, réduction, JPEG/PNG) |
| `@expo-google-fonts/inter` | ^0.4.2 | MIT (paquet), OFL-1.1 (police Inter) | Police embarquée des textes : rendu identique sur toutes les plateformes et à l'export. Seules les graisses 400 et 700 sont incluses (≈ 0,7 Mo). |
| `react-dom`, `react-native-web`, `@expo/metro-runtime` | 19.3.0, ^0.21.4, ~58.0.17 | MIT | Exigés par Expo Router ; captures d'écran de vérification |

`react-dom` doit rester à la même version que `react` (19.3.0). Sinon npm
installe la dernière version (19.3.1), qui exige `react@19.3.1`, et
l'installation échoue (`ERESOLVE`).

## Développement

| Paquet | Version | Licence | Rôle |
|---|---|---|---|
| `typescript` | ~6.0.3 | Apache-2.0 | Typage strict |
| `jest` + `jest-expo` | ~30.5.2 + ~58.0.16 | MIT | Tests (préréglage Expo) |
| `@testing-library/react-native` + `test-renderer` | 14.1.0 + ^1.3.1 | MIT | Tests d'interface |
| `@types/jest`, `@types/react`, `@types/node` | 30.0.0, ~19.3.0, ^22 | MIT | Types (`@types/node` : lecture des polices dans les tests de rendu ; aligné sur Node 22) |
| `eslint` + `eslint-config-expo` | ^9.39.5 + ~58.0.4 | MIT | Analyse statique |
| `sql.js` + `@types/sql.js` | 1.13.0 | MIT | Vraie base SQLite (WebAssembly) pour tester la couche de stockage sous Node |

## Audit de sécurité

`npm audit` signale 22 vulnérabilités **modérées**, toutes dans l'outillage de
développement (`glob` et `minimatch`, utilisés par Jest et par
`@expo/fingerprint` dans le CLI Expo). Elles ne sont pas incluses dans le
bundle de l'application. Le seul correctif automatique proposé
(`npm audit fix --force`) rétrograderait Expo en SDK 52 : il n'est pas
appliqué. À revoir à chaque mise à jour du SDK.

## Permissions natives (Android, générées par `expo prebuild`)

| Permission | Origine | Statut |
|---|---|---|
| `CAMERA`, `RECORD_AUDIO` | expo-image-picker | **Retirées** (`android.blockedPermissions`) : la V0.1 n'utilise pas l'appareil photo |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` (≤ Android 12) | expo-image-picker | Nécessaires à l'import sur les anciennes versions d'Android |
| `INTERNET` | React Native | Nécessaire au build de développement (Metro). L'application n'envoie aucune donnée. |
| `SYSTEM_ALERT_WINDOW`, `VIBRATE`, `ACCESS_LOCAL_NETWORK` | modèle React Native / outils de développement | À réexaminer pour la version de production (phase 9) |

iOS : seule la description d'accès aux photos est déclarée
(`photosPermission`) ; caméra et micro désactivés (`false`).
