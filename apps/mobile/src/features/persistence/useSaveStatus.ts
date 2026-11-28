import { useDocumentStore } from '@/stores/documentStore';
import { formatTime } from '@/utils/date';

import { usePersistenceStore, type FileInfo } from './persistence';

export interface SaveStatusText {
  /** « Enregistré à 17:05 », « Modifications non enregistrées », « Jamais enregistré »… */
  text: string;
  /** Modifications pas encore enregistrées (ou document jamais enregistré). */
  unsaved: boolean;
  /** Jamais enregistré : « Enregistrer » ouvrira « Enregistrer sous ». */
  neverSaved: boolean;
  failed: boolean;
  file: FileInfo | null;
}

/** État d'enregistrement d'un document, en mots. */
export function useSaveStatus(documentId: string): SaveStatusText {
  const file = usePersistenceStore((s) => s.files[documentId] ?? null);
  const clean = usePersistenceStore((s) => s.clean[documentId]);
  const doc = useDocumentStore((s) => s.documents[documentId]);
  const savedOnce = !!file?.savedOnce;
  const dirty = !clean || clean !== doc;
  const where = file?.location ? ` · ${file.location.name}` : '';
  if (file?.status?.state === 'saving') return { text: 'Enregistrement…', unsaved: true, neverSaved: !savedOnce, failed: false, file };
  if (file?.status?.state === 'error') return { text: `Échec de l’enregistrement : ${file.status.message}`, unsaved: true, neverSaved: !savedOnce, failed: true, file };
  if (!savedOnce) return { text: file?.recovered ? 'Récupéré · jamais enregistré' : 'Jamais enregistré', unsaved: true, neverSaved: true, failed: false, file };
  if (dirty) return { text: file?.recovered ? 'Modifications récupérées non enregistrées' : 'Modifications non enregistrées', unsaved: true, neverSaved: false, failed: false, file };
  return { text: `Enregistré${file?.savedAt ? ` à ${formatTime(file.savedAt)}` : ''}${where}`, unsaved: false, neverSaved: false, failed: false, file };
}
