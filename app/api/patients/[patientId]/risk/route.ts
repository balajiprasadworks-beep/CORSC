/* =========================================================================
   GET /api/patients/:patientId/risk

   Stored baseline risk assessments, newest first, each with the engine version
   that produced it. History is not recomputed: an assessment made under engine
   1.0 stays attributable to engine 1.0, because that is what the clinician who
   made the treatment decision was looking at.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { listAssessments } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/risk" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    return ok({ assessments: await listAssessments(context.params.patientId, "BASELINE_RISK") });
  }
);
