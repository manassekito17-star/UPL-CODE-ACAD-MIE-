import { formatTime } from '@/utils/date';

import { usePersistenceStore } from './persistence';

export interface SaveStatusText {
  /** « Enregistré à 17:05 », « Enregistrement… », « Échec de l’enregistrement : … ». */
  text: string;
  /** Modifications pas encore écrites sur l'appareil. */
  unsaved: boolean;
  failed: boolean;
}

/** État d'enregistrement d'un document, en mots. */
export function useSaveStatus(documentId: string): SaveStatusText {
  const status = usePersistenceStore((s) => s.saves[documentId]);
  if (!status) return { text: 'Non enregistré', unsaved: true, failed: false };
  switch (status.state) {
    case 'saved':
      return { text: `Enregistré à ${formatTime(status.at)}`, unsaved: false, failed: false };
    case 'pending':
    case 'saving':
      return { text: 'Enregistrement…', unsaved: true, failed: false };
    case 'error':
      return { text: `Échec de l’enregistrement : ${status.message}`, unsaved: true, failed: true };
  }
}
