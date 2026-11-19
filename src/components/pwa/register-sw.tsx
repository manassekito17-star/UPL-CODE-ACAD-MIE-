"use client";

import { useEffect } from "react";
import { autoPrepareOffline, keepSavedFilesOffline, registerServiceWorker } from "@/lib/offline/client";

/**
 * Service worker enregistré sur tout le site : la plateforme et ses éditeurs s'installent sur le
 * téléphone. Étudiant connecté : les éditeurs sont téléchargés automatiquement sur le téléphone (et de nouveau au retour d'Internet s'il en manque) pour une utilisation sans
 * Internet (en arrière-plan, quelques secondes après l'ouverture de la page).
 */
export function RegisterServiceWorker({ loggedIn = false }: { loggedIn?: boolean }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Retour d'Internet : les éditeurs qui manquent encore sont téléchargés automatiquement.
    const onOnline = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void autoPrepareOffline(loggedIn, { resume: true }).then(() => keepSavedFilesOffline(loggedIn)), 3000);
    };
    void registerServiceWorker().then((reg) => {
      if (!reg) return;
      // Éditeurs d'abord, puis les fichiers sauvegardés du compte.
      timer = setTimeout(() => void autoPrepareOffline(loggedIn).then(() => keepSavedFilesOffline(loggedIn)), 3000);
      window.addEventListener("online", onOnline);
    });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [loggedIn]);
  return null;
}
