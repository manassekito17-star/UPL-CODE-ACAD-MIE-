"use client";

import { useEffect, useState } from "react";

const LABELS = ["", "Très insuffisant", "Insuffisant", "Correct", "Très bien", "Excellent"];

/** Note de la plateforme sur 5 étoiles, avec commentaire facultatif (un avis par utilisateur, modifiable). */
export function RatingBox() {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [already, setAlready] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/avis", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { rating?: { stars: number; comment: string } | null } | null) => {
        if (!alive || !b?.rating) return;
        setStars(b.rating.stars);
        setComment(b.rating.comment);
        setAlready(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const send = async () => {
    if (!stars) return;
    setState("sending");
    try {
      const res = await fetch("/api/avis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stars, comment }) });
      if (res.ok) {
        setState("sent");
        return;
      }
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(b.error ?? "Envoi impossible pour le moment.");
      setState("error");
    } catch {
      setMessage("Pas de connexion Internet.");
      setState("error");
    }
  };

  if (state === "sent")
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center" data-testid="avis-merci">
        <p className="text-2xl" aria-hidden>
          {"★".repeat(stars)}
        </p>
        <p className="mt-1 font-semibold text-nuit-900">Merci pour votre avis !</p>
        <p className="text-sm text-gris-700">Il aide l&apos;équipe à améliorer la plateforme.</p>
      </div>
    );

  const shown = hover || stars;
  return (
    <div className="rounded-xl border border-gris-200 bg-gris-50 p-4" data-testid="avis">
      <p className="text-sm font-semibold text-nuit-900">{already ? "Votre avis sur la plateforme (modifiable)" : "Que pensez-vous de la plateforme ?"}</p>
      <p className="text-xs text-gris-500">Notez UPL CODE ACADEMY MK sur 5 étoiles.</p>
      <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Note sur 5 étoiles" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} étoile${n > 1 ? "s" : ""} — ${LABELS[n]}`}
            data-testid={`etoile-${n}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setStars(n)}
            className={`text-3xl leading-none transition-transform hover:scale-110 sm:text-[34px] ${n <= shown ? "text-amber-400" : "text-gris-200"}`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gris-700">{shown ? LABELS[shown] : ""}</span>
      </div>
      {stars > 0 && (
        <>
          <label className="mt-3 block text-xs font-medium text-gris-700" htmlFor="avis-commentaire">
            Un commentaire ou une suggestion ? (facultatif)
          </label>
          <textarea
            id="avis-commentaire"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            rows={2}
            maxLength={1000}
            className="mt-1 w-full rounded-lg border border-gris-200 bg-white px-3 py-2 text-sm text-nuit-900 outline-none focus:border-electrique-500"
            placeholder="Ce que vous aimez, ce qu'il faudrait améliorer…"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            {state === "error" ? <p className="text-xs text-red-600">{message}</p> : <span />}
            <button
              type="button"
              onClick={send}
              disabled={state === "sending"}
              data-testid="avis-envoyer"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              {state === "sending" ? "Envoi…" : already ? "Mettre à jour mon avis" : "Envoyer mon avis"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
