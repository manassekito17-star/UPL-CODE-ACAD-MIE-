# Feuille de route — ZYNORA OFFICE

Règle : **une phase n'est commencée que lorsque la précédente est validée** (tests au vert sur les
trois systèmes, rapport dans PROJECT_STATUS.md). Un module n'est activé dans l'interface qu'une
fois réellement fonctionnel.

| Phase | Contenu | Critère de validation | État |
|---|---|---|---|
| **0. Fondations** | Monorepo, Tauri 2 + React + TS, design system, SQLite, sécurité des imports, CI 3 systèmes, documentation | Compilation + tests + e2e au vert ; CI Windows/macOS au vert | ✅ Linux · Windows · macOS |
| **1. Core** | Bibliothèque (dialogues natifs, chemins validés), import validé, récents, favoris, dossiers, renommage, corbeille (jamais de suppression définitive sans confirmation), recherche, écriture atomique, détection d'arrêt brutal, notifications | Tests Rust sur disque réel ; e2e « arrêt brutal → avertissement, bibliothèque intacte » | ✅ Linux · Windows · macOS |
| **2. Sheets** | ✅ Prototype IronCalc validé · ✅ moteur intégré · ✅ interface de tableur (ruban, barre de formule, grille, feuilles, barre d'état) · ✅ formules, références, styles, formats, copier-coller, annuler · ✅ XLSX, CSV · ✅ sauvegarde automatique et récupération — **reste** : affichage des fusions, bordures, tri, filtres, graphiques, impression/PDF, corpus Excel réel, réconciliation de la corbeille | Corpus de fichiers XLSX réels (Excel 2010→365, LibreOffice) : ouverture, modification, 3 cycles d'enregistrement ; fonctions comparées à des valeurs de référence | 🟡 Cœur livré (Linux) · CI à confirmer |
| **2 bis. Smartphone** | Interface adaptative, Tauri mobile Android (APK), iOS | APK installable ; tests sur émulateur ; iOS compilé sur Mac | 🟡 Interface adaptative ✅ · Android en cours · iOS à faire (Mac + compte Apple) |
| **3. Word** | ✅ moteur DOCX/TXT (docx-rs) avec détection des pertes · ✅ éditeur ProseMirror, page aux dimensions du document · ✅ ruban (Accueil, Insertion, Mise en page, Révision, Affichage) : styles, polices, listes, tableaux, liens, marges, orientation, taille, recherche/remplacement, correcteur du système, impression · ✅ sauvegarde automatique et récupération · ✅ images (lecture, insertion, taille, écriture) — **reste** : pagination automatique, en-têtes/pieds, notes, table des matières, cellules fusionnées, ODT, export PDF, corpus Microsoft Word | Corpus DOCX réels ; aucune perte silencieuse (copie imposée sinon) | 🟡 Première version livrée (Linux) · CI à confirmer |
| **4. Slides** | Diapositives, thèmes, modèles, zones de texte, images, formes, tableaux, notes, réorganisation, plein écran, PPTX/PDF | Corpus PPTX réels | À faire |
| **5. Avancé** | Graphiques, commentaires, suivi des modifications, transitions/animations, publipostage, comparaison, tableaux croisés | Par fonction | À faire |
| **6. IA** | Assistant optionnel (local ou clé utilisateur), désactivable | Application intégralement utilisable sans IA ni réseau | À faire |
| **7. Synchronisation** | À définir (le cahier des charges ne précise pas la cible) | — | À cadrer |
| **8. Publication** | Signature Windows (Trusted Signing ou OV/EV), notarisation macOS, mises à jour signées (minisign), canaux stable/bêta | Tests d'installation et de mise à jour sur machines propres | À faire |
