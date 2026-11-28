export { DEFAULT_RESOLUTION, backgroundColorOf, createDocument, type CreateDocumentDeps } from './document';
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
  RESOLUTION_LIMITS,
  normalizeDocumentName,
  validateDocumentInput,
  type DocumentFormInput,
  type DocumentValidation,
  type ValidationField,
  type ValidationIssue,
} from './validation';
export { PRESET_CATALOG, PRESET_CATEGORIES, presetFits, presetPixels, type PresetCategory, type SizePreset } from './presetCatalog';
export {
  LENGTH_UNIT_LABELS,
  RESOLUTION_UNIT_LABELS,
  formatNumber,
  fromPixels,
  fromPpi,
  parsePositive,
  toPixels,
  toPpi,
  type LengthUnit,
  type ResolutionUnit,
} from './units';
