/* =========================================================================
   Follow-up acuity.

   Follow-up was previously expressed purely as date arithmetic, so the most
   urgent thing the application could say was a date one day away - chest pain
   during a fluoropyrimidine infusion returned "come back tomorrow", and pedal
   oedema returned the same answer as chest pain.

   Urgency is a clinical band, not a number of days. The band carries the
   meaning and the date is derived from it, so "assess now" can exist at all.
   ========================================================================= */

import { num } from "@/lib/vitals";

export const ACUITY = {
  now: {
    id: "now",
    rank: 5,
    label: "Assess now",
    detail: "Do not let the patient leave before assessment.",
    days: 0,
    tone: "danger",
  },
  sameDay: {
    id: "sameDay",
    rank: 4,
    label: "Same day",
    detail: "Assessment and results required today.",
    days: 0,
    tone: "danger",
  },
  urgent: {
    id: "urgent",
    rank: 3,
    label: "Within 24–48 hours",
    detail: "Bring the next contact forward to within two days.",
    days: 2,
    tone: "danger",
  },
  soon: {
    id: "soon",
    rank: 2,
    label: "Within one week",
    detail: "Review before the next scheduled cycle.",
    days: 7,
    tone: "warning",
  },
  early: {
    id: "early",
    rank: 1,
    label: "Within two weeks",
    detail: "Earlier than the routine interval for this risk category.",
    days: 14,
    tone: "warning",
  },
  routine: {
    id: "routine",
    rank: 0,
    label: "Routine interval",
    detail: "Standard surveillance for this risk category.",
    days: null,
    tone: "ok",
  },
};

export const ACUITY_ORDER = Object.values(ACUITY).sort((a, b) => b.rank - a.rank);

export function isMoreUrgent(a, b) {
  return (ACUITY[a]?.rank ?? 0) > (ACUITY[b]?.rank ?? 0);
}

/** The most urgent of a set of bands. */
export function mostUrgent(bands) {
  return (bands || []).reduce((worst, band) => (isMoreUrgent(band, worst) ? band : worst), ACUITY.routine.id);
}

/** Routine surveillance intervals in days, by baseline risk category. */
export const ROUTINE_INTERVAL = { Low: 42, Moderate: 28, High: 21, "Very High": 14 };

export function routineDays(risk) {
  return ROUTINE_INTERVAL[risk] ?? ROUTINE_INTERVAL.Moderate;
}

function addDays(from, days) {
  const base = new Date(`${String(from || "")}T12:00:00`);
  const start = Number.isNaN(base.getTime()) ? new Date() : base;
  const result = new Date(start);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

/**
 * Resolves a follow-up plan from a set of triggers.
 *
 * Each trigger names its band and the reason for it. The most urgent band
 * wins, and every reason that reached that band is reported, so the clinician
 * sees all of what is driving the interval rather than only the first match.
 *
 * @param {object} options
 * @param {Array<{band: string, reason: string}>} options.triggers
 * @param {string} options.risk       baseline risk category, for the routine interval
 * @param {string} options.from       encounter date the interval runs from
 * @param {number} [options.baseDays] override for the routine interval
 */
export function resolveFollowUp({ triggers = [], risk = "Moderate", from, baseDays } = {}) {
  const valid = triggers.filter((trigger) => trigger && ACUITY[trigger.band]);
  const band = mostUrgent(valid.map((trigger) => trigger.band));
  const acuity = ACUITY[band];

  const routine = num(baseDays) ?? routineDays(risk);
  const days = acuity.days === null ? routine : Math.min(acuity.days, routine);
  const reasons = valid.filter((trigger) => trigger.band === band).map((trigger) => trigger.reason);

  return {
    band,
    acuity,
    label: acuity.label,
    detail: acuity.detail,
    tone: acuity.tone,
    days,
    date: addDays(from, days),
    reasons: reasons.length ? reasons : [`${String(risk).toLowerCase()}-risk routine surveillance`],
    /** Every trigger considered, for the audit trail on the encounter. */
    triggers: valid,
  };
}
