/** Message d'accueil affiché à l'ouverture de la plateforme (si aucune annonce n'est publiée). */
export interface PopupAnnouncement {
  id: string;
  title: string;
  body: string;
  date?: string;
  signature: string;
}

export const WELCOME_ANNOUNCEMENT: PopupAnnouncement = {
  id: "bienvenue-2026",
  title: "Bienvenue sur UPL CODE ACADEMY MK",
  body: [
    "Chers étudiants, chers enseignants,",
    "Toute l'équipe est heureuse de vous accueillir sur UPL CODE ACADEMY MK, votre espace d'apprentissage de l'informatique.",
    "Vous y trouverez des parcours progressifs (algorithmique, HTML, CSS, Python, C, JavaScript, Java, PHP, SQL…), des exercices corrigés automatiquement, des éditeurs de code utilisables sur téléphone comme sur ordinateur — dont une interface compatible LARP — ainsi qu'un professeur IA pour vous accompagner pas à pas.",
    "Notre ambition : vous offrir un environnement moderne et fiable pour apprendre, pratiquer et progresser à votre rythme, du premier algorithme jusqu'au niveau professionnel.",
    "Merci de faire partie de cette aventure. Bon apprentissage à toutes et à tous !",
  ].join("\n\n"),
  signature: "La Direction — UPL CODE ACADEMY MK",
};

/** Clé locale : l'annonce n'est montrée qu'une fois par appareil. */
export const seenKey = (id: string) => `upl:annonce:vue:${id}`;
