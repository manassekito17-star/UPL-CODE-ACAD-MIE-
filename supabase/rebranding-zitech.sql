-- =====================================================================
-- Rebranding ZiTECH : remplacement des anciennes appellations de marque
-- dans les CONTENUS PÉDAGOGIQUES et les annonces de l'administration.
--
-- À lancer UNE FOIS dans Supabase → SQL Editor (« Run »).
-- Ne touche à AUCUN compte, profil, progression, soumission, programme,
-- projet, message IA ni donnée personnelle : seules les tables de contenu
-- listées ci-dessous sont modifiées. Relançable sans risque (idempotent).
-- =====================================================================
do $$
declare
  t text;
  c record;
  n bigint;
  total bigint := 0;
  -- Tables de contenu uniquement.
  tables text[] := array['courses', 'course_levels', 'course_categories', 'modules', 'lessons', 'lesson_resources',
                         'quizzes', 'quiz_questions', 'quiz_answer_keys', 'achievements', 'announcements', 'platform_settings'];
  -- Du plus long au plus court (« UPL CODE ACADEMY MK » avant « UPL CODE ACADEMY »).
  expr text := 'replace(replace(replace(replace(replace(replace(replace(replace(%s, '
    || '''UPL CODE ACADEMY MK'', ''ZiTECH''), ''UPL CODE ACADEMY'', ''ZiTECH''), ''UPL CODE MK'', ''ZiTECH''), '
    || '''UPL Algo Classique'', ''ZiTECH Algo Classique''), ''UPL Flow Studio'', ''ZiTECH Flow Studio''), '
    || '''UPL IDE'', ''ZiTECH IDE''), ''UPL Algo'', ''ZiTECH Algo''), ''LEARN. CODE. PRACTICE. MASTER.'', ''BUILD BEYOND LIMITS'')';
  motif text := '''UPL CODE|UPL IDE|UPL Algo|UPL Flow|LEARN\. CODE\.''';
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    for c in
      select column_name, data_type from information_schema.columns
      where table_schema = 'public' and table_name = t and data_type in ('text', 'character varying', 'jsonb')
    loop
      if c.data_type = 'jsonb' then
        execute format('update public.%I set %I = (' || format(expr, quote_ident(c.column_name) || '::text') || ')::jsonb where %I::text ~ ' || motif,
                       t, c.column_name, c.column_name);
      else
        execute format('update public.%I set %I = ' || format(expr, quote_ident(c.column_name)) || ' where %I ~ ' || motif,
                       t, c.column_name, c.column_name);
      end if;
      get diagnostics n = row_count;
      if n > 0 then
        raise notice '%.% : % ligne(s) mise(s) à jour', t, c.column_name, n;
      end if;
      total := total + n;
    end loop;
  end loop;
  raise notice 'Rebranding ZiTECH terminé : % mise(s) à jour au total.', total;
end $$;
