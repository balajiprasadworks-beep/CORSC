/* =========================================================================
   POST /api/visits/:visitId/file

   Files the encounter into the patient record. One-way: the summary is stored
   as it read at the moment of filing, because regenerating it later from
   today's engines would change what the record says was written.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { visitFileSchema } from "@/lib/backend/validation";
import { fileVisit, visitPatientId } from "@/lib/backend/services/visit-service";

export const dynamic = "force-dynamic";

type Params = { visitId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/visits/[visitId]/file" },
  async (context) => {
    const patientId = await visitPatientId(context.params.visitId);
    await requirePatientAccess(context.actor, patientId, "write");

    const body = await context.body(visitFileSchema);
    return ok(
      await fileVisit(context.params.visitId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
