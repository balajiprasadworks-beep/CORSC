/* =========================================================================
   HFA-ICOS baseline cardiovascular risk stratification.

   BASELINE RISK ONLY. This module answers one question: before the first dose,
   how likely is this patient to develop cardiovascular toxicity from the
   therapy that is planned? It must never be fed treatment-emergent findings.
   A troponin that rises at cycle 3, a GLS that falls, an ejection fraction that
   drops — none of those change a baseline risk category. They are graded
   separately in lib/ctrcvt.js. Conflating the two is the classic error in
   cardio-oncology software: it makes the baseline category drift upward over
   time and destroys the ability to say "this patient was low risk and
   deteriorated anyway".

   ---------------------------------------------------------------------------
   CORRECTION AGAINST THE PUBLISHED TOOL
   ---------------------------------------------------------------------------
   The previous implementation escalated to High at two moderate-risk points:

       else if (points >= 2) { category = "High"; }
       else if (points === 1) { category = "Moderate"; }

   The published HFA-ICOS algebra is different, and the difference is large.
   In the published tool a total of 2-4 moderate points is MEDIUM risk, and
   High requires 5 or more moderate points (or any high-risk factor). Under the
   previous rule a 70-year-old with treated hypertension scored 2+1 = 3 points
   and was classified High; the published tool classifies the same patient
   Medium. That single line drove the surveillance schedule, the follow-up
   interval, the cardioprotection prompts and the fitness verdict, so the
   application systematically over-triaged, which in a busy service degrades
   into surveillance fatigue and ignored alerts.

   The published algebra, implemented below:

       any very-high-risk factor            -> Very High
       else any high-risk factor            -> High
       else moderate points >= 5            -> High
       else moderate points 2-4             -> Moderate
       else (0 or 1 point)                  -> Low

   ---------------------------------------------------------------------------
   THE TOOL IS THERAPY-SPECIFIC
   ---------------------------------------------------------------------------
   HFA-ICOS publishes a separate proforma per therapy class, and the same
   clinical fact carries a different weight in different proformas. Severe
   valvular disease is a high-risk row in the anthracycline proforma; arterial
   vascular disease is a very-high-risk row in the VEGF proforma. A single
   shared thirteen-item list, as the previous implementation used, cannot
   represent that.

   Two therapy classes handled elsewhere in CORSC — immune checkpoint
   inhibitors and fluoropyrimidines — have NO published HFA-ICOS proforma. They
   are deliberately absent here. Producing a number for them and labelling it
   "HFA-ICOS" would be a fabricated citation. They are routed to named
   therapy-specific pathways in lib/therapy-pathways.js instead.

   ---------------------------------------------------------------------------
   VERIFICATION HONESTY
   ---------------------------------------------------------------------------
   Each proforma declares its own verification level. The anthracycline and
   HER2 proformas were checked row by row. The VEGF, BCR-ABL, multiple-myeloma
   and RAF/MEK proformas are marked `partial`: the scoring algebra and the tier
   of every factor listed were confirmed, but the full published row set for
   those four could not be confirmed against a primary source during
   implementation, so rows may be missing. That state is carried through to the
   UI and the printed report rather than hidden. See PROFORMA_LIMITATIONS.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";
import { num } from "@/lib/vitals";

/* ------------------------------------------------------------------ tiers */

export const TIERS = {
  veryHigh: { id: "veryHigh", label: "Very-high-risk factor", weight: null, group: "veryHigh", rank: 4 },
  high: { id: "high", label: "High-risk factor", weight: null, group: "high", rank: 3 },
  moderate2: { id: "moderate2", label: "Moderate-risk factor", weight: 2, group: "m2", rank: 2 },
  moderate1: { id: "moderate1", label: "Moderate-risk factor", weight: 1, group: "m1", rank: 1 },
};

/**
 * The published scoring algebra, in one place for clinical sign-off.
 *
 * These are the category boundaries of the HFA-ICOS tool, not CORSC's own
 * choices. Changing them changes what the application claims to implement, so
 * any edit here must be accompanied by a source.
 */
export const SCORING = {
  /** Highest moderate-point total that is still Low risk. */
  lowMaxPoints: 1,
  /** Lowest moderate-point total that reaches Moderate risk. */
  moderateMinPoints: 2,
  /** Highest moderate-point total that is still Moderate risk. */
  moderateMaxPoints: 4,
  /** Moderate-point total at or above which the category becomes High. */
  highMinPoints: 5,
  /** Weight of a two-point moderate factor. */
  moderate2Weight: 2,
  /** Weight of a one-point moderate factor. */
  moderate1Weight: 1,
};

/** Clinical thresholds used by the derivation functions. */
export const THRESHOLDS = {
  reducedLVEF: 50,
  borderlineLVEF: { min: 50, max: 54 },
  elderly: 80,
  olderMin: 65,
  olderMax: 79,
  vegfElderly: 75,
  obesityBMI: 30,
  qtcProlonged: 480,
};

export const RISK_ORDER = ["Low", "Moderate", "High", "Very High"];

export function riskRank(category) {
  const index = RISK_ORDER.indexOf(category);
  return index < 0 ? 0 : index;
}

export function higherRisk(a, b) {
  return riskRank(a) >= riskRank(b) ? a : b;
}

/* --------------------------------------------------------- factor library */

const bool = (value) => Boolean(value);
const cv = (p) => p?.history?.cardiovascular?.checks || {};
const rf = (p) => p?.history?.riskFactors?.checks || {};
const fam = (p) => p?.history?.family?.checks || {};
const prior = (p) => p?.history?.priorTreatment?.fields || {};
const lifestyle = (p) => p?.history?.lifestyle?.fields || {};

/**
 * Shared clinical concepts.
 *
 * A concept defines what the fact IS and how to read it off the record. The
 * per-therapy proformas below decide what TIER it carries, because that is
 * what varies between the published tables.
 *
 * `legacyIds` lists tick-box ids used by earlier builds of CORSC. A patient
 * record saved before this rewrite has `patient.high.h5` set for prior chest
 * radiotherapy; that tick must keep counting even though the factor has moved
 * tier and been renamed, or the rewrite would silently drop recorded clinical
 * data.
 */
const CONCEPTS = {
  heartFailure: {
    id: "hf-cardiomyopathy",
    label: "Heart failure or cardiomyopathy",
    definition:
      "Established heart failure of any ejection fraction, or a diagnosed cardiomyopathy, present before cancer therapy starts.",
    legacyIds: ["vh1", "vh2"],
    derive: (p) => bool(cv(p).hf) || bool(cv(p).cardiomyopathy),
    derivedFrom: "Heart failure or cardiomyopathy recorded in the cardiovascular history",
  },
  priorCardiotoxicity: {
    id: "prior-cardiotoxicity",
    label: "Previous cancer-therapy cardiotoxicity",
    definition:
      "Documented cardiac dysfunction attributed to previous anthracycline, HER2-targeted or other cardiotoxic cancer therapy.",
    legacyIds: ["vh3"],
    derive: (p) => Boolean(String(prior(p).priorToxicity || "").trim()),
    derivedFrom: "Previous cardiotoxicity recorded in the prior treatment history",
  },
  arterialVascularDisease: {
    id: "arterial-vascular-disease",
    label: "Arterial vascular disease",
    definition:
      "Established peripheral arterial disease, prior stroke or transient ischaemic attack, or other symptomatic arterial occlusive disease.",
    legacyIds: ["vh6", "h7"],
    derive: (p) => bool(cv(p).pad) || bool(cv(p).stroke),
    derivedFrom: "Peripheral arterial disease or prior stroke/TIA recorded in the cardiovascular history",
  },
  severeValvularDisease: {
    id: "severe-vhd",
    label: "Severe valvular heart disease",
    definition: "Severe valvular stenosis or regurgitation on the most recent imaging.",
    legacyIds: ["vh4"],
    derive: (p) => bool(cv(p).valve),
    derivedFrom: "Valvular heart disease recorded in the cardiovascular history",
  },
  priorMiRevascularisation: {
    id: "prior-mi-revasc",
    label: "Previous myocardial infarction or coronary revascularisation",
    definition: "Prior myocardial infarction, percutaneous coronary intervention or coronary artery bypass grafting.",
    legacyIds: ["h2"],
    derive: (p) => bool(cv(p).cad) || bool(cv(p).revasc),
    derivedFrom: "Coronary disease or revascularisation recorded in the cardiovascular history",
  },
  stableAngina: {
    id: "stable-angina",
    label: "Stable angina",
    definition: "Known stable angina pectoris without recent infarction or revascularisation.",
    legacyIds: [],
    derive: (p) => bool(cv(p).angina),
    derivedFrom: "Stable angina recorded in the cardiovascular history",
  },
  reducedLVEF: {
    id: "baseline-lvef-reduced",
    label: "Baseline LVEF below 50%",
    definition: "Pre-treatment left ventricular ejection fraction below 50%.",
    legacyIds: ["h1"],
    derive: (p) => {
      const lvef = num(p?.baselineLVEF);
      return lvef !== null && lvef < THRESHOLDS.reducedLVEF;
    },
    derivedFrom: "Calculated from the recorded baseline LVEF",
  },
  borderlineLVEF: {
    id: "baseline-lvef-borderline",
    label: "Borderline baseline LVEF 50–54%",
    definition: "Pre-treatment left ventricular ejection fraction between 50% and 54% inclusive.",
    legacyIds: ["m2a"],
    derive: (p) => {
      const lvef = num(p?.baselineLVEF);
      return lvef !== null && lvef >= THRESHOLDS.borderlineLVEF.min && lvef <= THRESHOLDS.borderlineLVEF.max;
    },
    derivedFrom: "Calculated from the recorded baseline LVEF",
  },
  ageElderly: {
    id: "age-80",
    label: "Age 80 years or older",
    definition: "Age at the start of therapy of 80 years or more.",
    legacyIds: ["h3"],
    derive: (p) => {
      const age = num(p?.age);
      return age !== null && age >= THRESHOLDS.elderly;
    },
    derivedFrom: "Calculated from the recorded age",
  },
  ageOlder: {
    id: "age-65-79",
    label: "Age 65–79 years",
    definition: "Age at the start of therapy between 65 and 79 years inclusive.",
    legacyIds: ["m2b"],
    derive: (p) => {
      const age = num(p?.age);
      return age !== null && age >= THRESHOLDS.olderMin && age <= THRESHOLDS.olderMax;
    },
    derivedFrom: "Calculated from the recorded age",
  },
  ageVegfElderly: {
    id: "age-75",
    label: "Age 75 years or older",
    definition: "Age at the start of therapy of 75 years or more.",
    legacyIds: [],
    derive: (p) => {
      const age = num(p?.age);
      return age !== null && age >= THRESHOLDS.vegfElderly;
    },
    derivedFrom: "Calculated from the recorded age",
  },
  arrhythmia: {
    id: "arrhythmia",
    label: "Atrial fibrillation, flutter or ventricular arrhythmia",
    definition: "Documented atrial fibrillation or flutter, ventricular tachycardia or ventricular fibrillation.",
    legacyIds: ["m2c"],
    derive: (p) => bool(cv(p).af),
    derivedFrom: "Arrhythmia recorded in the cardiovascular history",
  },
  elevatedTroponin: {
    id: "baseline-troponin-elevated",
    label: "Elevated baseline troponin",
    definition:
      "Pre-treatment cardiac troponin above the upper reference limit for the assay used, measured before the first dose.",
    legacyIds: ["m2d"],
    derive: null,
    derivedFrom: null,
    /** Resolved against the assay's reference limit rather than a fixed number. */
    deriveWithContext: (p, context) => Boolean(context?.baselineTroponinElevated),
    contextDerivedFrom: "Baseline troponin is above the upper reference limit of the recorded assay",
  },
  elevatedNatriuretic: {
    id: "baseline-natriuretic-elevated",
    label: "Elevated baseline natriuretic peptide",
    definition: "Pre-treatment BNP or NT-proBNP above the heart-failure rule-out threshold.",
    legacyIds: [],
    derive: null,
    derivedFrom: null,
    deriveWithContext: (p, context) => Boolean(context?.baselineNatrioureticElevated),
    contextDerivedFrom: "Baseline natriuretic peptide is above the heart-failure rule-out threshold",
  },
  priorAnthracycline: {
    id: "prior-anthracycline",
    label: "Previous anthracycline exposure",
    definition: "Any anthracycline given during a previous line of treatment, at any cumulative dose.",
    legacyIds: ["h6"],
    derive: (p) => {
      const dose = num(prior(p).priorAnthracycline);
      return dose !== null && dose > 0;
    },
    derivedFrom: "Prior anthracycline dose recorded in the treatment history",
  },
  priorChestRadiotherapy: {
    id: "prior-chest-rt",
    label: "Previous radiotherapy to the left chest or mediastinum",
    definition: "Prior radiotherapy with the heart within or adjacent to the treatment field.",
    legacyIds: ["h5"],
    derive: (p) => bool(rf(p).mediastinalRT) || Boolean(String(prior(p).priorRT || "").trim()),
    derivedFrom: "Prior chest or mediastinal radiotherapy recorded in the history",
  },
  anthracyclineBeforeHer2: {
    id: "anthracycline-before-her2",
    label: "Current regimen gives an anthracycline before HER2-targeted therapy",
    definition:
      "The planned regimen sequences an anthracycline ahead of the HER2-targeted agent, which raises the risk of HER2-related cardiac dysfunction.",
    legacyIds: [],
    derive: (p) => {
      const therapies = therapyList(p?.therapy);
      return therapies.includes("anthracycline") && therapies.includes("her2");
    },
    derivedFrom: "Both an anthracycline and a HER2-targeted agent are recorded in the planned therapy",
  },
  hypertension: {
    id: "hypertension",
    label: "Arterial hypertension",
    definition: "Diagnosed hypertension, whether or not currently treated.",
    legacyIds: ["m1e"],
    derive: (p) => bool(rf(p).htn),
    derivedFrom: "Hypertension recorded in the risk factor history",
  },
  diabetes: {
    id: "diabetes",
    label: "Diabetes mellitus",
    definition: "Type 1 or type 2 diabetes mellitus.",
    legacyIds: ["m1c"],
    derive: (p) => bool(rf(p).dm),
    derivedFrom: "Diabetes recorded in the risk factor history",
  },
  ckd: {
    id: "ckd",
    label: "Chronic kidney disease",
    definition: "Chronic kidney disease, conventionally eGFR below 60 mL/min/1.73 m² or documented proteinuria.",
    legacyIds: ["m1d"],
    derive: (p) => bool(rf(p).ckd),
    derivedFrom: "Chronic kidney disease recorded in the risk factor history",
  },
  dyslipidaemia: {
    id: "dyslipidaemia",
    label: "Dyslipidaemia",
    definition: "Diagnosed dyslipidaemia, whether or not currently treated.",
    legacyIds: ["m1f"],
    derive: (p) => bool(rf(p).dyslipidaemia),
    derivedFrom: "Dyslipidaemia recorded in the risk factor history",
  },
  smoking: {
    id: "smoking",
    label: "Current smoker or significant smoking history",
    definition: "Current smoking, or a significant cumulative past smoking history.",
    legacyIds: ["m1a"],
    derive: (p) => {
      const status = lifestyle(p).smoking;
      return status === "Current smoker" || status === "Ex-smoker";
    },
    derivedFrom: "Smoking status recorded in the lifestyle history",
  },
  obesity: {
    id: "obesity",
    label: "Obesity (BMI above 30 kg/m²)",
    definition: "Body mass index above 30 kg/m².",
    legacyIds: ["m1b"],
    derive: (p) => bool(rf(p).obesity),
    derivedFrom: "Obesity recorded in the risk factor history",
  },
  familyHistory: {
    id: "family-premature-cvd",
    label: "Family history of premature cardiovascular disease",
    definition: "Premature cardiovascular disease in a first-degree relative (below 55 years in men, 65 years in women).",
    legacyIds: [],
    derive: (p) => bool(fam(p).prematureCAD),
    derivedFrom: "Premature coronary disease recorded in the family history",
  },
  amyloidosis: {
    id: "cardiac-amyloidosis",
    label: "Cardiac AL amyloidosis",
    definition: "Light-chain amyloidosis with cardiac involvement.",
    legacyIds: [],
    derive: (p) => bool(cv(p).amyloidosis),
    derivedFrom: "Cardiac amyloidosis recorded in the cardiovascular history",
  },
  qtcProlonged: {
    id: "baseline-qtc-prolonged",
    label: "Baseline QTc 480 ms or above",
    definition: "Pre-treatment rate-corrected QT interval of 480 ms or more.",
    legacyIds: [],
    derive: (p) => {
      const qtc = num(p?.baselineQTc);
      return qtc !== null && qtc >= THRESHOLDS.qtcProlonged;
    },
    derivedFrom: "Calculated from the recorded baseline QTc",
  },
  venousThrombosis: {
    id: "venous-thrombosis",
    label: "Previous venous thromboembolism",
    definition: "Prior deep vein thrombosis or pulmonary embolism.",
    legacyIds: [],
    derive: (p) => bool(cv(p).vte),
    derivedFrom: "Venous thromboembolism recorded in the cardiovascular history",
  },
};

/**
 * Additional risk modifiers that are NOT part of any published HFA-ICOS
 * proforma and therefore contribute no HFA-ICOS points.
 *
 * The previous implementation scored planned cumulative anthracycline dose as
 * an HFA-ICOS high-risk factor. It is a genuine and well-evidenced risk factor,
 * but it could not be confirmed as a row in the published anthracycline
 * proforma, so scoring it inside the HFA-ICOS total would misrepresent the
 * tool. It is surfaced separately instead, with its own source, and the
 * surveillance and anthracycline engines consume it directly.
 */
export const RISK_MODIFIERS = [
  {
    id: "planned-high-anthracycline-dose",
    label: "Planned cumulative doxorubicin-equivalent dose at or above 250 mg/m²",
    definition:
      "A planned cumulative anthracycline exposure at or above 250 mg/m² doxorubicin-equivalent, the threshold above which the incidence of cardiac dysfunction rises steeply.",
    legacyIds: ["h4"],
    appliesTo: ["anthracycline"],
    sourceId: "asco-2017-cardiac",
    note:
      "Not a row in the published HFA-ICOS proforma, so it adds no HFA-ICOS points. It escalates the anthracycline surveillance pathway directly.",
    derive: (p) => {
      const dose = num(p?.totalPlannedDose);
      return dose !== null && dose >= 250;
    },
    derivedFrom: "Calculated from the planned cumulative dose recorded at registration",
  },
];

/* ------------------------------------------------------------- proformas */

const factor = (concept, tier, overrides = {}) => ({ ...concept, tier, ...overrides });

/**
 * One proforma per therapy class that HFA-ICOS publishes one for.
 *
 * `verification` is per proforma because the confidence genuinely differs
 * between them, and a clinician needs to know which table they are looking at.
 */
export const PROFORMAS = {
  anthracycline: {
    id: "anthracycline",
    therapyId: "anthracycline",
    label: "Anthracycline chemotherapy",
    sourceId: "hfa-icos-2020",
    verification: "verified",
    factors: [
      factor(CONCEPTS.heartFailure, "veryHigh"),
      factor(CONCEPTS.priorCardiotoxicity, "veryHigh"),
      factor(CONCEPTS.severeValvularDisease, "high"),
      factor(CONCEPTS.priorMiRevascularisation, "high"),
      factor(CONCEPTS.stableAngina, "high"),
      factor(CONCEPTS.reducedLVEF, "high"),
      factor(CONCEPTS.ageElderly, "high"),
      factor(CONCEPTS.borderlineLVEF, "moderate2"),
      factor(CONCEPTS.ageOlder, "moderate2"),
      factor(CONCEPTS.arrhythmia, "moderate2"),
      factor(CONCEPTS.elevatedTroponin, "moderate2"),
      factor(CONCEPTS.elevatedNatriuretic, "moderate2"),
      factor(CONCEPTS.priorAnthracycline, "moderate2"),
      factor(CONCEPTS.priorChestRadiotherapy, "moderate2"),
      factor(CONCEPTS.hypertension, "moderate1"),
      factor(CONCEPTS.diabetes, "moderate1"),
      factor(CONCEPTS.ckd, "moderate1"),
      factor(CONCEPTS.dyslipidaemia, "moderate1"),
      factor(CONCEPTS.familyHistory, "moderate1"),
      factor(CONCEPTS.smoking, "moderate1"),
      factor(CONCEPTS.obesity, "moderate1"),
    ],
  },

  her2: {
    id: "her2",
    therapyId: "her2",
    label: "HER2-targeted therapy",
    sourceId: "hfa-icos-2020",
    verification: "verified",
    factors: [
      factor(CONCEPTS.heartFailure, "veryHigh"),
      factor(CONCEPTS.priorCardiotoxicity, "veryHigh"),
      factor(CONCEPTS.severeValvularDisease, "high"),
      factor(CONCEPTS.priorMiRevascularisation, "high"),
      factor(CONCEPTS.stableAngina, "high"),
      factor(CONCEPTS.reducedLVEF, "high"),
      factor(CONCEPTS.ageElderly, "high"),
      factor(CONCEPTS.borderlineLVEF, "moderate2"),
      factor(CONCEPTS.ageOlder, "moderate2"),
      factor(CONCEPTS.arrhythmia, "moderate2"),
      factor(CONCEPTS.elevatedTroponin, "moderate2"),
      factor(CONCEPTS.elevatedNatriuretic, "moderate2"),
      factor(CONCEPTS.priorAnthracycline, "moderate2"),
      factor(CONCEPTS.priorChestRadiotherapy, "moderate2"),
      factor(CONCEPTS.anthracyclineBeforeHer2, "moderate1"),
      factor(CONCEPTS.hypertension, "moderate1"),
      factor(CONCEPTS.diabetes, "moderate1"),
      factor(CONCEPTS.ckd, "moderate1"),
      factor(CONCEPTS.dyslipidaemia, "moderate1"),
      factor(CONCEPTS.smoking, "moderate1"),
      factor(CONCEPTS.obesity, "moderate1"),
    ],
  },

  vegf: {
    id: "vegf",
    therapyId: "vegf",
    label: "VEGF inhibitors",
    sourceId: "hfa-icos-2020",
    verification: "partial",
    factors: [
      factor(CONCEPTS.heartFailure, "veryHigh"),
      factor(CONCEPTS.arterialVascularDisease, "veryHigh"),
      factor(CONCEPTS.priorCardiotoxicity, "veryHigh"),
      factor(CONCEPTS.reducedLVEF, "high"),
      factor(CONCEPTS.venousThrombosis, "high"),
      factor(CONCEPTS.qtcProlonged, "high"),
      factor(CONCEPTS.ageVegfElderly, "high"),
      factor(CONCEPTS.priorAnthracycline, "high"),
      factor(CONCEPTS.borderlineLVEF, "moderate2"),
      factor(CONCEPTS.arrhythmia, "moderate2"),
      factor(CONCEPTS.elevatedTroponin, "moderate2"),
      factor(CONCEPTS.elevatedNatriuretic, "moderate2"),
      factor(CONCEPTS.priorChestRadiotherapy, "moderate2"),
      factor(CONCEPTS.hypertension, "moderate1"),
      factor(CONCEPTS.diabetes, "moderate1"),
      factor(CONCEPTS.ckd, "moderate1"),
      factor(CONCEPTS.dyslipidaemia, "moderate1"),
      factor(CONCEPTS.familyHistory, "moderate1"),
      factor(CONCEPTS.smoking, "moderate1"),
      factor(CONCEPTS.obesity, "moderate1"),
    ],
  },

  bcrabl: {
    id: "bcrabl",
    therapyId: "bcrabl",
    label: "BCR-ABL tyrosine kinase inhibitors (chronic myeloid leukaemia)",
    sourceId: "hfa-icos-2020",
    verification: "partial",
    factors: [
      factor(CONCEPTS.heartFailure, "veryHigh"),
      factor(CONCEPTS.arterialVascularDisease, "veryHigh"),
      factor(CONCEPTS.priorMiRevascularisation, "high"),
      factor(CONCEPTS.stableAngina, "high"),
      factor(CONCEPTS.reducedLVEF, "high"),
      factor(CONCEPTS.qtcProlonged, "high"),
      factor(CONCEPTS.ageElderly, "high"),
      factor(CONCEPTS.borderlineLVEF, "moderate2"),
      factor(CONCEPTS.ageOlder, "moderate2"),
      factor(CONCEPTS.arrhythmia, "moderate2"),
      factor(CONCEPTS.venousThrombosis, "moderate2"),
      factor(CONCEPTS.priorChestRadiotherapy, "moderate2"),
      factor(CONCEPTS.hypertension, "moderate1"),
      factor(CONCEPTS.diabetes, "moderate1"),
      factor(CONCEPTS.ckd, "moderate1"),
      factor(CONCEPTS.dyslipidaemia, "moderate1"),
      factor(CONCEPTS.familyHistory, "moderate1"),
      factor(CONCEPTS.smoking, "moderate1"),
      factor(CONCEPTS.obesity, "moderate1"),
    ],
  },

  proteasome: {
    id: "proteasome",
    therapyId: "proteasome",
    label: "Multiple myeloma therapies (proteasome inhibitors and immunomodulatory drugs)",
    sourceId: "hfa-icos-2020",
    verification: "partial",
    factors: [
      factor(CONCEPTS.heartFailure, "veryHigh"),
      factor(CONCEPTS.amyloidosis, "veryHigh"),
      factor(CONCEPTS.priorCardiotoxicity, "veryHigh"),
      factor(CONCEPTS.severeValvularDisease, "high"),
      factor(CONCEPTS.priorMiRevascularisation, "high"),
      factor(CONCEPTS.reducedLVEF, "high"),
      factor(CONCEPTS.ageElderly, "high"),
      factor(CONCEPTS.borderlineLVEF, "moderate2"),
      factor(CONCEPTS.ageOlder, "moderate2"),
      factor(CONCEPTS.arrhythmia, "moderate2"),
      factor(CONCEPTS.elevatedTroponin, "moderate2"),
      factor(CONCEPTS.elevatedNatriuretic, "moderate2"),
      factor(CONCEPTS.priorAnthracycline, "moderate2"),
      factor(CONCEPTS.venousThrombosis, "moderate2"),
      factor(CONCEPTS.hypertension, "moderate1"),
      factor(CONCEPTS.diabetes, "moderate1"),
      factor(CONCEPTS.ckd, "moderate1"),
      factor(CONCEPTS.dyslipidaemia, "moderate1"),
      factor(CONCEPTS.smoking, "moderate1"),
      factor(CONCEPTS.obesity, "moderate1"),
    ],
  },

  rafmek: {
    id: "rafmek",
    therapyId: "rafmek",
    label: "Combination RAF and MEK inhibitors",
    sourceId: "hfa-icos-2020",
    verification: "partial",
    factors: [
      factor(CONCEPTS.heartFailure, "veryHigh"),
      factor(CONCEPTS.priorCardiotoxicity, "veryHigh"),
      factor(CONCEPTS.reducedLVEF, "high"),
      factor(CONCEPTS.priorMiRevascularisation, "high"),
      factor(CONCEPTS.qtcProlonged, "high"),
      factor(CONCEPTS.ageElderly, "high"),
      factor(CONCEPTS.borderlineLVEF, "moderate2"),
      factor(CONCEPTS.ageOlder, "moderate2"),
      factor(CONCEPTS.arrhythmia, "moderate2"),
      factor(CONCEPTS.elevatedNatriuretic, "moderate2"),
      factor(CONCEPTS.priorAnthracycline, "moderate2"),
      factor(CONCEPTS.priorChestRadiotherapy, "moderate2"),
      factor(CONCEPTS.venousThrombosis, "moderate2"),
      factor(CONCEPTS.hypertension, "moderate1"),
      factor(CONCEPTS.diabetes, "moderate1"),
      factor(CONCEPTS.ckd, "moderate1"),
      factor(CONCEPTS.dyslipidaemia, "moderate1"),
      factor(CONCEPTS.smoking, "moderate1"),
      factor(CONCEPTS.obesity, "moderate1"),
    ],
  },
};

/** Therapies CORSC supports that HFA-ICOS does not publish a proforma for. */
export const THERAPIES_WITHOUT_PROFORMA = {
  ici: "Immune checkpoint inhibitors have no published HFA-ICOS baseline proforma. CORSC routes them to a named checkpoint-inhibitor myocarditis pathway instead.",
  fluoropyrimidine:
    "Fluoropyrimidines have no published HFA-ICOS baseline proforma. CORSC routes them to a named coronary vasospasm and ischaemia pathway instead.",
};

/** What is known to be incomplete, surfaced verbatim in the UI and the report. */
export const PROFORMA_LIMITATIONS = {
  vegf: "The full published row set for the VEGF proforma could not be confirmed against a primary source during implementation. Rows may be missing — in particular no moderate age band below the 75-year high-risk row could be confirmed, so a patient aged 65 to 74 scores no age points on this proforma.",
  bcrabl:
    "The full published row set for the BCR-ABL proforma could not be confirmed against a primary source during implementation. Rows may be missing.",
  proteasome:
    "The full published row set for the multiple myeloma proforma could not be confirmed against a primary source during implementation. Rows may be missing.",
  rafmek:
    "The full published row set for the RAF/MEK proforma could not be confirmed against a primary source during implementation. Rows may be missing.",
};

export function proformaFor(therapyId) {
  return PROFORMAS[therapyId] || null;
}

export function hasProforma(therapyId) {
  return Boolean(PROFORMAS[therapyId]);
}

/* ------------------------------------------------------------ resolution */

export function therapyList(therapy) {
  if (Array.isArray(therapy)) return therapy.filter(Boolean);
  return therapy ? [therapy] : [];
}

/** Therapies with a published proforma, from the planned therapy list. */
export function scoredTherapies(therapy) {
  return therapyList(therapy).filter(hasProforma);
}

/**
 * True when the clinician has explicitly ticked this factor, under either its
 * current id or any id an earlier build used for the same concept.
 */
function explicitlyTicked(patient, factorDef) {
  const ids = [factorDef.id, ...(factorDef.legacyIds || [])];
  return ["veryHigh", "high", "m2", "m1"].some((group) =>
    ids.some((id) => Boolean(patient?.[group]?.[id]))
  );
}

function resolveOne(patient, factorDef, context) {
  const ticked = explicitlyTicked(patient, factorDef);
  let derived = false;
  let derivedFrom = null;

  if (!ticked) {
    if (typeof factorDef.deriveWithContext === "function") {
      derived = Boolean(factorDef.deriveWithContext(patient, context));
      derivedFrom = factorDef.contextDerivedFrom;
    } else if (typeof factorDef.derive === "function") {
      derived = Boolean(factorDef.derive(patient));
      derivedFrom = factorDef.derivedFrom;
    }
  }

  const tier = TIERS[factorDef.tier];
  return {
    id: factorDef.id,
    label: factorDef.label,
    definition: factorDef.definition,
    tier: factorDef.tier,
    tierLabel: tier.label,
    weight: tier.weight,
    points: derived || ticked ? tier.weight || 0 : 0,
    present: ticked || derived,
    source: ticked ? "recorded" : derived ? "derived" : null,
    sourceDetail: derived ? derivedFrom : null,
  };
}

/**
 * The published categorisation algebra.
 *
 * Exported on its own so the test suite can exercise the boundaries directly
 * without constructing a patient for every case.
 */
export function categorise({ veryHighCount = 0, highCount = 0, moderatePoints = 0 } = {}) {
  if (veryHighCount > 0) {
    return {
      category: "Very High",
      rule: "any very-high-risk factor",
      reason:
        veryHighCount === 1
          ? "One very-high-risk factor is present, which sets the category regardless of any other factor."
          : `${veryHighCount} very-high-risk factors are present, which set the category regardless of any other factor.`,
    };
  }
  if (highCount > 0) {
    return {
      category: "High",
      rule: "any high-risk factor",
      reason:
        highCount === 1
          ? "One high-risk factor is present, which sets the category regardless of the moderate-risk total."
          : `${highCount} high-risk factors are present, which set the category regardless of the moderate-risk total.`,
    };
  }
  if (moderatePoints >= SCORING.highMinPoints) {
    return {
      category: "High",
      rule: `moderate-risk total of ${SCORING.highMinPoints} or more`,
      reason: `No high-risk factor is present, but the moderate-risk factors total ${moderatePoints} points, which reaches the ${SCORING.highMinPoints}-point high-risk threshold.`,
    };
  }
  if (moderatePoints >= SCORING.moderateMinPoints) {
    return {
      category: "Moderate",
      rule: `moderate-risk total of ${SCORING.moderateMinPoints} to ${SCORING.moderateMaxPoints}`,
      reason: `The moderate-risk factors total ${moderatePoints} points, inside the ${SCORING.moderateMinPoints}-to-${SCORING.moderateMaxPoints}-point moderate band.`,
    };
  }
  return {
    category: "Low",
    rule: `moderate-risk total of ${SCORING.lowMaxPoints} or less`,
    reason:
      moderatePoints === 0
        ? "No risk factor from this proforma is present."
        : `Only ${moderatePoints} moderate-risk point is present, which stays inside the low-risk band.`,
  };
}

/**
 * Scores one therapy's proforma.
 *
 * @param {object} patient
 * @param {string} therapyId
 * @param {object} [context] baseline biomarker interpretations, so that
 *                           "elevated baseline troponin" is decided against the
 *                           assay's own reference limit rather than a guess
 */
export function assessProforma(patient, therapyId, context = {}) {
  const proforma = proformaFor(therapyId);
  if (!proforma) return null;

  const factors = proforma.factors.map((definition) => resolveOne(patient, definition, context));
  const present = factors.filter((item) => item.present);
  const veryHigh = present.filter((item) => item.tier === "veryHigh");
  const high = present.filter((item) => item.tier === "high");
  const moderate = present.filter((item) => item.tier === "moderate2" || item.tier === "moderate1");
  const moderatePoints = moderate.reduce((total, item) => total + (item.weight || 0), 0);

  const outcome = categorise({
    veryHighCount: veryHigh.length,
    highCount: high.length,
    moderatePoints,
  });

  const modifiers = RISK_MODIFIERS.filter((modifier) => modifier.appliesTo.includes(therapyId))
    .map((modifier) => {
      const ticked = explicitlyTicked(patient, modifier);
      const derived = !ticked && typeof modifier.derive === "function" ? Boolean(modifier.derive(patient)) : false;
      return {
        id: modifier.id,
        label: modifier.label,
        definition: modifier.definition,
        present: ticked || derived,
        note: modifier.note,
        sourceDetail: derived ? modifier.derivedFrom : null,
        provenance: provenance(modifier.sourceId, { note: modifier.note }),
      };
    })
    .filter((modifier) => modifier.present);

  return {
    therapyId,
    proformaId: proforma.id,
    label: proforma.label,
    category: outcome.category,
    rule: outcome.rule,
    reason: outcome.reason,
    points: moderatePoints,
    counts: { veryHigh: veryHigh.length, high: high.length, moderate: moderate.length },
    factors,
    contributing: present,
    veryHighFactors: veryHigh,
    highFactors: high,
    moderateFactors: moderate,
    derived: present.filter((item) => item.source === "derived"),
    modifiers,
    limitation: PROFORMA_LIMITATIONS[therapyId] || null,
    provenance: provenance(proforma.sourceId, {
      locator: `${proforma.label} baseline risk proforma`,
      verification: proforma.verification,
      note: PROFORMA_LIMITATIONS[therapyId] || null,
    }),
    /** Step-by-step arithmetic, so the category can be reproduced by hand. */
    workings: [
      `Very-high-risk factors present: ${veryHigh.length}${veryHigh.length ? ` (${veryHigh.map((f) => f.label).join("; ")})` : ""}`,
      `High-risk factors present: ${high.length}${high.length ? ` (${high.map((f) => f.label).join("; ")})` : ""}`,
      `Moderate-risk factors present: ${moderate.length}${
        moderate.length ? ` (${moderate.map((f) => `${f.label} = ${f.weight} point${f.weight === 1 ? "" : "s"}`).join("; ")})` : ""
      }`,
      `Moderate-risk total: ${moderatePoints} point${moderatePoints === 1 ? "" : "s"}`,
      `Applied rule: ${outcome.rule} → ${outcome.category}`,
    ],
  };
}

/**
 * Baseline risk across every planned therapy that HFA-ICOS covers.
 *
 * Each therapy is scored on its own proforma, as published. When more than one
 * cardiotoxic therapy is planned the governing baseline category is the highest
 * of them: HFA-ICOS does not publish a combination rule, so this is CORSC's own
 * composition decision and is labelled as such rather than presented as part of
 * the tool.
 */
export function assessBaselineRisk(patient, context = {}) {
  const therapies = therapyList(patient?.therapy);
  const scored = therapies.filter(hasProforma);
  const unscored = therapies.filter((id) => !hasProforma(id));

  const results = scored.map((therapyId) => assessProforma(patient, therapyId, context)).filter(Boolean);

  if (results.length === 0) {
    return {
      applicable: false,
      category: null,
      reason: therapies.length
        ? "No planned therapy has a published HFA-ICOS baseline risk proforma."
        : "No therapy has been recorded, so no baseline risk proforma applies.",
      points: 0,
      results: [],
      governing: null,
      therapies,
      scoredTherapies: scored,
      unscoredTherapies: unscored,
      unscoredNotes: unscored.map((id) => ({ therapyId: id, note: THERAPIES_WITHOUT_PROFORMA[id] || null })),
      factors: [],
      contributing: [],
      derived: [],
      modifiers: [],
      composition: null,
      provenance: provenance("hfa-icos-2020"),
    };
  }

  const governing = results.reduce((worst, item) => (riskRank(item.category) > riskRank(worst.category) ? item : worst), results[0]);

  const composition =
    results.length > 1
      ? {
          rule: "highest category across the planned therapies",
          detail:
            "HFA-ICOS publishes one proforma per therapy class and no rule for combining them. Where more than one cardiotoxic therapy is planned CORSC reports each proforma separately and takes the highest category as the governing baseline. This composition step is a CORSC decision, not part of the published tool.",
          provenance: provenance("corsc-operational", { note: "Multi-therapy composition rule" }),
          perTherapy: results.map((item) => ({ therapyId: item.therapyId, label: item.label, category: item.category, points: item.points })),
        }
      : null;

  return {
    applicable: true,
    category: governing.category,
    reason: governing.reason,
    rule: governing.rule,
    points: governing.points,
    governing,
    results,
    therapies,
    scoredTherapies: scored,
    unscoredTherapies: unscored,
    unscoredNotes: unscored.map((id) => ({ therapyId: id, note: THERAPIES_WITHOUT_PROFORMA[id] || null })),
    factors: governing.factors,
    contributing: governing.contributing,
    derived: governing.derived,
    modifiers: results.flatMap((item) => item.modifiers),
    workings: governing.workings,
    limitation: governing.limitation,
    composition,
    provenance: governing.provenance,
    /** True when any scored proforma is only partially verified. */
    partiallyVerified: results.some((item) => item.provenance.verification === "partial"),
  };
}

/* ------------------------------------------------- backwards-compatible API */

/**
 * The shape the existing workflow sections consume.
 *
 * Kept so this rewrite does not require every consumer to change at once. New
 * code should call assessBaselineRisk directly — it exposes the per-therapy
 * breakdown, the workings and the provenance that this shape flattens away.
 */
export function assessRisk(patient, context = {}) {
  const baseline = assessBaselineRisk(patient, context);
  return {
    category: baseline.applicable ? baseline.category : "Low",
    reason: baseline.reason,
    points: baseline.points,
    factors: baseline.factors,
    contributing: baseline.contributing,
    derived: baseline.derived,
    therapies: baseline.therapies,
    applicable: baseline.applicable,
    baseline,
  };
}

/** Every factor scored for the planned therapies, de-duplicated for display. */
export function factorsForTherapies(therapy) {
  const seen = new Map();
  scoredTherapies(therapy).forEach((therapyId) => {
    PROFORMAS[therapyId].factors.forEach((item) => {
      if (!seen.has(item.id)) seen.set(item.id, item);
    });
  });
  return Array.from(seen.values());
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

export function resolveFactors(patient, context = {}) {
  return factorsForTherapies(patient?.therapy).map((definition) => resolveOne(patient, definition, context));
}
