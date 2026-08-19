/* =========================================================================
   The three core workflow modes.

   CORSC already has a granular visit-type taxonomy (lib/visit-types.js) that
   answers "what sections does this encounter show". This module answers a
   different, coarser question the specification asks for on top of that:
   which of three clinically meaningful postures is this encounter — establish
   the reference point, confirm nothing has changed, or work through something
   that has.

   BASELINE       complete initial assessment, establish reference values.
   ROUTINE REVIEW  changes only; carry forward stable information.
   ABNORMAL REVIEW  triggered by an abnormal trend, symptom, biomarker, ECG
                    finding, or a therapy transition.

   The mode is recommended automatically from the patient's own state, and
   nothing about deriving it writes to or deletes stored data — it is a lens
   on the record, not a new fact about the patient.
   ========================================================================= */

export const WORKFLOW_MODES = {
  baseline: {
    id: "baseline",
    label: "Baseline",
    description: "Establish the pre-treatment cardiovascular state and the reference values everything later is compared against.",
  },
  routine: {
    id: "routine",
    label: "Routine review",
    description: "Changes only. Stable information is carried forward from the longitudinal record rather than re-collected.",
  },
  abnormal: {
    id: "abnormal",
    label: "Abnormal review",
    description: "Triggered by an abnormal trend, symptom, biomarker, ECG finding or therapy transition — focused assessment and an escalation plan.",
  },
  survivorship: {
    id: "survivorship",
    label: "Survivorship",
    description: "Long-term surveillance after treatment has finished, watching for late-onset dysfunction.",
  },
};

export const WORKFLOW_MODE_LIST = Object.values(WORKFLOW_MODES);

const SURVIVORSHIP_PHASES = new Set(["threeMonth", "sixMonth", "twelveMonth", "longTerm"]);

/**
 * Recommends a workflow mode from the encounter's visit type and the current
 * clinical picture.
 *
 * Order matters: an unscheduled review or a visit with a genuine escalation
 * trigger is ABNORMAL regardless of what phase of the treatment journey it
 * falls in, because a red flag at twelve months post-treatment is still a red
 * flag. Everything else falls back to the phase the visit type already
 * belongs to.
 *
 * @param {object} params
 * @param {object} params.visitType       resolved visit type (lib/visit-types.js)
 * @param {object} params.intervalHistory from interpretSinceLastVisit
 * @param {Array}  params.redFlags        picture.redFlags.flags
 * @param {string} params.fitnessVerdict  picture.fitness.verdict
 * @param {boolean} [params.phaseTransitioned]  true when the treatment phase changed this visit
 */
export function resolveWorkflowMode({ visitType, intervalHistory, redFlags = [], fitnessVerdict, phaseTransitioned = false }) {
  const reasons = [];

  if (visitType?.id === "baseline" || visitType?.id === "preTreatment") {
    return { mode: WORKFLOW_MODES.baseline.id, ...WORKFLOW_MODES.baseline, reasons: ["Baseline or pre-treatment visit type."], automatic: true };
  }

  if (visitType?.urgent) reasons.push("Recorded as an unscheduled cardiovascular review.");
  if (intervalHistory?.requiresReview) reasons.push("The interval history since the last visit contains an escalating finding.");
  if (redFlags.some((flag) => flag.level === "red" || flag.level === "orange")) {
    reasons.push("A red or orange alert is active from this encounter's findings.");
  }
  if (fitnessVerdict === "hold" || fitnessVerdict === "caution") {
    reasons.push(`The Action Bar verdict is "${fitnessVerdict}".`);
  }
  if (phaseTransitioned) reasons.push("The active treatment phase changed at this visit.");

  if (reasons.length > 0) {
    return { mode: WORKFLOW_MODES.abnormal.id, ...WORKFLOW_MODES.abnormal, reasons, automatic: true };
  }

  if (SURVIVORSHIP_PHASES.has(visitType?.phase)) {
    return {
      mode: WORKFLOW_MODES.survivorship.id,
      ...WORKFLOW_MODES.survivorship,
      reasons: ["Post-treatment surveillance visit type."],
      automatic: true,
    };
  }

  return { mode: WORKFLOW_MODES.routine.id, ...WORKFLOW_MODES.routine, reasons: ["Established patient, no escalation trigger present."], automatic: true };
}

/**
 * The compact section set for "Changes only", by workflow mode.
 *
 * Risk, surveillance and the Action Bar are not in these lists because they
 * already render unconditionally above every section — Quick Entry does not
 * need to re-show them as a collapsible section.
 *
 * Baseline gets a shorter list than the full comprehensive record, not a
 * different shape: the compact baseline sequence is identity → treatment →
 * known baseline data → today's clinical findings → note → complete, and
 * registration already carries identity, diagnosis and treatment in one panel.
 */
export const QUICK_SECTIONS = {
  baseline: ["registration", "vitals", "symptoms", "investigations", "overview"],
  routine: ["first-review", "since-last-visit", "symptoms", "vitals", "investigations", "overview"],
  abnormal: ["first-review", "since-last-visit", "symptoms", "vitals", "investigations", "overview"],
  survivorship: ["first-review", "since-last-visit", "symptoms", "vitals", "investigations", "overview"],
};

/** The quick-mode section id list for a workflow mode, defaulting to routine's. */
export function quickSectionIds(mode) {
  return QUICK_SECTIONS[mode] || QUICK_SECTIONS.routine;
}
