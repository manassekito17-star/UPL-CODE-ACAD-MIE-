// Contenu des cours de UPL Code Académie.
// Pour ajouter une leçon : ajoutez un objet dans le tableau "lecons" d'un cours.
// Chaque leçon contient :
//   - titre, duree
//   - contenu : liste de blocs { type: "texte", html } ou { type: "code", code }
//   - quiz : { question, choix: [...], bonne: index de la bonne réponse, explication }
//   - exercice : { consigne, depart (code HTML de départ), verifier(doc, logs) -> true/false, indice }
//     "doc" est le document de l'aperçu, "logs" la liste des console.log affichés.

const COURS = [
  {
    id: "html",
    titre: "HTML",
    sousTitre: "La structure des pages web",
    couleur: "#e34c26",
    niveau: "Débutant",
    description:
      "Apprenez à écrire vos premières pages web : titres, paragraphes, liens, images et listes.",
    lecons: [
      {
        titre: "Votre première page",
        duree: "10 min",
        contenu: [
          {
            type: "texte",
            html: "<p><strong>HTML</strong> (HyperText Markup Language) décrit le <em>contenu</em> d'une page web. On l'écrit avec des <strong>balises</strong> : une balise ouvrante <code>&lt;p&gt;</code>, le contenu, puis une balise fermante <code>&lt;/p&gt;</code>.</p><p>Voici la structure minimale d'une page :</p>",
          },
          {
            type: "code",
            code: '<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="utf-8">\n    <title>Ma page</title>\n  </head>\n  <body>\n    <h1>Bonjour le monde !</h1>\n    <p>Ceci est mon premier paragraphe.</p>\n  </body>\n</html>',
          },
          {
            type: "texte",
            html: "<p>Tout ce qui s'affiche à l'écran se trouve dans <code>&lt;body&gt;</code>. La balise <code>&lt;h1&gt;</code> crée le titre principal ; il existe aussi <code>&lt;h2&gt;</code> à <code>&lt;h6&gt;</code> pour les sous-titres.</p>",
          },
        ],
        quiz: {
          question: "Dans quelle balise place-t-on le contenu visible de la page ?",
          choix: ["<head>", "<body>", "<title>", "<meta>"],
          bonne: 1,
          explication: "Le contenu visible va dans <body>. <head> contient les informations sur la page (titre de l'onglet, encodage…).",
        },
        exercice: {
          consigne:
            "Ajoutez un titre <h1> contenant le texte « UPL Code Académie » et un paragraphe <p> en dessous.",
          depart: "<!-- Écrivez votre code ici -->\n",
          verifier: (doc) => {
            const h1 = doc.querySelector("h1");
            return !!h1 && /UPL Code Acad[ée]mie/i.test(h1.textContent) && !!doc.querySelector("h1 ~ p, p");
          },
          indice: "<h1>UPL Code Académie</h1>\n<p>Bienvenue !</p>",
        },
      },
      {
        titre: "Liens et images",
        duree: "12 min",
        contenu: [
          {
            type: "texte",
            html: "<p>Un lien se crée avec la balise <code>&lt;a&gt;</code> et l'<strong>attribut</strong> <code>href</code>, qui indique l'adresse de destination.</p>",
          },
          { type: "code", code: '<a href="https://developer.mozilla.org">Documentation MDN</a>' },
          {
            type: "texte",
            html: "<p>Une image utilise <code>&lt;img&gt;</code> avec <code>src</code> (l'adresse de l'image) et <code>alt</code> (un texte qui la décrit, lu par les lecteurs d'écran). <code>&lt;img&gt;</code> n'a pas de balise fermante.</p>",
          },
          { type: "code", code: '<img src="https://picsum.photos/300/150" alt="Un paysage">' },
        ],
        quiz: {
          question: "Quel attribut donne l'adresse de destination d'un lien ?",
          choix: ["src", "alt", "href", "link"],
          bonne: 2,
          explication: "href (hypertext reference) contient l'adresse du lien. src sert aux images, scripts et vidéos.",
        },
        exercice: {
          consigne:
            "Créez un lien vers https://developer.mozilla.org et une image avec un attribut alt non vide.",
          depart: "\n",
          verifier: (doc) => {
            const a = doc.querySelector('a[href*="developer.mozilla.org"]');
            const img = doc.querySelector("img[src]");
            return !!a && !!img && (img.getAttribute("alt") || "").trim() !== "";
          },
          indice: '<a href="https://developer.mozilla.org">MDN</a>\n<img src="https://picsum.photos/300/150" alt="Un paysage">',
        },
      },
      {
        titre: "Les listes",
        duree: "8 min",
        contenu: [
          {
            type: "texte",
            html: "<p>Il existe deux types de listes : les listes à puces <code>&lt;ul&gt;</code> (non ordonnées) et les listes numérotées <code>&lt;ol&gt;</code> (ordonnées). Chaque élément est dans une balise <code>&lt;li&gt;</code>.</p>",
          },
          {
            type: "code",
            code: "<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>\n\n<ol>\n  <li>Apprendre</li>\n  <li>Pratiquer</li>\n  <li>Créer</li>\n</ol>",
          },
        ],
        quiz: {
          question: "Quelle balise crée une liste numérotée ?",
          choix: ["<ul>", "<li>", "<ol>", "<list>"],
          bonne: 2,
          explication: "<ol> signifie « ordered list ». <ul> est une liste à puces, et <li> un élément de liste.",
        },
        exercice: {
          consigne: "Créez une liste à puces <ul> contenant au moins 3 éléments <li>.",
          depart: "\n",
          verifier: (doc) => doc.querySelectorAll("ul > li").length >= 3,
          indice: "<ul>\n  <li>Un</li>\n  <li>Deux</li>\n  <li>Trois</li>\n</ul>",
        },
      },
    ],
  },
  {
    id: "css",
    titre: "CSS",
    sousTitre: "Le style et la mise en page",
    couleur: "#264de4",
    niveau: "Débutant",
    description:
      "Donnez du style à vos pages : couleurs, polices, marges et mise en page avec Flexbox.",
    lecons: [
      {
        titre: "Sélecteurs et couleurs",
        duree: "12 min",
        contenu: [
          {
            type: "texte",
            html: "<p><strong>CSS</strong> (Cascading Style Sheets) décrit l'<em>apparence</em> de la page. Une règle CSS a un <strong>sélecteur</strong> (quels éléments) et des <strong>déclarations</strong> (propriété : valeur).</p>",
          },
          {
            type: "code",
            code: "<style>\n  h1 {\n    color: #264de4;\n  }\n  .important {\n    background-color: yellow;\n  }\n</style>\n\n<h1>Titre bleu</h1>\n<p class=\"important\">Paragraphe surligné</p>",
          },
          {
            type: "texte",
            html: "<p><code>h1</code> cible toutes les balises <code>&lt;h1&gt;</code>. <code>.important</code> cible tous les éléments qui ont <code>class=\"important\"</code>.</p>",
          },
        ],
        quiz: {
          question: "Quel sélecteur cible les éléments ayant class=\"carte\" ?",
          choix: ["#carte", "carte", ".carte", "*carte"],
          bonne: 2,
          explication: "Le point (.) sélectionne une classe. Le dièse (#) sélectionne un id.",
        },
        exercice: {
          consigne: "Écrivez une règle CSS qui met le texte de tous les paragraphes <p> en rouge (red).",
          depart: "<style>\n  /* Votre CSS ici */\n</style>\n\n<p>Je dois devenir rouge.</p>",
          verifier: (doc) => {
            const p = doc.querySelector("p");
            return !!p && doc.defaultView.getComputedStyle(p).color === "rgb(255, 0, 0)";
          },
          indice: "p {\n  color: red;\n}",
        },
      },
      {
        titre: "Le modèle de boîte",
        duree: "15 min",
        contenu: [
          {
            type: "texte",
            html: "<p>Chaque élément est une <strong>boîte</strong> composée de : son contenu, le <code>padding</code> (marge intérieure), la <code>border</code> (bordure) et la <code>margin</code> (marge extérieure).</p>",
          },
          {
            type: "code",
            code: "<style>\n  .boite {\n    padding: 20px;\n    border: 3px solid #264de4;\n    margin: 10px;\n    border-radius: 8px;\n  }\n</style>\n\n<div class=\"boite\">Je suis une boîte</div>",
          },
        ],
        quiz: {
          question: "Quelle propriété ajoute de l'espace à l'INTÉRIEUR de la bordure ?",
          choix: ["margin", "padding", "border", "spacing"],
          bonne: 1,
          explication: "padding est l'espace entre le contenu et la bordure. margin est l'espace à l'extérieur de la bordure.",
        },
        exercice: {
          consigne: "Donnez à l'élément .carte un padding de 20px et une bordure (border) visible.",
          depart: "<style>\n  .carte {\n    /* Votre CSS ici */\n  }\n</style>\n\n<div class=\"carte\">Ma carte</div>",
          verifier: (doc) => {
            const el = doc.querySelector(".carte");
            if (!el) return false;
            const s = doc.defaultView.getComputedStyle(el);
            return s.paddingTop === "20px" && parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== "none";
          },
          indice: ".carte {\n  padding: 20px;\n  border: 2px solid black;\n}",
        },
      },
      {
        titre: "Mise en page avec Flexbox",
        duree: "15 min",
        contenu: [
          {
            type: "texte",
            html: "<p><strong>Flexbox</strong> permet d'aligner facilement des éléments en ligne ou en colonne. On l'active sur le <em>parent</em> avec <code>display: flex</code>.</p>",
          },
          {
            type: "code",
            code: "<style>\n  .rangee {\n    display: flex;\n    gap: 10px;\n    justify-content: center;\n  }\n  .rangee div {\n    background: #264de4;\n    color: white;\n    padding: 10px 20px;\n  }\n</style>\n\n<div class=\"rangee\">\n  <div>1</div>\n  <div>2</div>\n  <div>3</div>\n</div>",
          },
          {
            type: "texte",
            html: "<p><code>gap</code> espace les éléments, <code>justify-content</code> les aligne sur l'axe principal et <code>align-items</code> sur l'axe secondaire.</p>",
          },
        ],
        quiz: {
          question: "Sur quel élément écrit-on display: flex ?",
          choix: ["Sur chaque enfant", "Sur le parent (le conteneur)", "Sur <body> uniquement", "Sur <html>"],
          bonne: 1,
          explication: "display: flex se met sur le conteneur ; ce sont ses enfants directs qui sont alors alignés.",
        },
        exercice: {
          consigne: "Transformez .menu en conteneur flex pour aligner les liens sur une ligne.",
          depart: "<style>\n  .menu {\n    /* Votre CSS ici */\n  }\n  .menu a { display: block; padding: 8px; }\n</style>\n\n<nav class=\"menu\">\n  <a href=\"#\">Accueil</a>\n  <a href=\"#\">Cours</a>\n  <a href=\"#\">Contact</a>\n</nav>",
          verifier: (doc) => {
            const el = doc.querySelector(".menu");
            return !!el && doc.defaultView.getComputedStyle(el).display === "flex";
          },
          indice: ".menu {\n  display: flex;\n  gap: 10px;\n}",
        },
      },
    ],
  },
  {
    id: "js",
    titre: "JavaScript",
    sousTitre: "Rendre les pages interactives",
    couleur: "#d4a017",
    niveau: "Intermédiaire",
    description:
      "Découvrez la programmation : variables, conditions, boucles et fonctions avec JavaScript.",
    lecons: [
      {
        titre: "Variables et affichage",
        duree: "12 min",
        contenu: [
          {
            type: "texte",
            html: "<p>Une <strong>variable</strong> stocke une valeur. On la déclare avec <code>let</code> (si elle peut changer) ou <code>const</code> (si elle ne change pas). <code>console.log()</code> affiche une valeur dans la console.</p>",
          },
          {
            type: "code",
            code: "<script>\n  const nom = \"Amani\";\n  let age = 20;\n  age = age + 1;\n  console.log(\"Bonjour \" + nom);\n  console.log(age);\n</script>",
          },
        ],
        quiz: {
          question: "Quel mot-clé utiliser pour une valeur qui ne changera jamais ?",
          choix: ["let", "var", "const", "fixe"],
          bonne: 2,
          explication: "const déclare une variable qu'on ne peut pas réaffecter.",
        },
        exercice: {
          consigne: "Créez une constante ville avec la valeur \"Lubumbashi\" puis affichez-la avec console.log.",
          depart: "<script>\n  // Votre code ici\n</script>",
          verifier: (doc, logs) => logs.some((l) => l.includes("Lubumbashi")),
          indice: "const ville = \"Lubumbashi\";\nconsole.log(ville);",
        },
      },
      {
        titre: "Conditions et boucles",
        duree: "15 min",
        contenu: [
          {
            type: "texte",
            html: "<p><code>if</code> exécute du code seulement si une condition est vraie. <code>for</code> répète du code plusieurs fois.</p>",
          },
          {
            type: "code",
            code: "<script>\n  const note = 14;\n  if (note >= 10) {\n    console.log(\"Admis\");\n  } else {\n    console.log(\"Ajourné\");\n  }\n\n  for (let i = 1; i <= 3; i++) {\n    console.log(\"Tour \" + i);\n  }\n</script>",
          },
        ],
        quiz: {
          question: "Combien de fois s'exécute : for (let i = 0; i < 5; i++) ?",
          choix: ["4 fois", "5 fois", "6 fois", "Indéfiniment"],
          bonne: 1,
          explication: "i prend les valeurs 0, 1, 2, 3 et 4 : cela fait 5 tours.",
        },
        exercice: {
          consigne: "Avec une boucle for, affichez les nombres de 1 à 5 (un console.log par nombre).",
          depart: "<script>\n  // Votre boucle ici\n</script>",
          verifier: (doc, logs) => ["1", "2", "3", "4", "5"].every((n) => logs.includes(n)),
          indice: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}",
        },
      },
      {
        titre: "Fonctions et interactions",
        duree: "18 min",
        contenu: [
          {
            type: "texte",
            html: "<p>Une <strong>fonction</strong> regroupe du code réutilisable. Elle peut recevoir des <em>paramètres</em> et renvoyer un résultat avec <code>return</code>.</p>",
          },
          {
            type: "code",
            code: "<script>\n  function carre(n) {\n    return n * n;\n  }\n  console.log(carre(4)); // 16\n</script>",
          },
          {
            type: "texte",
            html: "<p>JavaScript peut aussi réagir aux actions de l'utilisateur, par exemple un clic sur un bouton :</p>",
          },
          {
            type: "code",
            code: "<button id=\"btn\">Cliquez-moi</button>\n<p id=\"msg\"></p>\n\n<script>\n  document.getElementById(\"btn\").addEventListener(\"click\", function () {\n    document.getElementById(\"msg\").textContent = \"Merci !\";\n  });\n</script>",
          },
        ],
        quiz: {
          question: "Quel mot-clé renvoie le résultat d'une fonction ?",
          choix: ["send", "return", "output", "give"],
          bonne: 1,
          explication: "return arrête la fonction et renvoie la valeur indiquée.",
        },
        exercice: {
          consigne: "Écrivez une fonction addition(a, b) qui renvoie a + b, puis affichez addition(2, 3) avec console.log.",
          depart: "<script>\n  // Votre fonction ici\n</script>",
          verifier: (doc, logs) => {
            const f = doc.defaultView.addition;
            return typeof f === "function" && f(2, 3) === 5 && f(10, -4) === 6 && logs.includes("5");
          },
          indice: "function addition(a, b) {\n  return a + b;\n}\nconsole.log(addition(2, 3));",
        },
      },
    ],
  },
];
