# Identité visuelle — ZYNORA

## Principes
- **Original** : aucune reprise des interfaces, couleurs de marque ou logos de Microsoft Office.
- **Calme et professionnel** : fond « papier chaud » en clair, « nuit d'encre » en sombre ; la couleur
  est réservée à l'action principale et à l'identité de chaque module.
- **Accessible** : contraste AA, navigation complète au clavier, focus toujours visible,
  animations désactivées si le système le demande (`prefers-reduced-motion`).
- **Hors ligne** : polices du système (Segoe UI Variable, SF Pro, Ubuntu/Cantarell/Noto).

## Emblème
Un « Z » tracé comme une page qui se replie (Iris), souligné d'un trait Aurore, dans un carré
arrondi nuit d'encre. Source : `apps/desktop/src-tauri/icons/zynora.svg` ; composant `ZynoraMark`.

## Couleurs des modules

| Module | Clair | Sombre |
|---|---|---|
| Word — Iris | `#4c3fd1` | `#9d93ff` |
| Sheets — Lagune | `#0a6b65` | `#3cc7bd` |
| Slides — Corail | `#b03a31` | `#ff8579` |
| Accent de marque — Aurore | `#f2a541` (emblème uniquement) | idem |

## Contrastes calculés (WCAG 2.2)

| Paire | Clair | Sombre |
|---|---|---|
| Texte / fond | 15,8 | 16,1 |
| Texte secondaire / surface | 6,6 | 7,0 |
| Texte secondaire / surface 2 | 5,7 | 6,4 |
| Primaire / surface | 7,1 | 5,8 |
| Texte sur primaire | 7,1 | 6,3 |
| Primaire / fond primaire doux | 5,8 | 4,7 |
| Avertissement / surface 2 | 4,6 | 8,8 |
| Lagune / fond doux | 5,4 | 6,6 |
| Corail / fond doux | 5,0 | 6,5 |

Tous ≥ 4,5:1 (AA texte normal).

## Composants disponibles
`Button` (primary, secondary, ghost ; md, sm) · `Card` · `Badge` (neutral, info, success, warning) ·
`SegmentedControl` (groupe radio ARIA, flèches) · `NavItem` (`aria-current`) · `ZynoraMark` ·
`applyTheme` / `resolveTheme` · `Dialog` (modal, focus confiné, Échap, focus rendu ; `alertdialog`
pour les confirmations destructrices) · `TextField` (étiquette et erreur reliées) · `IconButton`
(nom accessible obligatoire) · `ToastProvider` / `useToasts` (région `aria-live`, action « Annuler »).

Contrastes ajoutés en phase 1 : texte sur bouton danger 6,6 (clair) / 8,4 (sombre) ; étoile de
favori (élément graphique, seuil 3:1) 4,8 sur surface et 3,8 au survol (clair), 10,0 (sombre).
