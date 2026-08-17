/* =========================================================================
   PATCH /api/patient-medications/:medicationId
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { ApiError } from "@/lib/backend/errors";
import { patientMedicationUpdateSchema } from "@/lib/backend/validation";
import { updatePatientMedication } from "@/lib/backend/services/medication-service";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { medicationId: string };

export const PATCH = apiRoute<Params>(
  { name: "PATCH /api/patient-medications/[medicationId]" },
  async (context) => {
    const row = await prisma.patientMedication.findUnique({
      where: { id: context.params.medicationId },
      select: { patientId: true },
    });
    if (!row) throw ApiError.notFound("Medication not found.");

    await requirePatientAccess(context.actor, row.patientId, "write");
    const body = await context.body(patientMedicationUpdateSchema);

    return ok(
      await updatePatientMedication(context.params.medicationId, row.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
