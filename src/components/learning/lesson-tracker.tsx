"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui";

/**
 * Enregistre l'ouverture de la leçon (reprise à la dernière position),
 * le temps passé, et permet de marquer la leçon comme terminée.
 */
export function LessonTracker({ courseSlug, lessonSlug, initiallyDone, loggedIn }: { courseSlug: string; lessonSlug: string; initiallyDone: boolean; loggedIn: boolean }) {
  const [done, setDone] = useState(initiallyDone);
  const [saving, setSaving] = useState(false);
  const started = useRef(0);

  const send = (action: "ouvrir" | "terminer", keepalive = false) => {
    const secondsSpent = Math.min(4 * 3600, Math.round((Date.now() - started.current) / 1000));
    started.current = Date.now();
    return fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, lessonSlug, action, secondsSpent }),
      keepalive,
    });
  };

  useEffect(() => {
    started.current = Date.now();
    if (!loggedIn) return;
    send("ouvrir");
    const onHide = () => {
      if (document.visibilityState === "hidden") send("ouvrir", true);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      send("ouvrir", true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, lessonSlug, loggedIn]);

  if (!loggedIn) return <p className="text-sm text-gris-500">Connectez-vous pour enregistrer votre progression.</p>;

  return done ? (
    <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">✓ Leçon terminée</span>
  ) : (
    <Button
      disabled={saving}
      onClick={async () => {
        setSaving(true);
        const r = await send("terminer");
        setSaving(false);
        if (r.ok) setDone(true);
      }}
    >
      {saving ? "Enregistrement…" : "Marquer comme terminée"}
    </Button>
  );
}
