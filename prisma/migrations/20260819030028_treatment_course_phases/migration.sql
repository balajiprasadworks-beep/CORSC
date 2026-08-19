-- AlterTable
ALTER TABLE "therapy_agents" ADD COLUMN     "corsc_therapy_class" TEXT,
ADD COLUMN     "drug_class" TEXT,
ADD COLUMN     "phase_id" UUID,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "therapy_class" TEXT;

-- AlterTable
ALTER TABLE "therapy_plans" ADD COLUMN     "active_phase_key" TEXT,
ADD COLUMN     "entry_method" TEXT,
ADD COLUMN     "regimen_family" TEXT,
ADD COLUMN     "regimen_library_id" TEXT;

-- CreateTable
CREATE TABLE "therapy_phases" (
    "id" UUID NOT NULL,
    "therapy_plan_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "planned_cycles" INTEGER,
    "duration" TEXT,
    "schedule" TEXT,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,
    "transition_condition" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapy_phases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "therapy_phases_therapy_plan_id_position_idx" ON "therapy_phases"("therapy_plan_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "therapy_phases_therapy_plan_id_key_key" ON "therapy_phases"("therapy_plan_id", "key");

-- CreateIndex
CREATE INDEX "therapy_agents_phase_id_position_idx" ON "therapy_agents"("phase_id", "position");

-- AddForeignKey
ALTER TABLE "therapy_phases" ADD CONSTRAINT "therapy_phases_therapy_plan_id_fkey" FOREIGN KEY ("therapy_plan_id") REFERENCES "therapy_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapy_agents" ADD CONSTRAINT "therapy_agents_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "therapy_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Row-level security for therapy_phases.
--
-- Every table holding patient data is closed by default and closed to the
-- table owner too, so a new table must be enrolled explicitly. A phase is a
-- child of a therapy plan and inherits that plan's patient, which is the same
-- shape as therapy_agents and therapy_cycles.
-- ---------------------------------------------------------------------------
DO $rls$
DECLARE
  has_supabase_auth boolean;
BEGIN
  ALTER TABLE therapy_phases ENABLE ROW LEVEL SECURITY;
  ALTER TABLE therapy_phases FORCE ROW LEVEL SECURITY;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) INTO has_supabase_auth;

  -- Not a Supabase project: RLS stays enabled with no policies, which denies
  -- all non-superuser access. Correct for a CI or local database driven only
  -- through the API.
  IF NOT has_supabase_auth THEN
    RETURN;
  END IF;

  CREATE POLICY therapy_phases_select ON therapy_phases
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.therapy_plans t
      WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
    ));

  CREATE POLICY therapy_phases_insert ON therapy_phases
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.therapy_plans t
      WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
    ) AND public.corsc_can_write());

  CREATE POLICY therapy_phases_update ON therapy_phases
    FOR UPDATE TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.therapy_plans t
      WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
    ) AND public.corsc_can_write())
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.therapy_plans t
      WHERE t.id = therapy_plan_id AND public.corsc_can_read_patient(t.patient_id)
    ) AND public.corsc_can_write());
END;
$rls$;
