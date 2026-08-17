/* =========================================================================
   POST /api/patients/:patientId/therapy/cycles

   Records a treatment cycle with everything delivered in it, then recalculates
   surveillance — because cumulative exposure and cycle number are both inputs
   to the surveillance rules, and a cycle recorded without the recalculation
   would leave the clinician looking at a plan that predates the treatment.

   The recalculation runs after the cycle transaction commits, deliberately: a
   surveillance failure must not roll back the record of a cycle that was
   actually given.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created } from "@/lib/backend/route";
import { therapyCycleSchema } from "@/lib/backend/validation";
import { recordCycle } from "@/lib/backend/services/therapy-service";
import { recalculateSurveillance } from "@/lib/backend/services/clinical-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/therapy/cycles" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(therapyCycleSchema);

    const cycle = await recordCycle(context.params.patientId, body, {
      actor: context.actor,
      requestId: context.requestId,
    });

    const surveillance = await recalculateSurveillance(context.params.patientId, {
      actor: context.actor,
      requestId: context.requestId,
    });

    return created({ cycle, surveillance: { recommendations: surveillance.recommendations, followUp: surveillance.followUp } });
  }
);
