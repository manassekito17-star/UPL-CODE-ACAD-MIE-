import type { ExportResult } from '@/engine/renderer';

/** Sur le web (aperçu), l'image est téléchargée par le navigateur. */
export const exportTargets = { share: true, folder: false } as const;

export async function shareExport(result: ExportResult): Promise<void> {
  const blob = new Blob([result.bytes as BlobPart], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function saveExportToFolder(_result: ExportResult): Promise<string | null> {
  throw new Error('Non disponible sur le web.');
}
