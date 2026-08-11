/* =========================================================================
   Cumulative anthracycline exposure.

   Cumulative delivered dose is the defining risk variable for the most
   cardiotoxic drug class in oncology, and the application previously held only
   a single planned figure entered once at registration. Thresholds were
   therefore applied to a number that might never be reached, or might be
   exceeded without anything noticing.

   This module tracks what was actually given, cycle by cycle, and converts it
   to doxorubicin equivalents so that mixed and sequential regimens accumulate
   onto one scale.

   EQUIVALENCE FACTORS FOR CLINICAL REVIEW
   Published cardiotoxicity equivalence ratios vary between sources, and the
   mitoxantrone ratio in particular differs substantially between the older
   adult literature and the paediatric survivorship revisions. The values below
   are widely used defaults, exported from one place so a site can substitute
   its own after review.
   ========================================================================= */

import { num } from "@/lib/vitals";

export const ANTHRACYCLINE_AGENTS = [
  { id: "doxorubicin", label: "Doxorubicin", factor: 1 },
  { id: "epirubicin", label: "Epirubicin", factor: 0.67 },
  { id: "daunorubicin", label: "Daunorubicin", factor: 0.6 },
  { id: "idarubicin", label: "Idarubicin", factor: 3 },
  { id: "mitoxantrone", label: "Mitoxantrone", factor: 4 },
  { id: "liposomal-doxorubicin", label: "Liposomal doxorubicin (pegylated)", factor: 0.5 },
  { id: "liposomal-daunorubicin", label: "Liposomal daunorubicin", factor: 0.3 },
];

export function anthracyclineAgent(id) {
  return ANTHRACYCLINE_AGENTS.find((agent) => agent.id === id) || null;
}

/** Thresholds in mg/m² doxorubicin-equivalent, in ascending order. */
export const DOSE_THRESHOLDS = [
  {
    id: "surveillance",
    at: 250,
    tone: "warning",
    label: "Surveillance threshold",
    guidance: "Risk of cardiac dysfunction rises from this point. Arrange echocardiography with global longitudinal strain and check biomarkers.",
  },
  {
    id: "dexrazoxane",
    at: 300,
    tone: "warning",
    label: "Dexrazoxane threshold",
    guidance: "Discuss dexrazoxane cardioprotection with oncology if further anthracycline is planned.",
  },
  {
    id: "high",
    at: 400,
    tone: "danger",
    label: "High cumulative exposure",
    guidance: "Risk rises steeply beyond this point. Echocardiography before each further dose, and a documented cardio-oncology discussion before continuing.",
  },
  {
    id: "ceiling",
    at: 550,
    tone: "danger",
    label: "Conventional ceiling",
    guidance: "The conventional lifetime doxorubicin ceiling. Further exposure needs explicit multidisciplinary agreement and close surveillance.",
  },
];

/** How close to the next threshold a total must be before it is flagged. */
export const APPROACHING_MARGIN = 50;

/** Converts a dose of a named agent into its doxorubicin equivalent. */
export function doxorubicinEquivalent(agentId, dose) {
  const agent = anthracyclineAgent(agentId);
  const value = num(dose);
  if (!agent || value === null) return null;
  return Number((value * agent.factor).toFixed(1));
}

/**
 * Normalises the recorded dose entries, discarding any that cannot be scored
 * and carrying the equivalent dose on each.
 */
export function normaliseDoses(doses) {
  return (Array.isArray(doses) ? doses : []).flatMap((entry) => {
    const equivalent = doxorubicinEquivalent(entry?.agent, entry?.dose);
    if (equivalent === null) return [];
    const agent = anthracyclineAgent(entry.agent);
    return [{
      ...entry,
      agentLabel: agent.label,
      factor: agent.factor,
      dose: num(entry.dose),
      equivalent,
    }];
  });
}

/** Total doxorubicin-equivalent exposure, including any dose given before registration. */
export function cumulativeDose(patient) {
  const recorded = normaliseDoses(patient?.anthracyclineDoses);
  const prior = num(patient?.history?.priorTreatment?.fields?.priorAnthracycline) || 0;
  const delivered = recorded.reduce((total, entry) => total + entry.equivalent, 0);
  return {
    prior,
    delivered: Number(delivered.toFixed(1)),
    total: Number((prior + delivered).toFixed(1)),
    entries: recorded,
  };
}

/**
 * Grades a cumulative total against the thresholds.
 *
 * Reports both the highest threshold already crossed and the next one, so the
 * clinician is warned as a threshold is approached rather than only once it has
 * been passed - by which point the dose has already been given.
 */
export function assessCumulativeDose(total, plannedRemaining = 0) {
  const value = num(total) ?? 0;
  const crossed = DOSE_THRESHOLDS.filter((threshold) => value >= threshold.at);
  const reached = crossed.length ? crossed[crossed.length - 1] : null;
  const next = DOSE_THRESHOLDS.find((threshold) => value < threshold.at) || null;

  const remaining = num(plannedRemaining) ?? 0;
  const projected = Number((value + remaining).toFixed(1));
  const approaching = Boolean(next && (next.at - value <= APPROACHING_MARGIN || projected >= next.at));

  return {
    total: value,
    projected,
    reached,
    next,
    approaching,
    tone: reached ? reached.tone : approaching ? "warning" : "ok",
    label: reached
      ? `${value} mg/m² doxorubicin-equivalent — ${reached.label.toLowerCase()} passed`
      : `${value} mg/m² doxorubicin-equivalent`,
    guidance: reached
      ? reached.guidance
      : approaching && next
        ? `Projected exposure reaches ${projected} mg/m², at or beyond the ${next.at} mg/m² ${next.label.toLowerCase()}. ${next.guidance}`
        : null,
  };
}

/**
 * Full ledger for a patient: every recorded dose, the running equivalent total,
 * and the threshold assessment.
 */
export function anthracyclineLedger(patient) {
  const cumulative = cumulativeDose(patient);
  const planned = num(patient?.totalPlannedDose);
  const remaining = planned !== null ? Math.max(0, planned - cumulative.total) : 0;

  let running = cumulative.prior;
  const entries = cumulative.entries.map((entry) => {
    running = Number((running + entry.equivalent).toFixed(1));
    return { ...entry, runningTotal: running };
  });

  return {
    ...cumulative,
    entries,
    planned,
    remaining,
    assessment: assessCumulativeDose(cumulative.total, remaining),
  };
}
