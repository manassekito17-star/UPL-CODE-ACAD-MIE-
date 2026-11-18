# Matrice de compatibilité — ZYNORA OFFICE

Légende : ✅ pris en charge et **testé** · 🟡 partiel (limites listées) · ❌ non pris en charge ·
🔒 refusé volontairement (sécurité). **Aucune case ne passe à ✅ sans test automatisé sur des
fichiers réels.**

## Formats — phase 0

| Format | Ouvrir | Modifier | Enregistrer | Remarque |
|---|---|---|---|---|
| DOCX | ❌ | ❌ | ❌ | Phase 3. Contrôles de sécurité du conteneur prêts (✅ testés) |
| ODT | ❌ | ❌ | ❌ | Phase 3 |
| XLSX | ❌ | ❌ | ❌ | Phase 2 |
| ODS | ❌ | ❌ | ❌ | Phase 2 |
| CSV | ❌ | ❌ | ❌ | Phase 2 |
| PPTX | ❌ | ❌ | ❌ | Phase 4 |
| ODP | ❌ | ❌ | ❌ | Phase 4 |
| PDF | — | — | ❌ | Export prévu phases 2–4 |
| TXT | ❌ | ❌ | ❌ | Phase 3 |
| DOCM, XLSM, PPTM | 🔒 | 🔒 | 🔒 | Formats à macros refusés |
| DOC, XLS, PPT (OLE) | ❌ | ❌ | ❌ | Anciens formats binaires ; détectés et signalés |
| Office chiffré | ❌ | ❌ | ❌ | Détecté (conteneur OLE) et signalé clairement |

## Plateformes — phase 0

| Plateforme | Compilation | Tests unitaires | Bout en bout | Installateur |
|---|---|---|---|---|
| Linux x86_64 (Ubuntu 24.04) | ✅ | ✅ | ✅ | ✅ DEB, RPM, AppImage (non signés) |
| Windows 10/11 x86_64 | ⏳ CI | ⏳ CI | ❌ (prévu) | ⏳ MSI, EXE (non signés) |
| macOS (Apple Silicon) | ⏳ CI | ⏳ CI | ❌ (WebDriver non disponible pour WKWebView) | ⏳ DMG (non signé) |

⏳ = configuré dans la CI, résultat à confirmer au premier passage.

## Corpus de test prévu
`tests/fixtures/` recevra des fichiers réels produits par Microsoft Office 2010, 2016, 2019, 2021,
365, LibreOffice 7.x/24.x et Google Docs, avec leur provenance et leur licence. Chaque fichier sera
testé : ouverture, modification, 3 cycles d'enregistrement, réouverture par un outil tiers.
