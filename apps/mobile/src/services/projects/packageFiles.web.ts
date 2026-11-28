/**
 * Sur le web (aperçu) : téléchargement à l'enregistrement, sélecteur de
 * fichier du navigateur à l'ouverture. Pas d'images importées.
 */
export const packageFiles = {
  readAsset(_uri: string): Uint8Array {
    throw new Error('Images non disponibles sur le web.');
  },
  writeAsset(_packagePath: string, bytes: Uint8Array): string {
    const blob = new Blob([bytes as BlobPart]);
    return URL.createObjectURL(blob);
  },
  async saveToFolder(fileName: string, bytes: Uint8Array): Promise<{ uri: string; name: string } | null> {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { uri: `download:${fileName}`, name: fileName };
  },
  async overwrite(uri: string, bytes: Uint8Array): Promise<void> {
    await packageFiles.saveToFolder(uri.replace(/^download:/, ''), bytes);
  },
  pick(): Promise<{ uri: string; name: string; bytes: Uint8Array } | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.zdesign';
      input.onchange = async () => {
        const f = input.files?.[0];
        if (!f) return resolve(null);
        resolve({ uri: `upload:${f.name}`, name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) });
      };
      input.click();
    });
  },
};
