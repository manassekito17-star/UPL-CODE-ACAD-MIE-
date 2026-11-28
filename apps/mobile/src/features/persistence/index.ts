export { Autosaver, type SaveStatus } from './autosave';
export { PersistenceGate } from './PersistenceGate';
export {
  AUTOSAVE_CHOICES,
  configurePersistence,
  discardChanges,
  fileInfoOf,
  flushDrafts,
  isDirty,
  markSaved,
  openPackageFile,
  removeUnreadable,
  saveCopy,
  saveDocument,
  saveDocumentAs,
  setAutoSave,
  startPersistence,
  stopPersistence,
  usePersistenceStore,
  type FileInfo,
  type SaveResult,
  type SaveTarget,
} from './persistence';
export { useSaveStatus, type SaveStatusText } from './useSaveStatus';
