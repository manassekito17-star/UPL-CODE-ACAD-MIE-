"use client";

import { ZentechSymbol } from "@/components/brand/zentech-mark";
import { useEffect, useRef, useState } from "react";
import { nextPopup, RATING_ASKED_KEY, seenKey, SESSION_POPUP_KEY, type PopupAnnouncement, type PopupStep } from "@/lib/announcement";
import { RatingBox } from "./rating-box";

/**
 * Fenêtres d'information, une seule par visite et chacune une seule fois par appareil :
 * 1re ouverture : message de bienvenue (ou dernière annonce publiée) ;
 * 2e ouverture : demande d'avis sur 5 étoiles (comptes utilisés depuis au moins 7 jours).
 * Les visiteurs non connectés ne voient aucune fenêtre.
 */
export function AnnouncementModal({
  announcement: a,
  firstName,
  loggedIn,
  ratingEligible,
  alreadyRated,
}: {
  announcement: PopupAnnouncement;
  firstName: string;
  loggedIn: boolean;
  ratingEligible: boolean;
  alreadyRated: boolean;
}) {
  const [mode, setMode] = useState<PopupStep | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const open = mode !== null;

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("annonce");
    // Les tests automatisés (navigateur piloté) ne voient une fenêtre que sur demande :
    // ?annonce (bienvenue), ?annonce=avis (note).
    if (param === null && navigator.webdriver) return;
    let next: PopupStep | null = null;
    if (param !== null) next = param === "avis" ? "avis" : "annonce";
    else {
      const read = (store: Storage, k: string) => {
        try {
          return store.getItem(k) === "1";
        } catch {
          return false;
        }
      };
      next = nextPopup({
        loggedIn,
        welcomeSeen: read(localStorage, seenKey(a.id)),
        canRate: ratingEligible && !alreadyRated,
        ratingAsked: read(localStorage, RATING_ASKED_KEY),
        shownThisVisit: read(sessionStorage, SESSION_POPUP_KEY),
      });
    }
    if (!next) return;
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_POPUP_KEY, "1");
      } catch {
        /* stockage indisponible */
      }
      setMode(next);
    }, 400);
    return () => clearTimeout(t);
  }, [a.id, loggedIn, ratingEligible, alreadyRated]);

  const close = () => {
    try {
      if (mode === "annonce") localStorage.setItem(seenKey(a.id), "1");
      if (mode === "avis") localStorage.setItem(RATING_ASKED_KEY, "1");
    } catch {
      /* stockage indisponible */
    }
    setMode(null);
  };

  useEffect(() => {
    if (!open) return;
    button.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!open) return null;
  const date = a.date ? new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-nuit-900/60 p-3 backdrop-blur-sm sm:items-center" role="presentation" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="annonce-titre"
        data-testid="annonce-accueil"
        data-etape={mode ?? undefined}
        className="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative px-6 pb-6 pt-5 text-white bg-gradient-to-br from-nuit-900 via-[#10264f] to-electrique-600`}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-accent/20 blur-2xl" />
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20"><ZentechSymbol size={28} /></span>
            <div className="leading-tight">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-accent`}>
                Message de l&apos;administration
              </p>
              <p className="text-xs text-white/70">ZENTECH{date && mode === "annonce" ? ` · ${date}` : ""}</p>
            </div>
          </div>
          <h2 id="annonce-titre" className="mt-4 text-xl font-bold leading-snug sm:text-2xl">
            {mode === "avis" ? "Votre avis compte" : a.title}
          </h2>
          {firstName && <p className="mt-1 text-sm text-white/80">Bonjour {firstName} 👋</p>}
        </div>
        <div className="max-h-[52vh] space-y-3 overflow-y-auto px-6 py-5 text-[15px] leading-relaxed text-gris-700">
          {(mode === "avis"
            ? "Vous utilisez ZENTECH depuis une semaine : merci pour votre confiance !\n\nPrenez quelques secondes pour noter la plateforme. Votre avis aide l'équipe à l'améliorer pour tous les étudiants."
            : a.body
          )
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          <p className="border-t border-gris-200 pt-3 text-sm font-semibold text-nuit-900">{mode === "annonce" ? a.signature : "L'équipe ZENTECH"}</p>
          {mode === "avis" && <RatingBox />}
        </div>
        <div className="flex justify-end gap-2 border-t border-gris-200 bg-gris-50 px-6 py-3">
          <button
            ref={button}
            type="button"
            onClick={close}
            data-testid="annonce-fermer"
            className="rounded-lg bg-electrique-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-electrique-500 focus:outline-none focus:ring-2 focus:ring-electrique-500 focus:ring-offset-2"
          >
            {mode === "avis" ? "Plus tard" : "Commencer"}
          </button>
        </div>
        <button type="button" onClick={close} aria-label="Fermer le message" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
}
