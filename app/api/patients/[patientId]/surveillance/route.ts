/* =========================================================================
   GET /api/patients/:patientId/surveillance

   Every surveillance recommendation, with the reason it fired, the source it
   came from and whether that source is a guideline or a CORSC operational
   scheduling convention.

   "Echo due" on its own is not a record. A recommendation here always carries
   what is due, when, why, and on whose authority.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/surveillance" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");

    // Superseded recommendations stay out of the default view but remain in the
    // record: what was recommended at an earlier encounter is part of the
    // history, not noise.
    const includeSuperseded = context.search.get("includeSuperseded") === "true";

    const recommendations = await prisma.surveillanceRecommendation.findMany({
      where: {
        patientId: context.params.patientId,
        ...(includeSuperseded ? {} : { status: { in: ["DUE", "COMPLETED"] } }),
      },
      orderBy: [{ status: "asc" }, { dueOn: "asc" }, { createdAt: "desc" }],
      take: 300,
    });

    const followUps = await prisma.followUp.findMany({
      where: { patientId: context.params.patientId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return ok({ recommendations, followUps });
  }
);
