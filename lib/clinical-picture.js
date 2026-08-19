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
import { interpretNatriuretic, interpretTroponin } from "@/lib/cardiac-measurements";
import { assessCompleteness } from "@/lib/completeness";
import { assessCtrCvt, describeTwoAxis, isUnexpectedDeterioration } from "@/lib/ctrcvt";
import { assessFitness } from "@/lib/fitness";
import { assessBaselineRisk, assessRisk, therapyList } from "@/lib/hfa-icos";
import { overrideHistory, resolveValue } from "@/lib/overrides";
import { assessRedFlags } from "@/lib/red-flags";
import { assessPathways } from "@/lib/therapy-pathways";
import { buildAllSeries, exposureSeries, significantChanges, treatmentTimeline, uncomparableSeries } from "@/lib/trends";
import { interpretSinceLastVisit, mergeIntervalSymptoms, resolveVisitType } from "@/lib/visit-types";
import { activePhase, phasePosition, phaseTransitions } from "@/lib/treatment-course";
import { GRADE_MODERATE, isWorse } from "@/lib/ctrcd";
import { num } from "@/lib/vitals";

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

  /* ------------------------------------------------------------------------
     Baseline biomarkers are interpreted BEFORE the risk assessment, because
     "elevated baseline troponin" is a proforma factor and has to be decided
     against the patient's own assay rather than a fixed number.
     ---------------------------------------------------------------------- */
  const baselineTroponin = interpretTroponin({
    value: patient?.baselineTroponin,
    assayId: patient?.troponinAssay,
    sex: patient?.gender,
    localURL: patient?.troponinURL,
  });
  const baselineNatriuretic = interpretNatriuretic({ value: patient?.baselineNtProBnp, age: patient?.age });
  const baselineContext = {
    baselineTroponinElevated: Boolean(baselineTroponin.recorded && baselineTroponin.aboveURL),
    baselineNatrioureticElevated: Boolean(baselineNatriuretic.recorded && baselineNatriuretic.aboveThreshold),
  };

  /* Baseline HFA-ICOS, recomputed so factors recorded in the history count. */
  const riskAssessment = assessRisk(patient, baselineContext);
  const baselineRisk = assessBaselineRisk(patient, baselineContext);
  const ledger = anthracyclineLedger(patient);

  /* ------------------------------------------------------------------------
     The second axis: what has actually happened, graded on its own scale and
     never written back into the baseline category.
     ---------------------------------------------------------------------- */
  const intervalHistory = interpretSinceLastVisit(encounter);
  const allSymptoms = mergeIntervalSymptoms(encounter);

  const ctrCvt = assessCtrCvt({
    patient,
    encounter,
    troponin: signals.troponin,
    natriuretic: signals.natriuretic,
    ecg: signals.ecg,
    currentLVEF: num(encounter?.inv?.lvef?.result) ?? num(patient?.restratification?.currentLVEF),
    glsRelativeFall: signals.glsFall,
    symptoms: allSymptoms,
  });

  const redFlags = assessRedFlags({
    patient,
    encounter,
    ctrCvt,
    troponin: signals.troponin,
    ecg: signals.ecg,
    symptoms: allSymptoms,
  });

  const completeness = assessCompleteness(patient);
  const pathways = assessPathways(patient);
  const series = buildAllSeries(patient, encounter);
  const visitType = resolveVisitType(encounter);

  /* Clinician overrides sit on top; the algorithmic values are never mutated. */
  const riskDisplay = resolveValue({
    overrides: patient?.overrides,
    target: "risk",
    algorithmicValue: baselineRisk.applicable ? baselineRisk.category : null,
  });

  /* ------------------------------------------------------------------------
     MANAGEMENT LEVEL — not a risk category.

     This value decides how intensively the patient is monitored right now, and
     it legitimately combines both axes: a low-risk patient with moderate CTRCD
     needs intensive surveillance, and so does a very-high-risk patient with
     none.

     What it must not do is masquerade as the baseline HFA-ICOS category, which
     is what the previous implementation did — it overwrote `currentRisk` with
     "Very High" on a troponin rise, using the same four words as the baseline
     assessment, so the record lost the ability to say "this patient was low
     risk and deteriorated anyway".

     It is therefore named separately, carries the reason it was raised, and the
     baseline category it started from is preserved alongside it.
     ---------------------------------------------------------------------- */
  const restrat = patient?.restratification || {};
  const ctrcd = signals.ctrcd;
  const baselineCategory = baselineRisk.applicable ? baselineRisk.category : "Low";
  let currentRisk = riskDisplay.overridden ? riskDisplay.value : baselineCategory;
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
  } else if (intervalHistory.requiresReview && currentRisk === "Low") {
    // Something happened between visits that nothing measured today would show.
    currentRisk = "Moderate";
    riskEscalation = intervalHistory.escalating[0]?.label
      ? `Reported since the last visit: ${intervalHistory.escalating.map((item) => item.label.toLowerCase()).join(", ")}`
      : null;
  }

  /* The verdict the encounter exists to produce.
     Never mutated by an override — see lib/overrides.js. The Action Bar shows
     the algorithmic verdict alongside the clinician's decision when the two
     differ, rather than replacing one with the other. */
  const algorithmicFitness = assessFitness({ patient, encounter, signals, vitals, outstanding, ledger });
  const fitnessOverride = resolveValue({
    overrides: patient?.overrides,
    target: "fitness",
    algorithmicValue: algorithmicFitness.verdict,
  });
  const fitness = { ...algorithmicFitness, ...fitnessOverride, algorithmicVerdict: algorithmicFitness.verdict };

  return {
    patient,
    encounter,
    engineVisit,
    signals,
    ctrcd,
    fitness,
    ledger,
    riskAssessment,

    /* ------------------------------------------------ the two risk axes */
    /** Axis one: baseline risk, fixed at registration. Never escalated. */
    baselineRisk,
    /** Axis two: what has happened since. Graded on its own scale. */
    ctrCvt,
    /** The sentence that states both, so nothing renders one without the other. */
    twoAxisStatement: describeTwoAxis(baselineRisk, ctrCvt),
    /** A well-stratified patient who deteriorated anyway is worth naming. */
    unexpectedDeterioration: isUnexpectedDeterioration(baselineRisk, ctrCvt),

    redFlags,
    completeness,
    pathways,
    series,
    exposure: exposureSeries(ledger),
    treatmentTimeline: treatmentTimeline(patient, encounter),
    significantChanges: significantChanges(series),
    uncomparableSeries: uncomparableSeries(series),
    intervalHistory,
    allSymptoms,
    visitType,
    baselineTroponin,
    baselineNatriuretic,
    riskDisplay,
    overrides: overrideHistory(patient?.overrides),
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
    /**
     * How intensively to monitor right now. NOT the baseline HFA-ICOS category
     * — read `baselineRisk.category` for that, and `ctrCvt.overall` for current
     * toxicity. Retained under this name because the surveillance engine and
     * the workflow sections consume it.
     */
    currentRisk,
    managementLevel: currentRisk,
    baselineCategory: baselineRisk.applicable ? baselineRisk.category : null,
    riskEscalation,
    /** True when the management level has been raised above the baseline. */
    escalatedAboveBaseline: Boolean(riskEscalation),
    therapies: therapyList(patient?.therapy),
    isICI: hasTherapy(patient?.therapy, "ici"),

    /* -------------------------------------------- structured treatment course */
    treatmentCourse: patient?.treatmentCourse || null,
    /** The phase the patient is on now, or null for an unstructured regimen. */
    activeTreatmentPhase: activePhase(patient?.treatmentCourse),
    treatmentPhasePosition: phasePosition(patient?.treatmentCourse),
    /** Every phase change this course has actually gone through, in order. */
    treatmentPhaseTransitions: phaseTransitions(patient?.treatmentCourse),
  };
}
