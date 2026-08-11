/* =========================================================================
   Cancer therapy–related cardiovascular toxicity (CTR-CVT): current status.

   This is the second of the two risk axes, and it is deliberately a separate
   module from lib/hfa-icos.js.

     BASELINE RISK  (lib/hfa-icos.js)
       How likely was this patient to run into trouble, judged before the first
       dose. Fixed at baseline. A troponin that rises at cycle 4 does not
       retrospectively change how risky the patient was at cycle 0.

     CURRENT CTR-CVT  (this module)
       What has actually happened to the cardiovascular system since therapy
       started, graded now, on its own scale.

   Keeping them apart is what lets the application say the thing clinicians
   actually need to hear: "baseline low risk, now moderate CTRCD" — a sentence
   that is impossible if a single number absorbs both. The previous
   implementation collapsed them: a troponin rise rewrote `currentRisk` to
   "High" or "Very High" using the same four-level vocabulary as the baseline
   category, so a reader could not tell whether "High" meant a risky patient or
   a damaged one.

   CTR-CVT is not one thing either. IC-OS defines it across several domains, and
   a patient can be normal in one and severely affected in another. Each domain
   below is graded independently and carries the evidence that graded it.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";
import { GRADE_MODERATE, GRADE_NONE, GRADE_SEVERE, GRADE_VERY_SEVERE, gradeCTRCD, isWorse } from "@/lib/ctrcd";
import { therapyList } from "@/lib/hfa-icos";
import { pathwayFor } from "@/lib/therapy-pathways";
import { bpGrade, num } from "@/lib/vitals";

/* ---------------------------------------------------------------- severity */

export const SEVERITY = {
  none: { id: "none", rank: 0, label: "Not present", tone: "ok" },
  mild: { id: "mild", rank: 1, label: "Mild", tone: "warning" },
  moderate: { id: "moderate", rank: 2, label: "Moderate", tone: "danger" },
  severe: { id: "severe", rank: 3, label: "Severe", tone: "danger" },
  verySevere: { id: "verySevere", rank: 4, label: "Very severe", tone: "danger" },
  indeterminate: {
    id: "indeterminate",
    rank: 1.5,
    label: "Cannot be graded",
    tone: "warning",
  },
};

export function severityRank(id) {
  return SEVERITY[id]?.rank ?? 0;
}

export function worstSeverity(ids) {
  return (ids || []).reduce((worst, id) => (severityRank(id) > severityRank(worst) ? id : worst), SEVERITY.none.id);
}

/** Maps the CTRCD grade vocabulary onto the shared severity scale. */
const CTRCD_TO_SEVERITY = {
  none: SEVERITY.none.id,
  mild: SEVERITY.mild.id,
  moderate: SEVERITY.moderate.id,
  severe: SEVERITY.severe.id,
  "very-severe": SEVERITY.verySevere.id,
  indeterminate: SEVERITY.indeterminate.id,
};

/* ----------------------------------------------------------------- domains */

export const DOMAINS = {
  cardiacDysfunction: {
    id: "cardiacDysfunction",
    label: "Cardiac dysfunction (CTRCD)",
    sourceId: "esc-cardio-oncology-2022",
    locator: "CTRCD definition and severity grading",
  },
  myocarditis: {
    id: "myocarditis",
    label: "Myocarditis",
    sourceId: "esc-cardio-oncology-2022",
    locator: "Immune checkpoint inhibitor–associated myocarditis",
  },
  vascularIschaemic: {
    id: "vascularIschaemic",
    label: "Vascular and ischaemic toxicity",
    sourceId: "ic-os-2021-definitions",
    locator: "Vascular toxicity definitions",
  },
  hypertension: {
    id: "hypertension",
    label: "Hypertension",
    sourceId: "esc-hypertension-2024",
    locator: "Blood pressure grading",
  },
  arrhythmiaQt: {
    id: "arrhythmiaQt",
    label: "Arrhythmia and QTc",
    sourceId: "esc-cardio-oncology-2022",
    locator: "QTc prolongation and arrhythmia management",
  },
};

function domain(key, severity, { present, findings = [], detail, note } = {}) {
  const definition = DOMAINS[key];
  return {
    id: definition.id,
    label: definition.label,
    severity,
    severityLabel: SEVERITY[severity]?.label || severity,
    tone: SEVERITY[severity]?.tone || "info",
    present: present ?? severity !== SEVERITY.none.id,
    findings,
    detail: detail || null,
    provenance: provenance(definition.sourceId, { locator: definition.locator, note }),
  };
}

/* --------------------------------------------------------------- assessment */

/**
 * Grades the current cardiovascular status.
 *
 * Takes already-interpreted measurements rather than raw values, so that the
 * troponin reference limit, the QTc correction and the GLS baseline comparison
 * are each decided in exactly one place.
 *
 * @param {object} input
 * @param {object} input.patient
 * @param {object} input.encounter
 * @param {object} input.troponin      from interpretTroponin
 * @param {object} input.natriuretic   from interpretNatriuretic
 * @param {object} input.ecg           from interpretECG
 * @param {number|null} input.currentLVEF
 * @param {number|null} input.glsRelativeFall
 * @param {string[]} input.symptoms
 */
export function assessCtrCvt({
  patient,
  encounter,
  troponin = {},
  natriuretic = {},
  ecg = {},
  currentLVEF = null,
  glsRelativeFall = null,
  symptoms = [],
} = {}) {
  const therapies = therapyList(patient?.therapy);
  const restratification = patient?.restratification || {};
  const reported = Array.isArray(symptoms) ? symptoms : [];

  /* --------------------------------------------------- cardiac dysfunction */

  const ctrcd = gradeCTRCD({
    baselineLVEF: patient?.baselineLVEF,
    currentLVEF,
    glsRelativeFall,
    biomarkerRise: Boolean(troponin.newRise || natriuretic.newRise),
    hfStatus: encounter?.hfStatus || (restratification.severeHF ? "severe" : undefined),
  });

  const dysfunction = domain(
    "cardiacDysfunction",
    CTRCD_TO_SEVERITY[ctrcd.grade] ?? SEVERITY.none.id,
    {
      present: ctrcd.present,
      findings: ctrcd.criteria,
      detail: ctrcd.label,
    }
  );

  /* --------------------------------------------------------- myocarditis */

  const onIci = therapies.includes("ici");
  const myocarditisFindings = [];
  let myocarditisSeverity = SEVERITY.none.id;

  if (restratification.myocarditisConfirmed) {
    myocarditisSeverity = SEVERITY.severe.id;
    myocarditisFindings.push("Myocarditis has been confirmed and recorded on this patient.");
  } else if (onIci && troponin.newRise) {
    // Not gated on symptoms or ejection fraction. Screening exists precisely to
    // catch this before either changes, and fulminant immune myocarditis can
    // present with a normal LVEF.
    myocarditisSeverity = SEVERITY.moderate.id;
    myocarditisFindings.push(
      `Troponin has risen on a checkpoint inhibitor (${troponin.label || "rise from baseline"}). Any rise on this therapy requires myocarditis to be excluded, whatever the ejection fraction and whether or not the patient has symptoms.`
    );
  } else if (onIci && !troponin.recorded) {
    myocarditisFindings.push("No troponin recorded at this encounter, so the screening test for this pathway has not been done.");
  }

  const myocarditis = domain("myocarditis", myocarditisSeverity, {
    present: myocarditisSeverity !== SEVERITY.none.id,
    findings: myocarditisFindings,
    note: onIci ? pathwayFor("ici")?.note : "Assessed because myocarditis can complicate therapies other than checkpoint inhibitors.",
  });

  /* ------------------------------------------------ vascular and ischaemic */

  const vascularFindings = [];
  let vascularSeverity = SEVERITY.none.id;
  const chestPain = reported.includes("Chest pain");
  const onFluoropyrimidine = therapies.includes("fluoropyrimidine");
  const onBcrAbl = therapies.includes("bcrabl");

  if (chestPain && onFluoropyrimidine) {
    vascularSeverity = SEVERITY.moderate.id;
    vascularFindings.push(
      "Chest pain during fluoropyrimidine exposure. Coronary vasospasm and acute coronary syndrome must be excluded before the next infusion; do not attribute this to a non-cardiac cause without assessment."
    );
  } else if (chestPain && onBcrAbl) {
    vascularSeverity = SEVERITY.moderate.id;
    vascularFindings.push(
      "Chest pain on a BCR-ABL inhibitor. Evaluate urgently for myocardial infarction, stroke or peripheral arterial ischaemia."
    );
  } else if (chestPain) {
    vascularSeverity = SEVERITY.mild.id;
    vascularFindings.push("Chest pain reported at this encounter.");
  }

  if (troponin.newRise && chestPain) {
    vascularSeverity = worstSeverity([vascularSeverity, SEVERITY.severe.id]);
    vascularFindings.push("Troponin has risen in the presence of chest pain — assess for acute coronary syndrome now.");
  }

  const vascular = domain("vascularIschaemic", vascularSeverity, {
    findings: vascularFindings,
  });

  /* -------------------------------------------------------- hypertension */

  const sbp = num(encounter?.vitals?.sbp);
  const dbp = num(encounter?.vitals?.dbp);
  const bp = bpGrade(sbp, dbp);
  const hypertensionFindings = [];
  let hypertensionSeverity = SEVERITY.none.id;
  const onVegf = therapies.includes("vegf");

  if (bp && (sbp !== null || dbp !== null)) {
    const reading = `${sbp ?? "?"}/${dbp ?? "?"} mmHg`;
    if (bp.short === "Grade 3") {
      hypertensionSeverity = SEVERITY.severe.id;
      hypertensionFindings.push(`${bp.label} at ${reading}. Treat urgently.`);
    } else if (bp.short === "Grade 2") {
      hypertensionSeverity = SEVERITY.moderate.id;
      hypertensionFindings.push(`${bp.label} at ${reading}.`);
    } else if (bp.short === "Grade 1") {
      hypertensionSeverity = SEVERITY.mild.id;
      hypertensionFindings.push(`${bp.label} at ${reading}.`);
    }

    if (onVegf && hypertensionSeverity !== SEVERITY.none.id) {
      hypertensionFindings.push(
        "Hypertension on a VEGF-pathway inhibitor is an on-target effect and is expected. It is treated rather than accepted, because uncontrolled pressure is the usual reason this therapy has to be interrupted."
      );
    }
  } else {
    hypertensionFindings.push("Blood pressure not recorded at this encounter.");
  }

  const hypertension = domain("hypertension", hypertensionSeverity, {
    findings: hypertensionFindings,
    detail: bp?.label || null,
  });

  /* ---------------------------------------------------- arrhythmia and QTc */

  const arrhythmiaFindings = [];
  let arrhythmiaSeverity = SEVERITY.none.id;

  if (ecg.actionable) {
    arrhythmiaSeverity = SEVERITY.moderate.id;
    arrhythmiaFindings.push(...(ecg.reasons || []));
  } else if (ecg.prolonged) {
    arrhythmiaSeverity = SEVERITY.mild.id;
    arrhythmiaFindings.push(...(ecg.reasons || []));
  }

  if (reported.includes("Palpitations")) {
    arrhythmiaSeverity = worstSeverity([arrhythmiaSeverity, SEVERITY.mild.id]);
    arrhythmiaFindings.push("Palpitations reported at this encounter.");
  }
  if (reported.includes("Syncope")) {
    arrhythmiaSeverity = worstSeverity([arrhythmiaSeverity, SEVERITY.moderate.id]);
    arrhythmiaFindings.push("Syncope reported — arrhythmic syncope must be excluded.");
  }
  if (ecg.rhythm && !["Sinus rhythm", ""].includes(ecg.rhythm)) {
    arrhythmiaSeverity = worstSeverity([arrhythmiaSeverity, SEVERITY.mild.id]);
    arrhythmiaFindings.push(`Recorded rhythm: ${ecg.rhythm}.`);
  }

  const arrhythmia = domain("arrhythmiaQt", arrhythmiaSeverity, {
    findings: arrhythmiaFindings,
  });

  /* -------------------------------------------------------------- summary */

  const domains = [dysfunction, myocarditis, vascular, hypertension, arrhythmia];
  const active = domains.filter((item) => item.present);
  const overall = worstSeverity(domains.map((item) => item.severity));

  return {
    /** Every domain, including the ones that are clear — absence is information. */
    domains,
    active,
    byId: Object.fromEntries(domains.map((item) => [item.id, item])),
    ctrcd,
    overall,
    overallLabel: SEVERITY[overall]?.label || overall,
    tone: SEVERITY[overall]?.tone || "ok",
    present: active.length > 0,
    /**
     * True when treatment-emergent toxicity exists. Deliberately distinct from
     * the baseline risk category, and never written back into it.
     */
    treatmentEmergent: active.some((item) => item.id !== DOMAINS.hypertension.id || item.severity !== SEVERITY.mild.id),
    summary: active.length
      ? active.map((item) => `${item.label}: ${item.severityLabel.toLowerCase()}`).join("; ")
      : "No cancer therapy–related cardiovascular toxicity detected at this encounter.",
    provenance: provenance("ic-os-2021-definitions", {
      locator: "CTR-CVT domains and severity grading",
      note: "Baseline risk and current toxicity are graded separately and are never combined into a single number.",
    }),
  };
}

/* ----------------------------------------------------- combined statement */

/**
 * The two-axis statement, as one sentence.
 *
 * This exists so the UI and the printed report say the same thing, and so that
 * neither can accidentally present a toxicity grade as a baseline risk
 * category.
 */
export function describeTwoAxis(baseline, ctrCvt) {
  const baselinePart = baseline?.applicable
    ? `Baseline cardiovascular risk ${String(baseline.category).toLowerCase()}`
    : "No applicable baseline HFA-ICOS category";
  const currentPart = ctrCvt?.present
    ? `current toxicity ${String(ctrCvt.overallLabel).toLowerCase()} (${ctrCvt.summary})`
    : "no current cancer therapy–related cardiovascular toxicity";
  return `${baselinePart}; ${currentPart}.`;
}

/** True when a well-stratified patient has deteriorated anyway — worth saying. */
export function isUnexpectedDeterioration(baseline, ctrCvt) {
  if (!baseline?.applicable || !ctrCvt) return false;
  const lowBaseline = ["Low", "Moderate"].includes(baseline.category);
  const significantToxicity = severityRank(ctrCvt.overall) >= SEVERITY.moderate.rank;
  return lowBaseline && significantToxicity;
}

export { GRADE_MODERATE, GRADE_NONE, GRADE_SEVERE, GRADE_VERY_SEVERE, isWorse };
