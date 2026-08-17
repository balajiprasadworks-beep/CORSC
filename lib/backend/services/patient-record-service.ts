/* =========================================================================
   Reading and writing a whole patient record.

   WHY A DOCUMENT-SHAPED WRITE EXISTS AT ALL

   CORSC's encounter workflow is one continuous page with fourteen sections and
   no save button: every keystroke updates one patient object and a debounced
   autosave persists it. That is a deliberate clinical design — a clinician
   interrupted mid-encounter loses nothing — and it is not something to unpick
   as a side effect of adding a database.

   So the transport stays document-shaped and the storage does not. This
   module decomposes the document into the normalised tables, inside one
   transaction, with an audit entry per changed clinical field. Nothing is
   stored as a serialised patient object; `writePatientRecord` is the only
   place that knows the document shape, and lib/backend/services/engine-patient
   is the only place that rebuilds it.

   The granular REST endpoints under app/api are the primary interface and
   write through the same tables. This one exists so the existing workflow can
   move onto the database in a single step rather than fourteen, and it is the
   part of the API expected to be retired first — see docs/API.md.

   WHAT THIS MODULE WILL NOT DO

   It does not interpret anything. No threshold, no category, no grade is
   computed here. Clinical results come from the engines via
   lib/backend/services/clinical-service and are stored as assessments with the
   engine version that produced them.
   ========================================================================= */

import type { Prisma } from "@prisma/client";
import type {
  ContraindicationSeverity,
  DoseUnit,
  HistoryEntryKind,
  RiskTier,
  Sex,
  SystemExamStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";
import type { AuthenticatedActor } from "@/lib/backend/auth";
import { diffFields, recordAudit, recordAuditBatch, type AuditInput } from "@/lib/backend/services/audit-service";
import { enginePatientInclude, toEnginePatientRecord } from "@/lib/backend/services/engine-patient";
import { ANTHRACYCLINE_AGENTS } from "@/lib/anthracycline";
import { THERAPY_CLASSES, INVESTIGATIONS, SYMPTOMS } from "@/lib/clinical-data";
import { RISK_FACTOR_IDS as KNOWN_RISK_FACTOR_IDS } from "@/lib/backend/validation";
import { classifyDrug } from "@/lib/medication-engine";

/* ---------------------------------------------------------------- helpers */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SEX_BY_LABEL: Record<string, Sex> = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
  "Not recorded": "NOT_RECORDED",
};

const TIER_BY_KEY: Record<string, RiskTier> = {
  veryHigh: "VERY_HIGH",
  high: "HIGH",
  m2: "MODERATE_2",
  m1: "MODERATE_1",
};

const SYSTEM_STATUS_BY_LABEL: Record<string, SystemExamStatus> = {
  "": "NOT_EXAMINED",
  normal: "NORMAL",
  findings: "FINDINGS",
};

const DOSE_UNIT_BY_LABEL: Record<string, DoseUnit> = {
  "mg/m2": "MG_PER_M2",
  mg: "MG",
};

const THERAPY_IDS = new Set(THERAPY_CLASSES.map((item: { id: string }) => item.id));
const INVESTIGATION_IDS = new Set(INVESTIGATIONS.map((item: { id: string }) => item.id));
const SYMPTOM_LABELS = new Set<string>(SYMPTOMS);
// The HFA-ICOS proforma identifiers, including legacy ones — the same set the
// validator accepts, so nothing that passed validation is dropped here.
const RISK_FACTOR_IDS = new Set(KNOWN_RISK_FACTOR_IDS);
const ANTHRACYCLINE_IDS = new Set(ANTHRACYCLINE_AGENTS.map((item: { id: string }) => item.id));

/**
 * A number, or null when the field was left blank.
 *
 * Never zero for a blank field: a blank ejection fraction stored as 0 would be
 * read by the engines as profound cardiac dysfunction.
 */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: unknown): number | null {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function clamp(value: number | null, min: number, max: number): number | null {
  if (value === null) return null;
  return value < min || value > max ? null : value;
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const date = new Date(`${value.trim()}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toText(value: unknown, max = 8000): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/* --------------------------------------------------------------- reading */

export interface PatientRecord {
  /** The engine-shaped record, ready for the workflow and the engines. */
  patient: ReturnType<typeof toEnginePatientRecord>;
  /** Concurrency token: send it back with the next write. */
  updatedAt: string;
}

export async function readPatientRecord(patientId: string): Promise<PatientRecord> {
  const row = await prisma.patient.findUnique({
    where: { id: patientId },
    include: enginePatientInclude,
  });
  if (!row) throw ApiError.notFound("Patient not found.");
  return { patient: toEnginePatientRecord(row), updatedAt: row.updatedAt.toISOString() };
}

/* --------------------------------------------------------------- writing */

export interface WriteOptions {
  actor: AuthenticatedActor;
  requestId: string;
  /** The updatedAt the client last saw. Omit to skip the concurrency check. */
  expectedUpdatedAt?: string | null;
}

/** Fields whose change is worth an audit entry. */
const AUDITED_PATIENT_FIELDS = [
  "name",
  "age",
  "gender",
  "stage",
  "clinicalStatus",
  "therapy",
  "regimen",
  "plannedCycles",
  "cycleFrequency",
  "totalPlannedDose",
  "cycle",
  "baselineLVEF",
  "baselineGLS",
  "baselineQTc",
  "baselineTroponin",
  "baselineNtProBnp",
  "troponinAssay",
  "troponinURL",
  "baselineWeight",
] as const;

/**
 * Writes a whole patient document into the normalised tables.
 *
 * Everything happens in one transaction. A chemotherapy cycle that recorded
 * its doses but lost its surveillance recalculation, or a patient whose
 * baseline saved but whose risk factors did not, would be worse than a failed
 * save, because nothing would say the record was incomplete.
 */
export async function writePatientRecord(
  patientId: string,
  document: Record<string, unknown>,
  options: WriteOptions
): Promise<PatientRecord> {
  const existing = await prisma.patient.findUnique({
    where: { id: patientId },
    include: enginePatientInclude,
  });
  if (!existing) throw ApiError.notFound("Patient not found.");

  if (options.expectedUpdatedAt) {
    const expected = new Date(options.expectedUpdatedAt);
    if (Number.isFinite(expected.getTime()) && expected.getTime() !== existing.updatedAt.getTime()) {
      throw ApiError.conflict(
        "This record was changed by someone else after you opened it. Reload it before saving, so their entry is not overwritten.",
        { serverUpdatedAt: existing.updatedAt.toISOString() }
      );
    }
  }

  const before = toEnginePatientRecord(existing);
  const audits: AuditInput[] = [];
  const auditBase = {
    patientId,
    actorId: options.actor.clinician.id,
    requestId: options.requestId,
  };

  await prisma.$transaction(async (tx) => {
    await writeCore(tx, patientId, document);
    await writeBaseline(tx, patientId, document);
    await writeToxicityStatus(tx, patientId, document, options.actor.clinician.id);
    await writeHistory(tx, patientId, document);
    await writeRiskFactors(tx, patientId, document);
    await writeContraindications(tx, patientId, document);
    await writeDiagnosis(tx, patientId, document);
    const planId = await writeTherapy(tx, patientId, document);
    await writeMedications(tx, patientId, document, audits, auditBase);
    await writeVisits(tx, patientId, document, options.actor.clinician.id);
    await writeAnthracyclineDoses(tx, patientId, planId, document);

    // Touch the patient so updatedAt moves even when only a child row changed;
    // otherwise the concurrency token would not detect the write.
    await tx.patient.update({ where: { id: patientId }, data: { updatedAt: new Date() } });
  });

  const after = await prisma.patient.findUnique({
    where: { id: patientId },
    include: enginePatientInclude,
  });
  if (!after) throw ApiError.notFound("Patient not found.");

  const engineAfter = toEnginePatientRecord(after);

  audits.push(
    ...diffFields(
      pick(before, AUDITED_PATIENT_FIELDS),
      pick(engineAfter, AUDITED_PATIENT_FIELDS),
      { ...auditBase, action: "patientEdited", category: "record", entity: "Patient", entityId: patientId }
    )
  );

  // The computed baseline category is not stored, but a change in it is worth
  // recording: it explains why the surveillance plan moved.
  if (before.risk?.category !== engineAfter.risk?.category) {
    audits.push({
      ...auditBase,
      action: "riskChanged",
      category: "clinical",
      entity: "Patient",
      entityId: patientId,
      field: "riskCategory",
      previous: before.risk?.category,
      next: engineAfter.risk?.category,
      detail: "Recalculated from the recorded data. Not a clinician override.",
    });
  }

  await recordAuditBatch(prisma, audits);

  return { patient: engineAfter, updatedAt: after.updatedAt.toISOString() };
}

function pick<T extends Record<string, unknown>>(source: T, fields: readonly string[]) {
  const out: Record<string, unknown> = {};
  fields.forEach((field) => {
    out[field] = source[field];
  });
  return out;
}

/* ------------------------------------------------------------ core columns */

async function writeCore(tx: Prisma.TransactionClient, patientId: string, document: Record<string, unknown>) {
  const data: Prisma.PatientUpdateInput = {};

  const name = toText(document.name, 200);
  if (name) data.name = name;

  if ("patientId" in document) data.hospitalPatientId = toText(document.patientId, 80);
  if ("mrn" in document) data.mrn = toText(document.mrn, 80);
  if ("age" in document) data.ageAtRegistration = clamp(toInteger(document.age), 0, 130);
  if ("dateOfBirth" in document) data.dateOfBirth = toDate(document.dateOfBirth);
  if ("gender" in document) data.sex = SEX_BY_LABEL[String(document.gender)] ?? "NOT_RECORDED";
  if ("clinicalStatus" in document) data.clinicalStatus = toText(document.clinicalStatus, 40) || "Stable";

  const registered = toDate(document.registeredDate);
  if (registered) data.registeredOn = registered;

  if (Object.keys(data).length > 0) {
    await tx.patient.update({ where: { id: patientId }, data });
  }
}

/* ---------------------------------------------------------------- baseline */

async function writeBaseline(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>
) {
  const baselineKeys = [
    "baselineLVEF",
    "baselineGLS",
    "baselineQTc",
    "baselineTroponin",
    "baselineNtProBnp",
    "baselineWeight",
    "baselineHeight",
    "troponinAssay",
    "troponinURL",
  ];
  if (!baselineKeys.some((key) => key in document)) return;

  const data = {
    lvef: clamp(toNumber(document.baselineLVEF), 0, 100),
    // GLS is reported negative by convention; only the magnitude is bounded.
    gls: clamp(toNumber(document.baselineGLS), -60, 60),
    qtc: clamp(toInteger(document.baselineQTc), 200, 800),
    troponin: nonNegative(toNumber(document.baselineTroponin)),
    ntProBnp: nonNegative(toNumber(document.baselineNtProBnp)),
    weightKg: clamp(toNumber(document.baselineWeight), 0.5, 400),
    heightCm: clamp(toNumber(document.baselineHeight), 20, 260),
    troponinAssayId: toText(document.troponinAssay, 60),
    troponinLocalUrl: nonNegative(toNumber(document.troponinURL)),
  };

  await tx.patientBaseline.upsert({
    where: { patientId },
    create: { patientId, ...data },
    update: data,
  });
}

function nonNegative(value: number | null): number | null {
  return value === null || value < 0 ? null : value;
}

/* -------------------------------------------------------- toxicity status */

async function writeToxicityStatus(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>,
  actorId: string
) {
  if (!("restratification" in document)) return;
  const source = record(document.restratification);

  const data = {
    myocarditisConfirmed: Boolean(source.myocarditisConfirmed),
    severeHeartFailure: Boolean(source.severeHF),
    troponinRise: Boolean(source.troponinRise),
    glsFallPercent: clamp(toNumber(source.glsFall), -100, 100),
    currentLvef: clamp(toNumber(source.currentLVEF), 0, 100),
    updatedById: actorId,
  };

  await tx.patientToxicityStatus.upsert({
    where: { patientId },
    create: { patientId, ...data },
    update: data,
  });
}

/* ---------------------------------------------------------------- history */

/**
 * History is current state, not an event log, so the recorded set is replaced
 * rather than appended to. Un-ticking "prior mediastinal radiotherapy" has to
 * mean the patient does not have it; leaving the old row behind would keep
 * scoring a factor the clinician withdrew.
 */
async function writeHistory(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>
) {
  if (!("history" in document)) return;
  const groups = record(document.history);

  const rows: Prisma.PatientHistoryEntryCreateManyInput[] = [];
  Object.entries(groups).forEach(([groupId, groupValue]) => {
    const group = record(groupValue);
    Object.entries(record(group.checks)).forEach(([itemId, checked]) => {
      if (!checked) return;
      rows.push({ patientId, groupId, itemId, kind: "CHECK" as HistoryEntryKind, checked: true });
    });
    Object.entries(record(group.fields)).forEach(([itemId, value]) => {
      const text = toText(value, 1000);
      if (!text) return;
      rows.push({ patientId, groupId, itemId, kind: "FIELD" as HistoryEntryKind, value: text });
    });
  });

  await tx.patientHistoryEntry.deleteMany({ where: { patientId } });
  if (rows.length) await tx.patientHistoryEntry.createMany({ data: rows });
}

async function writeRiskFactors(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>
) {
  const tierKeys = Object.keys(TIER_BY_KEY);
  if (!tierKeys.some((key) => key in document)) return;

  const rows: Prisma.RiskFactorAssertionCreateManyInput[] = [];
  tierKeys.forEach((key) => {
    Object.entries(record(document[key])).forEach(([factorId, present]) => {
      // Unknown identifiers are dropped rather than stored: a factor the
      // engine does not recognise would never be scored, and keeping it would
      // suggest it was.
      if (!present || !RISK_FACTOR_IDS.has(factorId)) return;
      rows.push({ patientId, tier: TIER_BY_KEY[key], factorId, present: true });
    });
  });

  await tx.riskFactorAssertion.deleteMany({ where: { patientId } });
  if (rows.length) await tx.riskFactorAssertion.createMany({ data: rows });
}

async function writeContraindications(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>
) {
  if (!("contraindications" in document)) return;
  const source = record(document.contraindications);

  const rows: Prisma.ContraindicationAssertionCreateManyInput[] = [];
  (["absolute", "relative"] as const).forEach((bucket) => {
    Object.entries(record(source[bucket])).forEach(([factorId, present]) => {
      if (!present) return;
      rows.push({
        patientId,
        severity: (bucket === "absolute" ? "ABSOLUTE" : "RELATIVE") as ContraindicationSeverity,
        factorId,
        present: true,
      });
    });
  });

  await tx.contraindicationAssertion.deleteMany({ where: { patientId } });
  if (rows.length) await tx.contraindicationAssertion.createMany({ data: rows });
}

/* -------------------------------------------------------------- diagnosis */

async function writeDiagnosis(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>
) {
  if (!("diagnosis" in document) && !("stage" in document)) return;

  const primarySite = toText(document.diagnosis, 200);
  const stage = toText(document.stage, 80);
  if (!primarySite && !stage) return;

  const existing = await tx.cancerDiagnosis.findFirst({
    where: { patientId, isPrimary: true },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    await tx.cancerDiagnosis.update({
      where: { id: existing.id },
      data: { primarySite: primarySite || existing.primarySite, stage },
    });
    return;
  }

  await tx.cancerDiagnosis.create({
    data: { patientId, primarySite: primarySite || "Not recorded", stage, isPrimary: true },
  });
}

/* ---------------------------------------------------------------- therapy */

async function writeTherapy(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>
): Promise<string | null> {
  const therapyKeys = [
    "therapy",
    "regimen",
    "plannedCycles",
    "cycleFrequency",
    "cycle",
    "totalPlannedDose",
  ];
  if (!therapyKeys.some((key) => key in document)) {
    const current = await tx.therapyPlan.findFirst({ where: { patientId, active: true } });
    return current?.id ?? null;
  }

  // Combination therapy is the case that matters: a patient on an
  // anthracycline and HER2 blockade is on both, and dropping either would
  // change which HFA-ICOS proformas run.
  const classes = list(document.therapy)
    .map((value) => String(value))
    .filter((value) => THERAPY_IDS.has(value));

  const data = {
    regimen: toText(document.regimen, 200),
    plannedCycles: clamp(toInteger(document.plannedCycles), 1, 200),
    cycleFrequency: toText(document.cycleFrequency, 80),
    currentCycle: clamp(toInteger(document.cycle), 0, 200) ?? 0,
    plannedCumulativeDose: clamp(toNumber(document.totalPlannedDose), 0, 5000),
  };

  const existing = await tx.therapyPlan.findFirst({
    where: { patientId, active: true },
    orderBy: { createdAt: "asc" },
  });

  const plan = existing
    ? await tx.therapyPlan.update({ where: { id: existing.id }, data })
    : await tx.therapyPlan.create({ data: { patientId, ...data } });

  await tx.therapyClassAssignment.deleteMany({ where: { therapyPlanId: plan.id } });
  if (classes.length) {
    await tx.therapyClassAssignment.createMany({
      data: classes.map((therapyClass, position) => ({
        therapyPlanId: plan.id,
        therapyClass,
        position,
      })),
    });
  }

  return plan.id;
}

/* ------------------------------------------------------ anthracycline doses */

async function writeAnthracyclineDoses(
  tx: Prisma.TransactionClient,
  patientId: string,
  therapyPlanId: string | null,
  document: Record<string, unknown>
) {
  if (!("anthracyclineDoses" in document)) return;

  const entries = list(document.anthracyclineDoses).map((raw) => {
    const dose = record(raw);
    const agentId = String(dose.agent ?? dose.agentId ?? "");
    const amount = toNumber(dose.dose);
    const cycleNumber = clamp(toInteger(dose.cycle), 1, 200);

    // A dose that cannot be converted is kept with the reason, never dropped:
    // a cumulative total that silently discarded a dose would understate the
    // patient's exposure, which is the one number this ledger exists to get
    // right.
    const failures: string[] = [];
    if (!ANTHRACYCLINE_IDS.has(agentId)) {
      failures.push("The agent is not one CORSC holds an equivalence factor for.");
    }
    if (amount === null || amount < 0) {
      failures.push("No usable dose amount was recorded.");
    }

    return {
      agentId: agentId || "unknown",
      dose: amount !== null && amount >= 0 ? amount : 0,
      doseUnit: DOSE_UNIT_BY_LABEL[String(dose.unit)] ?? ("MG_PER_M2" as DoseUnit),
      bsa: clamp(toNumber(dose.bsa), 0.1, 4),
      cycleNumber,
      givenOn: toDate(dose.date),
      equivalenceModelId: toText(dose.modelId, 60) || "feijen2019",
      conversionFailureReason: failures.length ? failures.join(" ") : null,
    };
  });

  const cycles = therapyPlanId
    ? await tx.therapyCycle.findMany({ where: { therapyPlanId }, select: { id: true, cycleNumber: true } })
    : [];
  const cycleByNumber = new Map(cycles.map((cycle) => [cycle.cycleNumber, cycle.id]));

  await tx.anthracyclineDose.deleteMany({ where: { patientId } });
  if (entries.length) {
    await tx.anthracyclineDose.createMany({
      data: entries.map((entry) => ({
        patientId,
        cycleId: entry.cycleNumber ? cycleByNumber.get(entry.cycleNumber) ?? null : null,
        ...entry,
      })),
    });
  }
}

/* ------------------------------------------------------------ medications */

/**
 * Medications are deactivated, not deleted.
 *
 * Removing a medicine from the list in the workflow means the patient is no
 * longer taking it, which is a clinical event with a date — not evidence that
 * they never took it. The row stays with `stoppedOn` set, so the record can
 * still answer what the patient was on at the time of an earlier encounter.
 */
async function writeMedications(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>,
  audits: AuditInput[],
  auditBase: { patientId: string; actorId: string; requestId: string }
) {
  if (!("medications" in document)) return;

  const incoming = list(document.medications).map((raw) => {
    const medication = record(raw);
    const displayName = toText(medication.name, 200) || "";
    const klass = toText(medication.klass, 60);
    return {
      id: typeof medication.id === "string" && UUID.test(medication.id) ? medication.id : null,
      displayName,
      medicationClass: klass || (displayName ? classifyDrug(displayName) || null : null),
      doseText: toText(medication.dose, 200),
      medicationId:
        typeof medication.medicationId === "string" && UUID.test(medication.medicationId)
          ? medication.medicationId
          : null,
    };
  }).filter((medication) => medication.displayName);

  const existing = await tx.patientMedication.findMany({ where: { patientId, active: true } });
  const keptIds = new Set(incoming.map((medication) => medication.id).filter(Boolean) as string[]);

  for (const medication of incoming) {
    // `dose` arrives as the free-text string the current form produces. It is
    // stored in frequencyNote rather than being parsed into the four
    // prescription slots: guessing that "2.5 mg BD" means 1-0-1-0 would invent
    // a prescription. The structured endpoint under /api/patients/:id/medications
    // takes the slots directly.
    const data = {
      displayName: medication.displayName,
      medicationClass: medication.medicationClass,
      frequencyNote: medication.doseText,
      medicationId: medication.medicationId,
      active: true,
      stoppedOn: null,
    };

    if (medication.id && existing.some((row) => row.id === medication.id)) {
      await tx.patientMedication.update({ where: { id: medication.id }, data });
      continue;
    }

    const created = await tx.patientMedication.create({ data: { patientId, ...data } });
    keptIds.add(created.id);
    audits.push({
      ...auditBase,
      action: "medicationAdded",
      category: "clinical",
      entity: "PatientMedication",
      entityId: created.id,
      detail: `${created.displayName} added to the current medication list.`,
    });
  }

  const stopped = existing.filter((row) => !keptIds.has(row.id));
  for (const row of stopped) {
    await tx.patientMedication.update({
      where: { id: row.id },
      data: { active: false, stoppedOn: new Date(), stopReason: "Removed from the medication list." },
    });
    audits.push({
      ...auditBase,
      action: "medicationStopped",
      category: "clinical",
      entity: "PatientMedication",
      entityId: row.id,
      detail: `${row.displayName} removed from the current medication list.`,
    });
  }
}

/* ------------------------------------------------------------------ visits */

/**
 * Visits, including the draft encounter the workflow is currently editing.
 *
 * The draft is stored as a visit with DRAFT status rather than held apart,
 * so an interrupted encounter survives a lost laptop as well as a lost tab.
 */
async function writeVisits(
  tx: Prisma.TransactionClient,
  patientId: string,
  document: Record<string, unknown>,
  clinicianId: string
) {
  const filed = list(document.visits);
  const draft = document.draftEncounter ? [document.draftEncounter] : [];
  if (!("visits" in document) && !("draftEncounter" in document)) return;

  const existing = await tx.visit.findMany({
    where: { patientId },
    select: { id: true, legacyId: true },
  });
  const byLegacyId = new Map(existing.filter((v) => v.legacyId).map((v) => [v.legacyId as string, v.id]));
  const knownIds = new Set(existing.map((v) => v.id));

  const seen = new Set<string>();

  for (const raw of [...filed, ...draft]) {
    const visit = record(raw);
    const clientId = typeof visit.id === "string" ? visit.id : "";

    // Records created in the browser carry ids like "v_kx91_a3b". They are kept
    // as legacyId so a re-save recognises the same encounter instead of
    // duplicating it.
    const resolvedId =
      clientId && UUID.test(clientId) && knownIds.has(clientId)
        ? clientId
        : byLegacyId.get(clientId) ?? null;

    const isDraft = draft.length > 0 && raw === draft[0];
    const visitId = await upsertVisit(tx, {
      patientId,
      clinicianId,
      visitId: resolvedId,
      legacyId: clientId && !UUID.test(clientId) ? clientId : null,
      visit,
      isDraft,
    });
    seen.add(visitId);
  }

  // Any DRAFT visit the document no longer carries has been filed or
  // abandoned by another session. Filed visits are never removed here.
  await tx.visit.deleteMany({
    where: { patientId, status: "DRAFT", id: { notIn: Array.from(seen) } },
  });
}

async function upsertVisit(
  tx: Prisma.TransactionClient,
  input: {
    patientId: string;
    clinicianId: string;
    visitId: string | null;
    legacyId: string | null;
    visit: Record<string, unknown>;
    isDraft: boolean;
  }
): Promise<string> {
  const { visit } = input;
  const firstReview = record(visit.firstReview);
  const label = toText(visit.type, 80);
  const cycleNumber = clamp(toInteger(firstReview.cycle ?? visit.cycle), 0, 200);
  const status = input.isDraft ? "DRAFT" : visit.saved ? "FILED" : "DRAFT";

  const data = {
    visitType: toText(visit.visitType, 60) || inferVisitType(label),
    label,
    cycleNumber,
    occurredOn: toDate(visit.date) ?? new Date(),
    status: status as "DRAFT" | "FILED",
    filedAt: status === "FILED" ? new Date() : null,
    tolerance: toText(firstReview.tolerance, 200),
    interimEvents: toText(firstReview.interimEvents, 2000),
    admissions: toText(firstReview.admissions, 2000),
    clinicalConcerns: toText(firstReview.clinicalConcerns, 2000),
    earlyToxicity: toText(firstReview.earlyToxicity, 2000),
    heartFailureStatus: toText(visit.hfStatus, 80),
    medicationReview: toText(visit.medReview, 4000),
    plan: toText(visit.plan, 4000),
    notes: toText(visit.notes, 8000),
    nextFollowUpOn: toDate(visit.nextFollowUpDate),
    generatedSummary: toText(visit.aiSummary, 8000),
  };

  const row = input.visitId
    ? await tx.visit.update({ where: { id: input.visitId }, data })
    : await tx.visit.create({
        data: {
          patientId: input.patientId,
          clinicianId: input.clinicianId,
          legacyId: input.legacyId,
          ...data,
        },
      });

  await writeVisitChildren(tx, row.id, input.patientId, visit);
  return row.id;
}

/** Best guess at the visit type for a record that predates the type vocabulary. */
function inferVisitType(label: string | null): string {
  const text = (label || "").toLowerCase();
  if (text.includes("baseline")) return "baseline";
  if (text.includes("cycle") || text.includes("dose")) return "cycleReview";
  if (text.includes("12") && text.includes("month")) return "twelveMonth";
  if (text.includes("6") && text.includes("month")) return "sixMonth";
  if (text.includes("3") && text.includes("month")) return "threeMonth";
  if (text.includes("end")) return "endOfTreatment";
  return "cycleReview";
}

async function writeVisitChildren(
  tx: Prisma.TransactionClient,
  visitId: string,
  patientId: string,
  visit: Record<string, unknown>
) {
  /* vitals */
  if ("vitals" in visit) {
    const vitals = record(visit.vitals);
    const data = {
      heightCm: clamp(toNumber(vitals.height), 20, 260),
      weightKg: clamp(toNumber(vitals.weight), 0.5, 400),
      referenceWeightKg: clamp(toNumber(vitals.referenceWeight), 0.5, 400),
      systolicBp: clamp(toInteger(vitals.sbp), 40, 300),
      diastolicBp: clamp(toInteger(vitals.dbp), 20, 200),
      pulse: clamp(toInteger(vitals.pulse), 20, 300),
      respiratoryRate: clamp(toInteger(vitals.rr), 4, 80),
      spo2: clamp(toInteger(vitals.spo2), 50, 100),
      temperatureC: clamp(toNumber(vitals.temp), 25, 45),
    };
    await tx.visitVitals.upsert({ where: { visitId }, create: { visitId, ...data }, update: data });
  }

  /* symptoms */
  if ("symptoms" in visit || "symptomDetail" in visit) {
    const reported = list(visit.symptoms).map(String).filter((symptom) => SYMPTOM_LABELS.has(symptom));
    const detail = record(visit.symptomDetail);
    await tx.visitSymptom.deleteMany({ where: { visitId } });
    if (reported.length) {
      await tx.visitSymptom.createMany({
        data: reported.map((symptom) => {
          const entry = record(detail[symptom]);
          return {
            visitId,
            symptom,
            severity: toText(entry.severity, 40),
            duration: toText(entry.duration, 160),
            trigger: toText(entry.trigger, 160),
            radiation: toText(entry.radiation, 160),
            associated: toText(entry.associated, 160),
          };
        }),
      });
    }
  }

  /* systemic examination */
  if ("systems" in visit) {
    const systems = record(visit.systems);
    await tx.visitSystemExam.deleteMany({ where: { visitId } });
    for (const [systemId, rawSystem] of Object.entries(systems)) {
      const system = record(rawSystem);
      const status = SYSTEM_STATUS_BY_LABEL[String(system.status ?? "")] ?? "NOT_EXAMINED";
      const components = record(system.components);
      const componentRows = Object.entries(components)
        .map(([componentId, rawComponent]) => {
          const component = record(rawComponent);
          return {
            componentId,
            normal: Boolean(component.normal),
            findings: toText(component.text, 500),
          };
        })
        .filter((component) => component.normal || component.findings);

      if (status === "NOT_EXAMINED" && componentRows.length === 0) continue;

      await tx.visitSystemExam.create({
        data: {
          visitId,
          systemId,
          status,
          components: componentRows.length ? { createMany: { data: componentRows } } : undefined,
        },
      });
    }
  }

  /* interval history */
  if ("sinceLastVisit" in visit) {
    const answers = record(visit.sinceLastVisit);
    await tx.visitIntervalAnswer.deleteMany({ where: { visitId } });
    const rows = Object.entries(answers).map(([itemId, rawAnswer]) => {
      const answer = record(rawAnswer);
      const present = "present" in answer ? Boolean(answer.present) : Boolean(rawAnswer);
      return { visitId, itemId, present, detail: toText(answer.detail, 1000) };
    });
    if (rows.length) await tx.visitIntervalAnswer.createMany({ data: rows });
  }

  /* surveillance task completion */
  if ("taskCompletion" in visit) {
    const tasks = record(visit.taskCompletion);
    await tx.visitTaskCompletion.deleteMany({ where: { visitId } });
    const rows = Object.entries(tasks).map(([taskId, completed]) => ({
      visitId,
      taskId,
      completed: Boolean(completed),
    }));
    if (rows.length) await tx.visitTaskCompletion.createMany({ data: rows });
  }

  /* medication recommendation decisions */
  if ("medDecisions" in visit) {
    const decisions = record(visit.medDecisions);
    await tx.visitMedicationDecision.deleteMany({ where: { visitId } });
    const rows = Object.entries(decisions)
      .filter(([, decision]) => Boolean(decision))
      .map(([recommendationId, decision]) => ({
        visitId,
        recommendationId,
        decision: String(decision).slice(0, 40),
      }));
    if (rows.length) await tx.visitMedicationDecision.createMany({ data: rows });
  }

  /* investigations */
  if ("inv" in visit) {
    const investigations = record(visit.inv);
    const measuredDefault = toDate(visit.date);
    await tx.investigation.deleteMany({ where: { visitId } });

    const rows: Prisma.InvestigationCreateManyInput[] = [];
    Object.entries(investigations).forEach(([investigationId, rawEntry]) => {
      if (!INVESTIGATION_IDS.has(investigationId)) return;
      const entry = record(rawEntry);
      const resultText = toText(entry.result, 2000);
      const numericValue = toNumber(entry.value ?? entry.result);
      const interpretation = toText(entry.interp, 40);
      const comment = toText(entry.comment, 1000);
      const measurements = record(entry.measurements);
      const hasMeasurements = Object.values(measurements).some((value) => value !== "" && value !== null);

      if (!resultText && numericValue === null && !interpretation && !comment && !hasMeasurements) return;

      rows.push({
        patientId,
        visitId,
        investigationId,
        measuredOn: toDate(entry.date) ?? measuredDefault,
        resultText,
        numericValue,
        unit: toText(entry.unit, 40),
        interpretation,
        comment,
        assayId: toText(entry.assayId, 60),
        referenceUpperLimit: nonNegative(toNumber(entry.referenceUpperLimit)),
        laboratory: toText(entry.laboratory, 160),
        measurements: hasMeasurements ? (measurements as Prisma.InputJsonValue) : undefined,
      });
    });

    if (rows.length) await tx.investigation.createMany({ data: rows });
  }
}

/* -------------------------------------------------------------- creation */

export interface CreatePatientInput {
  document: Record<string, unknown>;
  actor: AuthenticatedActor;
  requestId: string;
  legacyId?: string | null;
}

/** Registers a patient and writes the whole submitted record in one transaction. */
export async function createPatientRecord(input: CreatePatientInput): Promise<PatientRecord> {
  const name = toText(input.document.name, 200);
  if (!name) throw ApiError.invalidRequest("A patient name is required.");

  const patient = await prisma.patient.create({
    data: {
      name,
      createdById: input.actor.clinician.id,
      hospitalPatientId: toText(input.document.patientId, 80),
      mrn: toText(input.document.mrn, 80),
      ageAtRegistration: clamp(toInteger(input.document.age), 0, 130),
      dateOfBirth: toDate(input.document.dateOfBirth),
      sex: SEX_BY_LABEL[String(input.document.gender)] ?? "NOT_RECORDED",
      clinicalStatus: toText(input.document.clinicalStatus, 40) || "Stable",
      registeredOn: toDate(input.document.registeredDate) ?? new Date(),
      legacyId: input.legacyId ?? null,
    },
  });

  await recordAudit(prisma, {
    patientId: patient.id,
    actorId: input.actor.clinician.id,
    action: "patientCreated",
    category: "record",
    entity: "Patient",
    entityId: patient.id,
    requestId: input.requestId,
    detail: input.legacyId
      ? "Registered by import from browser storage."
      : "Registered in CORSC.",
  });

  return writePatientRecord(patient.id, input.document, {
    actor: input.actor,
    requestId: input.requestId,
  });
}

/* ------------------------------------------------------------- archiving */

/**
 * Archives a patient. There is no delete.
 *
 * A clinical record that can be removed cannot be audited, and a record
 * removed in error cannot be recovered. Archiving takes the patient out of the
 * active caseload and leaves everything else intact.
 */
export async function archivePatient(
  patientId: string,
  reason: string,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, status: true },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");
  if (patient.status === "ARCHIVED") throw ApiError.conflict("This patient is already archived.");

  const [updated] = await prisma.$transaction([
    prisma.patient.update({
      where: { id: patientId },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
        archivedById: options.actor.clinician.id,
        archiveReason: reason,
      },
      select: { id: true, status: true, archivedAt: true },
    }),
    prisma.auditEvent.create({
      data: {
        patientId,
        actorId: options.actor.clinician.id,
        action: "patientArchived",
        category: "record",
        entity: "Patient",
        entityId: patientId,
        reason,
        requestId: options.requestId,
        detail: "Record archived. Clinical data is retained.",
      },
    }),
  ]);

  return updated;
}

export async function restorePatient(
  patientId: string,
  reason: string,
  options: { actor: AuthenticatedActor; requestId: string }
) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, status: true },
  });
  if (!patient) throw ApiError.notFound("Patient not found.");
  if (patient.status === "ACTIVE") throw ApiError.conflict("This patient is not archived.");

  const [updated] = await prisma.$transaction([
    prisma.patient.update({
      where: { id: patientId },
      data: { status: "ACTIVE", archivedAt: null, archivedById: null, archiveReason: null },
      select: { id: true, status: true, archivedAt: true },
    }),
    prisma.auditEvent.create({
      data: {
        patientId,
        actorId: options.actor.clinician.id,
        action: "patientRestored",
        category: "record",
        entity: "Patient",
        entityId: patientId,
        reason,
        requestId: options.requestId,
      },
    }),
  ]);

  return updated;
}
