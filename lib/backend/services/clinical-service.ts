/* =========================================================================
   Clinical assessment.

   This module runs the engines and stores what they said. It contains no
   clinical logic of its own — no threshold, no category boundary, no grading
   rule — and it must stay that way. There is exactly one implementation of
   HFA-ICOS in this codebase and it is lib/hfa-icos.js; a second one here,
   however small, would eventually disagree with the first, and the two would
   be indistinguishable from the outside.

   What this module does add is the record-keeping the engines deliberately do
   not do:

     - it assembles the patient from the database (via engine-patient),
     - it calls the engine,
     - it stores the result with the engine version and the rules version,
     - it writes the audit entry.

   TWO AXES, KEPT APART

   assessBaseline() answers "what was this patient's cardiovascular risk before
   therapy". assessCurrentToxicity() answers "what has happened since". They
   are stored as different assessment kinds and neither ever writes to the
   other. A troponin rise after cycle four is not evidence that the baseline
   assessment was wrong, and a system that let it overwrite the baseline would
   destroy the only record of what was known when treatment was agreed.
   ========================================================================= */

import type { AssessmentKind, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { recordAudit } from "@/lib/backend/services/audit-service";
import { CORSC_RULES_VERSION, ENGINES } from "@/lib/backend/services/engine-versions";
import {
  draftVisitOf,
  enginePatientInclude,
  toEnginePatientRecord,
} from "@/lib/backend/services/engine-patient";

import {
  anthracyclineLedger,
  assessBaselineRisk,
  assessCtrCvt,
  assessFitness,
  getClinicalSignals,
  getDynamicSurveillanceTasks,
  getNextFollowUpPlan,
  interpretNatriuretic,
  interpretTroponin,
  type EngineVisit,
} from "@/lib/backend/services/engines";
import { buildClinicalPicture } from "@/lib/clinical-picture";
import {
  createEncounter,
  encounterVitals,
  toEnginePatient,
  toEngineVisit,
} from "@/lib/patient-model";
import { buildInvestigationTimeline, outstandingInvestigations } from "@/lib/investigation-timeline";

export interface AssessmentContext {
  actor: AuthenticatedActor;
  requestId: string;
  visitId?: string | null;
}

/* --------------------------------------------------------------- loading */

/**
 * Loads a patient and the encounter an assessment applies to.
 *
 * When no visit is named, the draft encounter is used — that is the one the
 * clinician is working in. When there is no draft either, an empty encounter
 * stands in, so a baseline assessment can be produced for a patient who has
 * not yet been seen.
 */
async function loadContext(patientId: string, visitId?: string | null) {
  const row = await prisma.patient.findUnique({
    where: { id: patientId },
    include: enginePatientInclude,
  });
  if (!row) throw ApiError.notFound("Patient not found.");

  const patient = toEnginePatientRecord(row);
  const visits = patient.visits as EngineVisit[];

  let encounter: EngineVisit | null = null;
  if (visitId) {
    const named = visits.find((visit) => visit.id === visitId);
    if (!named) {
      throw ApiError.invalidRequest("That encounter does not belong to this patient.");
    }
    encounter = named;
  } else {
    encounter = (draftVisitOf(row) as EngineVisit | null) || visits[visits.length - 1] || null;
  }

  return { row, patient, visits, encounter: encounter ?? (createEncounter("Baseline") as EngineVisit) };
}

/**
 * The stored visit an assessment should be filed against, or null.
 *
 * When a patient has no encounters yet, loadContext stands in an empty one so
 * that a baseline assessment can still be produced. That stand-in has a
 * client-style identifier and no row behind it, so it must not be written into
 * a foreign key — hence the membership check rather than a bare `encounter.id`.
 */
function storedVisitId(visits: EngineVisit[], candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  return visits.some((visit) => visit.id === candidate) ? candidate : null;
}

/* ------------------------------------------------------------ persistence */

interface StoreInput {
  patientId: string;
  visitId?: string | null;
  kind: AssessmentKind;
  engine: { id: string; version: string };
  category?: string | null;
  score?: number | null;
  verification?: string | null;
  result: unknown;
  inputs: unknown;
  context: AssessmentContext;
  auditAction: string;
  auditDetail: string;
}

async function storeAssessment(input: StoreInput) {
  const assessment = await prisma.assessment.create({
    data: {
      patientId: input.patientId,
      visitId: input.visitId ?? null,
      kind: input.kind,
      engine: input.engine.id,
      engineVersion: input.engine.version,
      rulesVersion: CORSC_RULES_VERSION,
      category: input.category ?? null,
      score: input.score ?? null,
      verification: input.verification ?? null,
      result: input.result as Prisma.InputJsonValue,
      inputs: input.inputs as Prisma.InputJsonValue,
      computedById: input.context.actor.clinician.id,
    },
  });

  await recordAudit(prisma, {
    patientId: input.patientId,
    actorId: input.context.actor.clinician.id,
    action: input.auditAction,
    category: "clinical",
    entity: "Assessment",
    entityId: assessment.id,
    requestId: input.context.requestId,
    detail: input.auditDetail,
  });

  return assessment;
}

/* ---------------------------------------------------------- baseline risk */

/**
 * Baseline cardiovascular risk, on the HFA-ICOS proformas.
 *
 * Stored with every factor that was scored and the workings, not just the
 * category. A record that says only "High" cannot be checked, cannot be
 * explained to a patient, and cannot be re-examined if a factor turns out to
 * have been recorded in error.
 */
export async function assessBaseline(patientId: string, context: AssessmentContext) {
  const { patient, visits } = await loadContext(patientId, context.visitId);

  // Baseline biomarkers are interpreted first, because "elevated baseline
  // troponin" is a proforma factor and has to be decided against this
  // patient's own assay rather than a universal number.
  const troponin = interpretTroponin({
    value: patient.baselineTroponin,
    assayId: patient.troponinAssay,
    sex: patient.gender,
    localURL: patient.troponinURL,
  });
  const natriuretic = interpretNatriuretic({ value: patient.baselineNtProBnp, age: patient.age });

  const engineContext = {
    baselineTroponinElevated: Boolean(troponin.recorded && troponin.aboveURL),
    baselineNatrioureticElevated: Boolean(natriuretic.recorded && natriuretic.aboveThreshold),
  };

  const result = assessBaselineRisk(patient, engineContext);

  const assessment = await storeAssessment({
    patientId,
    visitId: storedVisitId(visits, context.visitId),
    kind: "BASELINE_RISK",
    engine: ENGINES.hfaIcos,
    category: result.applicable ? result.category : null,
    score: typeof result.points === "number" ? result.points : null,
    verification: result.provenance?.verification ?? null,
    result,
    inputs: {
      therapy: patient.therapy,
      age: patient.age,
      sex: patient.gender,
      baselineLVEF: patient.baselineLVEF,
      baselineGLS: patient.baselineGLS,
      troponinAssay: patient.troponinAssay,
      ...engineContext,
      // The identifiers of every factor scored, so the assessment can be
      // reproduced without re-reading the patient as they are today.
      factors: (result.factors || []).map((factor: { id: string; present?: boolean }) => ({
        id: factor.id,
        present: Boolean(factor.present),
      })),
    },
    context,
    auditAction: "riskCalculated",
    auditDetail: result.applicable
      ? `Baseline HFA-ICOS risk assessed as ${result.category}.`
      : "Baseline risk not applicable: no planned therapy has a published proforma.",
  });

  return { assessment: serialise(assessment), result };
}

/* -------------------------------------------------- current toxicity axis */

/**
 * Current cardiovascular toxicity — the second axis.
 *
 * Deliberately a separate assessment kind from BASELINE_RISK, written to a
 * different row, and never merged into it.
 */
export async function assessCurrentToxicity(patientId: string, context: AssessmentContext) {
  const { patient, visits, encounter } = await loadContext(patientId, context.visitId);
  const visitId = storedVisitId(visits, encounter.id || context.visitId);

  const enginePatient = toEnginePatient(patient);
  const engineVisit = toEngineVisit(encounter);
  const signals = getClinicalSignals(enginePatient, engineVisit);

  const result = assessCtrCvt({
    patient,
    encounter,
    troponin: signals.troponin,
    natriuretic: signals.natriuretic,
    ecg: signals.ecg,
    currentLVEF: signals.ctrcd?.evidence?.currentLVEF ?? null,
    glsRelativeFall: signals.glsFall,
    symptoms: encounter.symptoms ?? [],
  });

  const assessment = await storeAssessment({
    patientId,
    visitId,
    kind: "CTR_CVT",
    engine: ENGINES.ctrCvt,
    category: result.overall ?? null,
    verification: result.provenance?.verification ?? null,
    result,
    inputs: {
      therapy: patient.therapy,
      baselineLVEF: patient.baselineLVEF,
      troponin: signals.troponin,
      natriuretic: signals.natriuretic,
      glsFall: signals.glsFall,
      symptoms: encounter.symptoms ?? [],
    },
    context,
    auditAction: "toxicityGraded",
    auditDetail: `Current cardiovascular toxicity graded. The baseline risk assessment is unchanged.`,
  });

  // Store the CTRCD grade separately as well: it is the thing surveillance and
  // fitness read, and having it as its own row makes "when did this patient
  // first develop moderate CTRCD" a query rather than a scan.
  if (signals.ctrcd) {
    await storeAssessment({
      patientId,
      visitId,
      kind: "CTRCD",
      engine: ENGINES.ctrcd,
      category: signals.ctrcd.grade,
      result: signals.ctrcd,
      inputs: {
        baselineLVEF: patient.baselineLVEF,
        currentLVEF: signals.ctrcd.evidence?.currentLVEF ?? null,
        glsRelativeFall: signals.glsFall,
      },
      context,
      auditAction: "toxicityGraded",
      auditDetail: `CTRCD graded as ${signals.ctrcd.label ?? signals.ctrcd.grade}.`,
    });
  }

  return { assessment: serialise(assessment), result, ctrcd: signals.ctrcd };
}

/* ------------------------------------------------------ fitness to proceed */

/**
 * Fitness to proceed with the next cycle.
 *
 * The wording the engine produces is a decision-support prompt for the
 * treating team — "hold", "proceed with caution" — and is stored and returned
 * unchanged. It is not an instruction, and nothing here should present it as
 * one. The treating clinician decides.
 */
export async function assessFitnessToProceed(patientId: string, context: AssessmentContext) {
  const { patient, visits, encounter } = await loadContext(patientId, context.visitId);

  const enginePatient = toEnginePatient(patient);
  const engineVisit = toEngineVisit(encounter);
  const signals = getClinicalSignals(enginePatient, engineVisit);
  const vitals = encounterVitals(patient, encounter);
  const timeline = buildInvestigationTimeline(patient, encounter);
  const outstanding = outstandingInvestigations(timeline);
  const ledger = anthracyclineLedger(patient);

  const result = assessFitness({ patient, encounter, signals, vitals, outstanding, ledger });

  const assessment = await storeAssessment({
    patientId,
    visitId: storedVisitId(visits, encounter.id || context.visitId),
    kind: "FITNESS",
    engine: ENGINES.fitness,
    category: result.verdict,
    result,
    inputs: {
      therapy: patient.therapy,
      ctrcdGrade: signals.ctrcd?.grade ?? null,
      suspectedICIMyocarditis: signals.suspectedICIMyocarditis,
      myocarditisConfirmed: signals.myocarditisConfirmed,
      cumulativeDose: ledger?.total ?? null,
      outstanding: (outstanding as Array<{ id: string }>).map((item) => item.id),
    },
    context,
    auditAction: "fitnessAssessed",
    auditDetail: `Fitness to proceed assessed as "${result.label}". A prompt for the treating team, not a treatment decision.`,
  });

  return { assessment: serialise(assessment), result };
}

/* ------------------------------------------------------------ surveillance */

/**
 * Recalculates the surveillance plan and persists it.
 *
 * Every recommendation is stored with the reason the engine gave, the source
 * it came from and whether that source is a guideline or a CORSC operational
 * scheduling convention. "Echo due" on its own is not a record; "echo due
 * because cumulative doxorubicin-equivalent exposure passed 250 mg/m², from
 * this source" is.
 *
 * Previous recommendations are marked superseded rather than deleted, so the
 * record still shows what was recommended at an earlier encounter and whether
 * it was done.
 */
export async function recalculateSurveillance(patientId: string, context: AssessmentContext) {
  const { patient, visits, encounter } = await loadContext(patientId, context.visitId);

  const enginePatient = toEnginePatient(patient);
  const engineVisit = toEngineVisit(encounter);

  const tasks = getDynamicSurveillanceTasks(enginePatient, engineVisit);
  const followUp = getNextFollowUpPlan(enginePatient, engineVisit);
  const signals = getClinicalSignals(enginePatient, engineVisit);

  const linkedVisitId = storedVisitId(visits, encounter.id || context.visitId);

  const therapyPlan = await prisma.therapyPlan.findFirst({
    where: { patientId, active: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const dueDate = followUp.date ? new Date(`${followUp.date}T00:00:00.000Z`) : null;

  const stored = await prisma.$transaction(async (tx) => {
    // Anything still outstanding from a previous run is superseded by this
    // one. Completed recommendations are left alone: they are the record that
    // the investigation was done.
    await tx.surveillanceRecommendation.updateMany({
      where: { patientId, status: "DUE" },
      data: { status: "SUPERSEDED" },
    });

    const rows = tasks.map((task) => ({
      patientId,
      visitId: linkedVisitId,
      therapyPlanId: therapyPlan?.id ?? null,
      taskId: task.id,
      label: task.label,
      investigationId: task.kind === "investigation" ? task.id : null,
      priority: task.priority,
      dueOn: task.priority === "urgent" ? new Date() : dueDate,
      dueDescription: task.when ?? null,
      reason: task.why || task.label,
      sourceId: task.provenance?.sourceId ?? null,
      sourceLocator: task.provenance?.locator ?? null,
      verification: task.provenance?.verification ?? null,
      escalationReason: task.trigger ?? null,
      riskCategory: patient.risk?.category ?? null,
      toxicityGrade: signals.ctrcd?.grade ?? null,
      engine: ENGINES.surveillance.id,
      engineVersion: ENGINES.surveillance.version,
      rulesVersion: CORSC_RULES_VERSION,
      status: "DUE" as const,
    }));

    if (rows.length) await tx.surveillanceRecommendation.createMany({ data: rows });

    await tx.followUp.updateMany({
      where: { patientId, status: "PLANNED" },
      data: { status: "CANCELLED" },
    });

    const plan = await tx.followUp.create({
      data: {
        patientId,
        visitId: linkedVisitId,
        followUpType: followUp.band === "routine" ? "routine" : "escalated",
        acuity: followUp.band,
        plannedOn: dueDate,
        reasons: followUp.reasons ?? [],
        engine: ENGINES.surveillance.id,
        engineVersion: ENGINES.surveillance.version,
        rulesVersion: CORSC_RULES_VERSION,
      },
    });

    return { recommendations: rows.length, followUpId: plan.id };
  });

  await storeAssessment({
    patientId,
    visitId: linkedVisitId,
    kind: "SURVEILLANCE",
    engine: ENGINES.surveillance,
    category: followUp.band,
    result: { tasks, followUp },
    inputs: {
      therapy: patient.therapy,
      risk: patient.risk?.category ?? null,
      cycle: patient.cycle,
      ctrcdGrade: signals.ctrcd?.grade ?? null,
      elevatedTroponin: signals.elevatedTroponin,
      glsFall: signals.glsFall,
    },
    context,
    auditAction: "surveillanceChanged",
    auditDetail: `Surveillance plan recalculated: ${stored.recommendations} recommendations, next review ${followUp.label.toLowerCase()}.`,
  });

  return { tasks, followUp, ...stored };
}

/** Marks a surveillance recommendation done. */
export async function completeSurveillance(
  recommendationId: string,
  input: { completedOn?: string | null; note?: string | null },
  context: AssessmentContext
) {
  const existing = await prisma.surveillanceRecommendation.findUnique({
    where: { id: recommendationId },
    select: { id: true, patientId: true, label: true, status: true },
  });
  if (!existing) throw ApiError.notFound("Surveillance recommendation not found.");
  if (existing.status === "COMPLETED") throw ApiError.conflict("This recommendation is already recorded as done.");

  const completedOn = input.completedOn ? new Date(`${input.completedOn}T00:00:00.000Z`) : new Date();

  const [updated] = await prisma.$transaction([
    prisma.surveillanceRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: "COMPLETED",
        completedOn,
        completedById: context.actor.clinician.id,
        completionNote: input.note ?? null,
      },
    }),
    prisma.auditEvent.create({
      data: {
        patientId: existing.patientId,
        actorId: context.actor.clinician.id,
        action: "surveillanceCompleted",
        category: "clinical",
        entity: "SurveillanceRecommendation",
        entityId: recommendationId,
        requestId: context.requestId,
        detail: `${existing.label} recorded as done.`,
      },
    }),
  ]);

  return updated;
}

/* ------------------------------------------------------- clinical picture */

/**
 * Everything the workflow shows, computed in one pass.
 *
 * The same function the browser calls today, run on the server against the
 * database record. Nothing here re-derives what buildClinicalPicture already
 * decides.
 */
export async function buildPicture(patientId: string, visitId?: string | null) {
  const { patient, encounter } = await loadContext(patientId, visitId);
  return { patient, encounter, picture: buildClinicalPicture(patient, encounter) };
}

/* ------------------------------------------------------------- retrieval */

export async function listAssessments(
  patientId: string,
  kind: AssessmentKind,
  limit = 20
) {
  const rows = await prisma.assessment.findMany({
    where: { patientId, kind },
    orderBy: { computedAt: "desc" },
    take: limit,
  });
  return rows.map(serialise);
}

function serialise<T extends { score?: unknown }>(assessment: T) {
  return {
    ...assessment,
    score: assessment.score === null || assessment.score === undefined ? null : Number(assessment.score),
  };
}
