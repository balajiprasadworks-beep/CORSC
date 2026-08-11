/* =========================================================================
   Clinical picture aggregator.

   One pass over the patient and the active encounter that produces everything
   the workflow needs: surveillance tasks, alerts, investigation status, trends,
   medication analysis and documentation gaps. Sections consume slices of this
   rather than each recomputing their own view of the case.
   ========================================================================= */

import {
  computeAlerts,
  EXAM_SYSTEMS,
  HISTORY_GROUPS,
  RED_FLAG_SYMPTOMS,
  hasTherapy,
} from "@/lib/clinical-data";
import {
  getClinicalSignals,
  getDynamicSurveillanceTasks,
  getNextFollowUpPlan,
  isTaskComplete,
} from "@/lib/surveillance-engine";
import { toEnginePatient, toEngineVisit, encounterVitals, isFilled } from "@/lib/patient-model";
import { buildInvestigationTimeline, buildTrends, investigationLabel, outstandingInvestigations, trendFlags } from "@/lib/investigation-timeline";
import { cardioprotectiveRecommendations, medicationWarnings } from "@/lib/medication-engine";
import { buildPatientTimeline } from "@/lib/timeline";
import { anthracyclineLedger } from "@/lib/anthracycline";
import { assessFitness } from "@/lib/fitness";
import { assessRisk, therapyList } from "@/lib/hfa-icos";
import { GRADE_MODERATE, isWorse } from "@/lib/ctrcd";

/** Documentation the clinician has not yet completed for this encounter. */
export function missingDocumentation(patient, encounter, vitals) {
  const gaps = [];
  const push = (section, label) => gaps.push({ section, label });

  if (!isFilled(patient?.patientId)) push("registration", "Patient ID not recorded");
  if (!isFilled(patient?.plannedCycles)) push("registration", "Planned number of cycles not recorded");
  if (!isFilled(patient?.baselineLVEF)) push("registration", "Baseline LVEF not recorded");

  if (!isFilled(encounter?.firstReview?.tolerance)) push("first-review", "Treatment tolerance not documented");

  const historyTouched = HISTORY_GROUPS.filter((group) => {
    const entry = patient?.history?.[group.id];
    return isFilled(entry?.checks) || isFilled(entry?.fields);
  });
  if (historyTouched.length < 3) push("history", "History sections largely incomplete");

  if (!isFilled(encounter?.vitals?.sbp) || !isFilled(encounter?.vitals?.dbp)) push("vitals", "Blood pressure not recorded");
  if (!isFilled(encounter?.vitals?.weight)) push("vitals", "Weight not recorded");
  if (!isFilled(encounter?.vitals?.height)) push("vitals", "Height not recorded, so BMI and BSA cannot be derived");

  const unexamined = EXAM_SYSTEMS.filter((system) => !encounter?.systems?.[system.id]?.status);
  if (unexamined.length) push("examination", `${unexamined.map((s) => s.label).join(", ")} not examined`);

  if (!isFilled(patient?.medications) && !isFilled(encounter?.medReview)) push("medication", "No medication review recorded");
  if (!isFilled(encounter?.plan)) push("follow-up", "Management plan not written");
  if (!isFilled(encounter?.nextFollowUpDate)) push("follow-up", "Next follow-up date not set");

  if (vitals && vitals.weightLossPercent === null && isFilled(encounter?.vitals?.weight)) {
    push("vitals", "Reference weight not set, so weight change cannot be calculated");
  }

  return gaps;
}

/** Abnormal findings drawn from this encounter, in clinician-readable form. */
export function abnormalFindings(patient, encounter, vitals, trends) {
  const findings = [];

  (encounter?.symptoms || []).forEach((symptom) => {
    const detail = encounter?.symptomDetail?.[symptom] || {};
    const parts = [detail.severity, detail.duration].filter(Boolean).join(", ");
    findings.push({
      level: RED_FLAG_SYMPTOMS.includes(symptom) ? "danger" : "warning",
      text: `${symptom}${parts ? ` (${parts})` : ""}`,
      source: "Symptoms",
    });
  });

  if (vitals?.bp && vitals.bp.tone !== "ok") {
    findings.push({ level: vitals.bp.tone === "danger" ? "danger" : "warning", text: `${vitals.bp.label} at ${encounter?.vitals?.sbp}/${encounter?.vitals?.dbp} mmHg`, source: "Vitals" });
  }
  if (vitals?.spo2 && vitals.spo2.tone !== "ok") {
    findings.push({ level: vitals.spo2.tone === "danger" ? "danger" : "warning", text: `${vitals.spo2.label} at ${encounter?.vitals?.spo2}%`, source: "Vitals" });
  }
  if (vitals?.pulse && vitals.pulse.tone !== "ok") {
    findings.push({ level: "warning", text: `${vitals.pulse.label} at ${encounter?.vitals?.pulse} bpm`, source: "Vitals" });
  }
  if (vitals?.weightLoss && vitals.weightLoss.tone !== "ok") {
    findings.push({ level: vitals.weightLoss.tone === "danger" ? "danger" : "warning", text: vitals.weightLoss.detail, source: "Vitals" });
  }
  if (vitals?.bmiCategory && vitals.bmiCategory.tone === "danger") {
    findings.push({ level: "warning", text: `BMI ${vitals.bmi} — ${vitals.bmiCategory.label}`, source: "Vitals" });
  }

  EXAM_SYSTEMS.forEach((system) => {
    const entry = encounter?.systems?.[system.id];
    if (entry?.status !== "findings") return;
    const detail = system.components
      .map((component) => {
        const value = entry.components?.[component.id];
        return value && !value.normal && value.text ? `${component.label.toLowerCase()} ${value.text}` : null;
      })
      .filter(Boolean)
      .join("; ");
    if (detail) findings.push({ level: "warning", text: `${system.full}: ${detail}`, source: "Examination" });
  });

  Object.entries(encounter?.inv || {}).forEach(([id, value]) => {
    if (!value?.interp || value.interp === "Normal") return;
    const label = value.result ? `${value.interp} (${value.result})` : value.interp;
    findings.push({
      level: value.interp === "Elevated" || value.interp === "Reduced" ? "danger" : "warning",
      text: `${investigationLabel(id)}: ${label}`,
      source: "Investigations",
    });
  });

  (trends || []).forEach((series) => {
    if (series.direction === "worse" && series.points.length > 1) {
      findings.push({
        level: "warning",
        text: `${series.label} trending ${series.direction === "worse" ? "adversely" : "favourably"} from ${series.first} to ${series.last}${series.unit ? ` ${series.unit}` : ""}`,
        source: "Trends",
      });
    }
  });

  return findings;
}

/** Everything the workflow needs about the current case, computed once. */
export function buildClinicalPicture(patient, encounter) {
  const enginePatient = toEnginePatient(patient);
  const engineVisit = toEngineVisit(encounter);

  const signals = getClinicalSignals(enginePatient, engineVisit);
  const tasks = getDynamicSurveillanceTasks(enginePatient, engineVisit);
  const nextFollowUp = getNextFollowUpPlan(enginePatient, engineVisit);
  const alerts = computeAlerts(patient, engineVisit, signals);

  const vitals = encounterVitals(patient, encounter);
  const investigationTimeline = buildInvestigationTimeline(patient, encounter);
  const outstanding = outstandingInvestigations(investigationTimeline);
  const trends = buildTrends(patient, encounter);
  const flags = trendFlags(trends, patient);

  const recommendations = cardioprotectiveRecommendations(patient, encounter, signals);
  const warnings = medicationWarnings(patient, encounter, signals);

  const events = buildPatientTimeline(patient, encounter);
  const gaps = missingDocumentation(patient, encounter, vitals);
  const findings = abnormalFindings(patient, encounter, vitals, trends);

  const tasksDone = tasks.filter((task) => isTaskComplete(task, engineVisit)).length;

  /* Baseline HFA-ICOS, recomputed so factors recorded in the history count. */
  const riskAssessment = assessRisk(patient);
  const ledger = anthracyclineLedger(patient);

  /* Current risk, escalated by live findings above the baseline category. */
  const restrat = patient?.restratification || {};
  const ctrcd = signals.ctrcd;
  let currentRisk = riskAssessment.category;
  let riskEscalation = null;

  if (restrat.myocarditisConfirmed || restrat.severeHF || isWorse(ctrcd.grade, GRADE_MODERATE)) {
    currentRisk = "Very High";
    riskEscalation = restrat.myocarditisConfirmed
      ? "Confirmed high-grade myocarditis"
      : restrat.severeHF
        ? "Symptomatic severe heart failure"
        : ctrcd.label;
  } else if (ctrcd.grade === GRADE_MODERATE || signals.suspectedICIMyocarditis) {
    currentRisk = "Very High";
    riskEscalation = signals.suspectedICIMyocarditis
      ? "Troponin rise on a checkpoint inhibitor — myocarditis not excluded"
      : ctrcd.label;
  } else if (signals.elevatedTroponin || signals.glsDrop || ctrcd.present || ctrcd.unresolved || restrat.troponinRise || restrat.symptomatic) {
    if (currentRisk !== "Very High") {
      currentRisk = "High";
      riskEscalation = ctrcd.present
        ? ctrcd.label
        : ctrcd.unresolved
          ? "Cardiac dysfunction could not be graded from the available measurements"
          : signals.elevatedTroponin || restrat.troponinRise
            ? "Troponin rise from baseline"
            : signals.glsDrop
              ? "GLS relative fall greater than 15%"
              : "Symptomatic on treatment";
    }
  }

  /* The verdict the encounter exists to produce. */
  const fitness = assessFitness({ patient, encounter, signals, vitals, outstanding, ledger });

  return {
    patient,
    encounter,
    engineVisit,
    signals,
    ctrcd,
    fitness,
    ledger,
    riskAssessment,
    tasks,
    tasksDone,
    nextFollowUp,
    alerts,
    vitals,
    investigationTimeline,
    outstanding,
    trends,
    trendFlags: flags,
    recommendations,
    warnings,
    events,
    gaps,
    findings,
    currentRisk,
    riskEscalation,
    therapies: therapyList(patient?.therapy),
    isICI: hasTherapy(patient?.therapy, "ici"),
  };
}
