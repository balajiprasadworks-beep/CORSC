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

const PRIORITY_ORDER = { routine: 1, surveillance: 2, urgent: 3 };

function text(value) {
  return String(value || "").toLowerCase();
}

function hasResult(visit, id) {
  const item = visit && visit.inv && visit.inv[id];
  return Boolean(item && (item.result || item.interp || item.comment));
}

function hasExam(visit, fields) {
  return fields.some((field) => Boolean(visit && visit.exam && visit.exam[field]));
}

function containsAny(value, patterns) {
  const normalized = text(value);
  return patterns.some((pattern) => normalized.includes(pattern));
}

function numericValue(value) {
  const found = String(value || "").match(/-?\d+(?:\.\d+)?/);
  return found ? Number(found[0]) : null;
}

function isAbnormal(visit, id, words) {
  const item = visit && visit.inv && visit.inv[id];
  if (!item) return false;
  return containsAny([item.result, item.interp, item.comment].join(" "), words);
}

function visitDate(visit) {
  const parsed = new Date(String((visit && visit.date) || "") + "T12:00:00");
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

function phaseOf(visit) {
  const type = text(visit && visit.type);
  if (type.includes("baseline") || type.includes("cycle 1 baseline")) return "baseline";
  if (type.includes("end of treatment") || type.includes("end therapy") || type.includes("completion")) return "end";
  if (type.includes("3 month") || type.includes("three month")) return "threeMonth";
  if (type.includes("12 month") || type.includes("twelve month")) return "twelveMonth";
  return "treatment";
}

function taskIsDocumented(task, visit) {
  const inv = visit && visit.inv;
  switch (task.id) {
    case "symptoms":
      return Array.isArray(visit && visit.symptoms) && visit.symptoms.length > 0;
    case "vitals":
      return hasExam(visit, ["bp", "pulse", "spo2"]);
    case "general-exam":
      return Boolean(visit && visit.notes);
    case "weight":
      return Boolean(visit && visit.exam && visit.exam.weight);
    case "medication-review":
      return Boolean(visit && visit.medReview);
    case "cv-exam":
      return hasExam(visit, ["jvp", "heart", "lungs", "oedema"]);
    case "ecg":
      return hasResult(visit, "ecg");
    case "echo":
      return hasResult(visit, "echo") || hasResult(visit, "lvef");
    case "gls":
      return hasResult(visit, "gls");
    case "troponin":
    case "repeat-troponin":
      return Boolean(inv && inv.troponin && (inv.troponin.result || inv.troponin.interp));
    case "ntprobnp":
      return Boolean(inv && inv.ntprobnp && (inv.ntprobnp.result || inv.ntprobnp.interp));
    case "electrolytes":
      return hasResult(visit, "electrolytes");
    case "next-follow-up":
      return Boolean(visit && visit.nextFollowUpDate);
    case "cardiology-review":
    case "urgent-cardiology":
    case "hf-therapy":
    case "acei-arb-review":
    case "beta-blocker-review":
    case "qt-drug-review":
    case "chemo-continuation":
    case "qt-chemo-interruption":
      return Boolean(visit && visit.plan);
    default:
      return false;
  }
}

function addTask(tasks, definition) {
  const existing = tasks.get(definition.id);
  if (!existing) {
    tasks.set(definition.id, definition);
    return;
  }

  const existingPriority = PRIORITY_ORDER[existing.priority] || 1;
  const incomingPriority = PRIORITY_ORDER[definition.priority] || 1;
  if (incomingPriority > existingPriority) existing.priority = definition.priority;
  if (definition.detail && !existing.detail.includes(definition.detail)) {
    existing.detail = existing.detail ? existing.detail + " " + definition.detail : definition.detail;
  }
}

function addRoutineTask(tasks, id, label, detail) {
  addTask(tasks, { id, label, detail, priority: "routine" });
}

function addSurveillanceTask(tasks, id, label, detail) {
  addTask(tasks, { id, label, detail, priority: "surveillance" });
}

function addUrgentTask(tasks, id, label, detail) {
  addTask(tasks, { id, label, detail, priority: "urgent" });
}

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

  if (therapy === "anthracycline" || therapy === "her2" || therapy === "ici" || therapy === "proteasome") {
    addSurveillanceTask(tasks, "troponin", "Troponin", "Baseline biomarker.");
    addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "Baseline natriuretic peptide.");
  }
  if (therapy === "vegf") addSurveillanceTask(tasks, "troponin", "Troponin", "Baseline biomarker.");

  if (therapy !== "fluoropyrimidine") {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Baseline ventricular function assessment.");
    if (therapy !== "vegf" && therapy !== "bcrabl" && therapy !== "rafmek") {
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
  if (phase === "threeMonth") {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Three-month post-treatment surveillance.");
    if (therapy === "anthracycline") {
      addSurveillanceTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with the three-month echocardiogram.");
      addSurveillanceTask(tasks, "troponin", "Troponin", "Three-month post-treatment biomarker.");
    }
  }

  if (phase === "twelveMonth" && (therapy === "anthracycline" || therapy === "her2")) {
    addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Twelve-month post-treatment surveillance.");
  }
}

function addTreatmentTasks(tasks, therapy, risk, cycle, patient) {
  const highRisk = risk === "High" || risk === "Very High";
  const moderateRisk = risk === "Moderate";
  const regimen = text(patient && patient.regimen);
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
    if (cycle === 2 || cycle === 3) {
      addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Early ICI myocarditis surveillance.");
      addSurveillanceTask(tasks, "troponin", "Troponin", "Early ICI myocarditis surveillance.");
    } else if (cycle === 4) {
      addSurveillanceTask(tasks, "troponin", "Troponin", "Dose-four ICI myocarditis surveillance.");
    } else if (highRisk) {
      addSurveillanceTask(tasks, "troponin", "Troponin", "High-risk ICI surveillance.");
    }
  }

  if (therapy === "vegf") {
    if (everyThreeCycles) addSurveillanceTask(tasks, "echo", "Echocardiography (TTE)", "Scheduled approximately every two to three months.");
  }

  if (therapy === "bcrabl") {
    if (regimen.includes("nilotinib") && (cycle <= 2 || everyThreeCycles)) {
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
  const cardiacSymptoms = signals.currentCardiacSymptoms;
  if (signals.elevatedTroponin) {
    addUrgentTask(tasks, "repeat-troponin", "Repeat troponin", "Repeat within 24 to 48 hours.");
    addUrgentTask(tasks, "ecg", "12-lead ECG", "Urgent assessment after a troponin rise.");
    addUrgentTask(tasks, "echo", "Echocardiography (TTE)", "Urgent assessment after a troponin rise.");
    addUrgentTask(tasks, "gls", "Global longitudinal strain (GLS)", "Perform with urgent echocardiography.");
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Escalate abnormal troponin to cardio-oncology.");
  }
  if (signals.glsDrop) {
    addUrgentTask(tasks, "echo", "Repeat echocardiography (TTE)", "Repeat after a GLS reduction greater than 15%.");
    addUrgentTask(tasks, "acei-arb-review", "ACE inhibitor or ARB review", "Consider cardioprotective therapy.");
    addUrgentTask(tasks, "beta-blocker-review", "Beta-blocker review", "Consider cardioprotective therapy.");
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Escalate GLS reduction greater than 15%.");
  }
  if (signals.lvefDecline) {
    addUrgentTask(tasks, "echo", "Repeat echocardiography (TTE)", "Repeat in two to three weeks for an LVEF fall of at least 10 points to below 50%.");
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
  if (cardiacSymptoms.length > 0) {
    addUrgentTask(tasks, "cv-exam", "Cardiovascular examination", "New cardiac symptoms require focused examination.");
    addUrgentTask(tasks, "ecg", "12-lead ECG", "Urgent assessment for new cardiac symptoms.");
    addUrgentTask(tasks, "troponin", "Troponin", "Urgent assessment for new cardiac symptoms.");
    addUrgentTask(tasks, "echo", "Echocardiography (TTE)", "Perform if clinically indicated by symptoms or examination.");
    addUrgentTask(tasks, "urgent-cardiology", "Urgent cardiology review", "Escalate chest pain, dyspnoea, syncope, palpitations, or oedema.");
  }
}

export function getVisitCycle(patient, visit) {
  const explicitCycle = numericValue(visit && visit.cycle);
  if (explicitCycle !== null && explicitCycle > 0) return Math.floor(explicitCycle);
  const fromType = String((visit && visit.type) || "").match(/(?:cycle|dose)\s*(\d+)/i);
  if (fromType) return Number(fromType[1]);
  const patientCycle = numericValue(patient && patient.cycle);
  return patientCycle !== null && patientCycle > 0 ? Math.floor(patientCycle) : 1;
}

export function getClinicalSignals(patient, visit) {
  const previousVisits = Array.isArray(patient && patient.visits) ? patient.visits.filter((item) => item && item.id !== (visit && visit.id)) : [];
  const allVisits = previousVisits.concat(visit || []);
  const currentSymptoms = Array.isArray(visit && visit.symptoms) ? visit.symptoms : [];
  const currentCardiacSymptoms = currentSymptoms.filter((symptom) => CARDIAC_SYMPTOMS.includes(symptom));
  const restratification = (patient && patient.restratification) || {};
  const baselineLvef = numericValue(patient && patient.baselineLVEF);
  const lvefValues = allVisits.map((item) => numericValue(item && item.inv && item.inv.lvef && item.inv.lvef.result)).filter((value) => value !== null);
  const lowestLvef = lvefValues.length ? Math.min.apply(null, lvefValues) : null;

  return {
    elevatedTroponin: allVisits.some((item) => isAbnormal(item, "troponin", ["elev", "high", "positive", "raised"])) || Boolean(restratification.troponinRise),
    elevatedNtprobnp: allVisits.some((item) => isAbnormal(item, "ntprobnp", ["elev", "high", "raised"])),
    glsDrop: Number(restratification.glsFall) > 15 || allVisits.some((item) => isAbnormal(item, "gls", ["drop", "reduc", "15%"])),
    lvefDecline: Boolean(
      restratification.currentLVEF && baselineLvef !== null && baselineLvef - Number(restratification.currentLVEF) >= 10 && Number(restratification.currentLVEF) < 50
    ) || Boolean(lowestLvef !== null && baselineLvef !== null && baselineLvef - lowestLvef >= 10 && lowestLvef < 50),
    qtProlongation: allVisits.some((item) => {
      const ecg = item && item.inv && item.inv.ecg;
      const ecgText = [ecg && ecg.result, ecg && ecg.interp, ecg && ecg.comment].join(" ");
      const qtc = ecgText.match(/qtc?\D{0,8}(\d{3})/i);
      return containsAny(ecgText, ["prolonged qt", "qt prolong", "qtc >= 500", "qtc≥500"]) || Boolean(qtc && Number(qtc[1]) >= 500);
    }),
    currentCardiacSymptoms,
    abnormalEcho: allVisits.some((item) => isAbnormal(item, "echo", ["abnormal", "reduced", "dysfunction"])) || Boolean(lowestLvef !== null && lowestLvef < 50),
    clinicalDeterioration: Boolean(patient && ["Worsening", "Critical"].includes(patient.clinicalStatus)),
  };
}

export function getNextFollowUpPlan(patient, visit) {
  const therapy = Array.isArray(patient && patient.therapy) ? patient.therapy[0] : patient && patient.therapy;
  const risk = (patient && patient.risk && patient.risk.category) || "Low";
  const cycle = getVisitCycle(patient, visit);
  const phase = phaseOf(visit);
  const signals = getClinicalSignals(patient, visit);
  let days = { Low: 42, Moderate: 28, High: 21, "Very High": 14 }[risk] || 28;
  let reason = risk.toLowerCase() + "-risk routine surveillance";

  if (phase === "end") {
    days = 90;
    reason = "three-month post-treatment surveillance";
  } else if (phase === "threeMonth") {
    days = 270;
    reason = "twelve-month post-treatment surveillance";
  } else if (phase === "twelveMonth") {
    days = 365;
    reason = "annual cardiovascular follow-up";
  } else if (therapy === "ici" && cycle <= 3) {
    days = 7;
    reason = "early immune checkpoint inhibitor surveillance";
  } else if (therapy === "proteasome") {
    days = Math.min(days, 14);
    reason = "proteasome inhibitor cycle surveillance";
  } else if (therapy === "vegf" || therapy === "her2" || therapy === "fluoropyrimidine") {
    days = Math.min(days, 21);
    reason = "therapy-specific surveillance";
  }

  if (signals.elevatedTroponin || signals.qtProlongation) {
    days = Math.min(days, 2);
    reason = "urgent biomarker or QT follow-up";
  } else if (signals.currentCardiacSymptoms.length > 0) {
    days = Math.min(days, 1);
    reason = "urgent symptomatic review";
  } else if (signals.glsDrop || signals.lvefDecline) {
    days = Math.min(days, 14);
    reason = "abnormal cardiac imaging follow-up";
  }

  return { days, date: addDays(visitDate(visit), days), reason };
}

export function getDynamicSurveillanceTasks(patient, visit) {
  const therapy = Array.isArray(patient && patient.therapy) ? patient.therapy[0] : patient && patient.therapy;
  const risk = (patient && patient.risk && patient.risk.category) || "Low";
  const cycle = getVisitCycle(patient, visit);
  const phase = phaseOf(visit);
  const signals = getClinicalSignals(patient, visit);
  const tasks = new Map();

  addUniversalTasks(tasks);
  if (phase === "baseline") addBaselineTasks(tasks, therapy);
  else if (phase === "end") addEndOfTreatmentTasks(tasks, therapy);
  else if (phase === "threeMonth" || phase === "twelveMonth") addPostTreatmentTasks(tasks, therapy, phase);
  else addTreatmentTasks(tasks, therapy, risk, cycle, patient);

  if (phase !== "baseline" && (signals.currentCardiacSymptoms.length || signals.elevatedTroponin || signals.elevatedNtprobnp || signals.abnormalEcho || signals.clinicalDeterioration)) {
    addSurveillanceTask(tasks, "cv-exam", "Cardiovascular examination", "Required because of symptoms, abnormal findings, or clinical deterioration.");
  }

  const qtChemotherapy = therapy === "rafmek" || (therapy === "bcrabl" && text(patient && patient.regimen).includes("nilotinib"));
  if (phase !== "baseline" && (qtChemotherapy || signals.qtProlongation || signals.currentCardiacSymptoms.length || hasResult(visit, "electrolytes"))) {
    addSurveillanceTask(tasks, "ecg", "12-lead ECG", "Indicated for QT-risk therapy, symptoms, electrolyte disturbance, or previous QT prolongation.");
  }

  if ((therapy === "anthracycline" || therapy === "ici" || risk === "High" || risk === "Very High") && signals.elevatedTroponin) {
    addSurveillanceTask(tasks, "troponin", "Troponin", "Trend because of therapy or high baseline risk.");
  }
  if ((therapy === "anthracycline" || risk === "High" || risk === "Very High") && signals.elevatedNtprobnp) {
    addSurveillanceTask(tasks, "ntprobnp", "NT-proBNP", "Trend because of heart-failure risk or high baseline risk.");
  }

  addDynamicOverrideTasks(tasks, signals);

  const nextFollowUp = getNextFollowUpPlan(patient, visit);
  addRoutineTask(tasks, "next-follow-up", "Schedule next surveillance visit", "Recommended next surveillance date: " + nextFollowUp.date + " in " + nextFollowUp.days + " days based on " + nextFollowUp.reason + ".");

  return Array.from(tasks.values()).map((task) => ({
    ...task,
    completed: taskIsDocumented(task, visit),
  }));
}

export function isTaskComplete(task, visit) {
  const completion = visit && visit.taskCompletion && visit.taskCompletion[task.id];
  if (completion === true) return true;
  if (completion === false) return false;
  return Boolean(task.completed || taskIsDocumented(task, visit));
}
