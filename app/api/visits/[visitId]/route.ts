/* =========================================================================
   GET   /api/visits/:visitId
   PATCH /api/visits/:visitId

   Authorisation goes through the visit's patient: there is no such thing as
   access to an encounter independent of access to the person it belongs to.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { visitUpdateSchema } from "@/lib/backend/validation";
import { getVisit, updateVisit, visitPatientId } from "@/lib/backend/services/visit-service";

export const dynamic = "force-dynamic";

type Params = { visitId: string };

export const GET = apiRoute<Params>({ name: "GET /api/visits/[visitId]" }, async (context) => {
  const patientId = await visitPatientId(context.params.visitId);
  await requirePatientAccess(context.actor, patientId, "read");
  return ok(await getVisit(context.params.visitId));
});

export const PATCH = apiRoute<Params>({ name: "PATCH /api/visits/[visitId]" }, async (context) => {
  const patientId = await visitPatientId(context.params.visitId);
  await requirePatientAccess(context.actor, patientId, "write");

  const body = await context.body(visitUpdateSchema);
  return ok(
    await updateVisit(context.params.visitId, body, {
      actor: context.actor,
      requestId: context.requestId,
    })
  );
});
