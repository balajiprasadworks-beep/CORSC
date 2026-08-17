/* =========================================================================
   POST /api/patients/:patientId/restore

   Returns an archived patient to the active caseload. Archiving is reversible
   precisely because deletion is not offered: a record taken out of service in
   error has to be recoverable.
   ========================================================================= */

import { requirePatientAccess, requireWrite } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { archiveSchema } from "@/lib/backend/validation";
import { restorePatient } from "@/lib/backend/services/patient-record-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/restore" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    requireWrite(context.actor);

    const body = await context.body(archiveSchema);
    return ok(
      await restorePatient(context.params.patientId, body.reason, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
