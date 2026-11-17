"use client";

import { useEffect } from "react";
import { autoPrepareOffline, registerServiceWorker } from "@/lib/offline/client";

/**
 * Service worker enregistré sur tout le site : la plateforme et ses éditeurs s'installent sur le
 * téléphone. Étudiant connecté : les éditeurs sont gardés automatiquement pour une utilisation sans
 * Internet (en arrière-plan, quelques secondes après l'ouverture de la page).
 */
export function RegisterServiceWorker({ loggedIn = false }: { loggedIn?: boolean }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    void registerServiceWorker().then((reg) => {
      if (reg) timer = setTimeout(() => void autoPrepareOffline(loggedIn), 6000);
    });
    return () => clearTimeout(timer);
  }, [loggedIn]);
  return null;
}
