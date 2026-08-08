"use client";

/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Heart, Activity, AlertTriangle, ShieldAlert, ShieldCheck, ClipboardList, Calendar,
  TrendingDown, Stethoscope, BookOpen, ChevronDown, Plus, Save,
  RefreshCw, ArrowRight, CheckCircle2, Circle, AlertCircle, Search, Users, FileDown,
  Printer, Sparkles, ClipboardCheck, ArrowLeft, Syringe, LogOut
} from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { DiagnosisStageSelector } from "@/components/diagnosis-stage-selector";
import { Button } from "@/components/ui/button";
import {
  getDynamicSurveillanceTasks,
  getNextFollowUpPlan,
  getVisitCycle,
  isTaskComplete,
} from "@/lib/surveillance-engine";

/* =========================================================================
   DESIGN TOKENS
   ink   #0B1F3A  paper #F6F7F5  line #E2E5E0
   teal  #0F6E6E  clay  #B3261E (very-high) orange #C05621 (high)
   amber #B7791F (moderate) green #1E8A5A (low)
   Display: 'Source Serif 4' | Body: 'Inter' | Data: 'JetBrains Mono'
   ========================================================================= */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');`;

const serif = { fontFamily: "'Source Serif 4', Georgia, serif" };
const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

/* =========================================================================
   CLINICAL REFERENCE DATA
   ========================================================================= */

const THERAPY_CLASSES = [
  { id: "anthracycline", name: "Anthracyclines", examples: "Doxorubicin, epirubicin, daunorubicin, idarubicin", note: "Cumulative-dose dependent LV dysfunction." },
  { id: "her2", name: "HER2-targeted therapy", examples: "Trastuzumab, pertuzumab, T-DM1", note: "Reversible LV dysfunction; higher risk after prior anthracycline." },
  { id: "vegf", name: "VEGF inhibitors", examples: "Bevacizumab, sunitinib, sorafenib", note: "Hypertension, thromboembolism, LV dysfunction." },
  { id: "bcrabl", name: "BCR-ABL tyrosine kinase inhibitors", examples: "Ponatinib, nilotinib, dasatinib", note: "Arterial occlusive and vascular events." },
  { id: "proteasome", name: "Proteasome inhibitors", examples: "Carfilzomib, bortezomib", note: "Heart failure, hypertension, arrhythmia." },
  { id: "rafmek", name: "RAF/MEK inhibitors", examples: "Dabrafenib/trametinib, vemurafenib/cobimetinib", note: "Usually asymptomatic LV dysfunction." },
  { id: "ici", name: "Immune checkpoint inhibitors", examples: "Pembrolizumab, nivolumab, ipilimumab", note: "Myocarditis surveillance is time-critical (first 3 doses)." },
  { id: "fluoropyrimidine", name: "Fluoropyrimidines", examples: "5-Fluorouracil (5-FU), capecitabine", note: "Coronary vasospasm and acute chest-pain syndromes." },
];

function hasTherapy(therapy, therapyId) {
  return Array.isArray(therapy) ? therapy.includes(therapyId) : therapy === therapyId;
}

function primaryTherapy(therapy) {
  return Array.isArray(therapy) ? therapy[0] : therapy;
}

const VERY_HIGH_FACTORS = [
  { id: "vh1", label: "Pre-existing heart failure or LVEF < 50%" },
  { id: "vh2", label: "Known cardiomyopathy" },
  { id: "vh3", label: "Prior anthracycline- or trastuzumab-related cardiotoxicity" },
];

const HIGH_FACTORS = [
  { id: "h1", label: "Baseline LVEF < 50%" },
  { id: "h2", label: "Previous myocardial infarction / revascularisation" },
  { id: "h3", label: "Age \u2265 80 years" },
  { id: "h4", label: "Planned cumulative doxorubicin-equivalent dose 250\u2013399 mg/m\u00B2" },
];

const MODERATE2_FACTORS = [
  { id: "m2a", label: "Borderline LVEF 50\u201354%" },
  { id: "m2b", label: "Age 65\u201379 years" },
];

const MODERATE1_FACTORS = [
  { id: "m1a", label: "Current or previous smoker" },
  { id: "m1b", label: "Obesity (BMI \u2265 30)" },
  { id: "m1c", label: "Diabetes mellitus" },
  { id: "m1d", label: "Chronic kidney disease" },
];

const SYMPTOMS = [
  "Chest pain", "Dyspnoea", "Orthopnoea", "Paroxysmal nocturnal dyspnoea", "Palpitations",
  "Syncope", "Presyncope", "Dizziness", "Fatigue", "Reduced exercise tolerance",
  "Pedal oedema", "Cough", "Fever", "Weight gain", "Weight loss", "Other symptom",
];

const INVESTIGATIONS = [
  { id: "ecg", label: "ECG" },
  { id: "echo", label: "Echocardiography" },
  { id: "gls", label: "Global Longitudinal Strain (GLS)" },
  { id: "lvef", label: "LVEF (%)" },
  { id: "troponin", label: "Troponin" },
  { id: "ntprobnp", label: "NT-proBNP / BNP" },
  { id: "cbc", label: "Complete blood count" },
  { id: "rft", label: "Renal function test" },
  { id: "lft", label: "Liver function test" },
  { id: "electrolytes", label: "Electrolytes" },
  { id: "additional", label: "Additional investigations" },
];

const EXAM_FIELDS = [
  { id: "bp", label: "Blood pressure (mmHg)", ph: "e.g. 128/82" },
  { id: "pulse", label: "Pulse (bpm)", ph: "e.g. 78" },
  { id: "rr", label: "Respiratory rate", ph: "e.g. 16" },
  { id: "spo2", label: "SpO\u2082 (%)", ph: "e.g. 98" },
  { id: "temp", label: "Temperature (\u00B0C)", ph: "e.g. 36.9" },
  { id: "weight", label: "Weight (kg)", ph: "e.g. 72.4" },
  { id: "bmi", label: "BMI", ph: "e.g. 24.8" },
  { id: "jvp", label: "Jugular venous pressure", ph: "e.g. Not raised" },
  { id: "heart", label: "Heart sounds", ph: "e.g. S1S2 normal, no murmur" },
  { id: "lungs", label: "Lung examination", ph: "e.g. Clear bilaterally" },
  { id: "oedema", label: "Peripheral oedema", ph: "e.g. None" },
];

const INVESTIGATION_TRACKER = [
  { section: "Baseline", items: ["ECG", "TTE (LVEF + GLS)", "Troponin", "NT-proBNP", "CBC", "RFT", "LFT", "Electrolytes"] },
  { section: "Before each chemotherapy cycle", items: ["Symptom review", "BP + pulse", "Troponin (if high-risk)", "NT-proBNP (if high-risk)", "Cumulative dose review"] },
  { section: "During chemotherapy", items: ["TTE every 2\u20134 cycles per risk", "Troponin trends", "NT-proBNP trends", "ECG for QTc if indicated"] },
  { section: "End of treatment", items: ["TTE (LVEF + GLS)", "Troponin", "NT-proBNP", "Full CV re-stratification"] },
  { section: "Long-term follow-up", items: ["TTE at 3 & 12 months", "Long-term TTE at years 3 and 5 (high-risk)", "Annual CV risk review"] },
];

const DRUG_DB = {
  anthracycline: {
    name: "Doxorubicin (anthracyclines)",
    tag: "Topoisomerase-II inhibitor",
    moa: "Topoisomerase-II\u03b2-mediated DNA double-strand breaks and free-radical generation cause direct, cumulative, dose-dependent cardiomyocyte injury.",
    tox: "Cumulative-dose dependent LV dysfunction and heart failure (CTRCD), rare acute pericarditis/arrhythmia.",
    baseline: ["12-lead ECG and TTE (LVEF + GLS) in all patients", "Troponin and NT-proBNP, especially if high/very-high risk", "Document planned cumulative dose and cardiovascular risk factors"],
    monitoring: ["TTE (LVEF + GLS) every 2 cycles in high/very-high risk, otherwise at protocol intervals", "Troponin before each cycle in high-risk patients", "Track cumulative doxorubicin-equivalent dose \u2014 reassess closely from 250 mg/m\u00B2", "GLS relative fall > 15% is an early marker of subclinical dysfunction"],
    postTx: ["TTE + biomarkers at end of treatment, 3, 6 and 12 months", "Annual review to 5 years if high-risk or any dysfunction occurred"],
    redFlags: ["New or worsening dyspnoea, orthopnoea, oedema", "LVEF fall \u2265 10 points to < 50%", "GLS relative fall > 15% from baseline", "Any troponin rise from baseline"],
    management: ["Dose modification or discontinuation if CTRCD develops", "Start ACEi/ARB and beta-blocker cardioprotection", "Consider dexrazoxane above 300 mg/m\u00B2 doxorubicin-equivalent", "Early cardio-oncology referral for any LVEF fall"],
    pearls: ["Risk rises steeply beyond 250 mg/m\u00B2 doxorubicin-equivalent", "Liposomal formulations carry lower cardiotoxicity", "Prior mediastinal radiotherapy potentiates risk \u2014 lower the threshold for surveillance"],
  },
  her2: {
    name: "Trastuzumab (HER2-targeted therapy)",
    tag: "Anti-HER2 monoclonal antibody",
    moa: "ERBB2/HER2 blockade disrupts cardiomyocyte pro-survival signalling; typically produces reversible, non-cumulative LV dysfunction (Type II).",
    tox: "Reversible LV dysfunction / heart failure; risk markedly higher with prior or concurrent anthracycline exposure.",
    baseline: ["TTE (LVEF + GLS) and ECG in all patients", "Troponin/NT-proBNP if high-risk or prior anthracycline"],
    monitoring: ["TTE every 3 months during therapy (or per protocol)", "Hold drug if LVEF falls \u2265 10 points to < 50%, or any symptomatic heart failure", "Repeat TTE in 3\u20134 weeks after a hold"],
    postTx: ["TTE at treatment completion", "TTE at 6 and 12 months if any dysfunction occurred on treatment"],
    redFlags: ["LVEF fall to < 50%", "New heart failure symptoms", "Cumulative risk if given sequentially after anthracycline"],
    management: ["Temporary hold + cardioprotective therapy (ACEi/ARB, beta-blocker)", "Most patients recover LVEF and can resume therapy once recovered", "Multidisciplinary discussion if recovery is incomplete"],
    pearls: ["Cardiotoxicity is usually reversible on discontinuation, unlike anthracyclines", "Sequencing anthracycline before (not concurrent with) trastuzumab lowers risk"],
  },
  vegf: {
    name: "Bevacizumab / sunitinib / sorafenib (VEGF inhibitors)",
    tag: "Anti-angiogenic agents",
    moa: "VEGF pathway blockade impairs nitric-oxide signalling and causes endothelial dysfunction and capillary rarefaction.",
    tox: "Hypertension (very common, often an on-target effect), arterial and venous thromboembolism, LV dysfunction, occasional QT prolongation.",
    baseline: ["Blood pressure, ECG (QTc), electrolytes", "TTE if pre-existing cardiovascular risk factors"],
    monitoring: ["BP at every visit (weekly during early titration); treat to < 140/90 mmHg", "Periodic TTE if symptomatic or high cardiovascular risk", "ECG for QTc with QT-prolonging combinations"],
    postTx: ["Continue BP monitoring after stopping \u2014 hypertension may persist", "TTE if LV dysfunction occurred on treatment"],
    redFlags: ["BP \u2265 160/100 mmHg or hypertensive crisis", "Chest pain, limb ischaemia symptoms", "New heart failure symptoms"],
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
    postTx: ["Continue long-term vascular risk monitoring \u2014 atherosclerotic risk persists after stopping"],
    redFlags: ["New limb pain, pallor or pulselessness", "Chest pain or focal neurological deficit", "QTc > 500 ms"],
    management: ["Aggressive risk-factor modification: statin, BP and glycaemic control", "Consider switching agent after a severe vascular event", "Avoid co-medications that further prolong QT"],
    pearls: ["Ponatinib carries the highest arterial occlusive risk of this class", "Vascular risk is cumulative with treatment duration \u2014 reassess at every visit"],
  },
  proteasome: {
    name: "Carfilzomib / bortezomib (proteasome inhibitors)",
    tag: "Proteasome inhibitors",
    moa: "Proteasome inhibition impairs cardiomyocyte protein quality control and mitochondrial function; carfilzomib is more cardiotoxic than bortezomib.",
    tox: "Heart failure, hypertension, arrhythmia (especially carfilzomib), pulmonary hypertension.",
    baseline: ["TTE (LVEF), blood pressure, ECG", "NT-proBNP if high-risk"],
    monitoring: ["BP at every cycle", "Symptom review for dyspnoea/oedema each visit", "TTE if new symptoms develop", "NT-proBNP trend in high-risk patients"],
    postTx: ["TTE if any cardiac event occurred during treatment"],
    redFlags: ["Acute dyspnoea, especially peri-infusion (carfilzomib)", "BP surge", "New arrhythmia"],
    management: ["Control BP before dose escalation", "Hold or dose-reduce carfilzomib for grade \u2265 3 cardiac events", "Diuretics/heart-failure therapy as indicated"],
    pearls: ["Carfilzomib cardiotoxicity can be acute, within hours of infusion", "Pre-hydration and slow dose titration reduce risk"],
  },
  rafmek: {
    name: "Dabrafenib/trametinib (RAF/MEK inhibitors)",
    tag: "MAPK-pathway inhibitors",
    moa: "MEK inhibition reduces cardiomyocyte pro-survival ERK signalling; usually produces asymptomatic, reversible LV dysfunction.",
    tox: "Asymptomatic LV dysfunction, hypertension, QT prolongation (vemurafenib-containing regimens).",
    baseline: ["TTE (LVEF), ECG (QTc), blood pressure"],
    monitoring: ["TTE at 1 month, then every 2\u20133 months", "ECG for QTc with vemurafenib-containing regimens", "BP checks each visit"],
    postTx: ["TTE at completion if any dysfunction was noted on treatment"],
    redFlags: ["LVEF fall \u2265 10 points to < 50%", "QTc prolongation", "New heart failure symptoms (uncommon)"],
    management: ["Temporary hold and cardiology review for LVEF fall", "Most patients recover with dose interruption"],
    pearls: ["LV dysfunction is usually subclinical \u2014 do not skip scheduled surveillance TTE even if asymptomatic"],
  },
  fluoropyrimidine: {
    name: "5-Fluorouracil / capecitabine (fluoropyrimidines)",
    tag: "Antimetabolite chemotherapy",
    moa: "Fluoropyrimidines can cause coronary vasospasm and endothelial injury, most often during or shortly after exposure.",
    tox: "Acute chest pain, coronary vasospasm, acute coronary syndrome, arrhythmia, and rarely myocarditis or cardiomyopathy.",
    baseline: ["Symptom assessment and 12-lead ECG", "Document prior coronary disease and cardiovascular risk factors"],
    monitoring: ["Screen for chest pain at every infusion", "Obtain ECG and troponin immediately for chest pain", "Arrange TTE and cardiology review when clinically indicated"],
    postTx: ["Review any on-treatment chest pain or cardiovascular event before future fluoropyrimidine exposure"],
    redFlags: ["New chest pain during or after infusion", "Syncope, palpitations, or acute dyspnoea"],
    management: ["Urgent ECG, troponin, echocardiography if indicated, and cardiology review", "Discuss temporary chemotherapy hold and rechallenge strategy with oncology"],
    pearls: ["Symptoms can occur during the first cycle and may recur with rechallenge", "Do not dismiss chest pain during fluoropyrimidine exposure as non-cardiac without assessment"],
  },
  ici: {
    name: "Pembrolizumab / nivolumab (immune checkpoint inhibitors)",
    tag: "PD-1 / PD-L1 / CTLA-4 blockade",
    moa: "Checkpoint blockade unmasks an autoreactive T-cell response that can target cardiac tissue, producing autoimmune myocarditis.",
    tox: "Myocarditis (rare, ~1\u20132%, but disproportionately high mortality), pericarditis, arrhythmia, vasculitis, Takotsubo-like syndrome.",
    baseline: ["ECG, troponin and NT-proBNP mandatory before cycle 1 in all patients", "TTE if cardiovascular risk factors present"],
    monitoring: ["Troponin before each of the first 3 doses \u2014 myocarditis risk is highest in the first 6\u201312 weeks", "ECG if any new symptoms", "Low threshold for cardiac MRI if troponin rises"],
    postTx: ["Maintain vigilance for several months after cycle 1\u20132 \u2014 most myocarditis occurs within the first 3 months"],
    redFlags: ["ANY troponin rise from baseline, regardless of absolute value", "New chest pain, dyspnoea or palpitations", "Muscle weakness, diplopia or ptosis \u2014 concurrent myositis/myasthenia overlap carries very high risk", "Arrhythmia or syncope"],
    management: ["STOP immunotherapy immediately if myocarditis is suspected", "Admit; urgent cardiology/cardio-oncology consult", "High-dose IV corticosteroids (e.g. methylprednisolone 1 g/day)", "Consider second-line immunosuppression (ATG, mycophenolate, abatacept; avoid infliximab if heart failure present) for steroid-refractory disease", "Urgent cardiac MRI \u00B1 endomyocardial biopsy"],
    pearls: ["Troponin is the single most sensitive screening marker \u2014 any rise warrants work-up", "Myocarditis + myositis + myasthenia triad markedly worsens prognosis", "Fulminant myocarditis can present with a normal LVEF early \u2014 never reassure on LVEF alone"],
  },
};

/* =========================================================================
   RISK ENGINE
   ========================================================================= */

function calcRisk(veryHigh, high, m2, m1) {
  const vhChecked = Object.values(veryHigh).some(Boolean);
  const hChecked = Object.values(high).some(Boolean);
  const m2Count = Object.values(m2).filter(Boolean).length;
  const m1Count = Object.values(m1).filter(Boolean).length;
  const points = m2Count * 2 + m1Count * 1;
  let category = "Low";
  let reason = "No risk factors present";
  if (vhChecked) { category = "Very High"; reason = "Very-high-risk factor present"; }
  else if (hChecked) { category = "High"; reason = "High-risk factor present"; }
  else if (points >= 2) { category = "High"; reason = `${points} moderate-risk point(s)`; }
  else if (points === 1) { category = "Moderate"; reason = "1 moderate-risk point"; }
  return { category, points, reason };
}

const RISK_ORDER = ["Low", "Moderate", "High", "Very High"];

const RISK_STYLES = {
  Low: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" },
  Moderate: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500" },
  High: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-500" },
  "Very High": { text: "text-red-700", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-600" },
};

const FOLLOW_UP_DAYS = { Low: 42, Moderate: 28, High: 21, "Very High": 14 };

function emptyInv() {
  const o = {};
  INVESTIGATIONS.forEach((f) => (o[f.id] = { result: "", interp: "", date: "", comment: "" }));
  return o;
}
function emptyExam() {
  const o = {};
  EXAM_FIELDS.forEach((f) => (o[f.id] = ""));
  return o;
}

function newVisit(type) {
  const cycleMatch = String(type || "").match(/(?:cycle|dose)\s*(\d+)/i);
  return {
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    cycle: cycleMatch ? Number(cycleMatch[1]) : null,
    date: new Date().toISOString().slice(0, 10),
    symptoms: [],
    exam: emptyExam(),
    inv: emptyInv(),
    medReview: "",
    plan: "",
    notes: "",
    nextFollowUpDate: "",
    taskCompletion: {},
    aiSummary: "",
    alerts: [],
  };
}

function computeAlerts(patient, visit) {
  const alerts = [];
  const inv = visit.inv;
  const hasICI = hasTherapy(patient.therapy, "ici");
  const hasVEGF = hasTherapy(patient.therapy, "vegf");
  const hasBcrAbl = hasTherapy(patient.therapy, "bcrabl");

  const troponinElevated = /elev/i.test(inv.troponin.interp) || /elev/i.test(inv.troponin.result);
  const symptomatic = visit.symptoms.some((s) =>
    ["Chest pain", "Dyspnoea", "Palpitations", "Fatigue", "Reduced exercise tolerance", "Syncope", "Presyncope"].includes(s)
  );

  if (troponinElevated) {
    alerts.push({
      level: "danger",
      title: "Elevated troponin",
      desc: "Troponin rise from baseline detected. Increase surveillance frequency; consider cardioprotective therapy and cardio-oncology review.",
    });
  }
  if (troponinElevated && hasICI && symptomatic) {
    alerts.push({
      level: "danger",
      title: "Possible ICI-associated myocarditis",
      desc: "Discontinue immunotherapy. Admit; initiate high-dose corticosteroids; urgent cardiac MRI and biopsy consideration.",
    });
  }
  const currentLVEF = parseFloat(inv.lvef.result);
  if (!isNaN(currentLVEF) && patient.baselineLVEF) {
    const base = parseFloat(patient.baselineLVEF);
    if (!isNaN(base) && base - currentLVEF >= 10 && currentLVEF < 53) {
      alerts.push({
        level: "danger",
        title: "Cancer therapy\u2013related cardiac dysfunction (CTRCD)",
        desc: `LVEF fall of ${(base - currentLVEF).toFixed(0)} points to ${currentLVEF}% (< 53%). Start ACEi/ARB + beta-blocker; repeat TTE in 3\u20134 weeks; consider treatment hold pending cardio-oncology review.`,
      });
    }
  }
  const hfSymptoms = visit.symptoms.filter((s) =>
    ["Dyspnoea", "Orthopnoea", "Paroxysmal nocturnal dyspnoea", "Pedal oedema"].includes(s)
  ).length;
  if (hfSymptoms >= 2) {
    alerts.push({
      level: "warning",
      title: "Possible heart failure",
      desc: "Two or more heart-failure symptoms reported. Examine for elevated JVP, crackles, oedema; consider NT-proBNP and TTE.",
    });
  }
  if (hasVEGF && visit.exam.bp) {
    const m = visit.exam.bp.match(/(\d+)\s*\/\s*(\d+)/);
    if (m && (parseInt(m[1]) >= 160 || parseInt(m[2]) >= 100)) {
      alerts.push({
        level: "danger",
        title: "Hypertensive crisis \u2014 VEGF inhibitor related",
        desc: "BP \u2265 160/100 mmHg on a VEGF-pathway inhibitor. Treat urgently; consider dose interruption if uncontrolled.",
      });
    }
  }
  if (hasBcrAbl && visit.symptoms.includes("Chest pain")) {
    alerts.push({
      level: "warning",
      title: "Possible arterial occlusive event",
      desc: "Chest pain on a BCR-ABL TKI. Evaluate urgently for MI, stroke or peripheral arterial ischaemia.",
    });
  }
  return alerts;
}

function ruleBasedSummary(patient, visit) {
  const parts = [];
  parts.push(`${patient.name || "The patient"}, a ${patient.age || "\u2014"}-year-old ${patient.gender || ""}, carries a diagnosis of ${patient.stage || ""} ${patient.diagnosis || "malignancy"}${patient.regimen ? ` planned for treatment with ${patient.regimen}` : ""}.`);
  if (visit.type === "Baseline") {
    parts.push(`This visit represents a pre-treatment baseline cardio-oncology assessment.`);
  } else {
    parts.push(`This visit is recorded as a ${visit.type} review, cycle ${patient.cycle ?? 0}.`);
  }
  if (patient.baselineLVEF) parts.push(`Baseline LVEF is documented at ${patient.baselineLVEF}%.`);
  const elevated = INVESTIGATIONS.filter((f) => /elev/i.test(visit.inv[f.id].interp));
  if (elevated.length) parts.push(`${elevated.map((f) => f.label).join(", ")} ${elevated.length > 1 ? "are" : "is"} flagged as elevated \u2014 a cardiotoxicity risk signal requiring review.`);
  if (visit.symptoms.length) parts.push(`Reported symptoms: ${visit.symptoms.join(", ")}.`);
  else parts.push(`No cardiovascular symptoms are documented at this visit.`);
  parts.push(`The patient is stratified as HFA-ICOS ${patient.risk.category} cardiovascular risk, warranting ${patient.risk.category === "Low" ? "routine" : "close prospective"} monitoring throughout therapy.`);
  return parts.join(" ");
}

async function generateAISummary(patient, visit) {
  // Keep patient data in the browser. An authenticated, audited API route can
  // later supply AI-generated summaries without exposing clinical data here.
  return ruleBasedSummary(patient, visit);
}

/* =========================================================================
   SMALL UI PRIMITIVES
   ========================================================================= */

function RiskBar({ category }) {
  const idx = RISK_ORDER.indexOf(category);
  return (
    <div>
      <div className="flex gap-1">
        {RISK_ORDER.map((r, i) => (
          <div key={r} className={`h-2 flex-1 rounded-full ${i <= idx ? RISK_STYLES[category].bar : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] tracking-widest uppercase" style={{ color: "#8B93A1" }}>
        {RISK_ORDER.map((r) => (
          <span key={r} className={r === category ? "font-semibold" : ""} style={r === category ? { color: RISK_STYLES[category].text.replace("text-", "") } : {}}>
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, right, children, tint }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-3 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={17} className={tint || "text-teal-700"} />}
          <h3 className="font-semibold text-[15px] text-slate-900" style={serif}>{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 placeholder:text-slate-400"
      />
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
        active ? "bg-teal-700 border-teal-700 text-white" : "bg-white border-slate-300 text-slate-600 hover:border-teal-400"
      }`}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, label, points }) {
  return (
    <label className="flex items-center justify-between gap-2 py-2 cursor-pointer">
      <div className="flex items-center gap-2.5">
        <div
          onClick={onChange}
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
            checked ? "bg-teal-700 border-teal-700" : "border-slate-300"
          }`}
        >
          {checked && <CheckCircle2 size={14} className="text-white" />}
        </div>
        <span className="text-[14px] text-slate-800">{label}</span>
      </div>
      {points && <span className="text-xs text-slate-400" style={mono}>+{points}</span>}
    </label>
  );
}

/* =========================================================================
   PATIENT REGISTRATION
   ========================================================================= */

function NewPatientForm({ onCancel, onCreate }) {
  const [name, setName] = useState("");
  const [uhid, setUhid] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [diagnosis, setDiagnosis] = useState("");
  const [stage, setStage] = useState("");
  const [regimen, setRegimen] = useState("");
  const [therapy, setTherapy] = useState("");
  const [vh, setVh] = useState({});
  const [h, setH] = useState({});
  const [m2, setM2] = useState({});
  const [m1, setM1] = useState({});
  const [lvef, setLvef] = useState("");

  useEffect(() => {
    const v = parseFloat(lvef);
    if (!isNaN(v)) {
      if (v < 50) setH((p) => ({ ...p, h1: true }));
      else setH((p) => ({ ...p, h1: false }));
      if (v >= 50 && v <= 54) setM2((p) => ({ ...p, m2a: true }));
      else setM2((p) => ({ ...p, m2a: false }));
    }
  }, [lvef]);

  useEffect(() => {
    const a = parseInt(age);
    if (!isNaN(a)) {
      setH((p) => ({ ...p, h3: a >= 80 }));
      setM2((p) => ({ ...p, m2b: a >= 65 && a < 80 }));
    }
  }, [age]);

  const risk = useMemo(() => calcRisk(vh, h, m2, m1), [vh, h, m2, m1]);
  const canRegister = name && diagnosis && therapy;

  function selectTherapy(id) {
    setTherapy(id);
  }

  function submit() {
    if (!canRegister) return;
    onCreate({
      id: `p_${Date.now()}`,
      name, uhid, age, gender, diagnosis, stage, regimen,
      therapy, veryHigh: vh, high: h, m2, m1, baselineLVEF: lvef,
      risk, cycle: 0, clinicalStatus: "Stable",
      registeredDate: new Date().toISOString().slice(0, 10),
      visits: [], contraindications: { absolute: {}, relative: {} },
      restratification: {}, auditTrail: [],
    });
  }

  return (
    <div className="pb-28">
      <Header title="Register new patient" subtitle="Complete demographics and baseline HFA-ICOS risk stratification." onBack={onCancel} />
      <div className="px-4 -mt-2">
        <Section title="Demographics" icon={Users}>
          <TextField label="Full name" value={name} onChange={setName} />
          <TextField label="UHID" value={uhid} onChange={setUhid} />
          <TextField label="Age" value={age} onChange={setAge} type="number" />
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] bg-white">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <DiagnosisStageSelector
            diagnosis={diagnosis}
            stage={stage}
            onDiagnosisChange={setDiagnosis}
            onStageChange={setStage}
          />
          <TextField label="Chemotherapy regimen" value={regimen} onChange={setRegimen} placeholder="e.g. AC-T with trastuzumab" />
        </Section>

        <Section title="1 Planned anticancer therapy" icon={Syringe}>
          <div className="space-y-2" role="radiogroup" aria-label="Planned anticancer therapy">
            {THERAPY_CLASSES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={therapy === t.id}
                onClick={() => selectTherapy(t.id)}
                className={`w-full text-left rounded-xl border px-3.5 py-3 transition ${
                  therapy === t.id ? "border-teal-600 bg-teal-50" : "border-slate-200"
                }`}
              >
                <div className="font-semibold text-[14px] text-slate-900">{t.name}</div>
                <div className="text-[13px] text-slate-500 mt-0.5">{t.examples} \u2014 {t.note}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="2 Very-high-risk factors" icon={ShieldAlert} tint="text-red-600">
          {VERY_HIGH_FACTORS.map((f) => (
            <Checkbox key={f.id} label={f.label} checked={!!vh[f.id]} onChange={() => setVh((p) => ({ ...p, [f.id]: !p[f.id] }))} />
          ))}
        </Section>

        <Section title="3 High-risk factors" icon={AlertTriangle} tint="text-orange-600">
          {HIGH_FACTORS.map((f) => (
            <Checkbox key={f.id} label={f.label} checked={!!h[f.id]} onChange={() => setH((p) => ({ ...p, [f.id]: !p[f.id] }))} />
          ))}
        </Section>

        <Section title="4 Moderate-risk factors" icon={ClipboardList} tint="text-amber-600">
          <div className="text-[11px] tracking-widest uppercase text-slate-400 mb-1">Moderate-2 (2 points each)</div>
          {MODERATE2_FACTORS.map((f) => (
            <Checkbox key={f.id} label={f.label} points={2} checked={!!m2[f.id]} onChange={() => setM2((p) => ({ ...p, [f.id]: !p[f.id] }))} />
          ))}
          <div className="text-[11px] tracking-widest uppercase text-slate-400 mt-2 mb-1">Moderate-1 (1 point each)</div>
          {MODERATE1_FACTORS.map((f) => (
            <Checkbox key={f.id} label={f.label} points={1} checked={!!m1[f.id]} onChange={() => setM1((p) => ({ ...p, [f.id]: !p[f.id] }))} />
          ))}
        </Section>

        <Section title="5 Baseline LVEF (%)" icon={Activity}>
          <TextField label="" value={lvef} onChange={setLvef} placeholder="e.g. 58" type="number" />
        </Section>

        <div className={`rounded-2xl border p-4 mb-4 ${RISK_STYLES[risk.category].bg} ${RISK_STYLES[risk.category].border}`}>
          <div className="text-[11px] tracking-widest uppercase text-slate-500 mb-1">Baseline HFA-ICOS category</div>
          <div className={`text-3xl font-bold ${RISK_STYLES[risk.category].text}`} style={serif}>{risk.category}</div>
          <div className="text-[13px] text-slate-500 mt-0.5 mb-3">{risk.reason} {risk.points} points</div>
          <RiskBar category={risk.category} />
        </div>

        <Button
          type="button"
          disabled={!canRegister}
          onClick={submit}
          className={`h-auto w-full rounded-2xl py-4 text-[15px] font-semibold ${
            canRegister ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"
          }`}
        >
          Register patient <ArrowRight size={17} />
        </Button>
        <p className="text-center text-xs text-slate-400 mt-2">
          {canRegister ? "Ready to register." : "Fill name, diagnosis + choose therapy to continue."}
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   HEADER
   ========================================================================= */

function Header({ title, subtitle, onBack }) {
  return (
    <div className="px-4 pt-5 pb-4 bg-gradient-to-br from-[#0B1F3A] to-[#123055] text-white rounded-b-3xl mb-3">
      <div className="flex items-center gap-2 mb-3">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
          <Heart size={14} className="text-white" fill="white" />
        </div>
        <span className="text-[13px] font-semibold tracking-wide text-white/90">CORSC</span>
      </div>
      <h1 className="text-[26px] font-bold leading-tight" style={serif}>{title}</h1>
      {subtitle && <p className="text-[13px] text-white/70 mt-1">{subtitle}</p>}
    </div>
  );
}

function PatientBanner({ patient }) {
  const latestLVEF = useMemo(() => {
    for (let i = patient.visits.length - 1; i >= 0; i--) {
      const r = patient.visits[i].inv.lvef.result;
      if (r) return r;
    }
    return null;
  }, [patient.visits]);
  const nextFollowUp = useMemo(() => {
    const withDates = patient.visits.filter((v) => v.nextFollowUpDate).sort((a, b) => (a.date < b.date ? 1 : -1));
    return withDates[0]?.nextFollowUpDate || null;
  }, [patient.visits]);

  const fields = [
    ["Name", patient.name], ["UHID", patient.uhid || "\u2014"], ["Age", patient.age || "\u2014"],
    ["Diagnosis", patient.diagnosis], ["Stage", patient.stage || "\u2014"],
    ["Regimen", patient.regimen || "\u2014"], ["Cycle", patient.cycle ?? 0],
    ["HFA-ICOS", patient.risk.category], ["Baseline LVEF", patient.baselineLVEF ? `${patient.baselineLVEF}%` : "\u2014"],
    ["Latest LVEF", latestLVEF ? `${latestLVEF}%` : "\u2014"], ["Next follow-up", nextFollowUp || "\u2014"],
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 grid grid-cols-3 gap-x-3 gap-y-3">
      {fields.map(([label, val]) => (
        <div key={label}>
          <div className="text-[10px] tracking-widest uppercase text-slate-400">{label}</div>
          <div className="text-[13px] font-semibold text-slate-900 truncate" style={mono}>{String(val)}</div>
        </div>
      ))}
      <div>
        <div className="text-[10px] tracking-widest uppercase text-slate-400">Clinical status</div>
        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
          patient.clinicalStatus === "Stable" ? "bg-emerald-100 text-emerald-700" :
          patient.clinicalStatus === "Improving" ? "bg-teal-100 text-teal-700" :
          patient.clinicalStatus === "Worsening" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
        }`}>{patient.clinicalStatus}</span>
      </div>
    </div>
  );
}

/* =========================================================================
   OVERVIEW TAB
   ========================================================================= */

function OverviewTab({ patient, draft, setDraft, updatePatient }) {
  const [aiSummary, setAiSummary] = useState(patient.lastSummary || "");
  const [loadingAI, setLoadingAI] = useState(false);

  const runSummary = useCallback(async () => {
    setLoadingAI(true);
    const text = await generateAISummary(patient, draft);
    setAiSummary(text);
    updatePatient({ ...patient, lastSummary: text });
    setLoadingAI(false);
  }, [patient, draft, updatePatient]);

  useEffect(() => {
    if (!aiSummary) runSummary();
    // eslint-disable-next-line
  }, []);

  const alerts = useMemo(() => computeAlerts(patient, draft), [patient, draft]);

  const tasks = useMemo(() => getDynamicSurveillanceTasks(patient, draft), [patient, draft]);
  const nextFollowUp = useMemo(() => getNextFollowUpPlan(patient, draft), [patient, draft]);
  const tasksDone = tasks.filter((task) => isTaskComplete(task, draft)).length;

  function toggleTask(task) {
    setDraft((current) => ({
      ...current,
      taskCompletion: {
        ...(current.taskCompletion || {}),
        [task.id]: !isTaskComplete(task, current),
      },
    }));
  }

  return (
    <div>
      <Section
        title="AI Clinical Summary"
        icon={Sparkles}
        tint="text-teal-600"
        right={
          <button onClick={runSummary} className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full px-2.5 py-1">
            <RefreshCw size={12} className={loadingAI ? "animate-spin" : ""} /> Regenerate
          </button>
        }
      >
        <p className="text-[14px] leading-relaxed text-slate-700">
          {loadingAI ? "Generating summary\u2026" : aiSummary}
        </p>
      </Section>

      <Section title={"Today's tasks (" + tasksDone + "/" + tasks.length + ")"} icon={ClipboardCheck}>
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 mb-2.5">
          <div className="text-[10px] tracking-widest uppercase text-slate-400">Generated from this visit</div>
          <div className="text-[13px] font-medium text-slate-700 mt-0.5">
            {draft.type || "Treatment visit"}; cycle or dose {getVisitCycle(patient, draft)}; {patient.risk.category} baseline risk.
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            Next surveillance: {nextFollowUp.date} in {nextFollowUp.days} days ({nextFollowUp.reason}).
          </div>
        </div>
        {tasks.map((task) => {
          const done = isTaskComplete(task, draft);
          const urgent = task.priority === "urgent";
          const surveillance = task.priority === "surveillance";
          return (
            <button
              type="button"
              key={task.id}
              onClick={() => toggleTask(task)}
              aria-pressed={done}
              className="w-full text-left flex items-start gap-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className={"mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center " + (done ? "bg-teal-700" : "border border-slate-300")}>
                {done && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={"text-[14px] font-medium " + (done ? "text-slate-400 line-through" : "text-slate-800")}>{task.label}</span>
                  {urgent && <span className="shrink-0 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-semibold">Urgent</span>}
                  {!urgent && surveillance && <span className="shrink-0 rounded-full bg-teal-50 text-teal-700 px-2 py-0.5 text-[10px] font-semibold">Surveillance</span>}
                </div>
                {task.detail && <div className={"text-[12px] leading-relaxed mt-0.5 " + (done ? "text-slate-400" : "text-slate-500")}>{task.detail}</div>}
              </div>
            </button>
          );
        })}
      </Section>

      <Section title="Dynamic clinical alerts" icon={AlertTriangle} tint="text-red-600">
        {alerts.length === 0 ? (
          <p className="text-[13px] text-slate-400">No active alerts. Complete today's investigations to refresh alerts.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`rounded-xl p-3 border ${a.level === "danger" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                <div className={`flex items-center gap-1.5 font-semibold text-[13.5px] ${a.level === "danger" ? "text-red-700" : "text-amber-700"}`}>
                  <AlertCircle size={14} /> {a.title}
                </div>
                <p className="text-[13px] text-slate-600 mt-1">{a.desc}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Clinical status" icon={Heart}>
        <div className="text-[13px] text-slate-500 mb-2">Independent of HFA-ICOS baseline risk. Reflects the patient's current clinical trajectory.</div>
        <div className="flex gap-2 flex-wrap">
          {["Stable", "Improving", "Worsening", "Critical"].map((s) => (
            <Chip key={s} active={patient.clinicalStatus === s} onClick={() => updatePatient({ ...patient, clinicalStatus: s })}>{s}</Chip>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* =========================================================================
   OPD REVIEW TAB
   ========================================================================= */

function OPDReviewTab({ patient, draft, setDraft, saveVisit }) {
  const isCycleVisit = /^cycle|^dose/i.test(draft.type || "");

  function setVisitKind(kind) {
    setDraft((current) => {
      if (kind === "cycle") {
        const nextCycle = Number(current.cycle) || Number(patient.cycle) + 1 || 1;
        return { ...current, type: "Cycle " + nextCycle, cycle: nextCycle };
      }
      return { ...current, type: kind, cycle: null };
    });
  }

  function setCycle(value) {
    setDraft((current) => {
      const cycle = value === "" ? null : Number(value);
      return { ...current, cycle, type: cycle ? "Cycle " + cycle : "Cycle" };
    });
  }

  function setSymptom(sym) {
    setDraft((d) => ({ ...d, symptoms: d.symptoms.includes(sym) ? d.symptoms.filter((s) => s !== sym) : [...d.symptoms, sym] }));
  }
  function setExam(id, v) {
    setDraft((d) => ({ ...d, exam: { ...d.exam, [id]: v } }));
  }
  function setInv(id, field, v) {
    setDraft((d) => ({ ...d, inv: { ...d.inv, [id]: { ...d.inv[id], [field]: v } } }));
  }

  return (
    <div>
      <Section title="Review details" icon={Calendar}>
        <label className="block text-xs font-medium text-slate-500 mb-1">Visit type</label>
        <select value={isCycleVisit ? "cycle" : draft.type} onChange={(e) => setVisitKind(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] bg-slate-50 mb-3">
          <option value="Baseline">Baseline</option>
          <option value="cycle">Chemotherapy cycle or dose</option>
          <option value="End of treatment">End of treatment</option>
          <option value="3 months post-treatment">3 months post-treatment</option>
          <option value="12 months post-treatment">12 months post-treatment</option>
        </select>
        {isCycleVisit && (
          <TextField
            label="Cycle or dose number"
            value={draft.cycle ?? ""}
            onChange={setCycle}
            placeholder="e.g. 2"
            type="number"
          />
        )}
        <label className="block text-xs font-medium text-slate-500 mb-1">Review date</label>
        <input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] bg-slate-50" />
      </Section>

      <Section title="Symptoms" icon={ClipboardList}>
        <div className="divide-y divide-slate-100">
          {SYMPTOMS.map((s) => (
            <label key={s} className="flex items-center gap-2.5 py-2.5 cursor-pointer" onClick={() => setSymptom(s)}>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${draft.symptoms.includes(s) ? "bg-teal-700 border-teal-700" : "border-slate-300"}`}>
                {draft.symptoms.includes(s) && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <span className="text-[14px] text-slate-800">{s}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Examination" icon={Stethoscope}>
        {EXAM_FIELDS.map((f) => (
          <TextField key={f.id} label={f.label} placeholder={f.ph} value={draft.exam[f.id]} onChange={(v) => setExam(f.id, v)} />
        ))}
        <div className="mb-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">General examination / consultant notes</label>
          <textarea value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} rows={3}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px]" placeholder="Free text" />
        </div>
      </Section>

      <Section title="Medication review" icon={ClipboardCheck}>
        <textarea value={draft.medReview} onChange={(e) => setDraft((d) => ({ ...d, medReview: e.target.value }))} rows={2}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px]" placeholder="Cardioprotective / concomitant medications" />
      </Section>

      <Section title="Investigations" icon={Activity}>
        <div className="space-y-3">
          {INVESTIGATIONS.map((f) => (
            <div key={f.id} className="rounded-xl border border-slate-200 p-3">
              <div className="font-semibold text-[13.5px] text-slate-900 mb-2">{f.label}</div>
              <input placeholder="Result" value={draft.inv[f.id].result} onChange={(e) => setInv(f.id, "result", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] mb-2" />
              <select value={draft.inv[f.id].interp} onChange={(e) => setInv(f.id, "interp", e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-[14px] mb-2 font-medium ${
                  draft.inv[f.id].interp === "Elevated" || draft.inv[f.id].interp === "Reduced" ? "border-red-300 text-red-700 bg-red-50" : "border-slate-300"
                }`}>
                <option value="">Interpretation</option>
                <option>Normal</option><option>Elevated</option><option>Reduced</option><option>Abnormal</option>
              </select>
              <input type="date" value={draft.inv[f.id].date} onChange={(e) => setInv(f.id, "date", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] mb-2 bg-slate-50" />
              <input placeholder="Consultant comment" value={draft.inv[f.id].comment} onChange={(e) => setInv(f.id, "comment", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px]" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Plan & notes" icon={ClipboardList}>
        <label className="block text-xs font-medium text-slate-500 mb-1">Management plan</label>
        <textarea value={draft.plan} onChange={(e) => setDraft((d) => ({ ...d, plan: e.target.value }))} rows={3}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] mb-3" />
        <label className="block text-xs font-medium text-slate-500 mb-1">Next follow-up date</label>
        <input type="date" value={draft.nextFollowUpDate} onChange={(e) => setDraft((d) => ({ ...d, nextFollowUpDate: e.target.value }))}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px]" />
      </Section>

      <button onClick={saveVisit} className="w-full rounded-2xl py-4 bg-teal-700 text-white font-semibold flex items-center justify-center gap-2">
        <Save size={17} /> Save review
      </button>
    </div>
  );
}

/* =========================================================================
   TIMELINE TAB
   ========================================================================= */

function TimelineTab({ patient }) {
  const [selected, setSelected] = useState(patient.visits[patient.visits.length - 1] || null);
  const stages = ["Baseline", "Chemotherapy cycles", "End of treatment", "3 months post-completion", "6 months post-completion", "12 months post-completion", "3 years survivorship", "5 years survivorship"];
  return (
    <div>
      <Section title="Longitudinal patient timeline" icon={Calendar}>
        <div className="relative pl-5">
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />
          {stages.map((s) => {
            const visitsOfType = patient.visits.filter((v) => v.type === s || (s === "Chemotherapy cycles" && v.type.startsWith("Cycle")));
            return (
              <div key={s} className="relative mb-3">
                <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full border-2 border-teal-600 bg-white" />
                <div className="font-semibold text-[14px] text-slate-900 mb-1">{s}</div>
                <div className="flex flex-wrap gap-1.5">
                  {visitsOfType.length === 0 && <span className="text-xs text-slate-400">No visit recorded</span>}
                  {visitsOfType.map((v) => (
                    <button key={v.id} onClick={() => setSelected(v)}
                      className={`text-xs px-2.5 py-1 rounded-lg border ${selected?.id === v.id ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600"}`}>
                      {v.date}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      {selected && (
        <Section title={`Selected visit \u2014 ${selected.type}`} icon={FileDown}>
          <div className="text-xs text-slate-400 mb-2" style={mono}>{selected.date}</div>
          <p className="text-[14px] text-slate-700 leading-relaxed">{selected.aiSummary || ruleBasedSummary(patient, selected)}</p>
        </Section>
      )}
    </div>
  );
}

/* =========================================================================
   INVESTIGATION TRACKER TAB
   ========================================================================= */

function TrackerTab() {
  return (
    <Section title="Investigation tracker" icon={Activity}>
      {INVESTIGATION_TRACKER.map((sec) => (
        <div key={sec.section} className="mb-4 last:mb-0">
          <div className="text-[11px] tracking-widest uppercase text-slate-400 mb-1.5">{sec.section}</div>
          <div className="space-y-1.5">
            {sec.items.map((it) => (
              <div key={it} className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5">
                <Circle size={16} className="text-slate-300" />
                <span className="text-[14px] text-slate-800">{it}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}

/* =========================================================================
   SURVEILLANCE TAB
   ========================================================================= */

const ABSOLUTE_CI = [
  { id: "myocarditis", label: "Active myocarditis or recent immune-related myocarditis" },
  { id: "autoimmune", label: "Uncontrolled autoimmune myocardial disease" },
];
const RELATIVE_CI = [
  { id: "troponinUnclear", label: "Baseline troponin elevation of unclear cause" },
  { id: "autoimmuneCardiac", label: "Pre-existing autoimmune disease with cardiac involvement" },
  { id: "priorIRAE", label: "Prior high-grade immune-related adverse event" },
];
const EMPTY_RESTRATIFICATION = {};

function SurveillanceTab({ patient, updatePatient }) {
  const ci = patient.contraindications || { absolute: {}, relative: {} };
  const hasICI = hasTherapy(patient.therapy, "ici");

  function toggle(group, id, val) {
    const next = { ...patient, contraindications: { ...ci, [group]: { ...ci[group], [id]: val } } };
    updatePatient(next);
  }

  function logDecision() {
    const anyAbs = Object.values(ci.absolute).some(Boolean);
    const anyRel = Object.values(ci.relative).some(Boolean);
    const decision = anyAbs ? "Not fit to proceed" : anyRel ? "Fit with caution" : "Fit to proceed";
    const entry = {
      id: `a_${Date.now()}`,
      title: `Contraindication review Cycle ${patient.cycle ?? 0}`,
      date: new Date().toLocaleString(),
      decision,
      text: `Absolute: ${anyAbs ? "Yes" : "No"} Relative: ${anyRel ? "Yes" : "No"} HFA-ICOS: ${patient.risk.category}`,
    };
    updatePatient({ ...patient, auditTrail: [entry, ...(patient.auditTrail || [])] });
  }

  const restrat = patient.restratification ?? EMPTY_RESTRATIFICATION;
  function setRestrat(field, v) {
    updatePatient({ ...patient, restratification: { ...restrat, [field]: v } });
  }
  const currentRisk = useMemo(() => {
    if (restrat.myocarditisConfirmed || restrat.severeHF) return "Very High";
    if (restrat.troponinRise || restrat.symptomatic || (parseFloat(restrat.glsFall) > 15)) return "High";
    return patient.risk.category;
  }, [restrat, patient.risk.category]);

  return (
    <div>
      <Section title="Symptoms patients must watch for" icon={Search} tint="text-slate-600">
        <ul className="text-[14px] text-slate-700 space-y-1.5 list-disc pl-5">
          <li>Chest pain or tightness</li><li>Sudden breathlessness</li><li>Palpitations or fainting</li>
          <li>Muscle weakness (especially with double vision or drooping eyelid)</li>
        </ul>
      </Section>
      <Section title="Signs the clinician must check" icon={Stethoscope}>
        <ul className="text-[14px] text-slate-700 space-y-1.5 list-disc pl-5">
          <li>Any new troponin rise from baseline</li><li>New ECG changes (ST/T changes, conduction block, arrhythmia)</li>
          <li>New signs of heart failure</li><li>Concurrent myositis or myasthenia \u2014 high overlap risk</li>
        </ul>
      </Section>

      <Section title="Contraindications before starting chemotherapy" icon={ShieldAlert} tint="text-red-600">
        <div className="text-[11px] tracking-widest uppercase text-red-500 mb-1">Absolute contraindications</div>
        {ABSOLUTE_CI.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-2">
            <span className="text-[14px] text-slate-800 pr-3">{f.label}</span>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => toggle("absolute", f.id, true)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${ci.absolute[f.id] === true ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"}`}>Yes</button>
              <button onClick={() => toggle("absolute", f.id, false)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${ci.absolute[f.id] === false ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>No</button>
            </div>
          </div>
        ))}
        <div className="text-[11px] tracking-widest uppercase text-orange-500 mt-3 mb-1">Relative contraindications</div>
        {RELATIVE_CI.map((f) => (
          <div key={f.id} className="flex items-center justify-between py-2">
            <span className="text-[14px] text-slate-800 pr-3">{f.label}</span>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => toggle("relative", f.id, true)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${ci.relative[f.id] === true ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>Yes</button>
              <button onClick={() => toggle("relative", f.id, false)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${ci.relative[f.id] === false ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>No</button>
            </div>
          </div>
        ))}
        <button onClick={logDecision} className="w-full mt-3 rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
          <ShieldCheck size={15} /> Log fitness decision
        </button>
      </Section>

      <Section title={`Fitness decision audit trail (${(patient.auditTrail || []).length})`} icon={ClipboardCheck}>
        {(patient.auditTrail || []).length === 0 && <p className="text-[13px] text-slate-400">No entries yet.</p>}
        <div className="space-y-2">
          {(patient.auditTrail || []).map((e) => (
            <div key={e.id} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="text-[11px] text-slate-400" style={mono}>{e.title}</div>
              <div className="text-[11px] text-slate-400 mb-1" style={mono}>{e.date}</div>
              <div className={`font-semibold text-[13.5px] ${e.decision === "Not fit to proceed" ? "text-red-700" : e.decision === "Fit with caution" ? "text-orange-700" : "text-teal-700"}`}>{e.decision}</div>
              <div className="text-[12.5px] text-slate-500">{e.text}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Dynamic re-stratification findings" icon={TrendingDown}>
        <TextField label="GLS relative fall from baseline (%)" value={restrat.glsFall || ""} onChange={(v) => setRestrat("glsFall", v)} placeholder="e.g. 12" type="number" />
        <TextField label="Current LVEF (%)" value={restrat.currentLVEF || ""} onChange={(v) => setRestrat("currentLVEF", v)} placeholder="e.g. 46" type="number" />
        <Checkbox label="Significant troponin rise from baseline" checked={!!restrat.troponinRise} onChange={() => setRestrat("troponinRise", !restrat.troponinRise)} />
        <Checkbox label="Patient is symptomatic (breathlessness / oedema / fatigue)" checked={!!restrat.symptomatic} onChange={() => setRestrat("symptomatic", !restrat.symptomatic)} />
        <Checkbox label="Symptomatic severe heart failure present" checked={!!restrat.severeHF} onChange={() => setRestrat("severeHF", !restrat.severeHF)} />
        <Checkbox label="High-grade myocarditis confirmed" checked={!!restrat.myocarditisConfirmed} onChange={() => setRestrat("myocarditisConfirmed", !restrat.myocarditisConfirmed)} />
      </Section>

      <Section title="Cycle tracker" icon={Calendar}>
        <TextField label="Current cycle number" value={patient.cycle} onChange={(v) => updatePatient({ ...patient, cycle: v })} type="number" />
        <div className="text-[13px] text-slate-500 mb-2">Monitoring: every 2 cycles (TTE + troponin + natriuretic peptide)</div>
        {hasICI && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-800 flex gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            Immune checkpoint inhibitor: check troponin before each of the first 3 doses \u2014 myocarditis risk is highest early in treatment.
          </div>
        )}
      </Section>

      <div className={`rounded-2xl border p-4 mb-3 ${RISK_STYLES[currentRisk].bg} ${RISK_STYLES[currentRisk].border}`}>
        <div className="text-[11px] tracking-widest uppercase text-slate-500 mb-1">Current risk status</div>
        <div className={`text-3xl font-bold ${RISK_STYLES[currentRisk].text}`} style={serif}>{currentRisk}</div>
        <div className="text-[13px] text-slate-500 mt-0.5 mb-3">
          {currentRisk !== patient.risk.category ? "Elevated by current clinical findings" : `Baseline (${patient.risk.reason})`}
        </div>
        <RiskBar category={currentRisk} />
      </div>
    </div>
  );
}

/* =========================================================================
   HFA-ICOS TAB
   ========================================================================= */

function HfaIcosTab({ patient }) {
  const cat = patient.risk.category;
  return (
    <div>
      <Section title="HFA-ICOS baseline category" icon={ShieldAlert}>
        <div className={`rounded-2xl border p-4 ${RISK_STYLES[cat].bg} ${RISK_STYLES[cat].border}`}>
          <div className="text-[11px] tracking-widest uppercase text-slate-500 mb-1">Baseline risk</div>
          <div className={`text-3xl font-bold ${RISK_STYLES[cat].text}`} style={serif}>{cat}</div>
          <div className="text-[13px] text-slate-500 mt-0.5">{patient.risk.reason}</div>
        </div>
      </Section>
      <Section title="Baseline investigations recommended" icon={ShieldCheck}>
        <ul className="text-[14px] text-slate-700 space-y-1.5 list-disc pl-5">
          <li>Clinical history, physical exam and 12-lead ECG \u2014 mandatory for all patients</li>
          <li>Baseline troponin and natriuretic peptide</li>
          <li>Baseline TTE (LVEF + GLS) if moderate risk or above</li>
        </ul>
      </Section>
      <Section title="Surveillance schedule during therapy" icon={Calendar}>
        <p className="text-[14px] text-slate-700 mb-2">Every 2 cycles (TTE + troponin + natriuretic peptide)</p>
        {hasTherapy(patient.therapy, "ici") && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-800">
            Immune checkpoint inhibitor: check troponin before each of the first 3 doses \u2014 myocarditis risk is highest early in treatment.
          </div>
        )}
      </Section>
      <Section title="Post-treatment follow-up" icon={ClipboardList}>
        <ul className="text-[14px] text-slate-700 space-y-1.5 list-disc pl-5">
          <li>3 months post-completion: TTE + biomarkers</li>
          <li>12 months post-completion: TTE + biomarkers</li>
          <li>3 years post-completion: TTE{cat === "Very High" ? " (continue at 5 years)" : ""}</li>
        </ul>
        <div className="text-xs text-slate-400 mt-2">Recommended follow-up interval based on category: {FOLLOW_UP_DAYS[cat]} days.</div>
      </Section>
    </div>
  );
}

/* =========================================================================
   FOLLOW-UP PLANNER TAB
   ========================================================================= */

const CYCLE_INV_SETS = [
  ["TTE (LVEF + GLS)", "Troponin", "NT-proBNP", "12-lead ECG", "Symptom review + BP/pulse"],
  ["Troponin + NT-proBNP", "12-lead ECG", "Symptom review", "Cumulative anthracycline dose review"],
  ["TTE (LVEF + GLS)", "Troponin", "NT-proBNP", "Full CV re-stratification"],
];

function FollowUpPlannerTab({ patient, addVisitPlaceholder }) {
  const interval = FOLLOW_UP_DAYS[patient.risk.category];
  const today = new Date();
  const visits = [0, 1, 2].map((i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + interval * i);
    return { date: d.toISOString().slice(0, 10), day: interval * i, inv: CYCLE_INV_SETS[i % CYCLE_INV_SETS.length] };
  });

  return (
    <div>
      <Section title="Automatic follow-up planner" icon={Calendar}>
        <TextField label="Today's date" value={today.toISOString().slice(0, 10)} onChange={() => {}} />
        <TextField label="Current chemotherapy cycle" value={patient.cycle} onChange={() => {}} />
        <div className={`rounded-xl p-3 border ${RISK_STYLES[patient.risk.category].bg} ${RISK_STYLES[patient.risk.category].border}`}>
          <div className="text-[11px] tracking-widest uppercase text-slate-500">Interval by risk</div>
          <div className={`text-lg font-bold ${RISK_STYLES[patient.risk.category].text}`} style={serif}>{patient.risk.category} {interval} days</div>
        </div>
      </Section>

      <Section title="Next three follow-up visits \u2014 auto-generated" icon={ClipboardList}>
        {visits.map((v, i) => (
          <div key={i} className="relative pl-5 pb-4 last:pb-0">
            <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-orange-500 bg-white" />
            <div className="text-[10px] tracking-widest uppercase text-slate-400">{i === 0 ? "Next visit" : `Visit +${i}`}</div>
            <div className="font-bold text-[16px] text-slate-900">{v.date}</div>
            <div className="text-xs text-slate-400 mb-1.5">Day {v.day} from now</div>
            <div className="text-[10px] tracking-widest uppercase text-slate-400 mb-1">Investigations due</div>
            <div className="flex flex-wrap gap-1.5">
              {v.inv.map((it) => (
                <span key={it} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-1">{it}</span>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {hasTherapy(patient.therapy, "ici") && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-800 mb-3">
          Immune checkpoint inhibitor: check troponin before each of the first 3 doses \u2014 myocarditis risk is highest early in treatment.
        </div>
      )}

      <button onClick={() => addVisitPlaceholder(visits[0].date)} className="w-full rounded-2xl py-4 bg-slate-900 text-white font-semibold flex items-center justify-center gap-2">
        Save next visit as {visits[0].date} <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* =========================================================================
   DRUG GUIDANCE TAB
   ========================================================================= */

function Disclosure({ title, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 mb-2 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3.5 py-3 bg-white">
        <span className="font-semibold text-[14px] text-slate-900">{title}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3.5 pb-3">
          <ul className="text-[13.5px] text-slate-700 space-y-1.5 list-disc pl-4">
            {items.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function DrugGuidanceTab({ patient }) {
  const first = primaryTherapy(patient.therapy) || "anthracycline";
  const [selected, setSelected] = useState(first);
  const d = DRUG_DB[selected];
  return (
    <div>
      <Section title="Drug guidance" icon={BookOpen}>
        <label className="block text-xs font-medium text-slate-500 mb-1">Select drug class</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] mb-4 bg-white">
          {THERAPY_CLASSES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <h4 className="text-xl font-bold text-slate-900" style={serif}>{d.name}</h4>
        <div className="text-[13px] text-teal-700 font-medium mb-3">{d.tag}</div>

        <div className="rounded-xl border border-slate-200 p-3 mb-2">
          <div className="font-semibold text-[13.5px] text-slate-900 mb-1">Mechanism of action</div>
          <p className="text-[13.5px] text-slate-700">{d.moa}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 mb-2">
          <div className="font-semibold text-[13.5px] text-slate-900 mb-1">Cardiovascular toxicities</div>
          <p className="text-[13.5px] text-slate-700">{d.tox}</p>
        </div>
        <Disclosure title="Baseline investigations" items={d.baseline} />
        <Disclosure title="Monitoring during therapy" items={d.monitoring} />
        <Disclosure title="Post-treatment follow-up" items={d.postTx} />
        <Disclosure title="Common red flags" items={d.redFlags} />
        <Disclosure title="Management principles" items={d.management} />
        <Disclosure title="Key clinical pearls" items={d.pearls} />
      </Section>
    </div>
  );
}

/* =========================================================================
   PATIENT LIST
   ========================================================================= */

function PatientList({ patients, onSelect, onNew }) {
  const [q, setQ] = useState("");
  const filtered = patients.filter((p) => (p.name || "").toLowerCase().includes(q.toLowerCase()) || (p.uhid || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-5 bg-gradient-to-br from-[#0B1F3A] to-[#123055] text-white rounded-b-3xl mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <div>
            <div className="font-bold text-[15px] leading-tight" style={serif}>CORSC</div>
            <div className="text-[11px] text-white/60">Cardiac Oncology Risk Stratification</div>
          </div>
        </div>
        <p className="text-[13px] text-white/70 mt-3">HFA-ICOS-based cardiotoxicity risk, surveillance and follow-up decision support.</p>
      </div>

      <div className="px-4">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients or UHID"
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-[15px] bg-white" />
        </div>

        <button onClick={onNew} className="w-full rounded-2xl py-3.5 mb-4 bg-slate-900 text-white font-semibold flex items-center justify-center gap-2">
          <Plus size={17} /> New patient
        </button>

        {filtered.length === 0 && (
          <div className="text-center text-slate-400 text-[14px] py-10">
            {patients.length === 0 ? "No patients registered yet. Register your first patient to begin risk stratification." : "No patients match your search."}
          </div>
        )}

        <div className="space-y-2.5">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => onSelect(p.id)} className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[15px] text-slate-900">{p.name}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${RISK_STYLES[p.risk.category].bg} ${RISK_STYLES[p.risk.category].text}`}>{p.risk.category}</span>
              </div>
              <div className="text-[13px] text-slate-500">{p.diagnosis}{p.stage ? ` ${p.stage}` : ""}</div>
              <div className="text-[12px] text-slate-400 mt-1" style={mono}>UHID {p.uhid || "\u2014"} Cycle {p.cycle ?? 0} {p.clinicalStatus}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PATIENT DASHBOARD SHELL
   ========================================================================= */

const TABS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "opd", label: "OPD Review", icon: ClipboardList },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "tracker", label: "Investigation Tracker", icon: Activity },
  { id: "surveillance", label: "Surveillance", icon: ShieldAlert },
  { id: "hfaicos", label: "HFA-ICOS", icon: ShieldCheck },
  { id: "planner", label: "Follow-up Planner", icon: TrendingDown },
  { id: "drugs", label: "Drug Guidance", icon: BookOpen },
];

function PatientDashboard({ patient, onBack, updatePatient }) {
  const [tab, setTab] = useState("overview");
  const [draft, setDraft] = useState(() => {
    const last = patient.visits[patient.visits.length - 1];
    if (last && !last.saved) return last;
    return newVisit(patient.visits.length === 0 ? "Baseline" : "Cycle " + ((Number(patient.cycle) || 0) + 1));
  });

  async function saveVisit() {
    const recommendedFollowUp = getNextFollowUpPlan(patient, draft);
    const visitForSave = {
      ...draft,
      nextFollowUpDate: draft.nextFollowUpDate || recommendedFollowUp.date,
    };
    const alerts = computeAlerts(patient, visitForSave);
    const summary = await generateAISummary(patient, visitForSave);
    const savedVisit = { ...visitForSave, saved: true, alerts, aiSummary: summary };
    const existingIdx = patient.visits.findIndex((v) => v.id === savedVisit.id);
    const visits = existingIdx >= 0 ? patient.visits.map((v, i) => (i === existingIdx ? savedVisit : v)) : [...patient.visits, savedVisit];
    updatePatient({
      ...patient,
      cycle: Math.max(Number(patient.cycle) || 0, getVisitCycle(patient, savedVisit)),
      visits,
      lastSummary: summary,
    });
    setTab("overview");
  }

  function addVisitPlaceholder(date) {
    const v = newVisit(`Cycle ${(patient.cycle ?? 0) + 1}`);
    v.date = date;
    v.saved = true;
    updatePatient({ ...patient, visits: [...patient.visits, v] });
  }

  return (
    <div className="pb-16">
      <Header title={patient.name} subtitle={`${patient.diagnosis}${patient.stage ? " " + patient.stage : ""}`} onBack={onBack} />
      <div className="px-4 -mt-2">
        <PatientBanner patient={patient} />

        <div className="flex gap-2 overflow-x-auto pb-2 mb-1 -mx-4 px-4 no-scrollbar">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium border ${
                tab === t.id ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600"
              }`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={() => exportCSV(patient)} className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 flex items-center justify-center gap-1.5">
            <FileDown size={13} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 flex items-center justify-center gap-1.5">
            <Printer size={13} /> Print OPD
          </button>
        </div>

        {tab === "overview" && <OverviewTab patient={patient} draft={draft} setDraft={setDraft} updatePatient={updatePatient} />}
        {tab === "opd" && <OPDReviewTab patient={patient} draft={draft} setDraft={setDraft} saveVisit={saveVisit} />}
        {tab === "timeline" && <TimelineTab patient={patient} />}
        {tab === "tracker" && <TrackerTab />}
        {tab === "surveillance" && <SurveillanceTab patient={patient} updatePatient={updatePatient} />}
        {tab === "hfaicos" && <HfaIcosTab patient={patient} />}
        {tab === "planner" && <FollowUpPlannerTab patient={patient} addVisitPlaceholder={addVisitPlaceholder} />}
        {tab === "drugs" && <DrugGuidanceTab patient={patient} />}
      </div>
    </div>
  );
}

function exportCSV(patient) {
  const rows = [
    ["Field", "Value"],
    ["Name", patient.name], ["UHID", patient.uhid], ["Age", patient.age], ["Gender", patient.gender],
    ["Diagnosis", patient.diagnosis], ["Stage", patient.stage], ["Regimen", patient.regimen],
    ["HFA-ICOS", patient.risk.category], ["Baseline LVEF", patient.baselineLVEF], ["Cycle", patient.cycle],
    ["Clinical status", patient.clinicalStatus],
  ];
  patient.visits.forEach((v, i) => {
    rows.push([`Visit ${i + 1} type`, v.type]);
    rows.push([`Visit ${i + 1} date`, v.date]);
    rows.push([`Visit ${i + 1} symptoms`, v.symptoms.join("; ")]);
    INVESTIGATIONS.forEach((f) => rows.push([`Visit ${i + 1} ${f.label}`, `${v.inv[f.id].result} (${v.inv[f.id].interp})`]));
  });
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${patient.name || "patient"}_corsc.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================================================================
   ROOT APP
   ========================================================================= */

function CORSCWorkspace({ user, onSignOut }) {
  const [patients, setPatients] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const storage = window.localStorage;
    const storagePrefix = `corsc:patient:${user.id}:`;

    try {
      const savedPatients = Object.keys(storage).flatMap((key) => {
        if (!key.startsWith(storagePrefix)) return [];
        try {
          const value = storage.getItem(key);
          return value ? [JSON.parse(value)] : [];
        } catch {
          return [];
        }
      });
      setPatients(savedPatients);
    } catch {
      setPatients([]);
    }
    setLoaded(true);
  }, [user.id]);

  const persist = useCallback((p) => {
    try {
      window.localStorage.setItem(`corsc:patient:${user.id}:${p.id}`, JSON.stringify(p));
    } catch {}
  }, [user.id]);

  function createPatient(p) {
    setPatients((prev) => [p, ...prev]);
    persist(p);
    setSelectedId(p.id);
    setView("patient");
  }

  function updatePatient(p) {
    setPatients((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    persist(p);
  }

  const selected = patients.find((p) => p.id === selectedId);

  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`${FONT_IMPORT} .no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none} @media print { .no-print{display:none} }`}</style>
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pt-3 no-print">
        <span className="truncate text-xs text-slate-500">{user.email || "Signed in"}</span>
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onSignOut}>
          <LogOut className="size-3.5" aria-hidden="true" />
          Sign out
        </Button>
      </div>
      <div className="max-w-md mx-auto">
        {!loaded ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading\u2026</div>
        ) : view === "list" ? (
          <PatientList patients={patients} onSelect={(id) => { setSelectedId(id); setView("patient"); }} onNew={() => setView("register")} />
        ) : view === "register" ? (
          <NewPatientForm onCancel={() => setView("list")} onCreate={createPatient} />
        ) : selected ? (
          <PatientDashboard patient={selected} onBack={() => setView("list")} updatePatient={updatePatient} />
        ) : (
          <div className="p-10 text-center text-slate-400 text-sm">Patient not found.</div>
        )}
      </div>
      <div className="max-w-md mx-auto px-4 pb-6 text-center text-[11px] text-slate-400 no-print">
        Decision-support platform built on the HFA-ICOS risk framework and ESC 2022 cardio-oncology guidelines. It does not replace clinical judgement, full guideline review, or multidisciplinary cardio-oncology input. For use by qualified clinicians only.
      </div>
    </div>
  );
}

export default function CORSCApp() {
  return (
    <AuthGate>
      {({ user, signOut }) => <CORSCWorkspace user={user} onSignOut={signOut} />}
    </AuthGate>
  );
}
