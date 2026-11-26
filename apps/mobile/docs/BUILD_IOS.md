# Compiler et lancer sur iOS

Expo Go ne suffit pas : Skia, Reanimated et Gesture Handler exigent un
**build de développement**.

## Option A : sur un Mac (Xcode)

Prérequis : macOS, Xcode récent (avec iOS Simulator), CocoaPods, Node.js ≥ 22.13.

```sh
cd apps/mobile
npm ci
npx expo run:ios            # génère ios/, installe les pods, compile et lance le simulateur
npx expo run:ios --device   # sur un iPhone branché (compte Apple nécessaire pour signer)
```

Ensuite, pour le développement courant :

```sh
npx expo start --dev-client
```

## Option B : sans Mac (EAS Build, service en ligne d'Expo)

Nécessite un compte Expo (gratuit) et, pour un iPhone réel, un compte
développeur Apple.

```sh
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile development --platform ios
```

## État de la vérification (phase 1)

- Bundle JavaScript iOS de production construit avec succès
  (`npm run bundle:check`, bytecode Hermes).
- **Compilation native iOS non testée** : l'environnement de la phase 1 est
  un conteneur Linux, sans Xcode. À faire sur un Mac ou via EAS Build.
- Identifiant de bundle provisoire : `app.studiographic.dev` (à remplacer quand
  le nom commercial sera validé).
