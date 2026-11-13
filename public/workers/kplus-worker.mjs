// Langage K+ dans le navigateur : le vrai moteur K+ (Python) exécuté par Pyodide.
// Fichier servi tel quel (worker de type « module », exigé par Pyodide).
// Le moteur vient de public/workers/kplus-moteur.json (scripts/sync-kplus.mjs).
//
// Messages reçus :
//   { type: "verifier", id, source }            → { type: "verification", id, resultat }
//   { type: "executer", source, stdin }         → { type: "statut" } … { type: "debut" } … { type: "resultat", … }
//       (programme web : le résultat contient aussi « page » : commandes de la page)
//   { type: "tester", source, stdin }           → idem ; un programme web reçoit stdin comme
//       scénario (saisir / cliquer / minuterie) et sa sortie est la description de la page
//   { type: "evenement", id, requete, element, genre, valeurs } → { type: "evenement_fin", requete, resultat }
//   { type: "executer", warmup: true }          → précharge le moteur
const PYODIDE_URL = "https://cdn.jsdelivr.net/npm/pyodide@314.0.7/";

let moteurPromise = null;
function moteur() {
  moteurPromise ??= (async () => {
    const { loadPyodide } = await import(`${PYODIDE_URL}pyodide.mjs`);
    const py = await loadPyodide({ indexURL: PYODIDE_URL });
    const reponse = await fetch("/workers/kplus-moteur.json");
    if (!reponse.ok) throw new Error(`moteur K+ introuvable (HTTP ${reponse.status})`);
    const paquet = await reponse.json();
    py.FS.mkdirTree("/kplus_upl/kplus");
    for (const [nom, contenu] of Object.entries(paquet.fichiers)) py.FS.writeFile(`/kplus_upl/${nom}`, contenu);
    py.runPython("import sys; sys.path.insert(0, '/kplus_upl')");
    return py.pyimport("pont");
  })();
  moteurPromise.catch(() => {
    moteurPromise = null;
  });
  return moteurPromise;
}

self.onmessage = async (e) => {
  const d = e.data;
  let pont;
  try {
    if (d.type === "executer" || d.type === "tester") self.postMessage({ type: "statut", message: "Chargement de K+…" });
    pont = await moteur();
  } catch (x) {
    console.error("[kplus-worker]", x);
    const message = "Impossible de charger K+ dans le navigateur (connexion Internet requise la première fois).";
    if (d.type === "verifier") self.postMessage({ type: "verification", id: d.id, resultat: null });
    else if (d.type === "evenement") self.postMessage({ type: "evenement_fin", requete: d.requete, resultat: { commandes: [], texte_erreur: message } });
    else self.postMessage({ type: "resultat", ok: false, stdout: "", stderr: message, erreur: null });
    return;
  }

  if (d.type === "verifier") {
    self.postMessage({ type: "verification", id: d.id, resultat: JSON.parse(pont.verifier(d.source)) });
    return;
  }
  if (d.type === "evenement") {
    const sortie = [];
    const r = JSON.parse(pont.evenement(d.element, d.genre, JSON.stringify(d.valeurs ?? {}), (genre, texte) => {
      if (genre !== "entree") sortie.push(texte);
    }));
    self.postMessage({ type: "evenement_fin", requete: d.requete, resultat: { ...r, sortie: sortie.join("") } });
    return;
  }
  if (d.warmup) {
    self.postMessage({ type: "resultat", ok: true, stdout: "", stderr: "", erreur: null });
    return;
  }
  self.postMessage({ type: "debut" });
  if (d.type === "tester") {
    const r = JSON.parse(pont.executer_test(d.source, d.stdin ?? ""));
    self.postMessage({
      type: "resultat",
      ok: r.statut === "ok",
      stdout: r.sortie ?? "",
      stderr: r.statut === "scenario" ? `Scénario de test : ${r.message}` : "",
      erreur: r.erreur ?? null,
      timeMs: r.duree_ms,
    });
    return;
  }
  const sortie = [];
  // Les réponses lues par demander() (genre « entree ») ne sont pas réaffichées,
  // comme pour Python dans UPL.
  const envoyer = (genre, texte) => {
    if (genre !== "entree") sortie.push(texte);
  };
  const r = JSON.parse(pont.executer(d.source, d.stdin ?? "", envoyer));
  self.postMessage({
    type: "resultat",
    ok: r.statut === "ok",
    stdout: sortie.join(""),
    stderr: r.statut === "interne" ? String(r.message) : "",
    erreur: r.erreur ?? null,
    timeMs: r.duree_ms,
    page: r.web ? r.commandes : undefined,
  });
};
