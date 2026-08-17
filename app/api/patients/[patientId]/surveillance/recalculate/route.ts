/* =========================================================================
   POST /api/patients/:patientId/surveillance/recalculate

   Re-runs the surveillance engine and persists what it produced.

   The schedule is not arithmetic done in the browser. It comes from
   lib/surveillance-engine.js with lib/surveillance-rules.js, which weigh
   therapy class, cycle number, cumulative anthracycline exposure, biomarker
   trend, GLS and ejection fraction change, previous toxicity and the phase of
   treatment — and attach a source to each recommendation.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { assessSchema } from "@/lib/backend/validation";
import { recalculateSurveillance } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/surveillance/recalculate" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(assessSchema);

    return ok(
      await recalculateSurveillance(context.params.patientId, {
        actor: context.actor,
        requestId: context.requestId,
        visitId: body.visitId,
      })
    );
  }
);
