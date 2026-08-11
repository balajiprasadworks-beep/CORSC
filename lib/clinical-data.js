/* =========================================================================
   CORSC — Cardiac Oncology Risk Surveillance and Care
   Shared clinical reference data and the validated risk engine.

   This module holds every piece of clinical constant data used across the
   workflow so that individual sections stay presentational. The risk logic
   (calcRisk) and alert logic (computeAlerts) are carried over unchanged in
   behaviour from the original single-file implementation.
   ========================================================================= */

export const APP_NAME = "CORSC";
export const APP_FULL_NAME = "Cardiac Oncology Risk Surveillance and Care";

/* ---------------------------------------------------------------- therapy */

export const THERAPY_CLASSES = [
  { id: "anthracycline", name: "Anthracyclines", examples: "Doxorubicin, epirubicin, daunorubicin, idarubicin", note: "Cumulative-dose dependent LV dysfunction." },
  { id: "her2", name: "HER2-targeted therapy", examples: "Trastuzumab, pertuzumab, T-DM1", note: "Reversible LV dysfunction; higher risk after prior anthracycline." },
  { id: "vegf", name: "VEGF inhibitors", examples: "Bevacizumab, sunitinib, sorafenib", note: "Hypertension, thromboembolism, LV dysfunction." },
  { id: "bcrabl", name: "BCR-ABL tyrosine kinase inhibitors", examples: "Ponatinib, nilotinib, dasatinib", note: "Arterial occlusive and vascular events." },
  { id: "proteasome", name: "Proteasome inhibitors", examples: "Carfilzomib, bortezomib", note: "Heart failure, hypertension, arrhythmia." },
  { id: "rafmek", name: "RAF/MEK inhibitors", examples: "Dabrafenib/trametinib, vemurafenib/cobimetinib", note: "Usually asymptomatic LV dysfunction." },
  { id: "ici", name: "Immune checkpoint inhibitors", examples: "Pembrolizumab, nivolumab, ipilimumab", note: "Myocarditis surveillance is time-critical (first 3 doses)." },
  { id: "fluoropyrimidine", name: "Fluoropyrimidines", examples: "5-Fluorouracil (5-FU), capecitabine", note: "Coronary vasospasm and acute chest-pain syndromes." },
];

export function hasTherapy(therapy, therapyId) {
  return Array.isArray(therapy) ? therapy.includes(therapyId) : therapy === therapyId;
}

export function primaryTherapy(therapy) {
  return Array.isArray(therapy) ? therapy[0] : therapy;
}

export function therapyName(id) {
  return THERAPY_CLASSES.find((t) => t.id === id)?.name || id || "—";
}

/** Every planned therapy, for display. Patients may be on more than one. */
export function therapyNames(therapy) {
  const list = Array.isArray(therapy) ? therapy.filter(Boolean) : therapy ? [therapy] : [];
  return list.length ? list.map(therapyName).join(" + ") : "—";
}

export const CYCLE_FREQUENCIES = [
  "Every 7 days (weekly)",
  "Every 14 days (2-weekly)",
  "Every 21 days (3-weekly)",
  "Every 28 days (4-weekly)",
  "Continuous / daily oral",
  "Other schedule",
];

/* ------------------------------------------------------------ risk factors */

export const VERY_HIGH_FACTORS = [
  { id: "vh1", label: "Pre-existing heart failure or LVEF < 50%" },
  { id: "vh2", label: "Known cardiomyopathy" },
  { id: "vh3", label: "Prior anthracycline- or trastuzumab-related cardiotoxicity" },
];

export const HIGH_FACTORS = [
  { id: "h1", label: "Baseline LVEF < 50%" },
  { id: "h2", label: "Previous myocardial infarction / revascularisation" },
  { id: "h3", label: "Age ≥ 80 years" },
  { id: "h4", label: "Planned cumulative doxorubicin-equivalent dose 250–399 mg/m²" },
];

export const MODERATE2_FACTORS = [
  { id: "m2a", label: "Borderline LVEF 50–54%" },
  { id: "m2b", label: "Age 65–79 years" },
];

export const MODERATE1_FACTORS = [
  { id: "m1a", label: "Current or previous smoker" },
  { id: "m1b", label: "Obesity (BMI ≥ 30)" },
  { id: "m1c", label: "Diabetes mellitus" },
  { id: "m1d", label: "Chronic kidney disease" },
];

export const ALL_RISK_FACTORS = [
  ...VERY_HIGH_FACTORS.map((f) => ({ ...f, tier: "Very high", weight: "Very-high-risk factor" })),
  ...HIGH_FACTORS.map((f) => ({ ...f, tier: "High", weight: "High-risk factor" })),
  ...MODERATE2_FACTORS.map((f) => ({ ...f, tier: "Moderate", weight: "2 points" })),
  ...MODERATE1_FACTORS.map((f) => ({ ...f, tier: "Moderate", weight: "1 point" })),
];

/* ---------------------------------------------------------------- symptoms */

export const SYMPTOMS = [
  "Chest pain", "Dyspnoea", "Orthopnoea", "Paroxysmal nocturnal dyspnoea", "Palpitations",
  "Syncope", "Presyncope", "Dizziness", "Fatigue", "Reduced exercise tolerance",
  "Pedal oedema", "Cough", "Fever", "Weight gain", "Weight loss", "Other symptom",
];

export const RED_FLAG_SYMPTOMS = [
  "Chest pain", "Dyspnoea", "Orthopnoea", "Paroxysmal nocturnal dyspnoea",
  "Palpitations", "Syncope", "Presyncope", "Pedal oedema",
];

export const SEVERITY_OPTIONS = ["Mild", "Moderate", "Severe"];

export const SYMPTOM_DETAIL_FIELDS = [
  { id: "duration", label: "Duration", placeholder: "e.g. 3 days" },
  { id: "trigger", label: "Trigger", placeholder: "e.g. On exertion" },
  { id: "radiation", label: "Radiation", placeholder: "e.g. Left arm, jaw" },
  { id: "associated", label: "Associated symptoms", placeholder: "e.g. Sweating, nausea" },
];

/* ---------------------------------------------------------- investigations */

/**
 * `entry` selects the input the section renders. Numeric and ECG entries are
 * interpreted against reference limits as they are typed; everything else stays
 * free text with a manual interpretation.
 */
export const INVESTIGATIONS = [
  { id: "ecg", label: "ECG", unit: "", group: "Cardiac", entry: "ecg" },
  { id: "echo", label: "Echocardiography", unit: "", group: "Cardiac" },
  // GLS is conventionally negative, so deterioration is a fall in magnitude
  // (e.g. -20% to -13%). `magnitude` makes the trend maths compare absolute
  // values while the entered sign is preserved for display.
  { id: "gls", label: "Global Longitudinal Strain (GLS)", unit: "%", group: "Cardiac", trend: true, direction: "lowerWorse", magnitude: true, entry: "numeric" },
  { id: "lvef", label: "LVEF", unit: "%", group: "Cardiac", trend: true, direction: "lowerWorse", entry: "numeric" },
  { id: "troponin", label: "Troponin", unit: "ng/L", group: "Biomarker", trend: true, direction: "higherWorse", entry: "numeric" },
  { id: "ntprobnp", label: "NT-proBNP / BNP", unit: "pg/mL", group: "Biomarker", trend: true, direction: "higherWorse", entry: "numeric" },
  { id: "ldl", label: "LDL-cholesterol", unit: "mmol/L", group: "Metabolic", trend: true, direction: "higherWorse" },
  { id: "hba1c", label: "HbA1c", unit: "%", group: "Metabolic", trend: true, direction: "higherWorse" },
  { id: "cbc", label: "Complete blood count", unit: "", group: "Laboratory" },
  { id: "rft", label: "Renal function test", unit: "", group: "Laboratory" },
  { id: "lft", label: "Liver function test", unit: "", group: "Laboratory" },
  { id: "electrolytes", label: "Electrolytes", unit: "", group: "Laboratory" },
  { id: "additional", label: "Additional investigations", unit: "", group: "Laboratory" },
];

export const TRENDED_INVESTIGATIONS = INVESTIGATIONS.filter((i) => i.trend);

export const INTERPRETATION_OPTIONS = ["Normal", "Elevated", "Reduced", "Abnormal"];

/* ------------------------------------------------------------ examination */

/** Legacy flat exam fields — retained because the surveillance engine reads them. */
export const EXAM_FIELDS = [
  { id: "bp", label: "Blood pressure (mmHg)", ph: "e.g. 128/82" },
  { id: "pulse", label: "Pulse (bpm)", ph: "e.g. 78" },
  { id: "rr", label: "Respiratory rate", ph: "e.g. 16" },
  { id: "spo2", label: "SpO₂ (%)", ph: "e.g. 98" },
  { id: "temp", label: "Temperature (°C)", ph: "e.g. 36.9" },
  { id: "weight", label: "Weight (kg)", ph: "e.g. 72.4" },
  { id: "bmi", label: "BMI", ph: "e.g. 24.8" },
  { id: "jvp", label: "Jugular venous pressure", ph: "e.g. Not raised" },
  { id: "heart", label: "Heart sounds", ph: "e.g. S1S2 normal, no murmur" },
  { id: "lungs", label: "Lung examination", ph: "e.g. Clear bilaterally" },
  { id: "oedema", label: "Peripheral oedema", ph: "e.g. None" },
];

export const EXAM_SYSTEMS = [
  {
    id: "cvs",
    label: "CVS",
    full: "Cardiovascular system",
    components: [
      { id: "inspection", label: "Inspection", placeholder: "Praecordium, scars, visible pulsations" },
      { id: "palpation", label: "Palpation", placeholder: "Apex beat, thrills, heaves, JVP" },
      { id: "percussion", label: "Percussion", placeholder: "Cardiac dullness" },
      { id: "auscultation", label: "Auscultation", placeholder: "S1 S2, murmurs, gallop, rub" },
    ],
  },
  {
    id: "rs",
    label: "RS",
    full: "Respiratory system",
    components: [
      { id: "inspection", label: "Inspection", placeholder: "Chest movement, accessory muscle use" },
      { id: "palpation", label: "Palpation", placeholder: "Expansion, tactile fremitus, trachea" },
      { id: "percussion", label: "Percussion", placeholder: "Resonance, dullness, effusion" },
      { id: "auscultation", label: "Auscultation", placeholder: "Air entry, crackles, wheeze" },
    ],
  },
  {
    id: "pa",
    label: "P/A",
    full: "Per abdomen",
    components: [
      { id: "inspection", label: "Inspection", placeholder: "Distension, scars, visible masses" },
      { id: "palpation", label: "Palpation", placeholder: "Tenderness, organomegaly, masses" },
      { id: "percussion", label: "Percussion", placeholder: "Shifting dullness, fluid thrill" },
      { id: "auscultation", label: "Auscultation", placeholder: "Bowel sounds, bruits" },
    ],
  },
  {
    id: "cns",
    label: "CNS",
    full: "Central nervous system",
    components: [
      { id: "inspection", label: "Higher functions", placeholder: "Orientation, speech, GCS" },
      { id: "palpation", label: "Motor system", placeholder: "Tone, power, wasting" },
      { id: "percussion", label: "Reflexes", placeholder: "Deep tendon and plantar reflexes" },
      { id: "auscultation", label: "Sensory / cranial nerves", placeholder: "Sensation, cranial nerve findings" },
    ],
  },
];

/** Maps a system finding onto the flat exam key the surveillance engine reads. */
export const SYSTEM_TO_EXAM_KEY = { cvs: "heart", rs: "lungs" };

/* -------------------------------------------------------------- history */

export const HISTORY_GROUPS = [
  {
    id: "cancer",
    label: "Cancer history",
    hint: "Diagnosis timeline, prior lines, response",
    fields: [
      { id: "diagnosisDate", label: "Date of diagnosis", type: "date" },
      { id: "histology", label: "Histology / molecular subtype", placeholder: "e.g. ER+/HER2+ invasive ductal" },
      { id: "priorLines", label: "Prior lines of therapy", placeholder: "e.g. None / AC-T completed 2023" },
      { id: "currentIntent", label: "Treatment intent", type: "select", options: ["Curative", "Adjuvant", "Neoadjuvant", "Palliative", "Maintenance"] },
      { id: "notes", label: "Additional notes", type: "textarea" },
    ],
  },
  {
    id: "cardiovascular",
    label: "Cardiovascular history",
    hint: "Established cardiac disease",
    checklist: [
      { id: "hf", label: "Heart failure" },
      { id: "cad", label: "Coronary artery disease / prior MI" },
      { id: "angina", label: "Stable angina" },
      { id: "revasc", label: "Prior revascularisation (PCI or CABG)" },
      { id: "af", label: "Atrial fibrillation, flutter or ventricular arrhythmia" },
      { id: "valve", label: "Severe valvular heart disease" },
      { id: "cardiomyopathy", label: "Cardiomyopathy" },
      { id: "stroke", label: "Stroke or TIA" },
      { id: "pad", label: "Peripheral arterial disease" },
      { id: "vte", label: "Previous venous thromboembolism (DVT or PE)" },
      { id: "amyloidosis", label: "Cardiac AL amyloidosis" },
      { id: "device", label: "Pacemaker or ICD in situ" },
    ],
    fields: [{ id: "notes", label: "Cardiovascular detail", type: "textarea", placeholder: "Dates, interventions, current status" }],
  },
  {
    id: "riskFactors",
    label: "Risk factors",
    hint: "Modifiable cardiovascular risk",
    checklist: [
      { id: "htn", label: "Hypertension" },
      { id: "dm", label: "Diabetes mellitus" },
      { id: "dyslipidaemia", label: "Dyslipidaemia" },
      { id: "ckd", label: "Chronic kidney disease" },
      { id: "obesity", label: "Obesity (BMI ≥ 30)" },
      { id: "osa", label: "Obstructive sleep apnoea" },
      { id: "thyroid", label: "Thyroid disease" },
      { id: "mediastinalRT", label: "Prior mediastinal / chest radiotherapy" },
    ],
    fields: [{ id: "notes", label: "Risk factor detail", type: "textarea" }],
  },
  {
    id: "family",
    label: "Family history",
    hint: "Premature cardiac disease, cardiomyopathy",
    checklist: [
      { id: "prematureCAD", label: "Premature coronary disease (< 55 M / < 65 F)" },
      { id: "cardiomyopathy", label: "Familial cardiomyopathy" },
      { id: "suddenDeath", label: "Sudden cardiac death" },
      { id: "cancer", label: "Familial cancer syndrome" },
    ],
    fields: [{ id: "notes", label: "Family history detail", type: "textarea" }],
  },
  {
    id: "lifestyle",
    label: "Lifestyle history",
    hint: "Smoking, alcohol, activity",
    fields: [
      { id: "smoking", label: "Smoking status", type: "select", options: ["Never", "Ex-smoker", "Current smoker"] },
      { id: "packYears", label: "Pack years", placeholder: "e.g. 15" },
      { id: "alcohol", label: "Alcohol", type: "select", options: ["Nil", "Occasional", "Regular", "Excess"] },
      { id: "activity", label: "Physical activity", type: "select", options: ["Sedentary", "Light", "Moderate", "Active"] },
      { id: "notes", label: "Lifestyle detail", type: "textarea" },
    ],
  },
  {
    id: "medication",
    label: "Medication history",
    hint: "Long-term and recent medicines",
    fields: [
      { id: "current", label: "Current long-term medication", type: "textarea", placeholder: "One per line" },
      { id: "allergies", label: "Allergies / intolerances", placeholder: "e.g. ACE inhibitor cough" },
      { id: "adherence", label: "Adherence", type: "select", options: ["Good", "Partial", "Poor", "Not assessed"] },
    ],
  },
  {
    id: "priorTreatment",
    label: "Prior treatment history",
    hint: "Previous cardiotoxic exposure",
    fields: [
      { id: "priorAnthracycline", label: "Prior anthracycline dose (mg/m²)", placeholder: "e.g. 180" },
      { id: "priorTrastuzumab", label: "Prior HER2-targeted therapy", placeholder: "e.g. Trastuzumab 2022, 12 cycles" },
      { id: "priorRT", label: "Prior radiotherapy field and dose", placeholder: "e.g. Left chest wall 50 Gy" },
      { id: "priorToxicity", label: "Previous cardiotoxicity", type: "textarea", placeholder: "Nature, management, recovery" },
    ],
  },
];

/* ---------------------------------------------------- first OPD review */

export const TOLERANCE_OPTIONS = ["Well tolerated", "Minor toxicity", "Significant toxicity", "Treatment delayed", "Treatment stopped"];

export const FIRST_REVIEW_FIELDS = [
  { id: "interimEvents", label: "Interim events since last contact", type: "textarea", placeholder: "New diagnoses, procedures, infections, transfusions" },
  { id: "admissions", label: "Hospital admissions", type: "textarea", placeholder: "Dates, reason, duration, outcome" },
  { id: "clinicalConcerns", label: "Clinical concerns raised by patient or carer", type: "textarea" },
  { id: "earlyToxicity", label: "Early toxicity concerns", type: "textarea", placeholder: "Cardiac, haematological, neurological, mucosal" },
];

/* ------------------------------------------------------------ risk engine */

export function calcRisk(veryHigh, high, m2, m1) {
  const vhChecked = Object.values(veryHigh || {}).some(Boolean);
  const hChecked = Object.values(high || {}).some(Boolean);
  const m2Count = Object.values(m2 || {}).filter(Boolean).length;
  const m1Count = Object.values(m1 || {}).filter(Boolean).length;
  const points = m2Count * 2 + m1Count * 1;
  let category = "Low";
  let reason = "No risk factors present";
  if (vhChecked) { category = "Very High"; reason = "Very-high-risk factor present"; }
  else if (hChecked) { category = "High"; reason = "High-risk factor present"; }
  else if (points >= 2) { category = "High"; reason = `${points} moderate-risk point(s)`; }
  else if (points === 1) { category = "Moderate"; reason = "1 moderate-risk point"; }
  return { category, points, reason };
}

export const RISK_ORDER = ["Low", "Moderate", "High", "Very High"];

export const RISK_STYLES = {
  Low: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500", ring: "ring-emerald-200" },
  Moderate: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500", dot: "bg-amber-500", ring: "ring-amber-200" },
  High: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-500", dot: "bg-orange-500", ring: "ring-orange-200" },
  "Very High": { text: "text-red-700", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-600", dot: "bg-red-600", ring: "ring-red-200" },
};

export function riskStyle(category) {
  return RISK_STYLES[category] || RISK_STYLES.Low;
}

export const FOLLOW_UP_DAYS = { Low: 42, Moderate: 28, High: 21, "Very High": 14 };

export const RISK_MONITORING_PLAN = {
  Low: [
    "Clinical review and blood pressure at every treatment cycle",
    "Echocardiography at baseline, end of treatment and 12 months",
    "Biomarkers at mid-treatment and treatment completion",
  ],
  Moderate: [
    "Clinical review, ECG and blood pressure at every cycle",
    "Troponin and natriuretic peptide every two cycles",
    "Echocardiography with GLS every four cycles",
  ],
  High: [
    "Cardiovascular examination, ECG and biomarkers at every cycle",
    "Echocardiography with GLS every two cycles",
    "Consider primary cardioprotection with ACE inhibitor or ARB and beta-blocker",
  ],
  "Very High": [
    "Cardio-oncology review before starting and at every cycle",
    "Echocardiography with GLS every two cycles and biomarkers every cycle",
    "Primary cardioprotection and multidisciplinary discussion before each escalation",
  ],
};

/* ------------------------------------------------------- clinical alerts */

/**
 * Clinical alerts for the current encounter.
 *
 * `signals` carries the graded cardiac dysfunction from lib/ctrcd.js. This
 * function previously carried its own LVEF threshold - a fall of 10 points to
 * below 53% - which was one of four different definitions in the codebase and
 * matched none of the guideline grades.
 */
export function computeAlerts(patient, visit, signals = {}) {
  const alerts = [];
  const symptoms = (visit && visit.symptoms) || [];
  const exam = (visit && visit.exam) || {};
  const hasVEGF = hasTherapy(patient.therapy, "vegf");
  const hasBcrAbl = hasTherapy(patient.therapy, "bcrabl");
  const ctrcd = signals.ctrcd;

  if (signals.elevatedTroponin) {
    alerts.push({
      id: "troponin",
      level: "danger",
      title: "Elevated troponin",
      desc: "Troponin rise from baseline detected. Increase surveillance frequency; consider cardioprotective therapy and cardio-oncology review.",
    });
  }
  if (signals.suspectedICIMyocarditis) {
    alerts.push({
      id: "ici-myocarditis",
      level: "danger",
      title: "Possible ICI-associated myocarditis",
      // Not gated on symptoms or ejection fraction: fulminant myocarditis can
      // present with both normal, and screening exists to catch it first.
      desc: "Any troponin rise on a checkpoint inhibitor requires work-up. Discontinue immunotherapy; admit; initiate high-dose corticosteroids; urgent cardiac MRI and biopsy consideration.",
    });
  }
  if (ctrcd?.present) {
    alerts.push({
      id: "ctrcd",
      level: ctrcd.tone === "danger" ? "danger" : "warning",
      title: `Cancer therapy–related cardiac dysfunction — ${ctrcd.shortLabel.toLowerCase()}`,
      desc: `${ctrcd.criteria.join(". ")}. ${ctrcd.management.join(" ")}`,
    });
  } else if (ctrcd?.unresolved) {
    alerts.push({
      id: "ctrcd-unresolved",
      level: "warning",
      title: "Cardiac dysfunction cannot be graded",
      desc: `${ctrcd.criteria.join(". ")}. ${ctrcd.management.join(" ")}`,
    });
  }
  const hfSymptoms = symptoms.filter((s) =>
    ["Dyspnoea", "Orthopnoea", "Paroxysmal nocturnal dyspnoea", "Pedal oedema"].includes(s)
  ).length;
  if (hfSymptoms >= 2) {
    alerts.push({
      id: "heart-failure",
      level: "warning",
      title: "Possible heart failure",
      desc: "Two or more heart-failure symptoms reported. Examine for elevated JVP, crackles, oedema; consider NT-proBNP and echocardiography.",
    });
  }
  if (hasVEGF && exam.bp) {
    const m = String(exam.bp).match(/(\d+)\s*\/\s*(\d+)/);
    if (m && (parseInt(m[1], 10) >= 160 || parseInt(m[2], 10) >= 100)) {
      alerts.push({
        id: "vegf-htn",
        level: "danger",
        title: "Hypertensive crisis — VEGF inhibitor related",
        desc: "BP ≥ 160/100 mmHg on a VEGF-pathway inhibitor. Treat urgently; consider dose interruption if uncontrolled.",
      });
    }
  }
  if (hasBcrAbl && symptoms.includes("Chest pain")) {
    alerts.push({
      id: "bcrabl-vascular",
      level: "warning",
      title: "Possible arterial occlusive event",
      desc: "Chest pain on a BCR-ABL TKI. Evaluate urgently for MI, stroke or peripheral arterial ischaemia.",
    });
  }
  return alerts;
}

/* ------------------------------------------------------ contraindications */

export const ABSOLUTE_CI = [
  { id: "myocarditis", label: "Active myocarditis or recent immune-related myocarditis" },
  { id: "autoimmune", label: "Uncontrolled autoimmune myocardial disease" },
];

export const RELATIVE_CI = [
  { id: "troponinUnclear", label: "Baseline troponin elevation of unclear cause" },
  { id: "autoimmuneCardiac", label: "Pre-existing autoimmune disease with cardiac involvement" },
  { id: "priorIRAE", label: "Prior high-grade immune-related adverse event" },
];

/* ------------------------------------------------------------- drug guide */

export const DRUG_DB = {
  anthracycline: {
    name: "Doxorubicin (anthracyclines)",
    tag: "Topoisomerase-II inhibitor",
    moa: "Topoisomerase-IIβ-mediated DNA double-strand breaks and free-radical generation cause direct, cumulative, dose-dependent cardiomyocyte injury.",
    tox: "Cumulative-dose dependent LV dysfunction and heart failure (CTRCD), rare acute pericarditis/arrhythmia.",
    baseline: ["12-lead ECG and echocardiography (LVEF + GLS) in all patients", "Troponin and NT-proBNP, especially if high/very-high risk", "Document planned cumulative dose and cardiovascular risk factors"],
    monitoring: ["Echocardiography (LVEF + GLS) every 2 cycles in high/very-high risk, otherwise at protocol intervals", "Troponin before each cycle in high-risk patients", "Track cumulative doxorubicin-equivalent dose — reassess closely from 250 mg/m²", "GLS relative fall > 15% is an early marker of subclinical dysfunction"],
    postTx: ["Echocardiography + biomarkers at end of treatment, 3, 6 and 12 months", "Annual review to 5 years if high-risk or any dysfunction occurred"],
    redFlags: ["New or worsening dyspnoea, orthopnoea, oedema", "LVEF fall ≥ 10 points to < 50%", "GLS relative fall > 15% from baseline", "Any troponin rise from baseline"],
    management: ["Dose modification or discontinuation if CTRCD develops", "Start ACEi/ARB and beta-blocker cardioprotection", "Consider dexrazoxane above 300 mg/m² doxorubicin-equivalent", "Early cardio-oncology referral for any LVEF fall"],
    pearls: ["Risk rises steeply beyond 250 mg/m² doxorubicin-equivalent", "Liposomal formulations carry lower cardiotoxicity", "Prior mediastinal radiotherapy potentiates risk — lower the threshold for surveillance"],
  },
  her2: {
    name: "Trastuzumab (HER2-targeted therapy)",
    tag: "Anti-HER2 monoclonal antibody",
    moa: "ERBB2/HER2 blockade disrupts cardiomyocyte pro-survival signalling; typically produces reversible, non-cumulative LV dysfunction (Type II).",
    tox: "Reversible LV dysfunction / heart failure; risk markedly higher with prior or concurrent anthracycline exposure.",
    baseline: ["Echocardiography (LVEF + GLS) and ECG in all patients", "Troponin/NT-proBNP if high-risk or prior anthracycline"],
    monitoring: ["Echocardiography every 3 months during therapy (or per protocol)", "Hold drug if LVEF falls ≥ 10 points to < 50%, or any symptomatic heart failure", "Repeat echocardiography in 3–4 weeks after a hold"],
    postTx: ["Echocardiography at treatment completion", "Echocardiography at 6 and 12 months if any dysfunction occurred on treatment"],
    redFlags: ["LVEF fall to < 50%", "New heart failure symptoms", "Cumulative risk if given sequentially after anthracycline"],
    management: ["Temporary hold + cardioprotective therapy (ACEi/ARB, beta-blocker)", "Most patients recover LVEF and can resume therapy once recovered", "Multidisciplinary discussion if recovery is incomplete"],
    pearls: ["Cardiotoxicity is usually reversible on discontinuation, unlike anthracyclines", "Sequencing anthracycline before (not concurrent with) trastuzumab lowers risk"],
  },
  vegf: {
    name: "Bevacizumab / sunitinib / sorafenib (VEGF inhibitors)",
    tag: "Anti-angiogenic agents",
    moa: "VEGF pathway blockade impairs nitric-oxide signalling and causes endothelial dysfunction and capillary rarefaction.",
    tox: "Hypertension (very common, often an on-target effect), arterial and venous thromboembolism, LV dysfunction, occasional QT prolongation.",
    baseline: ["Blood pressure, ECG (QTc), electrolytes", "Echocardiography if pre-existing cardiovascular risk factors"],
    monitoring: ["BP at every visit (weekly during early titration); treat to < 140/90 mmHg", "Periodic echocardiography if symptomatic or high cardiovascular risk", "ECG for QTc with QT-prolonging combinations"],
    postTx: ["Continue BP monitoring after stopping — hypertension may persist", "Echocardiography if LV dysfunction occurred on treatment"],
    redFlags: ["BP ≥ 160/100 mmHg or hypertensive crisis", "Chest pain, limb ischaemia symptoms", "New heart failure symptoms"],
    management: ["ACEi/ARB or dihydropyridine calcium-channel blockers preferred for BP control", "Dose interruption/reduction for uncontrolled hypertension or thromboembolism", "Avoid non-dihydropyridine CCBs with CYP3A4-interacting TKIs"],
    pearls: ["Hypertension can serve as a pharmacodynamic biomarker of VEGF blockade", "Aggressive BP control improves oncologic tolerability, not just cardiac safety"],
  },
  bcrabl: {
    name: "Ponatinib / nilotinib (BCR-ABL TKIs)",
    tag: "Tyrosine kinase inhibitors",
    moa: "Off-target vascular kinase inhibition accelerates atherosclerosis and promotes vasospasm.",
    tox: "Arterial occlusive events (MI, stroke, peripheral arterial disease), QT prolongation (nilotinib), pulmonary hypertension (dasatinib).",
    baseline: ["Full cardiovascular risk assessment: lipids, HbA1c, blood pressure", "ECG (QTc); ankle-brachial index if PAD risk"],
    monitoring: ["BP and lipid monitoring at each visit", "Periodic ECG for QTc", "Active screening for claudication or limb ischaemia symptoms", "Echocardiogram if pulmonary hypertension suspected (dasatinib)"],
    postTx: ["Continue long-term vascular risk monitoring — atherosclerotic risk persists after stopping"],
    redFlags: ["New limb pain, pallor or pulselessness", "Chest pain or focal neurological deficit", "QTc > 500 ms"],
    management: ["Aggressive risk-factor modification: statin, BP and glycaemic control", "Consider switching agent after a severe vascular event", "Avoid co-medications that further prolong QT"],
    pearls: ["Ponatinib carries the highest arterial occlusive risk of this class", "Vascular risk is cumulative with treatment duration — reassess at every visit"],
  },
  proteasome: {
    name: "Carfilzomib / bortezomib (proteasome inhibitors)",
    tag: "Proteasome inhibitors",
    moa: "Proteasome inhibition impairs cardiomyocyte protein quality control and mitochondrial function; carfilzomib is more cardiotoxic than bortezomib.",
    tox: "Heart failure, hypertension, arrhythmia (especially carfilzomib), pulmonary hypertension.",
    baseline: ["Echocardiography (LVEF), blood pressure, ECG", "NT-proBNP if high-risk"],
    monitoring: ["BP at every cycle", "Symptom review for dyspnoea/oedema each visit", "Echocardiography if new symptoms develop", "NT-proBNP trend in high-risk patients"],
    postTx: ["Echocardiography if any cardiac event occurred during treatment"],
    redFlags: ["Acute dyspnoea, especially peri-infusion (carfilzomib)", "BP surge", "New arrhythmia"],
    management: ["Control BP before dose escalation", "Hold or dose-reduce carfilzomib for grade ≥ 3 cardiac events", "Diuretics/heart-failure therapy as indicated"],
    pearls: ["Carfilzomib cardiotoxicity can be acute, within hours of infusion", "Pre-hydration and slow dose titration reduce risk"],
  },
  rafmek: {
    name: "Dabrafenib/trametinib (RAF/MEK inhibitors)",
    tag: "MAPK-pathway inhibitors",
    moa: "MEK inhibition reduces cardiomyocyte pro-survival ERK signalling; usually produces asymptomatic, reversible LV dysfunction.",
    tox: "Asymptomatic LV dysfunction, hypertension, QT prolongation (vemurafenib-containing regimens).",
    baseline: ["Echocardiography (LVEF), ECG (QTc), blood pressure"],
    monitoring: ["Echocardiography at 1 month, then every 2–3 months", "ECG for QTc with vemurafenib-containing regimens", "BP checks each visit"],
    postTx: ["Echocardiography at completion if any dysfunction was noted on treatment"],
    redFlags: ["LVEF fall ≥ 10 points to < 50%", "QTc prolongation", "New heart failure symptoms (uncommon)"],
    management: ["Temporary hold and cardiology review for LVEF fall", "Most patients recover with dose interruption"],
    pearls: ["LV dysfunction is usually subclinical — do not skip scheduled surveillance echocardiography even if asymptomatic"],
  },
  fluoropyrimidine: {
    name: "5-Fluorouracil / capecitabine (fluoropyrimidines)",
    tag: "Antimetabolite chemotherapy",
    moa: "Fluoropyrimidines can cause coronary vasospasm and endothelial injury, most often during or shortly after exposure.",
    tox: "Acute chest pain, coronary vasospasm, acute coronary syndrome, arrhythmia, and rarely myocarditis or cardiomyopathy.",
    baseline: ["Symptom assessment and 12-lead ECG", "Document prior coronary disease and cardiovascular risk factors"],
    monitoring: ["Screen for chest pain at every infusion", "Obtain ECG and troponin immediately for chest pain", "Arrange echocardiography and cardiology review when clinically indicated"],
    postTx: ["Review any on-treatment chest pain or cardiovascular event before future fluoropyrimidine exposure"],
    redFlags: ["New chest pain during or after infusion", "Syncope, palpitations, or acute dyspnoea"],
    management: ["Urgent ECG, troponin, echocardiography if indicated, and cardiology review", "Discuss temporary chemotherapy hold and rechallenge strategy with oncology"],
    pearls: ["Symptoms can occur during the first cycle and may recur with rechallenge", "Do not dismiss chest pain during fluoropyrimidine exposure as non-cardiac without assessment"],
  },
  ici: {
    name: "Pembrolizumab / nivolumab (immune checkpoint inhibitors)",
    tag: "PD-1 / PD-L1 / CTLA-4 blockade",
    moa: "Checkpoint blockade unmasks an autoreactive T-cell response that can target cardiac tissue, producing autoimmune myocarditis.",
    tox: "Myocarditis (rare, ~1–2%, but disproportionately high mortality), pericarditis, arrhythmia, vasculitis, Takotsubo-like syndrome.",
    baseline: ["ECG, troponin and NT-proBNP mandatory before cycle 1 in all patients", "Echocardiography if cardiovascular risk factors present"],
    monitoring: ["Troponin before each of the first 3 doses — myocarditis risk is highest in the first 6–12 weeks", "ECG if any new symptoms", "Low threshold for cardiac MRI if troponin rises"],
    postTx: ["Maintain vigilance for several months after cycle 1–2 — most myocarditis occurs within the first 3 months"],
    redFlags: ["ANY troponin rise from baseline, regardless of absolute value", "New chest pain, dyspnoea or palpitations", "Muscle weakness, diplopia or ptosis — concurrent myositis/myasthenia overlap carries very high risk", "Arrhythmia or syncope"],
    management: ["STOP immunotherapy immediately if myocarditis is suspected", "Admit; urgent cardiology/cardio-oncology consult", "High-dose IV corticosteroids (e.g. methylprednisolone 1 g/day)", "Consider second-line immunosuppression (ATG, mycophenolate, abatacept; avoid infliximab if heart failure present) for steroid-refractory disease", "Urgent cardiac MRI ± endomyocardial biopsy"],
    pearls: ["Troponin is the single most sensitive screening marker — any rise warrants work-up", "Myocarditis + myositis + myasthenia triad markedly worsens prognosis", "Fulminant myocarditis can present with a normal LVEF early — never reassure on LVEF alone"],
  },
};
