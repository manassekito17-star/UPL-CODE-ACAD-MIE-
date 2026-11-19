# Matrice de compatibilité — ZYNORA OFFICE

Légende : ✅ pris en charge et **testé** · 🟡 partiel (limites listées) · ❌ non pris en charge ·
🔒 refusé volontairement (sécurité). **Aucune case ne passe à ✅ sans test automatisé sur des
fichiers réels.**

## Formats — phase 1

« Importer » = contrôlé puis rangé dans la bibliothèque (✅ testé) ; l'**édition** reste à venir.

| Format | Importer | Ouvrir | Modifier | Enregistrer | Remarque |
|---|---|---|---|---|---|
| DOCX | ✅ | ❌ | ❌ | ❌ | Phase 3. Contrôles de sécurité du conteneur prêts (✅ testés) |
| ODT | ✅ | ❌ | ❌ | ❌ | Phase 3 |
| XLSX | ✅ | ❌ | ❌ | ❌ | Phase 2 |
| ODS | ✅ | ❌ | ❌ | ❌ | Phase 2 |
| CSV | ✅ | ❌ | ❌ | ❌ | Phase 2 |
| PPTX | ✅ | ❌ | ❌ | ❌ | Phase 4 |
| ODP | ✅ | ❌ | ❌ | ❌ | Phase 4 |
| PDF | ✅ | — | — | ❌ | Export prévu phases 2–4 |
| TXT | ✅ | ❌ | ❌ | ❌ | Phase 3 |
| DOCM, XLSM, PPTM | 🔒 | 🔒 | 🔒 | 🔒 | Formats à macros refusés |
| DOC, XLS, PPT (OLE) | ❌ | ❌ | ❌ | ❌ | Anciens formats binaires ; détectés et signalés |
| Office chiffré | ❌ | ❌ | ❌ | ❌ | Détecté (conteneur OLE) et signalé clairement |

## Plateformes — phase 1

| Plateforme | Compilation | Tests unitaires | Bout en bout | Installateur |
|---|---|---|---|---|
| Linux x86_64 (Ubuntu 24.04) | ✅ | ✅ | ✅ | ✅ DEB, RPM, AppImage (non signés) |
| Windows 10/11 x86_64 | ✅ CI | ✅ CI | ❌ (prévu) | ✅ MSI, EXE (non signés) |
| macOS (Apple Silicon) | ✅ CI | ✅ CI | ❌ (WebDriver non disponible pour WKWebView) | ✅ DMG (non signé) |

Résultats de la CI phase 0 (exécution n° 2). Ceux de la phase 1 sont suivis dans PROJECT_STATUS.md.

## Corpus de test prévu
`tests/fixtures/` recevra des fichiers réels produits par Microsoft Office 2010, 2016, 2019, 2021,
365, LibreOffice 7.x/24.x et Google Docs, avec leur provenance et leur licence. Chaque fichier sera
testé : ouverture, modification, 3 cycles d'enregistrement, réouverture par un outil tiers.
