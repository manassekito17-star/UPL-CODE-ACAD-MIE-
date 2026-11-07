/** Icônes de UPL IDE (dessin propre à la plateforme, trait de 1,6 px). */
const P = {
  fichiers: "M4 4h6l2 2h8v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z",
  recherche: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm5 12 4 4",
  projets: "M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z",
  versions: "M12 7v5l3 2M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4",
  formation: "M3 8l9-4 9 4-9 4zM7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5",
  ia: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z",
  parametres: "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  enregistrer: "M5 4h11l3 3v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 4v5h7V4M8 20v-6h8v6",
  executer: "M7 5l12 7-12 7z",
  apercu: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10-3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
  diviser: "M4 4h16v16H4zM12 4v16",
  formater: "M4 6h16M4 10h10M4 14h16M4 18h10",
  nouveauFichier: "M6 3h8l4 4v14H6zM14 3v4h4M12 11v6M9 14h6",
  nouveauDossier: "M3 6h6l2 2h10v11H3zM12 11v6M9 14h6",
  importer: "M12 3v12M7 10l5 5 5-5M4 19h16",
  exporter: "M12 15V3M7 8l5-5 5 5M4 19h16",
  fermer: "M6 6l12 12M18 6L6 18",
  dossier: "M3 6h6l2 2h10v11H3z",
  fichier: "M6 3h8l4 4v14H6zM14 3v4h4",
  chevron: "M9 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  menu: "M5 12h.01M12 12h.01M19 12h.01",
  panneau: "M4 4h16v16H4zM4 15h16",
  symbole: "M8 4c-2 0-3 1-3 3v2c0 1.5-1 2-2 2 1 0 2 .5 2 2v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5 1 2 2 2-1 0-2 .5-2 2v2c0 2-1 3-3 3",
  laboratoire: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3",
} as const;

export type IconName = keyof typeof P;

export function Icon({ name, className = "h-5 w-5", title }: { name: IconName; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      <path d={P[name]} />
    </svg>
  );
}
