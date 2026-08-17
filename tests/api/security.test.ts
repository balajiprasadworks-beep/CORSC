/* =========================================================================
   API security.

   Every assertion here is a way the API could leak or corrupt a clinical
   record if the authorisation were wrong. They run against the real route
   handlers and the real database; only the Supabase token check is stubbed, so
   the clinician lookup, the role check and the care-team check are all the
   production code path.

   This matters more here than in most applications because of a deliberate
   architectural split: the API connects to PostgreSQL with a role that
   BYPASSES row-level security, so that it can read a clinician profile and
   write an audit entry for a caller who does not own the patient. RLS
   therefore protects the direct browser-to-PostgREST path, and these tests
   protect the API path. If they are wrong, nothing else catches it.
   ========================================================================= */

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { call, muteRequestLog, supabaseStub } from "../helpers/api";
import {
  ADMIN,
  CLINICIAN_A,
  CLINICIAN_B,
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

suite("API security", () => {
  let patientsRoute: typeof import("@/app/api/patients/route");
  let patientRoute: typeof import("@/app/api/patients/[patientId]/route");
  let recordRoute: typeof import("@/app/api/patients/[patientId]/record/route");
  let archiveRoute: typeof import("@/app/api/patients/[patientId]/archive/route");
  let auditRoute: typeof import("@/app/api/patients/[patientId]/audit/route");
  let sessionRoute: typeof import("@/app/api/session/route");
  let riskAssessRoute: typeof import("@/app/api/patients/[patientId]/risk/assess/route");

  beforeEach(async () => {
    muteRequestLog();
    await resetDatabase();
    await makeClinician(CLINICIAN_A, "CARDIO_ONCOLOGIST");
    await makeClinician(CLINICIAN_B, "CLINICIAN");
    await makeClinician(READ_ONLY, "READ_ONLY");
    await makeClinician(ADMIN, "ADMIN");

    patientsRoute ||= await import("@/app/api/patients/route");
    patientRoute ||= await import("@/app/api/patients/[patientId]/route");
    recordRoute ||= await import("@/app/api/patients/[patientId]/record/route");
    archiveRoute ||= await import("@/app/api/patients/[patientId]/archive/route");
    auditRoute ||= await import("@/app/api/patients/[patientId]/audit/route");
    sessionRoute ||= await import("@/app/api/session/route");
    riskAssessRoute ||= await import("@/app/api/patients/[patientId]/risk/assess/route");
  });

  afterAll(disconnect);

  async function createPatient(as: string, name = "Security Patient") {
    const result = await call<{ patient: { id: string } }>(patientsRoute.POST, {
      as,
      method: "POST",
      body: { name, age: 60, gender: "Female", therapy: ["anthracycline"] },
    });
    expect(result.status).toBe(201);
    return result.data!.patient.id;
  }

  /* ------------------------------------------------------ authentication */

  it("rejects an unauthenticated request", async () => {
    const result = await call(patientsRoute.GET);
    expect(result.status).toBe(401);
    expect(result.error?.code).toBe("unauthenticated");
  });

  it("rejects an invalid token", async () => {
    const result = await call(patientsRoute.GET, { as: "invalid" });
    expect(result.status).toBe(401);
  });

  it("rejects an unauthenticated write", async () => {
    const result = await call(patientsRoute.POST, { method: "POST", body: { name: "Nobody" } });
    expect(result.status).toBe(401);
  });

  /* -------------------------------------------------------- authorisation */

  it("shows a clinician only their own caseload", async () => {
    await createPatient(CLINICIAN_A, "Belongs to A");
    await createPatient(CLINICIAN_B, "Belongs to B");

    const asA = await call<{ patients: Array<{ name: string }> }>(patientsRoute.GET, { as: CLINICIAN_A });
    expect(asA.data!.patients.map((patient) => patient.name)).toEqual(["Belongs to A"]);

    const asB = await call<{ patients: Array<{ name: string }> }>(patientsRoute.GET, { as: CLINICIAN_B });
    expect(asB.data!.patients.map((patient) => patient.name)).toEqual(["Belongs to B"]);
  });

  it("does not confirm that another clinician's patient exists", async () => {
    const patientId = await createPatient(CLINICIAN_A);

    // 404 rather than 403, deliberately: a 403 would confirm the record is
    // there, which is itself a disclosure about someone else's caseload.
    const result = await call(patientRoute.GET, { as: CLINICIAN_B, params: { patientId } });
    expect(result.status).toBe(404);
  });

  it("refuses a write to another clinician's patient", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    const result = await call(recordRoute.PUT, {
      as: CLINICIAN_B,
      method: "PUT",
      params: { patientId },
      body: { name: "Renamed by someone else" },
    });
    expect(result.status).toBe(404);

    const unchanged = await db().patient.findUnique({ where: { id: patientId } });
    expect(unchanged?.name).toBe("Security Patient");
  });

  it("grants access through explicit care-team membership, not by default", async () => {
    const patientId = await createPatient(CLINICIAN_A);

    const before = await call(patientRoute.GET, { as: CLINICIAN_B, params: { patientId } });
    expect(before.status).toBe(404);

    await db().careTeamMember.create({
      data: { patientId, clinicianId: CLINICIAN_B, grantedById: CLINICIAN_A },
    });

    const after = await call(patientRoute.GET, { as: CLINICIAN_B, params: { patientId } });
    expect(after.status).toBe(200);
  });

  it("revoking care-team membership removes access", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    await db().careTeamMember.create({
      data: { patientId, clinicianId: CLINICIAN_B, revokedAt: new Date() },
    });

    const result = await call(patientRoute.GET, { as: CLINICIAN_B, params: { patientId } });
    expect(result.status).toBe(404);
  });

  it("lets an admin read any patient", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    const result = await call(patientRoute.GET, { as: ADMIN, params: { patientId } });
    expect(result.status).toBe(200);
  });

  /* ------------------------------------------------------------- read-only */

  it("lets a read-only role read but not create", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    await db().careTeamMember.create({ data: { patientId, clinicianId: READ_ONLY } });

    const read = await call(patientRoute.GET, { as: READ_ONLY, params: { patientId } });
    expect(read.status).toBe(200);

    const create = await call(patientsRoute.POST, {
      as: READ_ONLY,
      method: "POST",
      body: { name: "Should not be created" },
    });
    expect(create.status).toBe(403);
  });

  it("refuses a read-only role any write to a patient it can read", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    await db().careTeamMember.create({ data: { patientId, clinicianId: READ_ONLY } });

    const write = await call(recordRoute.PUT, {
      as: READ_ONLY,
      method: "PUT",
      params: { patientId },
      body: { name: "Renamed" },
    });
    expect(write.status).toBe(403);

    const assess = await call(riskAssessRoute.POST, {
      as: READ_ONLY,
      method: "POST",
      params: { patientId },
      body: {},
    });
    expect(assess.status).toBe(403);
  });

  /* ------------------------------------------------ privilege escalation */

  it("ignores a role supplied by the client", async () => {
    // The single most obvious attack on a role-based API. The role comes from
    // the database, by user id, and a body field named "role" is just data.
    const result = await call<{ patient: { id: string } }>(patientsRoute.POST, {
      as: CLINICIAN_B,
      method: "POST",
      body: { name: "Escalation Attempt", role: "ADMIN", clinicianRole: "ADMIN" },
    });
    expect(result.status).toBe(201);

    const clinician = await db().clinician.findUnique({ where: { id: CLINICIAN_B } });
    expect(clinician?.role).toBe("CLINICIAN");

    const session = await call<{ clinician: { role: string } }>(sessionRoute.GET, { as: CLINICIAN_B });
    expect(session.data!.clinician.role).toBe("CLINICIAN");
  });

  it("does not let a client claim ownership of another clinician's record", async () => {
    const result = await call<{ patient: { id: string } }>(patientsRoute.POST, {
      as: CLINICIAN_B,
      method: "POST",
      body: { name: "Ownership Attempt", createdById: CLINICIAN_A, createdBy: CLINICIAN_A },
    });
    expect(result.status).toBe(201);

    const stored = await db().patient.findUnique({ where: { id: result.data!.patient.id } });
    expect(stored?.createdById).toBe(CLINICIAN_B);
  });

  it("refuses a deactivated account", async () => {
    await db().clinician.update({ where: { id: CLINICIAN_B }, data: { active: false } });
    const result = await call(patientsRoute.GET, { as: CLINICIAN_B });
    expect(result.status).toBe(403);
  });

  /* ------------------------------------------------------------- audit */

  it("restricts the audit trail by role", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    await db().careTeamMember.create({ data: { patientId, clinicianId: CLINICIAN_B } });

    // A clinician who can look after the patient still does not automatically
    // get the governance trail — that answers a different question.
    const asClinician = await call(auditRoute.GET, { as: CLINICIAN_B, params: { patientId } });
    expect(asClinician.status).toBe(403);

    const asCardioOnc = await call(auditRoute.GET, { as: CLINICIAN_A, params: { patientId } });
    expect(asCardioOnc.status).toBe(200);
  });

  it("records an audit entry for every clinical write", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    const events = await db().auditEvent.findMany({ where: { patientId } });
    expect(events.length).toBeGreaterThan(0);
    expect(events.some((event) => event.action === "patientCreated")).toBe(true);
  });

  /* -------------------------------------------------------- malformed input */

  it("rejects a malformed record identifier", async () => {
    const result = await call(patientRoute.GET, { as: CLINICIAN_A, params: { patientId: "not-a-uuid" } });
    expect([400, 404]).toContain(result.status);
  });

  it("rejects a body that is not JSON", async () => {
    const request = new Request("https://corsc.test/api/patients", {
      method: "POST",
      headers: { Authorization: `Bearer ${CLINICIAN_A}`, "Content-Type": "application/json" },
      body: "{not json",
    });
    const response = await patientsRoute.POST(request as never);
    expect(response.status).toBe(400);
  });

  it("rejects a clinically impossible value with field-level detail", async () => {
    const result = await call(patientsRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      body: { name: "Impossible", baselineLVEF: 700 },
    });
    expect(result.status).toBe(400);
    expect(JSON.stringify(result.error?.details)).toContain("baselineLVEF");
  });

  it("does not leak database internals in an error", async () => {
    const result = await call(patientRoute.GET, {
      as: CLINICIAN_A,
      params: { patientId: "00000000-0000-4000-8000-00000000dead" },
    });
    const body = JSON.stringify(result.error);
    expect(body).not.toMatch(/prisma/i);
    expect(body).not.toMatch(/postgres/i);
    expect(body).not.toMatch(/SELECT|INSERT|relation/i);
  });

  /* ---------------------------------------------------------- archiving */

  it("archives rather than deletes, and keeps the record readable", async () => {
    const patientId = await createPatient(CLINICIAN_A);

    const archived = await call(archiveRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: { reason: "Transferred to another service." },
    });
    expect(archived.status).toBe(200);

    // Out of the active caseload...
    const list = await call<{ patients: unknown[] }>(patientsRoute.GET, { as: CLINICIAN_A });
    expect(list.data!.patients).toHaveLength(0);

    // ...but still there, and still readable.
    const stored = await db().patient.findUnique({ where: { id: patientId } });
    expect(stored?.status).toBe("ARCHIVED");
    expect(stored?.archiveReason).toBe("Transferred to another service.");

    const read = await call(patientRoute.GET, { as: CLINICIAN_A, params: { patientId } });
    expect(read.status).toBe(200);
  });

  it("refuses clinical writes to an archived patient", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    await call(archiveRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: { reason: "Archived for this test." },
    });

    const write = await call(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: { name: "Changed after archiving" },
    });
    expect(write.status).toBe(409);
  });

  it("requires a reason to archive", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    const result = await call(archiveRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: {},
    });
    expect(result.status).toBe(400);
  });

  /* ------------------------------------------------------- concurrency */

  it("refuses a save against a record that has since changed", async () => {
    const patientId = await createPatient(CLINICIAN_A);
    const read = await call<{ updatedAt: string }>(patientRoute.GET, {
      as: CLINICIAN_A,
      params: { patientId },
    });
    const staleToken = read.data!.updatedAt;

    // A colleague saves first.
    await call(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: { name: "Security Patient", clinicalStatus: "Worsening" },
    });

    // The original session then saves with the token it read earlier.
    const conflict = await call(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: { name: "Security Patient", clinicalStatus: "Stable", expectedUpdatedAt: staleToken },
    });

    expect(conflict.status).toBe(409);

    // The colleague's entry survives.
    const stored = await db().patient.findUnique({ where: { id: patientId } });
    expect(stored?.clinicalStatus).toBe("Worsening");
  });
});
