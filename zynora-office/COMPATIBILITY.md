# Matrice de compatibilité — ZYNORA OFFICE

Légende : ✅ pris en charge et **testé** · 🟡 partiel (limites listées) · ❌ non pris en charge ·
🔒 refusé volontairement (sécurité). **Aucune case ne passe à ✅ sans test automatisé sur des
fichiers réels.**

## Formats — phases 2 et 3

« Importer » = contrôlé puis rangé dans la bibliothèque (✅ testé).

| Format | Importer | Ouvrir | Modifier | Enregistrer | Remarque |
|---|---|---|---|---|---|
| DOCX | ✅ | ✅ | ✅ | 🟡 | ZYNORA Word. Aller-retour sans perte de tout ce que le modèle couvre (tests) ; relu par LibreOffice et fichiers produits par LibreOffice ouverts (tests croisés). Un document contenant des éléments non pris en charge (voir ci-dessous) **n'est jamais remplacé** : copie obligatoire. **Fichiers produits par Microsoft Word : corpus à constituer** |
| ODT | ✅ | ❌ | ❌ | ❌ | Non pris en charge par docx-rs ; message explicite à l'ouverture (convertir en DOCX) |
| XLSX | ✅ | ✅ | ✅ | ✅ | ZYNORA Sheets. 3 cycles sans perte (tests) ; relu par LibreOffice et fichiers produits par LibreOffice ouverts (tests croisés). **Fichiers produits par Microsoft Excel : corpus à constituer** |
| ODS | ✅ | ❌ | ❌ | ❌ | Non pris en charge par le moteur IronCalc ; message explicite à l'ouverture |
| CSV | ✅ | ✅ | ✅ | 🟡 | Séparateur détecté (; , tabulation), UTF-8 ; enregistrement de la 1re feuille seulement, sans mise en forme ; formules venues du fichier importées comme texte |
| PPTX | ✅ | ❌ | ❌ | ❌ | Phase 4 |
| ODP | ✅ | ❌ | ❌ | ❌ | Phase 4 |
| PDF | ✅ | — | — | ❌ | Export prévu phases 2–4 |
| TXT | ✅ | ✅ | ✅ | ✅ | UTF-8 (BOM accepté) ; un paragraphe par ligne ; la mise en forme n'est pas enregistrée dans un .txt (avertissement affiché) ; export d'un DOCX en .txt |
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
| Police (nom), taille, agrandir/réduire, alignement vertical, renvoi à la ligne | ✅ | Conservés en XLSX (test) |
| Bordures (8 modèles : toutes, extérieures, intérieures, haut, bas, gauche, droite, aucune ; trait fin, épais, double) | ✅ | Conservées en XLSX (test) |
| Décimales (+/−), séparateur de milliers, formats monétaire, comptabilité, dates, heure, %, scientifique | ✅ | Format « Texte » non proposé (le moteur tronque l'affichage) |
| Reproduire la mise en forme, effacer tout / formats / contenu | ✅ | |
| Rechercher, remplacer, atteindre | ✅ | Valeurs ou formules, casse, cellule entière |
| Tri (croissant, décroissant, personnalisé avec en-têtes) | ✅ | Une étape d'annulation ; **plages contenant des formules refusées** (message) |
| Supprimer les doublons | ✅ | Même limite pour les formules |
| Insérer une fonction (75 fonctions, recherche, catégories), bibliothèque par catégorie | ✅ | Chaque nom vérifié par le moteur en français et en anglais |
| Noms définis (gestionnaire), afficher les formules, calculer maintenant | ✅ | |
| Affichage : quadrillage (enregistré), en-têtes, barre de formule | ✅ | |
| Symboles | ✅ | |
| Formats de nombre (standard, nombre, %, €, date) | ✅ | |
| Fusion de cellules | 🟡 | Fusion enregistrée dans le fichier ; **affichage fusionné dans la grille à venir** |
| Insérer / supprimer lignes et colonnes | ✅ | |
| Copier, couper, coller (interne et autres applications) | ✅ | |
| Annuler / rétablir | ✅ | |
| Somme, moyenne, nombre de la sélection | ✅ | Calculés par le moteur |
| Sauvegarde automatique et récupération | ✅ | Copie toutes les 30 s hors du document, proposée au démarrage |
| Grandes feuilles | ✅ | 100 000 lignes de formules : 0,6 s ; recalcul 38 ms (prototype) |
| Hauteurs de ligne personnalisées | 🟡 | Conservées dans le fichier ; affichées à la hauteur standard |
| Filtres, graphiques, mise en forme conditionnelle, tableaux, tableaux croisés, liens hypertexte, commentaires, protection, figer les volets, zoom | ❌ | Onglets « Mise en page » et « Révision » absents tant que leurs fonctions ne sont pas réelles |
| Impression, export PDF | ❌ | Moteur PDF à choisir (ARCHITECTURE.md, D6) |

## ZYNORA Word — fonctionnalités (phase 3, première version)

| Onglet | Groupe | Contenu (chaque bouton est fonctionnel et enregistré dans le DOCX) |
|---|---|---|
| Accueil | Presse-papiers | Coller (texte), couper, copier, reproduire la mise en forme |
| | Police | Police, taille, agrandir/réduire, gras, italique, souligné, barré, indice, exposant, couleur, surlignage (15 couleurs DOCX), effacer la mise en forme |
| | Paragraphe | Puces, numérotation (9 niveaux), retraits, alignements (gauche, centre, droite, justifié), interligne, marques de paragraphe |
| | Styles | Normal, Titre, Titre 1 à 3, Citation |
| | Modification | Rechercher, remplacer (un par un ou tout), sélectionner tout |
| Insertion | Pages | Saut de page, saut de ligne |
| | Tableaux | Insertion (2×2 à 100×20), lignes et colonnes (ajout, suppression), suppression du tableau |
| | Liens | Lien web ou adresse électronique (autres schémas refusés), suppression du lien |
| | Texte, Symboles | Date et heure (3 formats), 40 symboles |
| Mise en page | Mise en page | Marges (4 préréglages + personnalisées), orientation, taille (A4, A5, A3, Letter, Legal) |
| | Retrait, Espacement | Retraits, retrait de 1re ligne ou suspendu, espacement avant/après, interligne (dialogue Paragraphe) |
| Révision | Vérification | Vérification orthographique du système (activable), statistiques (mots, caractères, paragraphes) |
| Affichage | Zoom, Afficher, Impression | Zoom 50–200 %, largeur de page, marques de mise en forme, impression aux dimensions et marges du document |

Barre de titre : annuler/rétablir, enregistrer, enregistrer une copie (.docx ou .txt), exporter en
texte brut. Barre d'état : mots, caractères, zoom. Sauvegarde automatique toutes les 30 s
(copie de récupération) et confirmation avant de fermer sans enregistrer.

**Éléments DOCX non pris en charge** (signalés à l'ouverture ; l'original n'est jamais remplacé) :
images et dessins, en-têtes et pieds de page, notes de bas de page et de fin, champs (numéros de
page, dates automatiques, renvois), commentaires, modifications suivies, table des matières,
cellules fusionnées et couleurs de cellule, tableaux imbriqués, colonnes de texte, sections
multiples, taquets de tabulation, styles personnalisés (convertis en Normal), titres de niveau 4+,
numérotations en lettres ou chiffres romains, interlignes exacts, effets de caractère (petites
majuscules, espacement…), texte masqué, contrôles de contenu.

**Approximations sans perte de contenu** (non signalées) : l'espacement défini par les styles
« Corps de texte » des autres logiciels est remplacé par celui du style Normal de ZYNORA ; les
bordures et largeurs des tableaux sont réécrites en bordures simples et colonnes égales.

**Pagination** : page continue aux dimensions du document ; les sauts de page sont respectés à
l'écran et à l'impression ; pas encore de découpage automatique en pages à l'écran.

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
