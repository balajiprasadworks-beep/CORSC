/* =========================================================================
   Clinician overrides.

   An override records that a clinician reached a different conclusion from the
   software. It is ADDITIVE: the algorithmic value is kept alongside the
   clinician's, so the record shows both, and anyone reading it later can see
   that a judgement was made rather than that the software produced a different
   answer.

   The original result is never destroyed. There is no update path — an
   override is withdrawn, which is itself recorded with its own reason — and no
   delete path at all.

   A reason is mandatory at three levels: the Zod schema requires substance,
   the service refuses an empty one, and a CHECK constraint refuses it at the
   database. An override nobody can explain later is indistinguishable from a
   mistake.
   ========================================================================= */

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { recordAudit } from "@/lib/backend/services/audit-service";

export interface OverrideInput {
  visitId?: string | null;
  target: string;
  subjectId?: string | null;
  algorithmicValue?: string | null;
  clinicianValue: string;
  reason: string;
}

export async function listOverrides(patientId: string, includeWithdrawn = true) {
  const rows = await prisma.clinicalOverride.findMany({
    where: { patientId, ...(includeWithdrawn ? {} : { withdrawnAt: null }) },
    orderBy: { createdAt: "desc" },
    include: {
      clinician: { select: { id: true, displayName: true, email: true } },
      withdrawnBy: { select: { id: true, displayName: true, email: true } },
    },
  });

  return rows.map((row) => ({
    ...row,
    active: row.withdrawnAt === null,
  }));
}

export async function createOverride(
  patientId: string,
  input: OverrideInput,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  if (input.visitId) {
    const visit = await prisma.visit.findFirst({
      where: { id: input.visitId, patientId },
      select: { id: true },
    });
    if (!visit) throw ApiError.clinicallyInvalid("That encounter does not belong to this patient.");
  }

  const override = await prisma.clinicalOverride.create({
    data: {
      patientId,
      visitId: input.visitId ?? null,
      target: input.target,
      subjectId: input.subjectId ?? null,
      algorithmicValue: input.algorithmicValue ?? null,
      clinicianValue: input.clinicianValue,
      reason: input.reason,
      clinicianId: options.actor.clinician.id,
    },
    // Matches listOverrides' shape, so the client that just created this
    // override can render "by whom" immediately rather than refetching.
    include: {
      clinician: { select: { id: true, displayName: true, email: true } },
    },
  });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "overrideRecorded",
    category: "override",
    entity: "ClinicalOverride",
    entityId: override.id,
    field: input.target,
    previous: input.algorithmicValue,
    next: input.clinicianValue,
    reason: input.reason,
    requestId: options.requestId,
    detail: "Clinician override recorded. The algorithmic result is retained unchanged.",
  });

  return override;
}

export async function withdrawOverride(
  overrideId: string,
  reason: string,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const existing = await prisma.clinicalOverride.findUnique({
    where: { id: overrideId },
    select: { id: true, patientId: true, target: true, withdrawnAt: true },
  });
  if (!existing) throw ApiError.notFound("Override not found.");
  if (existing.withdrawnAt) throw ApiError.conflict("This override has already been withdrawn.");

  const withdrawn = await prisma.clinicalOverride.update({
    where: { id: overrideId },
    data: {
      withdrawnAt: new Date(),
      withdrawnById: options.actor.clinician.id,
      withdrawnReason: reason,
    },
  });

  await recordAudit(prisma, {
    patientId: existing.patientId,
    actorId: options.actor.clinician.id,
    action: "overrideWithdrawn",
    category: "override",
    entity: "ClinicalOverride",
    entityId: overrideId,
    field: existing.target,
    reason,
    requestId: options.requestId,
    detail: "Override withdrawn. The override itself is retained.",
  });

  return withdrawn;
}

/** The patient an override belongs to, so the caller can authorise against it. */
export async function overridePatientId(overrideId: string): Promise<string> {
  const override = await prisma.clinicalOverride.findUnique({
    where: { id: overrideId },
    select: { patientId: true },
  });
  if (!override) throw ApiError.notFound("Override not found.");
  return override.patientId;
}
