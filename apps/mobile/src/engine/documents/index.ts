export { createDocument, type CreateDocumentDeps } from './document';
export { BYTES_PER_PIXEL, DOCUMENT_LIMITS, estimateLayerBytes, formatBytes } from './limits';
export { orientationOf, withOrientation } from './orientation';
export { FIXED_PRESETS, SCREEN_PRESET_ID, screenPreset, type DocumentPreset } from './presets';
export {
  DOCUMENT_FORMAT_VERSION,
  type DocumentBackground,
  type DocumentSpec,
  type GraphicDocument,
  type Orientation,
} from './types';
export {
  DEFAULT_DOCUMENT_NAME,
  normalizeDocumentName,
  validateDocumentInput,
  type DocumentFormInput,
  type DocumentValidation,
  type ValidationField,
  type ValidationIssue,
} from './validation';
