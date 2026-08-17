/* =========================================================================
   POST /api/patients/:patientId/risk/assess

   Runs the HFA-ICOS baseline proformas and stores the result.

   This is the BASELINE axis: what the patient's cardiovascular risk was before
   therapy. It is never updated by anything that happens during treatment — see
   /api/patients/:id/ctr-cvt/assess for the other axis.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created } from "@/lib/backend/route";
import { assessSchema } from "@/lib/backend/validation";
import { assessBaseline } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/risk/assess" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(assessSchema);

    return created(
      await assessBaseline(context.params.patientId, {
        actor: context.actor,
        requestId: context.requestId,
        visitId: body.visitId,
      })
    );
  }
);
