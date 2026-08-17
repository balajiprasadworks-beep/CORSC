/* =========================================================================
   GET  /api/patients   the caller's caseload
   POST /api/patients   register a patient
   ========================================================================= */

import { requireWrite, patientScopeFilter } from "@/lib/backend/auth";
import { apiRoute, created, ok } from "@/lib/backend/route";
import { listQuerySchema, parseQuery, patientDocumentSchema } from "@/lib/backend/validation";
import { listPatients } from "@/lib/backend/repositories/patient-repository";
import { createPatientRecord } from "@/lib/backend/services/patient-record-service";

export const dynamic = "force-dynamic";

export const GET = apiRoute({ name: "GET /api/patients" }, async (context) => {
  const query = parseQuery(listQuerySchema, context.search);

  // Archived patients are out of the active list unless asked for, so a
  // caseload view does not silently include records taken out of service.
  const page = await listPatients({
    scope: patientScopeFilter(context.actor),
    status: query.status,
    search: query.search,
    limit: query.limit,
    cursor: query.cursor,
  });

  return ok({
    patients: page.patients.map((patient) => ({
      ...patient,
      baseline: patient.baseline
        ? {
            lvef: patient.baseline.lvef === null ? null : Number(patient.baseline.lvef),
            gls: patient.baseline.gls === null ? null : Number(patient.baseline.gls),
          }
        : null,
      therapyClasses: patient.therapyPlans.flatMap((plan) =>
        plan.classes.map((entry) => entry.therapyClass)
      ),
    })),
    nextCursor: page.nextCursor,
  });
});

export const POST = apiRoute({ name: "POST /api/patients" }, async (context) => {
  requireWrite(context.actor);

  // Registration submits the whole record. It is validated as a document here
  // and decomposed into normalised tables by patient-record-service, which is
  // the only module that knows the document shape.
  const body = await context.body(patientDocumentSchema);

  const record = await createPatientRecord({
    document: body as Record<string, unknown>,
    actor: context.actor,
    requestId: context.requestId,
    legacyId: body.legacyId ?? null,
  });

  return created(record);
});
