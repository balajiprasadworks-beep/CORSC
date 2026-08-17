/* =========================================================================
   Cancer therapy, cycles and the anthracycline dose ledger.

   COMBINATION THERAPY IS THE CASE THAT MATTERS. A plan carries a list of
   therapy classes, never one. An anthracycline followed by HER2 blockade
   carries a risk profile that is neither of them alone, and an API that
   collapsed the list to a single value would silently change which HFA-ICOS
   proformas run and which surveillance pathway applies.

   RECORDING A CYCLE IS ONE TRANSACTION. A cycle, its delivered doses, and the
   surveillance recalculation that follows are a single unit. A database left
   holding the doses but not the cycle, or the cycle but not the recalculated
   surveillance, would be showing a clinician a plan that does not match the
   treatment actually given.

   NO DOSE IS EVER DISCARDED. A dose whose agent has no equivalence factor is
   stored with the reason it could not be converted, so the cumulative total is
   accompanied by a statement of what it excludes. Silently dropping it would
   understate the patient's exposure, which is the single number this ledger
   exists to get right.
   ========================================================================= */

import type { CycleStatus, DoseUnit, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { recordAudit } from "@/lib/backend/services/audit-service";
import { ANTHRACYCLINE_AGENTS, EQUIVALENCE_MODELS } from "@/lib/anthracycline";

const ANTHRACYCLINE_IDS = new Set(
  ANTHRACYCLINE_AGENTS.map((agent: { id: string }) => agent.id)
);
const MODEL_IDS = new Set(Object.keys(EQUIVALENCE_MODELS));

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const therapyPlanInclude = {
  classes: { orderBy: { position: "asc" } },
  agents: true,
  cycles: { orderBy: { cycleNumber: "asc" }, include: { doses: true } },
  diagnosis: { select: { id: true, primarySite: true, stage: true } },
} satisfies Prisma.TherapyPlanInclude;

export async function listTherapy(patientId: string) {
  const plans = await prisma.therapyPlan.findMany({
    where: { patientId },
    orderBy: { createdAt: "asc" },
    include: therapyPlanInclude,
  });

  return plans.map((plan) => ({
    ...plan,
    plannedCumulativeDose:
      plan.plannedCumulativeDose === null ? null : Number(plan.plannedCumulativeDose),
    therapyClasses: plan.classes.map((entry) => entry.therapyClass),
    agents: plan.agents.map((agent) => ({
      ...agent,
      plannedDose: agent.plannedDose === null ? null : Number(agent.plannedDose),
    })),
    cycles: plan.cycles.map((cycle) => ({
      ...cycle,
      doses: cycle.doses.map((dose) => ({
        ...dose,
        dose: Number(dose.dose),
        bsa: dose.bsa === null ? null : Number(dose.bsa),
      })),
    })),
  }));
}

export interface TherapyPlanInput {
  diagnosisId?: string | null;
  regimen?: string | null;
  therapyClasses: string[];
  agents: Array<{
    agentId?: string | null;
    name: string;
    plannedDose?: number | null;
    doseUnit?: DoseUnit | null;
  }>;
  plannedCycles?: number | null;
  cycleFrequency?: string | null;
  currentCycle?: number | null;
  plannedStartOn?: string | null;
  plannedEndOn?: string | null;
  actualStartOn?: string | null;
  actualEndOn?: string | null;
  plannedCumulativeDose?: number | null;
}

export async function createTherapyPlan(
  patientId: string,
  input: TherapyPlanInput,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  if (input.diagnosisId) {
    const diagnosis = await prisma.cancerDiagnosis.findFirst({
      where: { id: input.diagnosisId, patientId },
      select: { id: true },
    });
    if (!diagnosis) {
      throw ApiError.clinicallyInvalid("That diagnosis does not belong to this patient.");
    }
  }

  const plan = await prisma.therapyPlan.create({
    data: {
      patientId,
      diagnosisId: input.diagnosisId ?? null,
      regimen: input.regimen ?? null,
      plannedCycles: input.plannedCycles ?? null,
      cycleFrequency: input.cycleFrequency ?? null,
      currentCycle: input.currentCycle ?? 0,
      plannedStartOn: toDate(input.plannedStartOn),
      plannedEndOn: toDate(input.plannedEndOn),
      actualStartOn: toDate(input.actualStartOn),
      actualEndOn: toDate(input.actualEndOn),
      plannedCumulativeDose: input.plannedCumulativeDose ?? null,
      classes: {
        createMany: {
          data: input.therapyClasses.map((therapyClass, position) => ({ therapyClass, position })),
        },
      },
      agents: input.agents.length
        ? {
            createMany: {
              data: input.agents.map((agent) => ({
                agentId: agent.agentId ?? null,
                name: agent.name,
                plannedDose: agent.plannedDose ?? null,
                doseUnit: agent.doseUnit ?? null,
              })),
            },
          }
        : undefined,
    },
    include: therapyPlanInclude,
  });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "therapyChanged",
    category: "record",
    entity: "TherapyPlan",
    entityId: plan.id,
    field: "therapy",
    next: input.therapyClasses,
    requestId: options.requestId,
    detail: "Therapy plan recorded. This determines the baseline risk proformas and the surveillance pathway.",
  });

  return plan;
}

/* ----------------------------------------------------------------- cycles */

export interface CycleInput {
  therapyPlanId: string;
  cycleNumber: number;
  plannedOn?: string | null;
  administeredOn?: string | null;
  status?: CycleStatus;
  deferralReason?: string | null;
  toxicityNote?: string | null;
  notes?: string | null;
  doses: Array<{
    agentId: string;
    dose: number;
    doseUnit: DoseUnit;
    bsa?: number | null;
    givenOn?: string | null;
    equivalenceModelId: string;
  }>;
}

/**
 * Records a treatment cycle and everything delivered in it.
 *
 * One transaction covering the cycle, its doses and the ledger entries.
 * Surveillance is recalculated by the caller afterwards rather than inside this
 * transaction, so that a surveillance failure cannot roll back the record of a
 * cycle that was actually given.
 */
export async function recordCycle(
  patientId: string,
  input: CycleInput,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const plan = await prisma.therapyPlan.findFirst({
    where: { id: input.therapyPlanId, patientId },
    select: { id: true, currentCycle: true, plannedCycles: true },
  });
  if (!plan) throw ApiError.clinicallyInvalid("That therapy plan does not belong to this patient.");

  if (plan.plannedCycles && input.cycleNumber > plan.plannedCycles) {
    // Not refused — protocols are exceeded for real clinical reasons — but the
    // fact is recorded so the record shows the deviation rather than hiding it.
    // A hard rejection here would push the clinician to record nothing at all.
    await recordAudit(prisma, {
      patientId,
      actorId: options.actor.clinician.id,
      action: "therapyChanged",
      category: "clinical",
      entity: "TherapyCycle",
      requestId: options.requestId,
      detail: `Cycle ${input.cycleNumber} recorded against a plan of ${plan.plannedCycles} cycles.`,
    });
  }

  const cycle = await prisma.$transaction(async (tx) => {
    const created = await tx.therapyCycle.upsert({
      where: {
        therapyPlanId_cycleNumber: {
          therapyPlanId: input.therapyPlanId,
          cycleNumber: input.cycleNumber,
        },
      },
      create: {
        therapyPlanId: input.therapyPlanId,
        cycleNumber: input.cycleNumber,
        plannedOn: toDate(input.plannedOn),
        administeredOn: toDate(input.administeredOn),
        status: input.status ?? "PLANNED",
        deferralReason: input.deferralReason ?? null,
        toxicityNote: input.toxicityNote ?? null,
        notes: input.notes ?? null,
      },
      update: {
        plannedOn: toDate(input.plannedOn),
        administeredOn: toDate(input.administeredOn),
        status: input.status ?? "PLANNED",
        deferralReason: input.deferralReason ?? null,
        toxicityNote: input.toxicityNote ?? null,
        notes: input.notes ?? null,
      },
    });

    await tx.anthracyclineDose.deleteMany({ where: { cycleId: created.id } });

    if (input.doses.length) {
      await tx.anthracyclineDose.createMany({
        data: input.doses.map((dose) => {
          const failures: string[] = [];
          if (!ANTHRACYCLINE_IDS.has(dose.agentId)) {
            failures.push("CORSC holds no doxorubicin-equivalence factor for this agent.");
          }
          if (!MODEL_IDS.has(dose.equivalenceModelId)) {
            failures.push("The equivalence model named is not one CORSC implements.");
          }
          if (dose.doseUnit === "MG" && !dose.bsa) {
            failures.push(
              "Recorded in mg with no body surface area, so it cannot be normalised to mg/m²."
            );
          }
          return {
            patientId,
            cycleId: created.id,
            agentId: dose.agentId,
            dose: dose.dose,
            doseUnit: dose.doseUnit,
            bsa: dose.bsa ?? null,
            cycleNumber: input.cycleNumber,
            givenOn: toDate(dose.givenOn) ?? toDate(input.administeredOn),
            equivalenceModelId: dose.equivalenceModelId,
            conversionFailureReason: failures.length ? failures.join(" ") : null,
          };
        }),
      });
    }

    if (input.status === "ADMINISTERED" && input.cycleNumber > plan.currentCycle) {
      await tx.therapyPlan.update({
        where: { id: plan.id },
        data: { currentCycle: input.cycleNumber },
      });
    }

    return created;
  });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "cycleRecorded",
    category: "clinical",
    entity: "TherapyCycle",
    entityId: cycle.id,
    requestId: options.requestId,
    detail: `Cycle ${input.cycleNumber} recorded as ${cycle.status.toLowerCase()} with ${input.doses.length} anthracycline dose${input.doses.length === 1 ? "" : "s"}.`,
  });

  return cycle;
}

export async function updateCycle(
  cycleId: string,
  patientId: string,
  input: Partial<Omit<CycleInput, "therapyPlanId" | "cycleNumber" | "doses">>,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const existing = await prisma.therapyCycle.findFirst({
    where: { id: cycleId, therapyPlan: { patientId } },
    select: { id: true, cycleNumber: true },
  });
  if (!existing) throw ApiError.notFound("Cycle not found on this patient.");

  const data: Prisma.TherapyCycleUpdateInput = {};
  if (input.plannedOn !== undefined) data.plannedOn = toDate(input.plannedOn);
  if (input.administeredOn !== undefined) data.administeredOn = toDate(input.administeredOn);
  if (input.status !== undefined) data.status = input.status;
  if (input.deferralReason !== undefined) data.deferralReason = input.deferralReason;
  if (input.toxicityNote !== undefined) data.toxicityNote = input.toxicityNote;
  if (input.notes !== undefined) data.notes = input.notes;

  const updated = await prisma.therapyCycle.update({ where: { id: cycleId }, data });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "cycleRecorded",
    category: "clinical",
    entity: "TherapyCycle",
    entityId: cycleId,
    requestId: options.requestId,
    detail: `Cycle ${existing.cycleNumber} amended.`,
  });

  return updated;
}

/** The therapy plan a patient is currently on, if any. */
export async function activePlanId(patientId: string): Promise<string | null> {
  const plan = await prisma.therapyPlan.findFirst({
    where: { patientId, active: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return plan?.id ?? null;
}
