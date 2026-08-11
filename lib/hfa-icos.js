/* =========================================================================
   HFA-ICOS baseline cardiovascular risk stratification.

   Two problems with the previous implementation are addressed here.

   First, one generic thirteen-item list was applied to all eight therapy
   classes, so a checkpoint-inhibitor patient and an anthracycline patient with
   identical ticks landed in identical categories. The published tool is
   therapy-specific. Each factor below therefore declares which therapies it
   applies to, and the proforma is assembled from the therapies actually
   planned.

   Second, the history section collected hypertension, dyslipidaemia, prior
   chest radiotherapy, arrhythmia, valvular disease and prior anthracycline
   exposure, and none of them reached the risk calculation - calcRisk() was
   only ever passed the four checkbox groups. The clinician ticked the box and
   the category did not move, which biased every category downward and thinned
   the surveillance schedule derived from it. Factors can now be satisfied
   either by an explicit tick or by data already recorded elsewhere, and the
   result records which.

   SCORING NOTE FOR CLINICAL REVIEW
   The categorisation algebra is unchanged from the original implementation:
   any very-high factor gives Very High, any high factor gives High, moderate
   factors score two or one point each, and two or more points escalate to
   High. The published HFA-ICOS proformas use their own per-therapy weightings.
   Every threshold used here is exported from SCORING below so it can be
   reviewed and adjusted in one place against the source proformas.
   ========================================================================= */

import { num } from "@/lib/vitals";

export const TIERS = {
  veryHigh: { id: "veryHigh", label: "Very high risk", weight: null, group: "veryHigh" },
  high: { id: "high", label: "High risk", weight: null, group: "high" },
  moderate2: { id: "moderate2", label: "Moderate risk", weight: 2, group: "m2" },
  moderate1: { id: "moderate1", label: "Moderate risk", weight: 1, group: "m1" },
};

/** Every threshold in one place, for clinical sign-off. */
export const SCORING = {
  pointsForHigh: 2,
  pointsForModerate: 1,
  borderlineLVEF: { min: 50, max: 54 },
  reducedLVEF: 50,
  elderly: 80,
  older: 65,
  anthracyclineHighDose: 250,
  obesityBMI: 30,
};

const ALL = "all";

/**
 * The full factor registry.
 *
 * `appliesTo` names the therapy classes for which the factor is scored.
 * `derive` reads data the clinician has already entered elsewhere, so the same
 * fact never has to be recorded twice.
 */
export const RISK_FACTORS = [
  /* ------------------------------------------------ established cardiac disease */
  {
    id: "vh1",
    tier: "veryHigh",
    label: "Pre-existing heart failure or LVEF < 50%",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.cardiovascular?.checks?.hf),
    derivedFrom: "Heart failure recorded in cardiovascular history",
  },
  {
    id: "vh2",
    tier: "veryHigh",
    label: "Known cardiomyopathy",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.cardiovascular?.checks?.cardiomyopathy),
    derivedFrom: "Cardiomyopathy recorded in cardiovascular history",
  },
  {
    id: "vh3",
    tier: "veryHigh",
    label: "Prior anthracycline- or trastuzumab-related cardiotoxicity",
    appliesTo: [ALL],
    derive: (p) => Boolean(String(p.history?.priorTreatment?.fields?.priorToxicity || "").trim()),
    derivedFrom: "Previous cardiotoxicity recorded in prior treatment history",
  },
  {
    id: "vh4",
    tier: "veryHigh",
    label: "Severe valvular heart disease",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.cardiovascular?.checks?.valve),
    derivedFrom: "Valvular heart disease recorded in cardiovascular history",
  },
  {
    id: "vh5",
    tier: "veryHigh",
    label: "Previous immune-related myocarditis",
    appliesTo: ["ici"],
  },
  {
    id: "vh6",
    tier: "veryHigh",
    label: "Previous arterial occlusive event on a BCR-ABL inhibitor",
    appliesTo: ["bcrabl"],
  },

  {
    id: "h1",
    tier: "high",
    label: "Baseline LVEF < 50%",
    appliesTo: [ALL],
    derive: (p) => {
      const lvef = num(p.baselineLVEF);
      return lvef !== null && lvef < SCORING.reducedLVEF;
    },
    derivedFrom: "Calculated from the recorded baseline LVEF",
  },
  {
    id: "h2",
    tier: "high",
    label: "Previous myocardial infarction or revascularisation",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.cardiovascular?.checks?.cad || p.history?.cardiovascular?.checks?.revasc),
    derivedFrom: "Coronary disease or revascularisation recorded in cardiovascular history",
  },
  {
    id: "h3",
    tier: "high",
    label: "Age ≥ 80 years",
    appliesTo: [ALL],
    derive: (p) => {
      const age = num(p.age);
      return age !== null && age >= SCORING.elderly;
    },
    derivedFrom: "Calculated from the recorded age",
  },
  {
    id: "h4",
    tier: "high",
    label: "Planned cumulative doxorubicin-equivalent dose ≥ 250 mg/m²",
    appliesTo: ["anthracycline"],
    derive: (p) => {
      const dose = num(p.totalPlannedDose);
      return dose !== null && dose >= SCORING.anthracyclineHighDose;
    },
    derivedFrom: "Calculated from the planned cumulative dose",
  },
  {
    id: "h5",
    tier: "high",
    label: "Prior mediastinal or chest radiotherapy with the heart in field",
    appliesTo: [ALL],
    derive: (p) =>
      Boolean(p.history?.riskFactors?.checks?.mediastinalRT) ||
      Boolean(String(p.history?.priorTreatment?.fields?.priorRT || "").trim()),
    derivedFrom: "Prior chest radiotherapy recorded in history",
  },
  {
    id: "h6",
    tier: "high",
    label: "Prior anthracycline exposure",
    appliesTo: ["her2", "anthracycline"],
    derive: (p) => {
      const dose = num(p.history?.priorTreatment?.fields?.priorAnthracycline);
      return dose !== null && dose > 0;
    },
    derivedFrom: "Prior anthracycline dose recorded in treatment history",
  },
  {
    id: "h7",
    tier: "high",
    label: "Peripheral arterial disease or prior stroke",
    appliesTo: ["bcrabl", "vegf"],
    derive: (p) => Boolean(p.history?.cardiovascular?.checks?.pad || p.history?.cardiovascular?.checks?.stroke),
    derivedFrom: "Peripheral arterial disease or stroke recorded in cardiovascular history",
  },
  {
    id: "h8",
    tier: "high",
    label: "Pre-existing autoimmune disease with cardiac involvement",
    appliesTo: ["ici"],
  },

  /* --------------------------------------------------------- moderate, 2 points */
  {
    id: "m2a",
    tier: "moderate2",
    label: "Borderline LVEF 50–54%",
    appliesTo: [ALL],
    derive: (p) => {
      const lvef = num(p.baselineLVEF);
      return lvef !== null && lvef >= SCORING.borderlineLVEF.min && lvef <= SCORING.borderlineLVEF.max;
    },
    derivedFrom: "Calculated from the recorded baseline LVEF",
  },
  {
    id: "m2b",
    tier: "moderate2",
    label: "Age 65–79 years",
    appliesTo: [ALL],
    derive: (p) => {
      const age = num(p.age);
      return age !== null && age >= SCORING.older && age < SCORING.elderly;
    },
    derivedFrom: "Calculated from the recorded age",
  },
  {
    id: "m2c",
    tier: "moderate2",
    label: "Atrial fibrillation or other arrhythmia",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.cardiovascular?.checks?.af),
    derivedFrom: "Arrhythmia recorded in cardiovascular history",
  },
  {
    id: "m2d",
    tier: "moderate2",
    label: "Elevated baseline cardiac biomarker",
    appliesTo: ["anthracycline", "her2", "ici", "proteasome"],
  },

  /* --------------------------------------------------------- moderate, 1 point */
  {
    id: "m1a",
    tier: "moderate1",
    label: "Current or previous smoker",
    appliesTo: [ALL],
    derive: (p) => {
      const status = p.history?.lifestyle?.fields?.smoking;
      return status === "Current smoker" || status === "Ex-smoker";
    },
    derivedFrom: "Smoking status recorded in lifestyle history",
  },
  {
    id: "m1b",
    tier: "moderate1",
    label: "Obesity (BMI ≥ 30)",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.riskFactors?.checks?.obesity),
    derivedFrom: "Obesity recorded in risk factor history",
  },
  {
    id: "m1c",
    tier: "moderate1",
    label: "Diabetes mellitus",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.riskFactors?.checks?.dm),
    derivedFrom: "Diabetes recorded in risk factor history",
  },
  {
    id: "m1d",
    tier: "moderate1",
    label: "Chronic kidney disease",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.riskFactors?.checks?.ckd),
    derivedFrom: "Chronic kidney disease recorded in risk factor history",
  },
  {
    id: "m1e",
    tier: "moderate1",
    label: "Hypertension",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.riskFactors?.checks?.htn),
    derivedFrom: "Hypertension recorded in risk factor history",
  },
  {
    id: "m1f",
    tier: "moderate1",
    label: "Dyslipidaemia",
    appliesTo: [ALL],
    derive: (p) => Boolean(p.history?.riskFactors?.checks?.dyslipidaemia),
    derivedFrom: "Dyslipidaemia recorded in risk factor history",
  },
];

export function therapyList(therapy) {
  if (Array.isArray(therapy)) return therapy.filter(Boolean);
  return therapy ? [therapy] : [];
}

/** The proforma that applies to the planned therapies. */
export function factorsForTherapies(therapy) {
  const therapies = therapyList(therapy);
  return RISK_FACTORS.filter((factor) => {
    if (factor.appliesTo.includes(ALL)) return true;
    if (therapies.length === 0) return false;
    return factor.appliesTo.some((id) => therapies.includes(id));
  });
}

export function factorsByTier(therapy) {
  const applicable = factorsForTherapies(therapy);
  return {
    veryHigh: applicable.filter((f) => f.tier === "veryHigh"),
    high: applicable.filter((f) => f.tier === "high"),
    moderate2: applicable.filter((f) => f.tier === "moderate2"),
    moderate1: applicable.filter((f) => f.tier === "moderate1"),
  };
}

/** True when the clinician has explicitly ticked this factor. */
function explicitlyTicked(patient, factor) {
  const group = TIERS[factor.tier].group;
  return Boolean(patient?.[group]?.[factor.id]);
}

/**
 * Resolves every applicable factor against the record, reporting for each one
 * whether it is present and how that was established.
 */
export function resolveFactors(patient) {
  return factorsForTherapies(patient?.therapy).map((factor) => {
    const ticked = explicitlyTicked(patient, factor);
    const derived = !ticked && typeof factor.derive === "function" ? Boolean(factor.derive(patient)) : false;
    return {
      id: factor.id,
      label: factor.label,
      tier: factor.tier,
      tierLabel: TIERS[factor.tier].label,
      weight: TIERS[factor.tier].weight,
      present: ticked || derived,
      source: ticked ? "recorded" : derived ? "derived" : null,
      sourceDetail: derived ? factor.derivedFrom : null,
    };
  });
}

/**
 * Baseline HFA-ICOS category.
 *
 * Returns the contributing factors alongside the category so the risk section
 * can show exactly what produced it, including factors that came from the
 * history rather than from a tick.
 */
export function assessRisk(patient) {
  const resolved = resolveFactors(patient);
  const present = resolved.filter((factor) => factor.present);

  const veryHigh = present.filter((f) => f.tier === "veryHigh");
  const high = present.filter((f) => f.tier === "high");
  const moderate = present.filter((f) => f.tier === "moderate2" || f.tier === "moderate1");
  const points = moderate.reduce((total, factor) => total + (factor.weight || 0), 0);

  let category = "Low";
  let reason = "No risk factors present";

  if (veryHigh.length) {
    category = "Very High";
    reason = veryHigh.length === 1 ? "Very-high-risk factor present" : `${veryHigh.length} very-high-risk factors present`;
  } else if (high.length) {
    category = "High";
    reason = high.length === 1 ? "High-risk factor present" : `${high.length} high-risk factors present`;
  } else if (points >= SCORING.pointsForHigh) {
    category = "High";
    reason = `${points} moderate-risk points`;
  } else if (points >= SCORING.pointsForModerate) {
    category = "Moderate";
    reason = "1 moderate-risk point";
  }

  return {
    category,
    reason,
    points,
    factors: resolved,
    contributing: present,
    /** Factors that came from data recorded elsewhere rather than a tick. */
    derived: present.filter((factor) => factor.source === "derived"),
    therapies: therapyList(patient?.therapy),
  };
}
