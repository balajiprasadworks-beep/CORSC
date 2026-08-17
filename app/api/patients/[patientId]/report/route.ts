/* =========================================================================
   GET /api/patients/:patientId/report

   The report data, drawn from PostgreSQL in one read. Rendering stays with the
   existing print report in the frontend rather than being rebuilt here.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { buildPatientReport } from "@/lib/backend/services/report-service";
import { recordAudit } from "@/lib/backend/services/audit-service";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/report" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");

    const report = await buildPatientReport(
      context.params.patientId,
      context.search.get("visitId")
    );

    // Generating a report is an export of clinical data, so it is audited even
    // though it changes nothing.
    await recordAudit(prisma, {
      patientId: context.params.patientId,
      actorId: context.actor.clinician.id,
      action: "reportGenerated",
      category: "export",
      entity: "Patient",
      entityId: context.params.patientId,
      requestId: context.requestId,
      detail: "Patient report generated.",
    });

    return ok(report);
  }
);
