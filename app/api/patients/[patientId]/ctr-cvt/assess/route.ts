/* =========================================================================
   POST /api/patients/:patientId/ctr-cvt/assess

   Grades what has happened during or after therapy.

   This is the CURRENT axis. A troponin rise, a GLS decline or an ejection
   fraction fall recorded here does not touch the baseline risk assessment: the
   two are stored separately so that the record of what was known before
   treatment survives whatever happens afterwards.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created } from "@/lib/backend/route";
import { assessSchema } from "@/lib/backend/validation";
import { assessCurrentToxicity } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/ctr-cvt/assess" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(assessSchema);

    return created(
      await assessCurrentToxicity(context.params.patientId, {
        actor: context.actor,
        requestId: context.requestId,
        visitId: body.visitId,
      })
    );
  }
);
