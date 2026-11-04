# UPL Code Académie

Plateforme de cours en ligne pour apprendre **HTML**, **CSS** et **JavaScript**.
Chaque leçon contient une explication avec des exemples, un quiz et un exercice
à faire dans un éditeur intégré, avec aperçu et console en direct.
La progression est enregistrée dans le navigateur (aucun compte nécessaire).

## Lancer le site

Aucune installation : ouvrez `index.html` dans votre navigateur.

## Mettre le site en ligne (GitHub Pages)

1. Sur GitHub : **Settings → Pages**.
2. Source : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
3. Le site sera disponible sur `https://manassekito17-star.github.io/UPL-CODE-ACAD-MIE-/`.

## Structure

- `index.html` : accueil et liste des cours
- `cours.html` : sommaire d'un cours
- `lecon.html` : une leçon (contenu, quiz, exercice)
- `js/data.js` : **le contenu de tous les cours** (c'est ici qu'on ajoute des leçons)
- `js/app.js` : le fonctionnement du site
- `css/style.css` : le style (thème clair et sombre)

## Ajouter une leçon

Ouvrez `js/data.js` et ajoutez un objet dans le tableau `lecons` d'un cours,
en suivant le modèle des leçons existantes.
