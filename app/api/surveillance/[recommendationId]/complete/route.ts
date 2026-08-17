/* =========================================================================
   POST /api/surveillance/:recommendationId/complete
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { ApiError } from "@/lib/backend/errors";
import { completeSurveillanceSchema } from "@/lib/backend/validation";
import { completeSurveillance } from "@/lib/backend/services/clinical-service";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { recommendationId: string };

export const POST = apiRoute<Params>(
  { name: "POST /api/surveillance/[recommendationId]/complete" },
  async (context) => {
    const row = await prisma.surveillanceRecommendation.findUnique({
      where: { id: context.params.recommendationId },
      select: { patientId: true },
    });
    if (!row) throw ApiError.notFound("Surveillance recommendation not found.");

    await requirePatientAccess(context.actor, row.patientId, "write");
    const body = await context.body(completeSurveillanceSchema);

    return ok(
      await completeSurveillance(context.params.recommendationId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
