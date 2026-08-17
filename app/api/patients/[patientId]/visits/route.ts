/* =========================================================================
   GET  /api/patients/:patientId/visits   every encounter, newest first
   POST /api/patients/:patientId/visits   open an encounter
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created, ok } from "@/lib/backend/route";
import { visitCreateSchema } from "@/lib/backend/validation";
import { createVisit, listVisits } from "@/lib/backend/services/visit-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/visits" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    return ok({ visits: await listVisits(context.params.patientId) });
  }
);

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/visits" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(visitCreateSchema);

    return created(
      await createVisit(context.params.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
