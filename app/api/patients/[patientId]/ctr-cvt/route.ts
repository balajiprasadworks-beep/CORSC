/* =========================================================================
   GET /api/patients/:patientId/ctr-cvt

   Current cancer-therapy-related cardiovascular toxicity over time, and the
   CTRCD grades alongside it. Separate from baseline risk, deliberately and
   permanently.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { listAssessments } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/ctr-cvt" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    const [ctrCvt, ctrcd] = await Promise.all([
      listAssessments(context.params.patientId, "CTR_CVT"),
      listAssessments(context.params.patientId, "CTRCD"),
    ]);
    return ok({ ctrCvt, ctrcd });
  }
);
