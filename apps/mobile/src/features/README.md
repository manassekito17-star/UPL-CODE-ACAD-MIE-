# `src/features` — fonctionnalités

Chaque dossier assemble moteur, services et interface pour un cas d'usage.

| Dossier | Fonctionnalité | Phase |
|---|---|---|
| `rendering/` | Ressources de rendu : police embarquée, images décodées | 5 |
| `layers/` | Actions sur les calques (ajout, suppression confirmée, ordre…) | 4 |
| `projects/` | Liste, ouverture, suppression avec confirmation, miniatures | 7 |
| `image-import/` | Galerie, copie de l'original + copie de travail, ouverture en nouveau document | 5 |
| `typography/` | (Le texte est livré par `layers/` et `rendering/` en phase 5) | 5 |
| `shapes/` | Rectangle, cercle, ligne | 5 |
| `export/` | Export PNG fidèle au document | 8 |
