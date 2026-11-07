import { describe, expect, it } from "vitest";
import { staticCourses } from "@/content";
import { parsePedagogy } from "./pedagogy-schema";

describe("validation de la structure pédagogique (administration)", () => {
  it("accepte la structure de chaque chapitre de référence", () => {
    for (const c of staticCourses) for (const m of c.modules) for (const l of m.lessons) {
      if (!l.pedagogy) continue;
      const { interrogation: _i, evaluation: _e, ...rest } = l.pedagogy;
      void _i;
      void _e;
      const r = parsePedagogy(JSON.stringify(rest));
      expect(r.ok, `${l.slug} : ${!r.ok && r.error}`).toBe(true);
    }
  });
  it("rejette un JSON invalide ou un champ inconnu", () => {
    expect(parsePedagogy("{").ok).toBe(false);
    expect(parsePedagogy(JSON.stringify({ competences: [], definitions: [], commentedAlgorithms: [], commonErrors: [], solvedExercises: [], pirate: 1 })).ok).toBe(false);
    expect(parsePedagogy("").ok).toBe(true);
  });
});
