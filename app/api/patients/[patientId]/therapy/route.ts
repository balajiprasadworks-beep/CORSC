/* =========================================================================
   GET  /api/patients/:patientId/therapy   every plan, with cycles and doses
   POST /api/patients/:patientId/therapy   record a plan
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created, ok } from "@/lib/backend/route";
import { therapyPlanSchema } from "@/lib/backend/validation";
import { createTherapyPlan, listTherapy } from "@/lib/backend/services/therapy-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/therapy" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    return ok({ plans: await listTherapy(context.params.patientId) });
  }
);

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/therapy" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(therapyPlanSchema);

    return created(
      await createTherapyPlan(context.params.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
