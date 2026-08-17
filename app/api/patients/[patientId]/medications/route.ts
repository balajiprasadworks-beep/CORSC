/* =========================================================================
   GET  /api/patients/:patientId/medications
   POST /api/patients/:patientId/medications
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created, ok } from "@/lib/backend/route";
import { patientMedicationSchema } from "@/lib/backend/validation";
import { addPatientMedication, listPatientMedications } from "@/lib/backend/services/medication-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/medications" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    // Stopped medicines are available on request: knowing what a patient was on
    // at an earlier encounter is part of reading the record back.
    const includeStopped = context.search.get("includeStopped") === "true";
    return ok({
      medications: await listPatientMedications(context.params.patientId, includeStopped),
    });
  }
);

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/medications" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(patientMedicationSchema);

    return created(
      await addPatientMedication(context.params.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
