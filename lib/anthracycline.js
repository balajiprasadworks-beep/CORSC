/* =========================================================================
   Cumulative anthracycline exposure and doxorubicin equivalence.

   Cumulative delivered dose is the defining risk variable for the most
   cardiotoxic drug class in oncology, so the number has to be right and the
   arithmetic has to be visible.

   ---------------------------------------------------------------------------
   THE EQUIVALENCE PROBLEM
   ---------------------------------------------------------------------------
   Published conversion ratios to doxorubicin disagree, and for mitoxantrone
   they disagree by a factor of about three. That is not a rounding difference:
   at 60 mg/m² of mitoxantrone one model reports 240 mg/m² doxorubicin-
   equivalent and the other reports 600 mg/m², which is the difference between
   "continue" and "past the conventional lifetime ceiling".

   CORSC therefore does not hide the model. It carries two named published
   models, computes the primary one, and shows what the alternative would give
   whenever the two materially differ.

     PRIMARY      Feijen et al, JAMA Oncol 2019 — equivalence ratios derived
                  from late-onset cardiotoxicity outcomes rather than assumed
                  from potency. This is the most rigorously derived published
                  set available.

     ALTERNATIVE  The conventional adult-oncology convention, retained because
                  many services and protocols are written against it and a
                  clinician comparing CORSC's number with their protocol's
                  number needs to be able to see why they differ.

   The previous implementation carried one unattributed set of factors with the
   comment "widely used defaults", including a mitoxantrone factor of 4 and an
   idarubicin factor of 3, and no way to tell which published model that was or
   what the alternative would give.
   ========================================================================= */

import { citeShort, provenance } from "@/lib/clinical-sources";
import { calcBSA, num } from "@/lib/vitals";

/* ---------------------------------------------------------------- models */

export const EQUIVALENCE_MODELS = {
  feijen2019: {
    id: "feijen2019",
    label: "Derived late-cardiotoxicity ratios",
    shortLabel: "Feijen 2019",
    sourceId: "igharo-2021-equivalence",
    isPrimary: true,
    description:
      "Equivalence ratios derived from observed late-onset cardiotoxicity rather than assumed from anti-tumour potency.",
    factors: {
      doxorubicin: 1,
      epirubicin: 0.8,
      daunorubicin: 0.6,
      idarubicin: 10.5,
      mitoxantrone: 10.5,
      "liposomal-doxorubicin": 1,
      "liposomal-daunorubicin": 0.6,
    },
  },
  conventional: {
    id: "conventional",
    label: "Conventional adult-oncology convention",
    shortLabel: "Conventional",
    sourceId: "conventional-equivalence",
    isPrimary: false,
    description:
      "The long-standing adult-oncology convention. Retained for comparison because many local protocols are written against it.",
    factors: {
      doxorubicin: 1,
      epirubicin: 0.67,
      daunorubicin: 0.5,
      idarubicin: 5,
      mitoxantrone: 4,
      "liposomal-doxorubicin": 0.5,
      "liposomal-daunorubicin": 0.3,
    },
  },
};

export const PRIMARY_MODEL = "feijen2019";
export const ALTERNATIVE_MODEL = "conventional";

export function equivalenceModel(id) {
  return EQUIVALENCE_MODELS[id] || EQUIVALENCE_MODELS[PRIMARY_MODEL];
}

/**
 * Relative difference between the two models above which the alternative is
 * shown alongside the primary. Below this the second number is noise.
 */
export const MODEL_DIVERGENCE_THRESHOLD = 0.15;

export const ANTHRACYCLINE_AGENTS = [
  { id: "doxorubicin", label: "Doxorubicin", note: "The reference agent." },
  { id: "epirubicin", label: "Epirubicin", note: "Less cardiotoxic per milligram than doxorubicin." },
  { id: "daunorubicin", label: "Daunorubicin", note: "Used mainly in acute leukaemia." },
  {
    id: "idarubicin",
    label: "Idarubicin",
    note: "Given at much lower absolute doses, so a high conversion factor is expected. Published factors differ substantially between models.",
  },
  {
    id: "mitoxantrone",
    label: "Mitoxantrone",
    note: "An anthraquinone rather than an anthracycline. This is the agent on which the published models disagree most — check which model your protocol assumes.",
  },
  {
    id: "liposomal-doxorubicin",
    label: "Liposomal doxorubicin (pegylated)",
    note: "Clinically less cardiotoxic than conventional doxorubicin, but the derived and conventional models disagree on how much credit to give for that.",
  },
  { id: "liposomal-daunorubicin", label: "Liposomal daunorubicin", note: "" },
];

export function anthracyclineAgent(id) {
  return ANTHRACYCLINE_AGENTS.find((agent) => agent.id === id) || null;
}

export function conversionFactor(agentId, modelId = PRIMARY_MODEL) {
  const model = equivalenceModel(modelId);
  const factor = model.factors[agentId];
  return typeof factor === "number" ? factor : null;
}

/* ------------------------------------------------------------------ units */

/**
 * Dose units a clinician may have in front of them.
 *
 * Protocols are written in mg/m², but the pharmacy label and the prescription
 * are usually in milligrams. Making the clinician do the body-surface-area
 * division in their head is where transcription errors come from, so CORSC
 * accepts either and does the arithmetic itself.
 */
export const DOSE_UNITS = [
  { id: "mg/m2", label: "mg/m² (per body surface area)", needsBSA: false },
  { id: "mg", label: "mg (absolute dose)", needsBSA: true },
];

/**
 * Normalises a dose entry to mg/m².
 *
 * Returns the reason when it cannot, so the UI can say "enter height and weight
 * to convert this milligram dose" rather than silently dropping the entry —
 * which is what the previous implementation did, quietly under-reporting
 * cumulative exposure.
 */
export function toDosePerBsa(entry, patient) {
  const dose = num(entry?.dose);
  if (dose === null) return { value: null, reason: "No dose recorded" };

  const unit = entry?.unit || "mg/m2";
  if (unit === "mg/m2") return { value: dose, reason: null, bsa: null };

  const bsa = num(entry?.bsa) ?? calcBSA(patient?.baselineHeight, patient?.baselineWeight);
  if (bsa === null || bsa <= 0) {
    return {
      value: null,
      reason: "Dose is recorded in milligrams but no body surface area is available, so it cannot be converted to mg/m²",
    };
  }
  return { value: Number((dose / bsa).toFixed(1)), reason: null, bsa };
}

/* ------------------------------------------------------------ conversion */

/** Converts a dose in mg/m² of a named agent into its doxorubicin equivalent. */
export function doxorubicinEquivalent(agentId, dosePerBsa, modelId = PRIMARY_MODEL) {
  const factor = conversionFactor(agentId, modelId);
  const value = num(dosePerBsa);
  if (factor === null || value === null) return null;
  return Number((value * factor).toFixed(1));
}

/**
 * Normalises the recorded dose entries.
 *
 * Entries that cannot be scored are RETAINED with a `problem` rather than
 * discarded, because an unscoreable dose is still a dose the patient received
 * and the clinician must be told it is not in the total.
 */
export function normaliseDoses(doses, patient, modelId = PRIMARY_MODEL) {
  return (Array.isArray(doses) ? doses : []).map((entry, index) => {
    const agent = anthracyclineAgent(entry?.agent);
    const converted = toDosePerBsa(entry, patient);
    const factor = agent ? conversionFactor(agent.id, modelId) : null;
    const alternativeFactor = agent ? conversionFactor(agent.id, ALTERNATIVE_MODEL) : null;
    const equivalent = agent && converted.value !== null ? doxorubicinEquivalent(agent.id, converted.value, modelId) : null;
    const alternativeEquivalent =
      agent && converted.value !== null ? doxorubicinEquivalent(agent.id, converted.value, ALTERNATIVE_MODEL) : null;

    const problem = !agent
      ? "No anthracycline selected for this entry"
      : converted.reason || null;

    return {
      ...entry,
      key: entry?.id || `dose-${index}`,
      agentId: agent?.id || null,
      agentLabel: agent?.label || entry?.agent || "Unrecognised agent",
      agentNote: agent?.note || null,
      unit: entry?.unit || "mg/m2",
      enteredDose: num(entry?.dose),
      dosePerBsa: converted.value,
      bsaUsed: converted.bsa ?? null,
      factor,
      alternativeFactor,
      equivalent,
      alternativeEquivalent,
      scored: equivalent !== null,
      problem,
    };
  });
}

/* --------------------------------------------------------------- ledger */

/** Thresholds in mg/m² doxorubicin-equivalent, ascending. */
export const DOSE_THRESHOLDS = [
  {
    id: "surveillance",
    at: 250,
    tone: "warning",
    label: "Surveillance threshold",
    guidance:
      "The incidence of cardiac dysfunction rises from this point. Arrange echocardiography with global longitudinal strain and check biomarkers.",
    sourceId: "asco-2017-cardiac",
  },
  {
    id: "dexrazoxane",
    at: 300,
    tone: "warning",
    label: "Dexrazoxane discussion threshold",
    guidance: "Discuss dexrazoxane cardioprotection with oncology if further anthracycline is planned.",
    sourceId: "esc-cardio-oncology-2022",
  },
  {
    id: "high",
    at: 400,
    tone: "danger",
    label: "High cumulative exposure",
    guidance:
      "Risk rises steeply beyond this point. Echocardiography before each further dose, and a documented cardio-oncology discussion before continuing.",
    sourceId: "esc-cardio-oncology-2022",
  },
  {
    id: "ceiling",
    at: 550,
    tone: "danger",
    label: "Conventional lifetime ceiling",
    guidance:
      "The conventional lifetime doxorubicin ceiling. Further exposure needs explicit multidisciplinary agreement and close surveillance.",
    sourceId: "esc-cardio-oncology-2022",
  },
];

/** How close to the next threshold a total must be before it is flagged. */
export const APPROACHING_MARGIN = 50;

/** Total doxorubicin-equivalent exposure, including any dose given before registration. */
export function cumulativeDose(patient, modelId = PRIMARY_MODEL) {
  const recorded = normaliseDoses(patient?.anthracyclineDoses, patient, modelId);
  const scored = recorded.filter((entry) => entry.scored);
  const unscored = recorded.filter((entry) => !entry.scored);
  const prior = num(patient?.history?.priorTreatment?.fields?.priorAnthracycline) || 0;
  const delivered = scored.reduce((total, entry) => total + entry.equivalent, 0);
  const alternativeDelivered = scored.reduce((total, entry) => total + (entry.alternativeEquivalent ?? 0), 0);

  return {
    prior,
    delivered: Number(delivered.toFixed(1)),
    total: Number((prior + delivered).toFixed(1)),
    alternativeTotal: Number((prior + alternativeDelivered).toFixed(1)),
    entries: recorded,
    scoredEntries: scored,
    unscoredEntries: unscored,
  };
}

/**
 * Grades a cumulative total against the thresholds.
 *
 * Reports the highest threshold already crossed AND the next one, so the
 * clinician is warned as a threshold is approached rather than only once it has
 * been passed — by which point the dose is already in the patient.
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
    provenance: provenance(reached?.sourceId || next?.sourceId || "esc-cardio-oncology-2022", {
      locator: "Cumulative anthracycline dose thresholds",
    }),
  };
}

/**
 * Full ledger: every recorded dose, the running equivalent total, the threshold
 * assessment, and what the alternative equivalence model would have produced.
 */
export function anthracyclineLedger(patient, modelId = PRIMARY_MODEL) {
  const model = equivalenceModel(modelId);
  const alternative = equivalenceModel(ALTERNATIVE_MODEL);
  const cumulative = cumulativeDose(patient, modelId);
  const planned = num(patient?.totalPlannedDose);
  const remaining = planned !== null ? Math.max(0, planned - cumulative.total) : 0;

  let running = cumulative.prior;
  const entries = cumulative.entries.map((entry) => {
    if (entry.scored) running = Number((running + entry.equivalent).toFixed(1));
    return { ...entry, runningTotal: entry.scored ? running : null };
  });

  /* Do the two published models disagree enough to matter for this patient? */
  const spread = Math.abs(cumulative.alternativeTotal - cumulative.total);
  const base = Math.max(cumulative.total, 1);
  const modelsDiverge = model.id !== alternative.id && spread / base >= MODEL_DIVERGENCE_THRESHOLD;

  const assessment = assessCumulativeDose(cumulative.total, remaining);
  const alternativeAssessment = assessCumulativeDose(cumulative.alternativeTotal, remaining);
  const crossesDifferentThreshold = assessment.reached?.id !== alternativeAssessment.reached?.id;

  return {
    ...cumulative,
    entries,
    planned,
    remaining,
    assessment,
    model: {
      id: model.id,
      label: model.label,
      shortLabel: model.shortLabel,
      description: model.description,
      citation: citeShort(model.sourceId),
      provenance: provenance(model.sourceId, { locator: "Doxorubicin equivalence ratios" }),
    },
    alternative: {
      id: alternative.id,
      label: alternative.label,
      shortLabel: alternative.shortLabel,
      total: cumulative.alternativeTotal,
      assessment: alternativeAssessment,
      citation: citeShort(alternative.sourceId),
      provenance: provenance(alternative.sourceId, { locator: "Doxorubicin equivalence ratios" }),
    },
    modelsDiverge,
    crossesDifferentThreshold: modelsDiverge && crossesDifferentThreshold,
    /**
     * The sentence the UI shows when the models disagree. Written out here so
     * the workflow and the printed report cannot drift apart.
     */
    divergenceNote: modelsDiverge
      ? `The two published equivalence models differ for this patient: ${model.shortLabel} gives ${cumulative.total} mg/m² and ${alternative.shortLabel} gives ${cumulative.alternativeTotal} mg/m².${
          crossesDifferentThreshold
            ? " They fall either side of a management threshold, so confirm which model your local protocol assumes before acting on the total."
            : " Both fall within the same management band."
        }`
      : null,
    unscoredNote: cumulative.unscoredEntries.length
      ? `${cumulative.unscoredEntries.length} recorded dose${cumulative.unscoredEntries.length === 1 ? " is" : "s are"} not included in the total: ${cumulative.unscoredEntries
          .map((entry) => entry.problem)
          .filter(Boolean)
          .join("; ")}.`
      : null,
  };
}
