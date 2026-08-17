/* =========================================================================
   PUT /api/patients/:patientId/record

   The autosave endpoint.

   CORSC's encounter workflow has no save button: every keystroke updates one
   patient object and a debounced autosave persists it. This endpoint is what
   that autosave now calls. It takes the whole record and writes it into the
   normalised tables in one transaction.

   It is a transitional interface, and deliberately marked as one. As each
   workflow section moves to the granular endpoints — visits, investigations,
   medications, therapy — this endpoint's job shrinks. It exists so that
   putting CORSC on a real database did not require rewriting fourteen clinical
   sections at the same time, which would have been a far larger change to
   review and a far worse one to get wrong.

   Concurrency is checked here, not in the browser: `expectedUpdatedAt` is the
   timestamp from the last read, and a write against a record that has since
   moved returns 409 rather than overwriting a colleague's entry.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { patientDocumentSchema } from "@/lib/backend/validation";
import { writePatientRecord } from "@/lib/backend/services/patient-record-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const PUT = apiRoute<Params>(
  { name: "PUT /api/patients/[patientId]/record" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(patientDocumentSchema);

    const record = await writePatientRecord(
      context.params.patientId,
      body as Record<string, unknown>,
      {
        actor: context.actor,
        requestId: context.requestId,
        expectedUpdatedAt: body.expectedUpdatedAt,
      }
    );

    return ok(record);
  }
);
