# Feuille de route — ZYNORA OFFICE

Règle : **une phase n'est commencée que lorsque la précédente est validée** (tests au vert sur les
trois systèmes, rapport dans PROJECT_STATUS.md). Un module n'est activé dans l'interface qu'une
fois réellement fonctionnel.

| Phase | Contenu | Critère de validation | État |
|---|---|---|---|
| **0. Fondations** | Monorepo, Tauri 2 + React + TS, design system, SQLite, sécurité des imports, CI 3 systèmes, documentation | Compilation + tests + e2e au vert ; CI Windows/macOS au vert | ✅ Linux validé · ⏳ CI Windows/macOS à confirmer |
| **1. Core** | Gestionnaire de fichiers (ouvrir/enregistrer via dialogues natifs, chemins validés), récents, favoris, dossiers, corbeille (jamais de suppression définitive sans confirmation), recherche, sauvegarde automatique, récupération après incident, notifications | Tests d'intégration fichiers ; test « coupure brutale → récupération » | À faire |
| **2. Sheets** | IronCalc, grille canvas virtualisée, barre de formules, références relatives/absolues, plusieurs feuilles, références inter-feuilles, mise en forme, bordures, fusion, tri, filtres, copier/coller, XLSX/ODS/CSV | Corpus de fichiers XLSX réels (Excel 2010→365, LibreOffice) : ouverture, modification, 3 cycles d'enregistrement ; fonctions comparées à des valeurs de référence | À faire |
| **3. Word** | ProseMirror, styles, polices, listes, tableaux, images, liens, pagination, marges, orientation, en-têtes/pieds, notes, table des matières, recherche/remplacement, correcteur, DOCX/ODT/TXT/PDF | Corpus DOCX réels ; aller-retour sans perte du contenu non pris en charge | À faire |
| **4. Slides** | Diapositives, thèmes, modèles, zones de texte, images, formes, tableaux, notes, réorganisation, plein écran, PPTX/PDF | Corpus PPTX réels | À faire |
| **5. Avancé** | Graphiques, commentaires, suivi des modifications, transitions/animations, publipostage, comparaison, tableaux croisés | Par fonction | À faire |
| **6. IA** | Assistant optionnel (local ou clé utilisateur), désactivable | Application intégralement utilisable sans IA ni réseau | À faire |
| **7. Synchronisation** | À définir (le cahier des charges ne précise pas la cible) | — | À cadrer |
| **8. Publication** | Signature Windows (Trusted Signing ou OV/EV), notarisation macOS, mises à jour signées (minisign), canaux stable/bêta | Tests d'installation et de mise à jour sur machines propres | À faire |
