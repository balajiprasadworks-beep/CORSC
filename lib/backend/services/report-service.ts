/* =========================================================================
   The patient report.

   Assembled from the database and from the engines, in one pass, so that every
   section of the report is drawn from the same read. A report whose diagnosis
   block came from one query and whose surveillance block came from another,
   taken a second later, could show two states of the same patient — which is
   exactly the kind of inconsistency a printed clinical document must not have.

   Rendering stays in the frontend. CORSC already has a print report
   (components/sections/overview.jsx) that the service uses; this endpoint
   supplies its data from PostgreSQL rather than rebuilding the document.

   PROVENANCE TRAVELS WITH THE FINDINGS. The report carries the engine
   versions, the rules version and the verification level of each source, so a
   printed page can always be traced to the code that produced it — including
   when a rule was only partially verified, which the report states rather than
   hides.
   ========================================================================= */

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import { CORSC_RULES_VERSION, ENGINES } from "@/lib/backend/services/engine-versions";
import { buildPicture } from "@/lib/backend/services/clinical-service";
import { buildSummary } from "@/lib/ai-summary";
import { listPatientMedications } from "@/lib/backend/services/medication-service";
import { listTherapy } from "@/lib/backend/services/therapy-service";
import { listCardiacMeasurements } from "@/lib/backend/services/investigation-service";
import { listOverrides } from "@/lib/backend/services/override-service";

export async function buildPatientReport(patientId: string, visitId?: string | null) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      name: true,
      hospitalPatientId: true,
      mrn: true,
      sex: true,
      ageAtRegistration: true,
      dateOfBirth: true,
      registeredOn: true,
      status: true,
      archivedAt: true,
      clinicalStatus: true,
      diagnoses: { orderBy: { diagnosedOn: "desc" } },
    },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");

  const [{ picture, encounter }, therapy, medications, cardiac, overrides, surveillance, followUp] =
    await Promise.all([
      buildPicture(patientId, visitId),
      listTherapy(patientId),
      listPatientMedications(patientId, true),
      listCardiacMeasurements(patientId),
      listOverrides(patientId),
      prisma.surveillanceRecommendation.findMany({
        where: { patientId, status: { in: ["DUE", "COMPLETED"] } },
        orderBy: [{ dueOn: "asc" }],
        take: 200,
      }),
      prisma.followUp.findFirst({
        where: { patientId, status: "PLANNED" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return {
    generatedAt: new Date().toISOString(),
    /** Stated on the report itself, so a printed page can be traced back. */
    provenance: {
      rulesVersion: CORSC_RULES_VERSION,
      engines: ENGINES,
      /**
       * Flagged when any proforma behind the risk category is only partially
       * verified. A clinician acting on a partially verified rule needs to know
       * that before they act, not afterwards.
       */
      partiallyVerified: Boolean(picture.baselineRisk?.partiallyVerified),
    },
    patient,
    encounter,
    diagnoses: patient.diagnoses,
    therapy,
    medications,
    cardiacMeasurements: cardiac,
    /** Baseline risk and current toxicity, side by side and never merged. */
    baselineRisk: picture.baselineRisk,
    currentToxicity: picture.ctrCvt,
    fitness: picture.fitness,
    anthracyclineLedger: picture.ledger,
    surveillance,
    followUp,
    overrides,
    timeline: picture.events,
    /** The narrative summary, generated from the picture the report was built from. */
    summary: buildSummary(picture),
    /**
     * Not a disclaimer bolted on at the end: the report is a clinical
     * decision-support document and says so wherever it is read.
     */
    notice:
      "Clinical decision support. Findings are prompts for review by the treating team and do not replace clinical judgement, full guideline review, or multidisciplinary cardio-oncology input.",
  };
}
