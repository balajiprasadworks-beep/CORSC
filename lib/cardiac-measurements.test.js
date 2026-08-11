import { describe, expect, it } from "vitest";

import {
  QTC_ACTION,
  ecgQTc,
  hasBiomarkerRise,
  interpretECG,
  interpretNatriuretic,
  interpretQTc,
  interpretTroponin,
  ntprobnpRuleIn,
  qtcBazett,
  qtcFridericia,
  troponinURL,
} from "@/lib/cardiac-measurements";

describe("troponin reference limits", () => {
  it("uses the sex-specific limit when sex is known", () => {
    expect(troponinURL({ assayId: "hs-cTnT", sex: "Male" })).toBe(22);
    expect(troponinURL({ assayId: "hs-cTnT", sex: "Female" })).toBe(14);
  });

  it("falls back to the overall limit when sex is not recorded", () => {
    expect(troponinURL({ assayId: "hs-cTnI-abbott" })).toBe(26);
  });

  it("prefers an explicitly entered local limit over the published default", () => {
    expect(troponinURL({ assayId: "hs-cTnT", sex: "Male", localURL: 19 })).toBe(19);
  });
});

describe("troponin interpretation", () => {
  it("flags a value above the reference limit", () => {
    const result = interpretTroponin({ value: 45, assayId: "hs-cTnT", sex: "Male" });
    expect(result.aboveURL).toBe(true);
    expect(result.newRise).toBe(true);
  });

  it("does not flag a value inside the reference range", () => {
    const result = interpretTroponin({ value: 8, assayId: "hs-cTnT", sex: "Female" });
    expect(result.newRise).toBe(false);
    expect(result.tone).toBe("ok");
  });

  it("uses the sex-specific limit, so 18 ng/L differs by sex on the same assay", () => {
    expect(interpretTroponin({ value: 18, assayId: "hs-cTnT", sex: "Male" }).aboveURL).toBe(false);
    expect(interpretTroponin({ value: 18, assayId: "hs-cTnT", sex: "Female" }).aboveURL).toBe(true);
  });

  it("detects a doubling from baseline even while still inside the range", () => {
    const result = interpretTroponin({ value: 12, baseline: 5, assayId: "hs-cTnT", sex: "Male" });
    expect(result.aboveURL).toBe(false);
    expect(result.roseFromBaseline).toBe(true);
    expect(result.newRise).toBe(true);
  });

  it("does not treat a small fluctuation as a rise", () => {
    const result = interpretTroponin({ value: 7, baseline: 6, assayId: "hs-cTnT", sex: "Male" });
    expect(result.newRise).toBe(false);
  });

  it("reports nothing recorded when no value is entered", () => {
    expect(interpretTroponin({ assayId: "hs-cTnT" }).recorded).toBe(false);
  });

  it("never reads free text as a result, unlike the previous keyword matcher", () => {
    // "not elevated" used to match the substring "elev" and flag a false positive.
    const result = interpretTroponin({ value: "not elevated", assayId: "hs-cTnT", sex: "Male" });
    expect(result.recorded).toBe(false);
    expect(result.newRise).toBe(false);
  });
});

describe("natriuretic peptide interpretation", () => {
  it("applies the non-acute rule-out threshold for NT-proBNP", () => {
    expect(interpretNatriuretic({ value: 90 }).aboveThreshold).toBe(false);
    expect(interpretNatriuretic({ value: 300 }).aboveThreshold).toBe(true);
  });

  it("uses the lower threshold for BNP", () => {
    expect(interpretNatriuretic({ value: 40, peptide: "bnp" }).aboveThreshold).toBe(true);
  });

  it("stratifies the rule-in threshold by age", () => {
    expect(ntprobnpRuleIn(45)).toBe(450);
    expect(ntprobnpRuleIn(60)).toBe(900);
    expect(ntprobnpRuleIn(80)).toBe(1800);
  });

  it("marks a value strongly elevated only above the age-adjusted threshold", () => {
    expect(interpretNatriuretic({ value: 600, age: 45 }).stronglyElevated).toBe(true);
    expect(interpretNatriuretic({ value: 600, age: 80 }).stronglyElevated).toBe(false);
  });

  it("detects a doubling from baseline", () => {
    const result = interpretNatriuretic({ value: 100, baseline: 40 });
    expect(result.aboveThreshold).toBe(false);
    expect(result.newRise).toBe(true);
  });
});

describe("QTc correction", () => {
  it("computes Fridericia from QT and heart rate", () => {
    // QT 400 ms at 60 bpm: RR = 1 s, so QTcF equals QT.
    expect(qtcFridericia(400, 60)).toBe(400);
  });

  it("corrects less aggressively than Bazett at tachycardic rates", () => {
    const fridericia = qtcFridericia(360, 100);
    const bazett = qtcBazett(360, 100);
    expect(bazett).toBeGreaterThan(fridericia);
  });

  it("accepts an RR interval directly", () => {
    expect(qtcFridericia(400, null, 1)).toBe(400);
  });

  it("returns null when inputs are incomplete", () => {
    expect(qtcFridericia(400, null)).toBeNull();
    expect(qtcFridericia(null, 60)).toBeNull();
  });
});

describe("QTc interpretation", () => {
  it("applies sex-specific upper limits of normal", () => {
    expect(interpretQTc({ qtc: 455, sex: "Male" }).prolonged).toBe(true);
    expect(interpretQTc({ qtc: 455, sex: "Female" }).prolonged).toBe(false);
  });

  it("treats 500 ms as the action threshold", () => {
    const result = interpretQTc({ qtc: QTC_ACTION, sex: "Male" });
    expect(result.actionable).toBe(true);
    expect(result.reasons[0]).toContain("500");
  });

  it("fires on a 60 ms rise from baseline even when the absolute value looks acceptable", () => {
    const result = interpretQTc({ qtc: 470, baselineQtc: 400, sex: "Male" });
    expect(result.value).toBeLessThan(QTC_ACTION);
    expect(result.actionable).toBe(true);
    expect(result.reasons[0]).toContain("risen 70 ms");
  });

  it("does not fire on a rise under 60 ms", () => {
    expect(interpretQTc({ qtc: 440, baselineQtc: 400, sex: "Male" }).actionable).toBe(false);
  });

  it("reports nothing recorded when no value is available", () => {
    expect(interpretQTc({ sex: "Male" }).recorded).toBe(false);
  });
});

describe("structured ECG", () => {
  it("derives QTc from the interval and rate when none is entered", () => {
    expect(ecgQTc({ qt: 400, rate: 60 })).toBe(400);
  });

  it("prefers an explicitly entered QTc over the derived value", () => {
    expect(ecgQTc({ qtc: 480, qt: 400, rate: 60 })).toBe(480);
  });

  it("records which correction produced the value", () => {
    expect(interpretECG({ ecg: { qt: 400, rate: 60 } }).source).toBe("Fridericia");
    expect(interpretECG({ ecg: { qtc: 470 } }).source).toBe("entered");
  });

  it("carries rate and rhythm through for the report", () => {
    const result = interpretECG({ ecg: { qt: 380, rate: 88, rhythm: "Sinus tachycardia" }, sex: "Female" });
    expect(result.rate).toBe(88);
    expect(result.rhythm).toBe("Sinus tachycardia");
  });
});

describe("biomarker rise summary", () => {
  it("is true when troponin has risen", () => {
    const troponin = interpretTroponin({ value: 45, assayId: "hs-cTnT", sex: "Male" });
    expect(hasBiomarkerRise({ troponin })).toBe(true);
  });

  it("is true when the natriuretic peptide has risen", () => {
    const natriuretic = interpretNatriuretic({ value: 300 });
    expect(hasBiomarkerRise({ natriuretic })).toBe(true);
  });

  it("is false when both are within range", () => {
    const troponin = interpretTroponin({ value: 6, assayId: "hs-cTnT", sex: "Male" });
    const natriuretic = interpretNatriuretic({ value: 80 });
    expect(hasBiomarkerRise({ troponin, natriuretic })).toBe(false);
  });

  it("is false when nothing is recorded", () => {
    expect(hasBiomarkerRise({})).toBe(false);
  });
});
