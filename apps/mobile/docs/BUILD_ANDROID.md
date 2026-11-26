# Compiler et lancer sur Android

Expo Go ne suffit pas : Skia, Reanimated et Gesture Handler exigent un
**build de développement**.

## Prérequis (relevés dans React Native 0.88 / Expo SDK 58)

| Élément | Version |
|---|---|
| JDK | 17 ou 21 (vérifié avec OpenJDK 21) |
| Android SDK Platform | 37 (`platforms;android-37.0`) |
| Build-Tools | 37.0.0 |
| NDK | 27.1.12297006 |
| CMake | 3.22.1 |
| Gradle | 9.4.1 (téléchargé par le wrapper) |
| minSdk / targetSdk | 24 / 36 |

Le plus simple : installer Android Studio, puis ces composants via le SDK Manager.
Définir `ANDROID_HOME` (ex. `~/Android/Sdk`).

## Lancer sur un émulateur ou un téléphone

```sh
cd apps/mobile
npm ci
npm run android         # = npx expo run:android : génère android/, compile, installe, lance Metro
```

Pour un téléphone : activer le débogage USB, le brancher, vérifier avec `adb devices`.

Ensuite, pour le développement courant :

```sh
npx expo start --dev-client
```

## Compiler sans lancer

```sh
cd apps/mobile
npx expo prebuild --platform android      # génère android/ (ignoré par Git)
cd android
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a
# APK : android/app/build/outputs/apk/debug/app-debug.apk
```

`-PreactNativeArchitectures=arm64-v8a` limite la compilation C++ à
l'architecture des téléphones récents (plus rapide). Sans cette option, les
quatre architectures sont compilées.

## Sans poste Android : EAS Build (service en ligne d'Expo)

```sh
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile development --platform android
```

## Mémoire

La compilation C++ (Skia, Reanimated, Worklets) consomme environ 2,5 Go par
fichier compilé en parallèle. Sur une machine de 16 Go, deux compilations CMake
simultanées ont provoqué l'arrêt de `clang++` par manque de mémoire. Remèdes :
`./gradlew --max-workers=1`, ou fermer les autres applications.

## État de la vérification (phase 1)

- `expo prebuild` : OK, projet Android généré.
- Bundle JavaScript Android de production : OK (`npm run bundle:check`).
- Compilation native `assembleDebug` (arm64-v8a) dans un conteneur Linux :
  **en cours au moment du commit initial**, résultat consigné dans le commit suivant.
- Exécution sur émulateur ou appareil : **non testée** (pas de virtualisation
  matérielle dans l'environnement de la phase 1). À faire sur votre poste.
