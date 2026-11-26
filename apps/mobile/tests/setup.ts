// Configuration commune à tous les tests Jest.

// Skia est remplacé par une doublure légère dans les tests d'interface. Les
// tests du rendu réel redéclarent ce module avec le vrai Skia (CanvasKit) :
// leur jest.mock, exécuté après celui-ci, prend le dessus.
jest.mock('@shopify/react-native-skia', () => require('./mocks/skia'));

// Reanimated : doublure synchrone (voir tests/mocks/reanimated.ts).
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('./mocks/reanimated'));
