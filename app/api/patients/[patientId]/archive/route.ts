/* =========================================================================
   POST /api/patients/:patientId/archive

   There is no DELETE anywhere in this API. A clinical record that can be
   removed cannot be audited, and one removed in error cannot be recovered.
   Archiving takes the patient out of the active caseload and leaves every
   observation, assessment and audit entry intact.
   ========================================================================= */

import { requirePatientAccess, requireWrite } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { archiveSchema } from "@/lib/backend/validation";
import { archivePatient } from "@/lib/backend/services/patient-record-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/archive" },
  async (context) => {
    // Read access plus write role: requirePatientAccess with "write" would
    // reject an already-archived patient, which is not what we want here.
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    requireWrite(context.actor);

    const body = await context.body(archiveSchema);
    return ok(
      await archivePatient(context.params.patientId, body.reason, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
