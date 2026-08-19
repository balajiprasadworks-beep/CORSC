/* =========================================================================
   The Action Bar override, through the database.

   An override is a distinct clinical event, not a field on the patient
   document — it goes through its own endpoint, its own mandatory-reason
   validation, and its own audit trail. This proves the whole path: recording
   one changes what the record reads back, without changing what the engine
   itself calculated.
   ========================================================================= */

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { call, muteRequestLog, supabaseStub } from "../helpers/api";
import { CLINICIAN_A, databaseAvailable, db, disconnect, makeClinician, resetDatabase } from "../helpers/database";

vi.mock("@supabase/supabase-js", () => supabaseStub());

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= "test-publishable-key";

const suite = databaseAvailable ? describe : describe.skip;

suite("Action Bar override through the database", () => {
  let patientsRoute: typeof import("@/app/api/patients/route");
  let patientRoute: typeof import("@/app/api/patients/[patientId]/route");
  let overridesRoute: typeof import("@/app/api/patients/[patientId]/overrides/route");

  beforeEach(async () => {
    muteRequestLog();
    await resetDatabase();
    await makeClinician(CLINICIAN_A, "CARDIO_ONCOLOGIST");

    patientsRoute ||= await import("@/app/api/patients/route");
    patientRoute ||= await import("@/app/api/patients/[patientId]/route");
    overridesRoute ||= await import("@/app/api/patients/[patientId]/overrides/route");
  });

  afterAll(disconnect);

  type Doc = Record<string, unknown>;

  async function register(document: Doc) {
    const result = await call<{ patient: Doc; updatedAt: string }>(patientsRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      body: document,
    });
    expect(result.status).toBe(201);
    return result.data!;
  }

  async function read(patientId: string) {
    const result = await call<{ patient: Doc }>(patientRoute.GET, { as: CLINICIAN_A, params: { patientId } });
    expect(result.status).toBe(200);
    return result.data!.patient;
  }

  it("records a fitness override and reads it back attributed to the clinician", async () => {
    const created = await register({ name: "Override Patient", age: 60, therapy: ["anthracycline"], baselineLVEF: 55 });
    const patientId = (created.patient as { id: string }).id;

    const posted = await call(overridesRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: {
        target: "fitness",
        algorithmicValue: "caution",
        clinicianValue: "proceed",
        reason: "Discussed with oncology and cardio-oncology; proceeding with weekly review.",
      },
    });
    expect(posted.status).toBe(201);

    const stored = await read(patientId);
    const overrides = stored.overrides as Array<{ target: string; clinicianValue: string; reason: string; clinician: { id: string } }>;

    expect(overrides).toHaveLength(1);
    expect(overrides[0].target).toBe("fitness");
    expect(overrides[0].clinicianValue).toBe("proceed");
    expect(overrides[0].reason).toContain("Discussed with oncology");
    expect(overrides[0].clinician.id).toBe(CLINICIAN_A);
  });

  it("refuses an override with no reason", async () => {
    const created = await register({ name: "No Reason", age: 60 });
    const patientId = (created.patient as { id: string }).id;

    const posted = await call(overridesRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: { target: "fitness", algorithmicValue: "hold", clinicianValue: "proceed", reason: "too short" },
    });
    expect(posted.status).toBe(400);
  });

  it("refuses an override against a target CORSC does not recognise", async () => {
    const created = await register({ name: "Bad Target", age: 60 });
    const patientId = (created.patient as { id: string }).id;

    const posted = await call(overridesRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: { target: "not-a-real-target", algorithmicValue: "hold", clinicianValue: "proceed", reason: "A reason long enough to pass." },
    });
    expect(posted.status).toBe(400);
  });

  it("writes an audit entry that keeps both the algorithmic and clinician values", async () => {
    const created = await register({ name: "Audited Override", age: 60 });
    const patientId = (created.patient as { id: string }).id;

    await call(overridesRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: { target: "fitness", algorithmicValue: "hold", clinicianValue: "caution", reason: "Reviewed and accepting a lower threshold." },
    });

    const audit = await db().auditEvent.findFirst({ where: { patientId, action: "overrideRecorded" } });
    expect(audit?.previousValue).toBe("hold");
    expect(audit?.newValue).toBe("caution");
    expect(audit?.reason).toContain("Reviewed and accepting");
  });
});
