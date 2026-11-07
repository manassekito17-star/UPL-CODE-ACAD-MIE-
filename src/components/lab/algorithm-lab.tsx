"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateFlowcharts } from "@/lib/pseudocode/flowchart";
import type { TraceResult, TraceStep } from "@/lib/pseudocode";
import { TutorChat } from "../tutor/tutor-chat";
import { Button, cn } from "../ui";

const CodeEditor = dynamic(() => import("../editor/code-editor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-nuit-950 text-sm text-gray-400">Chargement de l&apos;éditeur…</div>,
});

export interface LabPreset {
  id: string;
  title: string;
  group: string;
  code: string;
  stdin: string;
  back?: string;
}

const MAX_STEPS = 3000;
const TIMEOUT_MS = 8000;
const SPEEDS = [
  { label: "Lent", ms: 1400 },
  { label: "Normal", ms: 700 },
  { label: "Rapide", ms: 250 },
];
const MISSING_INPUT = /^Aucune donnée disponible pour LIRE\((.+)\)\.$/;

type LabResult = TraceResult & { timeMs: number };

/** Calcule la trace détaillée dans un Web Worker (arrêt forcé au-delà du délai). */
function computeTrace(code: string, stdin: string): Promise<LabResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../../workers/trace.worker.ts", import.meta.url), { type: "module" });
    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error("Exécution trop longue : vérifiez qu'une boucle se termine bien."));
    }, TIMEOUT_MS);
    worker.onmessage = (e: MessageEvent<LabResult>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      reject(new Error(e.message || "Erreur du laboratoire."));
    };
    worker.postMessage({ code, stdin, maxSteps: MAX_STEPS });
  });
}

const KIND_LABELS: Record<string, string> = {
  assign: "Affectation",
  write: "Écriture (ECRIRE)",
  read: "Lecture (LIRE)",
  if: "Condition (SI)",
  for: "Boucle POUR",
  while: "Boucle TANT QUE",
  repeat: "Boucle RÉPÉTER",
  switch: "Choix multiple (SELON)",
  return: "Retour (RETOURNER)",
  call: "Appel de procédure",
  fin: "Fin de l'algorithme",
};

export function AlgorithmLab({ presets, initial, loggedIn }: { presets: LabPreset[]; initial?: LabPreset; loggedIn: boolean }) {
  const [code, setCode] = useState(initial?.code ?? presets[0]?.code ?? "");
  const [stdin, setStdin] = useState(initial?.stdin ?? presets[0]?.stdin ?? "");
  const [presetId, setPresetId] = useState(initial?.id ?? presets[0]?.id ?? "");
  const [result, setResult] = useState<LabResult | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(SPEEDS[1].ms);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingInput, setPendingInput] = useState("");
  const [showTutor, setShowTutor] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);

  const trace = useMemo(() => result?.trace ?? [], [result]);
  const step: TraceStep | undefined = trace[idx];
  const prev: TraceStep | undefined = idx > 0 ? trace[idx - 1] : undefined;
  const atEnd = trace.length > 0 && idx === trace.length - 1;
  const missingInput = result && !result.ok && result.error ? result.error.message.match(MISSING_INPUT)?.[1] : undefined;
  const back = presets.find((p) => p.id === presetId)?.back ?? initial?.back;

  const flowcharts = useMemo(() => {
    const r = generateFlowcharts(code);
    return r.ok ? r.charts : [];
  }, [code]);

  const run = useCallback(
    async (input: string, keepIndex?: number) => {
      setBusy(true);
      setError(null);
      setPlaying(false);
      try {
        const r = await computeTrace(code, input);
        if (r.error?.kind === "syntaxe") {
          setResult(null);
          setError(`Erreur de syntaxe${r.error.line ? ` (ligne ${r.error.line})` : ""} : ${r.error.message}${r.error.hint ? ` — ${r.error.hint}` : ""}`);
          return;
        }
        setResult(r);
        setIdx(keepIndex !== undefined ? Math.min(keepIndex, r.trace.length - 1) : 0);
      } catch (e) {
        setResult(null);
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [code],
  );

  // Lecture automatique
  useEffect(() => {
    if (!playing) return;
    if (idx >= trace.length - 1) {
      // Fin de trace : on arrête la lecture (après le rendu de la dernière étape).
      const t = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, trace.length - 1)), speed);
    return () => clearTimeout(t);
  }, [playing, idx, trace.length, speed]);

  // Organigramme synchronisé : bloc de la ligne courante mis en évidence
  useEffect(() => {
    const root = flowRef.current;
    if (!root) return;
    root.querySelectorAll("g.upl-actif").forEach((g) => g.classList.remove("upl-actif"));
    if (!step) return;
    const nodes = root.querySelectorAll(`g[data-ligne="${step.line}"]`);
    nodes.forEach((g) => g.classList.add("upl-actif"));
    // Défilement limité à la zone de l'organigramme (la page ne bouge pas).
    const node = nodes[0] as SVGGElement | undefined;
    if (node) {
      const box = node.getBoundingClientRect();
      const area = root.getBoundingClientRect();
      if (box.top < area.top || box.bottom > area.bottom) root.scrollTop += box.top - area.top - area.height / 2 + box.height / 2;
      if (box.left < area.left || box.right > area.right) root.scrollLeft += box.left - area.left - area.width / 2 + box.width / 2;
    }
  }, [step, flowcharts]);

  // Raccourcis clavier (hors champs de saisie et éditeur)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!result || t.closest("textarea, input, select, .monaco-editor")) return;
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, trace.length - 1));
      else if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, trace.length]);

  const edit = (v: string) => {
    setCode(v);
    if (result) {
      setResult(null);
      setPlaying(false);
    }
  };

  const choosePreset = (id: string) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setCode(p.code);
    setStdin(p.stdin);
    setResult(null);
    setError(null);
    setPlaying(false);
  };

  // Saisie interactive : la valeur est ajoutée aux entrées, la trace est recalculée
  // (l'exécution est déterministe) et l'on reprend à la même étape.
  const provideInput = () => {
    if (!pendingInput.trim()) return;
    const next = `${stdin}${stdin && !stdin.endsWith("\n") ? "\n" : ""}${pendingInput.trim()}`;
    setStdin(next);
    setPendingInput("");
    void run(next, idx);
  };

  const varNames = step?.variables ?? [];
  const changed = (name: string, value: string) => {
    if (!prev) return false;
    const before = prev.variables.find((v) => v.name === name);
    return !before || before.value !== value;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gris-500">Algorithme</span>
          <select value={presetId} onChange={(e) => choosePreset(e.target.value)} className="h-10 max-w-[22rem] rounded-md border border-gris-200 bg-white px-2 text-sm" aria-label="Choisir un algorithme">
            {[...new Set(presets.map((p) => p.group))].map((g) => (
              <optgroup key={g} label={g}>
                {presets.filter((p) => p.group === g).map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {back && (
          <Link href={back} className="pb-2 text-sm font-medium text-electrique-600 hover:underline" data-testid="retour-cours">
            ← Retour au cours
          </Link>
        )}
        <p className="ml-auto pb-2 text-xs text-gris-500">Flèches ← → : étape précédente / suivante · Espace : lecture / pause</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Code et entrées */}
        <div className="space-y-3">
          <div className="h-[26rem] overflow-hidden rounded-xl border border-nuit-800 bg-nuit-950">
            <CodeEditor language="pseudocode" value={code} onChange={edit} path="laboratoire/algorithme.algo" highlightLine={step?.line ?? null} />
          </div>
          <div>
            <label htmlFor="lab-stdin" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gris-500">Entrées pour LIRE (une valeur par ligne, facultatif)</label>
            <textarea id="lab-stdin" rows={2} value={stdin} onChange={(e) => { setStdin(e.target.value); setResult(null); }} className="w-full rounded-md border border-gris-200 px-3 py-2 font-mono text-sm" placeholder="Laissez vide : le laboratoire vous demandera chaque valeur au moment du LIRE." />
          </div>

          {/* Commandes */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gris-200 bg-white p-3" role="toolbar" aria-label="Exécution pas à pas">
            {!result ? (
              <Button onClick={() => run(stdin)} disabled={busy || !code.trim()}>
                {busy ? "Analyse…" : "▶ Lancer l'exécution pas à pas"}
              </Button>
            ) : (
              <>
                <Button size="sm" variant="secondaire" onClick={() => { setPlaying(false); setIdx(0); }} disabled={idx === 0} aria-label="Première étape">⏮</Button>
                <Button size="sm" variant="secondaire" onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }} disabled={idx === 0} aria-label="Reculer">◀ Reculer</Button>
                <Button size="sm" onClick={() => setPlaying((p) => !p)} disabled={atEnd} aria-label={playing ? "Pause" : "Lecture"}>{playing ? "⏸ Pause" : "▶ Lecture"}</Button>
                <Button size="sm" variant="secondaire" onClick={() => { setPlaying(false); setIdx((i) => Math.min(trace.length - 1, i + 1)); }} disabled={atEnd} aria-label="Avancer">Avancer ▶</Button>
                <Button size="sm" variant="secondaire" onClick={() => { setPlaying(false); setIdx(trace.length - 1); }} disabled={atEnd} aria-label="Dernière étape">⏭</Button>
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Vitesse" className="h-8 rounded-md border border-gris-200 bg-white px-2 text-xs">
                  {SPEEDS.map((s) => <option key={s.ms} value={s.ms}>{s.label}</option>)}
                </select>
                <Button size="sm" variant="fantome" onClick={() => { setResult(null); setPlaying(false); setIdx(0); }}>Réinitialiser</Button>
                <span className="ml-auto text-sm font-semibold text-nuit-900" data-testid="lab-etape">
                  Étape {idx + 1} / {trace.length}
                </span>
                <input type="range" min={0} max={Math.max(0, trace.length - 1)} value={idx} onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }} className="w-full" aria-label="Position dans l'exécution" />
              </>
            )}
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}
          {missingInput && !atEnd && (
            <p className="text-xs text-amber-800" data-testid="lab-annonce-lire">
              À l&apos;étape {trace.length}, LIRE({missingInput}) vous demandera une valeur : avancez jusque-là (⏭ pour y aller directement).
            </p>
          )}
                    {result?.truncated && <p className="text-xs text-amber-700">Trace limitée aux {MAX_STEPS} premières étapes.</p>}
        </div>

        {/* État de l'exécution */}
        <div className="space-y-3">
          {step ? (
            <>
              <div className="rounded-xl border border-cyan-accent/50 bg-cyan-soft/40 p-4" aria-live="polite" data-testid="lab-explication">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
                  Ligne {step.line} · {KIND_LABELS[step.kind] ?? step.kind}
                  {step.decision !== undefined && <span className={cn("ml-2 rounded px-1.5 py-0.5 text-[10px]", step.decision ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>{step.decision ? "VRAI" : "FAUX"}</span>}
                </p>
                <p className="mt-1 text-sm text-nuit-900">{step.note ?? (step.kind === "fin" ? (result?.ok ? "L'algorithme est terminé." : "L'exécution s'arrête à cette ligne.") : "Instruction exécutée à l'étape suivante. Les variables ci-dessous montrent l'état juste avant.")}</p>
                {atEnd && result && !result.ok && result.error && !missingInput && (
                  <p className="mt-2 text-sm font-medium text-red-800">Erreur d&apos;exécution (ligne {result.error.line}) : {result.error.message}{result.error.hint ? ` — ${result.error.hint}` : ""}</p>
                )}
              </div>

              {atEnd && missingInput && (
                <form className="flex flex-wrap items-end gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3" onSubmit={(e) => { e.preventDefault(); provideInput(); }} data-testid="lab-saisie">
                  <label className="flex-1 text-sm text-amber-900">
                    <span className="mb-1 block font-semibold">LIRE({missingInput}) attend une valeur :</span>
                    <input autoFocus value={pendingInput} onChange={(e) => setPendingInput(e.target.value)} className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-sm" aria-label={`Valeur pour ${missingInput}`} />
                  </label>
                  <Button type="submit" size="sm" disabled={busy}>Valider</Button>
                </form>
              )}

              <div className="rounded-xl border border-gris-200 bg-white p-4">
                <h3 className="mb-2 text-sm font-bold text-nuit-900">Variables</h3>
                {varNames.length ? (
                  <table className="w-full text-sm" data-testid="lab-variables">
                    <thead className="text-left text-xs uppercase text-gris-500">
                      <tr><th className="py-1">Nom</th><th>Type</th><th>Valeur</th></tr>
                    </thead>
                    <tbody>
                      {varNames.map((v) => (
                        <tr key={v.name} className={cn("border-t border-gris-100 transition-colors", changed(v.name, v.value) && "bg-amber-50")}>
                          <td className="py-1 font-mono">{v.name}</td>
                          <td className="text-xs text-gris-500">{v.type}</td>
                          <td className={cn("font-mono", changed(v.name, v.value) && "font-bold text-amber-800")}>{v.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gris-500">Aucune variable déclarée.</p>
                )}
                <p className="mt-2 text-xs text-gris-500">« ? » : pas encore de valeur · surligné : valeur modifiée par l&apos;étape précédente.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gris-200 bg-white p-4">
                  <h3 className="mb-2 text-sm font-bold text-nuit-900">Pile d&apos;appels</h3>
                  <ol className="space-y-1 font-mono text-xs" data-testid="lab-pile">
                    {[...step.stack].reverse().map((f, i) => (
                      <li key={i} className={cn("rounded px-2 py-1", i === 0 ? "bg-electrique-100 text-electrique-600" : "bg-gris-50 text-gris-700")}>{f}</li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-xl border border-gris-200 bg-white p-4">
                  <h3 className="mb-2 text-sm font-bold text-nuit-900">Sortie</h3>
                  <pre className="max-h-40 min-h-12 overflow-auto whitespace-pre-wrap rounded bg-nuit-950 p-2 font-mono text-xs text-gray-100" data-testid="lab-sortie">{step.output || " "}</pre>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gris-300 bg-white p-6 text-sm text-gris-700">
              <p className="font-semibold text-nuit-900">Comment utiliser le laboratoire</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Choisissez un algorithme du cours ou écrivez le vôtre.</li>
                <li>Lancez l&apos;exécution pas à pas, puis avancez, reculez ou lancez la lecture automatique.</li>
                <li>Observez la ligne exécutée, l&apos;organigramme, les variables, la pile d&apos;appels et la sortie.</li>
                <li>Si l&apos;algorithme lit une valeur, le laboratoire vous la demande au bon moment.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Organigramme synchronisé */}
      <div className="rounded-xl border border-gris-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-bold text-nuit-900">Organigramme {step && <span className="font-normal text-gris-500">— le bloc de l&apos;étape courante est encadré en orange</span>}</h3>
        {flowcharts.length ? (
          <div ref={flowRef} className="upl-organigramme flex max-h-[32rem] gap-6 overflow-auto" data-testid="lab-organigramme">
            {flowcharts.map((f) => (
              // SVG produit par la plateforme : tout le texte y est échappé.
              <figure key={f.title} className="shrink-0">
                <div dangerouslySetInnerHTML={{ __html: f.svg }} />
                <figcaption className="mt-1 text-xs text-gris-500">{f.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gris-500">L&apos;organigramme s&apos;affiche dès que l&apos;algorithme est syntaxiquement correct.</p>
        )}
      </div>

      {/* Professeur IA */}
      <div>
        {!showTutor ? (
          <Button variant="secondaire" onClick={() => setShowTutor(true)}>🎓 Faire expliquer cet algorithme par le professeur IA</Button>
        ) : loggedIn ? (
          <TutorChat
            compact
            defaultMode="expliquer_code"
            modes={["expliquer_code", "analyser_erreur", "question", "interroger"]}
            baseContext={{ courseSlug: "algorithmique", language: "pseudocode" }}
            getContext={() => ({
              code,
              output: step?.output,
              error: result?.error && !missingInput ? `Ligne ${result.error.line} : ${result.error.message}` : undefined,
            })}
            intro="Je peux expliquer l'algorithme du laboratoire ligne par ligne, analyser une erreur ou vous interroger sur son déroulement."
          />
        ) : (
          <p className="text-sm text-gris-700">
            <Link href="/connexion?suite=/laboratoire" className="text-electrique-600 underline">Connectez-vous</Link> pour faire expliquer l&apos;algorithme par le professeur IA.
          </p>
        )}
      </div>
    </div>
  );
}
