/** Contenu du site ZYNORA Office : une seule source pour les pages et les tests. */

export const REPOSITORY = "https://github.com/manassekito17-star/UPL-CODE-ACAD-MIE-";
export const RELEASE_URL = `${REPOSITORY}/releases/tag/zynora-office-preview`;
export const DOWNLOAD_BASE = `${REPOSITORY}/releases/download/zynora-office-preview`;

export type Platform = "windows" | "macos" | "linux" | "android";

export interface Download {
  file: string;
  label: string;
  hint: string;
}

export const DOWNLOADS: Record<Platform, { title: string; files: Download[]; steps: string[] }> = {
  windows: {
    title: "Windows 10 et 11",
    files: [
      { file: "ZYNORA-Office-Windows-x64-setup.exe", label: "Installateur (.exe)", hint: "Recommandé" },
      { file: "ZYNORA-Office-Windows-x64.msi", label: "Paquet MSI", hint: "Déploiement en entreprise" },
    ],
    steps: [
      "Ouvrez le fichier téléchargé.",
      "Si Windows affiche « Windows a protégé votre ordinateur », cliquez sur « Informations complémentaires » puis « Exécuter quand même » : l'application n'est pas encore signée.",
    ],
  },
  macos: {
    title: "macOS (Mac à puce Apple)",
    files: [{ file: "ZYNORA-Office-macOS-AppleSilicon.dmg", label: "Image disque (.dmg)", hint: "Mac M1 et plus récents" }],
    steps: [
      "Ouvrez le .dmg et glissez ZYNORA Office dans « Applications ».",
      "Au premier lancement, faites un clic droit sur l'application puis « Ouvrir » : elle n'est pas encore notarisée par Apple.",
    ],
  },
  linux: {
    title: "Linux",
    files: [
      { file: "ZYNORA-Office-Linux-x86_64.AppImage", label: "AppImage", hint: "Toutes distributions" },
      { file: "ZYNORA-Office-Linux-amd64.deb", label: "Paquet .deb", hint: "Debian, Ubuntu" },
      { file: "ZYNORA-Office-Linux-x86_64.rpm", label: "Paquet .rpm", hint: "Fedora, openSUSE" },
    ],
    steps: ["AppImage : rendez le fichier exécutable (clic droit → Propriétés, ou chmod +x) puis lancez-le.", "Paquets : installez-les avec votre gestionnaire de logiciels."],
  },
  android: {
    title: "Android (téléphone, tablette)",
    files: [{ file: "ZYNORA-Office-Android-arm64-test.apk", label: "APK de test", hint: "Android 7 et plus" }],
    steps: [
      "Téléchargez l'APK depuis le téléphone, puis ouvrez-le.",
      "Autorisez l'installation depuis cette source quand Android le demande.",
      "Version de test : l'import de fichiers depuis le stockage du téléphone n'est pas encore disponible.",
    ],
  },
};

export const PLATFORM_ORDER: Platform[] = ["windows", "macos", "linux", "android"];

export const FEATURES = [
  {
    title: "Un vrai tableur",
    text: "Formules en français (SOMME, MOYENNE, SI, RECHERCHEV… 75 fonctions) calculées par le moteur IronCalc, références relatives et absolues, plusieurs feuilles, noms définis.",
  },
  {
    title: "Un ruban complet",
    text: "Onglets Accueil, Insertion, Formules, Données et Affichage : police, bordures, alignements, formats de nombre, tri, doublons, rechercher et remplacer, insérer une fonction.",
  },
  {
    title: "Compatible Excel et LibreOffice",
    text: "Ouverture et enregistrement XLSX vérifiés par des tests croisés avec LibreOffice ; import et export CSV protégés contre l'injection de formules.",
  },
  {
    title: "Rien n'est perdu",
    text: "Sauvegarde automatique toutes les 30 secondes, récupération après une coupure, corbeille avec restauration, enregistrement atomique.",
  },
  {
    title: "Sans Internet",
    text: "Toutes les fonctions bureautiques marchent hors connexion. Vos documents restent sur votre appareil.",
  },
  {
    title: "Sur ordinateur et téléphone",
    text: "Windows, macOS, Linux et Android, avec une interface adaptée à chaque écran ; thèmes clair et sombre, français et anglais.",
  },
];

export const COMING = [
  "Tableur : graphiques, filtres, mise en forme conditionnelle, impression et PDF",
  "ZYNORA Word : traitement de texte (DOCX, ODT, PDF)",
  "ZYNORA Slides : présentations (PPTX, PDF)",
  "Version iPhone et iPad",
];
