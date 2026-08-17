/* =========================================================================
   PATCH /api/therapy/cycles/:cycleId
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { ApiError } from "@/lib/backend/errors";
import { therapyCycleUpdateSchema } from "@/lib/backend/validation";
import { updateCycle } from "@/lib/backend/services/therapy-service";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { cycleId: string };

export const PATCH = apiRoute<Params>(
  { name: "PATCH /api/therapy/cycles/[cycleId]" },
  async (context) => {
    const cycle = await prisma.therapyCycle.findUnique({
      where: { id: context.params.cycleId },
      select: { therapyPlan: { select: { patientId: true } } },
    });
    if (!cycle) throw ApiError.notFound("Cycle not found.");

    const patientId = cycle.therapyPlan.patientId;
    await requirePatientAccess(context.actor, patientId, "write");

    const body = await context.body(therapyCycleUpdateSchema);
    return ok(
      await updateCycle(context.params.cycleId, patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
