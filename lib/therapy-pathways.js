/* =========================================================================
   Therapy-specific cardiovascular pathways.

   Cardiotoxicity is not one disease. An anthracycline damages myocytes
   cumulatively and irreversibly; a checkpoint inhibitor triggers an autoimmune
   myocarditis that can kill in days with a normal ejection fraction; a
   fluoropyrimidine causes coronary vasospasm during the infusion; a VEGF
   inhibitor causes hypertension. Forcing all of them through one
   "LVEF and troponin" model produces surveillance that is simultaneously
   excessive for some patients and blind for others.

   This module names the pathway that applies to each therapy and states what
   that pathway is actually watching for. Two things follow from it:

   1. Therapies HFA-ICOS covers get a baseline HFA-ICOS category (computed in
      lib/hfa-icos.js) plus this pathway's toxicity profile.

   2. Therapies HFA-ICOS does not cover — checkpoint inhibitors and
      fluoropyrimidines — get this pathway ONLY, under its own name. They never
      display an "HFA-ICOS score", because no such score is published for them
      and presenting one would be a fabricated citation.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";
import { hasProforma, therapyList } from "@/lib/hfa-icos";
import { num } from "@/lib/vitals";

/**
 * The dominant toxicity each therapy class is watched for.
 *
 * `primaryToxicity` decides what the surveillance engine schedules and what the
 * red-flag engine listens for. It is deliberately not a free-text note: the
 * engines branch on it.
 */
export const PATHWAYS = {
  anthracycline: {
    id: "anthracycline",
    label: "Anthracycline cardiomyopathy pathway",
    baselineModel: "hfa-icos",
    primaryToxicity: "cardiomyopathy",
    mechanism:
      "Topoisomerase-IIβ-mediated myocyte injury that accumulates with total dose and is largely irreversible once established.",
    watchFor: ["Left ventricular systolic dysfunction", "Heart failure", "Cumulative dose-dependent late cardiomyopathy"],
    keyMeasures: ["LVEF", "GLS", "Troponin", "Natriuretic peptide", "Cumulative doxorubicin-equivalent dose"],
    doseDependent: true,
    sourceId: "esc-cardio-oncology-2022",
    note: "Cumulative exposure is the dominant modifiable variable, so the dose ledger drives this pathway alongside the baseline category.",
  },

  her2: {
    id: "her2",
    label: "HER2-targeted therapy pathway",
    baselineModel: "hfa-icos",
    primaryToxicity: "cardiomyopathy",
    mechanism:
      "ERBB2 blockade removes a cardiomyocyte survival signal. Dysfunction is typically non-cumulative and frequently reverses on interruption.",
    watchFor: ["Left ventricular systolic dysfunction", "Heart failure"],
    keyMeasures: ["LVEF", "GLS", "Troponin"],
    doseDependent: false,
    sourceId: "esc-cardio-oncology-2022",
    note: "Because dysfunction usually reverses, the pathway is built around interruption and re-challenge rather than permanent discontinuation.",
  },

  vegf: {
    id: "vegf",
    label: "VEGF-pathway inhibitor vascular pathway",
    baselineModel: "hfa-icos",
    primaryToxicity: "hypertension",
    mechanism:
      "VEGF blockade impairs nitric-oxide-mediated vasodilatation and causes capillary rarefaction, producing hypertension as an on-target effect, with arterial and venous thromboembolism and less commonly LV dysfunction.",
    watchFor: ["Hypertension", "Arterial and venous thromboembolism", "Left ventricular dysfunction", "QT prolongation"],
    keyMeasures: ["Blood pressure", "LVEF", "QTc", "Proteinuria"],
    doseDependent: false,
    sourceId: "esc-cardio-oncology-2022",
    note: "Blood pressure, not ejection fraction, is the measurement that changes management most often on this pathway.",
  },

  bcrabl: {
    id: "bcrabl",
    label: "BCR-ABL inhibitor arterial pathway",
    baselineModel: "hfa-icos",
    primaryToxicity: "arterial-occlusive",
    mechanism:
      "Off-target vascular kinase inhibition accelerates atherosclerosis and promotes vasospasm; nilotinib additionally prolongs the QT interval and dasatinib is associated with pulmonary hypertension.",
    watchFor: ["Myocardial infarction", "Stroke", "Peripheral arterial disease", "QT prolongation", "Pulmonary hypertension"],
    keyMeasures: ["Blood pressure", "Lipids", "HbA1c", "QTc", "Peripheral pulses"],
    doseDependent: false,
    sourceId: "esc-cardio-oncology-2022",
    note: "Risk accrues with duration of exposure and persists after stopping, so vascular risk-factor control is the main intervention.",
  },

  proteasome: {
    id: "proteasome",
    label: "Proteasome inhibitor heart-failure pathway",
    baselineModel: "hfa-icos",
    primaryToxicity: "heart-failure",
    mechanism:
      "Proteasome inhibition impairs cardiomyocyte protein quality control and mitochondrial function. Carfilzomib is substantially more cardiotoxic than bortezomib and events can occur within hours of infusion.",
    watchFor: ["Heart failure", "Hypertension", "Arrhythmia", "Pulmonary hypertension"],
    keyMeasures: ["Natriuretic peptide", "Blood pressure", "LVEF"],
    doseDependent: false,
    sourceId: "esc-cardio-oncology-2022",
    note: "Onset can be acute and peri-infusional, so symptom review at every cycle matters more here than a fixed imaging interval.",
  },

  rafmek: {
    id: "rafmek",
    label: "RAF/MEK inhibitor pathway",
    baselineModel: "hfa-icos",
    primaryToxicity: "cardiomyopathy",
    mechanism:
      "MEK inhibition reduces cardiomyocyte ERK survival signalling, usually producing asymptomatic and reversible left ventricular dysfunction. Hypertension and QT prolongation also occur.",
    watchFor: ["Asymptomatic LV dysfunction", "Hypertension", "QT prolongation"],
    keyMeasures: ["LVEF", "Blood pressure", "QTc"],
    doseDependent: false,
    sourceId: "esc-cardio-oncology-2022",
    note: "Dysfunction is usually subclinical, so scheduled imaging must not be skipped because the patient feels well.",
  },

  /* ------------- therapies with no published HFA-ICOS baseline proforma ---- */

  ici: {
    id: "ici",
    label: "Immune checkpoint inhibitor myocarditis pathway",
    baselineModel: "therapy-specific",
    primaryToxicity: "myocarditis",
    mechanism:
      "Checkpoint blockade releases an autoreactive T-cell response that can target myocardium. Myocarditis is uncommon but carries very high mortality, clusters in the first weeks of treatment, and can be fulminant while the ejection fraction is still normal.",
    watchFor: [
      "Immune-related myocarditis",
      "Concurrent myositis and myasthenia overlap",
      "Pericarditis",
      "Conduction disease and ventricular arrhythmia",
    ],
    keyMeasures: ["Troponin", "ECG", "Natriuretic peptide", "LVEF"],
    doseDependent: false,
    sourceId: "esc-cardio-oncology-2022",
    note:
      "Troponin, not imaging, is the screening test on this pathway. A normal ejection fraction does not exclude myocarditis and must never be used to reassure.",
    /** Cycles during which the early-surveillance rule applies. */
    earlySurveillanceDoses: 4,
    baselineRiskNote:
      "HFA-ICOS publishes no baseline proforma for checkpoint inhibitors. CORSC therefore reports a checkpoint-inhibitor-specific baseline profile rather than a number labelled HFA-ICOS.",
  },

  fluoropyrimidine: {
    id: "fluoropyrimidine",
    label: "Fluoropyrimidine coronary vasospasm pathway",
    baselineModel: "therapy-specific",
    primaryToxicity: "ischaemia",
    mechanism:
      "5-Fluorouracil and capecitabine cause coronary vasospasm and endothelial injury. Events occur during or shortly after exposure, often in the first cycle, and can recur on re-challenge.",
    watchFor: ["Coronary vasospasm", "Acute coronary syndrome", "Arrhythmia", "Rarely myocarditis or Takotsubo syndrome"],
    keyMeasures: ["Symptom screen for chest pain", "ECG during pain", "Troponin during pain"],
    doseDependent: false,
    sourceId: "esc-cardio-oncology-2022",
    note:
      "This is an ischaemic pathway, not a cardiomyopathy pathway. Scheduled ejection fraction surveillance is not the answer; a chest-pain screen at every infusion is.",
    baselineRiskNote:
      "HFA-ICOS publishes no baseline proforma for fluoropyrimidines. CORSC reports pre-existing coronary risk instead, which is what determines vasospasm risk on this therapy.",
  },
};

export function pathwayFor(therapyId) {
  return PATHWAYS[therapyId] || null;
}

export function pathwaysFor(therapy) {
  return therapyList(therapy).map(pathwayFor).filter(Boolean);
}

/** True when this therapy is watched for something other than pump failure. */
export function isNonCardiomyopathyPathway(therapyId) {
  const pathway = pathwayFor(therapyId);
  return Boolean(pathway) && pathway.primaryToxicity !== "cardiomyopathy";
}

/* ----------------------------------------- baseline profile without HFA-ICOS */

/**
 * Baseline cardiovascular profile for a therapy that HFA-ICOS does not cover.
 *
 * This is NOT a score and is deliberately not expressed as one. It reports the
 * findings that raise concern on that specific pathway, so the clinician has
 * something structured to act on without CORSC pretending to a validated
 * category it does not have.
 */
export function therapySpecificBaseline(patient, therapyId) {
  const pathway = pathwayFor(therapyId);
  if (!pathway || pathway.baselineModel !== "therapy-specific") return null;

  const cv = patient?.history?.cardiovascular?.checks || {};
  const rf = patient?.history?.riskFactors?.checks || {};
  const priorFields = patient?.history?.priorTreatment?.fields || {};
  const concerns = [];

  const add = (id, label, detail) => concerns.push({ id, label, detail });

  if (therapyId === "ici") {
    if (patient?.contraindications?.absolute?.myocarditis) {
      add("prior-myocarditis", "Previous immune-related myocarditis", "Re-challenge after immune myocarditis is a specialist decision and is generally avoided.");
    }
    if (patient?.contraindications?.relative?.autoimmuneCardiac) {
      add("autoimmune-cardiac", "Pre-existing autoimmune disease with cardiac involvement", "Raises the risk of immune-related myocardial injury.");
    }
    if (patient?.contraindications?.relative?.priorIRAE) {
      add("prior-irae", "Previous high-grade immune-related adverse event", "Previous severe immune toxicity predicts further immune toxicity.");
    }
    if (cv.hf || cv.cardiomyopathy) {
      add("baseline-hf", "Established heart failure or cardiomyopathy", "Reduces the reserve available to survive an episode of myocarditis.");
    }
    if (cv.af) {
      add("baseline-arrhythmia", "Pre-existing arrhythmia", "Makes a new arrhythmia harder to attribute, so a baseline ECG is essential.");
    }
    const troponinRecorded = num(patient?.baselineTroponin) !== null;
    if (!troponinRecorded) {
      add(
        "no-baseline-troponin",
        "No baseline troponin recorded",
        "Screening on this pathway depends on detecting a RISE. Without a pre-treatment value a later troponin cannot be interpreted, which is the single most important gap before starting a checkpoint inhibitor.",
      );
    }
  }

  if (therapyId === "fluoropyrimidine") {
    if (cv.cad || cv.revasc || cv.angina) {
      add("coronary-disease", "Established coronary artery disease", "The strongest predictor of fluoropyrimidine-associated ischaemic events.");
    }
    if (Boolean(String(priorFields.priorToxicity || "").toLowerCase().includes("chest pain"))) {
      add("prior-chest-pain", "Previous chest pain on fluoropyrimidine exposure", "Recurrence on re-challenge is common; discuss the re-challenge strategy before the next infusion.");
    }
    if (cv.pad || cv.stroke) {
      add("vascular-disease", "Established arterial vascular disease", "Indicates diffuse endothelial disease and raises vasospasm risk.");
    }
    if (rf.htn || rf.dyslipidaemia || rf.dm) {
      add("coronary-risk-factors", "Coronary risk factors present", "Hypertension, dyslipidaemia or diabetes recorded in the risk factor history.");
    }
  }

  return {
    therapyId,
    label: `${pathway.label} — baseline profile`,
    isScore: false,
    concerns,
    /** Plain statement of what this is and is not, rendered wherever it appears. */
    disclaimer: pathway.baselineRiskNote,
    summary: concerns.length
      ? `${concerns.length} baseline concern${concerns.length === 1 ? "" : "s"} identified for this pathway.`
      : "No pathway-specific baseline concern identified from the data recorded.",
    provenance: provenance(pathway.sourceId, {
      locator: pathway.label,
      note: pathway.baselineRiskNote,
    }),
  };
}

/**
 * Every pathway that applies to this patient, with the therapy-specific
 * baseline profile attached where HFA-ICOS does not cover the therapy.
 */
export function assessPathways(patient) {
  const therapies = therapyList(patient?.therapy);
  return therapies.map((therapyId) => {
    const pathway = pathwayFor(therapyId);
    return {
      therapyId,
      pathway,
      usesHfaIcos: hasProforma(therapyId),
      baseline: pathway ? therapySpecificBaseline(patient, therapyId) : null,
      provenance: pathway ? provenance(pathway.sourceId, { locator: pathway.label, note: pathway.note }) : null,
    };
  });
}
