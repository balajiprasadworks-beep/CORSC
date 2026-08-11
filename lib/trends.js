/* =========================================================================
   Longitudinal measurement tracking.

   Serial comparison is where cardio-oncology surveillance earns its keep, and
   it is also where software most easily lies. Three failure modes matter:

   1. Computing a percentage change against a baseline that does not exist.
      A GLS of -14% means nothing on its own. A GLS of -14% against a baseline
      of -21% is a 33% relative fall and changes management. If the baseline is
      missing, the honest output is "not comparable", not a number derived from
      whatever the earliest recorded value happened to be.

   2. Comparing measurements that are not comparable — a strain measured on a
      different vendor's software, or an ejection fraction from a different
      modality. Those comparisons are made anyway in practice, but the report
      must say what it compared.

   3. Confusing an abnormal baseline with a decline. A patient who started at
      45% and is still at 45% has not deteriorated; a patient who started at
      65% and is now at 52% has, even though 52% is "normal".

   Every series below therefore reports its baseline, whether the baseline is
   usable, and what kind of change was computed.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";
import { GLS_FALL_THRESHOLD, glsRelativeFall } from "@/lib/ctrcd";
import { num } from "@/lib/vitals";

export const COMPARABILITY = {
  comparable: { id: "comparable", label: "Comparable", tone: "ok" },
  noBaseline: {
    id: "noBaseline",
    label: "No baseline — change cannot be calculated",
    tone: "warning",
  },
  singlePoint: { id: "singlePoint", label: "One measurement only", tone: "info" },
  modalityChanged: {
    id: "modalityChanged",
    label: "Modality or method differs between measurements",
    tone: "warning",
  },
  none: { id: "none", label: "Not measured", tone: "neutral" },
};

/**
 * The measurement series CORSC tracks over time.
 *
 * `relativeChange` says whether a percentage change is clinically meaningful
 * for that measurement. It is true for strain, where the guideline criterion IS
 * a relative fall, and false for ejection fraction, where the criterion is an
 * absolute change in points. Getting that the wrong way round produces a
 * plausible-looking number that means nothing.
 */
export const SERIES = [
  {
    id: "lvef",
    label: "LVEF",
    unit: "%",
    direction: "lowerWorse",
    magnitude: false,
    relativeChange: false,
    absoluteChange: true,
    baselineField: "baselineLVEF",
    changeNote: "The CTRCD criteria are written in absolute percentage points, so the absolute fall is the number that matters.",
    sourceId: "esc-cardio-oncology-2022",
  },
  {
    id: "gls",
    label: "Global longitudinal strain",
    unit: "%",
    direction: "lowerWorse",
    magnitude: true,
    relativeChange: true,
    absoluteChange: true,
    baselineField: "baselineGLS",
    threshold: GLS_FALL_THRESHOLD,
    changeNote:
      "Strain is conventionally negative and deterioration is a fall in magnitude, so both values are compared as absolute magnitudes. The guideline criterion is a RELATIVE fall of more than 15%.",
    sourceId: "esc-cardio-oncology-2022",
  },
  {
    id: "troponin",
    label: "Troponin",
    unit: "ng/L",
    direction: "higherWorse",
    magnitude: false,
    relativeChange: true,
    absoluteChange: true,
    baselineField: "baselineTroponin",
    changeNote: "Interpreted against the assay's own reference limit as well as against the patient's baseline.",
    sourceId: "manufacturer-troponin",
  },
  {
    id: "ntprobnp",
    label: "NT-proBNP / BNP",
    unit: "pg/mL",
    direction: "higherWorse",
    magnitude: false,
    relativeChange: true,
    absoluteChange: true,
    baselineField: "baselineNtProBnp",
    changeNote: "Age-stratified thresholds apply; a doubling from baseline is treated as a new rise.",
    sourceId: "esc-hf-2021",
  },
  {
    id: "sbp",
    label: "Systolic blood pressure",
    unit: "mmHg",
    direction: "higherWorse",
    magnitude: false,
    relativeChange: false,
    absoluteChange: true,
    baselineField: null,
    changeNote: "Tracked because hypertension is the commonest reason VEGF-pathway therapy has to be interrupted.",
    sourceId: "esc-hypertension-2024",
    from: "vitals",
  },
];

export function seriesDefinition(id) {
  return SERIES.find((item) => item.id === id) || null;
}

/* ------------------------------------------------------------- extraction */

function pointsFor(definition, patient, encounter) {
  const visits = [...(patient?.visits || []), encounter].filter(Boolean);
  return visits.flatMap((visit) => {
    const value =
      definition.from === "vitals"
        ? num(visit?.vitals?.[definition.id])
        : num(visit?.inv?.[definition.id]?.value ?? visit?.inv?.[definition.id]?.result);
    if (value === null) return [];
    const entry = definition.from === "vitals" ? {} : visit?.inv?.[definition.id] || {};
    return [
      {
        value,
        date: entry.date || visit?.date || "",
        visitId: visit?.id || null,
        visitType: visit?.type || "",
        cycle: num(visit?.firstReview?.cycle) ?? num(visit?.cycle),
        modality: entry.modality || null,
        comment: entry.comment || "",
      },
    ];
  });
}

/** Absolute magnitude, so negative strain values compare correctly. */
const mag = (definition, value) => (definition.magnitude ? Math.abs(value) : value);

/* ---------------------------------------------------------------- series */

/**
 * Builds one longitudinal series.
 *
 * The baseline is the value recorded at registration where one exists, NOT the
 * earliest on-treatment measurement. Those are different things: an ejection
 * fraction first measured at cycle 3 is not a pre-treatment baseline, and
 * treating it as one hides exactly the decline the surveillance exists to catch.
 */
export function buildSeries(definition, patient, encounter) {
  const points = pointsFor(definition, patient, encounter);
  const declaredBaseline = definition.baselineField ? num(patient?.[definition.baselineField]) : null;
  const current = points.length ? points[points.length - 1] : null;
  const first = points.length ? points[0] : null;

  const baselineValue = declaredBaseline;
  const baselineSource = declaredBaseline !== null ? "registration" : null;

  let comparability = COMPARABILITY.none.id;
  if (!current) {
    comparability = COMPARABILITY.none.id;
  } else if (baselineValue === null) {
    comparability = COMPARABILITY.noBaseline.id;
  } else if (points.length === 1 && declaredBaseline === null) {
    comparability = COMPARABILITY.singlePoint.id;
  } else {
    const modalities = new Set(points.map((p) => p.modality).filter(Boolean));
    comparability = modalities.size > 1 ? COMPARABILITY.modalityChanged.id : COMPARABILITY.comparable.id;
  }

  const comparable = comparability === COMPARABILITY.comparable.id || comparability === COMPARABILITY.modalityChanged.id;

  /* Changes are computed only when there is a real baseline to compare with. */
  const absoluteChange =
    comparable && definition.absoluteChange && current
      ? Number((mag(definition, current.value) - mag(definition, baselineValue)).toFixed(1))
      : null;

  let relativeChange = null;
  if (comparable && definition.relativeChange && current) {
    if (definition.id === "gls") {
      // Sign convention handled in one place, in lib/ctrcd.js.
      relativeChange = glsRelativeFall(baselineValue, current.value);
    } else {
      const base = mag(definition, baselineValue);
      relativeChange = base > 0 ? Number((((mag(definition, current.value) - base) / base) * 100).toFixed(1)) : null;
    }
  }

  const worse =
    absoluteChange === null
      ? null
      : definition.direction === "lowerWorse"
        ? absoluteChange < 0
        : absoluteChange > 0;

  const abnormalBaseline =
    baselineValue !== null && definition.id === "lvef" ? baselineValue < 50 : null;

  const meaningfulChange =
    definition.id === "gls" && relativeChange !== null
      ? relativeChange > (definition.threshold ?? GLS_FALL_THRESHOLD)
      : definition.id === "lvef" && absoluteChange !== null
        ? absoluteChange <= -10
        : null;

  return {
    id: definition.id,
    label: definition.label,
    unit: definition.unit,
    direction: definition.direction,
    points,
    count: points.length,
    baseline: baselineValue,
    baselineSource,
    first: first ? first.value : null,
    current: current ? current.value : null,
    currentDate: current ? current.date : null,
    absoluteChange,
    relativeChange,
    worse,
    /** True when the baseline itself was already abnormal, which is not a decline. */
    abnormalBaseline,
    /** True when the change crosses the guideline threshold for this measurement. */
    meaningfulChange,
    comparability,
    comparabilityLabel: COMPARABILITY[comparability].label,
    comparabilityTone: COMPARABILITY[comparability].tone,
    changeNote: definition.changeNote,
    provenance: provenance(definition.sourceId, { locator: `${definition.label} serial comparison` }),
    /** One sentence, so the UI and the report cannot describe the same series differently. */
    statement: describeSeries(definition, {
      current,
      baselineValue,
      absoluteChange,
      relativeChange,
      comparability,
      meaningfulChange,
      abnormalBaseline,
    }),
  };
}

function describeSeries(definition, state) {
  const { current, baselineValue, absoluteChange, relativeChange, comparability, meaningfulChange, abnormalBaseline } = state;

  if (!current) return `${definition.label} not measured.`;
  if (comparability === COMPARABILITY.noBaseline.id) {
    return `${definition.label} is ${current.value}${definition.unit}, but no baseline is recorded, so no change can be calculated. Retrieve the pre-treatment value if it exists.`;
  }

  const parts = [`${definition.label} ${current.value}${definition.unit} against a baseline of ${baselineValue}${definition.unit}`];

  if (definition.id === "gls" && relativeChange !== null) {
    parts.push(
      relativeChange > 0
        ? `a relative fall of ${relativeChange}%${meaningfulChange ? `, above the ${definition.threshold}% threshold` : `, below the ${definition.threshold}% threshold`}`
        : `no relative fall (${Math.abs(relativeChange)}% improvement)`
    );
  } else if (absoluteChange !== null) {
    const magnitude = Math.abs(absoluteChange);
    const worsening = definition.direction === "lowerWorse" ? absoluteChange < 0 : absoluteChange > 0;
    parts.push(
      magnitude === 0
        ? "unchanged"
        : `${worsening ? "a fall" : "a rise"} of ${magnitude}${definition.unit}${
            meaningfulChange ? ", which meets the guideline change threshold" : ""
          }`
    );
  }

  if (abnormalBaseline) parts.push("note that the baseline itself was already below 50%, so a low current value is not by itself a new decline");
  if (comparability === COMPARABILITY.modalityChanged.id) parts.push("measured by more than one modality, so the comparison is approximate");

  return `${parts.join(", ")}.`;
}

/** Every tracked series for this patient. */
export function buildAllSeries(patient, encounter) {
  return SERIES.map((definition) => buildSeries(definition, patient, encounter));
}

/**
 * The anthracycline exposure series, overlaid on the same timeline as the
 * measurements so a decline can be read against the dose that caused it.
 */
export function exposureSeries(ledger) {
  const points = (ledger?.entries || [])
    .filter((entry) => entry.scored)
    .map((entry) => ({
      value: entry.runningTotal,
      date: entry.date || "",
      cycle: num(entry.cycle),
      label: `${entry.agentLabel} ${entry.enteredDose}${entry.unit === "mg" ? " mg" : " mg/m²"}`,
    }));

  return {
    id: "anthracycline-exposure",
    label: "Cumulative doxorubicin-equivalent dose",
    unit: "mg/m²",
    direction: "higherWorse",
    points,
    count: points.length,
    current: ledger?.total ?? null,
    baseline: ledger?.prior ?? 0,
    comparability: points.length ? COMPARABILITY.comparable.id : COMPARABILITY.none.id,
    comparabilityLabel: points.length ? COMPARABILITY.comparable.label : COMPARABILITY.none.label,
    statement: ledger?.assessment?.label || "No anthracycline exposure recorded.",
    provenance: ledger?.model?.provenance || provenance("esc-cardio-oncology-2022"),
  };
}

/**
 * The treatment timeline the measurement charts are overlaid on, so a clinician
 * can see which cycle a fall happened at rather than only which date.
 */
export function treatmentTimeline(patient, encounter) {
  return [...(patient?.visits || []), encounter]
    .filter(Boolean)
    .map((visit) => ({
      date: visit.date || "",
      cycle: num(visit?.firstReview?.cycle) ?? num(visit?.cycle),
      type: visit.type || "",
      visitId: visit.id || null,
    }))
    .filter((item) => item.date);
}

/** Series where the current value has crossed a guideline change threshold. */
export function significantChanges(series) {
  return (series || []).filter((item) => item.meaningfulChange === true);
}

/** Series that cannot be interpreted because the baseline is missing. */
export function uncomparableSeries(series) {
  return (series || []).filter((item) => item.comparability === COMPARABILITY.noBaseline.id);
}
