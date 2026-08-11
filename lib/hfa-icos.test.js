import { describe, expect, it } from "vitest";

import { assessRisk, factorsForTherapies, resolveFactors, therapyList } from "@/lib/hfa-icos";

function patient(overrides = {}) {
  return {
    age: "58",
    baselineLVEF: "62",
    therapy: ["anthracycline"],
    veryHigh: {},
    high: {},
    m2: {},
    m1: {},
    history: { cancer: {}, cardiovascular: {}, riskFactors: {}, family: {}, lifestyle: {}, medication: {}, priorTreatment: {} },
    ...overrides,
  };
}

function withHistory(group, checks, extra = {}) {
  return patient({
    history: {
      cardiovascular: {},
      riskFactors: {},
      lifestyle: {},
      priorTreatment: {},
      [group]: { checks },
    },
    ...extra,
  });
}

describe("therapyList", () => {
  it("normalises a single therapy to a list", () => {
    expect(therapyList("anthracycline")).toEqual(["anthracycline"]);
  });

  it("passes an array through", () => {
    expect(therapyList(["anthracycline", "her2"])).toEqual(["anthracycline", "her2"]);
  });

  it("returns an empty list when nothing is planned", () => {
    expect(therapyList("")).toEqual([]);
    expect(therapyList(null)).toEqual([]);
  });
});

describe("therapy-specific proformas", () => {
  it("scores the cumulative dose factor only for anthracyclines", () => {
    const anthracycline = factorsForTherapies(["anthracycline"]).map((f) => f.id);
    const ici = factorsForTherapies(["ici"]).map((f) => f.id);
    expect(anthracycline).toContain("h4");
    expect(ici).not.toContain("h4");
  });

  it("scores prior immune myocarditis only for checkpoint inhibitors", () => {
    expect(factorsForTherapies(["ici"]).map((f) => f.id)).toContain("vh5");
    expect(factorsForTherapies(["anthracycline"]).map((f) => f.id)).not.toContain("vh5");
  });

  it("scores prior arterial events only for BCR-ABL inhibitors", () => {
    expect(factorsForTherapies(["bcrabl"]).map((f) => f.id)).toContain("vh6");
    expect(factorsForTherapies(["her2"]).map((f) => f.id)).not.toContain("vh6");
  });

  it("assembles the union of proformas for a combined regimen", () => {
    const combined = factorsForTherapies(["anthracycline", "her2"]).map((f) => f.id);
    expect(combined).toContain("h4");
    expect(combined).toContain("h6");
  });

  it("always includes the factors common to every therapy", () => {
    ["anthracycline", "her2", "vegf", "ici", "bcrabl", "proteasome", "rafmek", "fluoropyrimidine"].forEach((therapy) => {
      const ids = factorsForTherapies([therapy]).map((f) => f.id);
      expect(ids).toContain("h3");
      expect(ids).toContain("m1e");
    });
  });
});

describe("history feeds the score", () => {
  it("scores hypertension recorded in the history", () => {
    // This is the regression the previous implementation could not pass:
    // calcRisk() was never passed the history, so the tick did nothing.
    const result = assessRisk(withHistory("riskFactors", { htn: true }));
    expect(result.points).toBe(1);
    expect(result.category).toBe("Moderate");
    expect(result.derived.map((f) => f.id)).toContain("m1e");
  });

  it("scores dyslipidaemia recorded in the history", () => {
    expect(assessRisk(withHistory("riskFactors", { dyslipidaemia: true })).points).toBe(1);
  });

  it("escalates to High when hypertension and diabetes are both recorded", () => {
    const result = assessRisk(withHistory("riskFactors", { htn: true, dm: true }));
    expect(result.points).toBe(2);
    expect(result.category).toBe("High");
  });

  it("scores prior chest radiotherapy as a high-risk factor", () => {
    const result = assessRisk(withHistory("riskFactors", { mediastinalRT: true }));
    expect(result.category).toBe("High");
  });

  it("scores heart failure from the history as very high", () => {
    const result = assessRisk(withHistory("cardiovascular", { hf: true }));
    expect(result.category).toBe("Very High");
  });

  it("scores arrhythmia from the history at two points", () => {
    const result = assessRisk(withHistory("cardiovascular", { af: true }));
    expect(result.points).toBe(2);
    expect(result.category).toBe("High");
  });

  it("records where each derived factor came from", () => {
    const result = assessRisk(withHistory("riskFactors", { htn: true }));
    const htn = result.contributing.find((f) => f.id === "m1e");
    expect(htn.source).toBe("derived");
    expect(htn.sourceDetail).toMatch(/risk factor history/i);
  });
});

describe("derivation from recorded values", () => {
  it("derives reduced ejection fraction as a high-risk factor", () => {
    expect(assessRisk(patient({ baselineLVEF: "44" })).category).toBe("High");
  });

  it("derives borderline ejection fraction at two points", () => {
    const result = assessRisk(patient({ baselineLVEF: "52" }));
    expect(result.points).toBe(2);
  });

  it("derives the age bands", () => {
    expect(assessRisk(patient({ age: "84" })).category).toBe("High");
    expect(assessRisk(patient({ age: "70" })).points).toBe(2);
    expect(assessRisk(patient({ age: "50" })).points).toBe(0);
  });

  it("derives high cumulative anthracycline exposure", () => {
    expect(assessRisk(patient({ totalPlannedDose: "300" })).category).toBe("High");
  });

  it("does not score cumulative dose for a non-anthracycline therapy", () => {
    const result = assessRisk(patient({ therapy: ["ici"], totalPlannedDose: "300" }));
    expect(result.category).toBe("Low");
  });

  it("derives prior anthracycline exposure for a HER2 patient", () => {
    const result = assessRisk(
      patient({
        therapy: ["her2"],
        history: { riskFactors: {}, cardiovascular: {}, lifestyle: {}, priorTreatment: { fields: { priorAnthracycline: "180" } } },
      })
    );
    expect(result.category).toBe("High");
  });
});

describe("explicit ticks", () => {
  it("honours a manually ticked factor", () => {
    const result = assessRisk(patient({ veryHigh: { vh2: true } }));
    expect(result.category).toBe("Very High");
    expect(result.contributing.find((f) => f.id === "vh2").source).toBe("recorded");
  });

  it("does not double-count a factor that is both ticked and derivable", () => {
    const result = assessRisk(
      patient({ m1: { m1e: true }, history: { riskFactors: { checks: { htn: true } }, cardiovascular: {}, lifestyle: {}, priorTreatment: {} } })
    );
    expect(result.points).toBe(1);
  });
});

describe("categorisation", () => {
  it("returns Low with no factors", () => {
    const result = assessRisk(patient());
    expect(result.category).toBe("Low");
    expect(result.points).toBe(0);
  });

  it("lets a very-high factor override the moderate score", () => {
    const result = assessRisk(patient({ veryHigh: { vh1: true }, m1: { m1c: true, m1d: true } }));
    expect(result.category).toBe("Very High");
  });

  it("explains itself", () => {
    expect(assessRisk(patient({ high: { h2: true } })).reason).toMatch(/high-risk factor/i);
    expect(assessRisk(patient({ m1: { m1c: true, m1d: true } })).reason).toMatch(/2 moderate-risk points/i);
  });

  it("resolves every applicable factor, present or not", () => {
    const resolved = resolveFactors(patient());
    expect(resolved.length).toBeGreaterThan(10);
    expect(resolved.every((f) => "present" in f)).toBe(true);
  });
});
