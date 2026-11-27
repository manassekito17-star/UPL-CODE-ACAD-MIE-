/** Sur le web (aperçu), les miniatures sont gardées en données PNG dans le stockage du navigateur. */
const KEY = 'zentech-design/thumbnail/';

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export const thumbnailFiles = {
  uri: (id: string): string | null => storage()?.getItem(KEY + id) ?? null,
  async write(id: string, bytes: Uint8Array): Promise<void> {
    try {
      storage()?.setItem(KEY + id, `data:image/png;base64,${toBase64(bytes)}`);
    } catch {
      // Stockage plein : la vignette simple reste affichée.
    }
  },
  remove: (id: string): void => storage()?.removeItem(KEY + id),
  list(): string[] {
    const s = storage();
    if (!s) return [];
    return Array.from({ length: s.length }, (_, i) => s.key(i))
      .filter((k): k is string => !!k && k.startsWith(KEY))
      .map((k) => k.slice(KEY.length));
  },
};
