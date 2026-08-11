/* =========================================================================
   Surveillance rule set.

   The previous engine expressed surveillance as bare cycle arithmetic —
   "high risk, cycle divisible by two, order an echo" — and displayed the result
   as "High risk → surveillance". A clinician asked to explain that to a patient,
   or to justify it to a colleague who disagreed, had nothing to work with.

   Every rule here therefore declares four things explicitly:

     what    the investigation or action
     why     the clinical reason, in a sentence a clinician would actually say
     when    the timing, and what makes it due now rather than later
     source  the guideline and version behind it

   Rules that are service configuration rather than guideline recommendation —
   how often to bring someone back when nothing is wrong — are attributed to
   `corsc-operational` rather than dressed up as ESC recommendations. That
   distinction matters: a clinician overriding a local scheduling convention is
   doing something different from a clinician overriding a guideline.

   Cumulative exposure, biomarker trajectory and previous toxicity are inputs,
   not afterthoughts. A patient at 380 mg/m² of doxorubicin-equivalent needs
   imaging before the next dose whatever their baseline category said, and a
   patient whose troponin rose last cycle needs it repeated whatever the cycle
   number is.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";

/* ------------------------------------------------------------------ tasks */

/** The investigations and actions surveillance can ask for. */
export const TASKS = {
  symptoms: { id: "symptoms", label: "Symptom review", kind: "assessment" },
  vitals: { id: "vitals", label: "Vitals including blood pressure", kind: "assessment" },
  "cv-exam": { id: "cv-exam", label: "Cardiovascular examination", kind: "assessment" },
  "general-exam": { id: "general-exam", label: "General and systemic examination", kind: "assessment" },
  weight: { id: "weight", label: "Weight", kind: "assessment" },
  "medication-review": { id: "medication-review", label: "Medication review", kind: "assessment" },
  "chest-pain-screen": { id: "chest-pain-screen", label: "Chest-pain screen", kind: "assessment" },
  "peripheral-vascular": { id: "peripheral-vascular", label: "Peripheral vascular assessment", kind: "assessment" },

  ecg: { id: "ecg", label: "12-lead ECG", kind: "investigation" },
  echo: { id: "echo", label: "Echocardiography (TTE)", kind: "investigation" },
  gls: { id: "gls", label: "Global longitudinal strain (GLS)", kind: "investigation" },
  troponin: { id: "troponin", label: "Troponin", kind: "investigation" },
  "repeat-troponin": { id: "repeat-troponin", label: "Repeat troponin", kind: "investigation" },
  ntprobnp: { id: "ntprobnp", label: "NT-proBNP", kind: "investigation" },
  electrolytes: { id: "electrolytes", label: "Potassium, magnesium and calcium", kind: "investigation" },
  lipids: { id: "lipids", label: "Lipid profile and HbA1c", kind: "investigation" },
  "cardiac-mri": { id: "cardiac-mri", label: "Cardiac MRI", kind: "investigation" },

  "cardiology-review": { id: "cardiology-review", label: "Cardiology review", kind: "action" },
  "urgent-cardiology": { id: "urgent-cardiology", label: "Urgent cardio-oncology review", kind: "action" },
  "hf-therapy": { id: "hf-therapy", label: "Start or optimise heart-failure therapy", kind: "action" },
  "acei-arb-review": { id: "acei-arb-review", label: "ACE inhibitor or ARB review", kind: "action" },
  "beta-blocker-review": { id: "beta-blocker-review", label: "Beta-blocker review", kind: "action" },
  "qt-drug-review": { id: "qt-drug-review", label: "Review QT-prolonging medicines", kind: "action" },
  "bp-treatment": { id: "bp-treatment", label: "Start or intensify antihypertensive therapy", kind: "action" },
  "chemo-continuation": { id: "chemo-continuation", label: "Discuss cancer therapy continuation with oncology", kind: "action" },
  "qt-chemo-interruption": { id: "qt-chemo-interruption", label: "Consider interrupting QT-prolonging therapy", kind: "action" },
  "anthracycline-dose-review": { id: "anthracycline-dose-review", label: "Cumulative anthracycline dose review", kind: "action" },
  "dexrazoxane-discussion": { id: "dexrazoxane-discussion", label: "Discuss dexrazoxane with oncology", kind: "action" },
  "next-follow-up": { id: "next-follow-up", label: "Schedule the next surveillance visit", kind: "action" },
};

export function taskDefinition(id) {
  return TASKS[id] || { id, label: id, kind: "action" };
}

/* --------------------------------------------------------------- priority */

export const PRIORITY = {
  routine: { id: "routine", rank: 1, label: "Routine", tone: "neutral" },
  surveillance: { id: "surveillance", rank: 2, label: "Scheduled surveillance", tone: "info" },
  urgent: { id: "urgent", rank: 3, label: "Urgent", tone: "danger" },
};

/**
 * Builds a fully explained surveillance recommendation.
 *
 * The four fields are mandatory by construction — there is no path to creating
 * a recommendation without a reason and a source, because an unexplained
 * recommendation is the thing this rewrite exists to remove.
 */
export function recommend({ task, why, when, priority = "surveillance", sourceId, locator, note, trigger = null }) {
  const definition = taskDefinition(task);
  return {
    id: definition.id,
    label: definition.label,
    kind: definition.kind,
    priority,
    priorityLabel: PRIORITY[priority].label,
    tone: PRIORITY[priority].tone,
    /** WHAT is due. */
    what: definition.label,
    /** WHY it is due — the clinical reason, not a restatement of the rule. */
    why,
    /** WHEN it is due. */
    when,
    /** What made it due now, where a specific finding did. */
    trigger,
    /** SOURCE and guideline version. */
    provenance: provenance(sourceId, { locator, note }),
  };
}

/* ---------------------------------------------------------- rule metadata */

/**
 * Routine review intervals in days.
 *
 * These are service-scheduling conventions, not guideline recommendations. The
 * guidelines specify what to measure and when to escalate, and generally leave
 * the routine clinic interval to local services. Attributing these to ESC would
 * be a fabricated citation, so they carry the operational source.
 */
export const ROUTINE_INTERVAL_DAYS = { Low: 42, Moderate: 28, High: 21, "Very High": 14 };

export const INTERVAL_PROVENANCE = provenance("corsc-operational", {
  locator: "Routine clinic review intervals by baseline risk",
  note: "A service-scheduling convention. The guidelines specify what to measure and when to escalate, not how often a well patient attends clinic.",
});

/** Cumulative anthracycline exposure at which imaging is required each dose. */
export const EXPOSURE_IMAGING_THRESHOLD = 400;

/** Cumulative exposure at which surveillance imaging becomes due. */
export const EXPOSURE_SURVEILLANCE_THRESHOLD = 250;

/** Checkpoint-inhibitor doses during which troponin screening is mandatory. */
export const ICI_EARLY_DOSES = 4;

/** Cycles between scheduled imaging, by baseline risk, on a cardiomyopathy pathway. */
export const IMAGING_INTERVAL_CYCLES = { "Very High": 2, High: 2, Moderate: 4, Low: null };

/** Cycles between scheduled biomarkers, by baseline risk. */
export const BIOMARKER_INTERVAL_CYCLES = { "Very High": 1, High: 1, Moderate: 2, Low: null };
