/* =========================================================================
   GET /api/worklist

   The clinical worklist, computed on the server.

   The worklist is not a list of names: each row runs the baseline risk
   proformas, the CTR-CVT domains, the red-flag grading, the anthracycline
   ledger and the completeness assessment for that patient, so that someone
   eight weeks past a due echocardiogram surfaces without anyone having to
   remember them.

   That computation belongs on the server, next to the records, for two
   reasons. It keeps the clinical engines running in one place against the
   database rather than against whatever a browser happens to be holding. And
   it means opening the caseload does not require downloading every patient's
   full clinical record to the browser to work out who needs attention.

   Filtering and searching stay client-side, over the same rows, so toggling a
   filter is instant.
   ========================================================================= */

import { patientScopeFilter } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { prisma } from "@/lib/db/prisma";
import {
  enginePatientInclude,
  toEnginePatientRecord,
} from "@/lib/backend/services/engine-patient";
import { worklistRow } from "@/lib/worklist";

export const dynamic = "force-dynamic";

export const GET = apiRoute({ name: "GET /api/worklist" }, async (context) => {
  const patients = await prisma.patient.findMany({
    where: { AND: [patientScopeFilter(context.actor), { status: "ACTIVE" }] },
    include: enginePatientInclude,
    orderBy: { updatedAt: "desc" },
    // A hard ceiling rather than pagination: a worklist is a working list, and
    // a service with more than this many active patients needs a filtered view
    // rather than a longer page.
    take: 500,
  });

  const rows = patients.map((patient) => worklistRow(toEnginePatientRecord(patient)));

  return ok({ rows, total: rows.length });
});
