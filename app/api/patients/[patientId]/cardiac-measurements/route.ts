/* =========================================================================
   GET  /api/patients/:patientId/cardiac-measurements
   POST /api/patients/:patientId/cardiac-measurements

   The longitudinal cardiac dataset — LVEF, GLS, troponin, natriuretic
   peptides, ECG intervals — as a series per measure.

   This is a view over the investigations table rather than a second store. One
   fact, one row: an LVEF that existed as both "an investigation" and "a
   cardiac measurement" would be free to disagree with itself, and a report
   reading one while surveillance read the other would be worse than having
   neither.

   Troponin values carry the assay they were measured on and the reference
   limit applied to them, because results from different assays are not
   comparable to each other or to a universal threshold.
   ========================================================================= */

import { requirePatientAccess } from "@/lib/backend/auth";
import { apiRoute, created, ok } from "@/lib/backend/route";
import { ApiError } from "@/lib/backend/errors";
import { investigationSchema } from "@/lib/backend/validation";
import {
  CARDIAC_INVESTIGATION_IDS,
  listCardiacMeasurements,
  recordInvestigation,
} from "@/lib/backend/services/investigation-service";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/cardiac-measurements" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");
    return ok(await listCardiacMeasurements(context.params.patientId));
  }
);

export const POST = apiRoute<Params>(
  { name: "POST /api/patients/[patientId]/cardiac-measurements" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "write");
    const body = await context.body(investigationSchema);

    if (!CARDIAC_INVESTIGATION_IDS.includes(body.investigationId)) {
      throw ApiError.clinicallyInvalid(
        `${body.investigationId} is not a cardiac measurement. Record it through /api/patients/:id/investigations.`,
        { cardiacMeasurements: CARDIAC_INVESTIGATION_IDS }
      );
    }

    return created(
      await recordInvestigation(context.params.patientId, body, {
        actor: context.actor,
        requestId: context.requestId,
      })
    );
  }
);
