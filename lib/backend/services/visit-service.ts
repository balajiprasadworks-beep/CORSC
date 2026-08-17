/* =========================================================================
   Visits.

   A visit is the unit of clinical contact: everything observed at one
   encounter hangs off it. Two behaviours are worth stating.

   A DRAFT IS STILL A RECORD. The workflow opens a draft encounter as soon as a
   patient is opened, and the clinician works in it for the length of the
   consultation. It is stored from the first keystroke, with DRAFT status, so
   an interrupted encounter survives a closed laptop and not only a closed tab.

   FILING IS ONE-WAY AND CAPTURED. Filing stamps the encounter and stores the
   generated summary as it read at that moment. Regenerating that summary later
   from today's engines would change what the record says was written, which is
   not a thing a clinical record may do.
   ========================================================================= */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { recordAudit } from "@/lib/backend/services/audit-service";

export interface VisitActor {
  actor: AuthenticatedActor;
  requestId: string;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const visitInclude = {
  vitals: true,
  symptoms: true,
  systemExams: { include: { components: true } },
  intervalAnswers: true,
  taskCompletions: true,
  medicationDecisions: true,
  investigations: true,
} satisfies Prisma.VisitInclude;

export async function listVisits(patientId: string) {
  return prisma.visit.findMany({
    where: { patientId },
    orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
    include: visitInclude,
  });
}

export async function getVisit(visitId: string) {
  const visit = await prisma.visit.findUnique({ where: { id: visitId }, include: visitInclude });
  if (!visit) throw ApiError.notFound("Encounter not found.");
  return visit;
}

/** Confirms the visit belongs to the patient the caller was authorised for. */
export async function visitPatientId(visitId: string): Promise<string> {
  const visit = await prisma.visit.findUnique({ where: { id: visitId }, select: { patientId: true } });
  if (!visit) throw ApiError.notFound("Encounter not found.");
  return visit.patientId;
}

export interface CreateVisitInput {
  visitType: string;
  label?: string | null;
  cycleNumber?: number | null;
  occurredOn: string | null;
  legacyId?: string | null;
}

export async function createVisit(patientId: string, input: CreateVisitInput, options: VisitActor) {
  const visit = await prisma.visit.create({
    data: {
      patientId,
      clinicianId: options.actor.clinician.id,
      visitType: input.visitType,
      label: input.label ?? null,
      cycleNumber: input.cycleNumber ?? null,
      occurredOn: toDate(input.occurredOn) ?? new Date(),
      legacyId: input.legacyId ?? null,
    },
    include: visitInclude,
  });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "encounterStarted",
    category: "encounter",
    entity: "Visit",
    entityId: visit.id,
    requestId: options.requestId,
    detail: `${input.label || input.visitType} encounter opened.`,
  });

  return visit;
}

/* ----------------------------------------------------------------- update */

export interface UpdateVisitInput {
  visitType?: string;
  label?: string | null;
  cycleNumber?: number | null;
  occurredOn?: string | null;
  tolerance?: string | null;
  interimEvents?: string | null;
  admissions?: string | null;
  clinicalConcerns?: string | null;
  earlyToxicity?: string | null;
  heartFailureStatus?: string | null;
  medicationReview?: string | null;
  plan?: string | null;
  notes?: string | null;
  nextFollowUpOn?: string | null;
  vitals?: Record<string, number | null | undefined>;
  symptoms?: Array<{
    symptom: string;
    severity?: string | null;
    duration?: string | null;
    trigger?: string | null;
    radiation?: string | null;
    associated?: string | null;
  }>;
  systemExams?: Array<{
    systemId: string;
    status: "NOT_EXAMINED" | "NORMAL" | "FINDINGS";
    components: Array<{ componentId: string; normal: boolean; findings?: string | null }>;
  }>;
  intervalAnswers?: Array<{ itemId: string; present: boolean; detail?: string | null }>;
  taskCompletions?: Array<{ taskId: string; completed: boolean }>;
  medicationDecisions?: Array<{ recommendationId: string; decision: string; note?: string | null }>;
  expectedUpdatedAt?: string | null;
}

export async function updateVisit(visitId: string, input: UpdateVisitInput, options: VisitActor) {
  const existing = await prisma.visit.findUnique({
    where: { id: visitId },
    select: { id: true, patientId: true, status: true, updatedAt: true },
  });
  if (!existing) throw ApiError.notFound("Encounter not found.");

  // A filed encounter is the clinical record of a consultation that happened.
  // Amending it is a deliberate act, not an autosave, so it is refused here
  // and an addendum encounter is the supported route.
  if (existing.status === "FILED") {
    throw ApiError.conflict(
      "This encounter has been filed. Record an addendum encounter rather than amending the filed one."
    );
  }

  if (input.expectedUpdatedAt) {
    const expected = new Date(input.expectedUpdatedAt);
    if (Number.isFinite(expected.getTime()) && expected.getTime() !== existing.updatedAt.getTime()) {
      throw ApiError.conflict("This encounter was changed by someone else after you opened it.", {
        serverUpdatedAt: existing.updatedAt.toISOString(),
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    const data: Prisma.VisitUpdateInput = {};
    if (input.visitType !== undefined) data.visitType = input.visitType;
    if (input.label !== undefined) data.label = input.label;
    if (input.cycleNumber !== undefined) data.cycleNumber = input.cycleNumber;
    if (input.occurredOn !== undefined) {
      const occurred = toDate(input.occurredOn);
      if (occurred) data.occurredOn = occurred;
    }
    (
      [
        "tolerance",
        "interimEvents",
        "admissions",
        "clinicalConcerns",
        "earlyToxicity",
        "heartFailureStatus",
        "medicationReview",
        "plan",
        "notes",
      ] as const
    ).forEach((field) => {
      if (input[field] !== undefined) (data as Record<string, unknown>)[field] = input[field];
    });
    if (input.nextFollowUpOn !== undefined) data.nextFollowUpOn = toDate(input.nextFollowUpOn);

    await tx.visit.update({ where: { id: visitId }, data });

    if (input.vitals) {
      const vitals = {
        heightCm: input.vitals.heightCm ?? null,
        weightKg: input.vitals.weightKg ?? null,
        referenceWeightKg: input.vitals.referenceWeightKg ?? null,
        systolicBp: input.vitals.systolicBp ?? null,
        diastolicBp: input.vitals.diastolicBp ?? null,
        pulse: input.vitals.pulse ?? null,
        respiratoryRate: input.vitals.respiratoryRate ?? null,
        spo2: input.vitals.spo2 ?? null,
        temperatureC: input.vitals.temperatureC ?? null,
      };
      await tx.visitVitals.upsert({ where: { visitId }, create: { visitId, ...vitals }, update: vitals });
    }

    if (input.symptoms) {
      await tx.visitSymptom.deleteMany({ where: { visitId } });
      if (input.symptoms.length) {
        await tx.visitSymptom.createMany({
          data: input.symptoms.map((entry) => ({
            visitId,
            symptom: entry.symptom,
            severity: entry.severity ?? null,
            duration: entry.duration ?? null,
            trigger: entry.trigger ?? null,
            radiation: entry.radiation ?? null,
            associated: entry.associated ?? null,
          })),
        });
      }
    }

    if (input.systemExams) {
      await tx.visitSystemExam.deleteMany({ where: { visitId } });
      for (const exam of input.systemExams) {
        await tx.visitSystemExam.create({
          data: {
            visitId,
            systemId: exam.systemId,
            status: exam.status,
            components: exam.components.length
              ? {
                  createMany: {
                    data: exam.components.map((component) => ({
                      componentId: component.componentId,
                      normal: component.normal,
                      findings: component.findings ?? null,
                    })),
                  },
                }
              : undefined,
          },
        });
      }
    }

    if (input.intervalAnswers) {
      await tx.visitIntervalAnswer.deleteMany({ where: { visitId } });
      if (input.intervalAnswers.length) {
        await tx.visitIntervalAnswer.createMany({
          data: input.intervalAnswers.map((answer) => ({
            visitId,
            itemId: answer.itemId,
            present: answer.present,
            detail: answer.detail ?? null,
          })),
        });
      }
    }

    if (input.taskCompletions) {
      await tx.visitTaskCompletion.deleteMany({ where: { visitId } });
      if (input.taskCompletions.length) {
        await tx.visitTaskCompletion.createMany({
          data: input.taskCompletions.map((task) => ({
            visitId,
            taskId: task.taskId,
            completed: task.completed,
          })),
        });
      }
    }

    if (input.medicationDecisions) {
      await tx.visitMedicationDecision.deleteMany({ where: { visitId } });
      const rows = input.medicationDecisions.filter((decision) => decision.decision);
      if (rows.length) {
        await tx.visitMedicationDecision.createMany({
          data: rows.map((decision) => ({
            visitId,
            recommendationId: decision.recommendationId,
            decision: decision.decision,
            note: decision.note ?? null,
          })),
        });
      }
    }
  });

  await recordAudit(prisma, {
    patientId: existing.patientId,
    actorId: options.actor.clinician.id,
    action: "encounterEdited",
    category: "encounter",
    entity: "Visit",
    entityId: visitId,
    requestId: options.requestId,
    detail: "Encounter updated.",
  });

  return getVisit(visitId);
}

/* ------------------------------------------------------------------ filing */

export async function fileVisit(
  visitId: string,
  input: { generatedSummary?: string | null },
  options: VisitActor
) {
  const existing = await prisma.visit.findUnique({
    where: { id: visitId },
    select: { id: true, patientId: true, status: true, cycleNumber: true },
  });
  if (!existing) throw ApiError.notFound("Encounter not found.");
  if (existing.status === "FILED") throw ApiError.conflict("This encounter has already been filed.");

  const visit = await prisma.$transaction(async (tx) => {
    const filed = await tx.visit.update({
      where: { id: visitId },
      data: {
        status: "FILED",
        filedAt: new Date(),
        generatedSummary: input.generatedSummary ?? null,
      },
      include: visitInclude,
    });

    // Filing a cycle review advances the plan's cycle counter, but never
    // backwards: a retrospectively entered earlier encounter must not reset
    // where the patient has actually got to.
    if (filed.cycleNumber && filed.cycleNumber > 0) {
      const plan = await tx.therapyPlan.findFirst({
        where: { patientId: existing.patientId, active: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, currentCycle: true },
      });
      if (plan && filed.cycleNumber > plan.currentCycle) {
        await tx.therapyPlan.update({
          where: { id: plan.id },
          data: { currentCycle: filed.cycleNumber },
        });
      }
    }

    return filed;
  });

  await recordAudit(prisma, {
    patientId: existing.patientId,
    actorId: options.actor.clinician.id,
    action: "encounterFiled",
    category: "encounter",
    entity: "Visit",
    entityId: visitId,
    requestId: options.requestId,
    detail: `Encounter filed${visit.cycleNumber ? ` at cycle ${visit.cycleNumber}` : ""}.`,
  });

  return visit;
}
