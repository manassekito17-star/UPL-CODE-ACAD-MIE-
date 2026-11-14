"use client";

import { useEffect, useRef, useState } from "react";
import { RATING_ASKED_KEY, seenKey, type PopupAnnouncement } from "@/lib/announcement";
import { RatingBox } from "./rating-box";

/**
 * Fenêtre « Message de l'administration », fermée une fois pour toutes sur cet appareil.
 * La note sur 5 étoiles n'y figure que pour les comptes utilisés depuis au moins 7 jours ;
 * pour un compte plus récent, elle est proposée seule (« Votre avis compte ») une fois ce
 * délai passé.
 */
export function AnnouncementModal({
  announcement: a,
  firstName,
  ratingEligible,
  alreadyRated,
}: {
  announcement: PopupAnnouncement;
  firstName: string;
  ratingEligible: boolean;
  alreadyRated: boolean;
}) {
  const [mode, setMode] = useState<null | "annonce" | "avis">(null);
  const [showRating, setShowRating] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const open = mode !== null;

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("annonce");
    const forced = param !== null;
    // Les tests automatisés (navigateur piloté) ne voient la fenêtre que sur demande (?annonce ; ?annonce=avis force la note).
    if (!forced && navigator.webdriver) return;
    const forceRating = param === "avis";
    let seen = false;
    let asked = false;
    try {
      seen = localStorage.getItem(seenKey(a.id)) === "1";
      asked = localStorage.getItem(RATING_ASKED_KEY) === "1";
    } catch {
      /* stockage indisponible : on affiche */
    }
    const canRate = forceRating || (ratingEligible && !alreadyRated);
    let next: null | "annonce" | "avis" = null;
    if (!seen || forced) next = "annonce";
    else if (canRate && !asked) next = "avis";
    if (!next) return;
    const t = setTimeout(() => {
      setShowRating(canRate);
      setMode(next);
    }, 400);
    return () => clearTimeout(t);
  }, [a.id, ratingEligible, alreadyRated]);

  const close = () => {
    try {
      localStorage.setItem(seenKey(a.id), "1");
      if (showRating) localStorage.setItem(RATING_ASKED_KEY, "1");
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
        className="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-nuit-900 via-[#10264f] to-electrique-600 px-6 pb-6 pt-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-accent/20 blur-2xl" />
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 font-mono text-sm font-bold ring-1 ring-white/20">{"</>"}</span>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-accent">Message de l&apos;administration</p>
              <p className="text-xs text-white/70">UPL CODE ACADEMY MK{date ? ` · ${date}` : ""}</p>
            </div>
          </div>
          <h2 id="annonce-titre" className="mt-4 text-xl font-bold leading-snug sm:text-2xl">
            {mode === "avis" ? "Votre avis compte" : a.title}
          </h2>
          {firstName && <p className="mt-1 text-sm text-white/80">Bonjour {firstName} 👋</p>}
        </div>
        <div className="max-h-[52vh] space-y-3 overflow-y-auto px-6 py-5 text-[15px] leading-relaxed text-gris-700">
          {(mode === "avis"
            ? "Vous utilisez UPL CODE ACADEMY MK depuis une semaine : merci pour votre confiance !\n\nPrenez quelques secondes pour noter la plateforme. Votre avis aide l'équipe à l'améliorer pour tous les étudiants."
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
          <p className="border-t border-gris-200 pt-3 text-sm font-semibold text-nuit-900">{mode === "avis" ? "L'équipe UPL CODE ACADEMY MK" : a.signature}</p>
          {showRating && <RatingBox />}
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
