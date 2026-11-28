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
jest.mock('@/components/workspace/measure', () => ({
  ...jest.requireActual('@/components/workspace/measure'),
  measureAnchor: (_node: unknown, done: (a: { x: number; y: number; width: number; height: number }) => void) =>
    done({ x: 0, y: 0, width: 0, height: 0 }),
}));

// Enregistrement des projets (M3) : stockage en mémoire, sans SQLite natif ni
// fichiers. Chaque test démarre avec un appareil vide et l'enregistrement
// automatique coupé (tests/integration/persistence.test.tsx le teste à part).
jest.mock('@/services/projects/repository', () => {
  const memory = jest.requireActual('@/services/projects/memoryRepository');
  let repo = memory.createTextProjectRepository(memory.mapStorage());
  let settings = memory.createTextSettingsRepository(memory.mapStorage());
  return {
    getProjectRepository: () => repo,
    getSettingsRepository: () => settings,
    __setRepository: (next: unknown) => {
      repo = next;
    },
    __reset: () => {
      repo = memory.createTextProjectRepository(memory.mapStorage());
      settings = memory.createTextSettingsRepository(memory.mapStorage());
    },
  };
});
jest.mock('@/services/projects/assetFiles', () => ({
  assetFiles: { directoryUri: () => 'file:///app/Documents/assets/', list: jest.fn(() => []), remove: jest.fn() },
}));

beforeEach(async () => {
  require('@/features/workspace/workspacePersistence').resetWorkspacePersistence();
  require('@/stores/workspaceStore').resetWorkspaceStore();
  require('@/features/files/fileCommands').resetFileDialogs();
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
// Fichiers « .zdesign » : un dossier simulé en mémoire.
jest.mock('@/services/projects/packageFiles', () => {
  const folder = new Map<string, Uint8Array>();
  const assets = new Map<string, Uint8Array>();
  let nextPick: string | null = null;
  return {
    packageFiles: {
      readAsset: (uri: string) => assets.get(uri) ?? new Uint8Array([1]),
      writeAsset: (path: string, bytes: Uint8Array) => {
        const uri = `file:///app/Documents/assets/opened_${assets.size}_${path.slice(7)}`;
        assets.set(uri, bytes);
        return uri;
      },
      saveToFolder: jest.fn(async (name: string, bytes: Uint8Array) => {
        const uri = `content://dossier/${encodeURIComponent(name)}`;
        folder.set(uri, bytes);
        return { uri, name };
      }),
      overwrite: jest.fn(async (uri: string, bytes: Uint8Array) => {
        folder.set(uri, bytes);
      }),
      pick: jest.fn(async () => (nextPick && folder.has(nextPick) ? { uri: nextPick, name: decodeURIComponent(nextPick.split('/').pop() ?? ''), bytes: folder.get(nextPick) } : null)),
    },
    __folder: folder,
    __assets: assets,
    __setNextPick: (uri: string | null) => {
      nextPick = uri;
    },
  };
});
