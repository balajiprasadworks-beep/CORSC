/* =========================================================================
   Where the patient is in their treatment journey.

   This existed twice, with different vocabularies. surveillance-engine.js
   recognised baseline, end of treatment, three months and twelve months;
   investigation-timeline.js recognised those plus six months. A visit typed
   "6 months post-treatment" was therefore classified by one as survivorship and
   by the other as an active treatment cycle, so the two halves of the same
   screen disagreed about the patient and the surveillance engine generated
   cycle tasks and a cycle-length follow-up interval for someone who had
   finished treatment.

   One resolver now serves both.
   ========================================================================= */

import { num } from "@/lib/vitals";

export const PHASES = {
  baseline: { id: "baseline", label: "Baseline", order: 0, posttreatment: false },
  treatment: { id: "treatment", label: "On treatment", order: 1, posttreatment: false },
  end: { id: "end", label: "End of treatment", order: 2, posttreatment: true },
  threeMonth: { id: "threeMonth", label: "3-month follow-up", order: 3, posttreatment: true },
  sixMonth: { id: "sixMonth", label: "6-month follow-up", order: 4, posttreatment: true },
  twelveMonth: { id: "twelveMonth", label: "12-month follow-up", order: 5, posttreatment: true },
};

export const PHASE_ORDER = Object.fromEntries(
  Object.values(PHASES).map((phase) => [phase.id, phase.order])
);

/**
 * Resolves an encounter's phase from its type string.
 *
 * Ordered most specific first: "12 months post-treatment" contains "2 month"
 * as a substring, so the longer patterns must be tested before the shorter.
 */
export function phaseOf(visit) {
  const type = String(visit?.type || "").toLowerCase();

  if (type.includes("baseline")) return PHASES.baseline.id;
  if (type.includes("end of treatment") || type.includes("end therapy") || type.includes("completion")) {
    return PHASES.end.id;
  }
  if (type.includes("12 month") || type.includes("twelve month")) return PHASES.twelveMonth.id;
  if (type.includes("6 month") || type.includes("six month")) return PHASES.sixMonth.id;
  if (type.includes("3 month") || type.includes("three month")) return PHASES.threeMonth.id;
  return PHASES.treatment.id;
}

export function isPostTreatment(visit) {
  return PHASES[phaseOf(visit)].posttreatment;
}

/**
 * The cycle number for a visit.
 *
 * Returns null rather than defaulting to 1 when nothing is recorded. The old
 * default silently placed unnumbered encounters at cycle 1, which meant the
 * dose 2-4 checkpoint-inhibitor myocarditis window could be skipped entirely.
 * Callers that need a number can choose their own fallback knowingly.
 */
export function cycleOf(patient, visit) {
  const explicit = num(visit?.firstReview?.cycle) ?? num(visit?.cycle);
  if (explicit !== null && explicit > 0) return Math.floor(explicit);

  const fromType = String(visit?.type || "").match(/(?:cycle|dose)\s*(\d+)/i);
  if (fromType) return Number(fromType[1]);

  const fromPatient = num(patient?.cycle);
  return fromPatient !== null && fromPatient > 0 ? Math.floor(fromPatient) : null;
}

/** Position along the journey, for comparing milestones against the current visit. */
export function journeyPosition(patient, visit) {
  const phase = phaseOf(visit);
  const cycle = cycleOf(patient, visit);
  const order = phase === PHASES.treatment.id ? 1 + (cycle || 1) * 0.001 : PHASE_ORDER[phase];
  return { phase, cycle, order };
}
