/* =========================================================================
   POST /api/patients/:patientId/ai/draft-note

   Turns the already-locally-computed clinical narrative (lib/ai-summary.js,
   built from data already in the record) into a natural-prose draft for the
   consultant notes field. The model is told not to add anything beyond what
   it is given — this is a phrasing pass over existing facts, not a second
   opinion. The draft is returned for the clinician to edit or discard; it is
   never written to the record by this endpoint.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { draftNoteSchema } from "@/lib/backend/validation";
import { draftVisitNote } from "@/lib/backend/services/ai-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/ai/draft-note" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(draftNoteSchema);
    return ok({ draft: await draftVisitNote(body.context) });
  }
);
