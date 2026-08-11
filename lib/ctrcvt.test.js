import { describe, expect, it } from "vitest";

import { assessCtrCvt, SEVERITY, describeTwoAxis, isUnexpectedDeterioration, worstSeverity } from "@/lib/ctrcvt";
import { assessBaselineRisk } from "@/lib/hfa-icos";

function patient(overrides = {}) {
  return {
    age: 60,
    gender: "Female",
    therapy: ["anthracycline"],
    baselineLVEF: 60,
    history: { cardiovascular: { checks: {} }, riskFactors: { checks: {} } },
    restratification: {},
    ...overrides,
  };
}

const encounter = (overrides = {}) => ({ vitals: {}, symptomDetail: {}, ...overrides });

describe("severity scale", () => {
  it("orders severities correctly", () => {
    expect(worstSeverity(["none", "mild", "severe", "moderate"])).toBe("severe");
  });

  it("ranks indeterminate above mild, because it cannot exclude worse", () => {
    expect(worstSeverity(["mild", "indeterminate"])).toBe("indeterminate");
  });

  it("returns none for an empty set", () => {
    expect(worstSeverity([])).toBe(SEVERITY.none.id);
  });
});

describe("domains are graded independently", () => {
  it("reports every domain, including the clear ones", () => {
    const result = assessCtrCvt({ patient: patient(), encounter: encounter() });
    expect(result.domains).toHaveLength(5);
    expect(result.domains.map((d) => d.id)).toEqual([
      "cardiacDysfunction",
      "myocarditis",
      "vascularIschaemic",
      "hypertension",
      "arrhythmiaQt",
    ]);
  });

  it("finds nothing wrong with a well patient", () => {
    const result = assessCtrCvt({ patient: patient(), encounter: encounter({ vitals: { sbp: 120, dbp: 76 } }) });
    expect(result.present).toBe(false);
    expect(result.overall).toBe(SEVERITY.none.id);
  });

  it("grades hypertension without touching the cardiac dysfunction domain", () => {
    const result = assessCtrCvt({ patient: patient(), encounter: encounter({ vitals: { sbp: 186, dbp: 112 } }) });
    expect(result.byId.hypertension.severity).toBe(SEVERITY.severe.id);
    expect(result.byId.cardiacDysfunction.severity).toBe(SEVERITY.none.id);
  });

  it("attaches a source to every domain", () => {
    const result = assessCtrCvt({ patient: patient(), encounter: encounter() });
    result.domains.forEach((domain) => {
      expect(domain.provenance.sourceId, domain.id).toBeTruthy();
      expect(domain.provenance.citation, domain.id).toBeTruthy();
    });
  });
});

describe("checkpoint inhibitor myocarditis", () => {
  const ici = patient({ therapy: ["ici"] });

  it("fires on a troponin rise alone, with no symptoms and a normal ejection fraction", () => {
    const result = assessCtrCvt({
      patient: ici,
      encounter: encounter(),
      troponin: { newRise: true, recorded: true, label: "Elevated at 60 ng/L" },
      currentLVEF: 62,
      symptoms: [],
    });
    expect(result.byId.myocarditis.present).toBe(true);
    expect(result.byId.myocarditis.severity).toBe(SEVERITY.moderate.id);
  });

  it("says so when the screening test has not been done", () => {
    const result = assessCtrCvt({ patient: ici, encounter: encounter(), troponin: { recorded: false } });
    expect(result.byId.myocarditis.findings[0]).toMatch(/screening test for this pathway has not been done/);
  });

  it("does not fire for a non-checkpoint therapy", () => {
    const result = assessCtrCvt({ patient: patient(), encounter: encounter(), troponin: { newRise: true, recorded: true } });
    expect(result.byId.myocarditis.present).toBe(false);
  });

  it("escalates to severe once myocarditis is confirmed", () => {
    const result = assessCtrCvt({
      patient: patient({ therapy: ["ici"], restratification: { myocarditisConfirmed: true } }),
      encounter: encounter(),
    });
    expect(result.byId.myocarditis.severity).toBe(SEVERITY.severe.id);
  });
});

describe("therapy-specific vascular grading", () => {
  it("treats chest pain on a fluoropyrimidine as a vasospasm concern", () => {
    const result = assessCtrCvt({
      patient: patient({ therapy: ["fluoropyrimidine"] }),
      encounter: encounter(),
      symptoms: ["Chest pain"],
    });
    expect(result.byId.vascularIschaemic.severity).toBe(SEVERITY.moderate.id);
    expect(result.byId.vascularIschaemic.findings[0]).toMatch(/vasospasm/i);
  });

  it("treats chest pain on a BCR-ABL inhibitor as an arterial occlusive concern", () => {
    const result = assessCtrCvt({
      patient: patient({ therapy: ["bcrabl"] }),
      encounter: encounter(),
      symptoms: ["Chest pain"],
    });
    expect(result.byId.vascularIschaemic.findings[0]).toMatch(/arterial ischaemia|myocardial infarction/i);
  });

  it("grades the same chest pain lower on an anthracycline, where it is not the expected toxicity", () => {
    const result = assessCtrCvt({ patient: patient(), encounter: encounter(), symptoms: ["Chest pain"] });
    expect(result.byId.vascularIschaemic.severity).toBe(SEVERITY.mild.id);
  });

  it("escalates chest pain with a troponin rise to severe", () => {
    const result = assessCtrCvt({
      patient: patient(),
      encounter: encounter(),
      symptoms: ["Chest pain"],
      troponin: { newRise: true, recorded: true },
    });
    expect(result.byId.vascularIschaemic.severity).toBe(SEVERITY.severe.id);
  });
});

describe("the two axes stay separate", () => {
  it("does not change the baseline category when toxicity develops", () => {
    const record = patient({ age: 45, baselineLVEF: 62 });
    const before = assessBaselineRisk(record).category;
    assessCtrCvt({
      patient: record,
      encounter: encounter(),
      troponin: { newRise: true, recorded: true },
      currentLVEF: 38,
    });
    expect(assessBaselineRisk(record).category).toBe(before);
    expect(before).toBe("Low");
  });

  it("states both axes in one sentence", () => {
    const baseline = assessBaselineRisk(patient({ age: 45, baselineLVEF: 62 }));
    const ctrCvt = assessCtrCvt({ patient: patient(), encounter: encounter({ vitals: { sbp: 120, dbp: 70 } }) });
    expect(describeTwoAxis(baseline, ctrCvt)).toBe(
      "Baseline cardiovascular risk low; no current cancer therapy–related cardiovascular toxicity."
    );
  });

  it("names the case where a well-stratified patient deteriorated anyway", () => {
    const record = patient({ age: 45, baselineLVEF: 62 });
    const baseline = assessBaselineRisk(record);
    const ctrCvt = assessCtrCvt({ patient: record, encounter: encounter(), currentLVEF: 38 });
    expect(baseline.category).toBe("Low");
    expect(isUnexpectedDeterioration(baseline, ctrCvt)).toBe(true);
  });

  it("does not flag deterioration as unexpected in a very-high-risk patient", () => {
    const record = patient({ age: 45, baselineLVEF: 62, history: { cardiovascular: { checks: { hf: true } }, riskFactors: { checks: {} } } });
    const baseline = assessBaselineRisk(record);
    const ctrCvt = assessCtrCvt({ patient: record, encounter: encounter(), currentLVEF: 38 });
    expect(baseline.category).toBe("Very High");
    expect(isUnexpectedDeterioration(baseline, ctrCvt)).toBe(false);
  });

  it("says nothing about a baseline category for a therapy with no proforma", () => {
    const baseline = assessBaselineRisk(patient({ therapy: ["ici"] }));
    const ctrCvt = assessCtrCvt({ patient: patient({ therapy: ["ici"] }), encounter: encounter() });
    expect(describeTwoAxis(baseline, ctrCvt)).toMatch(/No applicable baseline HFA-ICOS category/);
  });
});

describe("blood pressure grading", () => {
  const grade = (sbp, dbp) =>
    assessCtrCvt({ patient: patient(), encounter: encounter({ vitals: { sbp, dbp } }) }).byId.hypertension.severity;

  it("is clear at target", () => expect(grade(118, 74)).toBe(SEVERITY.none.id));
  it("is mild at grade 1", () => expect(grade(145, 92)).toBe(SEVERITY.mild.id));
  it("is moderate at grade 2", () => expect(grade(165, 102)).toBe(SEVERITY.moderate.id));
  it("is severe at grade 3", () => expect(grade(182, 112)).toBe(SEVERITY.severe.id));

  it("says the reading is missing rather than assuming it is normal", () => {
    const result = assessCtrCvt({ patient: patient(), encounter: encounter() });
    expect(result.byId.hypertension.findings[0]).toMatch(/not recorded/i);
  });

  it("explains that hypertension on a VEGF inhibitor is expected but still treated", () => {
    const result = assessCtrCvt({
      patient: patient({ therapy: ["vegf"] }),
      encounter: encounter({ vitals: { sbp: 165, dbp: 100 } }),
    });
    expect(result.byId.hypertension.findings.join(" ")).toMatch(/on-target effect/);
  });
});
