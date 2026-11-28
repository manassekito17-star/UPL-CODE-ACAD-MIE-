"use client";

import { useEffect } from "react";
import { DEFAULT_START, readResume, target, type ResumeApp } from "@/lib/resume";

/** Redirige tout de suite vers la dernière page de travail (ou la page de départ de l'application). */
export function Resume() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("app");
    const app: ResumeApp = p === "ide" || p === "editeur" ? p : "site";
    try {
      sessionStorage.setItem("zentech:session", "1");
    } catch {
      /* stockage indisponible */
    }
    window.location.replace(target(readResume(), app === "site" ? null : app, Date.now()) ?? DEFAULT_START[app]);
  }, []);
  return (
    <div className="grid min-h-[60vh] place-items-center p-6 text-center text-gris-600" data-testid="reprendre">
      <p>Ouverture de votre travail…</p>
    </div>
  );
}
