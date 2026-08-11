/* =========================================================================
   Medication review engine.

   Turns the patient's medication list plus the current clinical picture into
   (a) cardioprotective therapy recommendations and (b) safety warnings.
   Every output carries an explicit `why` so the clinician can see the trigger
   rather than an unexplained suggestion.
   ========================================================================= */

import { hasTherapy } from "@/lib/clinical-data";
import { GRADE_MODERATE, isWorse } from "@/lib/ctrcd";
import { num } from "@/lib/vitals";

export const MED_CLASSES = [
  { id: "acei", label: "ACE inhibitor" },
  { id: "arb", label: "ARB" },
  { id: "arni", label: "ARNI" },
  { id: "betaBlocker", label: "Beta-blocker" },
  { id: "statin", label: "Statin" },
  { id: "mra", label: "Mineralocorticoid receptor antagonist" },
  { id: "sglt2", label: "SGLT2 inhibitor" },
  { id: "ccbDhp", label: "Calcium-channel blocker (dihydropyridine)" },
  { id: "ccbNonDhp", label: "Calcium-channel blocker (non-dihydropyridine)" },
  { id: "diuretic", label: "Diuretic" },
  { id: "anticoagulant", label: "Anticoagulant" },
  { id: "antiplatelet", label: "Antiplatelet" },
  { id: "antiarrhythmic", label: "Antiarrhythmic" },
  { id: "antiemetic", label: "Antiemetic" },
  { id: "antimicrobial", label: "Antimicrobial" },
  { id: "psychotropic", label: "Psychotropic" },
  { id: "other", label: "Other" },
];

export function medClassLabel(id) {
  return MED_CLASSES.find((c) => c.id === id)?.label || "Other";
}

/** Drug name fragments mapped to a class, used to auto-classify free text. */
const DRUG_LOOKUP = [
  { match: ["ramipril", "enalapril", "lisinopril", "perindopril", "captopril", "quinapril"], klass: "acei" },
  { match: ["losartan", "valsartan", "candesartan", "telmisartan", "olmesartan", "irbesartan"], klass: "arb" },
  { match: ["sacubitril", "entresto"], klass: "arni" },
  { match: ["bisoprolol", "carvedilol", "metoprolol", "nebivolol", "atenolol", "propranolol"], klass: "betaBlocker" },
  { match: ["atorvastatin", "rosuvastatin", "simvastatin", "pravastatin", "pitavastatin"], klass: "statin" },
  { match: ["spironolactone", "eplerenone"], klass: "mra" },
  { match: ["dapagliflozin", "empagliflozin"], klass: "sglt2" },
  { match: ["amlodipine", "nifedipine", "felodipine", "lercanidipine"], klass: "ccbDhp" },
  { match: ["verapamil", "diltiazem"], klass: "ccbNonDhp" },
  { match: ["furosemide", "frusemide", "torsemide", "bumetanide", "hydrochlorothiazide", "indapamide", "metolazone"], klass: "diuretic" },
  { match: ["warfarin", "apixaban", "rivaroxaban", "dabigatran", "edoxaban", "enoxaparin", "heparin"], klass: "anticoagulant" },
  { match: ["aspirin", "clopidogrel", "ticagrelor", "prasugrel"], klass: "antiplatelet" },
  { match: ["amiodarone", "sotalol", "flecainide", "digoxin", "dronedarone"], klass: "antiarrhythmic" },
  { match: ["ondansetron", "domperidone", "metoclopramide", "granisetron"], klass: "antiemetic" },
  { match: ["fluconazole", "azithromycin", "clarithromycin", "levofloxacin", "moxifloxacin", "erythromycin", "itraconazole", "voriconazole"], klass: "antimicrobial" },
  { match: ["citalopram", "escitalopram", "haloperidol", "quetiapine", "amitriptyline", "hydroxyzine", "methadone"], klass: "psychotropic" },
];

/** Drugs with a meaningful QT-prolongation signal. */
const QT_DRUGS = [
  "amiodarone", "sotalol", "dronedarone", "ondansetron", "domperidone", "haloperidol",
  "citalopram", "escitalopram", "quetiapine", "amitriptyline", "hydroxyzine", "methadone",
  "fluconazole", "itraconazole", "voriconazole", "azithromycin", "clarithromycin",
  "erythromycin", "levofloxacin", "moxifloxacin",
];

/** Strong CYP3A4 inhibitors that raise tyrosine-kinase inhibitor exposure. */
const CYP3A4_INHIBITORS = ["verapamil", "diltiazem", "clarithromycin", "erythromycin", "itraconazole", "ketoconazole", "voriconazole", "fluconazole"];

export function classifyDrug(name) {
  const lower = String(name || "").toLowerCase();
  if (!lower.trim()) return "other";
  const entry = DRUG_LOOKUP.find((item) => item.match.some((fragment) => lower.includes(fragment)));
  return entry ? entry.klass : "other";
}

function nameHits(medications, list) {
  return (medications || []).filter((med) => {
    const lower = String(med.name || "").toLowerCase();
    return list.some((fragment) => lower.includes(fragment));
  });
}

function hasClass(medications, klass) {
  return (medications || []).some((med) => (med.klass || classifyDrug(med.name)) === klass);
}

/* -------------------------------------------------- clinical trigger set */

/**
 * Collects the clinical facts that drive medication recommendations, so both
 * the recommendation and the explanation come from one place.
 */
export function medicationContext(patient, encounter, signals = {}) {
  const history = patient?.history || {};
  const cv = history.cardiovascular?.checks || {};
  const rf = history.riskFactors?.checks || {};
  const lifestyle = history.lifestyle?.fields || {};
  const inv = encounter?.inv || {};
  const baselineLVEF = num(patient?.baselineLVEF);
  const currentLVEF = num(inv.lvef?.result) ?? num(patient?.restratification?.currentLVEF);
  // Cardiac dysfunction is graded once, in lib/ctrcd.js. This module used to
  // carry its own threshold, which is how the codebase came to hold four
  // different definitions of the same thing.
  const ctrcd = signals.ctrcd;
  const lvefDrop = Boolean(ctrcd ? ctrcd.grade === "moderate" || isWorse(ctrcd.grade, GRADE_MODERATE) : signals.lvefDecline);
  const sbp = num(encounter?.vitals?.sbp);
  const dbp = num(encounter?.vitals?.dbp);

  return {
    risk: patient?.risk?.category || "Low",
    highRisk: ["High", "Very High"].includes(patient?.risk?.category),
    anthracycline: hasTherapy(patient?.therapy, "anthracycline"),
    her2: hasTherapy(patient?.therapy, "her2"),
    vegf: hasTherapy(patient?.therapy, "vegf"),
    bcrabl: hasTherapy(patient?.therapy, "bcrabl"),
    ici: hasTherapy(patient?.therapy, "ici"),
    heartFailure: Boolean(cv.hf) || Boolean(patient?.veryHigh?.vh1),
    priorMI: Boolean(cv.cad) || Boolean(cv.revasc) || Boolean(patient?.high?.h2),
    pad: Boolean(cv.pad) || Boolean(cv.stroke),
    hypertension: Boolean(rf.htn) || (sbp !== null && sbp >= 140) || (dbp !== null && dbp >= 90),
    diabetes: Boolean(rf.dm) || Boolean(patient?.m1?.m1c),
    dyslipidaemia: Boolean(rf.dyslipidaemia),
    ckd: Boolean(rf.ckd) || Boolean(patient?.m1?.m1d),
    mediastinalRT: Boolean(rf.mediastinalRT),
    smoker: lifestyle.smoking === "Current smoker" || Boolean(patient?.m1?.m1a),
    ldl: num(inv.ldl?.result),
    currentLVEF,
    baselineLVEF,
    lvefDrop: lvefDrop || Boolean(signals.lvefDecline),
    glsDrop: Boolean(signals.glsDrop),
    troponinRise: Boolean(signals.elevatedTroponin),
    qtProlongation: Boolean(signals.qtProlongation),
    cardiacSymptoms: signals.currentCardiacSymptoms || [],
  };
}

/* ------------------------------------------------------- recommendations */

/**
 * Returns cardioprotective recommendations. Each entry states the therapy, how
 * strongly it is indicated, whether the patient is already on it, and the
 * specific findings that triggered it.
 */
export function cardioprotectiveRecommendations(patient, encounter, signals = {}) {
  const context = medicationContext(patient, encounter, signals);
  const medications = patient?.medications || [];
  const out = [];

  /* --- ACE inhibitor / ARB --- */
  const aceiReasons = [];
  if (context.lvefDrop) aceiReasons.push("LVEF has fallen by at least 10 points to below 50%, which meets the definition of cancer therapy–related cardiac dysfunction");
  if (context.glsDrop) aceiReasons.push("GLS has fallen more than 15% from baseline, an early marker of subclinical LV dysfunction");
  if (context.troponinRise) aceiReasons.push("troponin has risen from baseline");
  if (context.heartFailure) aceiReasons.push("established heart failure or baseline LVEF below 50%");
  if (context.hypertension && context.vegf) aceiReasons.push("hypertension on a VEGF-pathway inhibitor, where ACE inhibitors and ARBs are the preferred agents");
  else if (context.hypertension) aceiReasons.push("hypertension requiring treatment");
  if (context.anthracycline && context.highRisk) aceiReasons.push("high or very-high HFA-ICOS risk on anthracycline therapy, where primary cardioprotection is recommended");
  if (context.diabetes && context.ckd) aceiReasons.push("diabetes with chronic kidney disease");
  if (aceiReasons.length) {
    const onAcei = hasClass(medications, "acei");
    const onArb = hasClass(medications, "arb");
    const onArni = hasClass(medications, "arni");
    out.push({
      id: "acei-arb",
      title: "ACE inhibitor or ARB",
      klass: "acei",
      strength: context.lvefDrop || context.heartFailure ? "Indicated" : "Consider",
      onTreatment: onAcei || onArb || onArni,
      current: onArni ? "ARNI in use" : onAcei ? "ACE inhibitor in use" : onArb ? "ARB in use" : null,
      reasons: aceiReasons,
      guidance: "Start at a low dose and titrate against blood pressure and renal function. An ARB is the alternative when an ACE inhibitor causes cough.",
    });
  }

  /* --- Beta-blocker --- */
  const bbReasons = [];
  if (context.lvefDrop) bbReasons.push("LVEF fall meeting CTRCD criteria");
  if (context.glsDrop) bbReasons.push("GLS relative fall greater than 15%");
  if (context.heartFailure) bbReasons.push("established heart failure or cardiomyopathy");
  if (context.priorMI) bbReasons.push("previous myocardial infarction or revascularisation");
  if (context.anthracycline && context.highRisk) bbReasons.push("high or very-high risk on anthracycline therapy");
  if (bbReasons.length) {
    out.push({
      id: "beta-blocker",
      title: "Beta-blocker",
      klass: "betaBlocker",
      strength: context.lvefDrop || context.heartFailure ? "Indicated" : "Consider",
      onTreatment: hasClass(medications, "betaBlocker"),
      current: hasClass(medications, "betaBlocker") ? "Beta-blocker in use" : null,
      reasons: bbReasons,
      guidance: "Carvedilol, bisoprolol or nebivolol are the usual choices. Check heart rate and blood pressure before each up-titration.",
    });
  }

  /* --- Statin --- */
  const statinReasons = [];
  if (context.priorMI) statinReasons.push("established atherosclerotic cardiovascular disease");
  if (context.pad) statinReasons.push("peripheral arterial disease or prior stroke");
  if (context.bcrabl) statinReasons.push("BCR-ABL tyrosine kinase inhibitor therapy, which accelerates arterial occlusive disease");
  if (context.dyslipidaemia) statinReasons.push("documented dyslipidaemia");
  if (context.ldl !== null && context.ldl > 2.6) statinReasons.push(`LDL-cholesterol of ${context.ldl} mmol/L above target`);
  if (context.diabetes) statinReasons.push("diabetes mellitus");
  if (context.mediastinalRT) statinReasons.push("prior mediastinal radiotherapy, which accelerates coronary disease");
  if (context.smoker) statinReasons.push("current smoking");
  if (statinReasons.length) {
    out.push({
      id: "statin",
      title: "Statin",
      klass: "statin",
      strength: context.priorMI || context.pad || context.bcrabl ? "Indicated" : "Consider",
      onTreatment: hasClass(medications, "statin"),
      current: hasClass(medications, "statin") ? "Statin in use" : null,
      reasons: statinReasons,
      guidance: "Use a high-intensity statin for established disease. Recheck lipids and liver function 8 to 12 weeks after starting.",
    });
  }

  /* --- Full heart-failure therapy --- */
  if (context.currentLVEF !== null && context.currentLVEF < 40) {
    out.push({
      id: "hf-quadruple",
      title: "Complete heart-failure therapy (MRA and SGLT2 inhibitor)",
      klass: "mra",
      strength: "Indicated",
      onTreatment: hasClass(medications, "mra") && hasClass(medications, "sglt2"),
      current: [hasClass(medications, "mra") ? "MRA in use" : null, hasClass(medications, "sglt2") ? "SGLT2 inhibitor in use" : null].filter(Boolean).join(" · ") || null,
      reasons: [`LVEF of ${context.currentLVEF}% is below 40%, so guideline-directed medical therapy for heart failure with reduced ejection fraction applies in full`],
      guidance: "Add a mineralocorticoid receptor antagonist and an SGLT2 inhibitor alongside the ACE inhibitor or ARB and beta-blocker, monitoring potassium and renal function.",
    });
  }

  /* --- Dexrazoxane --- */
  const cumulativeDose = num(patient?.totalPlannedDose);
  if (context.anthracycline && (cumulativeDose !== null && cumulativeDose >= 300 || patient?.high?.h4)) {
    out.push({
      id: "dexrazoxane",
      title: "Dexrazoxane cardioprotection",
      klass: "other",
      strength: "Consider",
      onTreatment: nameHits(medications, ["dexrazoxane"]).length > 0,
      current: nameHits(medications, ["dexrazoxane"]).length ? "Dexrazoxane in use" : null,
      reasons: [
        cumulativeDose !== null && cumulativeDose >= 300
          ? `planned cumulative anthracycline dose of ${cumulativeDose} mg/m² exceeds the 300 mg/m² threshold`
          : "planned cumulative doxorubicin-equivalent dose is in the 250 to 399 mg/m² band",
      ],
      guidance: "Discuss with oncology. Dexrazoxane reduces anthracycline cardiotoxicity when high cumulative exposure is planned.",
    });
  }

  return out;
}

/* -------------------------------------------------------------- warnings */

/**
 * Safety warnings across the medication list: QT stacking, duplicate classes,
 * interaction risks, and cardioprotection that is indicated but missing.
 */
export function medicationWarnings(patient, encounter, signals = {}) {
  const context = medicationContext(patient, encounter, signals);
  const medications = patient?.medications || [];
  const warnings = [];

  /* QT-prolonging combinations */
  const qtMeds = nameHits(medications, QT_DRUGS);
  const qtTherapy = context.bcrabl || context.vegf || hasTherapy(patient?.therapy, "rafmek");
  const qtBurden = qtMeds.length + (qtTherapy ? 1 : 0);
  if (qtBurden >= 2) {
    warnings.push({
      id: "qt-combination",
      level: qtMeds.length >= 2 ? "danger" : "warning",
      title: "QT-prolonging combination",
      detail: [
        qtMeds.length ? `Concomitant QT-prolonging medicines: ${qtMeds.map((m) => m.name).join(", ")}.` : "",
        qtTherapy ? "The current anticancer therapy also carries QT risk." : "",
        "Obtain a 12-lead ECG, correct potassium and magnesium, and avoid adding further QT-prolonging agents.",
      ].filter(Boolean).join(" "),
      why: "Two or more agents that prolong the QT interval are prescribed together, which multiplies the risk of torsades de pointes.",
    });
  }
  if (context.qtProlongation) {
    warnings.push({
      id: "qt-documented",
      level: "danger",
      title: "Documented QT prolongation",
      detail: "A QTc of 500 ms or above has been recorded. Review every QT-prolonging medicine, correct electrolytes, and discuss interruption of QT-prolonging chemotherapy with oncology.",
      why: "QT prolongation has already been captured in this patient's ECG documentation.",
    });
  }

  /* Duplicate therapy within a class */
  const byClass = {};
  medications.forEach((med) => {
    const klass = med.klass || classifyDrug(med.name);
    if (klass === "other") return;
    byClass[klass] = byClass[klass] || [];
    byClass[klass].push(med.name);
  });
  Object.entries(byClass).forEach(([klass, names]) => {
    if (names.length > 1) {
      warnings.push({
        id: `duplicate-${klass}`,
        level: "warning",
        title: `Duplicate ${medClassLabel(klass).toLowerCase()} therapy`,
        detail: `${names.join(" and ")} are both prescribed. Confirm this is intentional and rationalise if not.`,
        why: "More than one medicine from the same class appears on the current list.",
      });
    }
  });

  /* RAAS double blockade */
  const raas = ["acei", "arb", "arni"].filter((klass) => hasClass(medications, klass));
  if (raas.length > 1) {
    warnings.push({
      id: "raas-double",
      level: "danger",
      title: "Dual renin-angiotensin blockade",
      detail: "An ACE inhibitor, ARB and ARNI should not be combined. Stop one agent and recheck potassium and renal function.",
      why: "Combining agents that block the renin-angiotensin system increases hyperkalaemia and acute kidney injury without added benefit.",
    });
  }

  /* Non-dihydropyridine CCB with a TKI */
  const cyp = nameHits(medications, CYP3A4_INHIBITORS);
  if (cyp.length && (context.bcrabl || context.vegf)) {
    warnings.push({
      id: "cyp3a4-tki",
      level: "warning",
      title: "CYP3A4 interaction with tyrosine kinase inhibitor",
      detail: `${cyp.map((m) => m.name).join(", ")} inhibits CYP3A4 and can raise tyrosine kinase inhibitor levels. Prefer a dihydropyridine calcium-channel blocker for blood pressure control and review the dose with pharmacy.`,
      why: "A strong CYP3A4 inhibitor is prescribed alongside a tyrosine kinase inhibitor metabolised by that pathway.",
    });
  }

  /* MRA or ACEi with CKD */
  if (context.ckd && (hasClass(medications, "mra") || raas.length)) {
    warnings.push({
      id: "renal-monitoring",
      level: "info",
      title: "Renal and potassium monitoring required",
      detail: "Recheck creatinine and potassium within one to two weeks of any dose change while chronic kidney disease is present.",
      why: "Renin-angiotensin blockade or an MRA is prescribed in the context of chronic kidney disease.",
    });
  }

  /* Missing cardioprotection */
  cardioprotectiveRecommendations(patient, encounter, signals)
    .filter((rec) => rec.strength === "Indicated" && !rec.onTreatment)
    .forEach((rec) => {
      warnings.push({
        id: `missing-${rec.id}`,
        level: "danger",
        title: `${rec.title} indicated but not prescribed`,
        detail: rec.guidance,
        why: `Triggered by ${rec.reasons[0]}.`,
      });
    });

  /* Anthracycline plus mediastinal radiotherapy */
  if (context.anthracycline && context.mediastinalRT) {
    warnings.push({
      id: "rt-anthracycline",
      level: "warning",
      title: "Anthracycline after mediastinal radiotherapy",
      detail: "Lower the threshold for surveillance echocardiography and biomarkers; prior chest radiotherapy potentiates anthracycline cardiotoxicity.",
      why: "Prior mediastinal or chest radiotherapy is documented alongside planned anthracycline exposure.",
    });
  }

  return warnings;
}

export const WARNING_TONES = {
  danger: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", chip: "bg-red-100 text-red-700" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", chip: "bg-amber-100 text-amber-700" },
  info: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", chip: "bg-sky-100 text-sky-700" },
};
