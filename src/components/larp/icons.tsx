/** Petites icônes 16×16 du panneau de contrôle (dessins originaux, style bureau classique). */
import type { ReactNode } from "react";

const S = ({ children }: { children: ReactNode }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="block">
    {children}
  </svg>
);

const page = (fill = "#fff") => <path d="M3 1.5h6.5L13 5v9.5H3z" fill={fill} stroke="#3a3a3a" strokeWidth="1" />;

export const Icons: Record<string, ReactNode> = {
  nouveau: (
    <S>
      {page()}
      <path d="M9.5 1.5V5H13" fill="none" stroke="#3a3a3a" />
    </S>
  ),
  ouvrir: (
    <S>
      <path d="M1.5 4h4l1 1.5h6v8h-11z" fill="#f6d36b" stroke="#8a6d12" />
      <path d="M3 7.5h12l-2 6H1.5z" fill="#fbe7a1" stroke="#8a6d12" />
    </S>
  ),
  fermer: (
    <S>
      {page("#e8eefc")}
      <path d="M6 7l4 4M10 7l-4 4" stroke="#c0392b" strokeWidth="1.6" />
    </S>
  ),
  sauvegarder: (
    <S>
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#3b5ba5" stroke="#1f3570" />
      <rect x="4.5" y="2.5" width="7" height="4" fill="#fff" />
      <rect x="4" y="9" width="8" height="4.5" fill="#cfd8ee" />
    </S>
  ),
  imprimer: (
    <S>
      <rect x="4" y="1.5" width="8" height="5" fill="#fff" stroke="#3a3a3a" />
      <rect x="1.5" y="6" width="13" height="6" rx="1" fill="#bdbdbd" stroke="#3a3a3a" />
      <rect x="4" y="10" width="8" height="4.5" fill="#fff" stroke="#3a3a3a" />
    </S>
  ),
  couper: (
    <S>
      <circle cx="4.5" cy="12" r="2.2" fill="none" stroke="#333" strokeWidth="1.3" />
      <circle cx="11.5" cy="12" r="2.2" fill="none" stroke="#333" strokeWidth="1.3" />
      <path d="M6 10.5L11 2M10 10.5L5 2" stroke="#555" strokeWidth="1.3" />
    </S>
  ),
  copier: (
    <S>
      <rect x="2" y="2" width="8" height="9" fill="#fff" stroke="#3a3a3a" />
      <rect x="6" y="5" width="8" height="9" fill="#fff" stroke="#3a3a3a" />
    </S>
  ),
  coller: (
    <S>
      <rect x="2.5" y="2.5" width="9" height="11" rx="1" fill="#c98f3c" stroke="#6b4a17" />
      <rect x="5" y="1.5" width="4" height="2.5" fill="#ddd" stroke="#555" />
      <rect x="7" y="6" width="7" height="8.5" fill="#fff" stroke="#3a3a3a" />
    </S>
  ),
  annuler: (
    <S>
      <path d="M5 4L2 7l3 3" fill="none" stroke="#1d4ed8" strokeWidth="1.6" />
      <path d="M2.5 7H10a3.5 3.5 0 010 7H7" fill="none" stroke="#1d4ed8" strokeWidth="1.6" />
    </S>
  ),
  indenter: (
    <S>
      <path d="M6 3h8M6 6.5h8M6 10h8M2 13.5h12" stroke="#333" />
      <path d="M1.5 4.5l3 2-3 2z" fill="#1d4ed8" />
    </S>
  ),
  desindenter: (
    <S>
      <path d="M6 3h8M6 6.5h8M6 10h8M2 13.5h12" stroke="#333" />
      <path d="M4.5 4.5l-3 2 3 2z" fill="#1d4ed8" />
    </S>
  ),
  agrandir: (
    <S>
      <circle cx="6.5" cy="6.5" r="4.5" fill="#e8f1ff" stroke="#333" />
      <path d="M10 10l4.5 4.5" stroke="#333" strokeWidth="2" />
      <path d="M4.5 6.5h4M6.5 4.5v4" stroke="#1d4ed8" strokeWidth="1.3" />
    </S>
  ),
  reduire: (
    <S>
      <circle cx="6.5" cy="6.5" r="4.5" fill="#e8f1ff" stroke="#333" />
      <path d="M10 10l4.5 4.5" stroke="#333" strokeWidth="2" />
      <path d="M4.5 6.5h4" stroke="#1d4ed8" strokeWidth="1.3" />
    </S>
  ),
  rechercher: (
    <S>
      <rect x="1.5" y="4" width="5" height="8" rx="2" fill="#333" />
      <rect x="9.5" y="4" width="5" height="8" rx="2" fill="#333" />
      <rect x="6" y="6" width="4" height="2" fill="#333" />
      <circle cx="4" cy="10" r="1.3" fill="#8ab4ff" />
      <circle cx="12" cy="10" r="1.3" fill="#8ab4ff" />
    </S>
  ),
  suivant: (
    <S>
      <rect x="1.5" y="4" width="4.5" height="7" rx="2" fill="#777" />
      <rect x="7.5" y="4" width="4.5" height="7" rx="2" fill="#777" />
      <path d="M12 12.5l3-2.5-3-2.5z" fill="#1d4ed8" />
    </S>
  ),
  console: (
    <S>
      <rect x="1.5" y="2.5" width="13" height="11" fill="#111" stroke="#555" />
      <rect x="1.5" y="2.5" width="13" height="2" fill="#2b5fd9" />
      <path d="M3.5 7l2 1.5-2 1.5M7 11h4" stroke="#ddd" fill="none" />
    </S>
  ),
  compiler: (
    <S>
      <path d="M8 1.5l6 3v7l-6 3-6-3v-7z" fill="#7aa0e8" stroke="#1f3570" />
      <path d="M8 8v6.5M2 4.5l6 3.5 6-3.5" fill="none" stroke="#1f3570" />
    </S>
  ),
  executer: (
    <S>
      <path d="M4 2.5l9 5.5-9 5.5z" fill="#17a34a" stroke="#0b5d29" />
    </S>
  ),
  pasapas: (
    <S>
      <path d="M2.5 2.5l7 5.5-7 5.5z" fill="#17a34a" stroke="#0b5d29" />
      <rect x="10.5" y="2.5" width="3" height="11" fill="#1f3570" />
    </S>
  ),
  aide: (
    <S>
      <circle cx="8" cy="8" r="6.5" fill="#f6d36b" stroke="#8a6d12" />
      <path d="M6 6.2a2 2 0 113 1.8c-.7.4-1 .8-1 1.6" fill="none" stroke="#7a2e00" strokeWidth="1.4" />
      <circle cx="8" cy="11.7" r=".9" fill="#7a2e00" />
    </S>
  ),
  pseudo: (
    <S>
      {page("#dbe6ff")}
      <path d="M5 6h6M5 8.5h6M5 11h4" stroke="#2b5fd9" />
    </S>
  ),
  organigramme: (
    <S>
      <rect x="1.5" y="1.5" width="13" height="13" fill="#fde68a" stroke="#8a6d12" />
      <rect x="5.5" y="3" width="5" height="2.5" fill="#fff" stroke="#333" strokeWidth=".8" />
      <path d="M8 5.5v2M8 7.5l2.5 2-2.5 2-2.5-2z" fill="#fff" stroke="#333" strokeWidth=".8" />
    </S>
  ),
  tampon: (
    <S>
      {page()}
      <path d="M5 6h6M5 8.5h6M5 11h6" stroke="#999" />
    </S>
  ),
  // Fenêtre pas-à-pas
  unpas: (
    <S>
      <path d="M3 3l6 5-6 5z" fill="#17a34a" />
      <rect x="10" y="3" width="2.5" height="10" fill="#17a34a" />
    </S>
  ),
  animer: (
    <S>
      <rect x="1.5" y="3.5" width="13" height="9" fill="#111" />
      <path d="M2.5 4.5h1M5 4.5h1M7.5 4.5h1M10 4.5h1M12.5 4.5h1M2.5 11.5h1M5 11.5h1M7.5 11.5h1M10 11.5h1M12.5 11.5h1" stroke="#fff" />
      <rect x="4" y="6" width="8" height="4" fill="#22c55e" />
    </S>
  ),
  marcher: (
    <S>
      <path d="M2 3l5.5 5L2 13z" fill="#17a34a" />
      <path d="M8 3l5.5 5L8 13z" fill="#17a34a" />
    </S>
  ),
  continuer: (
    <S>
      <path d="M4 2.5l9 5.5-9 5.5z" fill="#17a34a" />
    </S>
  ),
  pause: (
    <S>
      <rect x="4" y="3" width="3" height="10" fill="#c79a00" />
      <rect x="9" y="3" width="3" height="10" fill="#c79a00" />
    </S>
  ),
  arreter: (
    <S>
      <circle cx="8" cy="8" r="6" fill="#dc2626" />
    </S>
  ),
};
