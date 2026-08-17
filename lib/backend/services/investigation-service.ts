/* =========================================================================
   Investigations and cardiac measurements.

   ONE TABLE, NOT TWO. An LVEF recorded as "an investigation" and the same LVEF
   recorded as "a cardiac measurement" would be two versions of one fact, free
   to disagree, and a report drawing from one while surveillance drew from the
   other would be worse than having neither. So every result lives in
   `investigations`, and the cardiac measurement view is a query over the
   cardiac identifiers.

   TROPONIN CARRIES ITS ASSAY. Values from different high-sensitivity assays
   are not comparable and have different reference limits, so the assay and the
   limit that was actually applied are stored beside the value. Nothing in
   CORSC compares a troponin against a universal threshold, and this table is
   what makes that possible to honour later, when the result is read back years
   after the laboratory changed platform.

   NOTHING HERE INTERPRETS. Whether a value is elevated is decided by
   lib/cardiac-measurements.js against the recorded assay. This module stores
   what was measured.
   ========================================================================= */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { recordAudit } from "@/lib/backend/services/audit-service";
import { INVESTIGATIONS } from "@/lib/clinical-data";

/**
 * The investigations that make up the longitudinal cardiac dataset.
 *
 * Drawn from the clinical definitions rather than restated, so an
 * investigation added to the Cardiac or Biomarker group appears in the cardiac
 * measurements view without a second edit here.
 */
export const CARDIAC_INVESTIGATION_IDS: string[] = INVESTIGATIONS.filter(
  (item: { group: string }) => item.group === "Cardiac" || item.group === "Biomarker"
).map((item: { id: string }) => item.id);

export interface InvestigationInput {
  visitId?: string | null;
  investigationId: string;
  measuredOn?: string | null;
  resultText?: string | null;
  numericValue?: number | null;
  unit?: string | null;
  interpretation?: string | null;
  comment?: string | null;
  isBaseline?: boolean;
  assayId?: string | null;
  referenceUpperLimit?: number | null;
  laboratory?: string | null;
  measurements?: Record<string, unknown> | null;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function serialise(row: {
  numericValue: Prisma.Decimal | null;
  referenceUpperLimit: Prisma.Decimal | null;
  [key: string]: unknown;
}) {
  return {
    ...row,
    numericValue: row.numericValue === null ? null : Number(row.numericValue),
    referenceUpperLimit: row.referenceUpperLimit === null ? null : Number(row.referenceUpperLimit),
  };
}

export async function listInvestigations(
  patientId: string,
  options: { investigationId?: string; limit?: number } = {}
) {
  const rows = await prisma.investigation.findMany({
    where: {
      patientId,
      ...(options.investigationId ? { investigationId: options.investigationId } : {}),
    },
    orderBy: [{ measuredOn: "desc" }, { createdAt: "desc" }],
    take: options.limit ?? 200,
  });
  return rows.map(serialise);
}

/**
 * The cardiac dataset over time.
 *
 * Grouped by measure so a caller gets a series per measurement rather than one
 * interleaved list — this is what a trend chart and the surveillance engine
 * both want.
 */
export async function listCardiacMeasurements(patientId: string) {
  const rows = await prisma.investigation.findMany({
    where: { patientId, investigationId: { in: CARDIAC_INVESTIGATION_IDS } },
    orderBy: [{ measuredOn: "asc" }, { createdAt: "asc" }],
    include: { visit: { select: { id: true, visitType: true, label: true, cycleNumber: true } } },
  });

  const baseline = await prisma.patientBaseline.findUnique({ where: { patientId } });

  const series: Record<string, ReturnType<typeof serialise>[]> = {};
  rows.forEach((row) => {
    (series[row.investigationId] ||= []).push(serialise(row));
  });

  return {
    /**
     * The patient's reference values. Held on the patient rather than derived
     * from whichever row looks earliest, because every later comparison is made
     * against them and a shifting baseline would silently re-grade history.
     */
    baseline: baseline
      ? {
          lvef: baseline.lvef === null ? null : Number(baseline.lvef),
          gls: baseline.gls === null ? null : Number(baseline.gls),
          qtc: baseline.qtc,
          troponin: baseline.troponin === null ? null : Number(baseline.troponin),
          ntProBnp: baseline.ntProBnp === null ? null : Number(baseline.ntProBnp),
          troponinAssayId: baseline.troponinAssayId,
          troponinLocalUrl:
            baseline.troponinLocalUrl === null ? null : Number(baseline.troponinLocalUrl),
        }
      : null,
    series,
  };
}

export async function recordInvestigation(
  patientId: string,
  input: InvestigationInput,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  if (input.visitId) {
    const visit = await prisma.visit.findFirst({
      where: { id: input.visitId, patientId },
      select: { id: true },
    });
    if (!visit) {
      throw ApiError.clinicallyInvalid("That encounter does not belong to this patient.");
    }
  }

  const data = {
    patientId,
    visitId: input.visitId ?? null,
    investigationId: input.investigationId,
    measuredOn: toDate(input.measuredOn) ?? new Date(),
    resultText: input.resultText ?? null,
    numericValue: input.numericValue ?? null,
    unit: input.unit ?? null,
    interpretation: input.interpretation || null,
    comment: input.comment ?? null,
    isBaseline: input.isBaseline ?? false,
    assayId: input.assayId ?? null,
    referenceUpperLimit: input.referenceUpperLimit ?? null,
    laboratory: input.laboratory ?? null,
    measurements: (input.measurements ?? undefined) as Prisma.InputJsonValue | undefined,
  };

  // One result per investigation per encounter: a second entry for the same
  // measure at the same visit is a correction, not a new observation.
  const row = input.visitId
    ? await prisma.investigation.upsert({
        where: {
          visitId_investigationId: { visitId: input.visitId, investigationId: input.investigationId },
        },
        create: data,
        update: data,
      })
    : await prisma.investigation.create({ data });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "resultEdited",
    category: "clinical",
    entity: "Investigation",
    entityId: row.id,
    requestId: options.requestId,
    detail: `${input.investigationId} recorded.`,
  });

  return serialise(row);
}
