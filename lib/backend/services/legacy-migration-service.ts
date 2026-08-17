/* =========================================================================
   Migration from browser storage.

   CORSC currently keeps patient records in the browser's local storage. That
   is not a defensible place for identifiable clinical data — unencrypted at
   rest, readable by anything running in the page, gone when the browser is
   cleared, impossible to audit or revoke — and moving it into PostgreSQL is
   the point of this work.

   The migration is built around one rule: NOTHING IS LOST AND NOTHING IS
   GUESSED.

     - Every record offered is accounted for. It is imported, skipped as a
       duplicate, flagged for review, or failed — with a reason. There is no
       path where a record silently disappears.

     - A record can be validated without being written (`commit: false`), so a
       clinician can see exactly what would happen before it happens.

     - Re-running the migration does not duplicate anything: each record's
       browser identifier is kept on the patient row and in a `legacy_imports`
       ledger, and a second run recognises it.

     - Fields that cannot be confidently mapped are named in the report and the
       record is marked as needing review. They are not guessed at. A cycle
       number invented from a label, or a therapy class inferred from a regimen
       string, would be a clinical fact this software made up.

     - The browser copy is not touched. Deleting the source before anyone has
       confirmed the import would make a bad import unrecoverable.
   ========================================================================= */

import type { LegacyImportOutcome } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { recordAudit } from "@/lib/backend/services/audit-service";
import { createPatientRecord, writePatientRecord } from "@/lib/backend/services/patient-record-service";
import { THERAPY_CLASSES } from "@/lib/clinical-data";
import { migratePatient } from "@/lib/patient-model";

const THERAPY_IDS = new Set(THERAPY_CLASSES.map((item: { id: string }) => item.id));

export interface MigrationRecordReport {
  legacyId: string;
  /** Echoed back so the clinician can identify the record in their own list.
   *  Not written to the import ledger — that table holds no patient data. */
  name: string;
  outcome: LegacyImportOutcome;
  patientId: string | null;
  visits: number;
  reason: string | null;
  unmappedFields: string[];
}

export interface MigrationReport {
  committed: boolean;
  found: number;
  imported: number;
  skippedDuplicate: number;
  needsReview: number;
  failed: number;
  records: MigrationRecordReport[];
}

interface Assessed {
  legacyId: string;
  name: string;
  document: Record<string, unknown>;
  visits: number;
  problems: string[];
  unmapped: string[];
}

/**
 * Checks one browser record without writing anything.
 *
 * `problems` block the import. `unmapped` do not — the record still goes in,
 * flagged, because a patient with an unrecognised therapy string is better
 * held in the database with a note than left in local storage.
 */
function assess(raw: Record<string, unknown>): Assessed | { legacyId: string; name: string; fatal: string } {
  const legacyId = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (!legacyId) {
    return { legacyId: "(no identifier)", name, fatal: "The record has no identifier, so a repeat import could not be recognised." };
  }
  if (!name) {
    return { legacyId, name: "", fatal: "The record has no patient name." };
  }

  // migratePatient is the same function the browser store applies on read, so
  // a record written by any earlier build arrives in the current shape.
  const document = migratePatient(raw) as Record<string, unknown> | null;
  if (!document) {
    return { legacyId, name, fatal: "The record could not be read as a patient." };
  }

  const problems: string[] = [];
  const unmapped: string[] = [];

  const therapy = Array.isArray(document.therapy) ? document.therapy : [];
  const unknownTherapy = therapy.filter((value) => !THERAPY_IDS.has(String(value)));
  if (unknownTherapy.length) {
    // Named, not translated. Mapping "AC-T" onto a therapy class would be
    // CORSC inventing a clinical fact about this patient.
    unmapped.push(`therapy (${unknownTherapy.length} unrecognised value${unknownTherapy.length === 1 ? "" : "s"})`);
  }

  const age = document.age;
  if (age !== "" && age !== null && age !== undefined) {
    const parsed = Number(age);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 130) unmapped.push("age");
  }

  const lvef = document.baselineLVEF;
  if (lvef !== "" && lvef !== null && lvef !== undefined) {
    const parsed = Number(lvef);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) unmapped.push("baselineLVEF");
  }

  const visits = Array.isArray(document.visits) ? document.visits.length : 0;
  const undatedVisits = (Array.isArray(document.visits) ? document.visits : []).filter(
    (visit) => !(visit as Record<string, unknown>)?.date
  ).length;
  if (undatedVisits) {
    unmapped.push(`${undatedVisits} encounter${undatedVisits === 1 ? "" : "s"} with no date`);
  }

  return { legacyId, name, document, visits, problems, unmapped };
}

export async function migrateFromBrowserStorage(
  records: Array<Record<string, unknown>>,
  options: { actor: AuthenticatedActor; requestId: string; commit: boolean }
): Promise<MigrationReport> {
  const clinicianId = options.actor.clinician.id;
  const reports: MigrationRecordReport[] = [];

  for (const raw of records) {
    const assessed = assess(raw);

    if ("fatal" in assessed) {
      reports.push({
        legacyId: assessed.legacyId,
        name: assessed.name,
        outcome: "FAILED",
        patientId: null,
        visits: 0,
        reason: assessed.fatal,
        unmappedFields: [],
      });
      continue;
    }

    // Already imported? Recognised by the ledger first, then by the identifier
    // kept on the patient row, so a ledger that was cleared does not cause a
    // duplicate patient.
    const priorImport = await prisma.legacyImport.findUnique({
      where: { clinicianId_legacyId: { clinicianId, legacyId: assessed.legacyId } },
      select: { patientId: true, outcome: true },
    });
    const priorPatient =
      priorImport?.patientId ??
      (
        await prisma.patient.findFirst({
          where: { createdById: clinicianId, legacyId: assessed.legacyId },
          select: { id: true },
        })
      )?.id ??
      null;

    if (priorPatient) {
      reports.push({
        legacyId: assessed.legacyId,
        name: assessed.name,
        outcome: "SKIPPED_DUPLICATE",
        patientId: priorPatient,
        visits: assessed.visits,
        reason: "This record has already been imported. The stored record was left untouched.",
        unmappedFields: [],
      });
      continue;
    }

    const outcome: LegacyImportOutcome = assessed.unmapped.length ? "NEEDS_REVIEW" : "IMPORTED";

    if (!options.commit) {
      reports.push({
        legacyId: assessed.legacyId,
        name: assessed.name,
        outcome,
        patientId: null,
        visits: assessed.visits,
        reason: assessed.unmapped.length
          ? "Would import, with fields that need a clinician to confirm them."
          : "Would import.",
        unmappedFields: assessed.unmapped,
      });
      continue;
    }

    try {
      const created = await createPatientRecord({
        document: assessed.document,
        actor: options.actor,
        requestId: options.requestId,
        legacyId: assessed.legacyId,
      });

      await prisma.legacyImport.create({
        data: {
          clinicianId,
          patientId: created.patient.id,
          legacyId: assessed.legacyId,
          outcome,
          reason: assessed.unmapped.length
            ? "Imported with fields that could not be confidently mapped. Confirm them against the source."
            : null,
          unmappedFields: assessed.unmapped,
          visitsImported: assessed.visits,
        },
      });

      await recordAudit(prisma, {
        patientId: created.patient.id,
        actorId: clinicianId,
        action: "recordImported",
        category: "migration",
        entity: "Patient",
        entityId: created.patient.id,
        requestId: options.requestId,
        detail: `Imported from browser storage with ${assessed.visits} encounter${assessed.visits === 1 ? "" : "s"}.${
          assessed.unmapped.length ? ` ${assessed.unmapped.length} field group(s) need review.` : ""
        }`,
      });

      reports.push({
        legacyId: assessed.legacyId,
        name: assessed.name,
        outcome,
        patientId: created.patient.id,
        visits: assessed.visits,
        reason: assessed.unmapped.length
          ? "Imported. Some fields could not be confidently mapped and need checking against the source."
          : null,
        unmappedFields: assessed.unmapped,
      });
    } catch (error) {
      // The failure reason is recorded, but never the record. A failed import
      // must not park identifiable data in a log table.
      const reason =
        error instanceof Error && error.message.includes("violates check constraint")
          ? "A value in the record is outside the range the database accepts."
          : "The record could not be written. It has been left in the browser store.";

      await prisma.legacyImport
        .create({ data: { clinicianId, legacyId: assessed.legacyId, outcome: "FAILED", reason } })
        .catch(() => undefined);

      reports.push({
        legacyId: assessed.legacyId,
        name: assessed.name,
        outcome: "FAILED",
        patientId: null,
        visits: assessed.visits,
        reason,
        unmappedFields: assessed.unmapped,
      });
    }
  }

  const count = (outcome: LegacyImportOutcome) =>
    reports.filter((report) => report.outcome === outcome).length;

  return {
    committed: options.commit,
    found: records.length,
    imported: count("IMPORTED"),
    skippedDuplicate: count("SKIPPED_DUPLICATE"),
    needsReview: count("NEEDS_REVIEW"),
    failed: count("FAILED"),
    records: reports,
  };
}

/** Everything this clinician has previously imported, for the migration screen. */
export async function migrationHistory(clinicianId: string) {
  const rows = await prisma.legacyImport.findMany({
    where: { clinicianId },
    orderBy: { importedAt: "desc" },
    take: 200,
    include: { patient: { select: { id: true, name: true, status: true } } },
  });

  return rows.map((row) => ({
    legacyId: row.legacyId,
    outcome: row.outcome,
    reason: row.reason,
    unmappedFields: row.unmappedFields,
    visitsImported: row.visitsImported,
    importedAt: row.importedAt,
    patient: row.patient,
  }));
}

/**
 * Re-applies a browser record onto a patient that was already imported.
 *
 * Offered for the case where the browser copy has moved on since the first
 * import — a clinician who kept working offline. It overwrites, so it is a
 * deliberate action rather than part of the bulk migration.
 */
export async function reapplyLegacyRecord(
  patientId: string,
  raw: Record<string, unknown>,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const document = migratePatient(raw) as Record<string, unknown> | null;
  if (!document) {
    return { applied: false, reason: "The record could not be read as a patient." };
  }
  await writePatientRecord(patientId, document, {
    actor: options.actor,
    requestId: options.requestId,
  });
  return { applied: true, reason: null };
}
