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
      `insert into public.modules (course_id, slug, title, description, position) values (${course}, ${q(m.slug)}, ${q(m.title)}, ${q(m.description ?? null)}, ${mi + 1})
on conflict (course_id, slug) do update set title = excluded.title, description = excluded.description, position = excluded.position;`,
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
  if (c.finalQuiz) quizSql(c.finalQuiz, course, "null", true, "verification");
});

function quizSql(quiz: NonNullable<(typeof staticCourses)[number]["finalQuiz"]>, course: string, lesson: string, isFinal: boolean, kind: string) {
  out.push(
    `insert into public.quizzes (course_id, lesson_id, slug, title, is_final, pass_score, status, kind, duration_minutes) values (${course}, ${lesson}, ${q(quiz.slug)}, ${q(quiz.title)}, ${isFinal}, ${quiz.passScore}, 'publie', ${q(kind)}, ${quiz.durationMinutes ?? "null"})
on conflict (slug) do update set title = excluded.title, is_final = excluded.is_final, pass_score = excluded.pass_score, lesson_id = excluded.lesson_id, kind = excluded.kind, duration_minutes = excluded.duration_minutes;`,
    `delete from public.quiz_questions where quiz_id = (select id from public.quizzes where slug = ${q(quiz.slug)});`,
  );
  quiz.questions.forEach((qq, i) => {
    out.push(
      `with qq as (insert into public.quiz_questions (quiz_id, type, prompt, code, choices, position) values ((select id from public.quizzes where slug = ${q(quiz.slug)}), ${q(qq.type)}, ${q(qq.prompt)}, ${q(qq.code ?? null)}, ${json(qq.choices)}, ${i}) returning id)
insert into public.quiz_answer_keys (question_id, correct, explanation) select id, ${json(qq.correct)}, ${q(qq.explanation ?? null)} from qq;`,
    );
  });
}

out.push("\n-- ===== Exercices =====");
staticExercises.forEach((e, i) => {
  const course = `(select id from public.courses where slug = ${q(e.courseSlug)})`;
  const lesson = e.lessonSlug ? `(select id from public.lessons where course_id = ${course} and slug = ${q(e.lessonSlug)})` : "null";
  out.push(
    `insert into public.exercises (slug, course_id, lesson_id, language_id, title, statement, difficulty, type, objectives, examples, constraints, starter_code, hints, points, is_evaluated, status, position)
values (${q(e.slug)}, ${course}, ${lesson}, ${q(e.language)}, ${q(e.title)}, ${q(e.statement)}, ${q(e.difficulty)}, ${q(e.type)}, ${arr(e.objectives)}, ${json(e.examples)}, ${arr(e.constraints)}, ${q(e.starterCode)}, ${arr(e.hints)}, ${e.points ?? 10}, ${Boolean(e.isEvaluated)}, ${q(e.status)}, ${i + 1})
on conflict (slug) do update set course_id = excluded.course_id, lesson_id = excluded.lesson_id, language_id = excluded.language_id, title = excluded.title, statement = excluded.statement, difficulty = excluded.difficulty, type = excluded.type, objectives = excluded.objectives, examples = excluded.examples, constraints = excluded.constraints, starter_code = excluded.starter_code, hints = excluded.hints, points = excluded.points, is_evaluated = excluded.is_evaluated, status = excluded.status, position = excluded.position;`,
  );
  const ex = `(select id from public.exercises where slug = ${q(e.slug)})`;
  out.push(`delete from public.exercise_test_cases where exercise_id = ${ex};`);
  e.tests.forEach((t, k) => {
    out.push(
      `insert into public.exercise_test_cases (exercise_id, description, input, expected_output, is_hidden, weight, position) values (${ex}, ${q(t.description ?? null)}, ${q(t.input)}, ${q(t.expected)}, ${Boolean(t.hidden)}, ${t.weight ?? 1}, ${k});`,
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
