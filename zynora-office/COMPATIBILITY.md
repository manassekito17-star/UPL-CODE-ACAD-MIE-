# Matrice de compatibilité — ZYNORA OFFICE

Légende : ✅ pris en charge et **testé** · 🟡 partiel (limites listées) · ❌ non pris en charge ·
🔒 refusé volontairement (sécurité). **Aucune case ne passe à ✅ sans test automatisé sur des
fichiers réels.**

## Formats — phase 2

« Importer » = contrôlé puis rangé dans la bibliothèque (✅ testé).

| Format | Importer | Ouvrir | Modifier | Enregistrer | Remarque |
|---|---|---|---|---|---|
| DOCX | ✅ | ❌ | ❌ | ❌ | Phase 3. Contrôles de sécurité du conteneur prêts (✅ testés) |
| ODT | ✅ | ❌ | ❌ | ❌ | Phase 3 |
| XLSX | ✅ | ✅ | ✅ | ✅ | ZYNORA Sheets. 3 cycles sans perte (tests) ; relu par LibreOffice et fichiers produits par LibreOffice ouverts (tests croisés). **Fichiers produits par Microsoft Excel : corpus à constituer** |
| ODS | ✅ | ❌ | ❌ | ❌ | Non pris en charge par le moteur IronCalc ; message explicite à l'ouverture |
| CSV | ✅ | ✅ | ✅ | 🟡 | Séparateur détecté (; , tabulation), UTF-8 ; enregistrement de la 1re feuille seulement, sans mise en forme ; formules venues du fichier importées comme texte |
| PPTX | ✅ | ❌ | ❌ | ❌ | Phase 4 |
| ODP | ✅ | ❌ | ❌ | ❌ | Phase 4 |
| PDF | ✅ | — | — | ❌ | Export prévu phases 2–4 |
| TXT | ✅ | ❌ | ❌ | ❌ | Phase 3 |
| DOCM, XLSM, PPTM | 🔒 | 🔒 | 🔒 | 🔒 | Formats à macros refusés |
| DOC, XLS, PPT (OLE) | ❌ | ❌ | ❌ | ❌ | Anciens formats binaires ; détectés et signalés |
| Office chiffré | ❌ | ❌ | ❌ | ❌ | Détecté (conteneur OLE) et signalé clairement |

## ZYNORA Sheets — fonctionnalités (phase 2)

| Fonction | État | Remarque |
|---|---|---|
| Formules et recalcul | ✅ | Moteur IronCalc ; fonctions en français (SOMME, MOYENNE, SI, NB.SI, SOMME.SI, RECHERCHEV, ET, OU…), valeurs de référence testées |
| Références relatives, absolues, entre feuilles | ✅ | Ajustées au copier-coller et à l'insertion de lignes |
| Erreurs (#DIV/0!, #NOM?, références circulaires) | ✅ | |
| Plusieurs feuilles (ajout, renommage, suppression) | ✅ | |
| Mise en forme : gras, italique, souligné, barré, couleurs, alignement | ✅ | |
| Formats de nombre (standard, nombre, %, €, date) | ✅ | |
| Fusion de cellules | 🟡 | Fusion enregistrée dans le fichier ; **affichage fusionné dans la grille à venir** |
| Insérer / supprimer lignes et colonnes | ✅ | |
| Copier, couper, coller (interne et autres applications) | ✅ | |
| Annuler / rétablir | ✅ | |
| Somme, moyenne, nombre de la sélection | ✅ | Calculés par le moteur |
| Sauvegarde automatique et récupération | ✅ | Copie toutes les 30 s hors du document, proposée au démarrage |
| Grandes feuilles | ✅ | 100 000 lignes de formules : 0,6 s ; recalcul 38 ms (prototype) |
| Hauteurs de ligne personnalisées | 🟡 | Conservées dans le fichier ; affichées à la hauteur standard |
| Bordures, tri, filtres, graphiques, mise en forme conditionnelle, tableaux croisés | ❌ | Suite de la phase 2 / phase 5 |
| Impression, export PDF | ❌ | Moteur PDF à choisir (ARCHITECTURE.md, D6) |

## Plateformes — phase 2

| Plateforme | Compilation | Tests unitaires | Bout en bout | Installateur |
|---|---|---|---|---|
| Linux x86_64 (Ubuntu 24.04) | ✅ | ✅ | ✅ | ✅ DEB, RPM, AppImage (non signés) |
| Windows 10/11 x86_64 | ✅ CI | ✅ CI | ❌ (prévu) | ✅ MSI, EXE (non signés) |
| macOS (Apple Silicon) | ✅ CI | ✅ CI | ❌ (WebDriver non disponible pour WKWebView) | ✅ DMG (non signé) |
| Android (arm64) | ✅ | (code partagé) | ❌ (à prévoir sur émulateur) | 🟡 APK de test (débogage) ; import depuis le stockage du téléphone à venir |
| iOS | ❌ | — | — | Nécessite un Mac avec Xcode et un compte Apple Developer |
| Téléphone (interface adaptative) | ✅ | ✅ | — | Vérifiée en émulation iPhone 13 (Playwright) |

Résultats détaillés et dates : PROJECT_STATUS.md.

## Corpus de test prévu
`tests/fixtures/` recevra des fichiers réels produits par Microsoft Office 2010, 2016, 2019, 2021,
365, LibreOffice 7.x/24.x et Google Docs, avec leur provenance et leur licence. Chaque fichier sera
testé : ouverture, modification, 3 cycles d'enregistrement, réouverture par un outil tiers.
