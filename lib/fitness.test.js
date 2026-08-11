import { describe, expect, it } from "vitest";

import { anthracyclineLedger } from "@/lib/anthracycline";
import { assessFitness } from "@/lib/fitness";
import { getClinicalSignals } from "@/lib/surveillance-engine";
import { deriveVitals } from "@/lib/vitals";

function scenario({ patient = {}, encounter = {}, outstanding = [] } = {}) {
  const fullPatient = {
    age: "58",
    gender: "Male",
    baselineLVEF: "62",
    therapy: ["anthracycline"],
    risk: { category: "Moderate" },
    clinicalStatus: "Stable",
    visits: [],
    ...patient,
  };
  const fullEncounter = {
    id: "v1",
    type: "Cycle 3",
    date: "2026-03-10",
    symptoms: [],
    inv: {},
    exam: {},
    vitals: {},
    ...encounter,
  };
  const signals = getClinicalSignals(fullPatient, fullEncounter);
  return assessFitness({
    patient: fullPatient,
    encounter: fullEncounter,
    signals,
    vitals: deriveVitals(fullEncounter.vitals, fullPatient.baselineWeight),
    outstanding,
    ledger: anthracyclineLedger(fullPatient),
  });
}

function findingIds(result) {
  return result.findings.map((finding) => finding.id);
}

describe("proceed", () => {
  it("clears a stable patient with nothing abnormal", () => {
    const result = scenario({
      encounter: { vitals: { sbp: 124, dbp: 78 }, inv: { lvef: { result: "60" } } },
    });
    expect(result.verdict).toBe("proceed");
    expect(result.findings).toHaveLength(0);
    expect(result.summary).toMatch(/no cardiac finding/i);
  });

  it("carries a label and tone for the banner", () => {
    const result = scenario({ encounter: { vitals: { sbp: 120, dbp: 76 }, inv: { lvef: { result: "60" } } } });
    expect(result.label).toBe("Proceed");
    expect(result.tone).toBe("ok");
  });
});

describe("hold", () => {
  it("holds for a troponin rise on immunotherapy, with no symptoms", () => {
    const result = scenario({
      patient: { therapy: ["ici"], risk: { category: "Low" } },
      encounter: { inv: { troponin: { value: 55 }, lvef: { result: "60" } } },
    });
    expect(result.verdict).toBe("hold");
    expect(findingIds(result)).toContain("ici-myocarditis");
    expect(result.actions.join(" ")).toMatch(/withhold the next immunotherapy dose/i);
  });

  it("holds for severe cardiac dysfunction", () => {
    const result = scenario({ encounter: { inv: { lvef: { result: "34" } } } });
    expect(result.verdict).toBe("hold");
    expect(findingIds(result)).toContain("ctrcd-severe");
  });

  it("holds for an actionable QTc", () => {
    const result = scenario({
      encounter: { inv: { ecg: { measurements: { qt: 520, rate: 60 } }, lvef: { result: "60" } } },
    });
    expect(result.verdict).toBe("hold");
    expect(findingIds(result)).toContain("qt");
  });

  it("holds for chest pain reported today", () => {
    const result = scenario({ encounter: { symptoms: ["Chest pain"], inv: { lvef: { result: "60" } } } });
    expect(result.verdict).toBe("hold");
    expect(findingIds(result)).toContain("acute-symptoms");
  });

  it("holds for grade 3 hypertension", () => {
    const result = scenario({
      encounter: { vitals: { sbp: 190, dbp: 115 }, inv: { lvef: { result: "60" } } },
    });
    expect(result.verdict).toBe("hold");
    expect(findingIds(result)).toContain("severe-hypertension");
  });

  it("holds once the high cumulative anthracycline threshold is passed", () => {
    const result = scenario({
      patient: { anthracyclineDoses: [{ agent: "doxorubicin", dose: 420, cycle: 7 }] },
      encounter: { inv: { lvef: { result: "60" } } },
    });
    expect(result.verdict).toBe("hold");
    expect(findingIds(result)).toContain("anthracycline-dose");
  });

  it("reports only the hold actions when both holds and cautions are present", () => {
    const result = scenario({
      encounter: { symptoms: ["Chest pain", "Pedal oedema"], inv: { lvef: { result: "60" } } },
    });
    expect(result.holds.length).toBeGreaterThan(0);
    expect(result.cautions.length).toBeGreaterThan(0);
    expect(result.actions.join(" ")).not.toMatch(/recheck blood pressure/i);
  });
});

describe("caution", () => {
  it("cautions for moderate cardiac dysfunction rather than holding", () => {
    const result = scenario({ encounter: { inv: { lvef: { result: "45" } } } });
    expect(result.verdict).toBe("caution");
    expect(findingIds(result)).toContain("ctrcd-moderate");
  });

  it("cautions when dysfunction cannot be graded", () => {
    // A small fall into the 40-49 band with no supporting strain or biomarker.
    const result = scenario({
      patient: { baselineLVEF: "54" },
      encounter: { inv: { lvef: { result: "47" } } },
    });
    expect(result.verdict).toBe("caution");
    expect(findingIds(result)).toContain("ctrcd-unresolved");
  });

  it("cautions when no baseline ejection fraction was ever recorded", () => {
    const result = scenario({ patient: { baselineLVEF: "" } });
    expect(result.verdict).toBe("caution");
    expect(findingIds(result)).toContain("no-baseline");
  });

  it("cautions for grade 1 hypertension only on a VEGF inhibitor", () => {
    const onVegf = scenario({
      patient: { therapy: ["vegf"] },
      encounter: { vitals: { sbp: 148, dbp: 92 }, inv: { lvef: { result: "60" } } },
    });
    const onAnthracycline = scenario({
      encounter: { vitals: { sbp: 148, dbp: 92 }, inv: { lvef: { result: "60" } } },
    });
    expect(findingIds(onVegf)).toContain("hypertension");
    expect(findingIds(onAnthracycline)).not.toContain("hypertension");
  });

  it("cautions for outstanding cardiac investigations", () => {
    const result = scenario({
      encounter: { inv: { lvef: { result: "60" } } },
      outstanding: [{ id: "echo", label: "Echocardiography", status: "overdue", milestone: "Cycle 2" }],
    });
    expect(findingIds(result)).toContain("overdue");
  });

  it("ignores outstanding non-cardiac investigations", () => {
    const result = scenario({
      encounter: { inv: { lvef: { result: "60" } } },
      outstanding: [{ id: "lft", label: "Liver function", status: "overdue", milestone: "Cycle 2" }],
    });
    expect(findingIds(result)).not.toContain("overdue");
  });

  it("cautions while approaching a cumulative anthracycline threshold", () => {
    const result = scenario({
      patient: { anthracyclineDoses: [{ agent: "doxorubicin", dose: 220, cycle: 4 }] },
      encounter: { inv: { lvef: { result: "60" } } },
    });
    expect(result.verdict).toBe("caution");
    expect(findingIds(result)).toContain("anthracycline-approaching");
  });

  it("separates pedal oedema from chest pain", () => {
    const result = scenario({ encounter: { symptoms: ["Pedal oedema"], inv: { lvef: { result: "60" } } } });
    expect(result.verdict).toBe("caution");
    expect(findingIds(result)).toContain("symptoms");
  });
});

describe("verdict resolution", () => {
  it("takes the worst verdict across all findings", () => {
    const result = scenario({
      encounter: { symptoms: ["Pedal oedema"], inv: { lvef: { result: "34" } } },
    });
    expect(result.verdict).toBe("hold");
  });

  it("gives every finding a verdict, a reason and actions", () => {
    const result = scenario({ encounter: { inv: { lvef: { result: "45" } } } });
    result.findings.forEach((finding) => {
      expect(finding.verdict).toBeTruthy();
      expect(finding.title).toBeTruthy();
      expect(finding.detail).toBeTruthy();
      expect(Array.isArray(finding.actions)).toBe(true);
    });
  });

  it("deduplicates actions shared between findings", () => {
    const result = scenario({ encounter: { inv: { lvef: { result: "45" }, troponin: { value: 90 } } } });
    expect(new Set(result.actions).size).toBe(result.actions.length);
  });
});
