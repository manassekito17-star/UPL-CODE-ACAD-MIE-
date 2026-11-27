// Configuration commune à tous les tests Jest.

// Skia est remplacé par une doublure légère dans les tests d'interface. Les
// tests du rendu réel redéclarent ce module avec le vrai Skia (CanvasKit) :
// leur jest.mock, exécuté après celui-ci, prend le dessus.
jest.mock('@shopify/react-native-skia', () => require('./mocks/skia'));

// Reanimated : doublure synchrone (voir tests/mocks/reanimated.ts).
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('./mocks/reanimated'));

// Ancrage des menus : la doublure native de Jest ne rappelle jamais
// measureInWindow ; on répond tout de suite avec une position nulle.
jest.mock('@/screens/editor/desktop/measure', () => ({
  ...jest.requireActual('@/screens/editor/desktop/measure'),
  measureAnchor: (_node: unknown, done: (a: { x: number; y: number; width: number; height: number }) => void) =>
    done({ x: 0, y: 0, width: 0, height: 0 }),
}));

// Enregistrement des projets (M3) : stockage en mémoire, sans SQLite natif ni
// fichiers. Chaque test démarre avec un appareil vide et l'enregistrement
// automatique coupé (tests/integration/persistence.test.tsx le teste à part).
jest.mock('@/services/projects/repository', () => {
  const memory = jest.requireActual('@/services/projects/memoryRepository');
  let repo = memory.createTextProjectRepository(memory.mapStorage());
  return {
    getProjectRepository: () => repo,
    __setRepository: (next: unknown) => {
      repo = next;
    },
    __reset: () => {
      repo = memory.createTextProjectRepository(memory.mapStorage());
    },
  };
});
jest.mock('@/services/projects/assetFiles', () => ({
  assetFiles: { directoryUri: () => 'file:///app/Documents/assets/', list: jest.fn(() => []), remove: jest.fn() },
}));

beforeEach(async () => {
  require('@/stores/workspaceStore').resetWorkspaceStore();
  const persistence = require('@/features/persistence/persistence');
  persistence.stopPersistence();
  persistence.configurePersistence({ autosaveDelayMs: null });
  jest.requireMock('@/services/projects/repository').__reset();
  await persistence.startPersistence();
});
jest.mock('@/services/projects/thumbnails', () => ({
  thumbnailFiles: { uri: jest.fn(() => null), write: jest.fn(async () => undefined), remove: jest.fn(), list: jest.fn(() => []) },
}));
jest.mock('@/services/export/exportFiles', () => ({
  exportTargets: { share: true, folder: true },
  shareExport: jest.fn(async () => undefined),
  saveExportToFolder: jest.fn(async (r: { fileName: string }) => r.fileName),
}));
