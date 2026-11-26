# `src/services` — accès au système

Stockage SQLite des métadonnées (`expo-sqlite`), fichiers locaux des
ressources (`expo-file-system`), sélection d'images (`expo-image-picker`).
Isolés derrière des interfaces pour être remplacés par des doublures en test.
Phases 5 et 7.

Livré en phase 5 : `imageImport.ts` (galerie, copie de l'original, copie de travail).
