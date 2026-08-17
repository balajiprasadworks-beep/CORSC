/* =========================================================================
   Server-side input validation.

   Every value entering the database passes through a schema here. The browser
   validates too, but browser validation is a convenience for the person
   typing; it is not a control, because the API is reachable without the
   browser.

   TWO KINDS OF CHECK, KEPT APART

   Range checks reject values that cannot be true of a patient: an ejection
   fraction of 700, a negative dose, a heart rate of zero, a date that is not a
   date. These are here.

   Clinical interpretation — whether an ejection fraction of 48 matters, and
   what follows from it — is not here and must never be. That belongs to the
   engines. A validator that started deciding what a value means would become a
   second, invisible implementation of the clinical rules.

   The controlled vocabularies (therapy classes, investigation identifiers,
   symptom labels, visit types, risk factor identifiers) are imported from the
   clinical definitions rather than restated, so that adding an investigation
   in one place cannot leave the API silently rejecting it.
   ========================================================================= */

import { z } from "zod";

import { ApiError } from "@/lib/backend/errors";
import {
  ALL_RISK_FACTORS,
  HISTORY_GROUPS,
  INVESTIGATIONS,
  SYMPTOMS,
  THERAPY_CLASSES,
  ABSOLUTE_CI,
  RELATIVE_CI,
} from "@/lib/clinical-data";
import { EXAM_SYSTEMS } from "@/lib/clinical-data";
import { SINCE_LAST_VISIT_ITEMS, VISIT_TYPE_LIST } from "@/lib/visit-types";
import { ANTHRACYCLINE_AGENTS, EQUIVALENCE_MODELS } from "@/lib/anthracycline";
import { PROFORMAS } from "@/lib/hfa-icos";
import { TROPONIN_ASSAYS } from "@/lib/cardiac-measurements";
import { MED_CLASSES } from "@/lib/medication-engine";
import { overridableTargets } from "@/lib/overrides";

/* -------------------------------------------------- controlled vocabulary */

const THERAPY_IDS = THERAPY_CLASSES.map((item: { id: string }) => item.id);
const INVESTIGATION_IDS = INVESTIGATIONS.map((item: { id: string }) => item.id);
const HISTORY_GROUP_IDS = HISTORY_GROUPS.map((group: { id: string }) => group.id);
const SYSTEM_IDS = EXAM_SYSTEMS.map((system: { id: string }) => system.id);
const INTERVAL_ITEM_IDS = SINCE_LAST_VISIT_ITEMS.map((item: { id: string }) => item.id);
const VISIT_TYPE_IDS = VISIT_TYPE_LIST.map((item: { id: string }) => item.id);
/**
 * Every risk factor identifier a record may legitimately carry.
 *
 * Drawn from the HFA-ICOS proformas — which are what the risk ticks are keyed
 * by — including each factor's legacy identifiers, so a record written by an
 * earlier build is not silently stripped of its factors on save. The older
 * ALL_RISK_FACTORS list is unioned in for the same reason.
 */
export const RISK_FACTOR_IDS: string[] = Array.from(
  new Set<string>([
    ...Object.values(PROFORMAS).flatMap((proforma: { factors: Array<{ id: string; legacyIds?: string[] }> }) =>
      proforma.factors.flatMap((factor) => [factor.id, ...(factor.legacyIds || [])])
    ),
    ...ALL_RISK_FACTORS.map((factor: { id: string }) => factor.id),
  ])
);
const CONTRAINDICATION_IDS = [...ABSOLUTE_CI, ...RELATIVE_CI].map((item: { id: string }) => item.id);
const ANTHRACYCLINE_IDS = ANTHRACYCLINE_AGENTS.map((agent: { id: string }) => agent.id);
const EQUIVALENCE_MODEL_IDS = Object.keys(EQUIVALENCE_MODELS);
const TROPONIN_ASSAY_IDS = TROPONIN_ASSAYS.map((assay: { id: string }) => assay.id);
const MED_CLASS_IDS = MED_CLASSES.map((item: { id: string }) => item.id);
const OVERRIDE_TARGETS = overridableTargets().map((item: { id: string }) => item.id);

function vocabulary(values: string[], label: string) {
  const allowed = new Set(values);
  return z.string().refine((value) => allowed.has(value), {
    message: `Not a recognised ${label}.`,
  });
}

/* --------------------------------------------------------------- scalars */

/**
 * A clinical number.
 *
 * Accepts a number or a numeric string, because form fields arrive as strings
 * and an empty field must mean "not recorded" rather than zero. NaN and
 * Infinity are rejected outright: a NaN that reaches an engine propagates
 * silently through every comparison and produces a confident wrong answer.
 */
export function clinicalNumber(options: { min?: number; max?: number; label?: string } = {}) {
  const { min, max, label = "value" } = options;
  return z
    .union([z.number(), z.string()])
    .transform((raw, ctx) => {
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed === "") return null;
        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be a number.` });
          return z.NEVER;
        }
        return parsed;
      }
      if (!Number.isFinite(raw)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be a finite number.` });
        return z.NEVER;
      }
      return raw;
    })
    .superRefine((value, ctx) => {
      if (value === null) return;
      if (min !== undefined && value < min) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} cannot be below ${min}.` });
      }
      if (max !== undefined && value > max) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} cannot be above ${max}.` });
      }
    });
}

/**
 * A clinical number that must be present.
 *
 * Separate from clinicalNumber because a blank optional field legitimately
 * means "not recorded", while a blank required one is a missing fact the
 * caller has to supply.
 */
export function requiredClinicalNumber(options: { min?: number; max?: number; label?: string } = {}) {
  const label = options.label ?? "value";
  return clinicalNumber(options).transform((value, ctx) => {
    if (value === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} is required.` });
      return z.NEVER;
    }
    return value;
  });
}

/** An ISO calendar date. Rejects "2026-02-31" as well as "not a date". */
export const isoDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use the date format YYYY-MM-DD.",
  })
  .refine(
    (value) => {
      if (value === "") return true;
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    },
    { message: "That date does not exist." }
  )
  .transform((value) => (value === "" ? null : value));

export const optionalDate = isoDate.nullish().transform((value) => value ?? null);

/** Free text with a ceiling, so a clinical note cannot become a denial of service. */
export function text(max = 2000) {
  return z.string().max(max, `Keep this under ${max} characters.`).trim();
}

export const optionalText = (max = 2000) =>
  z
    .string()
    .max(max)
    .trim()
    .nullish()
    .transform((value) => (value ? value : null));

export const uuid = z.string().uuid("Not a valid record identifier.");

export const sex = z.enum(["MALE", "FEMALE", "OTHER", "NOT_RECORDED"]);

export const clinicianRole = z.enum([
  "ADMIN",
  "CARDIO_ONCOLOGIST",
  "ONCOLOGIST",
  "CLINICIAN",
  "RESEARCHER",
  "READ_ONLY",
]);

/* -------------------------------------------------------------- patients */

export const patientCreateSchema = z.object({
  name: text(200).min(1, "A patient name is required."),
  hospitalPatientId: optionalText(80),
  mrn: optionalText(80),
  dateOfBirth: optionalDate,
  age: clinicalNumber({ min: 0, max: 130, label: "Age" }).nullish(),
  sex: sex.default("NOT_RECORDED"),
  clinicalStatus: z.enum(["Stable", "Improving", "Worsening", "Critical"]).default("Stable"),
  registeredOn: optionalDate,
  /** Identifier carried over from a browser-stored record. */
  legacyId: optionalText(120),
});

/* ------------------------------------------------- the whole-record document
   The shape the encounter workflow holds and autosaves. It is the engines' own
   patient shape, so the field names here are theirs, not the database's.

   Scalars are validated strictly and out-of-range values are REJECTED rather
   than clamped: an ejection fraction of 700 is a typing error the clinician
   needs to see, and quietly storing null would leave them believing it saved.

   The nested clinical structures (history groups, examination systems,
   investigations, interval answers) are validated structurally here and
   filtered against the clinical vocabularies in
   lib/backend/services/patient-record-service, which is where those
   vocabularies are already needed to decide which table a value belongs in.
   ---------------------------------------------------------------------- */

const looseRecord = z.record(z.string(), z.unknown());

const documentVisitSchema = z
  .object({
    id: z.string().max(120).optional(),
    type: optionalText(80),
    visitType: optionalText(60),
    cycle: clinicalNumber({ min: 0, max: 200, label: "Cycle number" }).nullish(),
    date: optionalDate,
    saved: z.boolean().optional(),
    firstReview: looseRecord.optional(),
    vitals: looseRecord.optional(),
    symptoms: z.array(z.string().max(80)).max(40).optional(),
    symptomDetail: looseRecord.optional(),
    sinceLastVisit: looseRecord.optional(),
    systems: looseRecord.optional(),
    inv: looseRecord.optional(),
    hfStatus: optionalText(80),
    medReview: optionalText(4000),
    medDecisions: looseRecord.optional(),
    taskCompletion: looseRecord.optional(),
    plan: optionalText(4000),
    notes: optionalText(8000),
    nextFollowUpDate: optionalDate,
    aiSummary: optionalText(8000),
  })
  .passthrough();

export const patientDocumentSchema = z
  .object({
    name: text(200).min(1, "A patient name is required."),
    patientId: optionalText(80),
    mrn: optionalText(80),
    age: clinicalNumber({ min: 0, max: 130, label: "Age" }).nullish(),
    dateOfBirth: optionalDate,
    gender: z.enum(["Male", "Female", "Other", "Not recorded"]).optional(),
    clinicalStatus: z.enum(["Stable", "Improving", "Worsening", "Critical"]).optional(),
    registeredDate: optionalDate,

    diagnosis: optionalText(200),
    stage: optionalText(80),

    regimen: optionalText(200),
    therapy: z.array(vocabulary(THERAPY_IDS, "therapy class")).max(12).optional(),
    plannedCycles: clinicalNumber({ min: 1, max: 200, label: "Planned cycles" }).nullish(),
    cycleFrequency: optionalText(80),
    cycle: clinicalNumber({ min: 0, max: 200, label: "Current cycle" }).nullish(),
    totalPlannedDose: clinicalNumber({ min: 0, max: 5000, label: "Total planned dose" }).nullish(),

    baselineLVEF: clinicalNumber({ min: 0, max: 100, label: "Baseline LVEF" }).nullish(),
    baselineGLS: clinicalNumber({ min: -60, max: 60, label: "Baseline GLS" }).nullish(),
    baselineQTc: clinicalNumber({ min: 200, max: 800, label: "Baseline QTc" }).nullish(),
    baselineTroponin: clinicalNumber({ min: 0, label: "Baseline troponin" }).nullish(),
    baselineNtProBnp: clinicalNumber({ min: 0, label: "Baseline NT-proBNP" }).nullish(),
    baselineWeight: clinicalNumber({ min: 0.5, max: 400, label: "Baseline weight" }).nullish(),
    baselineHeight: clinicalNumber({ min: 20, max: 260, label: "Baseline height" }).nullish(),
    troponinAssay: vocabulary(TROPONIN_ASSAY_IDS, "troponin assay").nullish(),
    troponinURL: clinicalNumber({ min: 0, label: "Local troponin reference limit" }).nullish(),

    history: looseRecord.optional(),
    veryHigh: z.record(z.string(), z.unknown()).optional(),
    high: z.record(z.string(), z.unknown()).optional(),
    m2: z.record(z.string(), z.unknown()).optional(),
    m1: z.record(z.string(), z.unknown()).optional(),
    contraindications: looseRecord.optional(),
    restratification: looseRecord.optional(),

    medications: z
      .array(
        z
          .object({
            id: z.string().max(120).optional(),
            medicationId: uuid.nullish(),
            name: text(200).min(1),
            dose: optionalText(200),
            klass: optionalText(60),
          })
          .passthrough()
      )
      .max(100)
      .optional(),

    anthracyclineDoses: z
      .array(
        z
          .object({
            id: z.string().max(120).optional(),
            agent: text(60).min(1),
            dose: clinicalNumber({ min: 0, max: 100000, label: "Dose" }),
            unit: z.enum(["mg/m2", "mg"]).optional(),
            bsa: clinicalNumber({ min: 0.1, max: 4, label: "Body surface area" }).nullish(),
            cycle: clinicalNumber({ min: 1, max: 200, label: "Cycle" }).nullish(),
            date: optionalDate,
            modelId: optionalText(60),
          })
          .passthrough()
      )
      .max(200)
      .optional(),

    visits: z.array(documentVisitSchema).max(300).optional(),
    draftEncounter: documentVisitSchema.nullish(),

    /** Concurrency token from the last read. */
    expectedUpdatedAt: z.string().datetime().nullish(),
    /** Browser-storage identifier, set only by the migration. */
    legacyId: optionalText(120),
  })
  .passthrough();

export const patientUpdateSchema = patientCreateSchema
  .partial()
  .extend({
    /**
     * The record's updatedAt as the client last saw it. Sent so that two
     * clinicians editing the same patient produce a conflict rather than one
     * silently overwriting the other.
     */
    expectedUpdatedAt: z.string().datetime().nullish(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Nothing to update." });

export const archiveSchema = z.object({
  reason: text(500).min(1, "Say why this record is being archived."),
});

/* ------------------------------------------------------- baseline dataset */

export const baselineSchema = z.object({
  lvef: clinicalNumber({ min: 0, max: 100, label: "LVEF" }).nullish(),
  // GLS is reported negative by convention. The magnitude is bounded; the sign
  // is left alone, because both conventions appear in echo reports and the
  // engines compare absolute values.
  gls: clinicalNumber({ min: -60, max: 60, label: "GLS" }).nullish(),
  qtc: clinicalNumber({ min: 200, max: 800, label: "QTc" }).nullish(),
  troponin: clinicalNumber({ min: 0, label: "Troponin" }).nullish(),
  ntProBnp: clinicalNumber({ min: 0, label: "NT-proBNP" }).nullish(),
  weightKg: clinicalNumber({ min: 0.5, max: 400, label: "Weight" }).nullish(),
  heightCm: clinicalNumber({ min: 20, max: 260, label: "Height" }).nullish(),
  troponinAssayId: vocabulary(TROPONIN_ASSAY_IDS, "troponin assay").nullish(),
  troponinLocalUrl: clinicalNumber({ min: 0, label: "Local troponin reference limit" }).nullish(),
});

export const toxicityStatusSchema = z.object({
  myocarditisConfirmed: z.boolean().optional(),
  severeHeartFailure: z.boolean().optional(),
  troponinRise: z.boolean().optional(),
  glsFallPercent: clinicalNumber({ min: -100, max: 100, label: "GLS fall" }).nullish(),
  currentLvef: clinicalNumber({ min: 0, max: 100, label: "Current LVEF" }).nullish(),
});

/* --------------------------------------------------------------- history */

export const historySchema = z.object({
  entries: z
    .array(
      z.object({
        groupId: vocabulary(HISTORY_GROUP_IDS, "history group"),
        itemId: text(120).min(1),
        kind: z.enum(["CHECK", "FIELD"]),
        checked: z.boolean().nullish(),
        value: optionalText(1000),
      })
    )
    .max(500),
});

export const riskFactorsSchema = z.object({
  factors: z
    .array(
      z.object({
        tier: z.enum(["VERY_HIGH", "HIGH", "MODERATE_2", "MODERATE_1"]),
        factorId: vocabulary(RISK_FACTOR_IDS, "risk factor"),
        present: z.boolean().default(true),
      })
    )
    .max(200),
});

export const contraindicationsSchema = z.object({
  entries: z
    .array(
      z.object({
        severity: z.enum(["ABSOLUTE", "RELATIVE"]),
        factorId: vocabulary(CONTRAINDICATION_IDS, "contraindication"),
        present: z.boolean().default(true),
      })
    )
    .max(100),
});

/* ------------------------------------------------------------- diagnosis */

export const diagnosisSchema = z.object({
  primarySite: text(200).min(1, "Record the primary site."),
  cancerType: optionalText(200),
  histology: optionalText(200),
  stage: optionalText(80),
  intent: z
    .enum(["CURATIVE", "ADJUVANT", "NEOADJUVANT", "PALLIATIVE", "MAINTENANCE", "NOT_RECORDED"])
    .default("NOT_RECORDED"),
  diagnosedOn: optionalDate,
  isPrimary: z.boolean().default(true),
  notes: optionalText(1000),
});

/* --------------------------------------------------------------- therapy */

export const therapyPlanSchema = z.object({
  diagnosisId: uuid.nullish(),
  regimen: optionalText(200),
  /**
   * Therapy classes. A list, always. Combination therapy is the case that
   * matters most clinically — anthracycline followed by HER2 blockade is not
   * either one of them alone — so the API refuses to collapse it to a single
   * value.
   */
  therapyClasses: z.array(vocabulary(THERAPY_IDS, "therapy class")).max(12).default([]),
  agents: z
    .array(
      z.object({
        agentId: vocabulary(ANTHRACYCLINE_IDS, "anthracycline agent").nullish(),
        name: text(160).min(1),
        plannedDose: clinicalNumber({ min: 0, max: 100000, label: "Planned dose" }).nullish(),
        doseUnit: z.enum(["MG_PER_M2", "MG"]).nullish(),
      })
    )
    .max(40)
    .default([]),
  plannedCycles: clinicalNumber({ min: 1, max: 200, label: "Planned cycles" }).nullish(),
  cycleFrequency: optionalText(80),
  currentCycle: clinicalNumber({ min: 0, max: 200, label: "Current cycle" }).nullish(),
  plannedStartOn: optionalDate,
  plannedEndOn: optionalDate,
  actualStartOn: optionalDate,
  actualEndOn: optionalDate,
  plannedCumulativeDose: clinicalNumber({ min: 0, max: 5000, label: "Planned cumulative dose" }).nullish(),
});

export const therapyCycleSchema = z.object({
  therapyPlanId: uuid,
  cycleNumber: requiredClinicalNumber({ min: 1, max: 200, label: "Cycle number" }),
  plannedOn: optionalDate,
  administeredOn: optionalDate,
  status: z.enum(["PLANNED", "ADMINISTERED", "DELAYED", "OMITTED"]).default("PLANNED"),
  deferralReason: optionalText(500),
  toxicityNote: optionalText(1000),
  notes: optionalText(1000),
  /** Anthracycline doses delivered in this cycle, recorded with the cycle. */
  doses: z
    .array(
      z.object({
        agentId: vocabulary(ANTHRACYCLINE_IDS, "anthracycline agent"),
        dose: requiredClinicalNumber({ min: 0, max: 100000, label: "Dose" }),
        doseUnit: z.enum(["MG_PER_M2", "MG"]).default("MG_PER_M2"),
        bsa: clinicalNumber({ min: 0.1, max: 4, label: "Body surface area" }).nullish(),
        givenOn: optionalDate,
        equivalenceModelId: vocabulary(EQUIVALENCE_MODEL_IDS, "equivalence model").default("feijen2019"),
      })
    )
    .max(20)
    .default([]),
});

export const therapyCycleUpdateSchema = therapyCycleSchema
  .omit({ therapyPlanId: true, cycleNumber: true, doses: true })
  .partial();

/* ----------------------------------------------------------- medications */

export const medicationSearchSchema = z.object({
  q: z.string().trim().min(1, "Enter at least one character to search.").max(120),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const patientMedicationSchema = z.object({
  medicationId: uuid.nullish(),
  displayName: text(200).min(1, "Name the medicine."),
  medicationClass: vocabulary(MED_CLASS_IDS, "medication class").nullish(),
  strength: optionalText(80),
  doseAmount: clinicalNumber({ min: 0, max: 100000, label: "Dose" }).nullish(),
  doseUnit: optionalText(20),
  /**
   * The four prescription slots — morning, afternoon, evening, night — as the
   * service writes them. 1-0-0-1 is one in the morning and one at night.
   */
  morning: clinicalNumber({ min: 0, max: 20, label: "Morning dose" }).nullish(),
  afternoon: clinicalNumber({ min: 0, max: 20, label: "Afternoon dose" }).nullish(),
  evening: clinicalNumber({ min: 0, max: 20, label: "Evening dose" }).nullish(),
  night: clinicalNumber({ min: 0, max: 20, label: "Night dose" }).nullish(),
  frequencyNote: optionalText(160),
  route: z
    .enum([
      "ORAL",
      "SUBLINGUAL",
      "INTRAVENOUS",
      "SUBCUTANEOUS",
      "INTRAMUSCULAR",
      "TRANSDERMAL",
      "INHALED",
      "TOPICAL",
      "OTHER",
    ])
    .default("ORAL"),
  foodRelation: z
    .enum(["BEFORE_FOOD", "AFTER_FOOD", "WITH_FOOD", "NOT_SPECIFIED"])
    .default("NOT_SPECIFIED"),
  indication: optionalText(200),
  notes: optionalText(500),
  startedOn: optionalDate,
});

export const patientMedicationUpdateSchema = patientMedicationSchema.partial();

export const stopMedicationSchema = z.object({
  stoppedOn: optionalDate,
  reason: text(300).min(1, "Say why the medicine was stopped."),
});

/* ---------------------------------------------------------------- visits */

const vitalsSchema = z.object({
  heightCm: clinicalNumber({ min: 20, max: 260, label: "Height" }).nullish(),
  weightKg: clinicalNumber({ min: 0.5, max: 400, label: "Weight" }).nullish(),
  referenceWeightKg: clinicalNumber({ min: 0.5, max: 400, label: "Reference weight" }).nullish(),
  systolicBp: clinicalNumber({ min: 40, max: 300, label: "Systolic blood pressure" }).nullish(),
  diastolicBp: clinicalNumber({ min: 20, max: 200, label: "Diastolic blood pressure" }).nullish(),
  pulse: clinicalNumber({ min: 20, max: 300, label: "Pulse" }).nullish(),
  respiratoryRate: clinicalNumber({ min: 4, max: 80, label: "Respiratory rate" }).nullish(),
  spo2: clinicalNumber({ min: 50, max: 100, label: "Oxygen saturation" }).nullish(),
  temperatureC: clinicalNumber({ min: 25, max: 45, label: "Temperature" }).nullish(),
});

const symptomEntrySchema = z.object({
  symptom: vocabulary(SYMPTOMS, "symptom"),
  severity: z.enum(["Mild", "Moderate", "Severe"]).nullish(),
  duration: optionalText(160),
  trigger: optionalText(160),
  radiation: optionalText(160),
  associated: optionalText(160),
});

const systemExamSchema = z.object({
  systemId: vocabulary(SYSTEM_IDS, "examination system"),
  status: z.enum(["NOT_EXAMINED", "NORMAL", "FINDINGS"]).default("NOT_EXAMINED"),
  components: z
    .array(
      z.object({
        componentId: text(80).min(1),
        normal: z.boolean().default(false),
        findings: optionalText(500),
      })
    )
    .max(30)
    .default([]),
});

export const visitCreateSchema = z.object({
  visitType: vocabulary(VISIT_TYPE_IDS, "visit type"),
  label: optionalText(80),
  cycleNumber: clinicalNumber({ min: 0, max: 200, label: "Cycle number" }).nullish(),
  occurredOn: isoDate,
  legacyId: optionalText(120),
});

export const visitUpdateSchema = z.object({
  visitType: vocabulary(VISIT_TYPE_IDS, "visit type").optional(),
  label: optionalText(80),
  cycleNumber: clinicalNumber({ min: 0, max: 200, label: "Cycle number" }).nullish(),
  occurredOn: optionalDate,
  tolerance: optionalText(200),
  interimEvents: optionalText(2000),
  admissions: optionalText(2000),
  clinicalConcerns: optionalText(2000),
  earlyToxicity: optionalText(2000),
  heartFailureStatus: optionalText(80),
  medicationReview: optionalText(4000),
  plan: optionalText(4000),
  notes: optionalText(8000),
  nextFollowUpOn: optionalDate,
  vitals: vitalsSchema.optional(),
  symptoms: z.array(symptomEntrySchema).max(40).optional(),
  systemExams: z.array(systemExamSchema).max(20).optional(),
  intervalAnswers: z
    .array(
      z.object({
        itemId: vocabulary(INTERVAL_ITEM_IDS, "interval history item"),
        present: z.boolean().default(false),
        detail: optionalText(1000),
      })
    )
    .max(60)
    .optional(),
  taskCompletions: z
    .array(z.object({ taskId: text(80).min(1), completed: z.boolean().default(false) }))
    .max(80)
    .optional(),
  medicationDecisions: z
    .array(
      z.object({
        recommendationId: text(80).min(1),
        decision: z.enum(["accepted", "deferred", "declined", ""]),
        note: optionalText(500),
      })
    )
    .max(40)
    .optional(),
  expectedUpdatedAt: z.string().datetime().nullish(),
});

export const visitFileSchema = z.object({
  /** The generated encounter summary as it read when the clinician filed it. */
  generatedSummary: optionalText(8000),
});

/* --------------------------------------------------------- investigations */

export const investigationSchema = z.object({
  visitId: uuid.nullish(),
  investigationId: vocabulary(INVESTIGATION_IDS, "investigation"),
  measuredOn: optionalDate,
  resultText: optionalText(2000),
  numericValue: clinicalNumber({ min: -100000, max: 1000000, label: "Result" }).nullish(),
  unit: optionalText(40),
  interpretation: z.enum(["Normal", "Elevated", "Reduced", "Abnormal", ""]).nullish(),
  comment: optionalText(1000),
  isBaseline: z.boolean().default(false),
  /**
   * Troponin assay and the reference limit actually applied. Stored with the
   * value because troponin results from different assays are not comparable,
   * and a stored interpretation is meaningless without knowing which limit it
   * was read against.
   */
  assayId: vocabulary(TROPONIN_ASSAY_IDS, "troponin assay").nullish(),
  referenceUpperLimit: clinicalNumber({ min: 0, label: "Reference upper limit" }).nullish(),
  laboratory: optionalText(160),
  /** ECG intervals as entered. */
  measurements: z
    .object({
      heartRate: clinicalNumber({ min: 20, max: 300, label: "Heart rate" }).nullish(),
      qt: clinicalNumber({ min: 100, max: 800, label: "QT" }).nullish(),
      qtc: clinicalNumber({ min: 200, max: 800, label: "QTc" }).nullish(),
      rr: clinicalNumber({ min: 0.1, max: 5, label: "RR interval" }).nullish(),
      rhythm: optionalText(80),
    })
    .nullish(),
});

/* ------------------------------------------------------------ assessments */

export const assessSchema = z.object({
  visitId: uuid.nullish(),
  therapyPlanId: uuid.nullish(),
});

/* ----------------------------------------------------------- surveillance */

export const completeSurveillanceSchema = z.object({
  completedOn: optionalDate,
  note: optionalText(1000),
});

/* -------------------------------------------------------------- overrides */

export const overrideSchema = z.object({
  visitId: uuid.nullish(),
  target: vocabulary(OVERRIDE_TARGETS, "override target"),
  subjectId: optionalText(120),
  algorithmicValue: optionalText(200),
  clinicianValue: text(200).min(1, "Record the value you are recording instead."),
  /**
   * Required, and required to be substantive. An override with no reason
   * cannot be reviewed later, which defeats the purpose of recording it
   * additively.
   */
  reason: text(1000).min(10, "Give a reason of at least ten characters."),
});

export const withdrawOverrideSchema = z.object({
  reason: text(1000).min(10, "Give a reason of at least ten characters."),
});

/* ------------------------------------------------------------ care team */

export const careTeamSchema = z.object({
  clinicianId: uuid,
});

/* ---------------------------------------------------------- legacy import */

/**
 * The browser-stored record, accepted loosely on purpose.
 *
 * Legacy records were written by earlier builds and may be missing anything.
 * Rejecting them at the schema would lose data; the migration service
 * validates each one field by field and reports what it could not map, so a
 * record that cannot be understood is flagged for review rather than dropped.
 */
export const legacyImportSchema = z.object({
  records: z.array(z.record(z.string(), z.unknown())).max(500),
  /** Set false to validate and report without writing anything. */
  commit: z.boolean().default(true),
});

/* --------------------------------------------------------------- queries */

export const listQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "ALL"]).default("ACTIVE"),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().uuid().optional(),
});

export const auditQuerySchema = z.object({
  category: z.string().trim().max(40).optional(),
  since: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().uuid().optional(),
});

/** Parses a URLSearchParams against a schema, with the same error shape as a body. */
export function parseQuery<S extends z.ZodTypeAny>(schema: S, search: URLSearchParams): z.infer<S> {
  const raw: Record<string, string> = {};
  search.forEach((value, key) => {
    raw[key] = value;
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw ApiError.invalidRequest(
      "The query parameters are not valid.",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "(query)",
        message: issue.message,
      }))
    );
  }
  return parsed.data;
}
