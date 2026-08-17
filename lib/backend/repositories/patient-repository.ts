/* =========================================================================
   Patient data access.

   Repositories move rows. They do not decide who may see a row (that is
   lib/backend/auth), they do not interpret clinical data (that is the
   engines), and they do not write audit entries (that is the service, inside
   the same transaction as the change).

   Keeping that boundary means a query can be read without wondering whether it
   also has a side effect.
   ========================================================================= */

import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { enginePatientInclude, type PatientWithClinicalData } from "@/lib/backend/services/engine-patient";

type Db = PrismaClient | Prisma.TransactionClient;

/** Columns the patient list needs. Deliberately not the whole record. */
export const patientSummarySelect = {
  id: true,
  name: true,
  hospitalPatientId: true,
  mrn: true,
  sex: true,
  ageAtRegistration: true,
  status: true,
  clinicalStatus: true,
  registeredOn: true,
  archivedAt: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  diagnoses: {
    where: { isPrimary: true, active: true },
    select: { primarySite: true, stage: true },
    take: 1,
  },
  therapyPlans: {
    where: { active: true },
    select: {
      regimen: true,
      currentCycle: true,
      plannedCycles: true,
      classes: { select: { therapyClass: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  baseline: { select: { lvef: true, gls: true } },
} satisfies Prisma.PatientSelect;

export interface ListPatientsOptions {
  scope: Prisma.PatientWhereInput;
  status: "ACTIVE" | "ARCHIVED" | "ALL";
  search?: string;
  limit: number;
  cursor?: string;
}

/**
 * A page of patients.
 *
 * Cursor paginated rather than offset paginated: a caseload that is being
 * edited while it is being paged through would skip or repeat records under
 * OFFSET, and a clinician who never sees page two of their own list has a
 * safety problem, not a UX one.
 */
export async function listPatients(options: ListPatientsOptions, db: Db = prisma) {
  const where: Prisma.PatientWhereInput = {
    AND: [
      options.scope,
      options.status === "ALL" ? {} : { status: options.status },
      options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { hospitalPatientId: { contains: options.search, mode: "insensitive" } },
              { mrn: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const rows = await db.patient.findMany({
    where,
    select: patientSummarySelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: options.limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > options.limit;
  return {
    patients: hasMore ? rows.slice(0, options.limit) : rows,
    nextCursor: hasMore ? rows[options.limit - 1].id : null,
  };
}

/** The full clinical record, in the single query the engines need. */
export async function findPatientWithClinicalData(
  patientId: string,
  db: Db = prisma
): Promise<PatientWithClinicalData | null> {
  return db.patient.findUnique({
    where: { id: patientId },
    include: enginePatientInclude,
  });
}

export async function findPatientSummary(patientId: string, db: Db = prisma) {
  return db.patient.findUnique({ where: { id: patientId }, select: patientSummarySelect });
}

export async function createPatient(data: Prisma.PatientCreateInput, db: Db = prisma) {
  return db.patient.create({ data, select: patientSummarySelect });
}

export async function updatePatient(
  patientId: string,
  data: Prisma.PatientUpdateInput,
  db: Db = prisma
) {
  return db.patient.update({ where: { id: patientId }, data, select: patientSummarySelect });
}

/**
 * Applies an update only if the record has not moved since the caller read it.
 *
 * Returns null when someone else has written in the meantime, so the service
 * can report a conflict rather than discarding the other clinician's entry.
 */
export async function updatePatientIfUnchanged(
  patientId: string,
  expectedUpdatedAt: Date,
  data: Prisma.PatientUpdateInput,
  db: Db = prisma
) {
  const result = await db.patient.updateMany({
    where: { id: patientId, updatedAt: expectedUpdatedAt },
    data: data as Prisma.PatientUpdateManyMutationInput,
  });
  if (result.count === 0) return null;
  return db.patient.findUnique({ where: { id: patientId }, select: patientSummarySelect });
}

/** Finds a record previously imported from browser storage by this clinician. */
export async function findByLegacyId(clinicianId: string, legacyId: string, db: Db = prisma) {
  return db.patient.findFirst({
    where: { createdById: clinicianId, legacyId },
    select: { id: true, name: true, updatedAt: true },
  });
}
