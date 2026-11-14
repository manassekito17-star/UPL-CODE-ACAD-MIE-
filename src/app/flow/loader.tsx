"use client";

import dynamic from "next/dynamic";

/** Le studio (canevas React Flow) ne s'affiche que dans le navigateur. */
export const FlowStudioLoader = dynamic(() => import("@/components/flow/flow-studio").then((m) => m.FlowStudio), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-40 grid place-items-center bg-[#1e1f22] text-sm text-gray-300">Chargement de UPL Flow Studio…</div>,
});
