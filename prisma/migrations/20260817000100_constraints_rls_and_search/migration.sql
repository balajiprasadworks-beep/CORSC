-- =========================================================================
-- CORSC — clinical constraints, row-level security, audit immutability and
-- server-side medication search.
--
-- The preceding migration creates the tables Prisma describes. This one adds
-- everything Prisma cannot express: value constraints that keep clinically
-- impossible data out of the database, the row-level security that protects
-- the direct-from-browser path, a trigger that makes the audit trail
-- append-only against every path including the application's own, and the
-- indexes that make medication search a server-side query.
--
-- TWO ACCESS PATHS, TWO CONTROLS
--
--   Browser -> Supabase PostgREST : protected by the policies below. The
--       publishable key is in the client bundle by design, so RLS is the only
--       thing standing between an authenticated user and another clinician's
--       caseload on this path.
--
--   Browser -> CORSC API -> Prisma : the API connects with a role that
--       bypasses RLS, so authorisation on this path is enforced in
--       lib/backend/auth. That is a deliberate split, not an oversight: the
--       API needs to read a clinician profile and write an audit row for a
--       caller who is not the patient's owner, which no single policy set can
--       express. It carries an obligation — every route handler must go
--       through requirePatientAccess(), and tests/api asserts that it does.
-- =========================================================================

-- ------------------------------------------------------ clinical constraints
--
-- These are range and integrity checks, not clinical rules. Nothing here
-- decides what a value means; they only reject values that cannot be true, so
-- that a mistyped ejection fraction of 700 is refused at the point of entry
-- rather than propagating into a risk assessment.

ALTER TABLE "patients"
  ADD CONSTRAINT "patients_age_range"
    CHECK ("age_at_registration" IS NULL OR ("age_at_registration" >= 0 AND "age_at_registration" <= 130)),
  ADD CONSTRAINT "patients_name_present"
    CHECK (length(btrim("name")) > 0),
  ADD CONSTRAINT "patients_archive_consistency"
    CHECK (("status" = 'ARCHIVED') = ("archived_at" IS NOT NULL));

ALTER TABLE "patient_baselines"
  ADD CONSTRAINT "baseline_lvef_range"
    CHECK ("lvef" IS NULL OR ("lvef" >= 0 AND "lvef" <= 100)),
  -- GLS is conventionally reported as a negative percentage. The magnitude is
  -- bounded; the sign is not constrained, because both conventions appear in
  -- reports and the engines compare absolute values.
  ADD CONSTRAINT "baseline_gls_range"
    CHECK ("gls" IS NULL OR (abs("gls") <= 60)),
  ADD CONSTRAINT "baseline_qtc_range"
    CHECK ("qtc" IS NULL OR ("qtc" >= 200 AND "qtc" <= 800)),
  ADD CONSTRAINT "baseline_troponin_non_negative"
    CHECK ("troponin" IS NULL OR "troponin" >= 0),
  ADD CONSTRAINT "baseline_ntprobnp_non_negative"
    CHECK ("nt_probnp" IS NULL OR "nt_probnp" >= 0),
  ADD CONSTRAINT "baseline_weight_range"
    CHECK ("weight_kg" IS NULL OR ("weight_kg" > 0 AND "weight_kg" <= 400)),
  ADD CONSTRAINT "baseline_height_range"
    CHECK ("height_cm" IS NULL OR ("height_cm" > 0 AND "height_cm" <= 260)),
  ADD CONSTRAINT "baseline_troponin_url_non_negative"
    CHECK ("troponin_local_url" IS NULL OR "troponin_local_url" >= 0);

ALTER TABLE "patient_toxicity_status"
  ADD CONSTRAINT "toxicity_current_lvef_range"
    CHECK ("current_lvef" IS NULL OR ("current_lvef" >= 0 AND "current_lvef" <= 100));

ALTER TABLE "therapy_plans"
  ADD CONSTRAINT "therapy_planned_cycles_range"
    CHECK ("planned_cycles" IS NULL OR ("planned_cycles" > 0 AND "planned_cycles" <= 200)),
  ADD CONSTRAINT "therapy_current_cycle_non_negative"
    CHECK ("current_cycle" >= 0),
  ADD CONSTRAINT "therapy_planned_dose_non_negative"
    CHECK ("planned_cumulative_dose" IS NULL OR "planned_cumulative_dose" >= 0),
  ADD CONSTRAINT "therapy_dates_ordered"
    CHECK ("planned_end_on" IS NULL OR "planned_start_on" IS NULL OR "planned_end_on" >= "planned_start_on");

ALTER TABLE "therapy_cycles"
  ADD CONSTRAINT "cycle_number_positive"
    CHECK ("cycle_number" > 0);

ALTER TABLE "anthracycline_doses"
  ADD CONSTRAINT "dose_non_negative"
    CHECK ("dose" >= 0),
  ADD CONSTRAINT "dose_bsa_range"
    CHECK ("bsa" IS NULL OR ("bsa" > 0 AND "bsa" <= 4)),
  ADD CONSTRAINT "dose_cycle_positive"
    CHECK ("cycle_number" IS NULL OR "cycle_number" > 0);

ALTER TABLE "patient_medications"
  ADD CONSTRAINT "medication_slots_non_negative"
    CHECK ("morning" >= 0 AND "afternoon" >= 0 AND "evening" >= 0 AND "night" >= 0),
  ADD CONSTRAINT "medication_name_present"
    CHECK (length(btrim("display_name")) > 0),
  ADD CONSTRAINT "medication_dates_ordered"
    CHECK ("stopped_on" IS NULL OR "started_on" IS NULL OR "stopped_on" >= "started_on"),
  -- A stopped medicine cannot also be active. Prevents a "stopped" drug
  -- continuing to count towards duplication and interaction screening.
  ADD CONSTRAINT "medication_active_consistency"
    CHECK (NOT ("active" AND "stopped_on" IS NOT NULL));

ALTER TABLE "visit_vitals"
  ADD CONSTRAINT "vitals_bp_range"
    CHECK (
      ("systolic_bp" IS NULL OR ("systolic_bp" >= 40 AND "systolic_bp" <= 300))
      AND ("diastolic_bp" IS NULL OR ("diastolic_bp" >= 20 AND "diastolic_bp" <= 200))
    ),
  ADD CONSTRAINT "vitals_pulse_range"
    CHECK ("pulse" IS NULL OR ("pulse" >= 20 AND "pulse" <= 300)),
  ADD CONSTRAINT "vitals_spo2_range"
    CHECK ("spo2" IS NULL OR ("spo2" >= 50 AND "spo2" <= 100)),
  ADD CONSTRAINT "vitals_rr_range"
    CHECK ("respiratory_rate" IS NULL OR ("respiratory_rate" >= 4 AND "respiratory_rate" <= 80)),
  ADD CONSTRAINT "vitals_temperature_range"
    CHECK ("temperature_c" IS NULL OR ("temperature_c" >= 25 AND "temperature_c" <= 45)),
  ADD CONSTRAINT "vitals_weight_range"
    CHECK ("weight_kg" IS NULL OR ("weight_kg" > 0 AND "weight_kg" <= 400)),
  ADD CONSTRAINT "vitals_height_range"
    CHECK ("height_cm" IS NULL OR ("height_cm" > 0 AND "height_cm" <= 260));

ALTER TABLE "investigations"
  ADD CONSTRAINT "investigation_reference_limit_non_negative"
    CHECK ("reference_upper_limit" IS NULL OR "reference_upper_limit" >= 0);

ALTER TABLE "clinical_overrides"
  -- An override without a stated reason is not an override, it is an
  -- unexplained edit.
  ADD CONSTRAINT "override_reason_present"
    CHECK (length(btrim("reason")) > 0),
  ADD CONSTRAINT "override_value_present"
    CHECK (length(btrim("clinician_value")) > 0),
  ADD CONSTRAINT "override_withdrawal_consistency"
    CHECK (("withdrawn_at" IS NULL) = ("withdrawn_by_id" IS NULL));

ALTER TABLE "surveillance_recommendations"
  -- Every recommendation must say why it fired.
  ADD CONSTRAINT "surveillance_reason_present"
    CHECK (length(btrim("reason")) > 0),
  ADD CONSTRAINT "surveillance_completion_consistency"
    CHECK ("status" <> 'COMPLETED' OR "completed_on" IS NOT NULL);

ALTER TABLE "assessments"
  ADD CONSTRAINT "assessment_engine_version_present"
    CHECK (length(btrim("engine_version")) > 0 AND length(btrim("rules_version")) > 0);

ALTER TABLE "audit_events"
  ADD CONSTRAINT "audit_action_present"
    CHECK (length(btrim("action")) > 0 AND length(btrim("category")) > 0);

-- ----------------------------------------------------- audit immutability
--
-- Enforced by trigger rather than by permissions alone, so that the guarantee
-- holds against the application's own privileged connection as well as against
-- a client. An audit trail that the application can rewrite is not an audit
-- trail.
--
-- A consequence, and an intended one: a patient row cannot be hard-deleted
-- while it has audit history, because the cascade would have to delete audit
-- rows. Patients are archived.

CREATE OR REPLACE FUNCTION "public"."corsc_reject_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'CORSC: % is append-only; record a correcting entry instead of modifying history', TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER "audit_events_append_only"
  BEFORE UPDATE OR DELETE ON "audit_events"
  FOR EACH ROW EXECUTE FUNCTION "public"."corsc_reject_mutation"();

-- --------------------------------------------------------- assessment history
--
-- A stored assessment is a record of what the software said at a moment in
-- time. Updating one in place would rewrite history; a new assessment is a new
-- row. Deletion stays possible only through a patient cascade, which the audit
-- trigger already blocks in practice.

CREATE TRIGGER "assessments_no_update"
  BEFORE UPDATE ON "assessments"
  FOR EACH ROW EXECUTE FUNCTION "public"."corsc_reject_mutation"();

-- ------------------------------------------------------- medication search
--
-- Search runs in the database. The formulary is large enough that shipping it
-- to the browser to filter client-side would be both slow and a needless
-- download on a clinic connection.

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Maintained by trigger rather than as a generated column: array_to_string is
-- only STABLE, which PostgreSQL will not accept in a generation expression.
ALTER TABLE "medications" ADD COLUMN "search_text" text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION "public"."corsc_medication_search_text"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."search_text" :=
    lower(
      coalesce(NEW."generic_name", '') || ' ' ||
      coalesce(NEW."brand_name", '') || ' ' ||
      coalesce(NEW."strength", '') || ' ' ||
      coalesce(array_to_string(NEW."aliases", ' '), '')
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER "medications_search_text"
  BEFORE INSERT OR UPDATE ON "medications"
  FOR EACH ROW EXECUTE FUNCTION "public"."corsc_medication_search_text"();

CREATE INDEX "medications_search_trgm_idx"
  ON "medications" USING gin ("search_text" gin_trgm_ops);

CREATE INDEX "medication_ingredients_name_trgm_idx"
  ON "medication_ingredients" USING gin ("name" gin_trgm_ops);

-- Patient search by name, for the worklist.
CREATE INDEX "patients_name_trgm_idx"
  ON "patients" USING gin ("name" gin_trgm_ops);

-- =========================================================================
-- ROW LEVEL SECURITY
--
-- Enabled and forced on every table holding patient data before any policy
-- exists, so the tables are closed by default and stay closed to the table
-- owner too.
--
-- These policies govern the direct browser-to-PostgREST path only. They are
-- written against auth.uid(), which is null on the API's connection, so the
-- API sees nothing through them and relies on its own authorisation instead.
--
-- The guard below lets this migration run against a plain PostgreSQL database
-- that has no Supabase auth schema — a CI service container, or a local
-- development database — without silently skipping RLS on a real deployment.
-- =========================================================================

DO $rls$
DECLARE
  has_supabase_auth boolean;
  patient_scoped text[] := ARRAY[
    'patient_baselines', 'patient_toxicity_status', 'patient_history_entries',
    'risk_factor_assertions', 'contraindication_assertions', 'cancer_diagnoses',
    'therapy_plans', 'patient_medications', 'visits', 'investigations',
    'anthracycline_doses', 'assessments', 'surveillance_recommendations',
    'follow_ups', 'clinical_overrides', 'care_team_members'
  ];
  child_of_visit text[] := ARRAY[
    'visit_vitals', 'visit_symptoms', 'visit_system_exams',
    'visit_interval_answers', 'visit_task_completions', 'visit_medication_decisions'
  ];
  target text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) INTO has_supabase_auth;

  -- Enable RLS everywhere regardless. A table with RLS enabled and no policy
  -- denies everything, which is the correct posture for a database whose
  -- deployment shape is not yet known.
  FOREACH target IN ARRAY (
    patient_scoped || child_of_visit || ARRAY[
      'clinicians', 'patients', 'therapy_class_assignments', 'therapy_agents',
      'therapy_cycles', 'visit_system_exam_components', 'audit_events',
      'medications', 'medication_ingredients', 'legacy_imports'
    ]
  )
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', target);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', target);
  END LOOP;

  IF NOT has_supabase_auth THEN
    RAISE NOTICE 'CORSC: no auth.users table found, so this database is not a Supabase project. Row-level security is enabled on every table and no policies are created, which denies all non-superuser access. This is expected for a CI or local database driven exclusively through the API.';
    RETURN;
  END IF;

  -- ---------------------------------------------------------------- helper
  EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.corsc_is_admin()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $body$
      SELECT EXISTS (
        SELECT 1 FROM public.clinicians c
        WHERE c.id = auth.uid() AND c.role = 'ADMIN' AND c.active
      );
    $body$;
  $fn$;

  EXECUTE 'REVOKE ALL ON FUNCTION public.corsc_is_admin() FROM public';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.corsc_is_admin() TO authenticated';

  -- Can the caller see this patient? Owner, care-team member, or admin.
  EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.corsc_can_read_patient(target uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $body$
      SELECT EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = target
          AND (
            p.created_by_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.care_team_members m
              WHERE m.patient_id = p.id AND m.clinician_id = auth.uid() AND m.revoked_at IS NULL
            )
          )
      ) OR public.corsc_is_admin();
    $body$;
  $fn$;

  EXECUTE 'REVOKE ALL ON FUNCTION public.corsc_can_read_patient(uuid) FROM public';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.corsc_can_read_patient(uuid) TO authenticated';

  -- Read-only roles must not write, whatever the row.
  EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.corsc_can_write()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $body$
      SELECT EXISTS (
        SELECT 1 FROM public.clinicians c
        WHERE c.id = auth.uid()
          AND c.active
          AND c.role NOT IN ('READ_ONLY', 'RESEARCHER')
      );
    $body$;
  $fn$;

  EXECUTE 'REVOKE ALL ON FUNCTION public.corsc_can_write() FROM public';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.corsc_can_write() TO authenticated';

  -- ------------------------------------------------------------ clinicians
  EXECUTE $p$
    CREATE POLICY "clinicians_select" ON "clinicians"
      FOR SELECT TO authenticated
      USING (id = auth.uid() OR public.corsc_is_admin());
  $p$;

  -- A clinician may edit their own profile but never their own role: the role
  -- is the authorisation, so self-service escalation has to be impossible.
  EXECUTE $p$
    CREATE POLICY "clinicians_update_own" ON "clinicians"
      FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (
        id = auth.uid()
        AND role = (SELECT c.role FROM public.clinicians c WHERE c.id = auth.uid())
      );
  $p$;

  -- -------------------------------------------------------------- patients
  EXECUTE $p$
    CREATE POLICY "patients_select" ON "patients"
      FOR SELECT TO authenticated
      USING (public.corsc_can_read_patient(id));
  $p$;

  EXECUTE $p$
    CREATE POLICY "patients_insert" ON "patients"
      FOR INSERT TO authenticated
      WITH CHECK (created_by_id = auth.uid() AND public.corsc_can_write());
  $p$;

  EXECUTE $p$
    CREATE POLICY "patients_update" ON "patients"
      FOR UPDATE TO authenticated
      USING (public.corsc_can_read_patient(id) AND public.corsc_can_write())
      WITH CHECK (public.corsc_can_read_patient(id) AND public.corsc_can_write());
  $p$;

  -- No DELETE policy anywhere. Clinical records are archived, never removed.

  -- ------------------------------------------------- patient-scoped tables
  FOREACH target IN ARRAY patient_scoped
  LOOP
    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR SELECT TO authenticated
        USING (public.corsc_can_read_patient(patient_id));
    $p$, target || '_select', target);

    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR INSERT TO authenticated
        WITH CHECK (public.corsc_can_read_patient(patient_id) AND public.corsc_can_write());
    $p$, target || '_insert', target);
  END LOOP;

  -- Update is granted on the mutable clinical tables only. Assessments,
  -- overrides and surveillance history are written once by the API; the
  -- browser path gets no UPDATE on them at all.
  FOREACH target IN ARRAY ARRAY[
    'patient_baselines', 'patient_toxicity_status', 'patient_history_entries',
    'risk_factor_assertions', 'contraindication_assertions', 'cancer_diagnoses',
    'therapy_plans', 'patient_medications', 'visits', 'investigations'
  ]
  LOOP
    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR UPDATE TO authenticated
        USING (public.corsc_can_read_patient(patient_id) AND public.corsc_can_write())
        WITH CHECK (public.corsc_can_read_patient(patient_id) AND public.corsc_can_write());
    $p$, target || '_update', target);
  END LOOP;

  -- ------------------------------------------------------ visit child rows
  FOREACH target IN ARRAY child_of_visit
  LOOP
    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR SELECT TO authenticated
        USING (EXISTS (
          SELECT 1 FROM public.visits v
          WHERE v.id = visit_id AND public.corsc_can_read_patient(v.patient_id)
        ));
    $p$, target || '_select', target);

    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR INSERT TO authenticated
        WITH CHECK (EXISTS (
          SELECT 1 FROM public.visits v
          WHERE v.id = visit_id AND public.corsc_can_read_patient(v.patient_id)
        ) AND public.corsc_can_write());
    $p$, target || '_insert', target);

    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR UPDATE TO authenticated
        USING (EXISTS (
          SELECT 1 FROM public.visits v
          WHERE v.id = visit_id AND public.corsc_can_read_patient(v.patient_id)
        ) AND public.corsc_can_write())
        WITH CHECK (EXISTS (
          SELECT 1 FROM public.visits v
          WHERE v.id = visit_id AND public.corsc_can_read_patient(v.patient_id)
        ) AND public.corsc_can_write());
    $p$, target || '_update', target);
  END LOOP;

  -- ------------------------------------------------------- therapy children
  FOREACH target IN ARRAY ARRAY['therapy_class_assignments', 'therapy_agents', 'therapy_cycles']
  LOOP
    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR SELECT TO authenticated
        USING (EXISTS (
          SELECT 1 FROM public.therapy_plans t
          WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
        ));
    $p$, target || '_select', target);

    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR INSERT TO authenticated
        WITH CHECK (EXISTS (
          SELECT 1 FROM public.therapy_plans t
          WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
        ) AND public.corsc_can_write());
    $p$, target || '_insert', target);

    EXECUTE format($p$
      CREATE POLICY %I ON %I
        FOR UPDATE TO authenticated
        USING (EXISTS (
          SELECT 1 FROM public.therapy_plans t
          WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
        ) AND public.corsc_can_write())
        WITH CHECK (EXISTS (
          SELECT 1 FROM public.therapy_plans t
          WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
        ) AND public.corsc_can_write());
    $p$, target || '_update', target);
  END LOOP;

  EXECUTE $p$
    CREATE POLICY "visit_system_exam_components_select" ON "visit_system_exam_components"
      FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.visit_system_exams e
        JOIN public.visits v ON v.id = e.visit_id
        WHERE e.id = system_exam_id AND public.corsc_can_read_patient(v.patient_id)
      ));
  $p$;

  EXECUTE $p$
    CREATE POLICY "visit_system_exam_components_write" ON "visit_system_exam_components"
      FOR INSERT TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.visit_system_exams e
        JOIN public.visits v ON v.id = e.visit_id
        WHERE e.id = system_exam_id AND public.corsc_can_read_patient(v.patient_id)
      ) AND public.corsc_can_write());
  $p$;

  EXECUTE $p$
    CREATE POLICY "visit_system_exam_components_update" ON "visit_system_exam_components"
      FOR UPDATE TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.visit_system_exams e
        JOIN public.visits v ON v.id = e.visit_id
        WHERE e.id = system_exam_id AND public.corsc_can_read_patient(v.patient_id)
      ) AND public.corsc_can_write())
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.visit_system_exams e
        JOIN public.visits v ON v.id = e.visit_id
        WHERE e.id = system_exam_id AND public.corsc_can_read_patient(v.patient_id)
      ) AND public.corsc_can_write());
  $p$;

  -- ------------------------------------------------------------- audit log
  --
  -- Readable by the patient's care team and by admins. Insert only; there is
  -- no UPDATE or DELETE policy, and the append-only trigger above blocks both
  -- even for a privileged connection.
  EXECUTE $p$
    CREATE POLICY "audit_events_select" ON "audit_events"
      FOR SELECT TO authenticated
      USING (
        public.corsc_is_admin()
        OR (patient_id IS NOT NULL AND public.corsc_can_read_patient(patient_id))
      );
  $p$;

  EXECUTE $p$
    CREATE POLICY "audit_events_insert" ON "audit_events"
      FOR INSERT TO authenticated
      WITH CHECK (actor_id = auth.uid());
  $p$;

  -- --------------------------------------------------------- legacy imports
  EXECUTE $p$
    CREATE POLICY "legacy_imports_select" ON "legacy_imports"
      FOR SELECT TO authenticated
      USING (clinician_id = auth.uid() OR public.corsc_is_admin());
  $p$;

  -- ------------------------------------------------- medication dictionary
  --
  -- Reference data, not patient data. Any signed-in clinician may read it; no
  -- client may write it. The formulary is maintained by import, server-side.
  EXECUTE $p$
    CREATE POLICY "medications_read" ON "medications"
      FOR SELECT TO authenticated USING (active);
  $p$;

  EXECUTE $p$
    CREATE POLICY "medication_ingredients_read" ON "medication_ingredients"
      FOR SELECT TO authenticated USING (true);
  $p$;
END
$rls$;
