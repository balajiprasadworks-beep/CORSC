/* =========================================================================
   Server-side validation.

   These tests are about what the API REFUSES. Frontend validation is a
   convenience for the person typing; the API is reachable without the browser,
   so anything the schemas let through reaches the database and then the
   clinical engines.

   The cases below are the ones that matter clinically: a NaN that would
   propagate silently through every comparison in an engine, a date that does
   not exist, a physiologically impossible measurement, and a therapy class or
   assay identifier the engines would not recognise.
   ========================================================================= */

import { describe, expect, it } from "vitest";

import {
  baselineSchema,
  clinicalNumber,
  investigationSchema,
  isoDate,
  overrideSchema,
  patientDocumentSchema,
  requiredClinicalNumber,
  therapyPlanSchema,
} from "@/lib/backend/validation";

describe("clinicalNumber", () => {
  it("accepts numbers and numeric strings", () => {
    const schema = clinicalNumber({ min: 0, max: 100 });
    expect(schema.parse(55)).toBe(55);
    expect(schema.parse("55")).toBe(55);
    expect(schema.parse(" 55.5 ")).toBe(55.5);
  });

  it("treats a blank field as not recorded rather than zero", () => {
    // A blank ejection fraction stored as 0 would read as profound cardiac
    // dysfunction. It has to come through as null.
    expect(clinicalNumber().parse("")).toBeNull();
    expect(clinicalNumber().parse("   ")).toBeNull();
  });

  it("rejects NaN and Infinity", () => {
    // A NaN reaching an engine propagates through every comparison and
    // produces a confident wrong answer rather than an error.
    expect(clinicalNumber().safeParse(Number.NaN).success).toBe(false);
    expect(clinicalNumber().safeParse(Number.POSITIVE_INFINITY).success).toBe(false);
    expect(clinicalNumber().safeParse("not a number").success).toBe(false);
  });

  it("enforces the range", () => {
    const schema = clinicalNumber({ min: 0, max: 100, label: "LVEF" });
    expect(schema.safeParse(101).success).toBe(false);
    expect(schema.safeParse(-1).success).toBe(false);
    const failure = schema.safeParse(700);
    expect(failure.success).toBe(false);
    if (!failure.success) expect(failure.error.issues[0].message).toContain("LVEF");
  });

  it("distinguishes an optional blank from a required one", () => {
    expect(clinicalNumber().parse("")).toBeNull();
    expect(requiredClinicalNumber({ label: "Cycle number" }).safeParse("").success).toBe(false);
  });
});

describe("isoDate", () => {
  it("accepts a real calendar date", () => {
    expect(isoDate.parse("2026-02-28")).toBe("2026-02-28");
  });

  it("rejects a date that does not exist", () => {
    // 2026 is not a leap year. A schema that only pattern-matched would accept
    // this and store 2026-03-03 after coercion.
    expect(isoDate.safeParse("2026-02-29").success).toBe(false);
    expect(isoDate.safeParse("2026-13-01").success).toBe(false);
    expect(isoDate.safeParse("not a date").success).toBe(false);
    expect(isoDate.safeParse("28/02/2026").success).toBe(false);
  });
});

describe("baselineSchema", () => {
  it("rejects a physiologically impossible ejection fraction", () => {
    expect(baselineSchema.safeParse({ lvef: 700 }).success).toBe(false);
    expect(baselineSchema.safeParse({ lvef: -5 }).success).toBe(false);
    expect(baselineSchema.safeParse({ lvef: 62 }).success).toBe(true);
  });

  it("accepts GLS with either sign", () => {
    // GLS is reported negative by convention, but both conventions appear in
    // echo reports and the engines compare absolute values.
    expect(baselineSchema.safeParse({ gls: -20.5 }).success).toBe(true);
    expect(baselineSchema.safeParse({ gls: 20.5 }).success).toBe(true);
    expect(baselineSchema.safeParse({ gls: -200 }).success).toBe(false);
  });

  it("rejects a negative troponin", () => {
    expect(baselineSchema.safeParse({ troponin: -1 }).success).toBe(false);
  });

  it("rejects an unknown troponin assay", () => {
    // The assay decides the reference limit. One CORSC does not know cannot be
    // interpreted, so it must not be storable.
    expect(baselineSchema.safeParse({ troponinAssayId: "made-up-assay" }).success).toBe(false);
    expect(baselineSchema.safeParse({ troponinAssayId: "hs-cTnT" }).success).toBe(true);
  });
});

describe("therapyPlanSchema", () => {
  it("rejects a therapy class the engines do not recognise", () => {
    const failure = therapyPlanSchema.safeParse({ therapyClasses: ["not-a-therapy"] });
    expect(failure.success).toBe(false);
  });

  it("keeps every class of a combination regimen", () => {
    // The case that matters most: an anthracycline followed by HER2 blockade
    // runs two proformas, and collapsing the list would run one.
    const result = therapyPlanSchema.parse({ therapyClasses: ["anthracycline", "her2"] });
    expect(result.therapyClasses).toEqual(["anthracycline", "her2"]);
  });
});

describe("investigationSchema", () => {
  it("rejects an unknown investigation identifier", () => {
    expect(investigationSchema.safeParse({ investigationId: "vibes" }).success).toBe(false);
  });

  it("accepts a troponin with its assay and reference limit", () => {
    const result = investigationSchema.parse({
      investigationId: "troponin",
      numericValue: "28",
      assayId: "hs-cTnT",
      referenceUpperLimit: 14,
    });
    expect(result.numericValue).toBe(28);
    expect(result.assayId).toBe("hs-cTnT");
    expect(result.referenceUpperLimit).toBe(14);
  });

  it("rejects an out-of-range ECG interval", () => {
    expect(
      investigationSchema.safeParse({
        investigationId: "ecg",
        measurements: { qtc: 5000 },
      }).success
    ).toBe(false);
  });
});

describe("overrideSchema", () => {
  it("requires a substantive reason", () => {
    // An override nobody can explain later is indistinguishable from a mistake.
    const base = { target: "risk", clinicianValue: "High" };
    expect(overrideSchema.safeParse({ ...base, reason: "" }).success).toBe(false);
    expect(overrideSchema.safeParse({ ...base, reason: "because" }).success).toBe(false);
    expect(
      overrideSchema.safeParse({
        ...base,
        reason: "Prior mediastinal radiotherapy not captured by the proforma.",
      }).success
    ).toBe(true);
  });

  it("rejects an override of something that is not overridable", () => {
    expect(
      overrideSchema.safeParse({
        target: "the-whole-record",
        clinicianValue: "High",
        reason: "A reason long enough to pass the length check.",
      }).success
    ).toBe(false);
  });
});

describe("patientDocumentSchema", () => {
  const valid = {
    name: "Test Patient",
    age: 58,
    gender: "Female",
    therapy: ["anthracycline"],
    baselineLVEF: 62,
  };

  it("accepts a well-formed record", () => {
    const result = patientDocumentSchema.parse(valid);
    expect(result.name).toBe("Test Patient");
    expect(result.age).toBe(58);
  });

  it("requires a name", () => {
    expect(patientDocumentSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(patientDocumentSchema.safeParse({ ...valid, name: undefined }).success).toBe(false);
  });

  it("rejects rather than clamps an impossible value", () => {
    // Silently clamping to null would leave the clinician believing a value
    // they typed had been saved.
    const failure = patientDocumentSchema.safeParse({ ...valid, baselineLVEF: 700 });
    expect(failure.success).toBe(false);
    if (!failure.success) {
      expect(failure.error.issues.some((issue) => issue.path.includes("baselineLVEF"))).toBe(true);
    }
  });

  it("rejects an impossible age", () => {
    expect(patientDocumentSchema.safeParse({ ...valid, age: 500 }).success).toBe(false);
    expect(patientDocumentSchema.safeParse({ ...valid, age: -3 }).success).toBe(false);
  });

  it("rejects an unrecognised therapy class", () => {
    expect(patientDocumentSchema.safeParse({ ...valid, therapy: ["homeopathy"] }).success).toBe(false);
  });

  it("rejects an invalid encounter date", () => {
    expect(
      patientDocumentSchema.safeParse({
        ...valid,
        visits: [{ id: "v_1", date: "2026-02-30" }],
      }).success
    ).toBe(false);
  });
});
