import { useState } from 'react';

import type { GraphicDocument } from '@/engine/documents';
import { exportDocument, type ExportResult, type ExportSettings } from '@/engine/renderer';
import { useRenderResources } from '@/features/rendering/RenderResourcesProvider';
import { saveExportToFolder, shareExport } from '@/services/export/exportFiles';

export type ExportDestination = 'share' | 'folder';

export type ExportOutcome = { ok: true; result: ExportResult; savedAs: string | null } | { ok: false; message: string } | { ok: null };

/** Laisse l'interface afficher « Export en cours… » avant le calcul (synchrone) du rendu. */
const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 16));

/** Rend, encode, puis partage ou enregistre l'image. */
export function useExport() {
  const resources = useRenderResources();
  const [busy, setBusy] = useState(false);

  /**
   * `ready` : fichier déjà calculé (estimation de la fenêtre « Exporter sous »)
   * pour ces mêmes réglages ; il est réutilisé tel quel.
   */
  const run = async (doc: GraphicDocument, settings: ExportSettings, destination: ExportDestination, ready?: ExportResult | null): Promise<ExportOutcome> => {
    setBusy(true);
    try {
      await nextFrame();
      const result = ready ?? exportDocument(doc, settings, resources);
      if (destination === 'share') {
        await shareExport(result);
        return { ok: true, result, savedAs: null };
      }
      const savedAs = await saveExportToFolder(result);
      return savedAs === null ? { ok: null } : { ok: true, result, savedAs };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : String(error) };
    } finally {
      setBusy(false);
    }
  };

  return { busy, run, resources };
}
