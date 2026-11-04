import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import { firstDifference, normalizeOutput, outputsMatch } from "./compare";
import { bundlePythonFiles } from "./prelude";

describe("comparaison des sorties", () => {
  it("ignore les espaces de fin et les fins de ligne", () => {
    expect(outputsMatch("a  \r\nb\n\n", "a\nb")).toBe(true);
    expect(outputsMatch("a\nc", "a\nb")).toBe(false);
    expect(normalizeOutput("x \n")).toBe("x");
    expect(firstDifference("a\nc", "a\nb")).toEqual({ line: 2, got: "c", want: "b" });
  });
});

describe("Python multi-fichiers", () => {
  const hasPython = spawnSync("which", ["python3"]).status === 0;
  (hasPython ? it : it.skip)("permet d'importer un module secondaire et conserve les numéros de ligne", () => {
    const code = bundlePythonFiles([
      { name: "main.py", content: "import outils\nprint(outils.double(int(input())))\nraise ValueError('ligne 3')" },
      { name: "outils.py", content: "def double(x):\n    return 2 * x\n" },
    ]);
    const dir = spawnSync("mktemp", ["-d"], { encoding: "utf8" }).stdout.trim();
    const r = spawnSync("python3", ["-c", code], { cwd: dir, input: "21\n", encoding: "utf8" });
    expect(r.stdout.trim()).toBe("42");
    expect(r.stderr).toContain('File "main.py", line 3');
  });
});

describe("client Judge0", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("envoie le code en base64 avec les limites et décode la réponse", async () => {
    vi.stubEnv("JUDGE0_URL", "https://judge0.exemple/");
    vi.stubEnv("JUDGE0_AUTH_TOKEN", "jeton");
    let sent: { url: string; body: Record<string, unknown>; headers: Record<string, string> } | null = null;
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      sent = { url, body: JSON.parse(String(init.body)), headers: init.headers as Record<string, string> };
      return new Response(JSON.stringify({ stdout: Buffer.from("Bonjour\n").toString("base64"), stderr: null, compile_output: null, message: null, status: { id: 3, description: "Accepted" }, time: "0.012", memory: 3456 }), { status: 200 });
    });
    const { runOnJudge0 } = await import("./judge0");
    const r = await runOnJudge0({ language: "c", files: [{ name: "main.c", content: "int main(){}" }], stdin: "5" });
    expect(r).toMatchObject({ status: "ok", stdout: "Bonjour\n", timeMs: 12, memoryKb: 3456, engine: "serveur" });
    expect(sent!.url).toBe("https://judge0.exemple/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,compile_output,status,time,memory,message");
    expect(sent!.headers["X-Auth-Token"]).toBe("jeton");
    expect(sent!.body).toMatchObject({ language_id: 50, enable_network: false, cpu_time_limit: 5, memory_limit: 128000 });
    expect(Buffer.from(String(sent!.body.source_code), "base64").toString()).toBe("int main(){}");
    expect(Buffer.from(String(sent!.body.stdin), "base64").toString()).toBe("5");
  });

  it("traduit les erreurs de compilation et les dépassements de temps", async () => {
    vi.stubEnv("JUDGE0_URL", "https://judge0.exemple");
    const responses = [
      { status: { id: 6, description: "Compilation Error" }, compile_output: Buffer.from("main.c:1: error").toString("base64") },
      { status: { id: 5, description: "Time Limit Exceeded" } },
    ];
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ stdout: null, stderr: null, compile_output: null, message: null, time: null, memory: null, ...responses.shift() })));
    const { runOnJudge0 } = await import("./judge0");
    const a = await runOnJudge0({ language: "c", files: [{ name: "main.c", content: "x" }], stdin: "" });
    expect(a.status).toBe("erreur_compilation");
    expect(a.compileOutput).toContain("error");
    const b = await runOnJudge0({ language: "java", files: [{ name: "Main.java", content: "x" }], stdin: "" });
    expect(b.status).toBe("temps_depasse");
  });
});
