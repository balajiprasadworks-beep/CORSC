/* =========================================================================
   Surveillance scheduling.

   Generates the tasks due at this encounter from the therapies planned, the
   baseline risk category, the position in the treatment course, and anything
   abnormal found today.

   Four corrections from the previous implementation:

   - Every therapy is now scored, not just the first. `therapy[0]` meant a
     patient on anthracycline followed by trastuzumab silently received only
     the anthracycline protocol.

   - Checkpoint-inhibitor myocarditis escalates on a troponin rise alone. The
     previous rule also required symptoms, which contradicted the application's
     own drug guidance that fulminant myocarditis can present with a normal
     ejection fraction and that any rise warrants work-up.

   - Task completion requires evidence specific to the task. Eight distinct
     safety tasks previously shared one test - whether the free-text plan field
     contained anything - so typing "review in 3 weeks" marked urgent cardiology
     review, heart-failure therapy and the chemotherapy continuation discussion
     as all complete.

   - Follow-up is an acuity band rather than date arithmetic, so genuinely
     urgent presentations can say "assess now".
   ========================================================================= */

import { ACUITY, resolveFollowUp, routineDays } from "@/lib/acuity";
import { hasBiomarkerRise, interpretECG, interpretNatriuretic, interpretTroponin } from "@/lib/cardiac-measurements";
import { GRADE_MODERATE, GRADE_VERY_SEVERE, gradeCTRCD, isWorse } from "@/lib/ctrcd";
import { PHASES, cycleOf, phaseOf } from "@/lib/encounter-phase";
import { therapyList } from "@/lib/hfa-icos";
import { num } from "@/lib/vitals";

const CARDIAC_SYMPTOMS = [
  "Chest pain",
  "Dyspnoea",
  "Orthopnoea",
  "Paroxysmal nocturnal dyspnoea",
  "Palpitations",
  "Syncope",
  "Presyncope",
  "Pedal oedema",
];

/** Symptoms that warrant assessment before the patient leaves the department. */
const IMMEDIATE_SYMPTOMS = ["Chest pain", "Syncope"];

const PRIORITY_ORDER = { routine: 1, surveillance: 2, urgent: 3 };

function text(value) {
  return String(value || "").toLowerCase();
}

function hasResult(visit, id) {
  const item = visit?.inv?.[id];
  return Boolean(item && (item.result || item.interp || item.comment));
}

function hasExam(visit, fields) {
  return fields.some((field) => Boolean(visit?.exam?.[field]));
}

function containsAny(value, patterns) {
  const normalized = text(value);
  return patterns.some((pattern) => normalized.includes(pattern));
}

function isAbnormal(visit, id, words) {
  const item = visit?.inv?.[id];
  if (!item) return false;
  return containsAny([item.result, item.interp, item.comment].join(" "), words);
}

export { cycleOf as getVisitCycle } from "@/lib/encounter-phase";

/* ------------------------------------------------------- task completion */

/**
 * How each task is shown to be done.
 *
 * Tasks with an objective trace - a result entered, a measurement recorded -
 * resolve themselves. Tasks that represent a clinical action taken elsewhere,
 * such as making a referral or agreeing to interrupt chemotherapy, cannot be
 * inferred from anything typed in this record, so they stay outstanding until
 * the clinician marks them done. Reporting them complete because some text
 * exists is worse than reporting them outstanding.
 */
const COMPLETION_EVIDENCE = {
  symptoms: (visit) => Array.isArray(visit?.symptoms) && visit.symptoms.length > 0,
  vitals: (visit) => hasExam(visit, ["bp", "pulse", "spo2"]),
  "general-exam": (visit) => Boolean(visit?.notes),
  weight: (visit) => Boolean(visit?.exam?.weight),
  "medication-review": (visit) => Boolean(visit?.medReview),
  "cv-exam": (visit) => hasExam(visit, ["jvp", "heart", "lungs", "oedema"]),
  ecg: (visit) => hasResult(visit, "ecg"),
  echo: (visit) => hasResult(visit, "echo") || hasResult(visit, "lvef"),
  gls: (visit) => hasResult(visit, "gls"),
  troponin: (visit) => hasResult(visit, "troponin"),
  "repeat-troponin": (visit) => hasResult(visit, "troponin"),
  ntprobnp: (visit) => hasResult(visit, "ntprobnp"),
  electrolytes: (visit) => hasResult(visit, "electrolytes"),
  "next-follow-up": (visit) => Boolean(visit?.nextFollowUpDate),
  "chest-pain-screen": (visit) => Array.isArray(visit?.symptoms),
  "peripheral-vascular": (visit) => hasExam(visit, ["oedema"]),
  "anthracycline-dose-review": (visit) => Boolean(visit?.anthracyclineDoseReviewed),
};

/** Tasks that require an explicit acknowledgement because no trace proves them. */
export const ACKNOWLEDGED_TASKS = new Set([
  "cardiology-review",
  "urgent-cardiology",
  "hf-therapy",
  "acei-arb-review",
  "beta-blocker-review",
  "qt-drug-review",
  "chemo-continuation",
  "qt-chemo-interruption",
]);

export function taskIsDocumented(task, visit) {
  const evidence = COMPLETION_EVIDENCE[task.id];
  return evidence ? Boolean(evidence(visit)) : false;
}

export function isTaskComplete(task, visit) {
  const explicit = visit?.taskCompletion?.[task.id];
  if (explicit === true) return true;
  if (explicit === false) return false;
  if (ACKNOWLEDGED_TASKS.has(task.id)) return false;
  return Boolean(task.completed || taskIsDocumented(task, visit));
}

/* -------------------------------------------------------------- task set */

function addTask(tasks, definition) {
  const existing = tasks.get(definition.id);
  if (!existing) {
    tasks.set(definition.id, { ...definition });
    return;
  }
  const existingPriority = PRIORITY_ORDER[existing.priority] || 1;
  const incomingPriority = PRIORITY_ORDER[definition.priority] || 1;
  if (incomingPriority > existingPriority) existing.priority = definition.priority;
  if (definition.detail && !existing.detail.includes(definition.detail)) {
    existing.detail = existing.detail ? `${existing.detail} ${definition.detail}` : definition.detail;
  }
}

const addRoutineTask = (tasks, id, label, detail) => addTask(tasks, { id, label, detail, priority: "routine" });
const addSurveillanceTask = (tasks, id, label, detail) => addTask(tasks, { id, label, detail, priority: "surveillance" });
const addUrgentTask = (tasks, id, label, detail) => addTask(tasks, { id, label, detail, priority: "urgent" });

function addUniversalTasks(tasks) {
  addRoutineTask(tasks, "symptoms", "Symptom review", "Screen for chest pain, dyspnoea, orthopnoea, palpitations, syncope, leg swelling, and fatigue.");
  addRoutineTask(tasks, "vitals", "Vitals", "Record blood pressure, pulse or heart rate, and oxygen saturation.");
  addRoutineTask(tasks, "general-exam", "General and systemic examination", "Document clinically relevant systemic findings.");
  addRoutineTask(tasks, "weight", "Weight and weight-loss assessment", "Record weight; calculate percentage loss when weight loss is relevant.");
  addRoutineTask(tasks, "medication-review", "Medication review", "Review cardioprotective, concomitant, and QT-prolonging medicines.");
}

function addBaselineTasks(tasks, therapy) {
  addSurveillanceTask(tasks, "cv-exam", "Cardiovascular examination", "Baseline cardiovascular examination.");
  addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Baseline ECG.");

  if (["anthracycline", "her2", "ici", "proteasome"].includes(therapy)) {
    addSurveillanceTask(tasks, "troponin", "Troponin", "Baseline biomarker.");
    addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "Baseline natriuretic peptide.");
  }
  if (therapy === "vegf") addSurveillanceTask(tasks, "troponin", "Troponin", "Baseline biomarker.");

  if (therapy !== "fluoropyrimidine") {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Baseline ventricular function assessment.");
    if (!["vegf", "bcrabl", "rafmek"].includes(therapy)) {
      addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Obtain with baseline echocardiography.");
    }
  }
}

function addEndOfTreatmentTasks(tasks, therapy) {
  if (therapy === "anthracycline") {
    addSurveillanceTask(tasks, "cv-exam", "Cardiovascular examination", "End-of-treatment examination.");
    addSurveillanceTask(tasks, "ecg", "12-lead ECG", "End-of-treatment ECG.");
    addSurveillanceTask(tasks, "troponin", "Troponin", "End-of-treatment biomarker.");
    addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "End-of-treatment natriuretic peptide.");
  }
  if (therapy === "anthracycline" || therapy === "her2") {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "End-of-treatment ventricular function assessment.");
    addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with scheduled echocardiography.");
  }
}

function addPostTreatmentTasks(tasks, therapy, phase) {
  if (phase === PHASES.threeMonth.id) {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Three-month post-treatment surveillance.");
    if (therapy === "anthracycline") {
      addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with the three-month echocardiogram.");
      addSurveillanceTask(tasks, "troponin", "Troponin", "Three-month post-treatment biomarker.");
    }
  }

  if (phase === PHASES.sixMonth.id && (therapy === "anthracycline" || therapy === "her2")) {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Six-month post-treatment surveillance after high cardiotoxic exposure.");
  }

  if (phase === PHASES.twelveMonth.id && (therapy === "anthracycline" || therapy === "her2")) {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Twelve-month post-treatment surveillance.");
    addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with the twelve-month echocardiogram.");
  }
}

function addTreatmentTasks(tasks, therapy, risk, cycle, patient) {
  const highRisk = risk === "High" || risk === "Very High";
  const moderateRisk = risk === "Moderate";
  const regimen = text(patient?.regimen);
  const everyTwoCycles = cycle > 0 && cycle % 2 === 0;
  const everyThreeCycles = cycle > 0 && cycle % 3 === 0;
  const everyFourCycles = cycle > 0 && cycle % 4 === 0;

  if (therapy === "anthracycline") {
    if (highRisk) {
      addSurveillanceTask(tasks, "cv-exam", "Cardiovascular examination", "Required every cycle for high and very-high risk.");
      addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Required every cycle for high and very-high risk.");
      addSurveillanceTask(tasks, "troponin", "Troponin", "Required every cycle for high and very-high risk.");
      addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "Required every cycle for high and very-high risk.");
      if (everyTwoCycles) {
        addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Scheduled every two cycles.");
        addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with scheduled echocardiography.");
      }
    } else if (moderateRisk) {
      addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Required every cycle for moderate risk.");
      if (everyTwoCycles) {
        addSurveillanceTask(tasks, "troponin", "Troponin", "Scheduled every two cycles.");
        addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "Scheduled every two cycles.");
      }
      if (everyFourCycles) {
        addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Scheduled every four cycles.");
        addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with scheduled echocardiography.");
      }
    } else {
      addSurveillanceTask(tasks, "anthracycline-dose-review", "Cumulative anthracycline dose review", "Order TTE with GLS once cumulative dose reaches 250 mg/m²; biomarkers are due at mid-treatment and treatment completion.");
    }
  }

  if (therapy === "her2") {
    if (everyThreeCycles) {
      addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Scheduled approximately every three months.");
      addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with scheduled echocardiography.");
    }
    if (highRisk) addSurveillanceTask(tasks, "troponin", "Troponin", "High-risk HER2 surveillance.");
  }

  if (therapy === "ici") {
    // Myocarditis risk is concentrated in the first doses, so the early window
    // is applied whenever the cycle is unknown rather than assumed past.
    if (cycle === null || cycle <= 4) {
      addSurveillanceTask(tasks, "troponin", "Troponin", "Troponin before each of the first four doses — myocarditis risk peaks early.");
      addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Early ICI myocarditis surveillance.");
    } else if (highRisk) {
      addSurveillanceTask(tasks, "troponin", "Troponin", "High-risk ICI surveillance.");
    }
  }

  if (therapy === "vegf" && everyThreeCycles) {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Scheduled approximately every two to three months.");
  }

  if (therapy === "bcrabl") {
    if (regimen.includes("nilotinib") && (cycle === null || cycle <= 2 || everyThreeCycles)) {
      addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Nilotinib QT surveillance at early treatment and then every three months.");
    }
    if (regimen.includes("ponatinib")) {
      addSurveillanceTask(tasks, "peripheral-vascular", "Peripheral vascular assessment", "Assess for claudication, limb pain, pallor, or reduced pulses at every visit.");
    }
  }

  if (therapy === "proteasome") {
    if (everyTwoCycles) {
      addSurveillanceTask(tasks, "troponin", "Troponin", "Scheduled every two cycles.");
      addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "Scheduled every two cycles.");
    }
    if (everyThreeCycles) addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Scheduled approximately every three months.");
  }

  if (therapy === "rafmek" && everyThreeCycles) {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Scheduled approximately every two to three months.");
    addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Scheduled approximately every two to three months.");
  }

  if (therapy === "fluoropyrimidine") {
    addSurveillanceTask(tasks, "chest-pain-screen", "Chest-pain screen", "Screen specifically for fluoropyrimidine-associated chest pain at every infusion.");
  }
}

function addDynamicOverrideTasks(tasks, signals) {
  if (signals.elevatedTroponin) {
    addUrgentTask(tasks, "repeat-troponin", "Repeat troponin", "Repeat within 24 to 48 hours.");
    addUrgentTask(tasks, "ecg", "12-lead ECG", "Urgent assessment after a troponin rise.");
    addUrgentTask(tasks, "echo", "Echocardiography (TTE)", "Urgent assessment after a troponin rise.");
    addUrgentTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with urgent echocardiography.");
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Escalate abnormal troponin to cardio-oncology.");
  }
  if (signals.suspectedICIMyocarditis) {
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Any troponin rise on a checkpoint inhibitor requires myocarditis work-up, whether or not the patient has symptoms and whatever the ejection fraction.");
    addUrgentTask(tasks, "echo", "Echocardiography (TTE)", "Note that a normal ejection fraction does not exclude fulminant myocarditis.");
    addUrgentTask(tasks, "chemo-continuation", "Hold immunotherapy pending assessment", "Withhold the next dose until myocarditis has been excluded.");
  }
  if (signals.glsDrop) {
    addUrgentTask(tasks, "echo", "Repeat echocardiography (TTE)", "Repeat after a GLS reduction greater than 15%.");
    addUrgentTask(tasks, "acei-arb-review", "ACE inhibitor or ARB review", "Consider cardioprotective therapy.");
    addUrgentTask(tasks, "beta-blocker-review", "Beta-blocker review", "Consider cardioprotective therapy.");
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Escalate GLS reduction greater than 15%.");
  }
  if (signals.lvefDecline) {
    addUrgentTask(tasks, "echo", "Repeat echocardiography (TTE)", "Repeat in two to three weeks after a fall meeting CTRCD criteria.");
    addUrgentTask(tasks, "hf-therapy", "Start or optimise heart-failure therapy", "Review guideline-directed therapy.");
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Escalate cancer therapy-related cardiac dysfunction.");
    addUrgentTask(tasks, "chemo-continuation", "Discuss chemotherapy continuation", "Coordinate decision with oncology and cardio-oncology.");
  }
  if (signals.qtProlongation) {
    addUrgentTask(tasks, "ecg", "Repeat 12-lead ECG", "Urgent QTc reassessment.");
    addUrgentTask(tasks, "electrolytes", "Check potassium, magnesium, and calcium", "Correct electrolyte abnormalities.");
    addUrgentTask(tasks, "qt-drug-review", "Review QT-prolonging drugs", "Review cancer and concomitant therapy.");
    addUrgentTask(tasks, "qt-chemo-interruption", "Consider temporary treatment interruption", "Discuss interruption of QT-prolonging chemotherapy with oncology.");
  }
  if (signals.currentCardiacSymptoms.length > 0) {
    addUrgentTask(tasks, "cv-exam", "Cardiovascular examination", "New cardiac symptoms require focused examination.");
    addUrgentTask(tasks, "ecg", "12-lead ECG", "Urgent assessment for new cardiac symptoms.");
    addUrgentTask(tasks, "troponin", "Troponin", "Urgent assessment for new cardiac symptoms.");
    addUrgentTask(tasks, "echo", "Echocardiography (TTE)", "Perform if clinically indicated by symptoms or examination.");
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Escalate chest pain, dyspnoea, syncope, palpitations, or oedema.");
  }
}

/* --------------------------------------------------------------- signals */

/** Numeric result for an investigation at a visit, if one was recorded. */
function invValue(visit, id) {
  return num(visit?.inv?.[id]?.result);
}

/**
 * Clinical signals from this encounter and the ones before it.
 *
 * Structured measurements are preferred where present; the free-text checks are
 * retained only so that records created before structured entry existed still
 * produce signals rather than silently reading as normal.
 */
export function getClinicalSignals(patient, visit) {
  const previous = Array.isArray(patient?.visits)
    ? patient.visits.filter((item) => item && item.id !== visit?.id)
    : [];
  const allVisits = previous.concat(visit || []);
  const symptoms = Array.isArray(visit?.symptoms) ? visit.symptoms : [];
  const currentCardiacSymptoms = symptoms.filter((symptom) => CARDIAC_SYMPTOMS.includes(symptom));
  const restratification = patient?.restratification || {};
  const therapies = therapyList(patient?.therapy);

  const baselineLvef = num(patient?.baselineLVEF);
  const lvefValues = allVisits.map((item) => invValue(item, "lvef")).filter((value) => value !== null);
  const lowestLvef = lvefValues.length ? Math.min(...lvefValues) : null;
  const currentLvef = invValue(visit, "lvef") ?? num(restratification.currentLVEF) ?? lowestLvef;

  /* --- biomarkers, structured where available --- */
  const troponin = interpretTroponin({
    value: visit?.inv?.troponin?.value ?? visit?.inv?.troponin?.result,
    baseline: patient?.baselineTroponin,
    assayId: patient?.troponinAssay,
    sex: patient?.gender,
    localURL: patient?.troponinURL,
  });
  const natriuretic = interpretNatriuretic({
    value: visit?.inv?.ntprobnp?.value ?? visit?.inv?.ntprobnp?.result,
    baseline: patient?.baselineNtProBnp,
    age: patient?.age,
  });

  const legacyTroponinRise = allVisits.some((item) => isAbnormal(item, "troponin", ["elevat", "raised", "positive"]));
  const elevatedTroponin = troponin.newRise || legacyTroponinRise || Boolean(restratification.troponinRise);
  const elevatedNtprobnp =
    natriuretic.newRise || allVisits.some((item) => isAbnormal(item, "ntprobnp", ["elevat", "raised"]));

  /* --- strain --- */
  const baselineGls = num(patient?.baselineGLS);
  const currentGls = invValue(visit, "gls");
  const glsFallFromValues =
    baselineGls !== null && currentGls !== null
      ? ((Math.abs(baselineGls) - Math.abs(currentGls)) / Math.abs(baselineGls)) * 100
      : null;
  const glsFall = num(restratification.glsFall) ?? glsFallFromValues;
  const glsDrop = (glsFall !== null && glsFall > 15) || allVisits.some((item) => isAbnormal(item, "gls", ["drop", "reduc"]));

  /* --- QT --- */
  const ecg = interpretECG({
    ecg: visit?.inv?.ecg?.measurements || {},
    sex: patient?.gender,
    baselineQtc: patient?.baselineQTc,
  });
  const legacyQt = allVisits.some((item) => {
    const entry = item?.inv?.ecg;
    const combined = [entry?.result, entry?.interp, entry?.comment].join(" ");
    const match = combined.match(/qtc?\D{0,8}(\d{3})/i);
    return containsAny(combined, ["prolonged qt", "qt prolong"]) || Boolean(match && Number(match[1]) >= 500);
  });
  const qtProlongation = ecg.actionable || legacyQt;

  /* --- graded cardiac dysfunction --- */
  const ctrcd = gradeCTRCD({
    baselineLVEF: baselineLvef,
    currentLVEF: currentLvef,
    glsRelativeFall: glsFall,
    biomarkerRise: hasBiomarkerRise({ troponin, natriuretic }) || elevatedTroponin || elevatedNtprobnp,
    hfStatus: visit?.hfStatus || (restratification.severeHF ? "severe" : undefined),
  });

  return {
    troponin,
    natriuretic,
    ecg,
    ctrcd,
    therapies,
    elevatedTroponin,
    elevatedNtprobnp,
    glsFall,
    glsDrop,
    qtProlongation,
    currentCardiacSymptoms,
    immediateSymptoms: symptoms.filter((symptom) => IMMEDIATE_SYMPTOMS.includes(symptom)),
    lvefDecline: isWorse(ctrcd.grade, GRADE_MODERATE) || ctrcd.grade === GRADE_MODERATE,
    /**
     * Any troponin rise on a checkpoint inhibitor. Deliberately not gated on
     * symptoms or ejection fraction: myocarditis screening exists to catch the
     * condition before either changes.
     */
    suspectedICIMyocarditis: therapies.includes("ici") && elevatedTroponin,
    abnormalEcho:
      allVisits.some((item) => isAbnormal(item, "echo", ["abnormal", "reduced", "dysfunction"])) ||
      Boolean(lowestLvef !== null && lowestLvef < 50),
    clinicalDeterioration: ["Worsening", "Critical"].includes(patient?.clinicalStatus),
    myocarditisConfirmed: Boolean(restratification.myocarditisConfirmed),
  };
}

/* ------------------------------------------------------------- follow-up */

/**
 * Follow-up plan as an acuity band with a derived date.
 *
 * Every trigger contributes a band and a reason; the most urgent wins and all
 * of its reasons are reported.
 */
export function getNextFollowUpPlan(patient, visit) {
  const risk = patient?.risk?.category || "Low";
  const phase = phaseOf(visit);
  const cycle = cycleOf(patient, visit);
  const signals = getClinicalSignals(patient, visit);
  const therapies = signals.therapies;
  const triggers = [];

  /* Baseline interval from the phase of treatment. */
  let baseDays = routineDays(risk);
  if (phase === PHASES.end.id) baseDays = 90;
  else if (phase === PHASES.threeMonth.id) baseDays = 90;
  else if (phase === PHASES.sixMonth.id) baseDays = 180;
  else if (phase === PHASES.twelveMonth.id) baseDays = 365;
  else if (therapies.includes("ici") && (cycle === null || cycle <= 3)) baseDays = Math.min(baseDays, 21);
  else if (therapies.includes("proteasome")) baseDays = Math.min(baseDays, 14);
  else if (therapies.some((t) => ["vegf", "her2", "fluoropyrimidine"].includes(t))) baseDays = Math.min(baseDays, 21);

  /* Clinical triggers, most urgent first. */
  if (signals.immediateSymptoms.length) {
    triggers.push({
      band: ACUITY.now.id,
      reason: `${signals.immediateSymptoms.join(" and ")} reported — assess before the patient leaves`,
    });
  }
  if (signals.suspectedICIMyocarditis) {
    triggers.push({ band: ACUITY.now.id, reason: "Troponin rise on a checkpoint inhibitor — exclude myocarditis today" });
  }
  if (signals.myocarditisConfirmed) {
    triggers.push({ band: ACUITY.now.id, reason: "Confirmed myocarditis" });
  }
  if (isWorse(signals.ctrcd.grade, GRADE_MODERATE)) {
    triggers.push({
      band: signals.ctrcd.grade === GRADE_VERY_SEVERE ? ACUITY.now.id : ACUITY.sameDay.id,
      reason: `${signals.ctrcd.shortLabel} — ${signals.ctrcd.criteria[0] || "graded from this encounter"}`,
    });
  }
  if (signals.qtProlongation) {
    triggers.push({ band: ACUITY.sameDay.id, reason: "QTc at or above the action threshold — repeat ECG and correct electrolytes today" });
  }
  if (signals.ctrcd.grade === GRADE_MODERATE) {
    triggers.push({ band: ACUITY.urgent.id, reason: `${signals.ctrcd.shortLabel} — repeat imaging and cardio-oncology review` });
  }
  if (signals.elevatedTroponin && !signals.suspectedICIMyocarditis) {
    triggers.push({ band: ACUITY.urgent.id, reason: "Troponin risen from baseline — repeat within 24 to 48 hours" });
  }
  if (signals.currentCardiacSymptoms.length && !signals.immediateSymptoms.length) {
    triggers.push({ band: ACUITY.soon.id, reason: `Cardiac symptoms reported: ${signals.currentCardiacSymptoms.join(", ")}` });
  }
  if (signals.glsDrop || signals.ctrcd.unresolved) {
    triggers.push({
      band: ACUITY.early.id,
      reason: signals.ctrcd.unresolved
        ? "Cardiac dysfunction could not be graded from the available measurements — repeat imaging and biomarkers"
        : "GLS relative fall greater than 15% — repeat imaging",
    });
  }
  if (signals.clinicalDeterioration) {
    triggers.push({ band: ACUITY.soon.id, reason: `Clinical status recorded as ${patient?.clinicalStatus}` });
  }

  return resolveFollowUp({ triggers, risk, from: visit?.date, baseDays });
}

/* ----------------------------------------------------------------- tasks */

export function getDynamicSurveillanceTasks(patient, visit) {
  const therapies = therapyList(patient?.therapy);
  const risk = patient?.risk?.category || "Low";
  const cycle = cycleOf(patient, visit);
  const phase = phaseOf(visit);
  const signals = getClinicalSignals(patient, visit);
  const tasks = new Map();

  addUniversalTasks(tasks);

  /* Every planned therapy contributes its protocol, not just the first. */
  const scored = therapies.length ? therapies : [null];
  scored.forEach((therapy) => {
    if (phase === PHASES.baseline.id) addBaselineTasks(tasks, therapy);
    else if (phase === PHASES.end.id) addEndOfTreatmentTasks(tasks, therapy);
    else if (PHASES[phase].posttreatment) addPostTreatmentTasks(tasks, therapy, phase);
    else addTreatmentTasks(tasks, therapy, risk, cycle ?? 1, patient);
  });

  const onTreatment = phase !== PHASES.baseline.id;

  if (onTreatment && (signals.currentCardiacSymptoms.length || signals.elevatedTroponin || signals.elevatedNtprobnp || signals.abnormalEcho || signals.clinicalDeterioration)) {
    addSurveillanceTask(tasks, "cv-exam", "Cardiovascular examination", "Required because of symptoms, abnormal findings, or clinical deterioration.");
  }

  const qtTherapy = therapies.includes("rafmek") || (therapies.includes("bcrabl") && text(patient?.regimen).includes("nilotinib"));
  if (onTreatment && (qtTherapy || signals.qtProlongation || signals.currentCardiacSymptoms.length || hasResult(visit, "electrolytes"))) {
    addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Indicated for QT-risk therapy, symptoms, electrolyte disturbance, or previous QT prolongation.");
  }

  const highRisk = risk === "High" || risk === "Very High";
  if ((therapies.includes("anthracycline") || therapies.includes("ici") || highRisk) && signals.elevatedTroponin) {
    addSurveillanceTask(tasks, "troponin", "Troponin", "Trend because of therapy or high baseline risk.");
  }
  if ((therapies.includes("anthracycline") || highRisk) && signals.elevatedNtprobnp) {
    addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "Trend because of heart-failure risk or high baseline risk.");
  }

  addDynamicOverrideTasks(tasks, signals);

  const followUp = getNextFollowUpPlan(patient, visit);
  addRoutineTask(
    tasks,
    "next-follow-up",
    "Schedule next surveillance visit",
    `${followUp.label}: ${followUp.date} (${followUp.days} days) — ${followUp.reasons[0]}.`
  );

  return Array.from(tasks.values()).map((task) => ({
    ...task,
    requiresAcknowledgement: ACKNOWLEDGED_TASKS.has(task.id),
    completed: taskIsDocumented(task, visit),
  }));
}
