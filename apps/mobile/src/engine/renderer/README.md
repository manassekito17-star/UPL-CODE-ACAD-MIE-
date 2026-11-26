# `engine/renderer`
Rendu Skia du document (GPU à l'écran, surface hors écran pour l'export) et
cache. Doit produire le même résultat à l'écran et à l'export. — Phases 3 et 8.
Livré en phase 3 : `drawDocument` (code de dessin unique), `recordDocumentPicture` (cache), damier, `renderDocumentToImage` (hors écran, base de l'export).
