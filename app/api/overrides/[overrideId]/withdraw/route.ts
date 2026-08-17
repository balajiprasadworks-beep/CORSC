/* =========================================================================
   POST /api/overrides/:overrideId/withdraw

   Withdrawal, not deletion. The override stays in the record with its original
   reason, and the withdrawal carries its own.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { withdrawOverrideSchema } from "@/lib/backend/validation";
import { overridePatientId, withdrawOverride } from "@/lib/backend/services/override-service";

export const dynamic = "force-dynamic";

type Params = { overrideId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/overrides/[overrideId]/withdraw" },
  async (context) => {
    const patientId = await overridePatientId(context.params.overrideId);
    await requirePatientAccess(context.actor, patientId, "write");

    const body = await context.body(withdrawOverrideSchema);
    return ok(
      await withdrawOverride(context.params.overrideId, body.reason, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
