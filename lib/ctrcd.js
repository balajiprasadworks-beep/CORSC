/* =========================================================================
   Cancer therapy–related cardiac dysfunction (CTRCD).

   One definition for the whole application. Before this module the codebase
   carried four divergent thresholds (< 53% in one file, < 50% in three) and
   every one of them produced a bare boolean, which cannot express the grade
   that actually drives management.

   ESC 2022 grades CTRCD on two axes at once: severity, and whether the patient
   has heart-failure symptoms. Both are needed — the same ejection fraction in
   a breathless patient and a well patient carries different management.

   Asymptomatic
     Severe    new LVEF fall to < 40%
     Moderate  new LVEF fall >= 10 points landing in 40-49%
               OR new fall < 10 points landing in 40-49% WITH either a GLS
               relative fall > 15% or a new biomarker rise
     Mild      LVEF still >= 50% WITH a GLS relative fall > 15% and/or a new
               biomarker rise

   Symptomatic (graded by the treatment the heart failure demands)
     Very severe  inotropes, mechanical support, or transplant consideration
     Severe       hospitalisation for heart failure
     Moderate     outpatient intensification of diuretic and heart-failure therapy
     Mild         symptoms present, no intensification required

   Where the inputs cannot support a conclusion — most often a missing baseline
   LVEF — the module says so rather than returning "no dysfunction". A silent
   false negative is the more dangerous failure here.
   ========================================================================= */

import { num } from "@/lib/vitals";

export const GRADE_NONE = "none";
export const GRADE_MILD = "mild";
export const GRADE_MODERATE = "moderate";
export const GRADE_SEVERE = "severe";
export const GRADE_VERY_SEVERE = "very-severe";
export const GRADE_INDETERMINATE = "indeterminate";

/** Ascending clinical seriousness. Indeterminate deliberately outranks mild. */
export const GRADE_ORDER = [
  GRADE_NONE,
  GRADE_MILD,
  GRADE_INDETERMINATE,
  GRADE_MODERATE,
  GRADE_SEVERE,
  GRADE_VERY_SEVERE,
];

export const GRADE_LABELS = {
  [GRADE_NONE]: "No CTRCD",
  [GRADE_MILD]: "Mild CTRCD",
  [GRADE_MODERATE]: "Moderate CTRCD",
  [GRADE_SEVERE]: "Severe CTRCD",
  [GRADE_VERY_SEVERE]: "Very severe CTRCD",
  [GRADE_INDETERMINATE]: "CTRCD cannot be graded",
};

export const GRADE_TONES = {
  [GRADE_NONE]: "ok",
  [GRADE_MILD]: "warning",
  [GRADE_MODERATE]: "danger",
  [GRADE_SEVERE]: "danger",
  [GRADE_VERY_SEVERE]: "danger",
  [GRADE_INDETERMINATE]: "warning",
};

/**
 * Heart-failure symptom severity, expressed as the treatment the symptoms
 * demand. This mirrors the guideline wording, which grades symptomatic CTRCD
 * by therapeutic response rather than by NYHA class alone.
 */
export const HF_STATUS = {
  none: { id: "none", label: "No heart-failure symptoms", grade: GRADE_NONE },
  mild: { id: "mild", label: "Symptoms, no change in therapy needed", grade: GRADE_MILD },
  moderate: { id: "moderate", label: "Outpatient diuretic or HF therapy intensified", grade: GRADE_MODERATE },
  severe: { id: "severe", label: "Hospitalised for heart failure", grade: GRADE_SEVERE },
  verySevere: { id: "verySevere", label: "Inotropes, mechanical support or transplant considered", grade: GRADE_VERY_SEVERE },
};

export const HF_STATUS_OPTIONS = Object.values(HF_STATUS);

export function isWorse(a, b) {
  return GRADE_ORDER.indexOf(a) > GRADE_ORDER.indexOf(b);
}

export function worstGrade(grades) {
  return (grades || []).reduce((worst, grade) => (isWorse(grade, worst) ? grade : worst), GRADE_NONE);
}

/**
 * Relative fall in global longitudinal strain, as a positive percentage.
 *
 * GLS is conventionally negative and deterioration is a fall in magnitude
 * (-20% to -16% is a 20% relative decline), so both values are compared as
 * absolute magnitudes.
 */
export function glsRelativeFall(baseline, current) {
  const base = num(baseline);
  const now = num(current);
  if (base === null || now === null) return null;
  const magnitude = Math.abs(base);
  if (magnitude === 0) return null;
  return Number((((magnitude - Math.abs(now)) / magnitude) * 100).toFixed(1));
}

export const GLS_FALL_THRESHOLD = 15;

/**
 * Grades cardiac dysfunction from the measurements available.
 *
 * @param {object} input
 * @param {number|string} input.baselineLVEF   pre-treatment ejection fraction
 * @param {number|string} input.currentLVEF    most recent ejection fraction
 * @param {number|string} [input.baselineGLS]  pre-treatment strain
 * @param {number|string} [input.currentGLS]   most recent strain
 * @param {number|string} [input.glsRelativeFall] pre-computed relative fall, if strain values are not held
 * @param {boolean} [input.biomarkerRise]      new troponin or natriuretic peptide rise
 * @param {string} [input.hfStatus]            key of HF_STATUS
 */
export function gradeCTRCD(input = {}) {
  const baseline = num(input.baselineLVEF);
  const current = num(input.currentLVEF);
  const hfStatus = HF_STATUS[input.hfStatus] || HF_STATUS.none;
  const symptomatic = hfStatus.id !== "none";
  const biomarkerRise = Boolean(input.biomarkerRise);

  const glsFall =
    input.glsRelativeFall !== undefined && input.glsRelativeFall !== null && input.glsRelativeFall !== ""
      ? num(input.glsRelativeFall)
      : glsRelativeFall(input.baselineGLS, input.currentGLS);
  const glsDrop = glsFall !== null && glsFall > GLS_FALL_THRESHOLD;

  const criteria = [];
  const evidence = {
    baselineLVEF: baseline,
    currentLVEF: current,
    lvefDrop: baseline !== null && current !== null ? Number((baseline - current).toFixed(1)) : null,
    glsRelativeFall: glsFall,
    glsDrop,
    biomarkerRise,
    symptomatic,
    hfStatus: hfStatus.id,
  };

  /* --- the symptomatic axis, graded by the therapy the symptoms demand --- */
  let symptomaticGrade = GRADE_NONE;
  if (symptomatic) {
    symptomaticGrade = hfStatus.grade;
    criteria.push(`Heart-failure symptoms: ${hfStatus.label.toLowerCase()}`);
  }

  /* --- the asymptomatic (measurement) axis --- */
  let measuredGrade = GRADE_NONE;

  if (current === null) {
    // Nothing measured this encounter. Strain or biomarkers alone can still
    // establish mild dysfunction, but nothing higher can be excluded.
    if (glsDrop || biomarkerRise) {
      measuredGrade = GRADE_MILD;
      criteria.push(mildCriterionText(glsDrop, biomarkerRise, glsFall));
    }
  } else if (baseline === null) {
    // Without a baseline no fall can be called "new", so a low reading cannot
    // be attributed to therapy. Say that rather than implying it is safe.
    if (current < 40) {
      measuredGrade = GRADE_SEVERE;
      criteria.push(`LVEF ${current}% is below 40%`);
    } else if (current < 50) {
      measuredGrade = GRADE_INDETERMINATE;
      criteria.push(`LVEF ${current}% is in the 40-49% band, but no baseline is recorded so a new fall cannot be confirmed`);
    } else if (glsDrop || biomarkerRise) {
      measuredGrade = GRADE_MILD;
      criteria.push(mildCriterionText(glsDrop, biomarkerRise, glsFall));
    }
  } else {
    const drop = baseline - current;

    if (current < 40) {
      measuredGrade = GRADE_SEVERE;
      criteria.push(`LVEF has fallen ${drop.toFixed(0)} points from ${baseline}% to ${current}%, below 40%`);
    } else if (current < 50) {
      if (drop >= 10) {
        measuredGrade = GRADE_MODERATE;
        criteria.push(`LVEF has fallen ${drop.toFixed(0)} points from ${baseline}% to ${current}%, into the 40-49% band`);
      } else if (glsDrop || biomarkerRise) {
        measuredGrade = GRADE_MODERATE;
        criteria.push(
          `LVEF has fallen ${drop.toFixed(0)} points to ${current}% (40-49% band) with ${supportingText(glsDrop, biomarkerRise, glsFall)}`
        );
      } else {
        measuredGrade = GRADE_INDETERMINATE;
        criteria.push(
          `LVEF ${current}% sits in the 40-49% band but the fall from baseline is under 10 points and no strain or biomarker change supports it — repeat imaging and biomarkers to resolve`
        );
      }
    } else if (glsDrop || biomarkerRise) {
      measuredGrade = GRADE_MILD;
      criteria.push(mildCriterionText(glsDrop, biomarkerRise, glsFall));
    }
  }

  const grade = worstGrade([symptomaticGrade, measuredGrade]);

  return {
    grade,
    symptomatic,
    hfStatus: hfStatus.id,
    label: describe(grade, symptomatic),
    shortLabel: GRADE_LABELS[grade],
    tone: GRADE_TONES[grade],
    criteria,
    evidence,
    present: grade !== GRADE_NONE && grade !== GRADE_INDETERMINATE,
    /** True when the data is too thin to exclude dysfunction. */
    unresolved: grade === GRADE_INDETERMINATE,
    management: MANAGEMENT[grade] || [],
  };
}

function supportingText(glsDrop, biomarkerRise, glsFall) {
  if (glsDrop && biomarkerRise) return `a GLS relative fall of ${glsFall}% and a new biomarker rise`;
  if (glsDrop) return `a GLS relative fall of ${glsFall}%`;
  return "a new biomarker rise";
}

function mildCriterionText(glsDrop, biomarkerRise, glsFall) {
  return `Ejection fraction preserved, with ${supportingText(glsDrop, biomarkerRise, glsFall)}`;
}

function describe(grade, symptomatic) {
  if (grade === GRADE_NONE) return "No cardiac dysfunction detected";
  if (grade === GRADE_INDETERMINATE) return GRADE_LABELS[grade];
  return `${GRADE_LABELS[grade]} (${symptomatic ? "symptomatic" : "asymptomatic"})`;
}

/**
 * Management that follows from the grade. Deliberately phrased as prompts for
 * discussion rather than instructions — the decision to hold cancer therapy
 * belongs to the treating oncologist and cardio-oncologist together.
 */
export const MANAGEMENT = {
  [GRADE_MILD]: [
    "Continue cancer therapy with cardiology input.",
    "Start or optimise an ACE inhibitor or ARB and a beta-blocker.",
    "Repeat echocardiography with strain before the next scheduled cycle.",
  ],
  [GRADE_MODERATE]: [
    "Discuss interruption of cancer therapy with oncology before the next cycle.",
    "Start an ACE inhibitor or ARB and a beta-blocker unless contraindicated.",
    "Repeat echocardiography in three to four weeks.",
    "Refer to cardio-oncology.",
  ],
  [GRADE_SEVERE]: [
    "Interrupt cancer therapy pending cardio-oncology review.",
    "Start full guideline-directed heart-failure therapy.",
    "Urgent cardiology assessment; consider admission if symptomatic.",
    "Multidisciplinary discussion before any rechallenge.",
  ],
  [GRADE_VERY_SEVERE]: [
    "Stop cancer therapy.",
    "Admit for inotropic or mechanical circulatory support as required.",
    "Immediate cardiology and cardio-oncology involvement.",
  ],
  [GRADE_INDETERMINATE]: [
    "Repeat echocardiography with global longitudinal strain.",
    "Check troponin and natriuretic peptide.",
    "Record the pre-treatment ejection fraction if it can be retrieved, so later comparisons resolve.",
  ],
};
