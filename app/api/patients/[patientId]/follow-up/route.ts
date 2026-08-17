/* =========================================================================
   GET /api/patients/:patientId/follow-up

   The follow-up plan with its acuity band and every trigger that contributed
   to the interval — not just the first one that matched.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/follow-up" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");

    const followUps = await prisma.followUp.findMany({
      where: { patientId: context.params.patientId },
      orderBy: [{ plannedOn: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    return ok({
      followUps,
      current: followUps.find((plan) => plan.status === "PLANNED") ?? null,
    });
  }
);
