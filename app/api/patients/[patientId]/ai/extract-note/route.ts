/* =========================================================================
   POST /api/patients/:patientId/ai/extract-note

   Extracts only what is explicitly stated in a pasted clinical note into the
   same structured shape the workflow already uses. The patient access check
   is authorisation only — nothing here reads or writes the patient record;
   the extracted fields are returned as suggestions for the client to offer
   field by field, and are never applied to the record by this endpoint.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { extractNoteSchema } from "@/lib/backend/validation";
import { extractNoteFields } from "@/lib/backend/services/ai-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/ai/extract-note" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(extractNoteSchema);
    return ok({ extracted: await extractNoteFields(body.noteText) });
  }
);
