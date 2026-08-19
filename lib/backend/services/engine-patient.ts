/* =========================================================================
   The engine adapter.

   This module is the entire reason the clinical engines did not have to
   change.

   CORSC's engines — HFA-ICOS, CTR-CVT, CTRCD, the anthracycline ledger, the
   surveillance rules, fitness to proceed — all read one denormalised patient
   object with a `visits` array hanging off it. That shape is a good fit for
   the calculations and a poor fit for a database: it cannot answer "every LVEF
   this patient has had" without deserialising every record, and it cannot
   constrain anything.

   The database therefore stores clinical facts normally, and this module
   assembles them back into the shape the engines already consume. The engines
   are handed exactly what they were handed before. Their thresholds, their
   composition rules and their provenance are untouched, and their existing
   tests still describe their behaviour.

   The alternative — rewriting the engines to read normalised rows — would have
   meant re-deriving validated clinical logic to suit a storage decision. That
   is not a trade this codebase should make.

   ONE DELIBERATE COMPUTATION HAPPENS HERE. `patient.risk` is attached by
   calling assessRisk(), the same engine the registration screen calls. It is
   not read from a stored column, because a stored category can go stale the
   moment a risk factor is recorded. Historical assessments are preserved
   separately, as rows in `assessments`, with the engine version that produced
   them.
   ========================================================================= */

import type { Prisma } from "@prisma/client";

import { assessRisk } from "@/lib/hfa-icos";
import { migratePatient } from "@/lib/patient-model";

/* -------------------------------------------------------- query selection */

/**
 * Everything the engines need, in one query.
 *
 * Written as a single nested include rather than a sequence of round trips: a
 * patient with twenty visits would otherwise cost sixty queries to assemble.
 */
export const enginePatientInclude = {
  baseline: true,
  toxicityStatus: true,
  historyEntries: true,
  riskFactors: true,
  contraindications: true,
  diagnoses: { orderBy: { diagnosedOn: "desc" } },
  therapyPlans: {
    orderBy: { createdAt: "asc" },
    include: {
      classes: { orderBy: { position: "asc" } },
      agents: true,
      cycles: { orderBy: { cycleNumber: "asc" } },
      phases: {
        orderBy: { position: "asc" },
        include: { agents: { orderBy: { position: "asc" } } },
      },
    },
  },
  medications: { orderBy: { createdAt: "asc" } },
  anthracyclineDoses: { orderBy: [{ cycleNumber: "asc" }, { givenOn: "asc" }] },
  overrides: { orderBy: { createdAt: "desc" } },
  visits: {
    orderBy: { occurredOn: "asc" },
    include: {
      vitals: true,
      symptoms: true,
      systemExams: { include: { components: true } },
      intervalAnswers: true,
      taskCompletions: true,
      medicationDecisions: true,
      investigations: true,
    },
  },
} satisfies Prisma.PatientInclude;

export type PatientWithClinicalData = Prisma.PatientGetPayload<{
  include: typeof enginePatientInclude;
}>;

/* ---------------------------------------------------------------- helpers */

type Decimalish = { toString(): string } | number | string | null | undefined;

/**
 * Prisma Decimal to the shape the engines expect.
 *
 * They accept a number or a string and treat "" as not recorded, so null
 * becomes "" rather than 0. A null ejection fraction that arrived as 0 would
 * read as profound cardiac dysfunction.
 */
function numeric(value: Decimalish): number | "" {
  if (value === null || value === undefined || value === "") return "";
  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : "";
}

function isoDay(value: Date | null | undefined): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

const SEX_LABEL: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  NOT_RECORDED: "Not recorded",
};

const TIER_KEY: Record<string, "veryHigh" | "high" | "m2" | "m1"> = {
  VERY_HIGH: "veryHigh",
  HIGH: "high",
  MODERATE_2: "m2",
  MODERATE_1: "m1",
};

const SYSTEM_STATUS: Record<string, string> = {
  NOT_EXAMINED: "",
  NORMAL: "normal",
  FINDINGS: "findings",
};

const DOSE_UNIT: Record<string, string> = {
  MG_PER_M2: "mg/m2",
  MG: "mg",
};

/**
 * Renders the four prescription slots as the string the medication engine and
 * the printed report display.
 *
 * The slots are the stored fact; this string is a rendering of them. It is
 * built here rather than stored so that the two cannot disagree.
 */
export function describeDose(medication: {
  strength: string | null;
  doseAmount: Prisma.Decimal | null;
  doseUnit: string | null;
  morning: Prisma.Decimal;
  afternoon: Prisma.Decimal;
  evening: Prisma.Decimal;
  night: Prisma.Decimal;
  frequencyNote: string | null;
}): string {
  const parts: string[] = [];

  const amount = numeric(medication.doseAmount);
  if (amount !== "") parts.push(`${amount}${medication.doseUnit ? ` ${medication.doseUnit}` : ""}`);
  else if (medication.strength) parts.push(medication.strength);

  const slots = [medication.morning, medication.afternoon, medication.evening, medication.night].map(
    (slot) => {
      const value = numeric(slot);
      return value === "" ? 0 : value;
    }
  );

  if (slots.some((slot) => slot > 0)) {
    parts.push(slots.map((slot) => (Number.isInteger(slot) ? String(slot) : slot.toFixed(2))).join("-"));
  }

  if (medication.frequencyNote) parts.push(medication.frequencyNote);
  return parts.join(" ").trim();
}

/* ------------------------------------------------------- treatment course */

/**
 * Rebuilds the structured treatment course from the stored phases.
 *
 * Returns null when the plan has no phases, which is the correct shape for a
 * free-text regimen: the client treats null as "unstructured" and derives no
 * therapy classes from it. Reconstructing phases from `regimen` text here
 * would reintroduce exactly the parsing that lib/treatment-course.js refuses
 * to do, at the one layer where nobody would think to look for it.
 */
function toTreatmentCourse(plan: PatientWithClinicalData["therapyPlans"][number] | null) {
  if (!plan) return null;

  // Plans reaching here from a partial projection carry no phases at all,
  // which reads the same as a course that has none.
  const phases = plan.phases ?? [];

  const entryMethod = plan.entryMethod || (phases.length > 0 ? "builder" : "freeText");
  if (entryMethod === "freeText" || phases.length === 0) {
    if (!plan.regimen && !plan.regimenFamily) return null;
    return {
      entryMethod: "freeText",
      regimenId: plan.regimenLibraryId || null,
      regimenFamily: plan.regimenFamily || null,
      protocolVariant: null,
      freeTextDescription: plan.regimen || "",
      phases: [],
      activePhaseId: null,
      libraryVersion: null,
    };
  }

  return {
    entryMethod,
    regimenId: plan.regimenLibraryId || null,
    regimenFamily: plan.regimenFamily || null,
    protocolVariant: null,
    freeTextDescription: plan.regimen || "",
    phases: phases.map((phase) => ({
      id: phase.key,
      name: phase.name,
      sequence: phase.position + 1,
      agents: phase.agents.map((agent) => ({
        genericName: agent.name,
        drugClass: agent.drugClass,
        therapyClass: agent.therapyClass,
        corscTherapyClass: agent.corscTherapyClass,
        role: null,
      })),
      plannedCycles: phase.plannedCycles,
      duration: phase.duration,
      schedule: phase.schedule,
      maintenance: phase.maintenance,
      transitionCondition: phase.transitionCondition,
      activatedOn: isoDay(phase.activatedOn),
    })),
    activePhaseId: plan.activePhaseKey || phases[0]?.key || null,
    libraryVersion: null,
  };
}

/* ------------------------------------------------------------- projection */

function toEngineVisitRecord(visit: PatientWithClinicalData["visits"][number]) {
  const vitals = visit.vitals;

  const symptomDetail: Record<string, Record<string, string>> = {};
  visit.symptoms.forEach((entry) => {
    symptomDetail[entry.symptom] = {
      severity: entry.severity || "",
      duration: entry.duration || "",
      trigger: entry.trigger || "",
      radiation: entry.radiation || "",
      associated: entry.associated || "",
    };
  });

  const systems: Record<string, { status: string; components: Record<string, { normal: boolean; text: string }> }> = {};
  visit.systemExams.forEach((exam) => {
    const components: Record<string, { normal: boolean; text: string }> = {};
    exam.components.forEach((component) => {
      components[component.componentId] = {
        normal: component.normal,
        text: component.findings || "",
      };
    });
    systems[exam.systemId] = { status: SYSTEM_STATUS[exam.status] ?? "", components };
  });

  const inv: Record<string, Record<string, unknown>> = {};
  visit.investigations.forEach((entry) => {
    const value = numeric(entry.numericValue);
    inv[entry.investigationId] = {
      // `result` is what the engines read for both numeric and free-text
      // investigations, so a numeric value is surfaced through it as well as
      // through `value`.
      result: entry.resultText ?? (value === "" ? "" : String(value)),
      value,
      interp: entry.interpretation || "",
      date: isoDay(entry.measuredOn),
      comment: entry.comment || "",
      unit: entry.unit || "",
      assayId: entry.assayId || "",
      referenceUpperLimit: numeric(entry.referenceUpperLimit),
      laboratory: entry.laboratory || "",
      ...(entry.measurements ? { measurements: entry.measurements } : {}),
    };
  });

  const sinceLastVisit: Record<string, { present: boolean; detail: string }> = {};
  visit.intervalAnswers.forEach((answer) => {
    sinceLastVisit[answer.itemId] = { present: answer.present, detail: answer.detail || "" };
  });

  const taskCompletion: Record<string, boolean> = {};
  visit.taskCompletions.forEach((task) => {
    taskCompletion[task.taskId] = task.completed;
  });

  const medDecisions: Record<string, string> = {};
  visit.medicationDecisions.forEach((decision) => {
    medDecisions[decision.recommendationId] = decision.decision;
  });

  return {
    id: visit.id,
    type: visit.label || visit.visitType,
    visitType: visit.visitType,
    cycle: visit.cycleNumber,
    date: isoDay(visit.occurredOn),
    saved: visit.status === "FILED",
    firstReview: {
      cycle: visit.cycleNumber ?? "",
      tolerance: visit.tolerance || "",
      interimEvents: visit.interimEvents || "",
      admissions: visit.admissions || "",
      clinicalConcerns: visit.clinicalConcerns || "",
      earlyToxicity: visit.earlyToxicity || "",
    },
    vitals: {
      height: numeric(vitals?.heightCm),
      weight: numeric(vitals?.weightKg),
      referenceWeight: numeric(vitals?.referenceWeightKg),
      sbp: numeric(vitals?.systolicBp),
      dbp: numeric(vitals?.diastolicBp),
      pulse: numeric(vitals?.pulse),
      temp: numeric(vitals?.temperatureC),
      rr: numeric(vitals?.respiratoryRate),
      spo2: numeric(vitals?.spo2),
    },
    symptoms: visit.symptoms.map((entry) => entry.symptom),
    symptomDetail,
    sinceLastVisit,
    systems,
    inv,
    hfStatus: visit.heartFailureStatus || "",
    medReview: visit.medicationReview || "",
    medDecisions,
    taskCompletion,
    plan: visit.plan || "",
    notes: visit.notes || "",
    nextFollowUpDate: isoDay(visit.nextFollowUpOn),
    aiSummary: visit.generatedSummary || "",
    alerts: [],
  };
}

/**
 * Assembles the object the clinical engines consume.
 *
 * `migratePatient` is applied at the end for the same reason the browser store
 * applies it: it fills in every field the engines expect with the same
 * defaults, so this adapter cannot drift from the shape the rest of the
 * application uses.
 */
export function toEnginePatientRecord(patient: PatientWithClinicalData) {
  const primaryDiagnosis =
    patient.diagnoses.find((diagnosis) => diagnosis.isPrimary && diagnosis.active) ||
    patient.diagnoses.find((diagnosis) => diagnosis.active) ||
    patient.diagnoses[0] ||
    null;

  // The active plans, in order. Therapy classes are unioned across them
  // because a patient on an anthracycline plan and a HER2 plan is on both, and
  // discarding either would change which proformas the risk engine runs.
  const activePlans = patient.therapyPlans.filter((plan) => plan.active);
  const plans = activePlans.length > 0 ? activePlans : patient.therapyPlans;
  const therapy = Array.from(
    new Set(plans.flatMap((plan) => plan.classes.map((entry) => entry.therapyClass)))
  );
  const leadPlan = plans[0] ?? null;

  const tiers: Record<string, Record<string, boolean>> = { veryHigh: {}, high: {}, m2: {}, m1: {} };
  patient.riskFactors.forEach((factor) => {
    if (!factor.present) return;
    const key = TIER_KEY[factor.tier];
    if (key) tiers[key][factor.factorId] = true;
  });

  const history: Record<string, { checks: Record<string, boolean>; fields: Record<string, string> }> = {};
  patient.historyEntries.forEach((entry) => {
    const group = (history[entry.groupId] ||= { checks: {}, fields: {} });
    if (entry.kind === "CHECK") {
      if (entry.checked) group.checks[entry.itemId] = true;
    } else if (entry.value) {
      group.fields[entry.itemId] = entry.value;
    }
  });

  const contraindications: { absolute: Record<string, boolean>; relative: Record<string, boolean> } = {
    absolute: {},
    relative: {},
  };
  patient.contraindications.forEach((entry) => {
    if (!entry.present) return;
    const bucket = entry.severity === "ABSOLUTE" ? contraindications.absolute : contraindications.relative;
    bucket[entry.factorId] = true;
  });

  const toxicity = patient.toxicityStatus;
  const restratification = {
    myocarditisConfirmed: Boolean(toxicity?.myocarditisConfirmed),
    severeHF: Boolean(toxicity?.severeHeartFailure),
    troponinRise: Boolean(toxicity?.troponinRise),
    glsFall: numeric(toxicity?.glsFallPercent),
    currentLVEF: numeric(toxicity?.currentLvef),
  };

  const baseline = patient.baseline;

  const assembled = migratePatient({
    id: patient.id,
    patientId: patient.hospitalPatientId || "",
    mrn: patient.mrn || "",
    name: patient.name,
    age: numeric(patient.ageAtRegistration),
    dateOfBirth: isoDay(patient.dateOfBirth),
    gender: SEX_LABEL[patient.sex] ?? "Not recorded",

    diagnosis: primaryDiagnosis?.primarySite || "",
    stage: primaryDiagnosis?.stage || "",

    regimen: leadPlan?.regimen || "",
    treatmentCourse: toTreatmentCourse(leadPlan),
    therapy,
    plannedCycles: numeric(leadPlan?.plannedCycles),
    cycleFrequency: leadPlan?.cycleFrequency || "",
    totalPlannedDose: numeric(leadPlan?.plannedCumulativeDose),
    cycle: leadPlan?.currentCycle ?? 0,

    baselineLVEF: numeric(baseline?.lvef),
    baselineGLS: numeric(baseline?.gls),
    baselineQTc: numeric(baseline?.qtc),
    baselineTroponin: numeric(baseline?.troponin),
    baselineNtProBnp: numeric(baseline?.ntProBnp),
    baselineWeight: numeric(baseline?.weightKg),
    baselineHeight: numeric(baseline?.heightCm),
    troponinAssay: baseline?.troponinAssayId || "hs-cTnT",
    troponinURL: numeric(baseline?.troponinLocalUrl),

    ...tiers,
    history,
    contraindications,
    restratification,

    medications: patient.medications
      .filter((medication) => medication.active)
      .map((medication) => ({
        id: medication.id,
        name: medication.displayName,
        dose: describeDose(medication),
        klass: medication.medicationClass || "other",
      })),

    anthracyclineDoses: patient.anthracyclineDoses.map((dose) => ({
      id: dose.id,
      agent: dose.agentId,
      dose: numeric(dose.dose),
      unit: DOSE_UNIT[dose.doseUnit] ?? "mg/m2",
      bsa: numeric(dose.bsa),
      cycle: dose.cycleNumber,
      date: isoDay(dose.givenOn),
      modelId: dose.equivalenceModelId,
      conversionFailureReason: dose.conversionFailureReason,
    })),

    overrides: patient.overrides.map((override) => ({
      id: override.id,
      target: override.target,
      subjectId: override.subjectId,
      algorithmicValue: override.algorithmicValue,
      clinicianValue: override.clinicianValue,
      reason: override.reason,
      clinician: { id: override.clinicianId },
      at: override.createdAt.toISOString(),
      active: !override.withdrawnAt,
      withdrawnAt: override.withdrawnAt ? override.withdrawnAt.toISOString() : null,
      withdrawnReason: override.withdrawnReason,
    })),

    clinicalStatus: patient.clinicalStatus,
    registeredDate: isoDay(patient.registeredOn),
    visits: patient.visits.map(toEngineVisitRecord),
  });

  // The baseline risk category, computed rather than stored. Every consumer
  // downstream — surveillance intervals, medication context, the timeline —
  // reads patient.risk, and a column would let it go stale the moment a risk
  // factor was recorded.
  assembled.risk = assessRisk(assembled);

  return assembled;
}

/** The draft (unfiled) visit, which the workflow treats as the current encounter. */
export function draftVisitOf(patient: PatientWithClinicalData) {
  const draft = [...patient.visits].reverse().find((visit) => visit.status === "DRAFT");
  return draft ? toEngineVisitRecord(draft) : null;
}
