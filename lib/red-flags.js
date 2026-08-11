/* =========================================================================
   Red-flag engine.

   A four-level alert hierarchy, so that "call the arrest team" and "check the
   lipids next visit" are not the same colour. The previous implementation had
   two levels, danger and warning, and put a troponin rise and a hypertensive
   reading in the same bucket.

     RED     emergency — assess before the patient leaves the department
     ORANGE  urgent cardiology or cardio-oncology review
     YELLOW  clinical review, at or before the next contact
     GREEN   routine, no current alert

   Every trigger names the finding that fired it, what to do, and where the rule
   comes from. A trigger with no source does not belong here: an alert a
   clinician cannot audit is an alert they will eventually learn to ignore.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";
import { SEVERITY, severityRank } from "@/lib/ctrcvt";
import { GRADE_MODERATE, GRADE_SEVERE, GRADE_VERY_SEVERE } from "@/lib/ctrcd";
import { therapyList } from "@/lib/hfa-icos";

export const LEVELS = {
  red: {
    id: "red",
    rank: 3,
    label: "Red",
    heading: "Emergency — immediate clinical attention",
    detail: "Assess before the patient leaves the department.",
    tone: "danger",
  },
  orange: {
    id: "orange",
    rank: 2,
    label: "Orange",
    heading: "Urgent cardiology or cardio-oncology review",
    detail: "Same day or within 24 to 48 hours.",
    tone: "danger",
  },
  yellow: {
    id: "yellow",
    rank: 1,
    label: "Yellow",
    heading: "Clinical review",
    detail: "Address at or before the next scheduled contact.",
    tone: "warning",
  },
  green: {
    id: "green",
    rank: 0,
    label: "Green",
    heading: "Routine — no current alert",
    detail: "Continue the scheduled surveillance plan.",
    tone: "ok",
  },
};

export const LEVEL_ORDER = [LEVELS.red, LEVELS.orange, LEVELS.yellow, LEVELS.green];

export function highestLevel(ids) {
  return (ids || []).reduce((worst, id) => ((LEVELS[id]?.rank ?? 0) > (LEVELS[worst]?.rank ?? 0) ? id : worst), LEVELS.green.id);
}

/* ---------------------------------------------------------------- symptoms */

/** Symptoms that are an emergency in their own right on cardiotoxic therapy. */
const EMERGENCY_SYMPTOMS = {
  Syncope: {
    action: "Exclude arrhythmic and structural causes today. Twelve-lead ECG, troponin, and cardiology review before discharge.",
    why: "Syncope on cardiotoxic therapy may be the first presentation of high-grade conduction disease, ventricular arrhythmia or severe LV dysfunction.",
  },
};

const URGENT_SYMPTOMS = {
  "Chest pain": {
    action: "Twelve-lead ECG and troponin now. Do not attribute to a non-cardiac cause without assessment.",
    why: "Chest pain during cancer therapy may represent acute coronary syndrome, vasospasm, myocarditis or pericarditis.",
  },
  Orthopnoea: {
    action: "Assess for decompensated heart failure: JVP, lung bases, oedema, natriuretic peptide.",
    why: "Orthopnoea is a specific symptom of raised filling pressure.",
  },
  "Paroxysmal nocturnal dyspnoea": {
    action: "Assess for decompensated heart failure: JVP, lung bases, oedema, natriuretic peptide.",
    why: "Paroxysmal nocturnal dyspnoea is a specific symptom of raised filling pressure.",
  },
};

const REVIEW_SYMPTOMS = {
  Dyspnoea: "Breathlessness has many causes in cancer, but on cardiotoxic therapy heart failure must be one of those considered.",
  Palpitations: "May represent new atrial or ventricular arrhythmia.",
  Presyncope: "May represent arrhythmia or postural intolerance.",
  "Pedal oedema": "May represent fluid retention from heart failure.",
  "Reduced exercise tolerance": "A common early symptom of falling cardiac output, easily attributed to the cancer instead.",
};

/* ------------------------------------------------------------------ engine */

function flag(level, { id, title, finding, action, why, sourceId, locator, note }) {
  return {
    id,
    level,
    levelLabel: LEVELS[level].label,
    tone: LEVELS[level].tone,
    title,
    finding,
    action,
    why,
    provenance: provenance(sourceId, { locator, note }),
  };
}

/**
 * Produces the alert list for this encounter.
 *
 * @param {object} input
 * @param {object} input.patient
 * @param {object} input.encounter
 * @param {object} input.ctrCvt      from assessCtrCvt
 * @param {object} input.troponin    from interpretTroponin
 * @param {object} input.ecg         from interpretECG
 * @param {string[]} input.symptoms
 */
export function assessRedFlags({ patient, encounter, ctrCvt, troponin = {}, ecg = {}, symptoms = [] } = {}) {
  const flags = [];
  const therapies = therapyList(patient?.therapy);
  const reported = Array.isArray(symptoms) ? symptoms : [];
  const detail = (symptom) => {
    const entry = encounter?.symptomDetail?.[symptom] || {};
    return [entry.severity, entry.duration].filter(Boolean).join(", ");
  };
  const describe = (symptom) => {
    const parts = detail(symptom);
    return parts ? `${symptom} (${parts})` : symptom;
  };

  /* ------------------------------------------------------------------ RED */

  if (ctrCvt?.byId?.myocarditis?.present && therapies.includes("ici")) {
    flags.push(
      flag("red", {
        id: "ici-myocarditis",
        title: "Possible immune checkpoint inhibitor myocarditis",
        finding: ctrCvt.byId.myocarditis.findings[0] || "Troponin rise on a checkpoint inhibitor.",
        action:
          "Withhold the next immunotherapy dose. Admit. ECG, repeat troponin and echocardiography today, urgent cardio-oncology review, and early consideration of cardiac MRI. Start high-dose corticosteroids once myocarditis is the working diagnosis.",
        why:
          "Immune myocarditis carries very high mortality, and can be fulminant while the ejection fraction is still normal. A normal echocardiogram does not exclude it.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "Immune checkpoint inhibitor–associated myocarditis",
      })
    );
  }

  if (ctrCvt?.ctrcd?.grade === GRADE_VERY_SEVERE) {
    flags.push(
      flag("red", {
        id: "ctrcd-very-severe",
        title: "Very severe cancer therapy–related cardiac dysfunction",
        finding: ctrCvt.ctrcd.criteria[0] || ctrCvt.ctrcd.label,
        action: "Stop cancer therapy. Admit for inotropic or mechanical circulatory support as required. Immediate cardiology involvement.",
        why: "Heart failure requiring inotropes, mechanical support or transplant consideration is the most severe CTRCD grade.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "CTRCD severity grading",
      })
    );
  }

  Object.entries(EMERGENCY_SYMPTOMS).forEach(([symptom, config]) => {
    if (!reported.includes(symptom)) return;
    flags.push(
      flag("red", {
        id: `symptom-${symptom.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${symptom} reported`,
        finding: describe(symptom),
        action: config.action,
        why: config.why,
        sourceId: "esc-cardio-oncology-2022",
        locator: "Symptom-triggered assessment during cardiotoxic therapy",
      })
    );
  });

  if (ctrCvt?.byId?.hypertension?.severity === SEVERITY.severe.id) {
    flags.push(
      flag("red", {
        id: "severe-hypertension",
        title: "Grade 3 hypertension",
        finding: ctrCvt.byId.hypertension.findings[0] || "Blood pressure at or above 180/110 mmHg.",
        action:
          "Treat now and reassess before the patient leaves. Where the therapy is a VEGF-pathway inhibitor, discuss interruption with oncology if the pressure cannot be controlled.",
        why: "Blood pressure at or above 180/110 mmHg carries immediate risk and is a common reason for interrupting VEGF-pathway therapy.",
        sourceId: "esc-hypertension-2024",
        locator: "Grade 3 hypertension",
      })
    );
  }

  const chestPainWithTroponin = reported.includes("Chest pain") && troponin.newRise;
  if (chestPainWithTroponin) {
    flags.push(
      flag("red", {
        id: "acs",
        title: "Chest pain with a troponin rise",
        finding: `${describe("Chest pain")}; ${troponin.label || "troponin risen from baseline"}.`,
        action: "Treat as suspected acute coronary syndrome until proven otherwise. ECG, serial troponin, and immediate cardiology review.",
        why: "Chest pain with myocardial injury requires an acute coronary syndrome pathway, not routine cardio-oncology surveillance.",
        sourceId: "ic-os-2021-definitions",
        locator: "Myocardial ischaemia definitions",
      })
    );
  }

  /* --------------------------------------------------------------- ORANGE */

  if (ctrCvt?.ctrcd?.grade === GRADE_SEVERE) {
    flags.push(
      flag("orange", {
        id: "ctrcd-severe",
        title: "Severe cancer therapy–related cardiac dysfunction",
        finding: ctrCvt.ctrcd.criteria[0] || ctrCvt.ctrcd.label,
        action:
          "Interrupt cancer therapy pending review. Start full guideline-directed heart-failure therapy. Urgent cardiology assessment; consider admission if symptomatic.",
        why: "An ejection fraction below 40%, or heart failure requiring hospitalisation, is severe CTRCD.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "CTRCD severity grading",
      })
    );
  }

  if (ctrCvt?.ctrcd?.grade === GRADE_MODERATE) {
    flags.push(
      flag("orange", {
        id: "ctrcd-moderate",
        title: "Moderate cancer therapy–related cardiac dysfunction",
        finding: ctrCvt.ctrcd.criteria[0] || ctrCvt.ctrcd.label,
        action:
          "Discuss interruption with oncology before the next cycle. Start an ACE inhibitor or ARB and a beta-blocker unless contraindicated. Repeat echocardiography in three to four weeks. Refer to cardio-oncology.",
        why: "Moderate CTRCD is the grade at which cancer therapy decisions change, and at which cardioprotection is most likely to preserve function.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "CTRCD severity grading and management",
      })
    );
  }

  if (troponin.newRise && !chestPainWithTroponin && !therapies.includes("ici")) {
    flags.push(
      flag("orange", {
        id: "troponin-rise",
        title: "Troponin risen from baseline",
        finding: `${troponin.label}${troponin.detail ? ` — ${troponin.detail}` : ""}`,
        action: "Repeat troponin within 24 to 48 hours, obtain an ECG and echocardiography, and escalate to cardio-oncology.",
        why: "A new troponin rise on cardiotoxic therapy indicates myocardial injury and contributes to the CTRCD definition.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "Cardiac biomarker surveillance",
      })
    );
  }

  if (ecg.actionable) {
    flags.push(
      flag("orange", {
        id: "qtc",
        title: "QTc at the action threshold",
        finding: (ecg.reasons || []).join("; ") || ecg.label,
        action:
          "Repeat the ECG, check and correct potassium, magnesium and calcium, review every QT-prolonging medicine, and discuss interruption of QT-prolonging cancer therapy with oncology.",
        why: "A QTc at or above 500 ms, or a rise of 60 ms or more from baseline, carries a materially increased risk of torsades de pointes.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "QTc prolongation thresholds and management",
      })
    );
  }

  if (ctrCvt?.byId?.vascularIschaemic?.present && severityRank(ctrCvt.byId.vascularIschaemic.severity) >= SEVERITY.moderate.rank && !chestPainWithTroponin) {
    flags.push(
      flag("orange", {
        id: "vascular",
        title: "Possible therapy-related vascular or ischaemic event",
        finding: ctrCvt.byId.vascularIschaemic.findings[0],
        action: "ECG and troponin now, and urgent cardiology assessment. Discuss the next dose with oncology before it is given.",
        why: "Fluoropyrimidines cause coronary vasospasm and BCR-ABL inhibitors cause arterial occlusive events; both present as chest pain during therapy.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "Therapy-specific vascular toxicity",
      })
    );
  }

  Object.entries(URGENT_SYMPTOMS).forEach(([symptom, config]) => {
    if (!reported.includes(symptom)) return;
    // Chest pain with a troponin rise has already fired as an emergency.
    if (symptom === "Chest pain" && chestPainWithTroponin) return;
    flags.push(
      flag("orange", {
        id: `symptom-${symptom.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${symptom} reported`,
        finding: describe(symptom),
        action: config.action,
        why: config.why,
        sourceId: "esc-cardio-oncology-2022",
        locator: "Symptom-triggered assessment during cardiotoxic therapy",
      })
    );
  });

  /* --------------------------------------------------------------- YELLOW */

  if (ctrCvt?.ctrcd?.unresolved) {
    flags.push(
      flag("yellow", {
        id: "ctrcd-indeterminate",
        title: "Cardiac dysfunction cannot be graded",
        finding: ctrCvt.ctrcd.criteria[0] || "The available measurements cannot exclude cardiac dysfunction.",
        action: "Repeat echocardiography with strain and check biomarkers. Retrieve the pre-treatment ejection fraction if it exists anywhere.",
        why:
          "Reporting 'no dysfunction' when the data cannot support that conclusion is the more dangerous failure, so this is surfaced rather than resolved silently.",
        sourceId: "corsc-operational",
        locator: "Indeterminate grading",
      })
    );
  }

  if (ctrCvt?.ctrcd?.grade === "mild") {
    flags.push(
      flag("yellow", {
        id: "ctrcd-mild",
        title: "Mild cancer therapy–related cardiac dysfunction",
        finding: ctrCvt.ctrcd.criteria[0] || ctrCvt.ctrcd.label,
        action: "Continue cancer therapy with cardiology input, start or optimise an ACE inhibitor or ARB and a beta-blocker, and repeat imaging before the next cycle.",
        why: "Mild CTRCD is subclinical injury with a preserved ejection fraction, and is the point at which cardioprotection has most to offer.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "CTRCD severity grading",
      })
    );
  }

  if (ctrCvt?.byId?.hypertension?.severity === SEVERITY.moderate.id) {
    flags.push(
      flag("yellow", {
        id: "moderate-hypertension",
        title: "Grade 2 hypertension",
        finding: ctrCvt.byId.hypertension.findings[0],
        action: "Start or intensify antihypertensive therapy and arrange a recheck within two weeks.",
        why: "Sustained blood pressure at or above 160/100 mmHg requires treatment, and on VEGF-pathway therapy predicts dose interruption.",
        sourceId: "esc-hypertension-2024",
        locator: "Grade 2 hypertension",
      })
    );
  }

  if (ecg.prolonged && !ecg.actionable) {
    flags.push(
      flag("yellow", {
        id: "qtc-prolonged",
        title: "QTc above the upper limit of normal",
        finding: (ecg.reasons || []).join("; ") || ecg.label,
        action: "Check electrolytes, review QT-prolonging medicines, and repeat the ECG before the next cycle.",
        why: "A prolonged but sub-threshold QTc is worth acting on before it reaches the action threshold, particularly with QT-prolonging cancer therapy.",
        sourceId: "esc-cardio-oncology-2022",
        locator: "QTc surveillance",
      })
    );
  }

  Object.entries(REVIEW_SYMPTOMS).forEach(([symptom, why]) => {
    if (!reported.includes(symptom)) return;
    flags.push(
      flag("yellow", {
        id: `symptom-${symptom.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${symptom} reported`,
        finding: describe(symptom),
        action: "Assess at this encounter and document whether a cardiac cause has been considered.",
        why,
        sourceId: "esc-cardio-oncology-2022",
        locator: "Symptom-triggered assessment during cardiotoxic therapy",
      })
    );
  });

  /* -------------------------------------------------------------- assemble */

  const order = { red: 0, orange: 1, yellow: 2, green: 3 };
  const sorted = flags.sort((a, b) => order[a.level] - order[b.level]);
  const level = highestLevel(sorted.map((item) => item.level));

  return {
    flags: sorted,
    level,
    levelConfig: LEVELS[level],
    counts: {
      red: sorted.filter((f) => f.level === "red").length,
      orange: sorted.filter((f) => f.level === "orange").length,
      yellow: sorted.filter((f) => f.level === "yellow").length,
    },
    byLevel: {
      red: sorted.filter((f) => f.level === "red"),
      orange: sorted.filter((f) => f.level === "orange"),
      yellow: sorted.filter((f) => f.level === "yellow"),
    },
    summary: sorted.length
      ? `${LEVELS[level].heading}: ${sorted[0].title}.`
      : "No red flag identified at this encounter.",
  };
}
