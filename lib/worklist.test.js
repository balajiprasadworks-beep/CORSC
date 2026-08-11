import { describe, expect, it } from "vitest";

import { FILTERS, buildWorklist, sortRows, worklistRow } from "@/lib/worklist";

const TODAY = "2026-08-11";

function patient(overrides = {}) {
  return {
    id: "p1",
    patientId: "H100",
    name: "Test Patient",
    age: 62,
    gender: "Female",
    diagnosis: "Breast cancer",
    therapy: ["anthracycline"],
    baselineLVEF: 60,
    cycle: 3,
    history: { cardiovascular: { checks: {} }, riskFactors: { checks: {} } },
    restratification: {},
    visits: [],
    ...overrides,
  };
}

function filedVisit(overrides = {}) {
  return { id: "v1", saved: true, date: "2026-07-01", type: "Cycle 3", inv: {}, symptoms: [], vitals: {}, ...overrides };
}

describe("row construction", () => {
  it("carries identity, therapy and cycle", () => {
    const row = worklistRow(patient(), { today: TODAY });
    expect(row).toMatchObject({ patientId: "H100", name: "Test Patient", cycle: 3 });
    expect(row.therapy).toMatch(/Anthracycline/);
  });

  it("reports the baseline category and the current toxicity separately", () => {
    const row = worklistRow(patient({ age: 70 }), { today: TODAY });
    expect(row.baselineRisk).toBe("Moderate");
    expect(row.ctrCvtSeverity).toBe("none");
  });

  it("says when no baseline category applies rather than inventing one", () => {
    const row = worklistRow(patient({ therapy: ["ici"] }), { today: TODAY });
    expect(row.baselineRiskApplicable).toBe(false);
    expect(row.baselineRisk).toBeNull();
  });

  it("uses the last filed encounter, not an open draft", () => {
    const row = worklistRow(
      patient({ visits: [filedVisit({ date: "2026-06-01" }), { id: "v2", saved: false, date: "2026-08-01", symptoms: ["Chest pain"] }] }),
      { today: TODAY }
    );
    expect(row.lastVisitDate).toBe("2026-06-01");
    expect(row.symptomatic).toBe(false);
  });

  it("computes how overdue a review is", () => {
    const row = worklistRow(patient({ visits: [filedVisit({ nextFollowUpDate: "2026-07-15" })] }), { today: TODAY });
    expect(row.isOverdue).toBe(true);
    expect(row.overdueDays).toBe(27);
  });

  it("marks a review that falls today", () => {
    const row = worklistRow(patient({ visits: [filedVisit({ nextFollowUpDate: TODAY })] }), { today: TODAY });
    expect(row.dueToday).toBe(true);
    expect(row.isOverdue).toBe(false);
  });

  it("does not mark a future review as overdue", () => {
    const row = worklistRow(patient({ visits: [filedVisit({ nextFollowUpDate: "2026-09-01" })] }), { today: TODAY });
    expect(row.isOverdue).toBe(false);
    expect(row.daysUntilReview).toBe(21);
  });

  it("raises an alert level from the last encounter", () => {
    const row = worklistRow(patient({ visits: [filedVisit({ symptoms: ["Syncope"] })] }), { today: TODAY });
    expect(row.alertLevel).toBe("red");
    expect(row.topAlert.title).toMatch(/Syncope/);
  });

  it("flags an abnormal biomarker", () => {
    const row = worklistRow(
      patient({ troponinAssay: "hs-cTnT", visits: [filedVisit({ inv: { troponin: { value: 60 } } })] }),
      { today: TODAY }
    );
    expect(row.biomarkerAbnormal).toBe(true);
  });

  it("carries the completeness band so a provisional row is visible", () => {
    const row = worklistRow(patient({ age: "", baselineLVEF: "" }), { today: TODAY });
    expect(row.completenessBand).toBe("insufficient");
  });

  it("carries the cumulative anthracycline exposure", () => {
    const row = worklistRow(patient({ anthracyclineDoses: [{ agent: "doxorubicin", dose: 300 }] }), { today: TODAY });
    expect(row.cumulativeDose).toBe(300);
    expect(row.doseThreshold).toBe("dexrazoxane");
  });

  it("shows a clinician override rather than the algorithmic value", () => {
    const row = worklistRow(
      patient({
        age: 70,
        overrides: [
          { id: "o1", target: "risk", algorithmicValue: "Moderate", clinicianValue: "High", reason: "Frailty", clinician: { id: "u1" }, at: "2026-08-01T00:00:00Z", active: true },
        ],
      }),
      { today: TODAY }
    );
    expect(row.baselineRisk).toBe("High");
    expect(row.baselineRiskOverridden).toBe(true);
  });
});

describe("sorting", () => {
  it("puts clinical urgency ahead of everything, not the surname", () => {
    const rows = [
      { name: "Adams", alertLevel: "green", overdueDays: 0, daysUntilReview: 10 },
      { name: "Zhang", alertLevel: "red", overdueDays: 0, daysUntilReview: 10 },
    ];
    expect(sortRows(rows)[0].name).toBe("Zhang");
  });

  it("puts the most overdue first within the same alert level", () => {
    const rows = [
      { name: "A", alertLevel: "green", overdueDays: 3, daysUntilReview: -3 },
      { name: "B", alertLevel: "green", overdueDays: 40, daysUntilReview: -40 },
    ];
    expect(sortRows(rows)[0].name).toBe("B");
  });

  it("falls back to the soonest review, then the name", () => {
    const rows = [
      { name: "B", alertLevel: "green", overdueDays: 0, daysUntilReview: 5 },
      { name: "A", alertLevel: "green", overdueDays: 0, daysUntilReview: 5 },
    ];
    expect(sortRows(rows)[0].name).toBe("A");
  });
});

describe("filters", () => {
  const caseload = [
    patient({ id: "p1", name: "Overdue", visits: [filedVisit({ nextFollowUpDate: "2026-06-01" })] }),
    patient({ id: "p2", name: "Symptomatic", visits: [filedVisit({ symptoms: ["Palpitations"], nextFollowUpDate: "2026-09-01" })] }),
    patient({ id: "p3", name: "Well", visits: [filedVisit({ nextFollowUpDate: "2026-09-01" })] }),
    patient({ id: "p4", name: "Very high", history: { cardiovascular: { checks: { hf: true } }, riskFactors: { checks: {} } }, visits: [filedVisit({ nextFollowUpDate: "2026-09-01" })] }),
  ];

  it("returns everyone when no filter is active", () => {
    expect(buildWorklist(caseload, { today: TODAY }).shown).toBe(4);
  });

  it("filters to overdue patients", () => {
    const result = buildWorklist(caseload, { filters: ["overdue"], today: TODAY });
    expect(result.rows.map((r) => r.name)).toEqual(["Overdue"]);
  });

  it("filters to very-high-risk patients", () => {
    expect(buildWorklist(caseload, { filters: ["veryHigh"], today: TODAY }).rows.map((r) => r.name)).toEqual(["Very high"]);
  });

  it("combines several filters with OR, not AND", () => {
    // A clinician selecting both is asking to see both groups, not their
    // intersection — which here would be empty.
    const result = buildWorklist(caseload, { filters: ["overdue", "veryHigh"], today: TODAY });
    expect(result.rows.map((r) => r.name).sort()).toEqual(["Overdue", "Very high"]);
  });

  it("counts each filter independently of the active selection", () => {
    const result = buildWorklist(caseload, { filters: ["overdue"], today: TODAY });
    expect(result.counts.veryHigh).toBe(1);
    expect(result.total).toBe(4);
  });

  it("searches across name, identifier, diagnosis and therapy", () => {
    expect(buildWorklist(caseload, { search: "symptomatic", today: TODAY }).shown).toBe(1);
    expect(buildWorklist(caseload, { search: "breast", today: TODAY }).shown).toBe(4);
  });

  it("gives every filter a description a clinician can read", () => {
    Object.values(FILTERS).forEach((filter) => {
      expect(filter.description, filter.id).toBeTruthy();
    });
  });

  it("survives an empty caseload", () => {
    expect(buildWorklist([], { today: TODAY })).toMatchObject({ total: 0, shown: 0 });
  });
});
