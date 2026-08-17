-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ClinicianRole" AS ENUM ('ADMIN', 'CARDIO_ONCOLOGIST', 'ONCOLOGIST', 'CLINICIAN', 'RESEARCHER', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_RECORDED');

-- CreateEnum
CREATE TYPE "TreatmentIntent" AS ENUM ('CURATIVE', 'ADJUVANT', 'NEOADJUVANT', 'PALLIATIVE', 'MAINTENANCE', 'NOT_RECORDED');

-- CreateEnum
CREATE TYPE "HistoryEntryKind" AS ENUM ('CHECK', 'FIELD');

-- CreateEnum
CREATE TYPE "RiskTier" AS ENUM ('VERY_HIGH', 'HIGH', 'MODERATE_2', 'MODERATE_1');

-- CreateEnum
CREATE TYPE "ContraindicationSeverity" AS ENUM ('ABSOLUTE', 'RELATIVE');

-- CreateEnum
CREATE TYPE "DoseUnit" AS ENUM ('MG_PER_M2', 'MG');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('PLANNED', 'ADMINISTERED', 'DELAYED', 'OMITTED');

-- CreateEnum
CREATE TYPE "MedicationRoute" AS ENUM ('ORAL', 'SUBLINGUAL', 'INTRAVENOUS', 'SUBCUTANEOUS', 'INTRAMUSCULAR', 'TRANSDERMAL', 'INHALED', 'TOPICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "FoodRelation" AS ENUM ('BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('DRAFT', 'FILED');

-- CreateEnum
CREATE TYPE "SystemExamStatus" AS ENUM ('NOT_EXAMINED', 'NORMAL', 'FINDINGS');

-- CreateEnum
CREATE TYPE "AssessmentKind" AS ENUM ('BASELINE_RISK', 'CTR_CVT', 'CTRCD', 'FITNESS', 'SURVEILLANCE', 'RED_FLAGS', 'COMPLETENESS');

-- CreateEnum
CREATE TYPE "SurveillanceStatus" AS ENUM ('DUE', 'COMPLETED', 'CANCELLED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PLANNED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LegacyImportOutcome" AS ENUM ('IMPORTED', 'SKIPPED_DUPLICATE', 'NEEDS_REVIEW', 'FAILED');

-- CreateTable
CREATE TABLE "clinicians" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "ClinicianRole" NOT NULL DEFAULT 'CLINICIAN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_team_members" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "clinician_id" UUID NOT NULL,
    "granted_by_id" UUID,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "care_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "hospital_patient_id" TEXT,
    "mrn" TEXT,
    "name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "age_at_registration" INTEGER,
    "sex" "Sex" NOT NULL DEFAULT 'NOT_RECORDED',
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "clinical_status" TEXT NOT NULL DEFAULT 'Stable',
    "registered_on" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "archived_by_id" UUID,
    "archive_reason" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "legacy_id" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_baselines" (
    "patient_id" UUID NOT NULL,
    "lvef" DECIMAL(4,1),
    "gls" DECIMAL(4,1),
    "qtc" INTEGER,
    "troponin" DECIMAL(12,3),
    "nt_probnp" DECIMAL(12,3),
    "weight_kg" DECIMAL(5,2),
    "height_cm" DECIMAL(5,1),
    "troponin_assay_id" TEXT,
    "troponin_local_url" DECIMAL(12,3),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_baselines_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "patient_toxicity_status" (
    "patient_id" UUID NOT NULL,
    "myocarditis_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "severe_heart_failure" BOOLEAN NOT NULL DEFAULT false,
    "troponin_rise" BOOLEAN NOT NULL DEFAULT false,
    "gls_fall_percent" DECIMAL(5,2),
    "current_lvef" DECIMAL(4,1),
    "updated_by_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_toxicity_status_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "patient_history_entries" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "group_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "kind" "HistoryEntryKind" NOT NULL,
    "checked" BOOLEAN,
    "value" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_history_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_factor_assertions" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "tier" "RiskTier" NOT NULL,
    "factor_id" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_factor_assertions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contraindication_assertions" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "severity" "ContraindicationSeverity" NOT NULL,
    "factor_id" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contraindication_assertions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancer_diagnoses" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "primary_site" TEXT NOT NULL,
    "cancer_type" TEXT,
    "histology" TEXT,
    "stage" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "intent" "TreatmentIntent" NOT NULL DEFAULT 'NOT_RECORDED',
    "diagnosed_on" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancer_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapy_plans" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "diagnosis_id" UUID,
    "regimen" TEXT,
    "planned_cycles" INTEGER,
    "cycle_frequency" TEXT,
    "current_cycle" INTEGER NOT NULL DEFAULT 0,
    "planned_start_on" DATE,
    "planned_end_on" DATE,
    "actual_start_on" DATE,
    "actual_end_on" DATE,
    "planned_cumulative_dose" DECIMAL(8,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapy_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapy_class_assignments" (
    "id" UUID NOT NULL,
    "therapy_plan_id" UUID NOT NULL,
    "therapy_class" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "therapy_class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapy_agents" (
    "id" UUID NOT NULL,
    "therapy_plan_id" UUID NOT NULL,
    "agent_id" TEXT,
    "name" TEXT NOT NULL,
    "planned_dose" DECIMAL(10,3),
    "dose_unit" "DoseUnit",
    "route" "MedicationRoute",

    CONSTRAINT "therapy_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapy_cycles" (
    "id" UUID NOT NULL,
    "therapy_plan_id" UUID NOT NULL,
    "cycle_number" INTEGER NOT NULL,
    "planned_on" DATE,
    "administered_on" DATE,
    "status" "CycleStatus" NOT NULL DEFAULT 'PLANNED',
    "deferral_reason" TEXT,
    "toxicity_note" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapy_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anthracycline_doses" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "cycle_id" UUID,
    "visit_id" UUID,
    "agent_id" TEXT NOT NULL,
    "dose" DECIMAL(10,3) NOT NULL,
    "dose_unit" "DoseUnit" NOT NULL DEFAULT 'MG_PER_M2',
    "bsa" DECIMAL(4,2),
    "cycle_number" INTEGER,
    "given_on" DATE,
    "equivalence_model_id" TEXT NOT NULL DEFAULT 'feijen2019',
    "conversion_failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anthracycline_doses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" UUID NOT NULL,
    "external_id" TEXT,
    "generic_name" TEXT NOT NULL,
    "brand_name" TEXT,
    "strength" TEXT,
    "dosage_form" TEXT,
    "route" "MedicationRoute" NOT NULL DEFAULT 'ORAL',
    "manufacturer" TEXT,
    "is_combination" BOOLEAN NOT NULL DEFAULT false,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "medication_class" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_ingredients" (
    "id" UUID NOT NULL,
    "medication_id" UUID NOT NULL,
    "ingredient_id" TEXT,
    "name" TEXT NOT NULL,
    "strength" TEXT,
    "ingredient_class" TEXT,

    CONSTRAINT "medication_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medications" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "medication_id" UUID,
    "display_name" TEXT NOT NULL,
    "medication_class" TEXT,
    "strength" TEXT,
    "dose_amount" DECIMAL(10,3),
    "dose_unit" TEXT,
    "morning" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "afternoon" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "evening" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "night" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "frequency_note" TEXT,
    "route" "MedicationRoute" NOT NULL DEFAULT 'ORAL',
    "food_relation" "FoodRelation" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "indication" TEXT,
    "notes" TEXT,
    "started_on" DATE,
    "stopped_on" DATE,
    "stop_reason" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "clinician_id" UUID,
    "visit_type" TEXT NOT NULL,
    "label" TEXT,
    "cycle_number" INTEGER,
    "occurred_on" DATE NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'DRAFT',
    "filed_at" TIMESTAMP(3),
    "tolerance" TEXT,
    "interim_events" TEXT,
    "admissions" TEXT,
    "clinical_concerns" TEXT,
    "early_toxicity" TEXT,
    "heart_failure_status" TEXT,
    "medication_review" TEXT,
    "plan" TEXT,
    "notes" TEXT,
    "next_follow_up_on" DATE,
    "generated_summary" TEXT,
    "legacy_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_vitals" (
    "visit_id" UUID NOT NULL,
    "height_cm" DECIMAL(5,1),
    "weight_kg" DECIMAL(5,2),
    "reference_weight_kg" DECIMAL(5,2),
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "pulse" INTEGER,
    "respiratory_rate" INTEGER,
    "spo2" INTEGER,
    "temperature_c" DECIMAL(4,1),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visit_vitals_pkey" PRIMARY KEY ("visit_id")
);

-- CreateTable
CREATE TABLE "visit_symptoms" (
    "id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "symptom" TEXT NOT NULL,
    "severity" TEXT,
    "duration" TEXT,
    "trigger" TEXT,
    "radiation" TEXT,
    "associated" TEXT,

    CONSTRAINT "visit_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_system_exams" (
    "id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "system_id" TEXT NOT NULL,
    "status" "SystemExamStatus" NOT NULL DEFAULT 'NOT_EXAMINED',

    CONSTRAINT "visit_system_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_system_exam_components" (
    "id" UUID NOT NULL,
    "system_exam_id" UUID NOT NULL,
    "component_id" TEXT NOT NULL,
    "normal" BOOLEAN NOT NULL DEFAULT false,
    "findings" TEXT,

    CONSTRAINT "visit_system_exam_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_interval_answers" (
    "id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "item_id" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "detail" TEXT,

    CONSTRAINT "visit_interval_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_task_completions" (
    "id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "task_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "visit_task_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_medication_decisions" (
    "id" UUID NOT NULL,
    "visit_id" UUID NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "visit_medication_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigations" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "visit_id" UUID,
    "investigation_id" TEXT NOT NULL,
    "measured_on" DATE,
    "result_text" TEXT,
    "numeric_value" DECIMAL(12,3),
    "unit" TEXT,
    "interpretation" TEXT,
    "comment" TEXT,
    "is_baseline" BOOLEAN NOT NULL DEFAULT false,
    "assay_id" TEXT,
    "reference_upper_limit" DECIMAL(12,3),
    "laboratory" TEXT,
    "measurements" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "visit_id" UUID,
    "therapy_plan_id" UUID,
    "kind" "AssessmentKind" NOT NULL,
    "engine" TEXT NOT NULL,
    "engine_version" TEXT NOT NULL,
    "rules_version" TEXT NOT NULL,
    "category" TEXT,
    "score" DECIMAL(8,2),
    "result" JSONB NOT NULL,
    "inputs" JSONB NOT NULL,
    "verification" TEXT,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computed_by_id" UUID,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveillance_recommendations" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "visit_id" UUID,
    "therapy_plan_id" UUID,
    "task_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "investigation_id" TEXT,
    "priority" TEXT NOT NULL,
    "due_on" DATE,
    "due_description" TEXT,
    "reason" TEXT NOT NULL,
    "source_id" TEXT,
    "source_locator" TEXT,
    "verification" TEXT,
    "escalation_reason" TEXT,
    "risk_category" TEXT,
    "toxicity_grade" TEXT,
    "engine" TEXT NOT NULL,
    "engine_version" TEXT NOT NULL,
    "rules_version" TEXT NOT NULL,
    "status" "SurveillanceStatus" NOT NULL DEFAULT 'DUE',
    "completed_on" DATE,
    "completed_by_id" UUID,
    "completion_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surveillance_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "visit_id" UUID,
    "follow_up_type" TEXT NOT NULL,
    "acuity" TEXT,
    "planned_on" DATE,
    "actual_on" DATE,
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PLANNED',
    "engine" TEXT,
    "engine_version" TEXT,
    "rules_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_overrides" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "visit_id" UUID,
    "target" TEXT NOT NULL,
    "subject_id" TEXT,
    "algorithmic_value" TEXT,
    "clinician_value" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "clinician_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),
    "withdrawn_by_id" UUID,
    "withdrawn_reason" TEXT,

    CONSTRAINT "clinical_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "patient_id" UUID,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "entity" TEXT,
    "entity_id" TEXT,
    "field" TEXT,
    "previous_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "detail" TEXT,
    "request_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legacy_imports" (
    "id" UUID NOT NULL,
    "clinician_id" UUID NOT NULL,
    "patient_id" UUID,
    "legacy_id" TEXT NOT NULL,
    "outcome" "LegacyImportOutcome" NOT NULL,
    "reason" TEXT,
    "unmapped_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visits_imported" INTEGER NOT NULL DEFAULT 0,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legacy_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinicians_email_key" ON "clinicians"("email");

-- CreateIndex
CREATE INDEX "clinicians_role_idx" ON "clinicians"("role");

-- CreateIndex
CREATE INDEX "care_team_members_clinician_id_revoked_at_idx" ON "care_team_members"("clinician_id", "revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "care_team_members_patient_id_clinician_id_key" ON "care_team_members"("patient_id", "clinician_id");

-- CreateIndex
CREATE INDEX "patients_created_by_id_status_updated_at_idx" ON "patients"("created_by_id", "status", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "patients_created_by_id_hospital_patient_id_idx" ON "patients"("created_by_id", "hospital_patient_id");

-- CreateIndex
CREATE INDEX "patients_name_idx" ON "patients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "patients_created_by_id_legacy_id_key" ON "patients"("created_by_id", "legacy_id");

-- CreateIndex
CREATE INDEX "patient_history_entries_group_id_item_id_idx" ON "patient_history_entries"("group_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_history_entries_patient_id_group_id_item_id_kind_key" ON "patient_history_entries"("patient_id", "group_id", "item_id", "kind");

-- CreateIndex
CREATE INDEX "risk_factor_assertions_factor_id_idx" ON "risk_factor_assertions"("factor_id");

-- CreateIndex
CREATE UNIQUE INDEX "risk_factor_assertions_patient_id_tier_factor_id_key" ON "risk_factor_assertions"("patient_id", "tier", "factor_id");

-- CreateIndex
CREATE UNIQUE INDEX "contraindication_assertions_patient_id_severity_factor_id_key" ON "contraindication_assertions"("patient_id", "severity", "factor_id");

-- CreateIndex
CREATE INDEX "cancer_diagnoses_patient_id_active_idx" ON "cancer_diagnoses"("patient_id", "active");

-- CreateIndex
CREATE INDEX "therapy_plans_patient_id_active_idx" ON "therapy_plans"("patient_id", "active");

-- CreateIndex
CREATE INDEX "therapy_class_assignments_therapy_class_idx" ON "therapy_class_assignments"("therapy_class");

-- CreateIndex
CREATE UNIQUE INDEX "therapy_class_assignments_therapy_plan_id_therapy_class_key" ON "therapy_class_assignments"("therapy_plan_id", "therapy_class");

-- CreateIndex
CREATE INDEX "therapy_agents_therapy_plan_id_idx" ON "therapy_agents"("therapy_plan_id");

-- CreateIndex
CREATE INDEX "therapy_cycles_therapy_plan_id_cycle_number_idx" ON "therapy_cycles"("therapy_plan_id", "cycle_number");

-- CreateIndex
CREATE UNIQUE INDEX "therapy_cycles_therapy_plan_id_cycle_number_key" ON "therapy_cycles"("therapy_plan_id", "cycle_number");

-- CreateIndex
CREATE INDEX "anthracycline_doses_patient_id_cycle_number_idx" ON "anthracycline_doses"("patient_id", "cycle_number");

-- CreateIndex
CREATE INDEX "anthracycline_doses_patient_id_given_on_idx" ON "anthracycline_doses"("patient_id", "given_on");

-- CreateIndex
CREATE UNIQUE INDEX "medications_external_id_key" ON "medications"("external_id");

-- CreateIndex
CREATE INDEX "medications_generic_name_idx" ON "medications"("generic_name");

-- CreateIndex
CREATE INDEX "medications_brand_name_idx" ON "medications"("brand_name");

-- CreateIndex
CREATE INDEX "medications_medication_class_idx" ON "medications"("medication_class");

-- CreateIndex
CREATE INDEX "medication_ingredients_medication_id_idx" ON "medication_ingredients"("medication_id");

-- CreateIndex
CREATE INDEX "medication_ingredients_ingredient_id_idx" ON "medication_ingredients"("ingredient_id");

-- CreateIndex
CREATE INDEX "patient_medications_patient_id_active_idx" ON "patient_medications"("patient_id", "active");

-- CreateIndex
CREATE INDEX "visits_patient_id_occurred_on_idx" ON "visits"("patient_id", "occurred_on" DESC);

-- CreateIndex
CREATE INDEX "visits_patient_id_status_idx" ON "visits"("patient_id", "status");

-- CreateIndex
CREATE INDEX "visits_next_follow_up_on_idx" ON "visits"("next_follow_up_on");

-- CreateIndex
CREATE UNIQUE INDEX "visits_patient_id_legacy_id_key" ON "visits"("patient_id", "legacy_id");

-- CreateIndex
CREATE INDEX "visit_symptoms_symptom_idx" ON "visit_symptoms"("symptom");

-- CreateIndex
CREATE UNIQUE INDEX "visit_symptoms_visit_id_symptom_key" ON "visit_symptoms"("visit_id", "symptom");

-- CreateIndex
CREATE UNIQUE INDEX "visit_system_exams_visit_id_system_id_key" ON "visit_system_exams"("visit_id", "system_id");

-- CreateIndex
CREATE UNIQUE INDEX "visit_system_exam_components_system_exam_id_component_id_key" ON "visit_system_exam_components"("system_exam_id", "component_id");

-- CreateIndex
CREATE UNIQUE INDEX "visit_interval_answers_visit_id_item_id_key" ON "visit_interval_answers"("visit_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "visit_task_completions_visit_id_task_id_key" ON "visit_task_completions"("visit_id", "task_id");

-- CreateIndex
CREATE UNIQUE INDEX "visit_medication_decisions_visit_id_recommendation_id_key" ON "visit_medication_decisions"("visit_id", "recommendation_id");

-- CreateIndex
CREATE INDEX "investigations_patient_id_investigation_id_measured_on_idx" ON "investigations"("patient_id", "investigation_id", "measured_on" DESC);

-- CreateIndex
CREATE INDEX "investigations_patient_id_is_baseline_idx" ON "investigations"("patient_id", "is_baseline");

-- CreateIndex
CREATE UNIQUE INDEX "investigations_visit_id_investigation_id_key" ON "investigations"("visit_id", "investigation_id");

-- CreateIndex
CREATE INDEX "assessments_patient_id_kind_computed_at_idx" ON "assessments"("patient_id", "kind", "computed_at" DESC);

-- CreateIndex
CREATE INDEX "assessments_patient_id_visit_id_idx" ON "assessments"("patient_id", "visit_id");

-- CreateIndex
CREATE INDEX "surveillance_recommendations_patient_id_status_due_on_idx" ON "surveillance_recommendations"("patient_id", "status", "due_on");

-- CreateIndex
CREATE INDEX "surveillance_recommendations_due_on_status_idx" ON "surveillance_recommendations"("due_on", "status");

-- CreateIndex
CREATE INDEX "follow_ups_patient_id_planned_on_idx" ON "follow_ups"("patient_id", "planned_on");

-- CreateIndex
CREATE INDEX "clinical_overrides_patient_id_created_at_idx" ON "clinical_overrides"("patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "clinical_overrides_patient_id_target_subject_id_idx" ON "clinical_overrides"("patient_id", "target", "subject_id");

-- CreateIndex
CREATE INDEX "audit_events_patient_id_occurred_at_idx" ON "audit_events"("patient_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_actor_id_occurred_at_idx" ON "audit_events"("actor_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_category_occurred_at_idx" ON "audit_events"("category", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "legacy_imports_clinician_id_outcome_idx" ON "legacy_imports"("clinician_id", "outcome");

-- CreateIndex
CREATE UNIQUE INDEX "legacy_imports_clinician_id_legacy_id_key" ON "legacy_imports"("clinician_id", "legacy_id");

-- AddForeignKey
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_team_members" ADD CONSTRAINT "care_team_members_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "clinicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "clinicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_baselines" ADD CONSTRAINT "patient_baselines_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_toxicity_status" ADD CONSTRAINT "patient_toxicity_status_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_history_entries" ADD CONSTRAINT "patient_history_entries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_factor_assertions" ADD CONSTRAINT "risk_factor_assertions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contraindication_assertions" ADD CONSTRAINT "contraindication_assertions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancer_diagnoses" ADD CONSTRAINT "cancer_diagnoses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapy_plans" ADD CONSTRAINT "therapy_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapy_plans" ADD CONSTRAINT "therapy_plans_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "cancer_diagnoses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapy_class_assignments" ADD CONSTRAINT "therapy_class_assignments_therapy_plan_id_fkey" FOREIGN KEY ("therapy_plan_id") REFERENCES "therapy_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapy_agents" ADD CONSTRAINT "therapy_agents_therapy_plan_id_fkey" FOREIGN KEY ("therapy_plan_id") REFERENCES "therapy_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapy_cycles" ADD CONSTRAINT "therapy_cycles_therapy_plan_id_fkey" FOREIGN KEY ("therapy_plan_id") REFERENCES "therapy_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthracycline_doses" ADD CONSTRAINT "anthracycline_doses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthracycline_doses" ADD CONSTRAINT "anthracycline_doses_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "therapy_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthracycline_doses" ADD CONSTRAINT "anthracycline_doses_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_ingredients" ADD CONSTRAINT "medication_ingredients_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "clinicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_vitals" ADD CONSTRAINT "visit_vitals_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_symptoms" ADD CONSTRAINT "visit_symptoms_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_system_exams" ADD CONSTRAINT "visit_system_exams_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_system_exam_components" ADD CONSTRAINT "visit_system_exam_components_system_exam_id_fkey" FOREIGN KEY ("system_exam_id") REFERENCES "visit_system_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_interval_answers" ADD CONSTRAINT "visit_interval_answers_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_task_completions" ADD CONSTRAINT "visit_task_completions_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_medication_decisions" ADD CONSTRAINT "visit_medication_decisions_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_computed_by_id_fkey" FOREIGN KEY ("computed_by_id") REFERENCES "clinicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveillance_recommendations" ADD CONSTRAINT "surveillance_recommendations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveillance_recommendations" ADD CONSTRAINT "surveillance_recommendations_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveillance_recommendations" ADD CONSTRAINT "surveillance_recommendations_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "clinicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_overrides" ADD CONSTRAINT "clinical_overrides_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_overrides" ADD CONSTRAINT "clinical_overrides_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_overrides" ADD CONSTRAINT "clinical_overrides_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "clinicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_overrides" ADD CONSTRAINT "clinical_overrides_withdrawn_by_id_fkey" FOREIGN KEY ("withdrawn_by_id") REFERENCES "clinicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "clinicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_imports" ADD CONSTRAINT "legacy_imports_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "clinicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legacy_imports" ADD CONSTRAINT "legacy_imports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

