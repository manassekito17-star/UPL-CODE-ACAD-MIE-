/** Pas de fichiers d'images sur le web (l'import n'y est pas disponible). */
export const assetFiles = {
  directoryUri: (): string => 'web://assets/',
  list: (): string[] => [],
  remove: (_uris: readonly string[]): void => undefined,
};
