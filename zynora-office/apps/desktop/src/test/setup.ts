import { configure } from "@testing-library/react";

// Machines de CI chargées : les attentes asynchrones (findBy…, waitFor) disposent de 3 s au lieu de 1 s.
configure({ asyncUtilTimeout: 3000 });

// jsdom ne calcule pas de mise en page : ProseMirror (défilement vers la sélection) a besoin de
// ces mesures, qui valent zéro ici.
const emptyRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect;
const emptyRects = () => Object.assign([], { item: () => null }) as unknown as DOMRectList;
if (typeof Range !== "undefined") {
  Range.prototype.getClientRects ??= emptyRects;
  Range.prototype.getBoundingClientRect ??= emptyRect;
}
if (typeof Text !== "undefined") {
  (Text.prototype as unknown as { getClientRects: () => DOMRectList }).getClientRects ??= emptyRects;
}
document.elementFromPoint ??= () => null;
