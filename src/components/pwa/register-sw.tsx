"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/offline/client";

/** Service worker enregistré sur tout le site : la plateforme et UPL IDE peuvent s'installer sur le téléphone. */
export function RegisterServiceWorker() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);
  return null;
}
