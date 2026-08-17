/* =========================================================================
   GET  /api/patients/:patientId/investigations
   POST /api/patients/:patientId/investigations
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created, ok } from "@/lib/backend/route";
import { investigationSchema } from "@/lib/backend/validation";
import { listInvestigations, recordInvestigation } from "@/lib/backend/services/investigation-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/investigations" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    return ok({
      investigations: await listInvestigations(context.params.patientId, {
        investigationId: context.search.get("investigationId") || undefined,
      }),
    });
  }
);

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/investigations" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(investigationSchema);

    return created(
      await recordInvestigation(context.params.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
