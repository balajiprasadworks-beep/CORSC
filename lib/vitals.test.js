import { describe, expect, it } from "vitest";

import {
  bmiCategory,
  bpGrade,
  calcBMI,
  calcBSA,
  calcWeightLossPercent,
  deriveVitals,
  num,
  pulseGrade,
  spo2Grade,
  weightLossInterpretation,
} from "@/lib/vitals";

describe("num", () => {
  it("parses plain numbers and numeric strings", () => {
    expect(num(42)).toBe(42);
    expect(num("42")).toBe(42);
    expect(num("42.5")).toBe(42.5);
    expect(num("-20")).toBe(-20);
  });

  it("parses a number carrying a unit", () => {
    expect(num("45%")).toBe(45);
    expect(num("128 mmHg")).toBe(128);
  });

  it("returns null for text with no digits, rather than zero", () => {
    // The previous implementation stripped non-numeric characters and parsed
    // the remainder, so "pending" in an LVEF field became an ejection fraction
    // of 0 and graded as severe dysfunction.
    expect(num("pending")).toBeNull();
    expect(num("not elevated")).toBeNull();
    expect(num("awaited")).toBeNull();
  });

  it("returns null for empty and absent values", () => {
    expect(num("")).toBeNull();
    expect(num(null)).toBeNull();
    expect(num(undefined)).toBeNull();
  });

  it("takes the first number rather than concatenating digits", () => {
    expect(num("128/82")).toBe(128);
  });

  it("preserves a legitimate zero", () => {
    expect(num(0)).toBe(0);
    expect(num("0")).toBe(0);
  });

  it("rejects non-finite numbers", () => {
    expect(num(NaN)).toBeNull();
    expect(num(Infinity)).toBeNull();
  });
});

describe("body measurements", () => {
  it("computes BMI to one decimal place", () => {
    expect(calcBMI(170, 72)).toBe(24.9);
  });

  it("computes body surface area by Mosteller", () => {
    expect(calcBSA(170, 72)).toBe(1.84);
  });

  it("returns null when height or weight is missing", () => {
    expect(calcBMI(null, 72)).toBeNull();
    expect(calcBSA(170, null)).toBeNull();
  });

  it("categorises BMI, marking obesity as a scored risk factor", () => {
    expect(bmiCategory(17).label).toBe("Underweight");
    expect(bmiCategory(22).tone).toBe("ok");
    expect(bmiCategory(27).label).toBe("Overweight");
    expect(bmiCategory(32).tone).toBe("danger");
  });
});

describe("weight change", () => {
  it("reports loss as a positive percentage", () => {
    expect(calcWeightLossPercent(80, 72)).toBe(10);
  });

  it("reports gain as a negative percentage", () => {
    expect(calcWeightLossPercent(70, 77)).toBe(-10);
  });

  it("escalates interpretation across the clinical thresholds", () => {
    expect(weightLossInterpretation(2).tone).toBe("ok");
    expect(weightLossInterpretation(7).tone).toBe("warning");
    expect(weightLossInterpretation(12).tone).toBe("danger");
  });

  it("treats significant gain as a fluid-retention prompt", () => {
    const result = weightLossInterpretation(-6);
    expect(result.label).toBe("Weight gain");
    expect(result.detail).toMatch(/fluid retention/i);
  });
});

describe("blood pressure grading", () => {
  it("grades across the ESC hypertension bands", () => {
    expect(bpGrade(120, 78).tone).toBe("ok");
    expect(bpGrade(134, 86).short).toBe("High-normal");
    expect(bpGrade(145, 92).short).toBe("Grade 1");
    expect(bpGrade(165, 102).short).toBe("Grade 2");
    expect(bpGrade(185, 115).short).toBe("Grade 3");
  });

  it("grades on whichever of the two readings is worse", () => {
    expect(bpGrade(125, 105).short).toBe("Grade 2");
  });

  it("flags hypotension", () => {
    expect(bpGrade(92, 60).short).toBe("Low");
  });

  it("returns null when nothing is recorded", () => {
    expect(bpGrade(null, null)).toBeNull();
  });
});

describe("saturation and pulse", () => {
  it("grades oxygen saturation", () => {
    expect(spo2Grade(98).tone).toBe("ok");
    expect(spo2Grade(92).tone).toBe("warning");
    expect(spo2Grade(87).tone).toBe("danger");
  });

  it("grades pulse in both directions", () => {
    expect(pulseGrade(72).tone).toBe("ok");
    expect(pulseGrade(110).label).toBe("Tachycardia");
    expect(pulseGrade(130).tone).toBe("danger");
    expect(pulseGrade(45).label).toBe("Bradycardia");
  });
});

describe("deriveVitals", () => {
  it("derives every value from one vitals block", () => {
    const derived = deriveVitals(
      { height: 170, weight: 72, sbp: 128, dbp: 82, pulse: 78, spo2: 98 },
      80
    );
    expect(derived.bmi).toBe(24.9);
    expect(derived.bsa).toBe(1.84);
    expect(derived.weightLossPercent).toBe(10);
    expect(derived.bp.tone).toBe("ok");
  });

  it("prefers the encounter reference weight over the registration baseline", () => {
    const derived = deriveVitals({ weight: 72, referenceWeight: 76 }, 80);
    expect(derived.referenceWeight).toBe(76);
  });

  it("falls back to the registration baseline when no reference is set", () => {
    expect(deriveVitals({ weight: 72 }, 80).referenceWeight).toBe(80);
  });

  it("carries the baseline height forward when no encounter height is recorded", () => {
    const derived = deriveVitals({ weight: 72 }, 80, 170);
    expect(derived.height).toBe(170);
    expect(derived.bmi).toBe(24.9);
  });

  it("prefers an explicit encounter height correction over the carried-forward baseline", () => {
    const derived = deriveVitals({ height: 165, weight: 72 }, 80, 170);
    expect(derived.height).toBe(165);
  });

  it("has no height at all when neither the encounter nor the baseline recorded one", () => {
    expect(deriveVitals({ weight: 72 }, 80, undefined).height).toBeNull();
  });
});
