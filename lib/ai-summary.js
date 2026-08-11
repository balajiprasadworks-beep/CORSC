/* =========================================================================
   Living clinical summary.

   Reads the computed clinical picture and produces both a structured summary
   (shown continuously alongside the workflow) and a print-ready narrative for
   the final overview. All reasoning is local to the browser — no patient data
   leaves the device.
   ========================================================================= */

import { therapyName, primaryTherapy, therapyNames, RISK_MONITORING_PLAN } from "@/lib/clinical-data";
import { investigationLabel } from "@/lib/investigation-timeline";

function sentenceList(items) {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

/**
 * Structured summary panels. Each key is a list the assistant panel renders,
 * so the clinician sees categories rather than one undifferentiated paragraph.
 */
export function buildStructuredSummary(picture) {
  const { patient, currentRisk, riskEscalation } = picture;

  const keyRisks = [];
  keyRisks.push(`Baseline HFA-ICOS risk is ${patient?.risk?.category || "not calculated"}${patient?.risk?.reason ? ` (${patient.risk.reason.toLowerCase()})` : ""}.`);
  if (riskEscalation) keyRisks.push(`Current risk is escalated to ${currentRisk}: ${riskEscalation}.`);
  const therapy = primaryTherapy(patient?.therapy);
  if (therapy) keyRisks.push(`${therapyName(therapy)} carries the dominant cardiotoxicity signal for this patient.`);
  if (picture.isICI) keyRisks.push("Immune checkpoint myocarditis risk is highest across the first three doses; troponin before each is the primary screen.");

  const redFlags = [
    ...picture.alerts.filter((a) => a.level === "danger").map((a) => `${a.title}. ${a.desc}`),
    ...picture.trendFlags.filter((f) => f.level === "danger").map((f) => f.text),
  ];

  const abnormal = picture.findings
    .filter((f) => f.level === "danger")
    .concat(picture.findings.filter((f) => f.level === "warning"))
    .slice(0, 8)
    .map((f) => `${f.text} (${f.source.toLowerCase()})`);

  const missing = picture.gaps.slice(0, 8).map((gap) => gap.label);

  const nextActions = [];
  picture.tasks
    .filter((task) => task.priority === "urgent")
    .forEach((task) => nextActions.push(`${task.label} — ${task.detail}`));
  picture.outstanding
    .filter((item) => item.status === "missing" || item.status === "overdue")
    .slice(0, 4)
    .forEach((item) => nextActions.push(`${item.label} is ${item.status} from ${item.milestone.toLowerCase()}.`));
  if (picture.nextFollowUp) {
    nextActions.push(`Book the next surveillance visit for ${picture.nextFollowUp.date}, ${picture.nextFollowUp.days} days from this review (${picture.nextFollowUp.reason}).`);
  }

  const surveillance = (RISK_MONITORING_PLAN[currentRisk] || []).slice();
  const outstandingCount = picture.outstanding.filter((i) => i.status !== "due").length;
  if (outstandingCount) surveillance.push(`${outstandingCount} scheduled investigation${outstandingCount === 1 ? " is" : "s are"} outstanding across the treatment journey.`);

  const medication = [];
  picture.recommendations.forEach((rec) => {
    if (rec.onTreatment) medication.push(`${rec.title} already prescribed — continue and titrate.`);
    else medication.push(`${rec.strength === "Indicated" ? "Start" : "Consider"} ${rec.title.toLowerCase()}: ${rec.reasons[0]}.`);
  });
  picture.warnings.filter((w) => w.level === "danger").forEach((w) => medication.push(`${w.title}. ${w.detail}`));

  return {
    keyRisks,
    redFlags,
    abnormal,
    missing,
    nextActions,
    surveillance,
    medication,
    counts: {
      redFlags: redFlags.length,
      abnormal: abnormal.length,
      missing: missing.length,
      actions: nextActions.length,
    },
  };
}

/** Print-ready narrative for the overview and exported report. */
export function buildNarrative(picture) {
  const { patient, encounter, vitals, currentRisk, riskEscalation } = picture;
  const paragraphs = [];

  const demographic = [
    patient?.name || "This patient",
    patient?.age ? `a ${patient.age}-year-old` : null,
    patient?.gender ? patient.gender.toLowerCase() : null,
  ].filter(Boolean);
  const identity = patient?.age
    ? `${demographic[0]}, ${demographic.slice(1).join(" ")},`
    : `${demographic[0]}`;

  paragraphs.push(
    `${identity} carries a diagnosis of ${[patient?.stage, patient?.diagnosis].filter(Boolean).join(" ") || "malignancy"}` +
    `${patient?.regimen ? `, treated with ${patient.regimen}` : ""}` +
    `${patient?.therapy ? ` (${therapyNames(patient.therapy)})` : ""}` +
    `${patient?.plannedCycles ? ` over a planned ${patient.plannedCycles} cycles${patient?.cycleFrequency ? ` ${patient.cycleFrequency.toLowerCase()}` : ""}` : ""}.`
  );

  const cycleText = encounter?.firstReview?.cycle || encounter?.cycle;
  paragraphs.push(
    `This ${encounter?.type || "review"} was documented on ${encounter?.date || "an unrecorded date"}` +
    `${cycleText ? ` at cycle ${cycleText}` : ""}` +
    `${encounter?.firstReview?.tolerance ? `, with treatment described as ${encounter.firstReview.tolerance.toLowerCase()}` : ""}.`
  );

  const vitalBits = [];
  if (encounter?.vitals?.sbp && encounter?.vitals?.dbp) vitalBits.push(`blood pressure ${encounter.vitals.sbp}/${encounter.vitals.dbp} mmHg`);
  if (encounter?.vitals?.pulse) vitalBits.push(`pulse ${encounter.vitals.pulse} bpm`);
  if (vitals?.bmi) vitalBits.push(`BMI ${vitals.bmi}`);
  if (vitals?.bsa) vitalBits.push(`BSA ${vitals.bsa} m²`);
  if (vitals?.weightLossPercent !== null && vitals?.weightLossPercent !== undefined && vitals.weightLossPercent >= 5) {
    vitalBits.push(`weight loss of ${vitals.weightLossPercent}% from reference`);
  }
  if (vitalBits.length) paragraphs.push(`Observations at this visit: ${sentenceList(vitalBits)}.`);

  if (encounter?.symptoms?.length) {
    const detailed = encounter.symptoms.map((symptom) => {
      const detail = encounter.symptomDetail?.[symptom] || {};
      const qualifiers = [detail.severity, detail.duration, detail.trigger].filter(Boolean).join(", ");
      return qualifiers ? `${symptom.toLowerCase()} (${qualifiers})` : symptom.toLowerCase();
    });
    paragraphs.push(`Reported symptoms include ${sentenceList(detailed)}.`);
  } else {
    paragraphs.push("No cardiovascular symptoms were reported at this visit.");
  }

  const abnormalInvestigations = Object.entries(encounter?.inv || {})
    .filter(([, value]) => value?.interp && value.interp !== "Normal")
    .map(([id, value]) => `${investigationLabel(id)} ${value.interp.toLowerCase()}${value.result ? ` at ${value.result}` : ""}`);
  if (abnormalInvestigations.length) {
    paragraphs.push(`Investigations flag ${sentenceList(abnormalInvestigations)}, which require review against baseline values.`);
  } else {
    paragraphs.push("No investigation at this visit is flagged as abnormal.");
  }

  const lvefSeries = picture.trends.find((t) => t.id === "lvef");
  if (lvefSeries && lvefSeries.points.length > 1) {
    paragraphs.push(`Ejection fraction has moved from ${lvefSeries.first}% to ${lvefSeries.last}% across the recorded course${lvefSeries.direction === "worse" ? ", a direction that warrants closer surveillance" : ""}.`);
  } else if (patient?.baselineLVEF) {
    paragraphs.push(`Baseline LVEF is documented at ${patient.baselineLVEF}%, with no serial values yet recorded.`);
  }

  paragraphs.push(
    `The patient is stratified as HFA-ICOS ${patient?.risk?.category || "unclassified"} baseline cardiovascular risk` +
    `${riskEscalation ? `, currently escalated to ${currentRisk} because of ${riskEscalation}` : ""}. ` +
    `${currentRisk === "Low" ? "Routine" : "Close prospective"} monitoring is warranted throughout therapy.`
  );

  const indicated = picture.recommendations.filter((r) => !r.onTreatment && r.strength === "Indicated");
  if (indicated.length) {
    paragraphs.push(`Cardioprotective therapy is indicated but not yet prescribed: ${sentenceList(indicated.map((r) => r.title))}.`);
  }

  if (picture.nextFollowUp) {
    paragraphs.push(`The recommended next surveillance contact is ${picture.nextFollowUp.date}, ${picture.nextFollowUp.days} days from this review, on the basis of ${picture.nextFollowUp.reason}.`);
  }

  return paragraphs.join(" ");
}

export function buildSummary(picture) {
  return {
    structured: buildStructuredSummary(picture),
    narrative: buildNarrative(picture),
    generatedAt: new Date().toISOString(),
  };
}
