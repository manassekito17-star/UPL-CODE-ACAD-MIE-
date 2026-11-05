/**
 * Génère supabase/seed.sql à partir du contenu versionné (src/content).
 * Usage : npm run seed:generate
 *
 * Le script est idempotent : il met à jour les cours, modules, leçons,
 * exercices, tests, solutions et quiz existants (par slug).
 */
import { writeFileSync } from "node:fs";
import { staticCourses, staticExercises } from "../src/content";

const q = (s: string | null | undefined) => (s === null || s === undefined ? "null" : `'${s.replace(/'/g, "''")}'`);
const arr = (a: string[] = []) => (a.length ? `array[${a.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const json = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;

const out: string[] = [
  "-- Fichier généré par scripts/generate-seed.ts — ne pas modifier à la main.",
  "-- Contenu pédagogique de référence d'UPL Code Academy.",
  "begin;",
];

staticCourses.forEach((c, ci) => {
  out.push(`\n-- ===== ${c.title} =====`);
  out.push(
    `insert into public.courses (slug, language_id, category_id, code, title, tagline, description, level, prerequisites, objectives, duration_hours, status, sort_order, validated_at)
values (${q(c.slug)}, ${q(c.language)}, (select id from public.course_categories where slug = ${q(c.category)}), ${q(c.code)}, ${q(c.title)}, ${q(c.tagline)}, ${q(c.description)}, ${q(c.level)}, ${arr(c.prerequisites)}, ${arr(c.objectives)}, ${c.durationHours}, ${q(c.status)}, ${ci + 1}, ${c.status === "publie" ? "now()" : "null"})
on conflict (slug) do update set language_id = excluded.language_id, category_id = excluded.category_id, code = excluded.code, title = excluded.title, tagline = excluded.tagline, description = excluded.description, level = excluded.level, prerequisites = excluded.prerequisites, objectives = excluded.objectives, duration_hours = excluded.duration_hours, status = excluded.status, sort_order = excluded.sort_order;`,
  );
  const course = `(select id from public.courses where slug = ${q(c.slug)})`;
  c.modules.forEach((m, mi) => {
    out.push(
      `insert into public.modules (course_id, slug, title, description, position, level_number) values (${course}, ${q(m.slug)}, ${q(m.title)}, ${q(m.description ?? null)}, ${mi + 1}, ${m.level ?? "null"})
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position, level_number = excluded.level_number;`,
    );
    const mod = `(select id from public.modules where course_id = ${course} and slug = ${q(m.slug)})`;
    m.lessons.forEach((l, li) => {
      // La structure pédagogique est stockée sans les quiz (qui ont leurs propres tables).
      const pedagogy = l.pedagogy ? (({ interrogation: _i, evaluation: _e, ...rest }) => (void _i, void _e, rest))(l.pedagogy) : null;
      out.push(
        `insert into public.lessons (module_id, course_id, slug, title, level, duration_minutes, objectives, prerequisites, content, summary, examples, pedagogy, status, position, validated_at)
values (${mod}, ${course}, ${q(l.slug)}, ${q(l.title)}, ${q(l.level)}, ${l.durationMinutes}, ${arr(l.objectives)}, ${arr(l.prerequisites)}, ${q(l.content)}, ${arr(l.summary)}, ${json(l.examples)}, ${pedagogy ? json(pedagogy) : "null"}, ${q(l.status)}, ${li + 1}, ${l.status === "publie" ? "now()" : "null"})
on conflict (course_id, slug) do update set module_id = excluded.module_id, title = excluded.title, level = excluded.level, duration_minutes = excluded.duration_minutes, objectives = excluded.objectives, prerequisites = excluded.prerequisites, content = excluded.content, summary = excluded.summary, examples = excluded.examples, pedagogy = excluded.pedagogy, status = excluded.status, position = excluded.position;`,
      );
      const lessonRef = `(select id from public.lessons where course_id = ${course} and slug = ${q(l.slug)})`;
      if (l.quiz) quizSql(l.quiz, course, lessonRef, false, "verification");
      if (l.pedagogy?.interrogation) quizSql(l.pedagogy.interrogation, course, lessonRef, false, "interrogation");
      if (l.pedagogy?.evaluation) quizSql(l.pedagogy.evaluation, course, lessonRef, false, "evaluation");
    });
  });
  // Modules réorganisés en niveaux : les anciens modules devenus vides sont supprimés
  // (un module contenant encore une leçon, par exemple créée dans l'administration, est conservé).
  out.push(
    `delete from public.modules m where m.course_id = ${course} and m.slug not in (${c.modules.map((m) => q(m.slug)).join(", ")}) and not exists (select 1 from public.lessons l where l.module_id = m.id);`,
  );
  for (const lv of c.levels ?? []) {
    out.push(
      `insert into public.course_levels (course_id, number, title, description, objectives, planned_chapters, chapters_validated_pct, exam_pass_score) values (${course}, ${lv.number}, ${q(lv.title)}, ${q(lv.description)}, ${arr(lv.objectives)}, ${arr(lv.plannedChapters)}, ${lv.criteria.chaptersValidatedPct}, ${lv.criteria.examPassScore})
on conflict (course_id, number) do update set title = excluded.title, description = excluded.description, objectives = excluded.objectives, planned_chapters = excluded.planned_chapters, chapters_validated_pct = excluded.chapters_validated_pct, exam_pass_score = excluded.exam_pass_score;`,
    );
    if (lv.exam) quizSql(lv.exam, course, "null", false, "examen_niveau", lv.number);
  }
  if (c.placementTest) quizSql(c.placementTest, course, "null", false, "positionnement");
  if (c.finalQuiz) quizSql(c.finalQuiz, course, "null", true, "verification");
});

function quizSql(quiz: NonNullable<(typeof staticCourses)[number]["finalQuiz"]>, course: string, lesson: string, isFinal: boolean, kind: string, level?: number) {
  out.push(
    `insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes, level_number) values (${course}, ${lesson}, ${q(quiz.slug)}, ${q(quiz.title)}, ${isFinal}, ${quiz.passScore}, 'publie', ${q(kind)}, ${quiz.durationMinutes ?? "null"}, ${level ?? "null"})
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes, level_number = excluded.level_number;`,
    `delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = ${q(quiz.slug)});`,
  );
  quiz.questions.forEach((qq, i) => {
    out.push(
      `with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position, level_number) values ((select id from public.quizzes where slug = ${q(quiz.slug)}), ${q(qq.type)}, ${q(qq.prompt)}, ${q(qq.code ?? null)}, ${json(qq.choices)}, ${i}, ${qq.level ?? "null"}) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, ${json(qq.correct)}, ${q(qq.explanation ?? null)} from qq;`,
    );
  });
}

out.push("\n-- ===== Exercices =====");
staticExercises.forEach((e, i) => {
  const course = `(select id from public.courses where slug = ${q(e.courseSlug)})`;
  const lesson = e.lessonSlug ? `(select id from public.lessons where course_id = ${course} and slug = ${q(e.lessonSlug)})` : "null";
  out.push(
    `insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position, starter_files, active_file)
values (${q(e.slug)}, ${course}, ${lesson}, ${q(e.language)}, ${q(e.title)}, ${q(e.statement)}, ${q(e.difficulty)}, ${q(e.type)}, ${arr(e.objectives)}, ${json(e.examples)}, ${arr(e.constraints)}, ${q(e.starterCode)}, ${arr(e.hints)}, ${e.points ?? 10}, ${Boolean(e.isEvaluated)}, ${q(e.status)}, ${i + 1}, ${e.starterFiles ? json(e.starterFiles) : "null"}, ${q(e.activeFile ?? null)})
on conflict (slug) do update set starter_files = excluded.starter_files, active_file = excluded.active_file, course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;`,
  );
  const ex = `(select id from public.exercises where slug = ${q(e.slug)})`;
  out.push(`delete from public.exercise_test_cases where exercise_id = ${ex};`);
  e.tests.forEach((t, k) => {
    out.push(
      `insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position, "check") values (${ex}, ${q(t.description ?? null)}, ${q(t.input)}, ${q(t.expected)}, ${Boolean(t.hidden)}, ${t.weight ?? 1}, ${k}, ${t.check ? json(t.check) : "null"});`,
    );
  });
  out.push(
    `insert into public.exercise_solutions (exercise_id, solution_code, correction) values (${ex}, ${q(e.solution)}, ${q(e.correction)})
on conflict (exercise_id) do update set solution_code = excluded.solution_code, correction = excluded.correction, updated_at = now();`,
  );
});

out.push("commit;\n");
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), out.join("\n"));
console.log(`seed.sql généré : ${staticCourses.length} cours, ${staticExercises.length} exercices.`);
