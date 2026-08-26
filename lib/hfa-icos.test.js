/* =========================================================================
   HFA-ICOS validation suite.

   Every case below states the EXPECTED PUBLISHED RESULT independently of the
   implementation, derived by applying the published algebra by hand to the
   factors the synthetic patient carries:

       any very-high-risk factor   -> Very High
       else any high-risk factor   -> High
       else moderate points >= 5   -> High
       else moderate points 2-4    -> Moderate
       else                        -> Low

   The suite is deliberately built from patient records rather than from
   pre-counted point totals wherever possible, so that a factor silently
   dropping out of a proforma, or a derivation reading the wrong field, fails a
   test rather than passing one.
   ========================================================================= */

import { describe, expect, it } from "vitest";

import {
  PROFORMAS,
  PROFORMA_LIMITATIONS,
  RISK_MODIFIERS,
  SCORING,
  THERAPIES_WITHOUT_PROFORMA,
  assessBaselineRisk,
  assessProforma,
  assessRisk,
  categorise,
  factorsByTier,
  hasProforma,
  resolveFactors,
  scoredTherapies,
  therapyList,
} from "@/lib/hfa-icos";

/* ------------------------------------------------------------- fixtures */

/** A patient with nothing recorded beyond the planned therapy. */
function patient(overrides = {}) {
  return {
    age: "",
    gender: "Female",
    therapy: ["anthracycline"],
    baselineLVEF: "",
    baselineQTc: "",
    totalPlannedDose: "",
    veryHigh: {},
    high: {},
    m2: {},
    m1: {},
    history: {
      cardiovascular: { checks: {}, fields: {} },
      riskFactors: { checks: {}, fields: {} },
      family: { checks: {}, fields: {} },
      lifestyle: { checks: {}, fields: {} },
      priorTreatment: { checks: {}, fields: {} },
    },
    ...overrides,
  };
}

const withCv = (checks, overrides = {}) =>
  patient({ history: { ...patient().history, cardiovascular: { checks, fields: {} } }, ...overrides });

const withRf = (checks, overrides = {}) =>
  patient({ history: { ...patient().history, riskFactors: { checks, fields: {} } }, ...overrides });

const category = (p, context) => assessBaselineRisk(p, context).category;
const points = (p, context) => assessBaselineRisk(p, context).points;

/* =========================================================================
   1. The published categorisation algebra, exercised at every boundary
   ========================================================================= */

describe("published HFA-ICOS categorisation algebra", () => {
  it("is Low at a moderate total of 0", () => {
    expect(categorise({ moderatePoints: 0 }).category).toBe("Low");
  });

  it("is Low at a moderate total of 1 — the boundary the previous build got wrong", () => {
    expect(categorise({ moderatePoints: 1 }).category).toBe("Low");
  });

  it("is Moderate at a moderate total of 2", () => {
    expect(categorise({ moderatePoints: 2 }).category).toBe("Moderate");
  });

  it("is Moderate at a moderate total of 3", () => {
    expect(categorise({ moderatePoints: 3 }).category).toBe("Moderate");
  });

  it("is Moderate at a moderate total of 4 — the top of the moderate band", () => {
    expect(categorise({ moderatePoints: 4 }).category).toBe("Moderate");
  });

  it("is High at a moderate total of 5 — the published high-risk threshold", () => {
    expect(categorise({ moderatePoints: 5 }).category).toBe("High");
  });

  it("is High at a moderate total of 6", () => {
    expect(categorise({ moderatePoints: 6 }).category).toBe("High");
  });

  it("promotes to High on any high-risk factor, whatever the moderate total", () => {
    expect(categorise({ highCount: 1, moderatePoints: 0 }).category).toBe("High");
  });

  it("promotes to Very High on any very-high-risk factor, whatever else is present", () => {
    expect(categorise({ veryHighCount: 1, highCount: 3, moderatePoints: 9 }).category).toBe("Very High");
  });

  it("lets a very-high-risk factor outrank a high-risk factor", () => {
    expect(categorise({ veryHighCount: 1, highCount: 2 }).category).toBe("Very High");
  });

  it("exposes the boundaries as constants that match the published bands", () => {
    expect(SCORING.lowMaxPoints).toBe(1);
    expect(SCORING.moderateMinPoints).toBe(2);
    expect(SCORING.moderateMaxPoints).toBe(4);
    expect(SCORING.highMinPoints).toBe(5);
  });

  it("names the rule that produced the category", () => {
    expect(categorise({ moderatePoints: 5 }).rule).toContain("5 or more");
    expect(categorise({ highCount: 1 }).rule).toBe("any high-risk factor");
    expect(categorise({ veryHighCount: 1 }).rule).toBe("any very-high-risk factor");
  });
});

/* =========================================================================
   2. Completely low-risk patients
   ========================================================================= */

describe("low-risk patients", () => {
  it("a 45-year-old with nothing recorded is Low", () => {
    expect(category(patient({ age: 45, baselineLVEF: 62 }))).toBe("Low");
  });

  it("a single one-point factor stays Low", () => {
    const p = withRf({ htn: true }, { age: 45, baselineLVEF: 62 });
    expect(points(p)).toBe(1);
    expect(category(p)).toBe("Low");
  });

  it("a normal LVEF contributes no points at all", () => {
    expect(points(patient({ age: 40, baselineLVEF: 65 }))).toBe(0);
  });

  it("LVEF of exactly 55% is above the borderline band and scores nothing", () => {
    expect(points(patient({ age: 40, baselineLVEF: 55 }))).toBe(0);
  });
});

/* =========================================================================
   3. Every very-high-risk factor, one at a time
   ========================================================================= */

describe("very-high-risk factors", () => {
  it("heart failure gives Very High", () => {
    expect(category(withCv({ hf: true }, { age: 45 }))).toBe("Very High");
  });

  it("cardiomyopathy gives Very High", () => {
    expect(category(withCv({ cardiomyopathy: true }, { age: 45 }))).toBe("Very High");
  });

  it("previous cancer-therapy cardiotoxicity gives Very High", () => {
    const p = patient({
      age: 45,
      history: { ...patient().history, priorTreatment: { checks: {}, fields: { priorToxicity: "LVEF fell to 42% on AC in 2021" } } },
    });
    expect(category(p)).toBe("Very High");
  });

  it("arterial vascular disease gives Very High on a VEGF inhibitor", () => {
    expect(category(withCv({ pad: true }, { age: 45, therapy: ["vegf"] }))).toBe("Very High");
  });

  it("cardiac amyloidosis gives Very High on myeloma therapy", () => {
    expect(category(withCv({ amyloidosis: true }, { age: 45, therapy: ["proteasome"] }))).toBe("Very High");
  });

  it("one very-high factor outranks a large moderate total", () => {
    const combined = patient({
      age: 70,
      baselineLVEF: 52,
      history: {
        ...patient().history,
        cardiovascular: { checks: { hf: true, af: true }, fields: {} },
        riskFactors: { checks: { htn: true, dm: true, ckd: true }, fields: {} },
      },
    });
    // Moderate total is 2 + 2 + 2 + 1 + 1 + 1 = 9, well past the high threshold,
    // and the category is still set by the single very-high-risk factor.
    expect(assessBaselineRisk(combined).points).toBe(9);
    expect(category(combined)).toBe("Very High");
  });
});

/* =========================================================================
   4. Every high-risk factor, one at a time
   ========================================================================= */

describe("high-risk factors", () => {
  it("baseline LVEF below 50% gives High", () => {
    expect(category(patient({ age: 45, baselineLVEF: 45 }))).toBe("High");
  });

  it("previous myocardial infarction gives High", () => {
    expect(category(withCv({ cad: true }, { age: 45 }))).toBe("High");
  });

  it("previous revascularisation gives High", () => {
    expect(category(withCv({ revasc: true }, { age: 45 }))).toBe("High");
  });

  it("stable angina gives High", () => {
    expect(category(withCv({ angina: true }, { age: 45 }))).toBe("High");
  });

  it("severe valvular heart disease gives High, not Very High", () => {
    // The previous build scored this as a very-high-risk factor. The published
    // anthracycline proforma places it in the high-risk tier.
    expect(category(withCv({ valve: true }, { age: 45 }))).toBe("High");
  });

  it("age 80 or over gives High", () => {
    expect(category(patient({ age: 80, baselineLVEF: 60 }))).toBe("High");
  });

  it("age 75 gives High on a VEGF inhibitor but only Moderate points on an anthracycline", () => {
    expect(category(patient({ age: 75, baselineLVEF: 60, therapy: ["vegf"] }))).toBe("High");
    expect(category(patient({ age: 75, baselineLVEF: 60, therapy: ["anthracycline"] }))).toBe("Moderate");
  });

  it("baseline QTc of 480 ms or more gives High on a BCR-ABL inhibitor", () => {
    expect(category(patient({ age: 45, baselineLVEF: 60, baselineQTc: 485, therapy: ["bcrabl"] }))).toBe("High");
  });
});

/* =========================================================================
   5. Boundary values
   ========================================================================= */

describe("LVEF boundaries", () => {
  it("49% is below 50 and scores as a high-risk factor", () => {
    expect(category(patient({ age: 45, baselineLVEF: 49 }))).toBe("High");
  });

  it("50% is the bottom of the borderline band, worth 2 points", () => {
    const p = patient({ age: 45, baselineLVEF: 50 });
    expect(points(p)).toBe(2);
    expect(category(p)).toBe("Moderate");
  });

  it("54% is the top of the borderline band, worth 2 points", () => {
    const p = patient({ age: 45, baselineLVEF: 54 });
    expect(points(p)).toBe(2);
    expect(category(p)).toBe("Moderate");
  });

  it("55% is outside the borderline band and worth nothing", () => {
    expect(points(patient({ age: 45, baselineLVEF: 55 }))).toBe(0);
  });
});

describe("age boundaries", () => {
  it("64 is below the older band and scores nothing", () => {
    expect(points(patient({ age: 64, baselineLVEF: 60 }))).toBe(0);
  });

  it("65 enters the older band, worth 2 points", () => {
    expect(points(patient({ age: 65, baselineLVEF: 60 }))).toBe(2);
  });

  it("79 is the top of the older band, worth 2 points", () => {
    expect(points(patient({ age: 79, baselineLVEF: 60 }))).toBe(2);
  });

  it("80 leaves the moderate band entirely and becomes a high-risk factor", () => {
    const result = assessBaselineRisk(patient({ age: 80, baselineLVEF: 60 }));
    expect(result.category).toBe("High");
    expect(result.points).toBe(0);
  });

  it("74 is below the VEGF elderly threshold and scores no age points", () => {
    // The VEGF proforma as implemented carries only the 75-and-over high-risk
    // age row; no lower moderate age band could be confirmed, and inventing one
    // would misrepresent the published table. This is recorded verbatim in
    // PROFORMA_LIMITATIONS.vegf rather than papered over.
    expect(points(patient({ age: 74, baselineLVEF: 60, therapy: ["vegf"] }))).toBe(0);
    expect(category(patient({ age: 74, baselineLVEF: 60, therapy: ["vegf"] }))).toBe("Low");
    expect(PROFORMA_LIMITATIONS.vegf).toMatch(/age band/);
  });
});

/* =========================================================================
   6. Moderate factor combinations, at and around every band edge
   ========================================================================= */

describe("moderate-risk point arithmetic", () => {
  it("one 1-point factor totals 1 and stays Low", () => {
    const p = withRf({ dm: true }, { age: 45, baselineLVEF: 60 });
    expect(points(p)).toBe(1);
    expect(category(p)).toBe("Low");
  });

  it("two 1-point factors total 2 and reach Moderate", () => {
    const p = withRf({ dm: true, htn: true }, { age: 45, baselineLVEF: 60 });
    expect(points(p)).toBe(2);
    expect(category(p)).toBe("Moderate");
  });

  it("one 2-point factor totals 2 and reaches Moderate", () => {
    const p = withCv({ af: true }, { age: 45, baselineLVEF: 60 });
    expect(points(p)).toBe(2);
    expect(category(p)).toBe("Moderate");
  });

  it("two 2-point factors total 4 and stay Moderate", () => {
    const p = withCv({ af: true }, { age: 70, baselineLVEF: 60 });
    expect(points(p)).toBe(4);
    expect(category(p)).toBe("Moderate");
  });

  it("four 1-point factors total 4 and stay Moderate", () => {
    const p = withRf({ dm: true, htn: true, ckd: true, obesity: true }, { age: 45, baselineLVEF: 60 });
    expect(points(p)).toBe(4);
    expect(category(p)).toBe("Moderate");
  });

  it("five 1-point factors total 5 and reach High", () => {
    const p = withRf({ dm: true, htn: true, ckd: true, obesity: true, dyslipidaemia: true }, { age: 45, baselineLVEF: 60 });
    expect(points(p)).toBe(5);
    expect(category(p)).toBe("High");
  });

  it("two 2-point factors plus one 1-point factor total 5 and reach High", () => {
    const p = patient({
      age: 70,
      baselineLVEF: 60,
      history: {
        ...patient().history,
        cardiovascular: { checks: { af: true }, fields: {} },
        riskFactors: { checks: { htn: true }, fields: {} },
      },
    });
    expect(points(p)).toBe(5);
    expect(category(p)).toBe("High");
  });

  it("a 70-year-old with treated hypertension totals 3 and is Moderate, not High", () => {
    // This is the case the previous implementation mis-classified: it escalated
    // to High at two points, so this patient was placed one whole category too
    // high and received every-cycle biomarkers and two-weekly review.
    const p = patient({
      age: 70,
      baselineLVEF: 60,
      history: { ...patient().history, riskFactors: { checks: { htn: true }, fields: {} } },
    });
    expect(points(p)).toBe(3);
    expect(category(p)).toBe("Moderate");
  });

  it("borderline LVEF plus older age totals 4 and stays Moderate", () => {
    const p = patient({ age: 70, baselineLVEF: 52 });
    expect(points(p)).toBe(4);
    expect(category(p)).toBe("Moderate");
  });

  it("borderline LVEF, older age and one 1-point factor total 5 and reach High", () => {
    const p = patient({
      age: 70,
      baselineLVEF: 52,
      history: { ...patient().history, riskFactors: { checks: { dm: true }, fields: {} } },
    });
    expect(points(p)).toBe(5);
    expect(category(p)).toBe("High");
  });
});

/* =========================================================================
   7. Individual moderate factors carry the published weight
   ========================================================================= */

describe("moderate factor weights", () => {
  const two = [
    ["borderline LVEF", patient({ age: 45, baselineLVEF: 52 })],
    ["age 65-79", patient({ age: 70, baselineLVEF: 60 })],
    ["arrhythmia", withCv({ af: true }, { age: 45, baselineLVEF: 60 })],
    [
      "prior anthracycline",
      patient({
        age: 45,
        baselineLVEF: 60,
        history: { ...patient().history, priorTreatment: { checks: {}, fields: { priorAnthracycline: "180" } } },
      }),
    ],
    ["prior chest radiotherapy", withRf({ mediastinalRT: true }, { age: 45, baselineLVEF: 60 })],
  ];

  two.forEach(([label, record]) => {
    it(`${label} is worth 2 points`, () => {
      expect(points(record)).toBe(2);
    });
  });

  const one = [
    ["hypertension", withRf({ htn: true }, { age: 45, baselineLVEF: 60 })],
    ["diabetes", withRf({ dm: true }, { age: 45, baselineLVEF: 60 })],
    ["chronic kidney disease", withRf({ ckd: true }, { age: 45, baselineLVEF: 60 })],
    ["dyslipidaemia", withRf({ dyslipidaemia: true }, { age: 45, baselineLVEF: 60 })],
    ["obesity", withRf({ obesity: true }, { age: 45, baselineLVEF: 60 })],
    [
      "current smoking",
      patient({ age: 45, baselineLVEF: 60, history: { ...patient().history, lifestyle: { checks: {}, fields: { smoking: "Current smoker" } } } }),
    ],
    [
      "family history of premature cardiovascular disease",
      patient({ age: 45, baselineLVEF: 60, history: { ...patient().history, family: { checks: { prematureCAD: true }, fields: {} } } }),
    ],
  ];

  one.forEach(([label, record]) => {
    it(`${label} is worth 1 point`, () => {
      expect(points(record)).toBe(1);
    });
  });

  it("never-smokers score nothing for smoking", () => {
    const p = patient({ age: 45, baselineLVEF: 60, history: { ...patient().history, lifestyle: { checks: {}, fields: { smoking: "Never" } } } });
    expect(points(p)).toBe(0);
  });
});

/* =========================================================================
   8. Baseline biomarker factors are resolved against the assay, not a guess
   ========================================================================= */

describe("baseline biomarker factors", () => {
  it("scores nothing when no baseline biomarker context is supplied", () => {
    expect(points(patient({ age: 45, baselineLVEF: 60 }), {})).toBe(0);
  });

  it("an elevated baseline troponin is worth 2 points", () => {
    expect(points(patient({ age: 45, baselineLVEF: 60 }), { baselineTroponinElevated: true })).toBe(2);
  });

  it("an elevated baseline natriuretic peptide is worth 2 points", () => {
    expect(points(patient({ age: 45, baselineLVEF: 60 }), { baselineNatrioureticElevated: true })).toBe(2);
  });

  it("both elevated biomarkers total 4 and stay Moderate", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: 60 }), {
      baselineTroponinElevated: true,
      baselineNatrioureticElevated: true,
    });
    expect(result.points).toBe(4);
    expect(result.category).toBe("Moderate");
  });
});

/* =========================================================================
   9. Therapy-specific differences
   ========================================================================= */

describe("therapy-specific proformas", () => {
  it("scores each planned therapy on its own proforma", () => {
    const result = assessBaselineRisk(patient({ age: 76, baselineLVEF: 60, therapy: ["anthracycline", "vegf"] }));
    const byTherapy = Object.fromEntries(result.results.map((item) => [item.therapyId, item.category]));
    expect(byTherapy.anthracycline).toBe("Moderate");
    expect(byTherapy.vegf).toBe("High");
  });

  it("takes the highest category across therapies as the governing baseline", () => {
    const result = assessBaselineRisk(patient({ age: 76, baselineLVEF: 60, therapy: ["anthracycline", "vegf"] }));
    expect(result.category).toBe("High");
    expect(result.governing.therapyId).toBe("vegf");
  });

  it("labels multi-therapy composition as a CORSC decision, not part of the published tool", () => {
    const result = assessBaselineRisk(patient({ therapy: ["anthracycline", "her2"], age: 70, baselineLVEF: 60 }));
    expect(result.composition).not.toBeNull();
    expect(result.composition.provenance.sourceId).toBe("corsc-operational");
  });

  it("does not add a composition note for a single therapy", () => {
    expect(assessBaselineRisk(patient({ age: 45, baselineLVEF: 60 })).composition).toBeNull();
  });

  it("scores anthracycline-before-HER2 sequencing only in the HER2 proforma", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: 60, therapy: ["anthracycline", "her2"] }));
    const her2 = result.results.find((item) => item.therapyId === "her2");
    const anthra = result.results.find((item) => item.therapyId === "anthracycline");
    expect(her2.contributing.map((f) => f.id)).toContain("anthracycline-before-her2");
    expect(anthra.contributing.map((f) => f.id)).not.toContain("anthracycline-before-her2");
  });

  it("assessRisk's factor list is scoped to the governing therapy only, and can omit a row from a non-governing one", () => {
    // Anthracycline's stable angina (high) and VEGF's arterial vascular disease
    // (very high) are each present. Very High outranks High, so VEGF governs —
    // and the registration screen's checkbox for "stable angina" must not be
    // silently orphaned just because the governing proforma is VEGF's.
    const p = patient({
      age: 45,
      baselineLVEF: 60,
      therapy: ["anthracycline", "vegf"],
      history: {
        ...patient().history,
        cardiovascular: { checks: { angina: true, pad: true }, fields: {} },
      },
    });
    const result = assessRisk(p);
    expect(result.category).toBe("Very High");
    expect(result.baseline.governing.therapyId).toBe("vegf");
    // The governing-only slice used by assessRisk cannot see anthracycline's
    // row at all — it was never part of VEGF's proforma.
    expect(result.factors.some((f) => f.id === "stable-angina")).toBe(false);
  });

  it("resolveFactors covers every selected therapy's proforma, not just the governing one", () => {
    // Same patient as above. A UI built on resolveFactors (as the registration
    // screen's checkboxes are) must still find and correctly tick the
    // anthracycline-only factor even though VEGF governs the headline category.
    const p = patient({
      age: 45,
      baselineLVEF: 60,
      therapy: ["anthracycline", "vegf"],
      history: {
        ...patient().history,
        cardiovascular: { checks: { angina: true, pad: true }, fields: {} },
      },
    });
    const resolved = resolveFactors(p);
    const stableAngina = resolved.find((f) => f.id === "stable-angina");
    expect(stableAngina).toBeDefined();
    expect(stableAngina.present).toBe(true);
    expect(stableAngina.source).toBe("derived");
    const arterialDisease = resolved.find((f) => f.id === "arterial-vascular-disease");
    expect(arterialDisease.present).toBe(true);
  });

  it("puts venous thromboembolism in the high tier for VEGF inhibitors", () => {
    expect(category(withCv({ vte: true }, { age: 45, baselineLVEF: 60, therapy: ["vegf"] }))).toBe("High");
  });

  it("puts the same venous thromboembolism in the moderate tier for BCR-ABL inhibitors", () => {
    const p = withCv({ vte: true }, { age: 45, baselineLVEF: 60, therapy: ["bcrabl"] });
    expect(category(p)).toBe("Moderate");
    expect(points(p)).toBe(2);
  });
});

/* =========================================================================
   10. Therapies with no published proforma
   ========================================================================= */

describe("therapies HFA-ICOS does not publish a proforma for", () => {
  it("produces no HFA-ICOS result for checkpoint inhibitors", () => {
    const result = assessBaselineRisk(patient({ age: 70, baselineLVEF: 60, therapy: ["ici"] }));
    expect(result.applicable).toBe(false);
    expect(result.category).toBeNull();
  });

  it("produces no HFA-ICOS result for fluoropyrimidines", () => {
    const result = assessBaselineRisk(patient({ age: 70, baselineLVEF: 60, therapy: ["fluoropyrimidine"] }));
    expect(result.applicable).toBe(false);
  });

  it("explains why, rather than returning a silent Low", () => {
    const result = assessBaselineRisk(patient({ therapy: ["ici"] }));
    expect(result.unscoredNotes[0].note).toContain("no published HFA-ICOS baseline proforma");
  });

  it("still scores the covered therapy when a covered and an uncovered therapy are combined", () => {
    const result = assessBaselineRisk(patient({ age: 82, baselineLVEF: 60, therapy: ["ici", "anthracycline"] }));
    expect(result.applicable).toBe(true);
    expect(result.category).toBe("High");
    expect(result.unscoredTherapies).toEqual(["ici"]);
  });

  it("registers every unscored therapy with an explanation", () => {
    Object.keys(THERAPIES_WITHOUT_PROFORMA).forEach((id) => {
      expect(hasProforma(id)).toBe(false);
      expect(THERAPIES_WITHOUT_PROFORMA[id]).toMatch(/no published HFA-ICOS/);
    });
  });
});

/* =========================================================================
   11. Missing, contradictory and invalid data
   ========================================================================= */

describe("missing and invalid data", () => {
  it("treats a missing age as absent rather than as zero", () => {
    expect(points(patient({ age: "", baselineLVEF: 60 }))).toBe(0);
  });

  it("treats a missing LVEF as absent rather than as a reduced ejection fraction", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: "" }));
    expect(result.category).toBe("Low");
    expect(result.contributing.map((f) => f.id)).not.toContain("baseline-lvef-reduced");
  });

  it("does not read free text in the LVEF field as a number", () => {
    expect(category(patient({ age: 45, baselineLVEF: "pending" }))).toBe("Low");
  });

  it("survives a null patient", () => {
    expect(() => assessBaselineRisk(null)).not.toThrow();
    expect(assessBaselineRisk(null).applicable).toBe(false);
  });

  it("survives a patient with no history object at all", () => {
    expect(() => assessBaselineRisk({ therapy: ["anthracycline"], age: 70 })).not.toThrow();
    expect(assessBaselineRisk({ therapy: ["anthracycline"], age: 70 }).points).toBe(2);
  });

  it("survives an unrecognised therapy id", () => {
    const result = assessBaselineRisk(patient({ therapy: ["not-a-therapy"] }));
    expect(result.applicable).toBe(false);
  });

  it("does not double-count a factor that is both ticked and derivable", () => {
    const p = patient({
      age: 70,
      baselineLVEF: 60,
      m2: { "age-65-79": true },
    });
    expect(points(p)).toBe(2);
  });

  it("counts an explicit tick even when the underlying history is blank", () => {
    const p = patient({ age: 45, baselineLVEF: 60, m1: { hypertension: true } });
    expect(points(p)).toBe(1);
  });
});

/* =========================================================================
   12. Migration of records saved by earlier builds
   ========================================================================= */

describe("records saved by earlier builds", () => {
  it("honours a legacy very-high tick id", () => {
    expect(category(patient({ age: 45, baselineLVEF: 60, veryHigh: { vh1: true } }))).toBe("Very High");
  });

  it("honours a legacy high tick id whose factor has moved tier", () => {
    // h5 was prior chest radiotherapy, previously scored as a high-risk factor.
    // It is now a two-point moderate factor, but the tick must still count.
    const p = patient({ age: 45, baselineLVEF: 60, high: { h5: true } });
    expect(points(p)).toBe(2);
    expect(category(p)).toBe("Moderate");
  });

  it("honours legacy moderate tick ids", () => {
    const p = patient({ age: 45, baselineLVEF: 60, m2: { m2c: true }, m1: { m1c: true } });
    expect(points(p)).toBe(3);
    expect(category(p)).toBe("Moderate");
  });

  it("accepts a therapy stored as a bare string rather than a list", () => {
    expect(therapyList("anthracycline")).toEqual(["anthracycline"]);
    expect(category(patient({ age: 82, baselineLVEF: 60, therapy: "anthracycline" }))).toBe("High");
  });
});

/* =========================================================================
   13. Risk modifiers sit outside the HFA-ICOS score
   ========================================================================= */

describe("risk modifiers outside the published proforma", () => {
  it("planned high cumulative anthracycline dose adds no HFA-ICOS points", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: 60, totalPlannedDose: 400 }));
    expect(result.points).toBe(0);
    expect(result.category).toBe("Low");
  });

  it("but is reported as a modifier with its own source", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: 60, totalPlannedDose: 400 }));
    expect(result.modifiers).toHaveLength(1);
    expect(result.modifiers[0].id).toBe("planned-high-anthracycline-dose");
    expect(result.modifiers[0].provenance.sourceId).toBe("asco-2017-cardiac");
  });

  it("is not raised below the threshold", () => {
    expect(assessBaselineRisk(patient({ age: 45, baselineLVEF: 60, totalPlannedDose: 240 })).modifiers).toHaveLength(0);
  });

  it("is raised at exactly the threshold", () => {
    expect(assessBaselineRisk(patient({ age: 45, baselineLVEF: 60, totalPlannedDose: 250 })).modifiers).toHaveLength(1);
  });

  it("only applies to the therapies it is declared for", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: 60, totalPlannedDose: 400, therapy: ["her2"] }));
    expect(result.modifiers).toHaveLength(0);
    expect(RISK_MODIFIERS[0].appliesTo).toEqual(["anthracycline"]);
  });
});

/* =========================================================================
   14. Explainability and provenance
   ========================================================================= */

describe("explainability", () => {
  it("reports the workings so the category can be reproduced by hand", () => {
    const result = assessBaselineRisk(patient({ age: 70, baselineLVEF: 52 }));
    expect(result.workings.join(" ")).toContain("Moderate-risk total: 4 points");
    expect(result.workings.at(-1)).toContain("Moderate");
  });

  it("records how each present factor was established", () => {
    const result = assessBaselineRisk(patient({ age: 70, baselineLVEF: 60 }));
    const age = result.contributing.find((f) => f.id === "age-65-79");
    expect(age.source).toBe("derived");
    expect(age.sourceDetail).toContain("recorded age");
  });

  it("marks an explicitly ticked factor as recorded rather than derived", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: 60, m1: { diabetes: true } }));
    expect(result.contributing.find((f) => f.id === "diabetes").source).toBe("recorded");
  });

  it("attaches HFA-ICOS provenance to the result", () => {
    const result = assessBaselineRisk(patient({ age: 45, baselineLVEF: 60 }));
    expect(result.provenance.sourceId).toBe("hfa-icos-2020");
    expect(result.provenance.year).toBe(2020);
  });

  it("marks the anthracycline proforma as verified", () => {
    expect(assessProforma(patient(), "anthracycline").provenance.verification).toBe("verified");
  });

  it("marks the partially verified proformas honestly and states the limitation", () => {
    ["vegf", "bcrabl", "proteasome", "rafmek"].forEach((id) => {
      const result = assessProforma(patient({ therapy: [id] }), id);
      expect(result.provenance.verification).toBe("partial");
      expect(result.limitation).toBe(PROFORMA_LIMITATIONS[id]);
    });
  });

  it("flags a whole assessment as partially verified when any proforma is", () => {
    expect(assessBaselineRisk(patient({ therapy: ["anthracycline"] })).partiallyVerified).toBe(false);
    expect(assessBaselineRisk(patient({ therapy: ["anthracycline", "vegf"] })).partiallyVerified).toBe(true);
  });

  it("gives every proforma factor a definition a clinician can act on", () => {
    Object.values(PROFORMAS).forEach((proforma) => {
      proforma.factors.forEach((item) => {
        expect(item.definition, `${proforma.id}/${item.id}`).toBeTruthy();
      });
    });
  });

  it("assigns every proforma factor a known tier", () => {
    Object.values(PROFORMAS).forEach((proforma) => {
      proforma.factors.forEach((item) => {
        expect(["veryHigh", "high", "moderate2", "moderate1"]).toContain(item.tier);
      });
    });
  });

  it("uses a unique factor id within each proforma", () => {
    Object.values(PROFORMAS).forEach((proforma) => {
      const ids = proforma.factors.map((item) => item.id);
      expect(new Set(ids).size, proforma.id).toBe(ids.length);
    });
  });
});

/* =========================================================================
   15. The compatibility surface the workflow still consumes
   ========================================================================= */

describe("compatibility surface", () => {
  it("assessRisk keeps the shape the workflow sections read", () => {
    const result = assessRisk(patient({ age: 70, baselineLVEF: 52 }));
    expect(result).toMatchObject({ category: "Moderate", points: 4 });
    expect(Array.isArray(result.contributing)).toBe(true);
    expect(Array.isArray(result.derived)).toBe(true);
  });

  it("assessRisk reports Low rather than null when no proforma applies, and says so", () => {
    const result = assessRisk(patient({ therapy: ["ici"] }));
    expect(result.category).toBe("Low");
    expect(result.applicable).toBe(false);
  });

  it("factorsByTier returns the proforma grouped for display", () => {
    const tiers = factorsByTier(["anthracycline"]);
    expect(tiers.veryHigh.length).toBeGreaterThan(0);
    expect(tiers.high.length).toBeGreaterThan(0);
    expect(tiers.moderate2.every((f) => f.tier === "moderate2")).toBe(true);
  });

  it("scoredTherapies filters out therapies with no proforma", () => {
    expect(scoredTherapies(["anthracycline", "ici", "her2"])).toEqual(["anthracycline", "her2"]);
  });
});
