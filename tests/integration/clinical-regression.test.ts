/* =========================================================================
   Clinical behaviour, end to end.

   The engines' own suites already prove what they compute. What these tests
   prove is that routing a patient through PostgreSQL and back does not change
   the answer — that the normalisation, the assembler and the API are
   transparent to the clinical logic.

   That is the specific risk of this migration. A backend that dropped the
   second therapy class, rounded an ejection fraction, lost a risk factor or
   wrote a toxicity grade back into the baseline would not fail loudly. It
   would keep producing a category, and the category would be wrong.
   ========================================================================= */

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { call, muteRequestLog, supabaseStub } from "../helpers/api";
import {
  CLINICIAN_A,
  databaseAvailable,
  db,
  disconnect,
  makeClinician,
  resetDatabase,
} from "../helpers/database";
import { assessBaselineRisk } from "@/lib/hfa-icos";

vi.mock("@supabase/supabase-js", () => supabaseStub());

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= "test-publishable-key";

const suite = databaseAvailable ? describe : describe.skip;

suite("clinical behaviour through the database", () => {
  let patientsRoute: typeof import("@/app/api/patients/route");
  let patientRoute: typeof import("@/app/api/patients/[patientId]/route");
  let recordRoute: typeof import("@/app/api/patients/[patientId]/record/route");
  let riskAssessRoute: typeof import("@/app/api/patients/[patientId]/risk/assess/route");
  let riskRoute: typeof import("@/app/api/patients/[patientId]/risk/route");
  let ctrCvtAssessRoute: typeof import("@/app/api/patients/[patientId]/ctr-cvt/assess/route");
  let surveillanceRoute: typeof import("@/app/api/patients/[patientId]/surveillance/recalculate/route");
  let fitnessRoute: typeof import("@/app/api/patients/[patientId]/fitness/assess/route");

  beforeEach(async () => {
    muteRequestLog();
    await resetDatabase();
    await makeClinician(CLINICIAN_A, "CARDIO_ONCOLOGIST");

    patientsRoute ||= await import("@/app/api/patients/route");
    patientRoute ||= await import("@/app/api/patients/[patientId]/route");
    recordRoute ||= await import("@/app/api/patients/[patientId]/record/route");
    riskAssessRoute ||= await import("@/app/api/patients/[patientId]/risk/assess/route");
    riskRoute ||= await import("@/app/api/patients/[patientId]/risk/route");
    ctrCvtAssessRoute ||= await import("@/app/api/patients/[patientId]/ctr-cvt/assess/route");
    surveillanceRoute ||= await import("@/app/api/patients/[patientId]/surveillance/recalculate/route");
    fitnessRoute ||= await import("@/app/api/patients/[patientId]/fitness/assess/route");
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
    const result = await call<{ patient: Doc; updatedAt: string }>(patientRoute.GET, {
      as: CLINICIAN_A,
      params: { patientId },
    });
    expect(result.status).toBe(200);
    return result.data!;
  }

  /* ---------------------------------------------------------- round trip */

  it("returns the same risk category the engine gives for the same record", async () => {
    // The migration's central claim, stated as a test: storing a record and
    // reading it back must not change what the engine says about it.
    const document: Doc = {
      name: "Round Trip",
      age: 72,
      gender: "Female",
      therapy: ["anthracycline"],
      baselineLVEF: 48,
      baselineGLS: -16,
      troponinAssay: "hs-cTnT",
      m2: { "age-65-79": true },
      high: { "prior-cardiotoxicity": true },
    };

    const direct = assessBaselineRisk(document);
    const created = await register(document);
    const stored = await read((created.patient as { id: string }).id);

    expect((stored.patient as { risk: { category: string } }).risk.category).toBe(direct.category);
  });

  it("preserves every therapy class of a combination regimen", async () => {
    const created = await register({
      name: "Combination Therapy",
      age: 58,
      gender: "Female",
      // The case where losing one class silently halves the assessment.
      therapy: ["anthracycline", "her2"],
      baselineLVEF: 62,
    });

    const stored = await read((created.patient as { id: string }).id);
    expect((stored.patient as { therapy: string[] }).therapy).toEqual(["anthracycline", "her2"]);

    const assessed = await call<{ result: { results: Array<{ therapyId: string }> } }>(
      riskAssessRoute.POST,
      { as: CLINICIAN_A, method: "POST", params: { patientId: (created.patient as { id: string }).id }, body: {} }
    );
    expect(assessed.status).toBe(201);
    // Both proformas ran, and both are in the stored result.
    expect(assessed.data!.result.results.map((entry) => entry.therapyId).sort()).toEqual([
      "anthracycline",
      "her2",
    ]);
  });

  it("keeps risk factors through a save and reload", async () => {
    const created = await register({
      name: "Risk Factors",
      age: 60,
      gender: "Male",
      therapy: ["anthracycline"],
      m2: { "age-65-79": true, "baseline-lvef-borderline": true },
      m1: { smoking: true, diabetes: true },
    });

    const stored = await read((created.patient as { id: string }).id);
    const patient = stored.patient as { m2: Record<string, boolean>; m1: Record<string, boolean> };
    expect(patient.m2).toEqual({ "age-65-79": true, "baseline-lvef-borderline": true });
    expect(patient.m1).toEqual({ smoking: true, diabetes: true });
  });

  it("withdrawing a risk factor stops it being scored", async () => {
    const created = await register({
      name: "Withdrawn Factor",
      age: 60,
      gender: "Male",
      therapy: ["anthracycline"],
      m2: { "age-65-79": true },
    });
    const patientId = (created.patient as { id: string }).id;

    await call(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: { name: "Withdrawn Factor", therapy: ["anthracycline"], m2: {} },
    });

    const stored = await read(patientId);
    // History is current state, not an append-only log: un-ticking a factor
    // has to mean the patient does not have it.
    expect((stored.patient as { m2: Record<string, boolean> }).m2).toEqual({});
  });

  /* -------------------------------------------------------- the two axes */

  it("does not let current toxicity rewrite the baseline risk", async () => {
    // The mandatory separation, tested where it would actually break: a
    // patient stratified before therapy, who then deteriorates.
    const created = await register({
      name: "Two Axis",
      age: 44,
      gender: "Male",
      therapy: ["anthracycline"],
      baselineLVEF: 60,
      baselineGLS: -21,
      baselineTroponin: 3,
      troponinAssay: "hs-cTnT",
    });
    const patientId = (created.patient as { id: string }).id;

    const baseline = await call<{ result: { category: string } }>(riskAssessRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: {},
    });
    const baselineCategory = baseline.data!.result.category;

    // Now the patient deteriorates on treatment.
    await call(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: {
        name: "Two Axis",
        therapy: ["anthracycline"],
        baselineLVEF: 60,
        baselineGLS: -21,
        baselineTroponin: 3,
        troponinAssay: "hs-cTnT",
        restratification: { troponinRise: true, glsFall: 18.5, currentLVEF: 51 },
        draftEncounter: {
          id: "v_toxicity",
          type: "Cycle 4",
          date: "2026-03-01",
          inv: { troponin: { result: "28", value: 28 }, lvef: { result: "51", value: 51 } },
        },
      },
    });

    const toxicity = await call<{ result: { present: boolean; overall: string } }>(
      ctrCvtAssessRoute.POST,
      { as: CLINICIAN_A, method: "POST", params: { patientId }, body: {} }
    );
    expect(toxicity.status).toBe(201);

    // The stored baseline assessment is untouched...
    const risks = await call<{ assessments: Array<{ category: string; kind: string }> }>(riskRoute.GET, {
      as: CLINICIAN_A,
      params: { patientId },
    });
    expect(risks.data!.assessments[0].category).toBe(baselineCategory);

    // ...and it is a different row from the toxicity assessment.
    const kinds = await db().assessment.findMany({
      where: { patientId },
      select: { kind: true, category: true },
    });
    expect(kinds.some((entry) => entry.kind === "BASELINE_RISK")).toBe(true);
    expect(kinds.some((entry) => entry.kind === "CTR_CVT")).toBe(true);

    const stored = await db().assessment.findFirst({ where: { patientId, kind: "BASELINE_RISK" } });
    expect(stored?.category).toBe(baselineCategory);
  });

  /* ------------------------------------------------------------ storage */

  it("stores an assessment with the engine version that produced it", async () => {
    const created = await register({ name: "Versioned", age: 60, therapy: ["anthracycline"] });
    const patientId = (created.patient as { id: string }).id;

    await call(riskAssessRoute.POST, { as: CLINICIAN_A, method: "POST", params: { patientId }, body: {} });

    const assessment = await db().assessment.findFirst({ where: { patientId, kind: "BASELINE_RISK" } });
    expect(assessment?.engine).toBe("hfa-icos");
    expect(assessment?.engineVersion).toBeTruthy();
    expect(assessment?.rulesVersion).toBeTruthy();
    // Enough to explain the result later, not just the headline category.
    expect(assessment?.result).toBeTruthy();
    expect(assessment?.inputs).toBeTruthy();
  });

  it("stores surveillance recommendations with a reason and a source", async () => {
    const created = await register({
      name: "Surveillance",
      age: 66,
      gender: "Female",
      therapy: ["anthracycline"],
      baselineLVEF: 55,
      cycle: 3,
    });
    const patientId = (created.patient as { id: string }).id;

    const result = await call<{ recommendations: number }>(surveillanceRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: {},
    });
    expect(result.status).toBe(200);

    const stored = await db().surveillanceRecommendation.findMany({ where: { patientId } });
    expect(stored.length).toBeGreaterThan(0);

    // Every recommendation is explainable. "Echo due" with no reason is not a
    // record this schema will hold.
    stored.forEach((recommendation) => {
      expect(recommendation.reason.trim().length).toBeGreaterThan(0);
      expect(recommendation.engineVersion).toBeTruthy();
      expect(recommendation.rulesVersion).toBeTruthy();
    });
    expect(stored.some((recommendation) => recommendation.sourceId)).toBe(true);
  });

  it("supersedes previous surveillance rather than deleting it", async () => {
    const created = await register({ name: "Superseded", age: 60, therapy: ["anthracycline"] });
    const patientId = (created.patient as { id: string }).id;

    await call(surveillanceRoute.POST, { as: CLINICIAN_A, method: "POST", params: { patientId }, body: {} });
    const first = await db().surveillanceRecommendation.count({ where: { patientId } });

    await call(surveillanceRoute.POST, { as: CLINICIAN_A, method: "POST", params: { patientId }, body: {} });
    const total = await db().surveillanceRecommendation.count({ where: { patientId } });
    const superseded = await db().surveillanceRecommendation.count({
      where: { patientId, status: "SUPERSEDED" },
    });

    expect(total).toBeGreaterThan(first);
    expect(superseded).toBe(first);
  });

  it("phrases fitness to proceed as a prompt, not an instruction", async () => {
    const created = await register({
      name: "Fitness",
      age: 70,
      gender: "Male",
      therapy: ["ici"],
      baselineTroponin: 5,
      troponinAssay: "hs-cTnT",
    });
    const patientId = (created.patient as { id: string }).id;

    const result = await call<{ result: { verdict: string; label: string } }>(fitnessRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      params: { patientId },
      body: {},
    });

    expect(result.status).toBe(201);
    expect(["proceed", "caution", "hold"]).toContain(result.data!.result.verdict);

    // The stored audit line has to make clear this is decision support.
    const audit = await db().auditEvent.findFirst({
      where: { patientId, action: "fitnessAssessed" },
    });
    expect(audit?.detail).toMatch(/not a treatment decision/i);
  });

  it("keeps the anthracycline dose ledger through storage", async () => {
    const created = await register({
      name: "Ledger",
      age: 55,
      gender: "Female",
      therapy: ["anthracycline"],
      anthracyclineDoses: [
        { id: "d1", agent: "doxorubicin", dose: 60, unit: "mg/m2", bsa: 1.7, cycle: 1, date: "2026-01-10" },
        { id: "d2", agent: "doxorubicin", dose: 60, unit: "mg/m2", bsa: 1.7, cycle: 2, date: "2026-01-31" },
      ],
    });

    const stored = await read((created.patient as { id: string }).id);
    const doses = (stored.patient as { anthracyclineDoses: Array<{ dose: number; cycle: number }> })
      .anthracyclineDoses;
    expect(doses).toHaveLength(2);
    expect(doses.map((dose) => dose.dose)).toEqual([60, 60]);
    expect(doses.map((dose) => dose.cycle)).toEqual([1, 2]);
  });

  it("keeps a dose it cannot convert, with the reason", async () => {
    const created = await register({
      name: "Unconvertible Dose",
      age: 55,
      therapy: ["anthracycline"],
      anthracyclineDoses: [
        { id: "d1", agent: "doxorubicin", dose: 60, unit: "mg/m2", cycle: 1 },
        // An agent CORSC holds no equivalence factor for. It must be kept and
        // flagged, not silently dropped from the cumulative total.
        { id: "d2", agent: "mitoxantrone-lookalike", dose: 12, unit: "mg/m2", cycle: 2 },
      ],
    });

    const doses = await db().anthracyclineDose.findMany({
      where: { patientId: (created.patient as { id: string }).id },
      orderBy: { cycleNumber: "asc" },
    });
    expect(doses).toHaveLength(2);
    expect(doses[1].conversionFailureReason).toBeTruthy();
  });

  it("stops a medication rather than deleting it", async () => {
    const created = await register({
      name: "Medication History",
      age: 60,
      therapy: ["anthracycline"],
      medications: [{ id: "m1", name: "Ramipril", dose: "5 mg", klass: "acei" }],
    });
    const patientId = (created.patient as { id: string }).id;

    await call(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: { name: "Medication History", therapy: ["anthracycline"], medications: [] },
    });

    const rows = await db().patientMedication.findMany({ where: { patientId } });
    // The row survives with a stop date, so an earlier encounter still reads
    // back with the list the patient was actually on.
    expect(rows).toHaveLength(1);
    expect(rows[0].active).toBe(false);
    expect(rows[0].stoppedOn).toBeTruthy();
  });

  it("records the troponin assay alongside the value", async () => {
    const created = await register({
      name: "Assay Provenance",
      age: 60,
      therapy: ["ici"],
      troponinAssay: "hs-cTnI-abbott",
      draftEncounter: {
        id: "v_1",
        type: "Cycle 1",
        date: "2026-02-01",
        inv: {
          troponin: { result: "34", value: 34, assayId: "hs-cTnI-abbott", referenceUpperLimit: 16 },
        },
      },
    });

    const investigation = await db().investigation.findFirst({
      where: { patientId: (created.patient as { id: string }).id, investigationId: "troponin" },
    });
    // Values from different assays are not comparable, so the assay and the
    // limit applied travel with the result.
    expect(investigation?.assayId).toBe("hs-cTnI-abbott");
    expect(Number(investigation?.referenceUpperLimit)).toBe(16);
  });
});
