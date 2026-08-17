/* =========================================================================
   GET /api/patients/:patientId/fitness
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { listAssessments } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/fitness" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    return ok({ assessments: await listAssessments(context.params.patientId, "FITNESS") });
  }
);
