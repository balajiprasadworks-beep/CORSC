/* =========================================================================
   POST /api/patient-medications/:medicationId/stop

   Stopping is not deleting. The row stays with a stop date and a reason, so an
   earlier encounter can still be read back with the medication list the
   patient was actually on at the time.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { ApiError } from "@/lib/backend/errors";
import { stopMedicationSchema } from "@/lib/backend/validation";
import { stopPatientMedication } from "@/lib/backend/services/medication-service";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { medicationId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patient-medications/[medicationId]/stop" },
  async (context) => {
    const row = await prisma.patientMedication.findUnique({
      where: { id: context.params.medicationId },
      select: { patientId: true },
    });
    if (!row) throw ApiError.notFound("Medication not found.");

    await requirePatientAccess(context.actor, row.patientId, "write");
    const body = await context.body(stopMedicationSchema);

    return ok(
      await stopPatientMedication(context.params.medicationId, row.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
