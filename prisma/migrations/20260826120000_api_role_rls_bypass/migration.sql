-- =========================================================================
-- Let the API's own connection through row-level security again.
--
-- THE BUG THIS FIXES
--
-- 20260817000100 enabled RLS on every table and then also FORCED it:
--
--     ALTER TABLE %I ENABLE ROW LEVEL SECURITY;
--     ALTER TABLE %I FORCE  ROW LEVEL SECURITY;
--
-- ENABLE is right. FORCE is not, and the same migration says why in its own
-- header: the policies it creates "govern the direct browser-to-PostgREST path
-- only ... the API sees nothing through them and relies on its own
-- authorisation instead."
--
-- Every policy created there is granted TO authenticated and tested with
-- auth.uid(). The API does not connect as `authenticated` and has no
-- auth.uid(), so not one of those policies can ever admit it. Normally that
-- costs nothing, because the API connects as the role that owns these tables
-- and a table owner is exempt from RLS. FORCE is precisely the statement that
-- removes the owner's exemption. With it in place the owner is judged by
-- policies that were never written for it, so every INSERT it attempts is
-- refused with SQLSTATE 42501:
--
--     new row violates row-level security policy for table "clinicians"
--
-- Registering a patient writes `clinicians` (first-use provisioning) and then
-- `patients`, so registration was the first thing to hit it: the POST failed
-- with a generic 500 and the clinician was told only "Something went wrong."
--
-- This went unnoticed because a superuser — or any role holding BYPASSRLS,
-- which includes the `postgres` role on a stock Supabase project — bypasses
-- RLS whether or not it is FORCEd. A database driven by such a role works
-- perfectly; one driven by an ordinary owner role cannot write at all. The
-- deployment, not the code, decided whether the application functioned.
--
-- THE FIX
--
-- Drop FORCE and keep ENABLE. The browser-to-PostgREST path is completely
-- unaffected: `authenticated` never owns these tables, so every policy from
-- 20260817000100 still applies to it exactly as before, and a table with RLS
-- enabled and no matching policy still denies everything. What changes is only
-- that the owning role — the API, which authenticates and authorises every
-- request in lib/backend/auth.ts before it reaches a record — is once again
-- exempt, which is what the original migration said it depended on.
--
-- Written as its own migration rather than an edit to 20260817000100, because
-- that one has already been applied and Prisma checksums applied migrations.
-- =========================================================================

DO $rls$
DECLARE
  target text;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    -- patient-scoped
    'patient_baselines', 'patient_toxicity_status', 'patient_history_entries',
    'risk_factor_assertions', 'contraindication_assertions', 'cancer_diagnoses',
    'therapy_plans', 'patient_medications', 'visits', 'investigations',
    'anthracycline_doses', 'assessments', 'surveillance_recommendations',
    'follow_ups', 'clinical_overrides', 'care_team_members',
    -- children of a visit
    'visit_vitals', 'visit_symptoms', 'visit_system_exams',
    'visit_interval_answers', 'visit_task_completions', 'visit_medication_decisions',
    -- the rest
    'clinicians', 'patients', 'therapy_class_assignments', 'therapy_agents',
    'therapy_cycles', 'visit_system_exam_components', 'audit_events',
    'medications', 'medication_ingredients', 'legacy_imports'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = target
    ) THEN
      -- RLS stays ENABLED. Only the owner's exemption is restored.
      EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY', target);
    END IF;
  END LOOP;
END
$rls$;
