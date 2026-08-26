/* =========================================================================
   The schema's own guarantees.

   These assertions are about behaviour the database enforces, not the
   application: CHECK constraints, the append-only triggers, cascade rules and
   row-level security. Testing them through a mock would prove only that the
   mock agrees with itself, which is why these need a real PostgreSQL.

   The guarantees below are the ones a clinical record depends on being true
   even if the application has a bug.
   ========================================================================= */

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  CLINICIAN_A,
  databaseAvailable,
  db,
  disconnect,
  makeClinician,
  resetDatabase,
} from "../helpers/database";

const suite = databaseAvailable ? describe : describe.skip;

suite("database constraints", () => {
  beforeEach(async () => {
    await resetDatabase();
    await makeClinician(CLINICIAN_A);
  });

  afterAll(disconnect);

  async function patient(name = "Constraint Patient") {
    return db().patient.create({ data: { name, createdById: CLINICIAN_A } });
  }

  it("refuses an ejection fraction outside 0 to 100", async () => {
    const record = await patient();
    await expect(
      db().patientBaseline.create({ data: { patientId: record.id, lvef: 700 } })
    ).rejects.toThrow();
  });

  it("refuses a negative troponin", async () => {
    const record = await patient();
    await expect(
      db().patientBaseline.create({ data: { patientId: record.id, troponin: -5 } })
    ).rejects.toThrow();
  });

  it("accepts GLS with either sign but bounds the magnitude", async () => {
    const record = await patient();
    await expect(
      db().patientBaseline.create({ data: { patientId: record.id, gls: -20.5 } })
    ).resolves.toBeTruthy();
    await expect(
      db().patientBaseline.update({ where: { patientId: record.id }, data: { gls: -300 } })
    ).rejects.toThrow();
  });

  it("refuses an impossible age", async () => {
    await expect(
      db().patient.create({
        data: { name: "Too Old", createdById: CLINICIAN_A, ageAtRegistration: 500 },
      })
    ).rejects.toThrow();
  });

  it("refuses a patient with no name", async () => {
    await expect(
      db().patient.create({ data: { name: "   ", createdById: CLINICIAN_A } })
    ).rejects.toThrow();
  });

  it("refuses an archived-at without archived status, and the reverse", async () => {
    const record = await patient();
    await expect(
      db().patient.update({ where: { id: record.id }, data: { archivedAt: new Date() } })
    ).rejects.toThrow();
    await expect(
      db().patient.update({ where: { id: record.id }, data: { status: "ARCHIVED" } })
    ).rejects.toThrow();
    await expect(
      db().patient.update({
        where: { id: record.id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
      })
    ).resolves.toBeTruthy();
  });

  it("refuses a negative anthracycline dose", async () => {
    const record = await patient();
    await expect(
      db().anthracyclineDose.create({
        data: { patientId: record.id, agentId: "doxorubicin", dose: -10 },
      })
    ).rejects.toThrow();
  });

  it("refuses a surveillance recommendation with no reason", async () => {
    // An unexplained recommendation is the thing the surveillance rewrite
    // exists to remove, so the database refuses to hold one.
    const record = await patient();
    await expect(
      db().surveillanceRecommendation.create({
        data: {
          patientId: record.id,
          taskId: "echo",
          label: "Echocardiography",
          priority: "surveillance",
          reason: "   ",
          engine: "surveillance",
          engineVersion: "2.0.0",
          rulesVersion: "2026.08.1",
        },
      })
    ).rejects.toThrow();
  });

  it("refuses an override with no reason", async () => {
    const record = await patient();
    await expect(
      db().clinicalOverride.create({
        data: {
          patientId: record.id,
          target: "risk",
          clinicianValue: "High",
          reason: "",
          clinicianId: CLINICIAN_A,
        },
      })
    ).rejects.toThrow();
  });

  it("refuses a medicine that is both active and stopped", async () => {
    const record = await patient();
    await expect(
      db().patientMedication.create({
        data: {
          patientId: record.id,
          displayName: "Ramipril",
          active: true,
          stoppedOn: new Date(),
        },
      })
    ).rejects.toThrow();
  });

  it("refuses an orphaned visit", async () => {
    await expect(
      db().visit.create({
        data: {
          patientId: "00000000-0000-4000-8000-00000000dead",
          visitType: "baseline",
          occurredOn: new Date(),
        },
      })
    ).rejects.toThrow();
  });

  it("refuses two cycles with the same number on one plan", async () => {
    const record = await patient();
    const plan = await db().therapyPlan.create({ data: { patientId: record.id } });
    await db().therapyCycle.create({ data: { therapyPlanId: plan.id, cycleNumber: 1 } });
    await expect(
      db().therapyCycle.create({ data: { therapyPlanId: plan.id, cycleNumber: 1 } })
    ).rejects.toThrow();
  });
});

suite("audit immutability", () => {
  beforeEach(async () => {
    await resetDatabase();
    await makeClinician(CLINICIAN_A);
  });

  afterAll(disconnect);

  it("refuses to update an audit entry", async () => {
    // Enforced by trigger rather than by permissions, so the guarantee holds
    // against the application's own privileged connection.
    const event = await db().auditEvent.create({
      data: { actorId: CLINICIAN_A, action: "patientCreated", category: "record" },
    });
    await expect(
      db().auditEvent.update({ where: { id: event.id }, data: { action: "somethingElse" } })
    ).rejects.toThrow(/append-only/);
  });

  it("refuses to delete an audit entry", async () => {
    const event = await db().auditEvent.create({
      data: { actorId: CLINICIAN_A, action: "patientCreated", category: "record" },
    });
    await expect(db().auditEvent.delete({ where: { id: event.id } })).rejects.toThrow(/append-only/);
  });

  it("refuses to update a stored assessment", async () => {
    // A stored assessment records what the software said at a moment in time.
    // Changing one rewrites history; a new assessment is a new row.
    const record = await db().patient.create({
      data: { name: "Assessment Patient", createdById: CLINICIAN_A },
    });
    const assessment = await db().assessment.create({
      data: {
        patientId: record.id,
        kind: "BASELINE_RISK",
        engine: "hfa-icos",
        engineVersion: "2.0.0",
        rulesVersion: "2026.08.1",
        category: "Low",
        result: {},
        inputs: {},
      },
    });
    await expect(
      db().assessment.update({ where: { id: assessment.id }, data: { category: "High" } })
    ).rejects.toThrow(/append-only/);
  });

  it("blocks hard-deleting a patient that has audit history", async () => {
    // A consequence of the append-only trigger, and an intended one: patients
    // are archived, never removed.
    const record = await db().patient.create({
      data: { name: "Audited Patient", createdById: CLINICIAN_A },
    });
    await db().auditEvent.create({
      data: { patientId: record.id, actorId: CLINICIAN_A, action: "patientCreated", category: "record" },
    });
    await expect(db().patient.delete({ where: { id: record.id } })).rejects.toThrow();
  });
});

suite("row-level security", () => {
  afterAll(disconnect);

  it("is enabled and forced on every table holding patient data", async () => {
    // RLS protects the direct browser-to-PostgREST path. Verified rather than
    // assumed: a policy file that was never applied looks identical from the
    // application's side, which connects with a role that bypasses RLS.
    const rows = await db().$queryRawUnsafe<Array<{ relname: string; enabled: boolean; forced: boolean }>>(
      `SELECT c.relname, c.relrowsecurity AS enabled, c.relforcerowsecurity AS forced
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relkind = 'r'`
    );

    const patientTables = [
      "patients",
      "patient_baselines",
      "patient_toxicity_status",
      "patient_history_entries",
      "risk_factor_assertions",
      "cancer_diagnoses",
      "therapy_plans",
      "therapy_class_assignments",
      "therapy_agents",
      "therapy_phases",
      "therapy_cycles",
      "anthracycline_doses",
      "patient_medications",
      "visits",
      "visit_vitals",
      "visit_symptoms",
      "investigations",
      "assessments",
      "surveillance_recommendations",
      "follow_ups",
      "clinical_overrides",
      "audit_events",
      "clinicians",
      "care_team_members",
      "legacy_imports",
    ];

    const byName = new Map(rows.map((entry) => [entry.relname, entry]));
    const unprotected = patientTables.filter((table) => {
      const entry = byName.get(table);
      return !entry || !entry.enabled || !entry.forced;
    });

    expect(unprotected).toEqual([]);
  });

  it("gives no table a DELETE policy", async () => {
    // Clinical records are archived, never removed. A DELETE policy anywhere
    // would be a way around that.
    const policies = await db().$queryRawUnsafe<Array<{ tablename: string; cmd: string }>>(
      `SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public'`
    );
    expect(policies.filter((policy) => policy.cmd === "DELETE")).toEqual([]);
  });

  it("gives the audit table no UPDATE policy", async () => {
    const policies = await db().$queryRawUnsafe<Array<{ tablename: string; cmd: string }>>(
      `SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_events'`
    );
    expect(policies.filter((policy) => policy.cmd === "UPDATE")).toEqual([]);
  });
});
