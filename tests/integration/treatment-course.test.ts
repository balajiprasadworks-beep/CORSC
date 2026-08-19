/* =========================================================================
   The treatment course, through the database.

   The engines' own suites prove what a course derives. What these tests prove
   is that storing one and reading it back does not change it — and, just as
   importantly, that a free-text regimen survives the round trip WITHOUT
   acquiring phases, agents or therapy classes on the way.

   That second property is the one worth testing at this layer. A parser
   accidentally introduced in the write path, the read path or a migration
   would not fail loudly. It would produce a plausible course, and the
   surveillance plan built on it would be wrong in a way nobody could see.
   ========================================================================= */

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { call, muteRequestLog, supabaseStub } from "../helpers/api";
import { CLINICIAN_A, databaseAvailable, disconnect, makeClinician, resetDatabase } from "../helpers/database";
import { courseFromPreset, derivedTherapyClasses } from "@/lib/treatment-course";

vi.mock("@supabase/supabase-js", () => supabaseStub());

process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= "test-publishable-key";

const suite = databaseAvailable ? describe : describe.skip;

suite("treatment course through the database", () => {
  let patientsRoute: typeof import("@/app/api/patients/route");
  let patientRoute: typeof import("@/app/api/patients/[patientId]/route");
  let recordRoute: typeof import("@/app/api/patients/[patientId]/record/route");

  beforeEach(async () => {
    muteRequestLog();
    await resetDatabase();
    await makeClinician(CLINICIAN_A, "CARDIO_ONCOLOGIST");

    patientsRoute ||= await import("@/app/api/patients/route");
    patientRoute ||= await import("@/app/api/patients/[patientId]/route");
    recordRoute ||= await import("@/app/api/patients/[patientId]/record/route");
  });

  afterAll(disconnect);

  type Doc = Record<string, unknown>;
  type Course = {
    entryMethod: string;
    regimenId: string | null;
    regimenFamily: string | null;
    freeTextDescription: string;
    phases: Array<{
      id: string;
      name: string;
      agents: Array<{ genericName: string; therapyClass: string | null; corscTherapyClass: string | null }>;
      plannedCycles: number | null;
      maintenance: boolean;
    }>;
    activePhaseId: string | null;
  };

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
    const result = await call<{ patient: Doc & { treatmentCourse: Course | null } }>(patientRoute.GET, {
      as: CLINICIAN_A,
      params: { patientId },
    });
    expect(result.status).toBe(200);
    return result.data!.patient;
  }

  /* ------------------------------------------------------------- presets */

  it("stores and returns every phase of a preset course in order", async () => {
    const course = courseFromPreset("breast_ac_th");
    const created = await register({
      name: "Preset Course",
      age: 54,
      gender: "Female",
      regimen: "AC-TH",
      treatmentCourse: course,
      therapy: ["anthracycline", "her2"],
    });

    const stored = await read((created.patient as { id: string }).id);

    expect(stored.treatmentCourse?.entryMethod).toBe("preset");
    expect(stored.treatmentCourse?.regimenId).toBe("breast_ac_th");
    expect(stored.treatmentCourse?.phases.map((phase) => phase.name)).toEqual([
      "AC",
      "TH",
      "Trastuzumab maintenance",
    ]);
  });

  it("preserves both agents of a combination phase", async () => {
    const created = await register({
      name: "Combination Phase",
      age: 54,
      regimen: "AC-TH",
      treatmentCourse: courseFromPreset("breast_ac_th"),
      therapy: ["anthracycline", "her2"],
    });

    const stored = await read((created.patient as { id: string }).id);
    const ac = stored.treatmentCourse!.phases[0];

    expect(ac.agents.map((agent) => agent.genericName)).toEqual(["doxorubicin", "cyclophosphamide"]);
  });

  it("derives the same therapy classes after the round trip", async () => {
    const course = courseFromPreset("breast_ac_th");
    const before = derivedTherapyClasses(course);

    const created = await register({
      name: "Derivation Stable",
      age: 54,
      regimen: "AC-TH",
      treatmentCourse: course,
      therapy: before,
    });
    const stored = await read((created.patient as { id: string }).id);

    expect(derivedTherapyClasses(stored.treatmentCourse)).toEqual(before);
  });

  it("keeps the maintenance flag and the planned cycle count", async () => {
    const created = await register({
      name: "Maintenance Flag",
      age: 54,
      treatmentCourse: {
        entryMethod: "builder",
        phases: [
          { id: "p1", name: "AC", sequence: 1, plannedCycles: 4, agents: [{ genericName: "doxorubicin" }] },
          {
            id: "p2",
            name: "Trastuzumab maintenance",
            sequence: 2,
            maintenance: true,
            agents: [{ genericName: "trastuzumab" }],
          },
        ],
      },
      therapy: ["anthracycline", "her2"],
    });

    const stored = await read((created.patient as { id: string }).id);
    expect(stored.treatmentCourse?.phases[0].plannedCycles).toBe(4);
    expect(stored.treatmentCourse?.phases[1].maintenance).toBe(true);
  });

  it("remembers which phase the patient is on", async () => {
    const course = courseFromPreset("breast_ac_th")!;
    course.activePhaseId = course.phases[1].id;

    const created = await register({
      name: "Active Phase",
      age: 54,
      treatmentCourse: course,
      therapy: ["anthracycline", "her2"],
    });

    const stored = await read((created.patient as { id: string }).id);
    expect(stored.treatmentCourse?.activePhaseId).toBe(course.phases[1].id);
  });

  /* ----------------------------------------------------------- free text */

  it("stores a free-text regimen verbatim and gives it no structure", async () => {
    const text = "FOLFIRINOX (modified) — oxaliplatin omitted C3, per Dr Chen";

    const created = await register({
      name: "Free Text",
      age: 61,
      regimen: text,
      treatmentCourse: { entryMethod: "freeText", freeTextDescription: text, phases: [] },
      therapy: [],
    });

    const stored = await read((created.patient as { id: string }).id);

    expect(stored.regimen).toBe(text);
    expect(stored.treatmentCourse?.entryMethod).toBe("freeText");
    // The assertion this file exists for: nothing was parsed out of the text
    // on the way in, on the way out, or anywhere between.
    expect(stored.treatmentCourse?.phases).toEqual([]);
    expect(derivedTherapyClasses(stored.treatmentCourse)).toEqual([]);
  });

  it("does not invent therapy classes from a regimen string naming real drugs", async () => {
    const created = await register({
      name: "Named Drugs",
      age: 61,
      // Names an anthracycline and a HER2 antibody in plain sight.
      regimen: "doxorubicin 60mg/m2 then trastuzumab",
      treatmentCourse: {
        entryMethod: "freeText",
        freeTextDescription: "doxorubicin 60mg/m2 then trastuzumab",
        phases: [],
      },
      therapy: [],
    });

    const stored = await read((created.patient as { id: string }).id);
    expect(stored.therapy).toEqual([]);
    expect(derivedTherapyClasses(stored.treatmentCourse)).toEqual([]);
  });

  /* ------------------------------------------------------------ editing */

  it("replaces the phases when the course is edited, leaving none behind", async () => {
    const created = await register({
      name: "Edited Course",
      age: 54,
      treatmentCourse: courseFromPreset("breast_ac_th"),
      therapy: ["anthracycline", "her2"],
    });
    const patientId = (created.patient as { id: string }).id;

    const shortened = await call<{ patient: Doc; updatedAt: string }>(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: {
        ...(created.patient as Doc),
        treatmentCourse: {
          entryMethod: "builder",
          phases: [{ id: "only", name: "AC only", sequence: 1, agents: [{ genericName: "doxorubicin" }] }],
        },
        expectedUpdatedAt: created.updatedAt,
      },
    });
    expect(shortened.status).toBe(200);

    const stored = await read(patientId);
    expect(stored.treatmentCourse?.phases).toHaveLength(1);
    expect(stored.treatmentCourse?.phases[0].name).toBe("AC only");
  });

  it("drops the phases when a structured course is replaced by free text", async () => {
    const created = await register({
      name: "Back To Free Text",
      age: 54,
      treatmentCourse: courseFromPreset("breast_ac_th"),
      therapy: ["anthracycline", "her2"],
    });
    const patientId = (created.patient as { id: string }).id;

    const switched = await call<{ patient: Doc; updatedAt: string }>(recordRoute.PUT, {
      as: CLINICIAN_A,
      method: "PUT",
      params: { patientId },
      body: {
        ...(created.patient as Doc),
        regimen: "AC-TH, modified locally",
        treatmentCourse: {
          entryMethod: "freeText",
          freeTextDescription: "AC-TH, modified locally",
          phases: [],
        },
        expectedUpdatedAt: created.updatedAt,
      },
    });
    expect(switched.status).toBe(200);

    const stored = await read(patientId);
    expect(stored.treatmentCourse?.phases).toEqual([]);
    // The therapy classes are NOT retracted: they were confirmed by the
    // clinician and remain a fact about the patient's planned treatment.
    expect(stored.therapy).toEqual(["anthracycline", "her2"]);
  });

  /* --------------------------------------------------------- validation */

  it("refuses a therapy class the vocabulary does not contain", async () => {
    const result = await call(patientsRoute.POST, {
      as: CLINICIAN_A,
      method: "POST",
      body: {
        name: "Bad Class",
        age: 54,
        treatmentCourse: {
          entryMethod: "builder",
          phases: [
            {
              id: "p1",
              name: "Phase",
              agents: [{ genericName: "mystery drug", corscTherapyClass: "made-up-class" }],
            },
          ],
        },
      },
    });

    expect(result.status).toBe(400);
  });

  it("accepts a course for a patient registered before courses existed", async () => {
    // The back-compat path: a record with a regimen string and no course.
    const created = await register({
      name: "Legacy Record",
      age: 54,
      regimen: "AC-T followed by trastuzumab",
      therapy: ["anthracycline"],
    });

    const stored = await read((created.patient as { id: string }).id);
    expect(stored.regimen).toBe("AC-T followed by trastuzumab");
    expect(stored.treatmentCourse?.phases ?? []).toEqual([]);
    expect(derivedTherapyClasses(stored.treatmentCourse)).toEqual([]);
  });
});
