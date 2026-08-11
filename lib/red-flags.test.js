import { describe, expect, it } from "vitest";

import { assessCtrCvt } from "@/lib/ctrcvt";
import { LEVELS, assessRedFlags, highestLevel } from "@/lib/red-flags";

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

function assess({ record = patient(), encounter = { vitals: {}, symptomDetail: {} }, troponin = {}, ecg = {}, symptoms = [], currentLVEF = null } = {}) {
  const ctrCvt = assessCtrCvt({ patient: record, encounter, troponin, ecg, symptoms, currentLVEF });
  return assessRedFlags({ patient: record, encounter, ctrCvt, troponin, ecg, symptoms });
}

describe("the hierarchy", () => {
  it("is green when nothing is wrong", () => {
    const result = assess({ encounter: { vitals: { sbp: 118, dbp: 74 }, symptomDetail: {} } });
    expect(result.level).toBe("green");
    expect(result.flags).toHaveLength(0);
    expect(result.summary).toMatch(/No red flag/);
  });

  it("ranks red above orange above yellow", () => {
    expect(highestLevel(["yellow", "orange"])).toBe("orange");
    expect(highestLevel(["orange", "red", "yellow"])).toBe("red");
    expect(highestLevel([])).toBe("green");
  });

  it("sorts the most serious flag first", () => {
    const result = assess({
      record: patient({ therapy: ["ici"] }),
      troponin: { newRise: true, recorded: true, label: "Elevated at 70 ng/L" },
      symptoms: ["Dyspnoea"],
    });
    expect(result.flags[0].level).toBe("red");
  });

  it("exposes counts by level", () => {
    const result = assess({ symptoms: ["Syncope", "Dyspnoea"] });
    expect(result.counts.red).toBeGreaterThan(0);
    expect(result.counts.yellow).toBeGreaterThan(0);
  });

  it("defines all four levels with a heading and a tone", () => {
    ["red", "orange", "yellow", "green"].forEach((id) => {
      expect(LEVELS[id].heading).toBeTruthy();
      expect(LEVELS[id].tone).toBeTruthy();
    });
  });
});

describe("red-level triggers", () => {
  it("fires for checkpoint inhibitor myocarditis", () => {
    const result = assess({
      record: patient({ therapy: ["ici"] }),
      troponin: { newRise: true, recorded: true, label: "Elevated at 70 ng/L" },
    });
    const flag = result.flags.find((f) => f.id === "ici-myocarditis");
    expect(flag.level).toBe("red");
    expect(flag.action).toMatch(/Withhold the next immunotherapy dose/);
    expect(flag.why).toMatch(/normal echocardiogram does not exclude it/);
  });

  it("fires for syncope", () => {
    const result = assess({ symptoms: ["Syncope"] });
    expect(result.flags.find((f) => f.id === "symptom-syncope").level).toBe("red");
  });

  it("fires for chest pain with a troponin rise, as an acute coronary syndrome", () => {
    const result = assess({ symptoms: ["Chest pain"], troponin: { newRise: true, recorded: true, label: "Elevated at 90 ng/L" } });
    const flag = result.flags.find((f) => f.id === "acs");
    expect(flag.level).toBe("red");
    expect(flag.action).toMatch(/acute coronary syndrome/i);
  });

  it("does not also raise the plain chest-pain flag when the acute coronary flag has fired", () => {
    const result = assess({ symptoms: ["Chest pain"], troponin: { newRise: true, recorded: true } });
    expect(result.flags.filter((f) => f.id === "symptom-chest-pain")).toHaveLength(0);
  });

  it("fires for grade 3 hypertension", () => {
    const result = assess({ encounter: { vitals: { sbp: 190, dbp: 115 }, symptomDetail: {} } });
    expect(result.flags.find((f) => f.id === "severe-hypertension").level).toBe("red");
  });

  it("fires for very severe cardiac dysfunction", () => {
    const record = patient({ baselineLVEF: 60 });
    const ctrCvt = assessCtrCvt({
      patient: record,
      encounter: { vitals: {}, hfStatus: "verySevere", symptomDetail: {} },
      currentLVEF: 30,
    });
    const result = assessRedFlags({ patient: record, encounter: { vitals: {}, symptomDetail: {} }, ctrCvt });
    expect(result.flags.find((f) => f.id === "ctrcd-very-severe").level).toBe("red");
  });
});

describe("orange-level triggers", () => {
  it("fires for a troponin rise on a non-checkpoint therapy", () => {
    const result = assess({ troponin: { newRise: true, recorded: true, label: "Elevated at 40 ng/L", detail: "URL 14 ng/L" } });
    const flag = result.flags.find((f) => f.id === "troponin-rise");
    expect(flag.level).toBe("orange");
    expect(flag.action).toMatch(/24 to 48 hours/);
  });

  it("does not double-report a troponin rise on a checkpoint inhibitor", () => {
    const result = assess({ record: patient({ therapy: ["ici"] }), troponin: { newRise: true, recorded: true } });
    expect(result.flags.find((f) => f.id === "troponin-rise")).toBeUndefined();
    expect(result.flags.find((f) => f.id === "ici-myocarditis")).toBeDefined();
  });

  it("fires for an actionable QTc", () => {
    const result = assess({ ecg: { actionable: true, prolonged: true, reasons: ["QTc 512 ms is at or above the 500 ms action threshold"] } });
    expect(result.flags.find((f) => f.id === "qtc").level).toBe("orange");
  });

  it("fires for moderate cardiac dysfunction, the grade at which therapy decisions change", () => {
    const record = patient({ baselineLVEF: 62 });
    const ctrCvt = assessCtrCvt({ patient: record, encounter: { vitals: {}, symptomDetail: {} }, currentLVEF: 45 });
    const result = assessRedFlags({ patient: record, encounter: { vitals: {}, symptomDetail: {} }, ctrCvt });
    const flag = result.flags.find((f) => f.id === "ctrcd-moderate");
    expect(flag.level).toBe("orange");
    expect(flag.action).toMatch(/Discuss interruption/);
  });

  it("fires for orthopnoea", () => {
    expect(assess({ symptoms: ["Orthopnoea"] }).flags.find((f) => f.id === "symptom-orthopnoea").level).toBe("orange");
  });
});

describe("yellow-level triggers", () => {
  it("fires when dysfunction cannot be graded, rather than reporting no dysfunction", () => {
    const record = patient({ baselineLVEF: "" });
    const ctrCvt = assessCtrCvt({ patient: record, encounter: { vitals: {}, symptomDetail: {} }, currentLVEF: 45 });
    const result = assessRedFlags({ patient: record, encounter: { vitals: {}, symptomDetail: {} }, ctrCvt });
    const flag = result.flags.find((f) => f.id === "ctrcd-indeterminate");
    expect(flag.level).toBe("yellow");
    expect(flag.why).toMatch(/more dangerous failure/);
  });

  it("fires for a prolonged but sub-threshold QTc", () => {
    const result = assess({ ecg: { actionable: false, prolonged: true, reasons: ["QTc 468 ms is above the upper limit of normal"] } });
    expect(result.flags.find((f) => f.id === "qtc-prolonged").level).toBe("yellow");
  });

  it("fires for reduced exercise tolerance, which is easily attributed to the cancer instead", () => {
    const result = assess({ symptoms: ["Reduced exercise tolerance"] });
    const flag = result.flags.find((f) => f.id === "symptom-reduced-exercise-tolerance");
    expect(flag.level).toBe("yellow");
    expect(flag.why).toMatch(/attributed to the cancer/);
  });

  it("separates pedal oedema from syncope", () => {
    expect(assess({ symptoms: ["Pedal oedema"] }).level).toBe("yellow");
    expect(assess({ symptoms: ["Syncope"] }).level).toBe("red");
  });
});

describe("every flag is auditable", () => {
  it("carries a source, a reason and an action", () => {
    const result = assess({
      symptoms: ["Chest pain", "Syncope", "Pedal oedema"],
      troponin: { newRise: true, recorded: true, label: "Elevated" },
      ecg: { actionable: true, reasons: ["QTc 510 ms"] },
      encounter: { vitals: { sbp: 190, dbp: 115 }, symptomDetail: {} },
    });
    expect(result.flags.length).toBeGreaterThan(3);
    result.flags.forEach((flag) => {
      expect(flag.why, flag.id).toBeTruthy();
      expect(flag.action, flag.id).toBeTruthy();
      expect(flag.provenance.citation, flag.id).toBeTruthy();
    });
  });

  it("quotes the recorded symptom detail in the finding", () => {
    const result = assess({
      symptoms: ["Syncope"],
      encounter: { vitals: {}, symptomDetail: { Syncope: { severity: "Severe", duration: "2 days" } } },
    });
    expect(result.flags.find((f) => f.id === "symptom-syncope").finding).toBe("Syncope (Severe, 2 days)");
  });
});
