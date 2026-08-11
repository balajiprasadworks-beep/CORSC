import { describe, expect, it } from "vitest";

import {
  GRADE_INDETERMINATE,
  GRADE_MILD,
  GRADE_MODERATE,
  GRADE_NONE,
  GRADE_SEVERE,
  GRADE_VERY_SEVERE,
  glsRelativeFall,
  gradeCTRCD,
  isWorse,
  worstGrade,
} from "@/lib/ctrcd";

describe("glsRelativeFall", () => {
  it("treats GLS as a magnitude, so -20% to -16% is a 20% relative fall", () => {
    expect(glsRelativeFall(-20, -16)).toBe(20);
  });

  it("gives the same answer when the values are entered without signs", () => {
    expect(glsRelativeFall(20, 16)).toBe(20);
  });

  it("returns a negative fall when strain improves", () => {
    expect(glsRelativeFall(-16, -20)).toBe(-25);
  });

  it("returns null when either value is missing", () => {
    expect(glsRelativeFall(-20, null)).toBeNull();
    expect(glsRelativeFall("", -16)).toBeNull();
  });
});

describe("asymptomatic grading", () => {
  it("grades a normal serial echo as no dysfunction", () => {
    const result = gradeCTRCD({ baselineLVEF: 62, currentLVEF: 60 });
    expect(result.grade).toBe(GRADE_NONE);
    expect(result.present).toBe(false);
  });

  it("grades LVEF below 40% as severe", () => {
    const result = gradeCTRCD({ baselineLVEF: 60, currentLVEF: 35 });
    expect(result.grade).toBe(GRADE_SEVERE);
    expect(result.symptomatic).toBe(false);
    expect(result.label).toBe("Severe CTRCD (asymptomatic)");
  });

  it("grades a fall of at least 10 points into the 40-49 band as moderate", () => {
    const result = gradeCTRCD({ baselineLVEF: 62, currentLVEF: 47 });
    expect(result.grade).toBe(GRADE_MODERATE);
    expect(result.evidence.lvefDrop).toBe(15);
  });

  it("treats exactly 10 points to exactly 49% as moderate", () => {
    expect(gradeCTRCD({ baselineLVEF: 59, currentLVEF: 49 }).grade).toBe(GRADE_MODERATE);
  });

  it("grades a fall under 10 points into 40-49 as moderate when strain supports it", () => {
    const result = gradeCTRCD({
      baselineLVEF: 54,
      currentLVEF: 47,
      baselineGLS: -20,
      currentGLS: -16,
    });
    expect(result.grade).toBe(GRADE_MODERATE);
  });

  it("grades a fall under 10 points into 40-49 as moderate when biomarkers support it", () => {
    const result = gradeCTRCD({ baselineLVEF: 54, currentLVEF: 47, biomarkerRise: true });
    expect(result.grade).toBe(GRADE_MODERATE);
  });

  it("refuses to grade a small fall into 40-49 with no supporting evidence", () => {
    const result = gradeCTRCD({ baselineLVEF: 54, currentLVEF: 47 });
    expect(result.grade).toBe(GRADE_INDETERMINATE);
    expect(result.unresolved).toBe(true);
    expect(result.present).toBe(false);
  });

  it("grades preserved LVEF with a GLS fall over 15% as mild", () => {
    const result = gradeCTRCD({
      baselineLVEF: 62,
      currentLVEF: 58,
      baselineGLS: -20,
      currentGLS: -16,
    });
    expect(result.grade).toBe(GRADE_MILD);
  });

  it("does not call mild CTRCD when the GLS fall is exactly 15%", () => {
    const result = gradeCTRCD({
      baselineLVEF: 62,
      currentLVEF: 58,
      baselineGLS: -20,
      currentGLS: -17,
    });
    expect(result.evidence.glsRelativeFall).toBe(15);
    expect(result.grade).toBe(GRADE_NONE);
  });

  it("grades preserved LVEF with a biomarker rise alone as mild", () => {
    const result = gradeCTRCD({ baselineLVEF: 62, currentLVEF: 60, biomarkerRise: true });
    expect(result.grade).toBe(GRADE_MILD);
  });

  it("accepts a pre-computed relative GLS fall when strain values are not held", () => {
    const result = gradeCTRCD({ baselineLVEF: 62, currentLVEF: 58, glsRelativeFall: 18 });
    expect(result.grade).toBe(GRADE_MILD);
  });
});

describe("missing data", () => {
  it("cannot confirm a new fall without a baseline, and says so", () => {
    const result = gradeCTRCD({ currentLVEF: 45 });
    expect(result.grade).toBe(GRADE_INDETERMINATE);
    expect(result.criteria[0]).toMatch(/no baseline/i);
  });

  it("still grades LVEF under 40% as severe without a baseline", () => {
    expect(gradeCTRCD({ currentLVEF: 32 }).grade).toBe(GRADE_SEVERE);
  });

  it("can still reach mild from strain alone when no LVEF is recorded", () => {
    const result = gradeCTRCD({ baselineLVEF: 60, glsRelativeFall: 22 });
    expect(result.grade).toBe(GRADE_MILD);
  });

  it("reports no dysfunction when nothing at all has been measured", () => {
    expect(gradeCTRCD({}).grade).toBe(GRADE_NONE);
  });
});

describe("symptomatic grading", () => {
  it("grades hospitalisation for heart failure as severe even with preserved LVEF", () => {
    const result = gradeCTRCD({ baselineLVEF: 60, currentLVEF: 58, hfStatus: "severe" });
    expect(result.grade).toBe(GRADE_SEVERE);
    expect(result.symptomatic).toBe(true);
    expect(result.label).toBe("Severe CTRCD (symptomatic)");
  });

  it("grades inotrope or mechanical support as very severe", () => {
    const result = gradeCTRCD({ baselineLVEF: 60, currentLVEF: 42, hfStatus: "verySevere" });
    expect(result.grade).toBe(GRADE_VERY_SEVERE);
  });

  it("grades outpatient diuretic intensification as moderate", () => {
    const result = gradeCTRCD({ baselineLVEF: 60, currentLVEF: 58, hfStatus: "moderate" });
    expect(result.grade).toBe(GRADE_MODERATE);
  });

  it("takes the worse of the symptomatic and measured grades", () => {
    // Mild symptoms, but the ejection fraction is severe.
    const result = gradeCTRCD({ baselineLVEF: 60, currentLVEF: 30, hfStatus: "mild" });
    expect(result.grade).toBe(GRADE_SEVERE);
  });

  it("distinguishes two patients with the same ejection fraction by symptoms", () => {
    const well = gradeCTRCD({ baselineLVEF: 60, currentLVEF: 45, hfStatus: "none" });
    const unwell = gradeCTRCD({ baselineLVEF: 60, currentLVEF: 45, hfStatus: "severe" });
    expect(well.grade).toBe(GRADE_MODERATE);
    expect(unwell.grade).toBe(GRADE_SEVERE);
    expect(well.management).not.toEqual(unwell.management);
  });
});

describe("grade ordering", () => {
  it("ranks severity ascending", () => {
    expect(isWorse(GRADE_SEVERE, GRADE_MODERATE)).toBe(true);
    expect(isWorse(GRADE_MILD, GRADE_MODERATE)).toBe(false);
  });

  it("ranks an ungradeable result above mild, so it is not dismissed", () => {
    expect(isWorse(GRADE_INDETERMINATE, GRADE_MILD)).toBe(true);
  });

  it("picks the worst of a set", () => {
    expect(worstGrade([GRADE_NONE, GRADE_MODERATE, GRADE_MILD])).toBe(GRADE_MODERATE);
    expect(worstGrade([])).toBe(GRADE_NONE);
  });
});

describe("output shape", () => {
  it("always explains which criterion fired", () => {
    const result = gradeCTRCD({ baselineLVEF: 62, currentLVEF: 47 });
    expect(result.criteria.length).toBeGreaterThan(0);
    expect(result.criteria[0]).toContain("62");
    expect(result.criteria[0]).toContain("47");
  });

  it("carries management guidance for every abnormal grade", () => {
    [GRADE_MILD, GRADE_MODERATE, GRADE_SEVERE].forEach((expected) => {
      const map = {
        [GRADE_MILD]: { baselineLVEF: 60, currentLVEF: 58, biomarkerRise: true },
        [GRADE_MODERATE]: { baselineLVEF: 60, currentLVEF: 45 },
        [GRADE_SEVERE]: { baselineLVEF: 60, currentLVEF: 35 },
      };
      const result = gradeCTRCD(map[expected]);
      expect(result.grade).toBe(expected);
      expect(result.management.length).toBeGreaterThan(0);
    });
  });
});
