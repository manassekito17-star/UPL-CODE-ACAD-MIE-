// ---------- Progression (enregistrée dans le navigateur) ----------
const CLE = "upl-progression";

function lireProgression() {
  try {
    return JSON.parse(localStorage.getItem(CLE)) || {};
  } catch (e) {
    return {};
  }
}

function marquerTerminee(coursId, index) {
  const p = lireProgression();
  p[coursId + "-" + index] = true;
  try {
    localStorage.setItem(CLE, JSON.stringify(p));
  } catch (e) {
    /* stockage indisponible : on ignore */
  }
}

function estTerminee(coursId, index) {
  return !!lireProgression()[coursId + "-" + index];
}

function pourcentage(cours) {
  const faites = cours.lecons.filter((_, i) => estTerminee(cours.id, i)).length;
  return Math.round((faites / cours.lecons.length) * 100);
}

// ---------- Utilitaires ----------
function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const e of enfants) n.append(e);
  return n;
}

function param(nom) {
  return new URLSearchParams(location.search).get(nom);
}

function trouverCours(id) {
  return COURS.find((c) => c.id === id);
}

function barre(pct) {
  return el(
    "div",
    { class: "barre", role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 },
    el("span", { style: "width:" + pct + "%" })
  );
}

// ---------- Page d'accueil ----------
function pageAccueil() {
  const grille = document.getElementById("grille-cours");
  COURS.forEach((c) => {
    const pct = pourcentage(c);
    grille.append(
      el(
        "a",
        { class: "carte-cours", href: "cours.html?c=" + c.id, style: "--accent:" + c.couleur },
        el("div", { class: "pastille" }, c.id.toUpperCase()),
        el("h3", {}, c.titre),
        el("p", { class: "sous" }, c.sousTitre),
        el("p", {}, c.description),
        el("div", { class: "meta" }, el("span", {}, c.niveau), el("span", {}, c.lecons.length + " leçons")),
        barre(pct),
        el("p", { class: "petit" }, pct === 100 ? "Cours terminé ✓" : pct + " % terminé")
      )
    );
  });

  const total = COURS.reduce((s, c) => s + c.lecons.length, 0);
  const faites = COURS.reduce((s, c) => s + c.lecons.filter((_, i) => estTerminee(c.id, i)).length, 0);
  document.getElementById("stat-lecons").textContent = total;
  document.getElementById("stat-faites").textContent = faites;
}

// ---------- Page d'un cours ----------
function pageCours() {
  const c = trouverCours(param("c"));
  const zone = document.getElementById("zone");
  if (!c) {
    zone.append(el("p", {}, "Cours introuvable. "), el("a", { href: "index.html" }, "Retour à l'accueil"));
    return;
  }
  document.title = c.titre + " · UPL Code Académie";
  document.documentElement.style.setProperty("--accent", c.couleur);

  zone.append(
    el("p", { class: "fil" }, el("a", { href: "index.html" }, "Accueil"), " / " + c.titre),
    el("h1", {}, c.titre),
    el("p", { class: "sous" }, c.description),
    barre(pourcentage(c)),
    el("p", { class: "petit" }, pourcentage(c) + " % terminé")
  );

  const liste = el("ol", { class: "liste-lecons" });
  c.lecons.forEach((l, i) => {
    const fait = estTerminee(c.id, i);
    liste.append(
      el(
        "li",
        {},
        el(
          "a",
          { href: "lecon.html?c=" + c.id + "&l=" + i, class: fait ? "fait" : "" },
          el("span", { class: "num" }, fait ? "✓" : String(i + 1)),
          el("span", { class: "titre" }, l.titre),
          el("span", { class: "duree" }, l.duree)
        )
      )
    );
  });
  zone.append(liste);
}

// ---------- Page d'une leçon ----------
function pageLecon() {
  const c = trouverCours(param("c"));
  const i = parseInt(param("l"), 10);
  const zone = document.getElementById("zone");
  const l = c && c.lecons[i];
  if (!l) {
    zone.append(el("p", {}, "Leçon introuvable. "), el("a", { href: "index.html" }, "Retour à l'accueil"));
    return;
  }
  document.title = l.titre + " · " + c.titre + " · UPL Code Académie";
  document.documentElement.style.setProperty("--accent", c.couleur);

  let quizOk = false;
  let exoOk = false;
  const etat = el("p", { class: "etat" });
  const majEtat = () => {
    if (quizOk && exoOk) {
      marquerTerminee(c.id, i);
      etat.textContent = "🎉 Leçon terminée ! Passez à la suivante.";
      etat.className = "etat ok";
    } else {
      etat.textContent =
        "Pour terminer la leçon : " + (quizOk ? "✓" : "○") + " quiz   " + (exoOk ? "✓" : "○") + " exercice";
    }
  };
  if (estTerminee(c.id, i)) {
    quizOk = exoOk = true;
  }

  zone.append(
    el(
      "p",
      { class: "fil" },
      el("a", { href: "index.html" }, "Accueil"),
      " / ",
      el("a", { href: "cours.html?c=" + c.id }, c.titre),
      " / Leçon " + (i + 1)
    ),
    el("h1", {}, l.titre),
    el("p", { class: "petit" }, "⏱ " + l.duree)
  );

  // Contenu
  const article = el("article", { class: "contenu" });
  l.contenu.forEach((b) => {
    if (b.type === "texte") article.append(el("div", { html: b.html }));
    else article.append(el("pre", {}, el("code", {}, b.code)));
  });
  zone.append(article);

  // Quiz
  const quiz = el("section", { class: "bloc" }, el("h2", {}, "Quiz"), el("p", {}, l.quiz.question));
  const retourQuiz = el("p", { class: "retour" });
  const choix = el("div", { class: "choix" });
  l.quiz.choix.forEach((texte, k) => {
    choix.append(
      el(
        "button",
        {
          type: "button",
          onclick: (e) => {
            choix.querySelectorAll("button").forEach((b) => b.classList.remove("bon", "faux"));
            if (k === l.quiz.bonne) {
              e.currentTarget.classList.add("bon");
              retourQuiz.textContent = "Bonne réponse ! " + l.quiz.explication;
              retourQuiz.className = "retour ok";
              quizOk = true;
            } else {
              e.currentTarget.classList.add("faux");
              retourQuiz.textContent = "Pas tout à fait, réessayez.";
              retourQuiz.className = "retour ko";
            }
            majEtat();
          },
        },
        texte
      )
    );
  });
  quiz.append(choix, retourQuiz);
  zone.append(quiz);

  // Exercice
  const ex = l.exercice;
  const editeur = el("textarea", { class: "editeur", spellcheck: "false", "aria-label": "Éditeur de code" });
  editeur.value = ex.depart;
  editeur.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const d = editeur.selectionStart;
      editeur.setRangeText("  ", d, editeur.selectionEnd, "end");
    }
  });
  const apercu = el("iframe", { class: "apercu", title: "Aperçu du résultat" });
  const consoleZone = el("pre", { class: "console" });
  const retourExo = el("p", { class: "retour" });

  let logs = [];
  const executer = (puisVerifier) => {
    logs = [];
    consoleZone.textContent = "";
    apercu.onload = () => {
      const win = apercu.contentWindow;
      logs = win.__logs || [];
      consoleZone.textContent = logs.length ? logs.join("\n") : "(console vide)";
      if (puisVerifier) {
        let reussi = false;
        try {
          reussi = ex.verifier(apercu.contentDocument, logs);
        } catch (err) {
          reussi = false;
        }
        if (reussi) {
          retourExo.textContent = "Bravo, exercice réussi !";
          retourExo.className = "retour ok";
          exoOk = true;
        } else {
          retourExo.textContent = "Pas encore. Relisez la consigne ou affichez l'indice.";
          retourExo.className = "retour ko";
        }
        majEtat();
      }
    };
    const prelude =
      "<script>window.__logs=[];(function(){var o=console.log;console.log=function(){var a=[].slice.call(arguments).map(function(x){return typeof x==='object'?JSON.stringify(x):String(x)});window.__logs.push(a.join(' '));o.apply(console,arguments)};window.onerror=function(m){window.__logs.push('Erreur : '+m)}})();<\/script>";
    apercu.srcdoc = prelude + editeur.value;
  };

  const indice = el("pre", { class: "indice", hidden: "" }, el("code", {}, ex.indice));
  zone.append(
    el(
      "section",
      { class: "bloc" },
      el("h2", {}, "Exercice"),
      el("p", {}, ex.consigne),
      el(
        "div",
        { class: "atelier" },
        el("div", {}, el("p", { class: "etiquette" }, "Votre code"), editeur),
        el("div", {}, el("p", { class: "etiquette" }, "Résultat"), apercu, el("p", { class: "etiquette" }, "Console"), consoleZone)
      ),
      el(
        "div",
        { class: "actions" },
        el("button", { type: "button", class: "secondaire", onclick: () => executer(false) }, "▶ Exécuter"),
        el("button", { type: "button", onclick: () => executer(true) }, "✓ Vérifier"),
        el(
          "button",
          {
            type: "button",
            class: "lien",
            onclick: () => {
              indice.hidden = !indice.hidden;
            },
          },
          "Afficher l'indice"
        ),
        el(
          "button",
          {
            type: "button",
            class: "lien",
            onclick: () => {
              editeur.value = ex.depart;
              executer(false);
            },
          },
          "Réinitialiser"
        )
      ),
      retourExo,
      indice
    )
  );

  // Navigation
  const nav = el("nav", { class: "nav-lecons" });
  nav.append(
    i > 0
      ? el("a", { href: "lecon.html?c=" + c.id + "&l=" + (i - 1) }, "← Leçon précédente")
      : el("a", { href: "cours.html?c=" + c.id }, "← Sommaire du cours")
  );
  nav.append(
    i < c.lecons.length - 1
      ? el("a", { href: "lecon.html?c=" + c.id + "&l=" + (i + 1) }, "Leçon suivante →")
      : el("a", { href: "cours.html?c=" + c.id }, "Fin du cours →")
  );
  zone.append(etat, nav);

  majEtat();
  executer(false);
}

// ---------- Démarrage ----------
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "accueil") pageAccueil();
  if (page === "cours") pageCours();
  if (page === "lecon") pageLecon();
  const annee = document.getElementById("annee");
  if (annee) annee.textContent = new Date().getFullYear();
});
