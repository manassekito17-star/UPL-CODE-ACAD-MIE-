"use client";

import { useEffect, useRef, useState } from "react";
import type { LanguageId, Level } from "@/content/types";
import { Markdown } from "../learning/markdown";
import { Button, cn } from "../ui";

export type TutorMode =
  | "question"
  | "enseigner"
  | "expliquer_code"
  | "analyser_erreur"
  | "indice"
  | "interroger"
  | "generer_exercice"
  | "pseudocode_vs_code"
  | "preparer_evaluation"
  | "mentor_projet";

export const TUTOR_MODES: Array<{ id: TutorMode; label: string; placeholder: string; needsCode?: boolean }> = [
  { id: "question", label: "Poser une question", placeholder: "Ex. : quelle est la différence entre TANT QUE et RÉPÉTER ?" },
  { id: "enseigner", label: "M'enseigner une notion", placeholder: "Ex. : explique-moi les boucles POUR depuis le début" },
  { id: "interroger", label: "M'interroger", placeholder: "Ex. : interroge-moi sur ce chapitre" },
  { id: "mentor_projet", label: "Accompagner mon projet", placeholder: "Ex. : comment découper mon projet en étapes ?" },
  { id: "expliquer_code", label: "Expliquer mon code", placeholder: "Ex. : explique-moi ce programme ligne par ligne", needsCode: true },
  { id: "analyser_erreur", label: "Analyser une erreur", placeholder: "Ex. : pourquoi ai-je cette erreur ?", needsCode: true },
  { id: "indice", label: "Un indice", placeholder: "Ex. : je ne sais pas par où commencer" },
  { id: "generer_exercice", label: "Générer un exercice", placeholder: "Ex. : un exercice sur les boucles POUR" },
  { id: "pseudocode_vs_code", label: "Pseudocode ↔ code", placeholder: "Ex. : comment écrire SELON en Python ?" },
  { id: "preparer_evaluation", label: "Préparer une évaluation", placeholder: "Ex. : interrogation sur les tableaux la semaine prochaine" },
];

export interface TutorContext {
  language?: LanguageId;
  code?: string;
  output?: string;
  error?: string;
  exerciseSlug?: string;
  courseSlug?: string;
  lessonSlug?: string;
  lessonTitle?: string;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function TutorChat({
  getContext,
  baseContext,
  compact = false,
  defaultMode = "question",
  modes,
  className,
  intro,
}: {
  getContext?: () => TutorContext;
  /** Contexte fixe (sérialisable) : parcours, chapitre… */
  baseContext?: TutorContext;
  compact?: boolean;
  defaultMode?: TutorMode;
  modes?: TutorMode[];
  className?: string;
  intro?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TutorMode>(defaultMode);
  const [level, setLevel] = useState<Level>("debutant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [hintLevel, setHintLevel] = useState(1);
  const [remaining, setRemaining] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const l = localStorage.getItem("upl:niveau");
      // Préférence locale lue après le montage (indisponible au rendu serveur).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (l === "debutant" || l === "intermediaire" || l === "avance") setLevel(l);
    } catch {
      /* ignoré */
    }
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const available = TUTOR_MODES.filter((m) => !modes || modes.includes(m.id));
  const current = TUTOR_MODES.find((m) => m.id === mode)!;

  const send = async (text?: string) => {
    const message = (text ?? input).trim() || (mode === "indice" ? "Peux-tu me donner un indice ?" : mode === "expliquer_code" ? "Explique-moi ce code." : "");
    if (!message || loading) return;
    setError(null);
    setInput("");
    const ctx = { ...baseContext, ...(getContext?.() ?? {}) };
    const history = messages.slice(-10);
    setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode, level, conversationId, context: { ...ctx, hintLevel: mode === "indice" ? hintLevel : undefined }, history }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setMessages((m) => m.slice(0, -2));
        setError(data.error ?? "Le professeur IA est indisponible.");
        setInput(message);
        return;
      }
      const cid = res.headers.get("X-Conversation-Id");
      if (cid) setConversationId(cid);
      setRemaining(res.headers.get("X-Remaining-Today"));
      if (mode === "indice") setHintLevel((h) => Math.min(5, h + 1));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        });
      }
    } catch {
      setError("Connexion interrompue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col rounded-xl border border-gris-200 bg-white", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-gris-100 p-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-electrique-600 to-cyan-accent text-sm text-white" aria-hidden>
          IA
        </span>
        <div className="mr-auto">
          <p className="text-sm font-bold text-nuit-900">Professeur IA</p>
          {!compact && <p className="text-xs text-gris-500">Il explique, oriente et donne des indices — sans faire l&apos;exercice à votre place.</p>}
        </div>
        <select
          aria-label="Votre niveau"
          value={level}
          onChange={(e) => {
            setLevel(e.target.value as Level);
            try {
              localStorage.setItem("upl:niveau", e.target.value);
            } catch {
              /* ignoré */
            }
          }}
          className="h-8 rounded-md border border-gris-200 bg-white px-2 text-xs"
        >
          <option value="debutant">Niveau débutant</option>
          <option value="intermediaire">Niveau intermédiaire</option>
          <option value="avance">Niveau avancé</option>
        </select>
      </div>
      <div className="flex gap-1.5 overflow-x-auto border-b border-gris-100 px-3 py-2">
        {available.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
              mode === m.id ? "border-electrique-500 bg-electrique-100 text-electrique-600" : "border-gris-200 text-gris-700 hover:border-electrique-400",
            )}
          >
            {m.label}
            {m.id === "indice" && mode === "indice" ? ` (niveau ${hintLevel})` : ""}
          </button>
        ))}
      </div>
      <div className={cn("min-h-0 flex-1 space-y-4 overflow-y-auto p-4", compact ? "max-h-96" : "min-h-80")}>
        {messages.length === 0 && (
          <div className="rounded-lg bg-gris-50 p-4 text-sm text-gris-700">
            {intro ?? "Bonjour ! Posez-moi une question sur l'algorithmique ou la programmation. Je réponds en français simple et je vous guide pas à pas."}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-electrique-600 px-4 py-2 text-sm text-white whitespace-pre-wrap">
              {m.content}
            </div>
          ) : (
            <div key={i} className="max-w-full rounded-2xl rounded-bl-sm bg-gris-50 px-4 py-3 text-sm">
              {m.content ? <Markdown>{m.content}</Markdown> : <span className="animate-pulse text-gris-500">Le professeur réfléchit…</span>}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>
      {error && <p className="px-4 pb-2 text-sm text-erreur">{error}</p>}
      <form
        className="flex items-end gap-2 border-t border-gris-100 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={compact ? 1 : 2}
          maxLength={4000}
          placeholder={current.placeholder}
          aria-label="Votre message"
          className="min-h-10 flex-1 resize-none rounded-lg border border-gris-200 px-3 py-2 text-sm focus:border-electrique-500 focus:outline-none"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "…" : "Envoyer"}
        </Button>
      </form>
      {remaining !== null && <p className="px-4 pb-2 text-right text-[11px] text-gris-500">{remaining} question(s) restante(s) aujourd&apos;hui</p>}
    </div>
  );
}
