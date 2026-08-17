/* =========================================================================
   Migration from browser storage.

   The rule this suite exists to enforce is that nothing is lost and nothing is
   guessed. Every record offered must be accounted for, a second run must not
   duplicate anything, and a field that cannot be confidently mapped must be
   reported rather than invented.

   The records here are shaped like the ones CORSC actually wrote to local
   storage, including the older shapes — a single therapy string before
   combination therapy was supported, `uhid` before it became `patientId` —
   because those are the records a real service will be migrating.
   ========================================================================= */

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { call, muteRequestLog, supabaseStub } from "../helpers/api";
import {
  CLINICIAN_A,
  READ_ONLY,
  databaseAvailable,
  db,
  disconnect,
  makeClinician,
  resetDatabase,
} from "../helpers/database";

vi.mock("@supabase/supabase-js", () => supabaseStub());

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= "test-publishable-key";

const suite = databaseAvailable ? describe : describe.skip;

interface Report {
  committed: boolean;
  found: number;
  imported: number;
  skippedDuplicate: number;
  needsReview: number;
  failed: number;
  records: Array<{
    legacyId: string;
    name: string;
    outcome: string;
    patientId: string | null;
    visits: number;
    reason: string | null;
    unmappedFields: string[];
  }>;
}

/** A record in the shape the browser store actually held. */
function legacyRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "p_kx91a_b3f2",
    name: "Legacy Patient",
    age: "61",
    gender: "Female",
    diagnosis: "Breast",
    stage: "Stage IIA",
    regimen: "AC-T",
    therapy: ["anthracycline"],
    plannedCycles: "6",
    cycleFrequency: "Every 21 days",
    cycle: 2,
    baselineLVEF: "60",
    baselineGLS: "-19.5",
    baselineTroponin: "5",
    troponinAssay: "hs-cTnT",
    clinicalStatus: "Stable",
    registeredDate: "2026-01-05",
    medications: [{ id: "m_1", name: "Ramipril", dose: "5 mg once daily", klass: "acei" }],
    visits: [
      {
        id: "v_kx91a_1",
        type: "Baseline",
        date: "2026-01-06",
        saved: true,
        vitals: { sbp: "128", dbp: "78", pulse: "72", weight: "68" },
        symptoms: [],
        inv: { lvef: { result: "60", interp: "Normal", date: "2026-01-06" } },
        notes: "Baseline encounter.",
      },
    ],
    ...overrides,
  };
}

suite("migration from browser storage", () => {
  let migrationRoute: typeof import("@/app/api/migration/legacy/route");
  let patientRoute: typeof import("@/app/api/patients/[patientId]/route");

  beforeEach(async () => {
    muteRequestLog();
    await resetDatabase();
    await makeClinician(CLINICIAN_A, "CARDIO_ONCOLOGIST");
    await makeClinician(READ_ONLY, "READ_ONLY");

    migrationRoute ||= await import("@/app/api/migration/legacy/route");
    patientRoute ||= await import("@/app/api/patients/[patientId]/route");
  });

  afterAll(disconnect);

  async function migrate(records: unknown[], commit = true) {
    const result = await call<Report>(migrationRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      body: { records, commit },
    });
    expect(result.status).toBe(200);
    return result.data!;
  }

  it("reports without writing when asked to check first", async () => {
    const report = await migrate([legacyRecord()], false);

    expect(report.committed).toBe(false);
    expect(report.found).toBe(1);
    expect(report.imported).toBe(1);

    // A dry run is a dry run.
    expect(await db().patient.count()).toBe(0);
    expect(await db().legacyImport.count()).toBe(0);
  });

  it("imports a record into normalised tables", async () => {
    const report = await migrate([legacyRecord()]);
    expect(report.imported).toBe(1);

    const patientId = report.records[0].patientId!;
    expect(patientId).toBeTruthy();

    const patient = await db().patient.findUnique({
      where: { id: patientId },
      include: { baseline: true, diagnoses: true, therapyPlans: { include: { classes: true } }, medications: true, visits: true },
    });

    expect(patient?.name).toBe("Legacy Patient");
    expect(patient?.ageAtRegistration).toBe(61);
    expect(patient?.sex).toBe("FEMALE");
    // Numeric strings from the browser become real numbers, not text.
    expect(Number(patient?.baseline?.lvef)).toBe(60);
    expect(Number(patient?.baseline?.gls)).toBe(-19.5);
    expect(patient?.diagnoses[0].primarySite).toBe("Breast");
    expect(patient?.therapyPlans[0].classes.map((entry) => entry.therapyClass)).toEqual([
      "anthracycline",
    ]);
    expect(patient?.medications).toHaveLength(1);
    expect(patient?.visits).toHaveLength(1);
  });

  it("keeps the legacy identifier so a second run is not a duplicate", async () => {
    const record = legacyRecord();
    const first = await migrate([record]);
    expect(first.imported).toBe(1);

    const second = await migrate([record]);
    expect(second.imported).toBe(0);
    expect(second.skippedDuplicate).toBe(1);

    expect(await db().patient.count()).toBe(1);
  });

  it("brings an older record shape up to date", async () => {
    // `uhid` predates `patientId`, and `therapy` was a single string before
    // combination therapy was supported.
    const report = await migrate([
      legacyRecord({ id: "p_old", uhid: "OLD-123", patientId: undefined, therapy: "anthracycline" }),
    ]);

    const patient = await db().patient.findUnique({
      where: { id: report.records[0].patientId! },
      include: { therapyPlans: { include: { classes: true } } },
    });

    expect(patient?.hospitalPatientId).toBe("OLD-123");
    expect(patient?.therapyPlans[0].classes.map((entry) => entry.therapyClass)).toEqual([
      "anthracycline",
    ]);
  });

  it("flags a record for review rather than guessing at a field it cannot map", async () => {
    const report = await migrate([
      legacyRecord({ id: "p_unmapped", therapy: ["anthracycline", "some-old-regimen-string"] }),
    ]);

    expect(report.needsReview).toBe(1);
    expect(report.records[0].unmappedFields.join(" ")).toContain("therapy");
    // Imported anyway: a patient held in the database with a note is better
    // than one left in local storage.
    expect(report.records[0].patientId).toBeTruthy();

    const stored = await db().legacyImport.findFirst({
      where: { legacyId: "p_unmapped" },
    });
    expect(stored?.outcome).toBe("NEEDS_REVIEW");
    expect(stored?.unmappedFields.length).toBeGreaterThan(0);
  });

  it("accounts for a record it cannot read at all", async () => {
    const report = await migrate([
      { id: "p_noname" },
      { name: "No identifier" },
    ]);

    expect(report.found).toBe(2);
    expect(report.failed).toBe(2);
    expect(report.records.every((record) => record.reason)).toBe(true);
    expect(await db().patient.count()).toBe(0);
  });

  it("imports the good records in a batch that also contains bad ones", async () => {
    const report = await migrate([
      legacyRecord({ id: "p_good_1", name: "Good One" }),
      { id: "p_bad" },
      legacyRecord({ id: "p_good_2", name: "Good Two" }),
    ]);

    // One failure does not abandon the batch.
    expect(report.found).toBe(3);
    expect(report.imported).toBe(2);
    expect(report.failed).toBe(1);
    expect(await db().patient.count()).toBe(2);
  });

  it("does not put patient data into the import ledger", async () => {
    await migrate([legacyRecord({ id: "p_privacy", name: "Very Identifiable Name" })]);

    const entry = await db().legacyImport.findFirst({ where: { legacyId: "p_privacy" } });
    const serialised = JSON.stringify(entry);
    // The ledger is a governance record, not a second copy of the patient.
    expect(serialised).not.toContain("Very Identifiable Name");
  });

  it("writes an audit entry for each imported record", async () => {
    const report = await migrate([legacyRecord()]);
    const events = await db().auditEvent.findMany({
      where: { patientId: report.records[0].patientId!, action: "recordImported" },
    });
    expect(events).toHaveLength(1);
    expect(events[0].category).toBe("migration");
  });

  it("keeps the migrated record readable through the API", async () => {
    const report = await migrate([legacyRecord()]);
    const patientId = report.records[0].patientId!;

    const read = await call<{ patient: { name: string; therapy: string[]; visits: unknown[] } }>(
      patientRoute.GET,
      { as: CLINICIAN_A, params: { patientId } }
    );

    expect(read.status).toBe(200);
    expect(read.data!.patient.name).toBe("Legacy Patient");
    expect(read.data!.patient.therapy).toEqual(["anthracycline"]);
    expect(read.data!.patient.visits).toHaveLength(1);
  });

  it("refuses an import from a read-only role", async () => {
    const result = await call(migrationRoute.POST, {
      as: READ_ONLY,
      method: "POST",
      body: { records: [legacyRecord()], commit: true },
    });
    expect(result.status).toBe(403);
    expect(await db().patient.count()).toBe(0);
  });

  it("scopes the import ledger to the clinician who ran it", async () => {
    await migrate([legacyRecord()]);
    const history = await call<{ imports: unknown[] }>(migrationRoute.GET, { as: CLINICIAN_A });
    expect(history.data!.imports).toHaveLength(1);

    const other = await call<{ imports: unknown[] }>(migrationRoute.GET, { as: READ_ONLY });
    expect(other.data!.imports).toHaveLength(0);
  });
});
