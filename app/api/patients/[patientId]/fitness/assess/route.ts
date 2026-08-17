/* =========================================================================
   POST /api/patients/:patientId/fitness/assess

   Assesses fitness to proceed with the next cycle.

   The result — "proceed", "proceed with caution", "hold" — is a decision
   support prompt for the treating team, with the findings that produced it. It
   is not an instruction and CORSC does not stop chemotherapy. The treating
   clinician decides.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created } from "@/lib/backend/route";
import { assessSchema } from "@/lib/backend/validation";
import { assessFitnessToProceed } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/fitness/assess" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(assessSchema);

    return created(
      await assessFitnessToProceed(context.params.patientId, {
        actor: context.actor,
        requestId: context.requestId,
        visitId: body.visitId,
      })
    );
  }
);
