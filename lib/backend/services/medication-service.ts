/* =========================================================================
   Medications.

   Two things live here: search over the formulary, and the patient's own
   medication list.

   SEARCH RUNS IN THE DATABASE. The formulary is a national one — several
   hundred ingredients and the products built from them, and designed to grow —
   so shipping it to the browser to filter client-side would mean a large
   download before the first search on a clinic connection that may be poor.
   The trigram index added in the second migration makes a partial-name match
   an index scan.

   PATIENT MEDICATIONS ARE STRUCTURED. The four prescription slots
   (morning-afternoon-evening-night) are stored as numbers, because the
   duplication and QT-stacking checks have to compute against them. A free-text
   "2.5 mg BD" cannot be checked for anything.

   NOTHING HERE DECIDES WHETHER A MEDICINE IS INDICATED. That is
   lib/medication-engine.js, which phrases its output as a prompt to review and
   states the finding that triggered it. The absence of a drug from this
   database is not evidence that a clinician failed to prescribe it, and no
   part of this module may imply otherwise.
   ========================================================================= */

import type { MedicationRoute, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { recordAudit } from "@/lib/backend/services/audit-service";
import { describeDose } from "@/lib/backend/services/engine-patient";
import { classifyDrug } from "@/lib/medication-engine";

export interface MedicationSearchResult {
  id: string;
  genericName: string;
  brandName: string | null;
  strength: string | null;
  dosageForm: string | null;
  route: MedicationRoute;
  isCombination: boolean;
  medicationClass: string | null;
  ingredients: Array<{ name: string; strength: string | null; ingredientClass: string | null }>;
}

/**
 * Searches the formulary by generic name, brand name, alias or ingredient.
 *
 * Ordered so that an exact prefix match on a name outranks a fuzzy match
 * buried in an ingredient list — a clinician typing "ram" wants Ramipril
 * first, not a combination product that happens to contain it.
 */
export async function searchMedications(term: string, limit: number): Promise<MedicationSearchResult[]> {
  const query = term.trim().toLowerCase();
  if (!query) return [];

  const rows = await prisma.medication.findMany({
    where: {
      active: true,
      OR: [
        { genericName: { contains: query, mode: "insensitive" } },
        { brandName: { contains: query, mode: "insensitive" } },
        { aliases: { has: query } },
        { ingredients: { some: { name: { contains: query, mode: "insensitive" } } } },
      ],
    },
    include: {
      ingredients: { select: { name: true, strength: true, ingredientClass: true } },
    },
    take: limit * 3,
  });

  const score = (row: (typeof rows)[number]) => {
    const generic = row.genericName.toLowerCase();
    const brand = (row.brandName || "").toLowerCase();
    if (generic === query || brand === query) return 0;
    if (generic.startsWith(query) || brand.startsWith(query)) return 1;
    if (generic.includes(query) || brand.includes(query)) return 2;
    return 3;
  };

  return rows
    .sort((a, b) => score(a) - score(b) || a.genericName.localeCompare(b.genericName))
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      genericName: row.genericName,
      brandName: row.brandName,
      strength: row.strength,
      dosageForm: row.dosageForm,
      route: row.route,
      isCombination: row.isCombination,
      medicationClass: row.medicationClass,
      ingredients: row.ingredients,
    }));
}

/* ---------------------------------------------------- patient medications */

export interface PatientMedicationInput {
  medicationId?: string | null;
  displayName: string;
  medicationClass?: string | null;
  strength?: string | null;
  doseAmount?: number | null;
  doseUnit?: string | null;
  morning?: number | null;
  afternoon?: number | null;
  evening?: number | null;
  night?: number | null;
  frequencyNote?: string | null;
  route?: MedicationRoute;
  foodRelation?: "BEFORE_FOOD" | "AFTER_FOOD" | "WITH_FOOD" | "NOT_SPECIFIED";
  indication?: string | null;
  notes?: string | null;
  startedOn?: string | null;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function listPatientMedications(patientId: string, includeStopped = false) {
  const rows = await prisma.patientMedication.findMany({
    where: { patientId, ...(includeStopped ? {} : { active: true }) },
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    include: { medication: { select: { genericName: true, brandName: true, isCombination: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
    medicationClass: row.medicationClass,
    strength: row.strength,
    doseAmount: row.doseAmount === null ? null : Number(row.doseAmount),
    doseUnit: row.doseUnit,
    schedule: {
      morning: Number(row.morning),
      afternoon: Number(row.afternoon),
      evening: Number(row.evening),
      night: Number(row.night),
      note: row.frequencyNote,
    },
    /** The rendered form the engines and the report display. */
    dose: describeDose(row),
    route: row.route,
    foodRelation: row.foodRelation,
    indication: row.indication,
    notes: row.notes,
    startedOn: row.startedOn,
    stoppedOn: row.stoppedOn,
    stopReason: row.stopReason,
    active: row.active,
    catalogue: row.medication,
  }));
}

/**
 * Adds a medicine to a patient's list.
 *
 * The class is resolved from the formulary entry when one was chosen, and
 * classified from the name otherwise — never left blank, because the
 * duplication and interaction checks are class-based and an unclassified
 * medicine would silently escape them.
 */
export async function addPatientMedication(
  patientId: string,
  input: PatientMedicationInput,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const catalogue = input.medicationId
    ? await prisma.medication.findUnique({ where: { id: input.medicationId } })
    : null;

  if (input.medicationId && !catalogue) {
    throw ApiError.invalidRequest("That medicine is not in the formulary.");
  }

  const medicationClass =
    input.medicationClass ||
    catalogue?.medicationClass ||
    classifyDrug(input.displayName) ||
    null;

  const created = await prisma.patientMedication.create({
    data: {
      patientId,
      medicationId: catalogue?.id ?? null,
      displayName: input.displayName,
      medicationClass,
      strength: input.strength ?? catalogue?.strength ?? null,
      doseAmount: input.doseAmount ?? null,
      doseUnit: input.doseUnit ?? null,
      morning: input.morning ?? 0,
      afternoon: input.afternoon ?? 0,
      evening: input.evening ?? 0,
      night: input.night ?? 0,
      frequencyNote: input.frequencyNote ?? null,
      route: input.route ?? catalogue?.route ?? "ORAL",
      foodRelation: input.foodRelation ?? "NOT_SPECIFIED",
      indication: input.indication ?? null,
      notes: input.notes ?? null,
      startedOn: toDate(input.startedOn),
    },
  });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "medicationAdded",
    category: "clinical",
    entity: "PatientMedication",
    entityId: created.id,
    requestId: options.requestId,
    detail: `${created.displayName} added to the current medication list.`,
  });

  return created;
}

export async function updatePatientMedication(
  medicationId: string,
  patientId: string,
  input: Partial<PatientMedicationInput>,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const existing = await prisma.patientMedication.findFirst({
    where: { id: medicationId, patientId },
  });
  if (!existing) throw ApiError.notFound("Medication not found on this patient.");
  if (!existing.active) {
    throw ApiError.conflict("This medicine has been stopped. Add it again rather than editing the stopped entry.");
  }

  const data: Prisma.PatientMedicationUpdateInput = {};
  if (input.displayName !== undefined) data.displayName = input.displayName;
  if (input.medicationClass !== undefined) data.medicationClass = input.medicationClass;
  if (input.strength !== undefined) data.strength = input.strength;
  if (input.doseAmount !== undefined) data.doseAmount = input.doseAmount;
  if (input.doseUnit !== undefined) data.doseUnit = input.doseUnit;
  if (input.morning !== undefined) data.morning = input.morning ?? 0;
  if (input.afternoon !== undefined) data.afternoon = input.afternoon ?? 0;
  if (input.evening !== undefined) data.evening = input.evening ?? 0;
  if (input.night !== undefined) data.night = input.night ?? 0;
  if (input.frequencyNote !== undefined) data.frequencyNote = input.frequencyNote;
  if (input.route !== undefined) data.route = input.route;
  if (input.foodRelation !== undefined) data.foodRelation = input.foodRelation;
  if (input.indication !== undefined) data.indication = input.indication;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.startedOn !== undefined) data.startedOn = toDate(input.startedOn);

  const updated = await prisma.patientMedication.update({ where: { id: medicationId }, data });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "medicationChanged",
    category: "clinical",
    entity: "PatientMedication",
    entityId: medicationId,
    requestId: options.requestId,
    detail: `${updated.displayName} amended.`,
  });

  return updated;
}

/**
 * Stops a medicine.
 *
 * The row stays, with a stop date and a reason, so an earlier encounter can
 * still be read back with the medication list the patient was actually on at
 * the time. Deleting it would make the historical record wrong.
 */
export async function stopPatientMedication(
  medicationId: string,
  patientId: string,
  input: { stoppedOn?: string | null; reason: string },
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const existing = await prisma.patientMedication.findFirst({
    where: { id: medicationId, patientId },
  });
  if (!existing) throw ApiError.notFound("Medication not found on this patient.");
  if (!existing.active) throw ApiError.conflict("This medicine is already stopped.");

  const updated = await prisma.patientMedication.update({
    where: { id: medicationId },
    data: {
      active: false,
      stoppedOn: toDate(input.stoppedOn) ?? new Date(),
      stopReason: input.reason,
    },
  });

  await recordAudit(prisma, {
    patientId,
    actorId: options.actor.clinician.id,
    action: "medicationStopped",
    category: "clinical",
    entity: "PatientMedication",
    entityId: medicationId,
    requestId: options.requestId,
    reason: input.reason,
    detail: `${updated.displayName} stopped.`,
  });

  return updated;
}
