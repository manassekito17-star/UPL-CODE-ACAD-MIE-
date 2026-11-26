/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Le premier passage (cache de transformation vide, cas de la CI) peut dépasser 5 s.
  testTimeout: 15_000,
  roots: ['<rootDir>/tests'],
  setupFiles: ['react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Modules publiés sans compilation préalable : Jest doit les transformer.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|expo-router|@shopify/react-native-skia|react-native-reanimated|react-native-worklets|react-native-gesture-handler|standard-navigation|zustand)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Doublure de Reanimated (voir tests/mocks/reanimated.ts). Expo Router la
    // charge aussi via 'react-native-reanimated/mock'.
    '^react-native-reanimated/mock$': '<rootDir>/tests/mocks/reanimated.ts',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**'],
};
