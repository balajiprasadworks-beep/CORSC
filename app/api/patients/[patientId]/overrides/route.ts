/* =========================================================================
   GET  /api/patients/:patientId/overrides
   POST /api/patients/:patientId/overrides

   Overrides are additive. The algorithmic value is kept beside the clinician's,
   so the record shows a judgement was made rather than that the software said
   something different.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created, ok } from "@/lib/backend/route";
import { overrideSchema } from "@/lib/backend/validation";
import { createOverride, listOverrides } from "@/lib/backend/services/override-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/overrides" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    return ok({ overrides: await listOverrides(context.params.patientId) });
  }
);

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/overrides" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(overrideSchema);

    return created(
      await createOverride(context.params.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
