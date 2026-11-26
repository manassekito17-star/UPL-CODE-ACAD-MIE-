// Configuration ESLint propre à l'application mobile (indépendante de celle du
// site Next.js à la racine du dépôt).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/** Interdit d'importer certains modules depuis une couche donnée. */
function forbid(files, groups, message) {
  return {
    files,
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: groups, message }] }],
    },
  };
}

const UI_LAYERS = ['@/app', '@/app/*', '@/screens', '@/screens/*', '@/components', '@/components/*'];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*', 'coverage/*', 'expo-env.d.ts'],
  },
  {
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ---- Frontières de l'architecture (voir docs/ARCHITECTURE.md) ----
  // Le moteur graphique ne connaît ni l'interface, ni la navigation, ni les stores.
  forbid(
    ['src/engine/**'],
    [...UI_LAYERS, '@/stores', '@/stores/*', '@/features', '@/features/*', 'expo-router', 'expo-router/*'],
    "Le moteur graphique (src/engine) doit rester indépendant de l'interface, des stores et des fonctionnalités.",
  ),
  // Thème, utilitaires et types sont des briques de base sans dépendance applicative.
  forbid(
    ['src/theme/**', 'src/utils/**', 'src/types/**'],
    [...UI_LAYERS, '@/stores', '@/stores/*', '@/features', '@/features/*', '@/engine', '@/engine/*', '@/services', '@/services/*'],
    'Les modules de base (theme, utils, types) ne doivent dépendre d’aucune couche applicative.',
  ),
  // Les services (stockage, fichiers) ne dépendent pas de l'interface.
  forbid(['src/services/**', 'src/stores/**'], UI_LAYERS, "Les services et les stores ne doivent pas importer l'interface."),
  // Les composants réutilisables ne connaissent pas les écrans ni les routes.
  forbid(['src/components/**'], ['@/app', '@/app/*', '@/screens', '@/screens/*'], 'Un composant réutilisable ne doit pas importer un écran ou une route.'),
  // Les écrans ne dépendent pas des fichiers de route.
  forbid(['src/screens/**'], ['@/app', '@/app/*'], 'Un écran ne doit pas importer un fichier de route.'),
]);
