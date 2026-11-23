import type { Metadata } from "next";
import { ButtonLink, Card, Container, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Guide des éditeurs",
  description: "Comment ouvrir chaque éditeur de ZENTECH, écrire un premier code, l'exécuter, l'enregistrer et l'utiliser sans Internet.",
};

interface EditorGuide {
  id: string;
  name: string;
  href: string;
  forWhat: string;
  steps: string[];
  example: { title: string; code: string };
  tips: string[];
}

const GUIDES: EditorGuide[] = [
  {
    id: "zentech-algo",
    name: "ZENTECH Algo",
    href: "/editeur",
    forWhat: "Écrire et exécuter des algorithmes en pseudo-code (et aussi en Python, JavaScript, HTML…).",
    steps: [
      "Ouvrez le menu du site et touchez « Éditeur » (ou le bouton ci-dessous).",
      "Écrivez votre algorithme dans la zone de code. Les touches en bas (←, =>, symboles) aident à taper sur téléphone.",
      "Touchez ▶ « Exécuter ». Si le programme demande une valeur (LIRE), tapez-la dans la console puis validez.",
      "Touchez « Enregistrer » pour le garder dans votre compte. Retrouvez-le avec « Plus d'options » → « Mes programmes ».",
      "Pour suivre l'exécution ligne par ligne, utilisez « Exécution pas à pas ».",
    ],
    example: {
      title: "Premier algorithme : dire bonjour",
      code: 'ALGORITHME Bonjour\nVARIABLES\n  nom : CHAINE\nDEBUT\n  ECRIRE("Quel est votre nom ?")\n  LIRE(nom)\n  ECRIRE("Bonjour ", nom)\nFIN',
    },
    tips: ["Appui long sur une ligne : sélectionner, puis Copier, Couper, Coller ou Supprimer.", "« Plus d'options » → « Exemples » donne des algorithmes tout prêts à essayer."],
  },
  {
    id: "zentech-algo-classique",
    name: "ZENTECH Algo Classique (interface LARP)",
    href: "/flow/classique",
    forWhat: "Le même fonctionnement que LARP sur ordinateur : pseudo-code, organigrammes, modules et tampons d'entrées/sorties.",
    steps: [
      "Menu du site → « Interface LARP ».",
      "Dans le Navigateur à gauche, touchez « PRINCIPAL » : c'est le module principal, où vous écrivez votre code.",
      "Écrivez entre DÉBUT et FIN, ou touchez un modèle dans « Modèles » (SI, POUR, TANTQUE…) pour l'insérer.",
      "Touchez ▶ (Exécuter) dans la barre d'outils. Les résultats et les erreurs s'affichent dans la console en bas.",
      "Fichier → « Sauvegarder » pour l'enregistrer dans votre compte ; Fichier → « Ouvrir… » pour le retrouver.",
      "Pour un organigramme : Fichier → « Nouveau… » puis choisissez Organigramme.",
    ],
    example: {
      title: "Somme et moyenne des notes",
      code: "DÉBUT\n  NOTE ← [6, 12, 7, 16, 13]\n  SOMME ← 0\n  POUR i = 1 JUSQU'À LONGUEUR(NOTE) FAIRE\n    SOMME = SOMME + NOTE[i]\n  FINPOUR\n  ÉCRIRE \"Somme = \", SOMME\n  ÉCRIRE \"Moyenne = \", SOMME / LONGUEUR(NOTE)\nFIN",
    },
    tips: [
      "Écrivez le même nom de variable partout (SOMME et non S ou som) : sinon un message jaune « variable indéfinie » s'affiche.",
      "Les boutons « − Ajuster + » en bas changent la taille de la fenêtre sur téléphone.",
    ],
  },
  {
    id: "zentech-ide",
    name: "ZENTECH IDE",
    href: "/ide",
    forWhat: "Des projets complets à plusieurs fichiers : Python, JavaScript, PHP, SQL, HTML/CSS (avec aperçu de la page).",
    steps: [
      "Menu du site → « ZENTECH IDE ».",
      "Touchez « Nouveau fichier… » et donnez un nom avec l'extension du langage : main.py, index.html, script.js, page.php…",
      "Écrivez votre code. Le clavier de programmation en bas donne les symboles et les boutons Copier / Coller.",
      "Touchez ▷ (Exécuter) en haut. Si le programme utilise input(), tapez les valeurs dans « Entrées du programme » avant d'exécuter.",
      "Pour une page web (index.html), touchez l'œil 👁 pour voir l'aperçu.",
      "Touchez « Enregistrer dans mon compte » pour garder le projet ; « Ouvrir un projet… » pour le rouvrir.",
    ],
    example: {
      title: "Premier programme Python",
      code: 'nom = input("Entre ton nom : ")\nage = int(input("Entre ton âge : "))\nprint("Bonjour", nom, "- dans 10 ans tu auras", age + 10, "ans")',
    },
    tips: [
      "Pour lire un nombre en Python : int(input(\"…\")) — et non input(int(\"…\")).",
      "La console en bas se replie avec la flèche ▾ ou en glissant la petite barre grise vers le bas.",
      "Appui long sur le code : menu Coller · Copier · Couper · Tout · Mot · Suivant · Définition · Renommer. Double toucher : sélectionner le mot.",
      "Comme dans VS Code : Ctrl+P (aller au fichier), F12 (définition, même dans un autre fichier), F2 (renommer), Ctrl+D (occurrence suivante), Ctrl+/ (commenter). Liste complète : Affichage → Raccourcis clavier (Ctrl+K Ctrl+S).",
      "Dans l'aperçu d'un site, localStorage et les formulaires fonctionnent ; console.log, console.table… s'affichent dans la console de l'IDE.",
    ],
  },
  {
    id: "zentech-texte",
    name: "ZENTECH Texte",
    href: "/texte",
    forWhat: "Un éditeur de texte rapide pour développeurs, avec l'ergonomie des éditeurs de texte classiques : aller à n'importe quoi, palette de commandes, curseurs multiples, exécution Ctrl+B.",
    steps: [
      "Menu du site → « ZENTECH Texte ». Vos fichiers et onglets sont gardés sur l'appareil : au retour, tout est là.",
      "Ctrl+P (ou ⌕ sur téléphone) : tapez quelques lettres d'un fichier. Ajoutez @ pour une fonction, : pour une ligne, # pour un mot.",
      "Ctrl+Maj+P (ou ⌘) : la palette de toutes les commandes (trier les lignes, changer la syntaxe, le thème…).",
      "Ctrl+B (ou ▶) : exécuter le fichier. Les entrées du programme se tapent sous la sortie.",
      "Ctrl+S : enregistrer (le point ● sur l'onglet disparaît). Préférences → Réglages pour changer le thème, la taille du texte, les tabulations…",
    ],
    example: {
      title: "Plusieurs curseurs",
      code: "nom = \"Ana\"\nprint(nom)\nprint(nom.upper())\n\n# Double-cliquez sur « nom », puis Ctrl+D deux fois :\n# les trois « nom » sont sélectionnés, tapez « prenom » pour les renommer.",
    },
    tips: [
      "Ctrl+F puis Alt+Entrée : toutes les occurrences deviennent des curseurs. Ctrl+Maj+F : rechercher dans tous les fichiers.",
      "Alt+Maj+2 : deux colonnes côte à côte. Maj+F11 : mode sans distraction.",
      "Outils → Corriger le code… et Fichier → Historique du fichier… comme dans les autres éditeurs.",
    ],
  },
  {
    id: "flow-studio",
    name: "ZENTECH Flow Studio",
    href: "/flow",
    forWhat: "Construire un organigramme avec des formes, le transformer en pseudo-code et l'exécuter.",
    steps: [
      "Menu du site → « Flow Studio ».",
      "Dans « Formes », touchez une forme (Entrée, Traitement, Décision, Boucle, Sortie) pour l'ajouter à l'organigramme.",
      "Touchez une forme pour écrire son contenu (par exemple : LIRE nom, ou x ← x + 1).",
      "Touchez ▶ « Exécuter » pour lancer l'organigramme, ou « Pas à pas » pour avancer une étape à la fois.",
      "« Importer du pseudocode » transforme un algorithme écrit en organigramme.",
    ],
    example: { title: "Organigramme simple", code: "Début → Entrée : LIRE a, b → Traitement : s ← a + b → Sortie : ÉCRIRE s → Fin" },
    tips: ["Le bouton « Ajuster à l'écran » recentre tout l'organigramme.", "L'icône « Interface à la même disposition que LARP » ouvre l'interface classique."],
  },
  {
    id: "laboratoire",
    name: "Laboratoire d'algorithmique",
    href: "/laboratoire",
    forWhat: "Voir un algorithme s'exécuter pas à pas : la ligne en cours, les variables et leurs valeurs.",
    steps: [
      "Menu du site → « Laboratoire ».",
      "Choisissez un algorithme dans la liste (« Choisir un algorithme ») ou écrivez le vôtre.",
      "Touchez « Avancer » pour exécuter une étape, « Reculer » pour revenir en arrière.",
      "Regardez le tableau « Variables » : il montre chaque variable, son type et sa valeur à chaque étape.",
      "« Réinitialiser » recommence depuis le début.",
    ],
    example: {
      title: "Échanger deux valeurs",
      code: "ALGORITHME Echange\nVARIABLES\n  a, b, temp : ENTIER\nDEBUT\n  a ← 5\n  b ← 9\n  temp ← a\n  a ← b\n  b ← temp\n  ECRIRE(a, b)\nFIN",
    },
    tips: ["Réglez la « Vitesse » pour une exécution automatique plus lente ou plus rapide."],
  },
];

export default function GuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Aide"
        title="Guide des éditeurs"
        subtitle="Comment ouvrir chaque éditeur de ZENTECH, écrire un premier code, l'exécuter et l'enregistrer — sur téléphone comme sur ordinateur."
      />
      <Container className="space-y-6 py-8">
        <nav aria-label="Éditeurs" className="flex flex-wrap gap-2" data-testid="guide-sommaire">
          {GUIDES.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-gris-200 bg-white px-3 py-1.5 text-sm font-medium text-electrique-600 hover:bg-gris-50">
              {g.name}
            </a>
          ))}
          <a href="#sans-internet" className="rounded-full border border-gris-200 bg-white px-3 py-1.5 text-sm font-medium text-electrique-600 hover:bg-gris-50">
            Sans Internet
          </a>
        </nav>

        {GUIDES.map((g, i) => (
          <Card key={g.id} id={g.id} className="scroll-mt-24 p-5 sm:p-6" data-testid={`guide-${g.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">Éditeur {i + 1}</p>
                <h2 className="text-xl font-bold text-nuit-900">{g.name}</h2>
                <p className="mt-1 text-sm text-gris-700">{g.forWhat}</p>
              </div>
              <ButtonLink href={g.href} size="sm">
                Ouvrir {g.name.split(" (")[0]}
              </ButtonLink>
            </div>
            <h3 className="mt-4 font-semibold text-nuit-900">Étapes</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[15px] text-gris-700">
              {g.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <h3 className="mt-4 font-semibold text-nuit-900">Exemple à essayer : {g.example.title}</h3>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-nuit-950 p-3 font-mono text-[13px] leading-relaxed text-gray-100">{g.example.code}</pre>
            <ul className="mt-3 space-y-1 text-sm text-gris-700">
              {g.tips.map((t) => (
                <li key={t}>💡 {t}</li>
              ))}
            </ul>
          </Card>
        ))}

        <Card id="sans-internet" className="scroll-mt-24 p-5 sm:p-6" data-testid="guide-sans-internet">
          <h2 className="text-xl font-bold text-nuit-900">Utiliser les éditeurs sans Internet</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[15px] text-gris-700">
            <li>Avec Internet, connectez-vous et ouvrez votre tableau de bord : les éditeurs et vos fichiers sauvegardés se téléchargent automatiquement sur l&apos;appareil.</li>
            <li>Dans la carte « Utiliser sans Internet », attendez que les 5 éditeurs aient un ✓ (ou touchez « Garder les éditeurs sur cet appareil »).</li>
            <li>Sans Internet, ouvrez ZENTECH : la page « Pas de connexion Internet » propose vos éditeurs et « Mes fichiers sauvegardés ».</li>
            <li>Sur iPhone, l&apos;application ajoutée à l&apos;écran d&apos;accueil garde sa propre copie : faites l&apos;étape 1 dans cette application.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/tableau-de-bord" size="sm">Tableau de bord</ButtonLink>
            <ButtonLink href="/telecharger" size="sm" variant="secondaire">Installer l&apos;application</ButtonLink>
          </div>
        </Card>
      </Container>
    </>
  );
}
