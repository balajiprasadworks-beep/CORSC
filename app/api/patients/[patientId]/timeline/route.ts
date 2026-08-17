/* =========================================================================
   GET /api/patients/:patientId/timeline

   The longitudinal timeline, generated from the structured record rather than
   stored as an array. Registration, diagnosis, baseline assessment, each
   cycle, each investigation, surveillance and follow-up are all derived from
   the rows that describe them, so the timeline cannot disagree with the record
   it is drawn from.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { buildPicture } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/timeline" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    const { picture } = await buildPicture(context.params.patientId, context.search.get("visitId"));
    return ok({ events: picture.events });
  }
);
