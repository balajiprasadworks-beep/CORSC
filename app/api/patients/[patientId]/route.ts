/* =========================================================================
   GET   /api/patients/:patientId   the whole clinical record
   PATCH /api/patients/:patientId   amend the record
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { patientDocumentSchema } from "@/lib/backend/validation";
import { readPatientRecord, writePatientRecord } from "@/lib/backend/services/patient-record-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>({ name: "GET /api/patients/[patientId]" }, async (context) => {
  await requirePatientAccess(context.actor, context.params.patientId, "read");
  return ok(await readPatientRecord(context.params.patientId));
});

export const PATCH = apiRoute<Params>({ name: "PATCH /api/patients/[patientId]" }, async (context) => {
  await requirePatientAccess(context.actor, context.params.patientId, "write");
  const body = await context.body(patientDocumentSchema.partial({ name: true }));

  const record = await writePatientRecord(context.params.patientId, body as Record<string, unknown>, {
    actor: context.actor,
    requestId: context.requestId,
    expectedUpdatedAt: body.expectedUpdatedAt,
  });

  return ok(record);
});
